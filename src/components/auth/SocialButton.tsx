import React from 'react';

interface SocialButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

export function SocialButton({ icon, text, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}