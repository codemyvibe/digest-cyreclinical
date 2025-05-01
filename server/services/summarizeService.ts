import { InsertNewsItem } from "@shared/schema";
import { gemmaService } from "./gemmaService";

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
        // Use Gemma to calculate importance if available
        const importance = await gemmaService.calculateImportance(item);
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
        // Use Gemma to generate summary if available
        const summary = await gemmaService.generateSummary(item);
        return { ...item, summary };
      })
    );
    
    console.log(`Processed ${processedItems.length} important news items`);
    return processedItems;
  }
}

export const summarizeService = new SummarizeService();
