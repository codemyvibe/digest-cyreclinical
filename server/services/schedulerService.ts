import { storage } from "../storage";
import { rssService } from "./rssService";
import { summarizeService } from "./summarizeService";
import { emailService } from "./emailService";

class SchedulerService {
  private isRunning: boolean = false;
  private dailyDigestScheduled: boolean = false;
  
  /**
   * Initialize the scheduler
   */
  async initialize(): Promise<void> {
    console.log("Initializing scheduler service...");
    this.scheduleDailyDigest();
    this.scheduleNewsUpdates();
  }
  
  /**
   * Schedule daily digest delivery
   */
  private scheduleDailyDigest(): void {
    if (this.dailyDigestScheduled) return;
    
    console.log("Scheduling daily digest...");
    
    // Set up timer to check every minute if it's time to send the digest
    // In a production environment, this would use a proper cron-like scheduler
    setInterval(() => {
      const now = new Date();
      
      // Send at 8:00 AM
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        this.sendDailyDigest();
      }
    }, 60 * 1000); // Check every minute
    
    this.dailyDigestScheduled = true;
  }
  
  /**
   * Schedule regular news updates
   */
  private scheduleNewsUpdates(): void {
    console.log("Scheduling news updates...");
    
    // Fetch news every 3 hours
    setInterval(() => {
      this.fetchAndProcessNews();
    }, 3 * 60 * 60 * 1000); // Every 3 hours
    
    // Also fetch immediately on startup
    setTimeout(() => {
      this.fetchAndProcessNews();
    }, 5000); // 5 second delay on startup
  }
  
  /**
   * Send the daily digest to all verified users
   */
  private async sendDailyDigest(): Promise<void> {
    // Prevent concurrent executions
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      console.log("Sending daily digest...");
      
      const verifiedUsers = await storage.getVerifiedUsers();
      if (verifiedUsers.length === 0) {
        console.log("No verified users found, skipping digest");
        return;
      }
      
      const latestNews = await storage.getLatestNewsItems(5);
      if (latestNews.length === 0) {
        console.log("No news items found, skipping digest");
        return;
      }
      
      let sentCount = 0;
      for (const user of verifiedUsers) {
        await emailService.sendNewsDigest(user.email, user.name, latestNews);
        sentCount++;
      }
      
      console.log(`Sent digest to ${sentCount} users`);
      
      // Record the digest
      await storage.createEmailDigest({
        subject: "Your BioNews Digest for " + new Date().toLocaleDateString(),
        sentTo: sentCount
      });
      
    } catch (error) {
      console.error("Error sending daily digest:", error);
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Fetch and process news from RSS feeds
   */
  private async fetchAndProcessNews(): Promise<void> {
    // Prevent concurrent executions
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      console.log("Fetching and processing news...");
      
      const activeFeeds = await storage.getActiveRssFeeds();
      if (activeFeeds.length === 0) {
        console.log("No active RSS feeds found");
        return;
      }
      
      // Fetch news from all active feeds
      const fetchedItems = await rssService.fetchAllFeeds(activeFeeds);
      
      if (fetchedItems.length === 0) {
        console.log("No news items fetched");
        return;
      }
      
      // Analyze and summarize news
      const processedItems = await summarizeService.processNewsItems(fetchedItems);
      
      // Store processed items
      for (const item of processedItems) {
        await storage.createNewsItem(item);
      }
      
      console.log(`Processed and stored ${processedItems.length} news items`);
      
      // Update last fetched timestamp for feeds
      for (const feed of activeFeeds) {
        await storage.updateRssFeed(feed.id, { lastFetched: new Date() });
      }
    } catch (error) {
      console.error("Error fetching and processing news:", error);
    } finally {
      this.isRunning = false;
    }
  }
}

// Create and export the scheduler service
const schedulerService = new SchedulerService();

/**
 * Start the scheduler service
 */
export function startScheduler(): void {
  schedulerService.initialize();
}
