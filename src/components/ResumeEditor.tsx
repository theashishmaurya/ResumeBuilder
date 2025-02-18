"use client";

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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

const defaultTemplate = `# Bruce Wayne

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
  const [markdown, setMarkdown] = useState(defaultTemplate);
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
    <div className="flex h-full border-2">
      <ResumeStyleSidebar 
        styles={styles}
        onStyleChange={updateStyle}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content */}
      <div className="flex-1 flex border-2">
        {/* Editor Section */}
        <div className="w-1/2 p-4 border-r">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Markdown Editor</h2>
          </div>
          <textarea
            value={markdown}
            onChange={handleChange}
            className="h-[calc(100vh-8rem)] w-full resize-none rounded-md border p-4 font-mono bg-white"
            placeholder="Enter your Markdown here..."
          />
        </div>
        
        {/* Preview Section */}
        <div className="w-1/2 p-4 bg-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
          </div>
          <div className="overflow-auto h-[calc(100vh-8rem)]">
            <div 
              ref={previewRef}
              className="bg-white"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: `${styles.margins.top}px ${styles.margins.right}px ${styles.margins.bottom}px ${styles.margins.left}px`,
                fontFamily: styles.fontFamily.english,
                fontSize: `${styles.fontSize}px`,
                lineHeight: styles.lineSpacing,
              }}
            >
              <div 
                className="prose prose-sm max-w-none [&_h1]:text-[color:var(--theme-color)] [&_h2]:text-[color:var(--theme-color)] [&_h3]:text-[color:var(--theme-color)]"
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
      </div>
    </div>
  );
} 