'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBaseForm } from './KnowledgeBaseForm';
import { ResumeEditor } from './ResumeEditor';

export function ResumeBuildingInterface() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Tabs defaultValue="editor" className="w-full h-[calc(100vh-6rem)]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="editor">Resume Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="h-full">
          <KnowledgeBaseForm />
        </TabsContent>

        <TabsContent value="editor" className="h-full">
          <ResumeEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
} 