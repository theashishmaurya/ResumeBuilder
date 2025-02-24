import { ResumeBuildingInterface } from '@/components/ResumeBuildingInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Resume Builder</h1>
        <ResumeBuildingInterface />
      </div>
    </main>
  );
}
