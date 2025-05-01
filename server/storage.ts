import { 
  users, type User, type InsertUser,
  newsItems, type NewsItem, type InsertNewsItem,
  rssFeeds, type RssFeed, type InsertRssFeed,
  emailDigests, type EmailDigest, type InsertEmailDigest
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsItems: Map<number, NewsItem>;
  private rssFeeds: Map<number, RssFeed>;
  private emailDigests: Map<number, EmailDigest>;
  private userIdCounter: number;
  private newsItemIdCounter: number;
  private rssFeedIdCounter: number;
  private emailDigestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.newsItems = new Map();
    this.rssFeeds = new Map();
    this.emailDigests = new Map();
    this.userIdCounter = 1;
    this.newsItemIdCounter = 1;
    this.rssFeedIdCounter = 1;
    this.emailDigestIdCounter = 1;
    
    // Add some default RSS feeds with working URLs
    this.createRssFeed({
      name: "Medical News Today",
      url: "https://www.medicalnewstoday.com/rss-feeds/category/pharmaceutical-industry",
      isActive: true
    });
    
    this.createRssFeed({
      name: "FDA News Releases",
      url: "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml",
      isActive: true
    });
    
    this.createRssFeed({
      name: "Drug Discovery & Development",
      url: "https://www.drugdiscoverytrends.com/feed/",
      isActive: true
    });
    
    // Add some sample news items
    this.createNewsItem({
      title: "FDA Approves New Cancer Treatment for Rare Blood Disorders",
      summary: "The FDA has approved a groundbreaking therapy for patients with rare blood cancers. This first-in-class treatment showed a 65% response rate in clinical trials and is expected to significantly improve patient outcomes. The approval marks a major milestone for targeted cancer therapies.",
      sourceUrl: "https://www.fda.gov/news-events/press-announcements",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      category: "FDA APPROVAL",
      importance: 85
    });
    
    this.createNewsItem({
      title: "Phase 3 Trial Shows Promising Results for Alzheimer's Drug",
      summary: "A major pharmaceutical company has announced positive results from their Phase 3 clinical trial for a novel Alzheimer's treatment. The drug demonstrated statistically significant improvements in cognitive decline compared to placebo, potentially offering new hope for millions of patients worldwide.",
      sourceUrl: "https://www.clinicaltrials.gov",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      category: "CLINICAL TRIAL",
      importance: 75
    });
    
    this.createNewsItem({
      title: "Major Biotech Acquisition: Company X Acquires Gene Therapy Startup for $2.4 Billion",
      summary: "In one of the largest biotech acquisitions this year, Company X has announced the purchase of a leading gene therapy startup for $2.4 billion. The deal is expected to accelerate development of several promising therapies currently in early-stage trials and strengthen Company X's position in the gene therapy market.",
      sourceUrl: "https://www.biopharmadive.com",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      category: "M&A",
      importance: 80
    });
    
    this.createNewsItem({
      title: "New Research Shows Promising Results for mRNA-based Vaccines Against Infectious Diseases",
      summary: "A recent study published in a leading medical journal demonstrates the potential of mRNA technology beyond COVID-19. The research showed that mRNA platforms could be quickly adapted to target multiple infectious diseases with high efficacy and safety profiles.",
      sourceUrl: "https://www.nature.com/articles",
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      category: "INDUSTRY NEWS",
      importance: 65
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.verificationToken === token) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser & { verificationToken: string }): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const newUser: User = {
      id,
      name: user.name,
      email: user.email,
      isVerified: false,
      verificationToken: user.verificationToken,
      createdAt: now,
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUserVerification(id: number, isVerified: boolean): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, isVerified };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getVerifiedUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isVerified);
  }

  // News items operations
  async getNewsItems(limit: number = 100): Promise<NewsItem[]> {
    const items = Array.from(this.newsItems.values());
    
    // Sort by published date descending
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    return items.slice(0, limit);
  }

  async getNewsItemById(id: number): Promise<NewsItem | undefined> {
    return this.newsItems.get(id);
  }

  async createNewsItem(item: InsertNewsItem): Promise<NewsItem> {
    const id = this.newsItemIdCounter++;
    const now = new Date();
    
    const newItem: NewsItem = {
      id,
      title: item.title,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      originalContent: item.originalContent || null,
      publishedAt: item.publishedAt instanceof Date ? item.publishedAt : new Date(item.publishedAt),
      category: item.category,
      importance: item.importance || 0,
      createdAt: now,
    };
    
    this.newsItems.set(id, newItem);
    return newItem;
  }

  async getLatestNewsItems(limit: number = 3): Promise<NewsItem[]> {
    const items = Array.from(this.newsItems.values());
    
    // Sort by published date (newest first) and then by importance (highest first)
    items.sort((a, b) => {
      const dateComparison = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return (b.importance || 0) - (a.importance || 0);
    });
    
    return items.slice(0, limit);
  }

  // RSS feeds operations
  async getRssFeeds(): Promise<RssFeed[]> {
    return Array.from(this.rssFeeds.values());
  }

  async getRssFeedById(id: number): Promise<RssFeed | undefined> {
    return this.rssFeeds.get(id);
  }

  async createRssFeed(feed: InsertRssFeed): Promise<RssFeed> {
    const id = this.rssFeedIdCounter++;
    const now = new Date();
    
    const newFeed: RssFeed = {
      id,
      name: feed.name,
      url: feed.url,
      isActive: feed.isActive ?? true,
      lastFetched: null,
      createdAt: now,
    };
    
    this.rssFeeds.set(id, newFeed);
    return newFeed;
  }

  async updateRssFeed(id: number, data: Partial<RssFeed>): Promise<RssFeed | undefined> {
    const feed = this.rssFeeds.get(id);
    if (!feed) {
      return undefined;
    }
    
    const updatedFeed = { ...feed, ...data };
    this.rssFeeds.set(id, updatedFeed);
    return updatedFeed;
  }

  async getActiveRssFeeds(): Promise<RssFeed[]> {
    return Array.from(this.rssFeeds.values()).filter(feed => feed.isActive);
  }

  // Email digests operations
  async createEmailDigest(digest: InsertEmailDigest): Promise<EmailDigest> {
    const id = this.emailDigestIdCounter++;
    const now = new Date();
    
    const newDigest: EmailDigest = {
      id,
      subject: digest.subject,
      sentTo: digest.sentTo,
      sentAt: now,
    };
    
    this.emailDigests.set(id, newDigest);
    return newDigest;
  }

  async getEmailDigests(limit: number = 10): Promise<EmailDigest[]> {
    const digests = Array.from(this.emailDigests.values());
    
    // Sort by sent date descending
    digests.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    
    return digests.slice(0, limit);
  }
}

export const storage = new MemStorage();
