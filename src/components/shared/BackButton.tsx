import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      <ChevronLeft className="h-5 w-5" />
      <span>Back</span>
    </button>
  );
}