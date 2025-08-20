import React from 'react';
import { CategoryCard } from './CategoryCard';
import { Sparkles, Palette, GraduationCap, PenTool, Code, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategoryList() {
  const categories = [
    { id: 'marketing', name: 'Marketing', icon: <Sparkles className="h-6 w-6" /> },
    { id: 'art', name: 'Art & Design', icon: <Palette className="h-6 w-6" /> },
    { id: 'education', name: 'Education', icon: <GraduationCap className="h-6 w-6" /> },
    { id: 'writing', name: 'Writing', icon: <PenTool className="h-6 w-6" /> },
    { id: 'development', name: 'Development', icon: <Code className="h-6 w-6" /> },
  ];

  return (
    <div className="py-6 sm:py-8 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse by Category</h2>
          <Link 
            to="/browse" 
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}