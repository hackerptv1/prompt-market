import React from 'react';
import { useParams } from 'react-router-dom';
import { PromptDetails } from '../components/prompt-details/PromptDetails';
import { RelatedPrompts } from '../components/prompt-details/RelatedPrompts';
import { usePrompt } from '../hooks/usePrompt';
import { BackButton } from '../components/shared/BackButton';

export function PromptDetailsPage() {
  const { id } = useParams();
  const { prompt, isLoading } = usePrompt(id);

  if (isLoading || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <BackButton />
        </div>
        <PromptDetails prompt={prompt} />
        <RelatedPrompts currentPromptId={prompt.id} category={prompt.category} />
        {/* To display: {prompt.category.join(', ')} */}
      </div>
    </div>
  );
}