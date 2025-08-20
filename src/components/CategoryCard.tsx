import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/browse?category=${category.id}`} className="block group">
      <div className="relative bg-white p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-600 bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
            {category.icon}
          </span>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-gray-900">{category.name}</h3>
        <div className="absolute inset-0 rounded-xl ring-1 ring-gray-200 group-hover:ring-blue-500 transition-all" />
      </div>
    </Link>
  );
}