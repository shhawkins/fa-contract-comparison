'use client';

import React, { useMemo, useState } from 'react';
import { ProcessedDocument, DocumentSection } from '../../_lib/types';

interface DocumentViewerProps {
  document: ProcessedDocument | null;
  searchTerm?: string;
  categoryFilter?: string[];
  onSelectText?: (selectedText: string, documentId: string, sectionId?: string) => void;
  onNavigateToPdf?: (pageNumber: number) => void;
  className?: string;
}

interface SectionRendererProps {
  section: DocumentSection;
  searchTerm?: string;
  onSelectText?: (selectedText: string, sectionId: string) => void;
  onNavigateToPdf?: (pageNumber: number) => void;
}

function SectionRenderer({ section, searchTerm, onSelectText, onNavigateToPdf }: SectionRendererProps) {
  const highlightedContent = useMemo(() => {
    if (!searchTerm || !section.content) {
      return section.content;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = section.content.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [section.content, searchTerm]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && onSelectText) {
      onSelectText(selection.toString().trim(), section.id);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      scheduling: 'bg-blue-100 text-blue-800 border-blue-200',
      pay: 'bg-green-100 text-green-800 border-green-200',
      benefits: 'bg-purple-100 text-purple-800 border-purple-200',
      work_rules: 'bg-orange-100 text-orange-800 border-orange-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getImportanceBadge = (importance: string) => {
    const badges = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return badges[importance as keyof typeof badges] || badges.low;
  };

  const sectionClasses = {
    heading: 'text-lg font-semibold text-gray-900 mb-3 mt-6 first:mt-0',
    paragraph: 'text-gray-700 leading-relaxed mb-4',
    table: 'text-gray-700 mb-4',
    list: 'text-gray-700 mb-4'
  };

  // Special handling for condensed TOC section
  const isCondensedToc = section.id === 'toc_condensed';

  return (
    <div 
      className="border-l-2 border-gray-100 pl-4 mb-4 hover:border-blue-200 transition-colors group"
      onMouseUp={handleTextSelection}
    >
      {/* Section metadata badges - now always visible */}
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Page number - prominently displayed */}
        {section.originalPage && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            📄 {isCondensedToc && section.metadata.pageRange ? 
              `Pages ${section.metadata.pageRange.start}-${section.metadata.pageRange.end}` : 
              `Page ${section.originalPage}`}
          </span>
        )}
        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadgeColor(section.metadata.category)}`}>
          {section.metadata.category.replace('_', ' ')}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full border ${getImportanceBadge(section.metadata.importance)}`}>
          {section.metadata.importance}
        </span>
        
        {/* Special badge for condensed TOC */}
        {isCondensedToc && section.metadata.sectionCount && (
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {section.metadata.sectionCount} sections
          </span>
        )}
        
        {/* View in PDF button */}
        {section.originalPage && onNavigateToPdf && (
          <button
            onClick={() => onNavigateToPdf(section.originalPage!)}
            className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
            title={isCondensedToc ? 
              `View table of contents in PDF (pages ${section.metadata.pageRange?.start}-${section.metadata.pageRange?.end})` :
              `View page ${section.originalPage} in PDF`}
          >
            📖 View in PDF
          </button>
        )}
      </div>

      {/* Section content */}
      <div 
        className={`${sectionClasses[section.type]} select-text cursor-text ${isCondensedToc ? 'italic text-gray-600' : ''}`}
        style={{ userSelect: 'text' }}
      >
        {isCondensedToc ? (
          <div>
            <span className="font-medium">{section.content}</span>
            <span className="text-sm text-gray-500 ml-2">
              (Click "View in PDF" to see full table of contents)
            </span>
          </div>
        ) : (
          highlightedContent
        )}
      </div>
    </div>
  );
}

export default function DocumentViewer({ 
  document, 
  searchTerm, 
  categoryFilter = [], 
  onSelectText,
  onNavigateToPdf,
  className = ''
}: DocumentViewerProps) {
  const [jumpToPage, setJumpToPage] = useState<string>('');

  // Function to detect and collapse table of contents sections
  const processTableOfContents = (sections: any[], searchTerm?: string) => {
    // If user is searching, show all matching sections normally
    if (searchTerm) {
      return sections;
    }

    // Detect TOC sections - looking for sections that:
    // 1. Contain "TABLE OF CONTENTS" or "Table of Contents"
    // 2. Are on early pages (typically pages 2-4)
    // 3. Have section listings like "Section X" with dots
    const tocSections: any[] = [];
    const contentSections: any[] = [];
    
    let inTocSection = false;
    
    sections.forEach((section) => {
      const content = section.content.toLowerCase();
      const isOnEarlyPage = section.originalPage <= 4;
      
      // Start of TOC
      if (content.includes('table of contents') && isOnEarlyPage) {
        inTocSection = true;
        tocSections.push(section);
      }
      // TOC entry patterns
      else if (inTocSection && isOnEarlyPage && (
        content.includes('section ') || 
        content.includes('loa ') || 
        content.includes('letters of agreement') ||
        content.includes('...') // Dotted lines typical in TOC
      )) {
        tocSections.push(section);
      }
      // End of TOC - when we hit actual content sections
      else if (inTocSection && (
        content.includes('recognition') || 
        content.includes('r e c o g n i t i o n') ||
        section.originalPage > 4
      )) {
        inTocSection = false;
        contentSections.push(section);
      }
      // Regular content sections
      else if (!inTocSection) {
        contentSections.push(section);
      }
    });

    // Create condensed TOC entry if we found TOC sections
    if (tocSections.length > 0) {
      const firstTocSection = tocSections[0];
      const lastTocSection = tocSections[tocSections.length - 1];
      
      const condensedToc = {
        id: 'toc_condensed',
        type: 'heading' as const,
        content: 'Table Of Contents',
        originalPage: firstTocSection.originalPage,
        metadata: {
          category: 'general' as const,
          importance: 'low' as const,
          glossaryTerms: [],
          affects: ['all_flight_attendants'],
          keywords: [],
          containsMonetaryInfo: false,
          pageRange: {
            start: firstTocSection.originalPage,
            end: lastTocSection.originalPage
          },
          sectionCount: tocSections.length
        }
      };
      
      return [condensedToc, ...contentSections];
    }
    
    return sections;
  };

  const filteredSections = useMemo(() => {
    if (!document?.sections) return [];
    
    let sections = document.sections;
    
    // Apply category filter
    if (categoryFilter.length > 0) {
      sections = sections.filter(section => 
        categoryFilter.includes(section.metadata.category)
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      sections = sections.filter(section =>
        section.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Detect and handle table of contents sections
    const processedSections = processTableOfContents(sections, searchTerm);
    
    return processedSections;
  }, [document?.sections, categoryFilter, searchTerm]);

  const pageRange = useMemo(() => {
    if (!filteredSections.length) return { min: 0, max: 0 };
    
    const pages = filteredSections
      .map(section => section.originalPage)
      .filter(page => page !== undefined) as number[];
    
    return {
      min: Math.min(...pages),
      max: Math.max(...pages)
    };
  }, [filteredSections]);

  const handleSectionTextSelection = (selectedText: string, sectionId: string) => {
    if (onSelectText && document) {
      onSelectText(selectedText, document.id, sectionId);
    }
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum && pageNum >= pageRange.min && pageNum <= pageRange.max) {
      const targetSection = filteredSections.find(section => 
        section.originalPage === pageNum
      );
      if (targetSection) {
        const element = globalThis.document.getElementById(targetSection.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setJumpToPage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  if (!document) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📄</div>
          <p>No document loaded</p>
        </div>
      </div>
    );
  }

  if (filteredSections.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p>No sections match your search criteria</p>
          {searchTerm && (
            <p className="text-sm mt-1">Try searching for different terms</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Document header with page navigation */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {document.title}
          </h2>
          
          {/* Page navigation controls */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Pages {pageRange.min}-{pageRange.max}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="jumpToPage" className="text-sm text-gray-600">
                Go to page:
              </label>
              <input
                id="jumpToPage"
                type="number"
                min={pageRange.min}
                max={pageRange.max}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Page #"
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleJumpToPage}
                disabled={!jumpToPage}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Go
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{document.sections.length} total sections</span>
          {filteredSections.length !== document.sections.length && (
            <span className="text-blue-600">
              {filteredSections.length} matching
            </span>
          )}
          {searchTerm && (
            <span className="text-orange-600">
              Search results span {pageRange.max - pageRange.min + 1} pages
            </span>
          )}
        </div>
      </div>

      {/* Document content */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredSections.map((section) => (
          <div key={section.id} id={section.id}>
            <SectionRenderer
              section={section}
              searchTerm={searchTerm}
              onSelectText={handleSectionTextSelection}
              onNavigateToPdf={onNavigateToPdf}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 