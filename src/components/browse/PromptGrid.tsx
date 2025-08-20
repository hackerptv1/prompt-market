import React from 'react';
import type { Prompt } from '../../types';
import { PromptCard } from '../shared/PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
}

export function PromptGrid({ prompts }: PromptGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}