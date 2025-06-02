'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { ProcessedDocument, DocumentSection } from '../../_lib/types';
import HierarchicalSection from './HierarchicalSection';
import DocumentOutline from './DocumentOutline';
import { ChevronRight, ChevronLeft } from 'lucide-react';

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

// Legacy section renderer for sections without hierarchy metadata
function LegacySectionRenderer({ section, searchTerm, onSelectText, onNavigateToPdf }: SectionRendererProps) {
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
      id={section.id}
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
              (Click &quot;View in PDF&quot; to see full table of contents)
            </span>
          </div>
        ) : (
          highlightedContent
        )}
      </div>
    </div>
  );
}

// Smart section renderer that uses HierarchicalSection when hierarchy data is available
function SectionRenderer({ section, searchTerm, onSelectText, onNavigateToPdf }: SectionRendererProps) {
  // Use hierarchical rendering if hierarchy metadata is available
  if (section.hierarchy) {
    return (
      <HierarchicalSection
        key={`${section.id}`}
        section={section}
        searchTerm={searchTerm}
        onSelectText={onSelectText}
        onNavigateToPdf={onNavigateToPdf}
        defaultCollapsed={false}
      />
    );
  }
  
  // Fallback to legacy rendering
  return (
    <LegacySectionRenderer
      section={section}
      searchTerm={searchTerm}
      onSelectText={onSelectText}
      onNavigateToPdf={onNavigateToPdf}
    />
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
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState<boolean>(false);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Function to detect and collapse table of contents sections
  const processTableOfContents = useCallback((sections: DocumentSection[], searchTerm?: string) => {
    // If user is searching, show all matching sections normally
    if (searchTerm) {
      return sections;
    }

    // Detect TOC sections - looking for sections that:
    // 1. Contain "TABLE OF CONTENTS" or "Table of Contents"
    // 2. Are on early pages (typically pages 2-4)
    // 3. Have section listings like "Section X" with dots
    const tocSections: DocumentSection[] = [];
    const contentSections: DocumentSection[] = [];
    
    let inTocSection = false;
    
    sections.forEach((section) => {
      const content = section.content.toLowerCase();
      const isOnEarlyPage = (section.originalPage || 1) <= 4;
      
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
        (section.originalPage && section.originalPage > 4)
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
      
      const condensedToc: DocumentSection = {
        id: 'toc_condensed',
        type: 'heading' as const,
        content: 'Table Of Contents',
        originalPage: firstTocSection.originalPage || 1,
        metadata: {
          category: 'general' as const,
          importance: 'low' as const,
          glossaryTerms: [],
          affects: ['all_flight_attendants'],
          keywords: [],
          containsMonetaryInfo: false,
          pageRange: {
            start: firstTocSection.originalPage || 1,
            end: lastTocSection.originalPage || 1
          },
          sectionCount: tocSections.length
        }
      };
      
      return [condensedToc, ...contentSections];
    }
    
    return sections;
  }, []); // Empty dependency array since function doesn't depend on props/state

  const displayedSections = useMemo(() => {
    let sectionsToDisplay = document ? processTableOfContents(document.sections, searchTerm) : [];

    if (categoryFilter && categoryFilter.length > 0) {
      sectionsToDisplay = sectionsToDisplay.filter(section => 
        categoryFilter.includes(section.metadata.category)
      );
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      sectionsToDisplay = sectionsToDisplay.filter(section => 
        section.content.toLowerCase().includes(lowerSearchTerm) ||
        (section.hierarchy?.title && section.hierarchy.title.toLowerCase().includes(lowerSearchTerm)) ||
        (section.hierarchy?.identifier && section.hierarchy.identifier.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return sectionsToDisplay;
  }, [document, searchTerm, categoryFilter, processTableOfContents]);

  const pageRange = useMemo(() => {
    if (!displayedSections.length) return { min: 0, max: 0 };
    
    const pages = displayedSections
      .map(section => section.originalPage)
      .filter(page => page !== undefined) as number[];
    
    return {
      min: Math.min(...pages),
      max: Math.max(...pages)
    };
  }, [displayedSections]);

  const handleSectionTextSelection = (selectedText: string, sectionId: string) => {
    if (onSelectText && document) {
      onSelectText(selectedText, document.id, sectionId);
    }
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum && pageNum >= pageRange.min && pageNum <= pageRange.max) {
      const targetSection = displayedSections.find(section => 
        section.originalPage === pageNum
      );
      if (targetSection) {
        handleNavigateToSection(targetSection.id);
      }
    }
    setJumpToPage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  // New handler for navigating from outline
  const handleNavigateToSection = (sectionId: string) => {
    // Find the target element
    const element = globalThis.document?.getElementById(sectionId);
    if (element && contentContainerRef.current) {
      // Use the ref to the content container for reliable scrolling
      const contentContainer = contentContainerRef.current;
      
      // Calculate the position relative to the container
      const containerRect = contentContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.top - containerRect.top + contentContainer.scrollTop;
      
      // Scroll within the container with smooth behavior
      contentContainer.scrollTo({
        top: offset - 20, // Add small offset for better visibility
        behavior: 'smooth'
      });
    } else if (element) {
      // Fallback to default behavior if container not found
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const totalTopLevelSections = document.sections.filter(s => s.hierarchy?.level === 0).length;

  return (
    <div className={`flex h-full ${className}`}>
      {/* Document Outline Panel */}
      <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col ${isOutlineCollapsed ? 'w-12' : 'w-80'}`}>
        <div className="flex items-center p-3 border-b border-gray-200">
          <button 
            onClick={() => setIsOutlineCollapsed(!isOutlineCollapsed)}
            className="p-1 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
            aria-label={isOutlineCollapsed ? 'Expand Document Outline' : 'Collapse Document Outline'}
          >
            {isOutlineCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {isOutlineCollapsed ? (
            <div className="flex flex-col text-xs font-semibold text-gray-800 text-center leading-tight">
              <span>Document</span>
              <span>Outline</span>
            </div>
          ) : (
            <h3 className="font-semibold text-gray-800 text-sm">Document Outline</h3>
          )}
        </div>
        {!isOutlineCollapsed && (
          <>
            {totalTopLevelSections > 0 && (
              <p className="text-xs text-gray-500 px-3 pt-2">{totalTopLevelSections} top-level sections</p>
            )}
            <DocumentOutline 
              document={document} 
              onNavigateToSection={handleNavigateToSection}
              className="flex-1 overflow-y-auto p-2" 
            />
          </>
        )}
        {isOutlineCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <span className="transform -rotate-90 whitespace-nowrap text-xs text-gray-500">Click to expand</span>
          </div>
        )}
      </div>

      {/* Content Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls: Jump to page */}
        <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="Go to Page..."
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm w-28 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={handleJumpToPage}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Go
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white" ref={contentContainerRef}>
          {displayedSections.length > 0 ? (
            displayedSections.map(section => (
              <SectionRenderer 
                key={`${section.id}`}
                section={section} 
                searchTerm={searchTerm} 
                onSelectText={handleSectionTextSelection}
                onNavigateToPdf={onNavigateToPdf} 
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              <p className="text-lg">{searchTerm ? 'No sections match your search.' : 'No sections to display.'}</p>
              {searchTerm && <p className="text-sm text-gray-400">Try a different search term or adjust filters.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 