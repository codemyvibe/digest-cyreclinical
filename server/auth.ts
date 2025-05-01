import passport from "passport";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { emailService } from "./services/emailService";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "bionews-secret-key-for-session",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error as Error);
    }
  });

  // Create a new user account
  app.post("/api/users/signup", async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      
      // Create new user
      const user = await storage.createUser({
        email,
        name,
        verificationToken
      });
      
      // Generate verification URL
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify/${verificationToken}`;
      
      // Send verification email
      await emailService.sendVerificationEmail(
        email,
        name,
        verificationUrl
      );
      
      // Send welcome digest with sample news
      const latestNews = await storage.getLatestNewsItems(3);
      if (latestNews.length > 0) {
        await emailService.sendWelcomeDigest(
          email,
          name,
          latestNews,
          verificationUrl
        );
      }
      
      res.status(201).json({ 
        message: "User created successfully. Please check your email to verify your account.",
        userId: user.id
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  // Verify a user's email address
  app.post("/api/users/verify", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(404).json({ message: "Invalid or expired verification token" });
      }
      
      // Update user as verified and clear verification token
      const updatedUser = await storage.updateUserVerification(user.id, true);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Error verifying user" });
      }
      
      // Log the user in
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after verification" });
        }
        
        return res.status(200).json({ 
          message: "Email verified successfully",
          user: updatedUser
        });
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Error verifying email: " + error.message });
    }
  });

  // Request a magic login link
  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Create magic link
      const result = await storage.createMagicLink(email);
      
      if (!result) {
        // Don't reveal that the user doesn't exist for security reasons
        return res.status(200).json({ message: "If your email exists in our system, you will receive a magic link to sign in" });
      }
      
      const { token, user } = result;
      
      // Generate magic link URL
      const magicLinkUrl = `${req.protocol}://${req.get('host')}/auth/login/${token}`;
      
      // Send magic link email
      await emailService.sendMagicLink(
        user.email,
        user.name,
        magicLinkUrl
      );
      
      res.status(200).json({ message: "If your email exists in our system, you will receive a magic link to sign in" });
    } catch (error: any) {
      console.error("Magic link error:", error);
      // Don't reveal if there was an actual error for security reasons
      res.status(200).json({ message: "If your email exists in our system, you will receive a magic link to sign in" });
    }
  });

  // Validate a magic link and log the user in
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Login token is required" });
      }
      
      // Validate magic link and get user
      const user = await storage.validateMagicLink(token);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired login link" });
      }
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in" });
        }
        
        return res.status(200).json({ 
          message: "Logged in successfully",
          user
        });
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in: " + error.message });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current authenticated user
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.status(200).json(req.user);
  });
}