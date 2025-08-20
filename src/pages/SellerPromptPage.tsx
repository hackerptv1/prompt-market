import React from 'react';
import { useParams } from 'react-router-dom';
import { PromptStats } from '../components/seller/prompt/PromptStats';
import { PromptForm } from '../components/seller/prompt/PromptForm';
import { PromptRatings } from '../components/seller/prompt/PromptRatings';

export function SellerPromptPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PromptForm promptId={id} />
            <PromptRatings promptId={id} />
          </div>
          <div className="lg:col-span-1">
            <PromptStats promptId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}