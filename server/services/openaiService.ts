import OpenAI from "openai";
import { InsertNewsItem } from "@shared/schema";

// Check if OpenAI API key is available
const apiKey = process.env.OPENAI_API_KEY;
const isOpenAIAvailable = !!apiKey;

// Initialize OpenAI client if API key is available
const openai = isOpenAIAvailable ? new OpenAI({ apiKey }) : null;

class OpenAIService {
  /**
   * Generate an improved summary for a news item using OpenAI
   */
  async generateSummary(item: InsertNewsItem): Promise<string> {
    // If OpenAI is not available, return the original summary
    if (!isOpenAIAvailable || !openai) {
      console.log("OpenAI API key not available. Using original summary.");
      return item.summary;
    }
    
    try {
      // Extract text content from HTML if needed
      const content = item.originalContent 
        ? this.stripHtml(item.originalContent) 
        : item.summary;
      
      // Prepare the prompt for OpenAI
      const prompt = `
        You are a professional science writer specializing in biotech and pharmaceutical news.
        Summarize the following article in 2-3 concise sentences (maximum 75 words).
        Focus on the most important information for biotech industry professionals.
        If this is about an FDA approval, include the approved indication.
        If this is about a clinical trial, mention the phase and key results.
        If this is about an M&A, include the financial details if available.
        
        Article to summarize:
        Title: ${item.title}
        Content: ${content.substring(0, 5000)} // Limit to 5000 chars to avoid token limits
      `;
      
      // Call OpenAI API to generate summary
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150, // Limit response size
        temperature: 0.5, // Balance between creativity and focus
      });
      
      // Extract and return the generated summary
      const summary = response.choices[0].message.content?.trim() || item.summary;
      return summary;
    } catch (error) {
      console.error("Error generating summary with OpenAI:", error);
      // Fallback to original summary if API call fails
      return item.summary;
    }
  }
  
  /**
   * Analyze content and assign importance score
   */
  async calculateImportance(item: InsertNewsItem): Promise<number> {
    // If OpenAI is not available, use basic scoring logic
    if (!isOpenAIAvailable || !openai) {
      return this.calculateBasicImportance(item);
    }
    
    try {
      // Extract text for analysis
      const content = item.title + ". " + (item.originalContent 
        ? this.stripHtml(item.originalContent).substring(0, 2000) // Limit size
        : item.summary);
      
      // Prepare the prompt for importance scoring
      const prompt = `
        You are an expert in the biotech and pharmaceutical industry.
        Analyze the following article and rate its importance on a scale of 0 to 100.
        
        Scoring criteria:
        - Impact on patients or public health (0-25 points)
        - Scientific or business significance (0-25 points)
        - Novelty or breakthrough status (0-25 points)
        - Relevance to industry trends or major companies (0-25 points)
        
        Return only a JSON object with a single "score" field containing an integer value.
        
        Article to analyze:
        Title: ${item.title}
        Category: ${item.category}
        Content: ${content}
      `;
      
      // Call OpenAI API with JSON response format
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3, // Low temperature for more consistent scoring
      });
      
      // Parse the response and extract score
      try {
        const result = JSON.parse(response.choices[0].message.content || "{}");
        if (typeof result.score === 'number') {
          return result.score;
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI JSON response:", parseError);
      }
      
      // Fallback to basic scoring
      return this.calculateBasicImportance(item);
    } catch (error) {
      console.error("Error calculating importance with OpenAI:", error);
      return this.calculateBasicImportance(item);
    }
  }
  
  /**
   * Basic rule-based importance calculation
   */
  private calculateBasicImportance(item: InsertNewsItem): number {
    const content = (item.title + ' ' + (item.originalContent 
      ? this.stripHtml(item.originalContent) 
      : item.summary)).toLowerCase();
    
    let score = 10; // Base score
    
    // Category-based scoring
    if (item.category === 'FDA APPROVAL') score += 30;
    if (item.category === 'CLINICAL TRIAL') score += 20;
    if (item.category === 'M&A') score += 25;
    
    // Key terms scoring
    const keyTerms = [
      { term: 'breakthrough', points: 20 },
      { term: 'first-in-class', points: 20 },
      { term: 'first in class', points: 20 },
      { term: 'approval', points: 15 },
      { term: 'phase 3', points: 15 },
      { term: 'phase iii', points: 15 },
      { term: 'positive results', points: 10 },
      { term: 'successful', points: 5 },
      { term: 'billion', points: 15 },
      { term: 'million', points: 5 },
      { term: 'significant', points: 5 },
      { term: 'milestone', points: 10 },
    ];
    
    for (const { term, points } of keyTerms) {
      if (content.includes(term)) {
        score += points;
      }
    }
    
    // Recency boost
    const now = new Date();
    const publishDate = item.publishedAt instanceof Date 
      ? item.publishedAt 
      : new Date(item.publishedAt);
    const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 1) score += 20;  // Today
    else if (ageInDays < 2) score += 10;  // Yesterday
    else if (ageInDays < 7) score += 5;  // Last week
    
    return Math.min(score, 100); // Cap at 100
  }
  
  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const openaiService = new OpenAIService();