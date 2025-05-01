import Anthropic from '@anthropic-ai/sdk';
import { InsertNewsItem } from '@shared/schema';

// The newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

class AnthropicService {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable must be set");
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate an improved summary for a news item using Anthropic Claude
   */
  async generateSummary(item: InsertNewsItem): Promise<string> {
    try {
      console.log(`Generating AI summary for news item: ${item.title}`);
      
      const prompt = `
You are a specialized AI assistant for a biotech and pharmaceutical news service. 
Your task is to create a concise, informative summary of the following biotech/pharma news article.

Article Title: ${item.title}
Article Content: ${item.originalContent || ''}

Please create a summary that:
1. Is approximately 2-3 concise paragraphs (200-250 words)
2. Captures the key scientific, medical, and business details
3. Explains the significance to the biotech/pharma industry
4. Uses precise scientific terminology appropriate for industry professionals
5. Maintains an objective, factual tone

Focus on information that would be most valuable to biotech industry professionals.
`;

      const response = await this.client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      // Extract and return the summary text from response
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if (content.type === 'text') {
          return content.text.trim();
        }
      }
      
      return this.generateBasicSummary(item);
    } catch (error) {
      console.error("Error generating summary with Anthropic:", error);
      return this.generateBasicSummary(item);
    }
  }

  /**
   * Analyze content and assign importance score using Claude
   */
  async calculateImportance(item: InsertNewsItem): Promise<number> {
    try {
      console.log(`Calculating importance for news item: ${item.title}`);
      
      const prompt = `
You are a specialized AI assistant for a biotech and pharmaceutical news service.
Your task is to score the importance of the following biotech/pharma news article on a scale of 0-100.

Article Title: ${item.title}
Article Content: ${item.originalContent || ''}

Consider these factors when scoring:
1. Scientific breakthrough (novel findings, new technologies)
2. Clinical significance (impact on patient care, treatment approaches)
3. Market impact (financial implications, stock movements)
4. Regulatory developments (FDA approvals, rejections, guidance)
5. Industry trends (mergers, acquisitions, partnerships)

Output only a single integer number between 0-100 representing the importance score.
`;

      const response = await this.client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      });

      // Extract and parse the importance score
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if (content.type === 'text') {
          const text = content.text.trim();
          const match = text.match(/\d+/);
          if (match) {
            return parseInt(match[0], 10);
          }
        }
      }
      
      return this.calculateBasicImportance(item);
    } catch (error) {
      console.error("Error calculating importance with Anthropic:", error);
      return this.calculateBasicImportance(item);
    }
  }

  /**
   * Basic rule-based importance calculation as fallback
   */
  private calculateBasicImportance(item: InsertNewsItem): number {
    let score = 50; // Base score
    
    // Keywords that indicate higher importance
    const highImportanceKeywords = [
      'fda approval', 'breakthrough', 'phase 3', 'successful trial',
      'acquisition', 'merger', 'billion', 'million', 'approved',
      'novel', 'first-in-class', 'patent', 'exclusive'
    ];
    
    // Keywords that indicate lower importance
    const lowImportanceKeywords = [
      'webinar', 'conference', 'announces', 'appointment', 'promoted',
      'speaking', 'presents at', 'interview', 'podcast'
    ];
    
    const titleAndContent = (
      item.title.toLowerCase() + ' ' + 
      (item.originalContent ? item.originalContent.toLowerCase() : '')
    );
    
    // Adjust score based on keywords
    highImportanceKeywords.forEach(keyword => {
      if (titleAndContent.includes(keyword)) score += 5;
    });
    
    lowImportanceKeywords.forEach(keyword => {
      if (titleAndContent.includes(keyword)) score -= 5;
    });
    
    // Ensure score stays within 0-100 range
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate a basic summary from content as fallback
   */
  private generateBasicSummary(item: InsertNewsItem): string {
    if (!item.originalContent) return item.title;
    
    // Extract first few sentences (up to 250 chars) as a simple summary
    const content = this.stripHtml(item.originalContent);
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length > 250) break;
      summary += sentence.trim() + '. ';
    }
    
    return summary.trim();
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

export const anthropicService = new AnthropicService();