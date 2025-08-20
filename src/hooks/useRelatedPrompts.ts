import { useState, useEffect } from 'react';
import type { Prompt } from '../types';
import { mockRelatedPrompts } from '../utils/mockData';

export function useRelatedPrompts(currentPromptId: string, categories: string[]) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPrompts(mockRelatedPrompts);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPromptId, categories]);

  return { prompts };
}