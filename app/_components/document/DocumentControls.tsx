'use client';

import { useState, useEffect } from 'react';
import { useDocumentContext } from '../../_contexts/DocumentContext';
import { useDebounce } from '../../_hooks/useDebounce';
import Button from '../ui/Button';

interface DocumentControlsProps {
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'scheduling', label: 'Scheduling', color: 'bg-blue-100 text-blue-800', icon: '📅' },
  { value: 'pay', label: 'Pay & Compensation', color: 'bg-green-100 text-green-800', icon: '💰' },
  { value: 'benefits', label: 'Benefits', color: 'bg-purple-100 text-purple-800', icon: '🏥' },
  { value: 'work_rules', label: 'Work Rules', color: 'bg-orange-100 text-orange-800', icon: '📋' },
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-800', icon: '📄' },
];

export default function DocumentControls({ className = '' }: DocumentControlsProps) {
  const { searchTerm, categoryFilter, setSearchTerm, setCategoryFilter } = useDocumentContext();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Debounce the search term with 300ms delay
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Update the context when debounced term changes
  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Sync local state with context when context changes externally
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleCategoryToggle = (category: string) => {
    const isSelected = categoryFilter.includes(category);
    if (isSelected) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };

  const handleClearFilters = () => {
    setLocalSearchTerm('');
    setCategoryFilter([]);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
  };

  const hasActiveFilters = localSearchTerm.length > 0 || categoryFilter.length > 0;

  return (
    <div className={`bg-white border-b border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search contract content..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label="Search contract content"
        />
        {localSearchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Filter by Category</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((category) => {
            const isSelected = categoryFilter.includes(category.value);
            return (
              <button
                key={category.value}
                onClick={() => handleCategoryToggle(category.value)}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${isSelected 
                    ? `${category.color} ring-2 ring-offset-1 ring-current shadow-sm` 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                  }
                `}
                aria-pressed={isSelected}
                aria-label={`Filter by ${category.label}`}
              >
                <span className="mr-1" aria-hidden="true">{category.icon}</span>
                {category.label}
                {isSelected && (
                  <span className="ml-1" aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active filters summary */}
        {categoryFilter.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Showing {categoryFilter.length} categor{categoryFilter.length === 1 ? 'y' : 'ies'}
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="text-xs text-gray-500 border-t pt-2 space-y-1">
          {localSearchTerm !== searchTerm && (
            <div className="text-blue-500">🔍 Searching...</div>
          )}
          <div>
            Search: <span className="font-medium">&ldquo;{searchTerm}&rdquo;</span>
          </div>
          <div className="text-orange-600">
            💡 Tip: Page numbers are shown with each result for easy PDF reference
          </div>
        </div>
      )}
    </div>
  );
} 