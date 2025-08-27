import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  Zap, 
  Shield, 
  Globe, 
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

export function AboutUsPage() {
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // SEO structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PromptMarket",
    "url": "https://promptmarket.com",
    "logo": "https://promptmarket.com/logo.png",
    "description": "Empowering creators and users with the world's most advanced AI prompt marketplace. Connect with talented creators and access high-quality prompts for AI platforms.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/promptmarket",
      "https://linkedin.com/company/promptmarket"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@promptmarket.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "AI Prompts Marketplace",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Prompt Marketplace",
            "description": "Buy and sell high-quality AI prompts for various platforms"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Consultation Services",
            "description": "Expert consultation services for AI implementation"
          }
        }
      ]
    }
  };

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" aria-hidden="true" />,
      title: "User-Centric",
      description: "We put our users first, ensuring every feature and decision enhances their experience."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" aria-hidden="true" />,
      title: "Trust & Security",
      description: "Your data and transactions are protected with enterprise-grade security measures."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" aria-hidden="true" />,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge AI solutions and features."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" aria-hidden="true" />,
      title: "Global Community",
      description: "Connecting creators and users worldwide to share knowledge and expertise."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: <Users className="h-6 w-6" aria-hidden="true" /> },
    { number: "5K+", label: "Quality Prompts", icon: <Star className="h-6 w-6" aria-hidden="true" /> },
    { number: "500+", label: "Expert Sellers", icon: <Award className="h-6 w-6" aria-hidden="true" /> },
    { number: "50+", label: "AI Platforms", icon: <Zap className="h-6 w-6" aria-hidden="true" /> }
  ];

  const features = [
    "Advanced AI prompt marketplace",
    "Secure payment processing",
    "Expert consultation services",
    "Multi-platform AI support",
    "Quality assurance system",
    "24/7 customer support"
  ];

  return (
    <>
      <Helmet>
        <title>About PromptMarket - Leading AI Prompt Marketplace | Empowering AI Creators</title>
        <meta name="description" content="Discover PromptMarket, the world's leading AI prompt marketplace. Learn about our mission to empower creators and users with advanced AI solutions, secure transactions, and expert consultation services." />
        <meta name="keywords" content="AI prompt marketplace, artificial intelligence, AI prompts, ChatGPT prompts, AI consultation, prompt engineering, AI tools, machine learning, AI creators, AI marketplace" />
        <meta name="author" content="PromptMarket" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://promptmarket.com/about" />
        <meta property="og:title" content="About PromptMarket - Leading AI Prompt Marketplace" />
        <meta property="og:description" content="Empowering creators and users with the world's most advanced AI prompt marketplace. Join thousands of AI enthusiasts and creators." />
        <meta property="og:image" content="https://promptmarket.com/og-image.jpg" />
        <meta property="og:site_name" content="PromptMarket" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://promptmarket.com/about" />
        <meta property="twitter:title" content="About PromptMarket - Leading AI Prompt Marketplace" />
        <meta property="twitter:description" content="Empowering creators and users with the world's most advanced AI prompt marketplace. Join thousands of AI enthusiasts and creators." />
        <meta property="twitter:image" content="https://promptmarket.com/twitter-image.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://promptmarket.com/about" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PromptMarket" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <main ref={sectionRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <section className={`relative overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="hero-heading">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" aria-hidden="true"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" aria-hidden="true"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" aria-hidden="true"></div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <h1 
                id="hero-heading"
                className={`text-4xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-800 delay-300 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                About <span className="text-blue-600">PromptMarket</span>
              </h1>
              <p className={`text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 transition-all duration-800 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                Empowering creators and users with the world's most advanced AI prompt marketplace
              </p>
              <div className={`flex justify-center transition-all duration-800 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold">
                    <Target className="h-5 w-5" aria-hidden="true" />
                    <span>Revolutionizing AI Content Creation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="stats-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="stats-heading" className="sr-only">PromptMarket Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <article
                  key={index}
                  className={`text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 transition-all duration-700 ${
                    isVisible ? `opacity-100 translate-y-0` : 'opacity-0 translate-y-10'
                  }`}
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className={`py-16 bg-white/50 backdrop-blur-sm transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="mission-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <article>
                <h2 id="mission-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  At PromptMarket, we believe that AI should be accessible to everyone. Our mission is to create 
                  the world's most comprehensive marketplace for AI prompts, connecting talented creators with 
                  users who need high-quality, effective prompts for their AI platforms.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  We're building more than just a marketplace – we're fostering a global community where 
                  knowledge sharing, innovation, and collaboration drive the future of AI content creation.
                </p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <span>Join our mission</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </div>
              </article>
              <aside className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                  <Lightbulb className="h-12 w-12 mb-6 text-yellow-300" aria-hidden="true" />
                  <h3 className="text-2xl font-bold mb-4">Innovation at Every Step</h3>
                  <p className="text-blue-100 leading-relaxed">
                    We're constantly pushing the boundaries of what's possible with AI, 
                    ensuring our platform stays ahead of the curve and delivers exceptional value to our community.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className={`py-16 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="values-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h2 id="values-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                These core values guide everything we do and shape the future of our platform
              </p>
            </header>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <article
                  key={index}
                  className={`text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 transition-all duration-700 cursor-pointer hover:shadow-xl hover:scale-105 ${
                    isVisible ? `opacity-100 translate-y-0` : 'opacity-0 translate-y-10'
                  } ${
                    hoveredIndex === index ? 'transform scale-105 shadow-2xl border-blue-200' : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ animationDelay: `${1 + index * 0.1}s` }}
                >
                  <div className={`flex justify-center mb-4 transition-all duration-300 ${
                    hoveredIndex === index ? 'transform scale-110' : ''
                  }`}>
                    {value.icon}
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 transition-all duration-300 ${
                    hoveredIndex === index ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-16 bg-white/50 backdrop-blur-sm transition-all duration-1000 delay-900 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <article>
                <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  What Makes Us Different
                </h2>
                <ul className="space-y-4" role="list">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-3 transition-all duration-700 ${
                        isVisible ? `opacity-100 translate-x-0` : 'opacity-0 -translate-x-10'
                      }`}
                      style={{ animationDelay: `${1.2 + index * 0.1}s` }}
                    >
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <aside className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
                  <TrendingUp className="h-12 w-12 mb-6 text-green-300" aria-hidden="true" />
                  <h3 className="text-2xl font-bold mb-4">Growing Together</h3>
                  <p className="text-green-100 leading-relaxed">
                    Our platform grows with our community. Every feature, every improvement, 
                    and every decision is made with our users' success in mind.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 transition-all duration-1000 delay-1100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`} aria-labelledby="cta-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and users who are already transforming their AI experience 
              with PromptMarket. Start exploring, creating, and innovating today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/browse" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
                aria-label="Start browsing AI prompts on PromptMarket"
              >
                Start Browsing
              </a>
              <a 
                href="/auth" 
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold inline-block"
                aria-label="Sign up for PromptMarket account"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
