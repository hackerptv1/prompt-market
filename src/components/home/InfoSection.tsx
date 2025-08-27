import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Users, Shield, Zap, Star, TrendingUp } from 'lucide-react';

interface InfoSectionProps {
  variant: 'features' | 'benefits' | 'how-it-works' | 'trust';
}

export function InfoSection({ variant }: InfoSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
    <div 
      ref={sectionRef} 
      className={`py-16 bg-gray-50 relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'info-section-slide-up' : 'opacity-0 translate-y-20'
      }`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-12 transition-all duration-800 delay-300 ${
          isVisible ? 'info-section-fade-in' : 'opacity-0 translate-y-10'
        }`}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{section.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {section.items.map((item, index) => (
            <div 
              key={index} 
              className={`text-center p-6 rounded-xl transition-all duration-700 cursor-pointer info-card-hover ${
                isVisible 
                  ? `info-section-scale-in stagger-${index + 2}` 
                  : 'opacity-0 translate-y-10'
              } ${
                hoveredIndex === index 
                  ? 'transform scale-105 shadow-2xl bg-white border-2 border-blue-200 info-section-pulse' 
                  : 'bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-transparent hover:border-blue-100'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                animationDelay: isVisible ? `${0.5 + index * 0.2}s` : '0s'
              }}
            >
              <div className={`flex justify-center mb-4 transition-all duration-300 icon-bounce ${
                hoveredIndex === index ? 'transform scale-110 info-section-float' : ''
              }`}>
                {item.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-3 transition-all duration-300 ${
                hoveredIndex === index ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
              <p className={`leading-relaxed transition-all duration-300 ${
                hoveredIndex === index ? 'text-gray-700 font-medium' : 'text-gray-600'
              }`}>
                {item.description}
              </p>
              
              {/* Hover glow effect */}
              {hoveredIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl opacity-0 animate-pulse pointer-events-none"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
