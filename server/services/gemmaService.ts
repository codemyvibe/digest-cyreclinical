import { InsertNewsItem } from "@shared/schema";

// Check if OpenRouter API key is available
const apiKey = process.env.OPENROUTER_API_KEY;
const isOpenRouterAvailable = !!apiKey;

// Store the OpenRouter API URL
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";

// The model ID for Gemma 3 27B on OpenRouter
const GEMMA_MODEL_ID = "google/gemma-3-27b-instruct";

class GemmaService {
  /**
   * Generate an improved summary for a news item using Gemma 3 27B via OpenRouter
   */
  async generateSummary(item: InsertNewsItem): Promise<string> {
    // If OpenRouter is not available, return the original summary
    if (!isOpenRouterAvailable) {
      console.log("OpenRouter API key not available. Using original summary.");
      return item.summary;
    }
    
    try {
      // Extract text content from HTML if needed
      const content = item.originalContent 
        ? this.stripHtml(item.originalContent) 
        : item.summary;
      
      // Prepare the system and user messages for Gemma via OpenRouter
      const messages = [
        {
          role: "system",
          content: "You are a professional science writer specializing in biotech and pharmaceutical news. You create concise, accurate summaries focusing on key information relevant to biotech industry professionals."
        },
        {
          role: "user",
          content: `Summarize the following article in 2-3 concise sentences (maximum 75 words).
          Focus on the most important information for biotech industry professionals.
          If this is about an FDA approval, include the approved indication.
          If this is about a clinical trial, mention the phase and key results.
          If this is about an M&A, include the financial details if available.
          
          Article to summarize:
          Title: ${item.title}
          Content: ${content.substring(0, 4000)}`
        }
      ];
      
      // Call OpenRouter's chat completions API
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bionews-digest.replit.app', // Referrer for OpenRouter
          'X-Title': 'BioNews Digest App' // Title for OpenRouter
        },
        body: JSON.stringify({
          model: GEMMA_MODEL_ID,
          messages: messages,
          max_tokens: 150,
          temperature: 0.4
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} - ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Extract and return the generated summary or fall back to original
      const summary = data.choices?.[0]?.message?.content?.trim() || item.summary;
      console.log(`Generated summary: ${summary.substring(0, 100)}...`);
      return summary;
    } catch (error) {
      console.error("Error generating summary with Gemma via OpenRouter:", error);
      // Fallback to original summary if API call fails
      return item.summary;
    }
  }
  
  /**
   * Analyze content and assign importance score using Gemma 3 27B via OpenRouter
   */
  async calculateImportance(item: InsertNewsItem): Promise<number> {
    // If OpenRouter is not available, use basic scoring logic
    if (!isOpenRouterAvailable) {
      return this.calculateBasicImportance(item);
    }
    
    try {
      // Extract text for analysis
      const content = item.title + ". " + (item.originalContent 
        ? this.stripHtml(item.originalContent).substring(0, 1500) // Limit size
        : item.summary);
      
      // Prepare the system and user messages for importance scoring
      const messages = [
        {
          role: "system",
          content: "You are an expert in the biotech and pharmaceutical industry. You analyze news articles and rate their importance on a scale of 0 to 100. You always respond with just a JSON object containing a single 'score' field with an integer value."
        },
        {
          role: "user",
          content: `Rate the importance of this article on a scale from 0 to 100 using these criteria:
          - Impact on patients or public health (0-25 points)
          - Scientific or business significance (0-25 points)
          - Novelty or breakthrough status (0-25 points)
          - Relevance to industry trends or major companies (0-25 points)
          
          Return only a JSON object with a single "score" field containing an integer value.
          Example response: {"score": 75}
          
          Article to analyze:
          Title: ${item.title}
          Category: ${item.category}
          Content: ${content}`
        }
      ];
      
      // Call OpenRouter's chat completions API for importance scoring
      const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://bionews-digest.replit.app',
          'X-Title': 'BioNews Digest App'
        },
        body: JSON.stringify({
          model: GEMMA_MODEL_ID,
          messages: messages,
          max_tokens: 50,
          temperature: 0.2, // Low temperature for more consistent scoring
          response_format: { type: "json_object" } // Request JSON format
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Try to parse the result as JSON to extract the score
      try {
        const resultText = data.choices?.[0]?.message?.content || "";
        // Parse the JSON response
        const result = JSON.parse(resultText);
        if (typeof result.score === 'number') {
          console.log(`Calculated importance score: ${result.score}`);
          return result.score;
        }
      } catch (parseError) {
        console.error("Error parsing OpenRouter response:", parseError);
      }
      
      // Fallback to basic scoring
      return this.calculateBasicImportance(item);
    } catch (error) {
      console.error("Error calculating importance with Gemma via OpenRouter:", error);
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

export const gemmaService = new GemmaService();