import { InsertNewsItem } from "@shared/schema";
import { aiService } from "./aiService";

class SummarizeService {
  /**
   * Process a batch of news items:
   * 1. Analyze importance
   * 2. Generate better summaries
   * 3. Filter out less important items
   */
  async processNewsItems(newsItems: InsertNewsItem[]): Promise<InsertNewsItem[]> {
    console.log(`Processing ${newsItems.length} news items...`);
    
    // First, score and rank all items by importance
    const scoredItems = await Promise.all(
      newsItems.map(async item => {
        // Use AI service to calculate importance
        const importance = await aiService.calculateImportance(item);
        return { ...item, importance };
      })
    );
    
    // Sort by importance (highest first)
    scoredItems.sort((a, b) => b.importance - a.importance);
    
    // Take the top items (max 10)
    const topItems = scoredItems.slice(0, 10);
    
    // Generate better summaries for the top items
    const processedItems = await Promise.all(
      topItems.map(async item => {
        // Use AI service to generate summary
        const summary = await aiService.generateSummary(item);
        return { ...item, summary };
      })
    );
    
    console.log(`Processed ${processedItems.length} important news items`);
    return processedItems;
  }
}

export const summarizeService = new SummarizeService();
