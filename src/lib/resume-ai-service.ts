import { AIService } from './ai-service';
import { KnowledgeBaseService, UserKnowledgeBase } from './knowledge-base';

export interface ResumeGenerationRequest {
  customPrompt?: string;
}

export interface GeneratedResume {
  markdown: string;
  suggestions: string[];
}

export class ResumeAIService {
  private static instance: ResumeAIService;
  private knowledgeBaseService: KnowledgeBaseService;

  private constructor() {
    this.knowledgeBaseService = KnowledgeBaseService.getInstance();
  }

  static getInstance(): ResumeAIService {
    if (!ResumeAIService.instance) {
      ResumeAIService.instance = new ResumeAIService();
    }
    return ResumeAIService.instance;
  }

  private createPrompt(knowledgeBase: UserKnowledgeBase, customPrompt?: string): string {
    let prompt = 'Based on the following information, ';
    
    if (customPrompt) {
      prompt += customPrompt + ':\n\n';
    } else {
      prompt += 'generate a professional resume in markdown format:\n\n';
    }

    if (knowledgeBase.experiences) {
      prompt += 'Professional Experience:\n' + knowledgeBase.experiences + '\n\n';
    }

    if (knowledgeBase.education) {
      prompt += 'Education:\n' + knowledgeBase.education + '\n\n';
    }

    if (knowledgeBase.skills) {
      prompt += 'Skills:\n' + knowledgeBase.skills + '\n\n';
    }

    if (knowledgeBase.jobDescriptions.length > 0) {
      prompt += 'Target Job Descriptions:\n' + knowledgeBase.jobDescriptions.join('\n---\n') + '\n\n';
    }

    prompt += 'Please provide the response in markdown format, ensuring proper headings, bullet points, and formatting.';
    return prompt;
  }

  async generateResume(request: ResumeGenerationRequest): Promise<GeneratedResume> {
    const knowledgeBase = this.knowledgeBaseService.getUserKnowledgeBase();
    if (!knowledgeBase) throw new Error('Knowledge base not found');

    const prompt = this.createPrompt(knowledgeBase, request.customPrompt);
    const response = await AIService.makeRequest(prompt);

    return {
      markdown: response.improvedContent || '',
      suggestions: response.suggestions
    };
  }
} 