'use client';

import { useState, useCallback } from 'react';
import ComparisonTemplates from './ComparisonTemplates';
import ComparisonOutput from './ComparisonOutput';
import Button from '../ui/Button';

export interface TextSelection {
  id: string;
  text: string;
  documentId: 'documentA' | 'documentB';
  sectionId: string;
  pageNumber?: number;
  category?: string;
  timestamp: number;
}

export interface ComparisonItem {
  id: string;
  documentA?: TextSelection;
  documentB?: TextSelection;
  userExplanation: string;
  title: string;
  template?: string;
  createdAt: number;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: 'scheduling' | 'pay' | 'benefits' | 'work_rules' | 'overtime' | 'sick_leave';
  icon: string;
  sections: {
    documentA: string[];
    documentB: string[];
  };
  suggestedQuestions: string[];
}

interface ComparisonToolProps {
  className?: string;
}

export default function ComparisonTool({ className = '' }: ComparisonToolProps) {
  const [selections, setSelections] = useState<TextSelection[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [activeComparison, setActiveComparison] = useState<ComparisonItem | null>(null);
  const [isTemplateMode, setIsTemplateMode] = useState<boolean>(true);

  const removeSelection = useCallback((selectionId: string) => {
    setSelections(prev => prev.filter(sel => sel.id !== selectionId));
  }, []);

  const createComparison = useCallback((
    documentASelection?: TextSelection,
    documentBSelection?: TextSelection,
    title: string = 'New Comparison',
    template?: string
  ) => {
    const newComparison: ComparisonItem = {
      id: crypto.randomUUID(),
      documentA: documentASelection,
      documentB: documentBSelection,
      userExplanation: '',
      title,
      template,
      createdAt: Date.now(),
    };
    setComparisons(prev => [...prev, newComparison]);
    setActiveComparison(newComparison);
  }, []);

  const updateComparison = useCallback((comparisonId: string, updates: Partial<ComparisonItem>) => {
    setComparisons(prev => 
      prev.map(comp => 
        comp.id === comparisonId ? { ...comp, ...updates } : comp
      )
    );
    
    if (activeComparison?.id === comparisonId) {
      setActiveComparison(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeComparison]);

  const deleteComparison = useCallback((comparisonId: string) => {
    setComparisons(prev => prev.filter(comp => comp.id !== comparisonId));
    if (activeComparison?.id === comparisonId) {
      setActiveComparison(null);
    }
  }, [activeComparison]);

  const handleTemplateSelect = useCallback((template: Template) => {
    createComparison(undefined, undefined, template.title, template.id);
    setIsTemplateMode(false);
  }, [createComparison]);

  const clearAllSelections = useCallback(() => {
    setSelections([]);
  }, []);

  if (isTemplateMode) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Comparison Templates</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose a template to get started, or create a custom comparison
              </p>
            </div>
            <Button
              onClick={() => setIsTemplateMode(false)}
              variant="outline"
              size="sm"
            >
              Custom Comparison
            </Button>
          </div>
          
          <ComparisonTemplates 
            onSelectTemplate={handleTemplateSelect}
            recentComparisons={comparisons}
            onLoadComparison={(comp: ComparisonItem) => {
              setActiveComparison(comp);
              setIsTemplateMode(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeComparison ? 'Edit Comparison' : 'Create Comparison'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select text from both contracts to create a side-by-side comparison
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsTemplateMode(true)}
              variant="outline"
              size="sm"
            >
              Templates
            </Button>
            {activeComparison && (
              <Button
                onClick={() => setActiveComparison(null)}
                variant="outline"
                size="sm"
              >
                New Comparison
              </Button>
            )}
          </div>
        </div>

        {/* Current Selections */}
        {selections.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Current Selections</h3>
              <Button
                onClick={clearAllSelections}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {selections.map((selection) => (
                <div
                  key={selection.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        selection.documentId === 'documentA' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selection.documentId === 'documentA' ? 'Current Contract' : 'Proposed Contract'}
                      </span>
                      {selection.pageNumber && (
                        <span className="text-xs text-gray-500">Page {selection.pageNumber}</span>
                      )}
                      {selection.category && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                          {selection.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-3">{selection.text}</p>
                  </div>
                  <button
                    onClick={() => removeSelection(selection.id)}
                    className="ml-3 text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove selection"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Comparison Editor */}
        {activeComparison && (
          <ComparisonOutput
            comparison={activeComparison}
            onUpdate={(updates: Partial<ComparisonItem>) => updateComparison(activeComparison.id, updates)}
            onDelete={() => deleteComparison(activeComparison.id)}
            selections={selections}
          />
        )}

        {/* Empty State */}
        {!activeComparison && selections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create Comparisons</h3>
            <p className="text-gray-600 mb-4">
              Start by selecting text in the contract documents, or choose a template above
            </p>
            <div className="text-sm text-gray-500">
              <p className="mb-2">💡 <strong>How to use:</strong></p>
              <ul className="space-y-1 text-left max-w-md mx-auto">
                <li>• Select text in either contract document</li>
                <li>• Create comparisons with your selections</li>
                <li>• Add explanations and share with colleagues</li>
                <li>• Use templates for common scenarios</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 