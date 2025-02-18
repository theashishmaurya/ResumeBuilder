import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResumeEditor } from "@/components/ResumeEditor";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="border-b">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                AI Resume Builder
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <Button variant="outline" size="sm">
              Templates
            </Button>
          </div>
        </div>
      </nav>

        {/* <Sidebar /> */}
        <main className="flex w-full flex-col overflow-hidden">
          <ResumeEditor />
        </main>
    </main>
  );
}
