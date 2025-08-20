import React from 'react';
import { CategoryList } from './CategoryList';
import { SubcategoryList } from './SubcategoryList';
import { Plus } from 'lucide-react';

export function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryList />
        <SubcategoryList />
      </div>
    </div>
  );
}