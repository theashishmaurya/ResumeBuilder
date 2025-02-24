'use client';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useResume } from '@/context/ResumeContext';

export function KnowledgeBaseForm() {
  const {
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
  } = useResume();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Professional Experience</CardTitle>
            <CardDescription>
              Add your work history, achievements, and responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={experiences}
              onChange={(e) => setExperiences(e.target.value)}
              placeholder="Enter your professional experience..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>
              Add your educational background and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Enter your education details..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              List your technical and professional skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Enter your skills..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Job Description</CardTitle>
            <CardDescription>
              Add the job description you&apos;re targeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => {
            console.log('Knowledge base saved');

            saveKnowledgeBase();
          }}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Knowledge Base'}
        </Button>
      </div>
    </div>
  );
} 