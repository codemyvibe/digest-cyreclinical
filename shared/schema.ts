import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  magicLinkToken: text("magic_link_token"),
  magicLinkExpiry: timestamp("magic_link_expiry"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// News Items Model
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sourceUrl: text("source_url").notNull(),
  originalContent: text("original_content"),
  publishedAt: timestamp("published_at").notNull(),
  category: text("category").notNull(),
  importance: integer("importance").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems).pick({
  title: true,
  summary: true,
  sourceUrl: true,
  originalContent: true,
  publishedAt: true,
  category: true,
  importance: true,
});

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

// RSS Feeds Model
export const rssFeeds = pgTable("rss_feeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  lastFetched: timestamp("last_fetched"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRssFeedSchema = createInsertSchema(rssFeeds).pick({
  name: true,
  url: true,
  isActive: true,
});

export type InsertRssFeed = z.infer<typeof insertRssFeedSchema>;
export type RssFeed = typeof rssFeeds.$inferSelect;

// Email Digests Model
export const emailDigests = pgTable("email_digests", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  sentTo: integer("sent_to").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertEmailDigestSchema = createInsertSchema(emailDigests).pick({
  subject: true,
  sentTo: true,
});

export type InsertEmailDigest = z.infer<typeof insertEmailDigestSchema>;
export type EmailDigest = typeof emailDigests.$inferSelect;
