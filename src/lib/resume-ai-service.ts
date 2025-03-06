import { KnowledgeBaseService, UserKnowledgeBase } from './knowledge-base';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Create a configured OpenAI provider instance
const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  // Ensure we're using strict mode for the actual OpenAI API
  compatibility: 'strict'
});

// Hard-coded header format to always use
const FIXED_HEADER_FORMAT = `# Bruce Wayne

|  |  |  |
|---------|---------|---------|
| 👤 [example.com](https://example.com/) | 🔗 [github.com/example](https://github.com/example) | 📱 [(+1) 123-456-7890](https://wa.me/11234567890) |
| 📍 1234 Abc Street, Example, EX 01234 | 💼 [linkedin.com/in/example](https://linkedin.com/in/example/) | ✉️ [email@example.com](mailto:mail@example.com) |

`;

export interface ResumeGenerationRequest {
  customPrompt?: string;
}

export interface GeneratedResume {
  markdown: string;
  suggestions: string[];
}

export interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  content: string;
  resumeMarkdown?: string;
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

  private createChatContext(knowledgeBase: UserKnowledgeBase): string {
    let context = 'Knowledge Base Information:\n\n';
    
    if (knowledgeBase.experiences) {
      context += 'Professional Experience:\n' + knowledgeBase.experiences + '\n\n';
    }

    if (knowledgeBase.education) {
      context += 'Education:\n' + knowledgeBase.education + '\n\n';
    }

    if (knowledgeBase.skills) {
      context += 'Skills:\n' + knowledgeBase.skills + '\n\n';
    }

    if (knowledgeBase.jobDescriptions.length > 0) {
      context += 'Target Job Description:\n' + knowledgeBase.jobDescriptions[knowledgeBase.jobDescriptions.length - 1] + '\n\n';
    }

    return context;
  }

  // Extract resume sections from markdown content
  private extractResumeSections(content: string): string | null {
    try {
      // Create a regex to match resume section headings
      const sectionRegex = /^## (Experience|Professional Experience|Work Experience|Employment|Skills|Projects|Certifications|Languages|Achievements|Summary|Objective)/gmi;
      
      // Find all matches
      const matches = [...content.matchAll(sectionRegex)];
      
      if (matches.length === 0) {
        return null;
      }
      
      // Build a resume from the sections
      let resumeContent = FIXED_HEADER_FORMAT;
      
      // Sort matches by their position in the text to preserve order
      matches.sort((a, b) => (a.index || 0) - (b.index || 0));
      
      // Extract each section
      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const currentIndex = currentMatch.index || 0;
        const nextIndex = (i < matches.length - 1) ? (matches[i + 1].index || content.length) : content.length;
        
        // Extract the section content
        const sectionContent = content.substring(currentIndex, nextIndex).trim();
        
        // Add to resume
        resumeContent += sectionContent + '\n\n';
      }
      
      return resumeContent.trim();
    } catch (error) {
      console.error('Error extracting resume sections:', error);
      return null;
    }
  }

  async generateResume(request: ResumeGenerationRequest): Promise<GeneratedResume> {
    const knowledgeBase = this.knowledgeBaseService.getUserKnowledgeBase();
    if (!knowledgeBase) throw new Error('Knowledge base not found');

    try {
      const prompt = this.createPrompt(knowledgeBase, request.customPrompt);
      
      // Using AI SDK's generateText function
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt: `You are a professional resume assistant that helps users create and improve their resumes.

${prompt}

Important: I ONLY need the content of the resume sections (Experience, Skills, etc.). DO NOT include any explanations or header section with personal details as I'll use my own format. Only generate the resume section content.`,
        temperature: 0.7,
        maxTokens: 2000,
      });

      // Build resume with our fixed header and the generated content
      const resumeContent = FIXED_HEADER_FORMAT + result.text;

      return {
        markdown: resumeContent,
        suggestions: []  // We could parse suggestions from the response if needed
      };
    } catch (error) {
      console.error('Error generating resume:', error);
      throw error;
    }
  }

  async generateChat(request: ChatRequest): Promise<ChatResponse> {
    const knowledgeBase = this.knowledgeBaseService.getUserKnowledgeBase();
    const context = knowledgeBase ? this.createChatContext(knowledgeBase) : '';
    
    // Create the system message with knowledge base context
    const systemContext = `You are an AI resume assistant helping the user with their resume and career advice.
${context ? `${context}\nUse the knowledge base information above to provide personalized assistance when relevant to the user's questions.\n\n` : ''}
IMPORTANT INSTRUCTION:
- When generating a resume, DO NOT include name, contact info or header section - I'll use my own format.
- Focus ONLY on creating content for the functional resume sections like Experience, Skills, Projects, etc.
- Never suggest or add placeholder text - only use specific information from the knowledge base or conversation history.

Important: Always use proper Markdown formatting in your responses:
- Use ## for section headings (like ## Experience, ## Skills)
- Use bullet points (- or *) for lists
- Use **bold** for emphasis and highlighting important information
- Use proper markdown formatting for sections like experiences, skills, etc.
- Follow a professional resume structure with clearly defined sections`;
    
    try {
      // Build conversation history as text
      let conversationHistory = '';
      for (const msg of request.history) {
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
      }

      // Check if the user is requesting a resume
      const isRequestingResume = this.isResumeBuildRequest(request.message);

      // Create the complete prompt
      const fullPrompt = `${systemContext}

Previous conversation:
${conversationHistory}
User: ${request.message}

${isRequestingResume ? 
  'Please generate resume sections in proper Markdown format based on the knowledge base information and the user\'s request. DO NOT include any header with name or contact info - I\'ll handle that part. ONLY generate content for sections like Experience, Skills, Projects, etc.' : 
  'Please give a helpful response as the resume assistant, using Markdown formatting where appropriate.'}`;
      
      // Using AI SDK to generate a response
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt: fullPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      
      const content = result.text;
      
      // Check if the response contains resume content and extract only relevant sections
      let resumeMarkdown: string | undefined;
      
      if (this.containsResumeMarkdown(content)) {
        // Extract only the resume sections and add our fixed header
        const extractedSections = this.extractResumeSections(content);
        if (extractedSections) {
          resumeMarkdown = extractedSections;
        } else {
          // If extraction failed, use the fixed header with the complete content
          resumeMarkdown = FIXED_HEADER_FORMAT + content;
        }
      }
      
      return {
        content,
        resumeMarkdown
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw error;
    }
  }
  
  private isResumeBuildRequest(message: string): boolean {
    // Check if the message appears to be requesting a resume
    const resumeKeywords = [
      'build a resume', 'create a resume', 'write a resume', 'generate a resume',
      'update my resume', 'make a new resume', 'craft a resume', 'tailor my resume',
      'resume for', 'customize my resume', 'adapt my resume', 'adjust my resume',
      'new resume', 'latest resume', 'modern resume', 'professional resume',
      'targeted resume', 'resume template', 'improve my resume', 'enhance my resume',
      'job application', 'job search', 'get hired', 'resume example',
      'want a resume', 'need a resume', 'resume format', 'optimize my resume',
      'improve profile', 'career change', 'job seeking', 'employment',
      'curriculum vitae', 'CV', 'for this job', 'show me a resume'
    ];
    
    const lowerMessage = message.toLowerCase();
    return resumeKeywords.some(keyword => lowerMessage.includes(keyword));
  }
  
  private containsResumeMarkdown(content: string): boolean {
    // Check if the content has markdown patterns that indicate a full resume
    const headingPattern = /^##\s+(Experience|Education|Skills|Summary|Projects|Work|Employment|Profile|Certifications|Languages|Interests)/mi;
    const structurePattern = /\*\*.*\*\*.*\d{4}|[-*]\s+[A-Z]|\|\s*[^|]+\s*\|/m;
    
    return headingPattern.test(content) || structurePattern.test(content);
  }
} 