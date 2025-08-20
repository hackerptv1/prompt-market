import React from 'react';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { SearchBar } from './SearchBar';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Gradient Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
        <div className="text-center space-y-8 sm:space-y-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              AI Prompt Marketplace
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
            Discover, buy, and sell high-quality AI prompts. Boost your creativity and productivity with our curated collection.
          </p>

          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-800">10k+ Prompts</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-800">5k+ Users</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-800">500+ Sales/day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}