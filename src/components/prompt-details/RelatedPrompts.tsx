import React from 'react';
import { PromptCard } from '../shared/PromptCard';
import { useRelatedPrompts } from '../../hooks/useRelatedPrompts';

interface RelatedPromptsProps {
  currentPromptId: string;
  category: string[];
}

export function RelatedPrompts({ currentPromptId, category }: RelatedPromptsProps) {
  const displayCategory = category.join(', ');
  const { prompts } = useRelatedPrompts(currentPromptId, category);

  if (!prompts.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Prompts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.slice(0, 3).map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}