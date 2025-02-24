'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KnowledgeBaseService } from '@/lib/knowledge-base';
import { defaultTemplate } from '@/components/ResumeEditor';

interface ResumeContextType {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  experiences: string;
  setExperiences: (experiences: string) => void;
  education: string;
  setEducation: (education: string) => void;
  skills: string;
  setSkills: (skills: string) => void;
  jobDescription: string;
  setJobDescription: (jobDescription: string) => void;
  saveKnowledgeBase: () => Promise<void>;
  isSaving: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdown] = useState(defaultTemplate);
  const [experiences, setExperiences] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const knowledgeBase = KnowledgeBaseService.getInstance();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = knowledgeBase.getUserKnowledgeBase();
    if (savedData) {
      setExperiences(savedData.experiences);
      setEducation(savedData.education);
      setSkills(savedData.skills);
      // Set the most recent job description if any exists
      if (savedData.jobDescriptions.length > 0) {
        setJobDescription(savedData.jobDescriptions[savedData.jobDescriptions.length - 1]);
      }
    }
  }, [knowledgeBase]);

  const saveKnowledgeBase = async () => {
    setIsSaving(true);
    try {
      await knowledgeBase.saveUserKnowledgeBase({
        experiences,
        education,
        skills
      });

      if (jobDescription.trim()) {
        await knowledgeBase.addJobDescription(jobDescription);
      }
    } catch (error) {
      console.error('Error saving knowledge base:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ResumeContext.Provider
      value={{
        markdown,
        setMarkdown,
        experiences,
        setExperiences,
        education,
        setEducation,
        skills,
        setSkills,
        jobDescription,
        setJobDescription,
        saveKnowledgeBase,
        isSaving
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
} 