import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export interface ResumeSection {
  id: string;
  content: string;
}

export interface AIResponse {
  suggestions: string[];
  improvedContent?: string;
}

export class AIService {
  static async makeRequest(prompt: string): Promise<AIResponse> {
    console.log('AI Prompt:', prompt);
    
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.error('OpenAI API key is missing. Please check your environment variables.');
      throw new Error('OpenAI API key is missing');
    }
    
    try {
      // Using AI SDK's generateText function with the openai provider
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });

      const content = result.text;
      
      // Extract suggestions from the content
      const suggestions: string[] = [];
      const suggestionRegex = /suggestion[s]?:|\*\*suggestion[s]?:|\*\*improvement[s]?:|\*\*recommendation[s]?:/i;
      
      if (suggestionRegex.test(content)) {
        const parts = content.split(suggestionRegex);
        if (parts.length > 1) {
          const suggestionText = parts[1].trim();
          const suggestionItems = suggestionText.split(/\n-|\n\*|\n\d+\./);
          
          for (const item of suggestionItems) {
            const trimmed = item.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.length > 10) {
              suggestions.push(trimmed);
            }
          }
        }
      }
      
      return {
        suggestions: suggestions.length > 0 ? suggestions : [],
        improvedContent: content
      };
    } catch (error) {
      console.error('Error calling AI SDK:', error);
      
      // Check if the error is related to the API key
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('OpenAI API key is missing or invalid');
      }
      
      // Fallback to ensure the application doesn't break
      return {
        suggestions: [
          "Error connecting to AI service. Please try again later.",
        ],
        improvedContent: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later."
      };
    }
  }

  static async improveSection(section: ResumeSection): Promise<AIResponse> {
    const prompt = `Please improve the following ${section.id} section of my resume:\n${section.content}`;
    return this.makeRequest(prompt);
  }

  static async suggestContent(sectionId: string, context: string): Promise<AIResponse> {
    const prompt = `Please suggest content for the ${sectionId} section of my resume based on this context:\n${context}`;
    return this.makeRequest(prompt);
  }

  static async analyzeResume(content: string): Promise<AIResponse> {
    const prompt = `Please analyze this resume and provide suggestions for improvement:\n${content}`;
    return this.makeRequest(prompt);
  }
} 