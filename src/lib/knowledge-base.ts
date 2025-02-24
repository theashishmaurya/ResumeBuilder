export interface UserKnowledgeBase {
  experiences: string;  // Free-form text about work, projects, achievements
  education: string;   // Free-form text about education
  skills: string;      // Free-form text about skills
  jobDescriptions: string[];  // Array of plain text job descriptions
}

export class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private readonly STORAGE_KEY = 'userKnowledgeBase';

  private constructor() {
    // Initialize from localStorage if exists
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.validateAndMigrateData(data);
      } catch (e) {
        console.error('Error loading knowledge base from localStorage:', e);
      }
    }
  }

  private validateAndMigrateData(data: Partial<UserKnowledgeBase>): void {
    // Ensure localStorage data has all required fields
    const validatedData: UserKnowledgeBase = {
      experiences: data.experiences || '',
      education: data.education || '',
      skills: data.skills || '',
      jobDescriptions: Array.isArray(data.jobDescriptions) ? data.jobDescriptions : []
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validatedData));
  }

  static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  async saveUserKnowledgeBase(data: Partial<UserKnowledgeBase>): Promise<void> {
    const existingData = this.getUserKnowledgeBase() || {
      experiences: '',
      education: '',
      skills: '',
      jobDescriptions: []
    };

    const updatedData = {
      ...existingData,
      ...data
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    console.log('User knowledge base saved:', updatedData);
  }

  getUserKnowledgeBase(): UserKnowledgeBase | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing knowledge base from localStorage:', e);
      return null;
    }
  }

  async addJobDescription(jobDescription: string): Promise<void> {
    const userData = this.getUserKnowledgeBase();
    if (!userData) {
      // Initialize with new job description if no data exists
      await this.saveUserKnowledgeBase({
        experiences: '',
        education: '',
        skills: '',
        jobDescriptions: [jobDescription]
      });
      return;
    }

    userData.jobDescriptions.push(jobDescription);
    await this.saveUserKnowledgeBase(userData);
  }
} 