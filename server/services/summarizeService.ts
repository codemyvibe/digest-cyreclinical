import { InsertNewsItem } from "@shared/schema";

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
        const importance = this.calculateImportance(item);
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
        const summary = await this.generateBetterSummary(item);
        return { ...item, summary };
      })
    );
    
    console.log(`Processed ${processedItems.length} important news items`);
    return processedItems;
  }
  
  /**
   * Analyze content to calculate importance score 
   * Higher scores indicate more important items
   */
  private calculateImportance(item: InsertNewsItem): number {
    const content = (item.title + ' ' + (item.originalContent || '')).toLowerCase();
    let score = 0;
    
    // Base score - all items start at 10
    score += 10;
    
    // Category-based scoring
    if (item.category === 'FDA APPROVAL') score += 30;
    if (item.category === 'CLINICAL TRIAL') score += 20;
    if (item.category === 'M&A') score += 25;
    
    // Key phrase scoring - add points for important signals
    const importantPhrases = [
      { phrase: 'breakthrough', points: 20 },
      { phrase: 'first-in-class', points: 20 },
      { phrase: 'first in class', points: 20 },
      { phrase: 'approval', points: 15 },
      { phrase: 'phase 3', points: 15 },
      { phrase: 'phase iii', points: 15 },
      { phrase: 'positive results', points: 10 },
      { phrase: 'successful', points: 5 },
      { phrase: 'billion', points: 15 },
      { phrase: 'million', points: 5 },
      { phrase: 'fda', points: 15 },
      { phrase: 'ema', points: 15 },
      { phrase: 'significant', points: 5 },
      { phrase: 'milestone', points: 10 },
      { phrase: 'announced today', points: 3 },
      { phrase: 'announces', points: 3 },
      { phrase: 'collaboration', points: 5 },
      { phrase: 'partnership', points: 5 },
      { phrase: 'exclusive', points: 3 },
      { phrase: 'novel', points: 5 },
      { phrase: 'rare disease', points: 8 },
      { phrase: 'orphan drug', points: 8 },
    ];
    
    for (const { phrase, points } of importantPhrases) {
      if (content.includes(phrase)) {
        score += points;
      }
    }
    
    // Recency scoring - newer content is more important
    const now = new Date();
    const publishDate = new Date(item.publishedAt);
    const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 1) score += 20;  // Today
    else if (ageInDays < 2) score += 10;  // Yesterday
    else if (ageInDays < 7) score += 5;  // Last week
    
    return score;
  }
  
  /**
   * Generate a better summary for news item
   * In a real implementation, this would use OpenAI's API
   */
  private async generateBetterSummary(item: InsertNewsItem): Promise<string> {
    // Strip HTML tags from content
    const content = item.originalContent ? item.originalContent.replace(/<[^>]*>/g, '') : '';
    
    // Use the first 1-2 sentences as a better summary
    // In production, this would use OpenAI API to generate a proper summary
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return item.summary; // Fall back to original summary
    }
    
    let summary = sentences[0].trim();
    
    // Add a second sentence if available and if first is short
    if (sentences.length > 1 && summary.length < 100) {
      summary += '. ' + sentences[1].trim() + '.';
    } else {
      summary += '.';
    }
    
    // For M&A news, try to extract the transaction value if present
    if (item.category === 'M&A') {
      const moneyRegex = /\$\s*(\d+(?:\.\d+)?)\s*(million|billion)/i;
      const match = content.match(moneyRegex);
      
      if (match) {
        const [, amount, unit] = match;
        const transactionInfo = ` The deal is valued at $${amount} ${unit}.`;
        summary += transactionInfo;
      }
    }
    
    // For FDA Approval, highlight the approved indication
    if (item.category === 'FDA APPROVAL' && !summary.toLowerCase().includes('approved for')) {
      if (content.toLowerCase().includes('approved for')) {
        const approvedForIndex = content.toLowerCase().indexOf('approved for');
        const relevantText = content.substring(approvedForIndex, approvedForIndex + 100);
        const endIndex = relevantText.search(/[.!?]/);
        
        if (endIndex > 0) {
          const approvalInfo = relevantText.substring(0, endIndex + 1);
          summary += ' ' + approvalInfo;
        }
      }
    }
    
    return summary;
  }
}

export const summarizeService = new SummarizeService();
