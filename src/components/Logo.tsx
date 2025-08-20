import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  asLink?: boolean;
}

export function Logo({ asLink = true }: LogoProps) {
  const LogoContent = (
    <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
      <div className="relative">
        <Sparkles className="h-7 w-7" />
        <div className="absolute inset-0 bg-blue-600/10 rounded-lg animate-pulse" />
      </div>
      <span className="text-xl font-bold">PromptMarket</span>
    </div>
  );

  if (asLink) {
    return <Link to="/">{LogoContent}</Link>;
  }

  return LogoContent;
}