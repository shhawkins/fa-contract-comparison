'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDocumentContext } from '../../_contexts/DocumentContext';
import Button from '../ui/Button';

interface DiffSection {
  id: string;
  currentText?: string;
  proposedText?: string;
  diffType: 'added' | 'removed' | 'modified' | 'unchanged';
  category: string;
  pageNumberCurrent?: number;
  pageNumberProposed?: number;
  importance: 'high' | 'medium' | 'low';
  title: string;
}

interface DiffVisualizationProps {
  className?: string;
  selectedCategory?: string;
  importanceFilter?: string[];
}

export default function DiffVisualization({ 
  className = '',
  selectedCategory,
  importanceFilter = ['high', 'medium', 'low']
}: DiffVisualizationProps) {
  const { documentA, documentB, isLoading } = useDocumentContext();
  const [diffSections, setDiffSections] = useState<DiffSection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedDiffType, setSelectedDiffType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  // Advanced diff algorithm to compare sections between documents
  const generateDiffSections = useMemo(() => {
    if (!documentA || !documentB) return [];

    setIsAnalyzing(true);
    const diffs: DiffSection[] = [];
    
    // Create maps for faster lookups
    const docAMap = new Map(documentA.sections.map(s => [s.id, s]));
    const docBMap = new Map(documentB.sections.map(s => [s.id, s]));
    
    // Find sections that exist in both documents
    const allSectionIds = new Set([
      ...documentA.sections.map(s => s.id),
      ...documentB.sections.map(s => s.id)
    ]);

    allSectionIds.forEach(sectionId => {
      const sectionA = docAMap.get(sectionId);
      const sectionB = docBMap.get(sectionId);
      
      if (sectionA && sectionB) {
        // Both sections exist - check for modifications
        const isModified = sectionA.content.trim() !== sectionB.content.trim();
        diffs.push({
          id: sectionId,
          currentText: sectionA.content,
          proposedText: sectionB.content,
          diffType: isModified ? 'modified' : 'unchanged',
          category: sectionA.metadata.category,
          pageNumberCurrent: sectionA.originalPage,
          pageNumberProposed: sectionB.originalPage,
          importance: sectionA.metadata.importance,
          title: `Section ${sectionA.originalPage || 'Unknown'} - ${sectionA.metadata.category}`
        });
      } else if (sectionA && !sectionB) {
        // Section removed in proposed contract
        diffs.push({
          id: sectionId,
          currentText: sectionA.content,
          proposedText: undefined,
          diffType: 'removed',
          category: sectionA.metadata.category,
          pageNumberCurrent: sectionA.originalPage,
          importance: sectionA.metadata.importance,
          title: `Section ${sectionA.originalPage || 'Unknown'} - ${sectionA.metadata.category} (REMOVED)`
        });
      } else if (!sectionA && sectionB) {
        // Section added in proposed contract
        diffs.push({
          id: sectionId,
          currentText: undefined,
          proposedText: sectionB.content,
          diffType: 'added',
          category: sectionB.metadata.category,
          pageNumberProposed: sectionB.originalPage,
          importance: sectionB.metadata.importance,
          title: `Section ${sectionB.originalPage || 'Unknown'} - ${sectionB.metadata.category} (NEW)`
        });
      }
    });

    // Sort by importance and page number
    diffs.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      }
      return (a.pageNumberCurrent || a.pageNumberProposed || 0) - (b.pageNumberCurrent || b.pageNumberProposed || 0);
    });

    setIsAnalyzing(false);
    return diffs;
  }, [documentA, documentB]);

  useEffect(() => {
    setDiffSections(generateDiffSections);
  }, [generateDiffSections]);

  // Filter diffs based on selected criteria
  const filteredDiffs = useMemo(() => {
    return diffSections.filter(diff => {
      // Filter by category
      if (selectedCategory && selectedCategory !== 'all' && diff.category !== selectedCategory) {
        return false;
      }
      
      // Filter by importance
      if (!importanceFilter.includes(diff.importance)) {
        return false;
      }
      
      // Filter by diff type
      if (selectedDiffType !== 'all' && diff.diffType !== selectedDiffType) {
        return false;
      }
      
      return true;
    });
  }, [diffSections, selectedCategory, importanceFilter, selectedDiffType]);

  const getDiffTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-50 border-green-200 text-green-900';
      case 'removed': return 'bg-red-50 border-red-200 text-red-900';
      case 'modified': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getDiffTypeIcon = (type: string) => {
    switch (type) {
      case 'added': return '✅';
      case 'removed': return '❌';
      case 'modified': return '⚠️';
      default: return '📄';
    }
  };

  const diffStats = useMemo(() => {
    const stats = {
      added: diffSections.filter(d => d.diffType === 'added').length,
      removed: diffSections.filter(d => d.diffType === 'removed').length,
      modified: diffSections.filter(d => d.diffType === 'modified').length,
      unchanged: diffSections.filter(d => d.diffType === 'unchanged').length,
      total: 0
    };
    stats.total = stats.added + stats.removed + stats.modified + stats.unchanged;
    return stats;
  }, [diffSections]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contracts for comparison...</p>
        </div>
      </div>
    );
  }

  if (!documentA || !documentB) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No Contracts Available</h3>
          <p className="text-sm">Both current and proposed contracts need to be loaded for diff analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contract Diff Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Visual comparison showing changes between current and proposed contracts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode(viewMode === 'side-by-side' ? 'unified' : 'side-by-side')}
              variant="outline"
              size="sm"
            >
              {viewMode === 'side-by-side' ? 'Unified View' : 'Side-by-Side'}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{diffStats.total}</div>
            <div className="text-sm text-gray-600">Total Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{diffStats.added}</div>
            <div className="text-sm text-gray-600">Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{diffStats.removed}</div>
            <div className="text-sm text-gray-600">Removed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{diffStats.modified}</div>
            <div className="text-sm text-gray-600">Modified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{diffStats.unchanged}</div>
            <div className="text-sm text-gray-600">Unchanged</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          {['all', 'added', 'removed', 'modified'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedDiffType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedDiffType === type
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Changes' : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Analyzing contract differences...</span>
          </div>
        </div>
      )}

      {/* Diff Results */}
      <div className="p-6">
        {filteredDiffs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p>No differences found with current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiffs.slice(0, 50).map((diff) => (
              <div
                key={diff.id}
                className={`border rounded-lg p-4 ${getDiffTypeColor(diff.diffType)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getDiffTypeIcon(diff.diffType)}</span>
                    <h3 className="font-medium">{diff.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      diff.importance === 'high' ? 'bg-red-100 text-red-800' :
                      diff.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {diff.importance.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {diff.pageNumberCurrent && `Current: Page ${diff.pageNumberCurrent}`}
                    {diff.pageNumberCurrent && diff.pageNumberProposed && ' | '}
                    {diff.pageNumberProposed && `Proposed: Page ${diff.pageNumberProposed}`}
                  </div>
                </div>

                {viewMode === 'side-by-side' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Contract</h4>
                      <div className="bg-white p-3 rounded border text-sm">
                        {diff.currentText || <span className="text-gray-400 italic">Section not present</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Proposed Contract</h4>
                      <div className="bg-white p-3 rounded border text-sm">
                        {diff.proposedText || <span className="text-gray-400 italic">Section not present</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diff.currentText && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-1">- Current</h4>
                        <div className="bg-red-50 p-3 rounded border text-sm">{diff.currentText}</div>
                      </div>
                    )}
                    {diff.proposedText && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-1">+ Proposed</h4>
                        <div className="bg-green-50 p-3 rounded border text-sm">{diff.proposedText}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {filteredDiffs.length > 50 && (
              <div className="text-center py-4 text-gray-600">
                <p className="text-sm">Showing first 50 differences. Use filters to narrow results.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 