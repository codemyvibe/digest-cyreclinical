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
      
      // Fetch the RSS feed
      const response = await fetch(feed.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const xml = await response.text();
      const items = this.parseRssXml(xml);
      
      console.log(`Parsed ${items.length} items from ${feed.name}`);
      
      // Convert raw items to InsertNewsItem format
      return items.map(item => this.formatNewsItem(item));
    } catch (error) {
      console.error(`Error fetching feed ${feed.url}:`, error);
      return [];
    }
  }
  
  /**
   * Parse RSS XML content into structured data
   */
  private parseRssXml(xml: string): RawNewsItem[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    
    const items: RawNewsItem[] = [];
    const itemElements = xmlDoc.getElementsByTagName("item");
    
    for (let i = 0; i < itemElements.length; i++) {
      const item = itemElements[i];
      
      const title = this.getElementText(item, "title");
      const link = this.getElementText(item, "link");
      const content = this.getElementText(item, "content:encoded") || 
                      this.getElementText(item, "description");
      const pubDate = this.getElementText(item, "pubDate");
      
      // Parse categories if available
      const categoryElements = item.getElementsByTagName("category");
      const categories: string[] = [];
      for (let j = 0; j < categoryElements.length; j++) {
        categories.push(categoryElements[j].textContent || "");
      }
      
      if (title && link && content && pubDate) {
        items.push({
          title,
          link,
          content,
          pubDate,
          categories: categories.length > 0 ? categories : undefined
        });
      }
    }
    
    return items;
  }
  
  /**
   * Helper to get text content from an XML element
   */
  private getElementText(parent: Element, tagName: string): string {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent || "" : "";
  }
  
  /**
   * Format a raw news item into the InsertNewsItem format
   */
  private formatNewsItem(item: RawNewsItem): InsertNewsItem {
    // Determine category based on content or tags
    const category = this.determineCategory(item);
    
    // Parse date
    const publishedAt = new Date(item.pubDate);
    
    return {
      title: item.title,
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
