import { 
  users, type User, type InsertUser,
  newsItems, type NewsItem, type InsertNewsItem,
  rssFeeds, type RssFeed, type InsertRssFeed,
  emailDigests, type EmailDigest, type InsertEmailDigest
} from "@shared/schema";

import { db } from "./db";
import { eq, desc, and, asc, SQL, sql } from "drizzle-orm";

// Interface for Storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser & { verificationToken: string }): Promise<User>;
  updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined>;
  getVerifiedUsers(): Promise<User[]>;
  
  // News items operations
  getNewsItems(limit?: number): Promise<NewsItem[]>;
  getNewsItemById(id: number): Promise<NewsItem | undefined>;
  createNewsItem(item: InsertNewsItem): Promise<NewsItem>;
  getLatestNewsItems(limit?: number): Promise<NewsItem[]>;
  
  // RSS feeds operations
  getRssFeeds(): Promise<RssFeed[]>;
  getRssFeedById(id: number): Promise<RssFeed | undefined>;
  createRssFeed(feed: InsertRssFeed): Promise<RssFeed>;
  updateRssFeed(id: number, data: Partial<RssFeed>): Promise<RssFeed | undefined>;
  getActiveRssFeeds(): Promise<RssFeed[]>;
  
  // Email digests operations
  createEmailDigest(digest: InsertEmailDigest): Promise<EmailDigest>;
  getEmailDigests(limit?: number): Promise<EmailDigest[]>;
}

// Database-based implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(sql`LOWER(${users.email})`, email.toLowerCase()));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    return user;
  }

  async createUser(user: InsertUser & { verificationToken: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...user,
        isVerified: false,
        createdAt: new Date()
      })
      .returning();
    return newUser;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ isVerified })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getVerifiedUsers(): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.isVerified, true));
  }

  // News items operations
  async getNewsItems(limit: number = 100): Promise<NewsItem[]> {
    return db
      .select()
      .from(newsItems)
      .orderBy(desc(newsItems.publishedAt))
      .limit(limit);
  }

  async getNewsItemById(id: number): Promise<NewsItem | undefined> {
    const [item] = await db
      .select()
      .from(newsItems)
      .where(eq(newsItems.id, id));
    return item;
  }

  async createNewsItem(item: InsertNewsItem): Promise<NewsItem> {
    const [newItem] = await db
      .insert(newsItems)
      .values({
        ...item,
        publishedAt: item.publishedAt instanceof Date ? item.publishedAt : new Date(item.publishedAt),
        importance: item.importance || 0,
        createdAt: new Date()
      })
      .returning();
    return newItem;
  }

  async getLatestNewsItems(limit: number = 3): Promise<NewsItem[]> {
    return db
      .select()
      .from(newsItems)
      .orderBy(desc(newsItems.publishedAt), desc(newsItems.importance))
      .limit(limit);
  }

  // RSS feeds operations
  async getRssFeeds(): Promise<RssFeed[]> {
    return db
      .select()
      .from(rssFeeds);
  }

  async getRssFeedById(id: number): Promise<RssFeed | undefined> {
    const [feed] = await db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.id, id));
    return feed;
  }

  async createRssFeed(feed: InsertRssFeed): Promise<RssFeed> {
    const [newFeed] = await db
      .insert(rssFeeds)
      .values({
        ...feed,
        isActive: feed.isActive ?? true,
        lastFetched: null,
        createdAt: new Date()
      })
      .returning();
    return newFeed;
  }

  async updateRssFeed(id: number, data: Partial<RssFeed>): Promise<RssFeed | undefined> {
    const [updatedFeed] = await db
      .update(rssFeeds)
      .set(data)
      .where(eq(rssFeeds.id, id))
      .returning();
    return updatedFeed;
  }

  async getActiveRssFeeds(): Promise<RssFeed[]> {
    return db
      .select()
      .from(rssFeeds)
      .where(eq(rssFeeds.isActive, true));
  }

  // Email digests operations
  async createEmailDigest(digest: InsertEmailDigest): Promise<EmailDigest> {
    const [newDigest] = await db
      .insert(emailDigests)
      .values({
        ...digest,
        sentAt: new Date()
      })
      .returning();
    return newDigest;
  }

  async getEmailDigests(limit: number = 10): Promise<EmailDigest[]> {
    return db
      .select()
      .from(emailDigests)
      .orderBy(desc(emailDigests.sentAt))
      .limit(limit);
  }
  
  // Initialize default data - only runs when needed
  async initializeDefaultData(): Promise<void> {
    // Check if we already have RSS feeds, if not add default ones
    const existingFeeds = await this.getRssFeeds();
    
    if (existingFeeds.length === 0) {
      console.log("Initializing default RSS feeds...");
      
      await this.createRssFeed({
        name: "FDA News Releases",
        url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml",
        isActive: true
      });
      
      await this.createRssFeed({
        name: "Drug Discovery & Development",
        url: "https://www.drugdiscoverytrends.com/feed/",
        isActive: true
      });

      await this.createRssFeed({
        name: "FiercePharma",
        url: "https://www.fiercepharma.com/rss/xml",
        isActive: true
      });

      await this.createRssFeed({
        name: "FierceBiotech",
        url: "https://www.fiercebiotech.com/rss/biotech/xml",
        isActive: true
      });

      await this.createRssFeed({
        name: "FierceHealthcare",
        url: "https://www.fiercehealthcare.com/rss/xml",
        isActive: true
      });

      await this.createRssFeed({
        name: "Labiotech.eu",
        url: "https://labiotech.eu/feed",
        isActive: true
      });

      await this.createRssFeed({
        name: "Bioengineer.org",
        url: "https://bioengineer.org/feed",
        isActive: true
      });

      await this.createRssFeed({
        name: "BioPharma Dive",
        url: "https://biopharmadive.com/feeds/news",
        isActive: true
      });

      await this.createRssFeed({
        name: "GEN - Genetic Engineering and Biotechnology News",
        url: "https://feeds.feedburner.com/GenGeneticEngineeringAndBiotechnologyNews",
        isActive: true
      });

      await this.createRssFeed({
        name: "Endpoints News",
        url: "https://endpts.com/feed",
        isActive: true
      });

      await this.createRssFeed({
        name: "Bio.News",
        url: "https://bio.news/feed",
        isActive: true
      });

      await this.createRssFeed({
        name: "Decoding Bio",
        url: "https://decodingbio.substack.com/feed",
        isActive: true
      });

      await this.createRssFeed({
        name: "Nature Biotechnology",
        url: "https://www.nature.com/subjects/biotechnology.rss",
        isActive: true
      });
      
      // Add sample news items if we don't have any
      const existingNews = await this.getNewsItems(1);
      
      if (existingNews.length === 0) {
        console.log("Initializing sample news items...");
        
        await this.createNewsItem({
          title: "FDA Approves New Cancer Treatment for Rare Blood Disorders",
          summary: "The FDA has approved a groundbreaking therapy for patients with rare blood cancers. This first-in-class treatment showed a 65% response rate in clinical trials and is expected to significantly improve patient outcomes. The approval marks a major milestone for targeted cancer therapies.",
          sourceUrl: "https://www.fda.gov/news-events/press-announcements",
          publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
          category: "FDA APPROVAL",
          importance: 85
        });
        
        await this.createNewsItem({
          title: "Phase 3 Trial Shows Promising Results for Alzheimer's Drug",
          summary: "A major pharmaceutical company has announced positive results from their Phase 3 clinical trial for a novel Alzheimer's treatment. The drug demonstrated statistically significant improvements in cognitive decline compared to placebo, potentially offering new hope for millions of patients worldwide.",
          sourceUrl: "https://www.clinicaltrials.gov",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          category: "CLINICAL TRIAL",
          importance: 75
        });
      }
    }
  }
}

// Export an instance of the DatabaseStorage class
export const storage = new DatabaseStorage();
