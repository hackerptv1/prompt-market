import React from 'react';
import type { Prompt } from '../../types';

interface PromptInfoProps {
  prompt: Prompt;
}

export function PromptInfo({ prompt }: PromptInfoProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{prompt.description}</p>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Requirements</h3>
        {prompt.requirements ? (
          <p className="text-gray-600 whitespace-pre-wrap">{prompt.requirements}</p>
        ) : (
          <p className="text-gray-500 italic">No specific requirements listed</p>
        )}
      </div>

      {/* What's Included */}
      <div>
        <h3 className="text-lg font-semibold mb-2">What's Included</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Detailed prompt template</li>
          <li>Step-by-step instructions</li>
          <li>Best practices guide</li>
          <li>Example outputs</li>
          <li>Lifetime updates</li>
        </ul>
      </div>
    </div>
  );
}