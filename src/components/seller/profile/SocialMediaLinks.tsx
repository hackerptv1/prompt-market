import React from 'react';
import { Twitter, Youtube, Linkedin, ExternalLink } from 'lucide-react';

interface SocialMediaData {
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

interface SocialMediaLinksProps {
  socialMedia: SocialMediaData;
  isVisible: boolean;
}

export function SocialMediaLinks({ socialMedia, isVisible }: SocialMediaLinksProps) {
  if (!isVisible) return null;

  const socialLinks = [
    {
      platform: 'Twitter',
      url: socialMedia.twitter,
      icon: Twitter,
      color: 'text-blue-400 hover:text-blue-500',
      bgColor: 'hover:bg-blue-50'
    },
    {
      platform: 'YouTube',
      url: socialMedia.youtube,
      icon: Youtube,
      color: 'text-red-500 hover:text-red-600',
      bgColor: 'hover:bg-red-50'
    },
    {
      platform: 'LinkedIn',
      url: socialMedia.linkedin,
      icon: Linkedin,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'hover:bg-blue-50'
    }
  ];

  const availableLinks = socialLinks.filter(link => link.url);

  if (availableLinks.length === 0) {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-center">No social media links available</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Connect with me</h3>
      <div className="flex flex-wrap gap-3">
        {availableLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 transition-all duration-200 ${link.bgColor} ${link.color} hover:border-gray-300 hover:shadow-sm`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium">{link.platform}</span>
              <ExternalLink className="h-4 w-4 opacity-60" />
            </a>
          );
        })}
      </div>
    </div>
  );
} 