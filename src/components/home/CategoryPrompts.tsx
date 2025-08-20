import React from 'react';
import { PromptCard } from '../shared/PromptCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Prompt } from '../../types';

interface CategoryPromptsProps {
  title: string;
  prompts: Prompt[];
}

export function CategoryPrompts({ title, prompts }: CategoryPromptsProps) {
  return (
    <div className="py-12 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          <Link 
            to="/browse" 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            View all
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </div>
  );
}