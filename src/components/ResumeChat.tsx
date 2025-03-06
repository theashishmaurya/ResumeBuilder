'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ResumeAIService } from '@/lib/resume-ai-service';
import { KnowledgeBaseService } from '@/lib/knowledge-base';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ResumeChatProps {
  onResumeUpdate?: (markdown: string) => void;
}

export function ResumeChat({ onResumeUpdate }: ResumeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [resumeUpdated, setResumeUpdated] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resumeAI = ResumeAIService.getInstance();
  const knowledgeBase = KnowledgeBaseService.getInstance();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear resume updated notification after 5 seconds
  useEffect(() => {
    if (resumeUpdated) {
      const timer = setTimeout(() => {
        setResumeUpdated(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [resumeUpdated]);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Add initial welcome message when component mounts
  useEffect(() => {
    const knowledge = knowledgeBase.getUserKnowledgeBase();
    
    let welcomeMessage = 'Hi! I\'m your AI resume assistant. How can I help you with your resume today?';
    
    if (knowledge) {
      const hasData = knowledge.experiences || knowledge.education || knowledge.skills || knowledge.jobDescriptions.length > 0;
      
      if (hasData) {
        welcomeMessage += ' I can use the information from your knowledge base to provide personalized assistance.';
      } else {
        welcomeMessage += ' You might want to fill out your knowledge base to get more personalized assistance.';
      }
    }
    
    welcomeMessage += '\n\n**Try these example prompts**:\n- "Create a resume for a software engineer position"\n- "Help me highlight my leadership skills"\n- "How can I improve my work experience section?"\n- "Update my resume based on the latest job description"\n- "Make my skills section more impactful"\n\nI\'ll preserve your personal information and education details while improving the other sections.';
    
    setMessages([{
      role: 'assistant',
      content: welcomeMessage
    }]);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    // Clear any previous errors
    setChatError(null);
    setResumeUpdated(false);

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Show typing indicator by adding a temporary message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `<div class="typing-indicator">Thinking<span>.</span><span>.</span><span>.</span></div>`
      }]);

      const response = await resumeAI.generateChat({
        message: input,
        history: messages.filter(msg => !msg.content.includes('typing-indicator')) // Filter out typing indicators from history
      });

      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.content.includes('typing-indicator'));
        return [...filtered, {
          role: 'assistant',
          content: response.content
        }];
      });
      
      // Update the resume if a markdown resume was generated
      if (onResumeUpdate && response.resumeMarkdown) {
        console.log('Updating resume with AI-generated content');
        onResumeUpdate(response.resumeMarkdown);
        setResumeUpdated(true);
      }
    } catch (error: unknown) {
      console.error('Error generating response:', error);
      
      // Remove typing indicator if there was an error
      setMessages(prev => prev.filter(msg => !msg.content.includes('typing-indicator')));
      
      // Check for specific API key error
      if (error instanceof Error && error.message.includes('API key')) {
        setChatError('OpenAI API key is missing or invalid. Please check your .env.local file.');
        
        const errorMessage: Message = {
          role: 'assistant',
          content: `
## API Key Missing

The OpenAI API key is missing or invalid. To fix this:

1. Create or edit the \`.env.local\` file in the project root
2. Add your OpenAI API key:
\`\`\`
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
\`\`\`
3. Restart the development server

You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys).
`
        };
        setMessages(prev => [...prev.filter(msg => !msg.content.includes('typing-indicator')), errorMessage]);
      } else {
        setChatError('Failed to get a response from the AI. Please try again.');
        
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please check your internet connection and try again.'
        };
        setMessages(prev => [...prev.filter(msg => !msg.content.includes('typing-indicator')), errorMessage]);
      }
    } finally {
      setIsLoading(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  className="prose dark:prose-invert max-w-none"
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {chatError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>{chatError}</span>
        </div>
      )}

      {resumeUpdated && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 flex items-center gap-2 text-sm animate-pulse">
          <CheckCircle2 size={16} />
          <span>Resume has been updated with the tailored content while preserving your personal information!</span>
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message... (e.g., 'Create a resume for a software engineer position')"
            className="flex-1 min-h-[60px]"
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="self-end h-[60px] px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Thinking...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try asking for resume advice or requesting a tailored resume for a specific job position.
        </p>
      </div>

      <style jsx global>{`
        .typing-indicator {
          display: inline-flex;
          align-items: center;
        }
        .typing-indicator span {
          animation: blink 1.4s infinite both;
          height: 5px;
          width: 5px;
          margin: 0 1px;
          background: currentColor;
          display: inline-block;
          border-radius: 50%;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0% { opacity: 0.1; }
          20% { opacity: 1; }
          100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
} 