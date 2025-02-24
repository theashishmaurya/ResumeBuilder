"use client";

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { MessageCircle, X } from 'lucide-react';
import { ResumeChat } from './ResumeChat';
import { useResume } from '@/context/ResumeContext';

import { ResumeStyleSidebar } from './ResumeStyleSidebar';
import type { Components } from 'react-markdown';

interface ResumeStyles {
  fontSize: number;
  fontFamily: {
    cjk: string;
    english: string;
  };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  lineSpacing: number;
  paragraphSpacing: number;
  themeColor: string;
}

const defaultStyles: ResumeStyles = {
  fontSize: 14,
  fontFamily: {
    cjk: "华康宋体",
    english: "Verdana"
  },
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  },
  lineSpacing: 1.5,
  paragraphSpacing: 16,
  themeColor: "#000000"
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const defaultTemplate = `# Bruce Wayne

|  |  |  |
|---------|---------|---------|
| 👤 [example.com](https://example.com/) | 🔗 [github.com/example](https://github.com/example) | 📱 [(+1) 123-456-7890](https://wa.me/11234567890) |
| 📍 1234 Abc Street, Example, EX 01234 | 💼 [linkedin.com/in/example](https://linkedin.com/in/example/) | ✉️ [email@example.com](mailto:mail@example.com) |

## Experience

### Machine Learning Engineer Intern at Slow Feet Technology
*Jul 2021 - Present*

- Devised a new food-agnostic formulation for fine-grained cross-ingredient meal cooking and subsumed the recent popular events into this proposed scheme
- Proposed a cream of mushroom soup recipe which is competitive when compared with the SOTA recipes with complex steps by only altering the way of cutting mushroom, published in NeurIPS 2099 (see P1)
- Developed a pan for meal cooking which is benefiting the group members' research work

### Research Intern at Paddling University
*Aug 2020 - Present*

- Designed an efficient method for miso tofu quality estimation via thermometer
- Proposed a fast stir frying algorithm for tofu cooking to minimize the amount of the hot sauce
- Instead of using terms like "as much as you can", published in CVPR 2077 (see P2)
- Outperformed SOTA methods while cooking meals on popular tofu

### Research Assistant at Huangdu Institute of Technology
*Mar 2020 - Jun 2020*

- Proposed a novel framework consisting of a spoon and a fork of thunder to be eating meat tools
- Designed a tofu filtering strategy inspired by beans grinding method for building a dataset for this new task
- Designed two new sandwich criteria to assess the novelty and diversity of the eating plans
- Outperformed baselines and existed methods substantially in terms of diversity, novelty and coherence

## Education

### M.S. in Computer Science
*University of Charles River, Boston, MA*
*Sep 2021 - Jan 2023*

### B.Eng. in Software Engineering
*Huangdu Institute of Technology, Shanghai, China*
*Sep 2016 - Jul 2020*

## Skills

### Programming Languages
Python, JavaScript/TypeScript, HTML/CSS, Java

### Tools and Frameworks
Git, PyTorch, Keras, scikit-learn, Linux, Vue, React, Django

### Languages
English (proficient), Indonesia (native)

## Awards and Honors

- Gold, International Collegiate Catching Fish Contest (ICCFC), 2018
- First Prize, China National Scholarship for Outstanding Dragons, 2017, 2018

## Publications

### P1: Eating is All You Need
*Haha Ha, San Zhang*`;

// Add custom components for markdown rendering
const MarkdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-center text-[color:var(--theme-color)] mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-[color:var(--theme-color)] text-xl font-bold mb-1 mt-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-[color:var(--theme-color)] text-lg font-semibold mb-0.5 mt-1" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-[color:var(--theme-color)] text-base font-medium mb-0.5 mt-1" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => {
    // Regular paragraph
    return (
      <p className="mb-[--paragraph-spacing]" {...props}>
        {children}
      </p>
    );
  },
  hr: ({ ...props }) => (
    <hr className="border-none h-[1px] my-1" style={{ backgroundColor: 'var(--theme-color)' }} {...props} />
  ),
  table: ({ children, ...props }) => (
    <table className="w-full border-collapse border-none mb-2" {...props}>
      {children}
    </table>
  ),
  thead: ({ children, ...props }) => (
    <thead className="hidden" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="border-none" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-none" {...props}>
      {children}
    </tr>
  ),
  td: ({ children, ...props }) => (
    <td className="px-2 py-1 border-none text-left" {...props}>
      {children}
    </td>
  ),
};

export function ResumeEditor() {
  const { markdown, setMarkdown } = useResume();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [styles, setStyles] = useState<ResumeStyles>(defaultStyles);
  const previewRef = useRef<HTMLDivElement>(null);

  

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleExportPDF = useCallback(() => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const opt = {
      filename: 'resume.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' as const
      }
    };

    html2pdf().set(opt).from(element).save();
  }, []);

  const updateStyle = <K extends keyof ResumeStyles>(key: K, value: ResumeStyles[K]) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full border rounded-lg overflow-hidden relative">
      {!isChatOpen && (
        <ResumeStyleSidebar 
          styles={styles}
          onStyleChange={updateStyle}
          onExportPDF={handleExportPDF}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor Section */}
        <div className="w-1/2 p-4 border-r">
          <textarea
            value={markdown}
            onChange={(e) => handleChange(e)}
            className="h-full w-full bg-white resize-none rounded-md border p-4 font-mono"
            placeholder="Enter your Markdown here..."
          />
        </div>
        
        {/* Preview Section */}
        <div className="bg-gray-50 w-1/2 overflow-x-auto">
            <div 
              ref={previewRef}
              className="bg-white rounded-lg shadow-sm origin-top"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: `${styles.margins.top}px ${styles.margins.right}px ${styles.margins.bottom}px ${styles.margins.left}px`,
                fontFamily: styles.fontFamily.english,
                fontSize: `${styles.fontSize}px`,
                lineHeight: styles.lineSpacing,
                transform: `scale(${0.7})`,
              }}
            >
              <div 
                className="prose prose-sm max-w-none"
                style={{
                  fontSize: `${styles.fontSize}px`,
                  lineHeight: styles.lineSpacing,
                  '--paragraph-spacing': `${styles.paragraphSpacing}px`,
                  '--theme-color': styles.themeColor,
                } as React.CSSProperties}
              >
                <ReactMarkdown 
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
      </div>

      {/* Chat Overlay */}
      {isChatOpen && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-lg">
          <div className="h-full flex flex-col">
            <div className="p-2 border-b flex justify-between items-center">
              <h3 className="font-semibold">AI Assistant</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ResumeChat 
                onResumeUpdate={setMarkdown}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <Button
          className="absolute bottom-4 right-4 rounded-full w-12 h-12 p-0"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
} 