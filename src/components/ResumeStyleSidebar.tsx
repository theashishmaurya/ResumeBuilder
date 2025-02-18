import React, { ChangeEvent } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

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

interface ResumeStyleSidebarProps {
  styles: ResumeStyles;
  onStyleChange: <K extends keyof ResumeStyles>(key: K, value: ResumeStyles[K]) => void;
  onExportPDF: () => void;
}

export function ResumeStyleSidebar({ styles, onStyleChange, onExportPDF }: ResumeStyleSidebarProps) {
  return (
    <div className="w-72 border-r bg-background p-4 space-y-6 overflow-auto h-[calc(100vh-6rem)]">
      <div>
        <h3 className="text-sm font-medium mb-4">Import / Export</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <span className="mr-2">📄</span> Import Markdown
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={onExportPDF}>
            <span className="mr-2">📑</span> Export PDF
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <span className="mr-2">📝</span> Export Markdown
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Paper Size</h3>
        <Select defaultValue="a4">
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a4">A4</SelectItem>
            <SelectItem value="letter">Letter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Theme Color</h3>
        <div className="grid grid-cols-6 gap-2 mb-2">
          {['#000000', '#2563eb', '#dc2626', '#ea580c', '#9333ea', '#16a34a'].map(color => (
            <Button
              key={color}
              className={`w-8 h-8 rounded-md ${styles.themeColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onStyleChange('themeColor', color)}
            />
          ))}
        </div>
        <Input
          type="text"
          value={styles.themeColor}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onStyleChange('themeColor', e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Font Family</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">CJK</label>
            <Select 
              value={styles.fontFamily.cjk} 
              onValueChange={(value: string) => onStyleChange('fontFamily', { ...styles.fontFamily, cjk: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="华康宋体">华康宋体</SelectItem>
                <SelectItem value="思源黑体">思源黑体</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">English</label>
            <Select 
              value={styles.fontFamily.english} 
              onValueChange={(value: string) => onStyleChange('fontFamily', { ...styles.fontFamily, english: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Font Size</h3>
        <Slider
          value={[styles.fontSize]}
          onValueChange={([value]: [number]) => onStyleChange('fontSize', value)}
          min={12}
          max={20}
          step={1}
          className="w-full"
        />
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {styles.fontSize}px
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Margins</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Top & Bottom</label>
            <Slider
              value={[styles.margins.top]}
              onValueChange={([value]: [number]) => onStyleChange('margins', { ...styles.margins, top: value, bottom: value })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="mt-1 text-xs text-muted-foreground text-center">
              {styles.margins.top}px
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Left & Right</label>
            <Slider
              value={[styles.margins.left]}
              onValueChange={([value]: [number]) => onStyleChange('margins', { ...styles.margins, left: value, right: value })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="mt-1 text-xs text-muted-foreground text-center">
              {styles.margins.left}px
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Paragraph Spacing</h3>
        <Slider
          value={[styles.paragraphSpacing]}
          onValueChange={([value]: [number]) => onStyleChange('paragraphSpacing', value)}
          min={0}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {styles.paragraphSpacing}px
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-4">Line Spacing</h3>
        <Slider
          value={[styles.lineSpacing * 10]}
          onValueChange={([value]: [number]) => onStyleChange('lineSpacing', value / 10)}
          min={10}
          max={30}
          step={1}
          className="w-full"
        />
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {styles.lineSpacing.toFixed(1)}
        </div>
      </div>
    </div>
  );
} 