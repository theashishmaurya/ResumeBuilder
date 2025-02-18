export interface ResumeSection {
  id: string;
  content: string;
}

export interface AIResponse {
  suggestions: string[];
  improvedContent?: string;
}

export class AIService {
  private static async makeRequest(prompt: string): Promise<AIResponse> {
    console.log(prompt);
    // TODO: Implement actual AI API call
    // This is a mock implementation

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          suggestions: [
            "Consider adding more quantifiable achievements",
            "Include relevant keywords from the job description",
            "Add specific technologies and tools used"
          ],
          improvedContent: "Improved content will be generated here"
        });
      }, 1000);
    });
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