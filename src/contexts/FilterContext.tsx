import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

interface Platform {
  id: string;
  platform_name: string;
  logo_url: string;
}

interface FilterContextType {
  categories: Category[];
  subcategories: Subcategory[];
  aiPlatforms: Platform[];
  automationPlatforms: Platform[];
  // Local (unapplied) filter state
  localSelectedCategories: string[];
  localSelectedSubcategories: string[];
  localSelectedPlatform: string | null;
  localPriceRange: [number, number];
  localSortBy: string;
  setLocalSelectedCategories: (categories: string[]) => void;
  setLocalSelectedSubcategories: (subcategories: string[]) => void;
  setLocalSelectedPlatform: (platform: string | null) => void;
  setLocalPriceRange: (range: [number, number]) => void;
  setLocalSortBy: (sort: string) => void;
  // Applied filter state
  selectedCategories: string[];
  selectedSubcategories: string[];
  selectedPlatform: string | null;
  priceRange: [number, number];
  sortBy: string;
  isLoading: boolean;
  error: string | null;
  applyFilters: () => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [aiPlatforms, setAIPlatforms] = useState<Platform[]>([]);
  const [automationPlatforms, setAutomationPlatforms] = useState<Platform[]>([]);
  // Local (unapplied) filter state
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>([]);
  const [localSelectedSubcategories, setLocalSelectedSubcategories] = useState<string[]>([]);
  const [localSelectedPlatform, setLocalSelectedPlatform] = useState<string | null>(null);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([0, 1000]);
  const [localSortBy, setLocalSortBy] = useState<string>('newest');
  // Applied filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get URL parameters
  const getUrlParams = () => {
    if (typeof window === 'undefined') return {};
    const urlParams = new URLSearchParams(window.location.search);
    return {
      category: urlParams.get('category'),
      subcategory: urlParams.get('subcategory'),
      platform: urlParams.get('platform'),
      priceMin: urlParams.get('priceMin'),
      priceMax: urlParams.get('priceMax'),
      sort: urlParams.get('sort'),
    };
  };

  // Function to find category ID by name
  const findCategoryIdByName = (categoryName: string) => {
    const category = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return category?.id;
  };

  // Function to find subcategory ID by name
  const findSubcategoryIdByName = (subcategoryName: string) => {
    const subcategory = subcategories.find(sub => 
      sub.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    return subcategory?.id;
  };

  // Function to find platform ID by name
  const findPlatformIdByName = (platformName: string) => {
    const platform = aiPlatforms.find(p => 
      p.platform_name.toLowerCase() === platformName.toLowerCase()
    ) || automationPlatforms.find(p => 
      p.platform_name.toLowerCase() === platformName.toLowerCase()
    );
    return platform?.id;
  };

  // Apply URL parameters when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && aiPlatforms.length > 0 && automationPlatforms.length > 0) {
      const urlParams = getUrlParams();
      
      if (urlParams.category) {
        const categoryId = findCategoryIdByName(urlParams.category);
        if (categoryId) {
          setLocalSelectedCategories([categoryId]);
          setSelectedCategories([categoryId]);
        }
      }

      if (urlParams.subcategory) {
        const subcategoryId = findSubcategoryIdByName(urlParams.subcategory);
        if (subcategoryId) {
          setLocalSelectedSubcategories([subcategoryId]);
          setSelectedSubcategories([subcategoryId]);
        }
      }

      if (urlParams.platform) {
        const platformId = findPlatformIdByName(urlParams.platform);
        if (platformId) {
          setLocalSelectedPlatform(platformId);
          setSelectedPlatform(platformId);
        }
      }

      if (urlParams.priceMin || urlParams.priceMax) {
        const min = urlParams.priceMin ? parseInt(urlParams.priceMin) : 0;
        const max = urlParams.priceMax ? parseInt(urlParams.priceMax) : 1000;
        setLocalPriceRange([min, max]);
        setPriceRange([min, max]);
      }

      if (urlParams.sort) {
        setLocalSortBy(urlParams.sort);
        setSortBy(urlParams.sort);
      }
    }
  }, [categories, aiPlatforms, automationPlatforms]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch AI platforms
        const { data: aiPlatformsData, error: aiPlatformsError } = await supabase
          .from('ai_platform_logos')
          .select('*')
          .order('platform_name');
        if (aiPlatformsError) throw aiPlatformsError;
        setAIPlatforms(aiPlatformsData || []);

        // Fetch automation platforms
        const { data: automationPlatformsData, error: automationPlatformsError } = await supabase
          .from('automation_platform_logos')
          .select('*')
          .order('platform_name');
        if (automationPlatformsError) throw automationPlatformsError;
        setAutomationPlatforms(automationPlatformsData || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load filter data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchSubcategories() {
      if (!localSelectedCategories.length) {
        setSubcategories([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('subcategories')
          .select('*')
          .in('category_id', localSelectedCategories)
          .order('name');
        if (error) throw error;
        setSubcategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subcategories');
      }
    }
    fetchSubcategories();
  }, [localSelectedCategories]);

  const applyFilters = () => {
    setSelectedCategories(localSelectedCategories);
    setSelectedSubcategories(localSelectedSubcategories);
    setSelectedPlatform(localSelectedPlatform);
    setPriceRange(localPriceRange);
    setSortBy(localSortBy);
  };

  const resetFilters = () => {
    setLocalSelectedCategories([]);
    setLocalSelectedSubcategories([]);
    setLocalSelectedPlatform(null);
    setLocalPriceRange([0, 1000]);
    setLocalSortBy('newest');
    setTimeout(() => {
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setSelectedPlatform(null);
      setPriceRange([0, 1000]);
      setSortBy('newest');
    }, 0);
  };

  const value = {
    categories,
    subcategories,
    aiPlatforms,
    automationPlatforms,
    localSelectedCategories,
    localSelectedSubcategories,
    localSelectedPlatform,
    localPriceRange,
    localSortBy,
    setLocalSelectedCategories,
    setLocalSelectedSubcategories,
    setLocalSelectedPlatform,
    setLocalPriceRange,
    setLocalSortBy,
    selectedCategories,
    selectedSubcategories,
    selectedPlatform,
    priceRange,
    sortBy,
    isLoading,
    error,
    applyFilters,
    resetFilters,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
} 