import React from 'react';
import Select from 'react-select';
import { useFilters } from '../../../contexts/FilterContext';

export function CategoryFilter() {
  const {
    categories,
    subcategories,
    localSelectedCategories,
    localSelectedSubcategories,
    setLocalSelectedCategories,
    setLocalSelectedSubcategories,
    isLoading,
    error
  } = useFilters();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }));

  const subcategoryOptions = subcategories.map(subcategory => ({
    value: subcategory.id,
    label: subcategory.name
  }));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Categories
      </label>
      <Select
        isMulti
        options={categoryOptions}
        value={categoryOptions.filter(opt => localSelectedCategories.includes(opt.value))}
        onChange={opts => setLocalSelectedCategories(opts.map(opt => opt.value))}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select categories..."
      />

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">
          Subcategories
        </label>
        <Select
          isMulti
          options={localSelectedCategories.length > 0 ? subcategoryOptions : []}
          value={subcategoryOptions.filter(opt => localSelectedSubcategories.includes(opt.value))}
          onChange={opts => setLocalSelectedSubcategories(opts.map(opt => opt.value))}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder={localSelectedCategories.length > 0 ? "Select subcategories..." : "Select categories first"}
          isDisabled={localSelectedCategories.length === 0}
        />
      </div>
    </div>
  );
}