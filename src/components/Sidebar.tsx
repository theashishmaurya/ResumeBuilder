"use client";

import React from 'react';

const sections = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: ['Name', 'Email', 'Phone', 'Location']
  },
  {
    id: 'education',
    title: 'Education',
    fields: ['University', 'Degree', 'Major', 'GPA', 'Graduation Date']
  },
  {
    id: 'experience',
    title: 'Experience',
    fields: ['Company', 'Position', 'Duration', 'Responsibilities']
  },
  {
    id: 'skills',
    title: 'Skills',
    fields: ['Technical Skills', 'Soft Skills', 'Languages']
  },
  {
    id: 'projects',
    title: 'Projects',
    fields: ['Project Name', 'Description', 'Technologies', 'Link']
  }
];

export function Sidebar() {
  const handleSectionClick = (sectionId: string) => {
    // TODO: Implement section editing logic
    console.log('Selected section:', sectionId);
  };

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
      <div className="h-full py-6 pl-8 pr-6 lg:py-8">
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="cursor-pointer space-y-2"
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="font-semibold hover:text-blue-600 transition-colors">
                {section.title}
              </div>
              <div className="pl-4 text-sm text-gray-500">
                {section.fields.map((field) => (
                  <div key={field} className="py-1">
                    {field}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
} 