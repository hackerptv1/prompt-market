import React from 'react';
import { Sparkles, Users, Shield, Zap, Star, TrendingUp } from 'lucide-react';

interface InfoSectionProps {
  variant: 'features' | 'benefits' | 'how-it-works' | 'trust';
}

export function InfoSection({ variant }: InfoSectionProps) {
  const sections = {
    features: {
      title: "Why Choose PromptMarket?",
      subtitle: "Discover the advantages of our AI prompt marketplace",
      items: [
        {
          icon: <Sparkles className="h-8 w-8 text-blue-600" />,
          title: "Curated Quality",
          description: "Every prompt is carefully reviewed and tested to ensure high-quality results"
        },
        {
          icon: <Users className="h-8 w-8 text-green-600" />,
          title: "Expert Community",
          description: "Join thousands of creators and professionals sharing their expertise"
        },
        {
          icon: <Zap className="h-8 w-8 text-yellow-600" />,
          title: "Instant Access",
          description: "Download and use prompts immediately across all major AI platforms"
        }
      ]
    },
    benefits: {
      title: "Transform Your Workflow",
      subtitle: "Unlock the full potential of AI with professional prompts",
      items: [
        {
          icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
          title: "Save Time & Money",
          description: "Skip the trial and error - get proven prompts that work from day one"
        },
        {
          icon: <Star className="h-8 w-8 text-orange-600" />,
          title: "Professional Results",
          description: "Access industry-tested prompts used by successful businesses worldwide"
        },
        {
          icon: <Shield className="h-8 w-8 text-indigo-600" />,
          title: "Risk-Free Guarantee",
          description: "Try any prompt with confidence - we stand behind every product"
        }
      ]
    },
    'how-it-works': {
      title: "How It Works",
      subtitle: "Get started in three simple steps",
      items: [
        {
          icon: <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>,
          title: "Browse & Discover",
          description: "Explore thousands of prompts across all categories and AI platforms"
        },
        {
          icon: <div className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>,
          title: "Choose & Purchase",
          description: "Select the perfect prompt for your needs and complete your purchase"
        },
        {
          icon: <div className="h-8 w-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>,
          title: "Use & Succeed",
          description: "Download your prompt and start creating amazing content immediately"
        }
      ]
    },
    trust: {
      title: "Trusted by Thousands",
      subtitle: "Join our growing community of satisfied users",
      items: [
        {
          icon: <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4.9</div>,
          title: "Average Rating",
          description: "Our prompts consistently receive top ratings from users worldwide"
        },
        {
          icon: <div className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">50K+</div>,
          title: "Active Users",
          description: "A thriving community of creators, marketers, and professionals"
        },
        {
          icon: <div className="h-8 w-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">24/7</div>,
          title: "Support Available",
          description: "Get help whenever you need it with our round-the-clock support team"
        }
      ]
    }
  };

  const section = sections[variant];

  return (
    <div className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{section.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {section.items.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
