import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertRssFeedSchema } from "@shared/schema";
import crypto from "crypto";
import { emailService } from "./services/emailService";
import { rssService } from "./services/rssService";
import { summarizeService } from "./services/summarizeService";
import { startScheduler } from "./services/schedulerService";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // User routes
  app.post("/api/users/signup", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userInput.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      
      // Create user
      const user = await storage.createUser({
        ...userInput,
        verificationToken
      });
      
      // Send verification email
      const verificationUrl = `${req.protocol}://${req.get("host")}/verify?token=${verificationToken}`;
      await emailService.sendVerificationEmail(user.email, user.name, verificationUrl);
      
      // Also send initial news digest
      const latestNews = await storage.getLatestNewsItems(3);
      if (latestNews.length > 0) {
        await emailService.sendWelcomeDigest(user.email, user.name, latestNews, verificationUrl);
      }
      
      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/users/verify", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }
      
      // Update user verification status
      await storage.updateUserVerification(user.id, true);
      
      return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Error verifying user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // News routes
  app.get("/api/news/latest", async (req: Request, res: Response) => {
    try {
      const latestNews = await storage.getLatestNewsItems(3);
      return res.status(200).json(latestNews);
    } catch (error) {
      console.error("Error fetching latest news:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const users = Array.from(await storage.getVerifiedUsers());
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/news", async (req: Request, res: Response) => {
    try {
      const news = await storage.getNewsItems(10);
      return res.status(200).json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/admin/feeds", async (req: Request, res: Response) => {
    try {
      const feeds = await storage.getRssFeeds();
      return res.status(200).json(feeds);
    } catch (error) {
      console.error("Error fetching feeds:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/feeds", async (req: Request, res: Response) => {
    try {
      const feedInput = insertRssFeedSchema.parse(req.body);
      const feed = await storage.createRssFeed(feedInput);
      return res.status(201).json(feed);
    } catch (error) {
      console.error("Error creating feed:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feed data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/admin/feeds/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid feed ID" });
      }
      
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Invalid feed data" });
      }
      
      const updatedFeed = await storage.updateRssFeed(id, { isActive });
      if (!updatedFeed) {
        return res.status(404).json({ message: "Feed not found" });
      }
      
      return res.status(200).json(updatedFeed);
    } catch (error) {
      console.error("Error updating feed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/fetch-news", async (req: Request, res: Response) => {
    try {
      const activeFeeds = await storage.getActiveRssFeeds();
      if (activeFeeds.length === 0) {
        return res.status(400).json({ message: "No active RSS feeds found" });
      }
      
      // Fetch and process news from all active feeds
      const fetchedItems = await rssService.fetchAllFeeds(activeFeeds);
      
      if (fetchedItems.length === 0) {
        return res.status(200).json({ message: "No new items found" });
      }
      
      // Analyze and save important news
      const processedItems = await summarizeService.processNewsItems(fetchedItems);
      
      // Store processed items
      for (const item of processedItems) {
        await storage.createNewsItem(item);
      }
      
      return res.status(200).json({ 
        message: "News fetched and processed successfully", 
        count: processedItems.length 
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/admin/send-digest", async (req: Request, res: Response) => {
    try {
      const verifiedUsers = await storage.getVerifiedUsers();
      if (verifiedUsers.length === 0) {
        return res.status(400).json({ message: "No verified users found" });
      }
      
      const latestNews = await storage.getLatestNewsItems(5);
      if (latestNews.length === 0) {
        return res.status(400).json({ message: "No news items found" });
      }
      
      // Send digest to all verified users
      let sentCount = 0;
      for (const user of verifiedUsers) {
        await emailService.sendNewsDigest(user.email, user.name, latestNews);
        sentCount++;
      }
      
      // Record the digest
      await storage.createEmailDigest({
        subject: "Your BioNews Digest for " + new Date().toLocaleDateString(),
        sentTo: sentCount
      });
      
      return res.status(200).json({ 
        message: "Digest sent successfully", 
        sentCount 
      });
    } catch (error) {
      console.error("Error sending digest:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Start the scheduler
  startScheduler();
  
  const httpServer = createServer(app);
  return httpServer;
}
