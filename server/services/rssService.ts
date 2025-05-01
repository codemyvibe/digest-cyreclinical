import { RssFeed, InsertNewsItem } from "@shared/schema";

interface RawNewsItem {
  title: string;
  link: string;
  content: string;
  pubDate: string;
  categories?: string[];
}

class RssService {
  /**
   * Fetch and parse RSS feeds from all active sources
   */
  async fetchAllFeeds(feeds: RssFeed[]): Promise<InsertNewsItem[]> {
    console.log(`Fetching ${feeds.length} RSS feeds...`);
    
    const allNewsItems: InsertNewsItem[] = [];
    
    for (const feed of feeds) {
      try {
        const items = await this.fetchFeed(feed);
        allNewsItems.push(...items);
      } catch (error) {
        console.error(`Error fetching feed ${feed.name} (${feed.url}):`, error);
      }
    }
    
    console.log(`Fetched ${allNewsItems.length} total news items`);
    return allNewsItems;
  }
  
  /**
   * Fetch and parse a single RSS feed
   */
  private async fetchFeed(feed: RssFeed): Promise<InsertNewsItem[]> {
    try {
      console.log(`Fetching feed: ${feed.name} (${feed.url})`);
      
      // Define fetch options with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Fetch the RSS feed with a specific user agent
      const response = await fetch(feed.url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'BioNews/1.0 RSS Reader (bionews@example.com)'
        }
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xml = await response.text();
      
      if (!xml || xml.trim().length === 0) {
        console.log(`Feed returned empty content: ${feed.url}`);
        return [];
      }
      
      const items = this.parseRssXml(xml);
      
      console.log(`Parsed ${items.length} items from ${feed.name}`);
      
      // Convert raw items to InsertNewsItem format
      const newsItems = items.map(item => this.formatNewsItem(item));
      
      // Update the feed's lastFetched timestamp
      if (feed.id) {
        const now = new Date();
        feed.lastFetched = now;
      }
      
      return newsItems;
    } catch (error) {
      console.error(`Error fetching feed ${feed.url}:`, error);
      return [];
    }
  }
  
  /**
   * Parse RSS XML content into structured data
   */
  private parseRssXml(xml: string): RawNewsItem[] {
    // Using a more flexible regex approach that handles CDATA and various feed formats
    const items: RawNewsItem[] = [];
    
    try {
      // Try to detect feed type (RSS or Atom)
      const isAtomFeed = xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"');
      
      if (isAtomFeed) {
        return this.parseAtomXml(xml);
      }
      
      // First try finding standard RSS items
      let itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
      let itemMatches = Array.from(xml.matchAll(itemRegex));
      
      // If no items found, try alternative item formats
      if (itemMatches.length === 0) {
        itemRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g;
        itemMatches = Array.from(xml.matchAll(itemRegex));
      }
      
      // Define regex patterns for various RSS elements, handling CDATA sections
      const titleRegex = /<title[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/title>/;
      const linkRegex = /<link[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/link>/;
      const linkHrefRegex = /<link[^>]*href=['"]([^'"]+)['"]/;
      const descRegex = /<description[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/description>/;
      const contentRegex = /<content:encoded[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/content:encoded>/;
      const contentAltRegex = /<content[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/content>/;
      const pubDateRegex = /<pubDate[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/pubDate>/;
      const dateRegex = /<date[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/date>/;
      const categoryRegex = /<category[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/category>/g;
      
      // Process each item
      for (const itemMatch of itemMatches) {
        const itemContent = itemMatch[1];
        
        // Extract item fields with CDATA handling
        const extractValue = (regex: RegExp, content: string): string => {
          const match = content.match(regex);
          if (!match) return '';
          
          // If we have a CDATA capture group
          if (match[2]) return match[2].trim();
          // Otherwise use the whole content
          return match[1].trim();
        };
        
        // Try different approaches to get link (simple tag or href attribute)
        let link = extractValue(linkRegex, itemContent);
        if (!link) {
          const hrefMatch = itemContent.match(linkHrefRegex);
          if (hrefMatch && hrefMatch[1]) {
            link = hrefMatch[1].trim();
          }
        }
        
        const title = extractValue(titleRegex, itemContent);
        const description = extractValue(descRegex, itemContent);
        
        // Try different content formats
        let content = extractValue(contentRegex, itemContent);
        if (!content) {
          content = extractValue(contentAltRegex, itemContent);
        }
        if (!content) {
          content = description; // Fallback to description if no content
        }
        
        // Try different date formats
        let pubDate = extractValue(pubDateRegex, itemContent);
        if (!pubDate) {
          pubDate = extractValue(dateRegex, itemContent);
        }
        
        // Extract categories
        const categories: string[] = [];
        const categoryMatches = Array.from(itemContent.matchAll(categoryRegex));
        for (const catMatch of categoryMatches) {
          if (catMatch[1]) {
            categories.push(catMatch[1].trim());
          } else if (catMatch[2]) {
            categories.push(catMatch[2].trim());
          }
        }
        
        // Only add items with sufficient data
        if (title && link && pubDate) {
          items.push({
            title,
            link,
            content: content || description || '',
            pubDate,
            categories: categories.length > 0 ? categories : undefined
          });
        }
      }
    } catch (error) {
      console.error("Error parsing RSS XML:", error);
    }
    
    return items;
  }
  
  /**
   * Parse Atom XML format
   */
  private parseAtomXml(xml: string): RawNewsItem[] {
    const items: RawNewsItem[] = [];
    
    try {
      // Regex for Atom entries
      const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g;
      const titleRegex = /<title[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/title>/;
      const linkRegex = /<link[^>]*href=['"]([\s\S]*?)['"][^>]*>/;
      const contentRegex = /<content[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/content>/;
      const summaryRegex = /<summary[^>]*>((?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?)<\/summary>/;
      const updatedRegex = /<updated[^>]*>([\s\S]*?)<\/updated>/;
      const publishedRegex = /<published[^>]*>([\s\S]*?)<\/published>/;
      const categoryRegex = /<category[^>]*term=['"]([\s\S]*?)['"][^>]*>/g;
      
      const entryMatches = Array.from(xml.matchAll(entryRegex));
      
      for (const entryMatch of entryMatches) {
        const entryContent = entryMatch[1];
        
        // Extract values with potential CDATA sections
        const extractValue = (regex: RegExp, content: string): string => {
          const match = content.match(regex);
          if (!match) return '';
          
          // If we have a CDATA capture group
          if (match[2]) return match[2].trim();
          // Otherwise use the whole content
          return match[1] ? match[1].trim() : '';
        };
        
        const title = extractValue(titleRegex, entryContent);
        
        // Extract link (Atom often uses href attribute)
        let link = '';
        const linkMatch = entryContent.match(linkRegex);
        if (linkMatch && linkMatch[1]) {
          link = linkMatch[1].trim();
        }
        
        // Try content or summary
        let content = extractValue(contentRegex, entryContent);
        if (!content) {
          content = extractValue(summaryRegex, entryContent) || '';
        }
        
        // Try published or updated date
        let pubDate = '';
        const publishedMatch = entryContent.match(publishedRegex);
        if (publishedMatch && publishedMatch[1]) {
          pubDate = publishedMatch[1].trim();
        } else {
          const updatedMatch = entryContent.match(updatedRegex);
          if (updatedMatch && updatedMatch[1]) {
            pubDate = updatedMatch[1].trim();
          }
        }
        
        // Extract categories from term attribute
        const categories: string[] = [];
        const categoryMatches = Array.from(entryContent.matchAll(categoryRegex));
        for (const catMatch of categoryMatches) {
          if (catMatch[1]) {
            categories.push(catMatch[1].trim());
          }
        }
        
        if (title && link && pubDate) {
          items.push({
            title,
            link,
            content,
            pubDate,
            categories: categories.length > 0 ? categories : undefined
          });
        }
      }
    } catch (error) {
      console.error("Error parsing Atom XML:", error);
    }
    
    return items;
  }
  
  /**
   * Helper to safely get a value from XML object
   */
  private getXmlValue(obj: any, key: string): string {
    if (!obj || !obj[key]) return '';
    
    const value = obj[key][0];
    if (typeof value === 'string') {
      return value;
    } else if (value && value._) {
      return value._;
    }
    
    return '';
  }
  
  /**
   * Format a raw news item into the InsertNewsItem format
   */
  private formatNewsItem(item: RawNewsItem): InsertNewsItem {
    // Determine category based on content or tags
    const category = this.determineCategory(item);
    
    // Parse date with error handling
    let publishedAt: Date;
    try {
      publishedAt = new Date(item.pubDate);
      
      // Check if the date is valid (not Invalid Date)
      if (isNaN(publishedAt.getTime())) {
        console.warn(`Invalid date format in RSS item: "${item.pubDate}" for article: "${item.title}". Using current date.`);
        publishedAt = new Date(); // Fallback to current date
      }
      
      // The publishedAt.toISOString() method is called when storing to PostgreSQL
      // Let's verify it works to prevent failures during insertion
      publishedAt.toISOString();
    } catch (error) {
      console.warn(`Error processing date: ${error}. Using current date for article: "${item.title}"`);
      publishedAt = new Date(); // Fallback to current date
    }
    
    // Sanitize title by removing HTML tags
    const sanitizedTitle = item.title.replace(/<[^>]*>/g, '');
    
    return {
      title: sanitizedTitle,
      summary: this.generateSummary(item.content), // Generate a placeholder summary to be improved by the summarize service
      sourceUrl: item.link,
      originalContent: item.content,
      publishedAt,
      category,
      importance: 0 // Will be set by the summarize service
    };
  }
  
  /**
   * Generate a basic summary from content
   * This will be improved by the summarize service
   */
  private generateSummary(content: string): string {
    // Strip HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    // Take first 250 characters
    let summary = textContent.substring(0, 250).trim();
    
    // Add ellipsis if content was truncated
    if (textContent.length > 250) {
      summary += '...';
    }
    
    return summary;
  }
  
  /**
   * Determine the most appropriate category for a news item
   */
  private determineCategory(item: RawNewsItem): string {
    const content = (item.title + ' ' + item.content).toLowerCase();
    const categories = item.categories ? item.categories.join(' ').toLowerCase() : '';
    
    // Check for FDA approvals
    if (
      content.includes('fda approval') || 
      content.includes('fda approves') ||
      content.includes('approved by fda') ||
      categories.includes('approval') || 
      categories.includes('fda')
    ) {
      return 'FDA APPROVAL';
    }
    
    // Check for clinical trials
    if (
      content.includes('clinical trial') || 
      content.includes('phase 1') || 
      content.includes('phase 2') || 
      content.includes('phase 3') ||
      content.includes('phase i') || 
      content.includes('phase ii') || 
      content.includes('phase iii') ||
      categories.includes('clinical') || 
      categories.includes('trial')
    ) {
      return 'CLINICAL TRIAL';
    }
    
    // Check for M&A
    if (
      content.includes('acquisition') || 
      content.includes('merger') || 
      content.includes('acquires') ||
      content.includes('acquired by') ||
      content.includes('billion dollar') ||
      content.includes('million dollar') ||
      categories.includes('m&a') || 
      categories.includes('acquisition')
    ) {
      return 'M&A';
    }
    
    // Default category
    return 'INDUSTRY NEWS';
  }
}

export const rssService = new RssService();
