'use client';

import React, { useMemo, useState } from 'react';
import { DocumentSection } from '../../_lib/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HierarchicalSectionProps {
  section: DocumentSection;
  searchTerm?: string;
  onSelectText?: (selectedText: string, sectionId: string) => void;
  onNavigateToPdf?: (pageNumber: number) => void;
  defaultCollapsed?: boolean;
}

export default function HierarchicalSection({ 
  section, 
  searchTerm, 
  onSelectText, 
  onNavigateToPdf,
  defaultCollapsed = false
}: HierarchicalSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  // Extract hierarchical metadata
  const hierarchy = section.hierarchy || {
    level: 0,
    type: 'paragraph' as const,
    identifier: undefined,
    title: undefined,
    parent_path: undefined,
    has_children: false
  };
  const level = hierarchy.level;
  const hierarchyType = hierarchy.type;
  const identifier = hierarchy.identifier;
  const title = hierarchy.title;
  const parentPath = hierarchy.parent_path;
  const hasChildren = hierarchy.has_children || false;

  // Clean and format content
  const formattedContent = useMemo(() => {
    if (!section.content) return '';
    
    // Remove redundant identifier/title from content if it appears at the beginning
    let content = section.content;
    
    // If this is a header with identifier and title, clean up redundant display
    if (identifier && title && (hierarchyType === 'section' || hierarchyType === 'loa')) {
      // Remove patterns like "1. Title text" or "LOA 1. Title text" from the beginning
      const redundantPattern = new RegExp(`^(LOA\\s+)?${identifier}\\.?\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i');
      content = content.replace(redundantPattern, '').trim();
    }
    
    // Clean up common formatting artifacts
    content = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\.{3,}/g, '...') // Clean up excessive dots
      .replace(/\s+\./g, '.') // Fix spacing before periods
      .replace(/\.\s*\.\s*\./g, '...') // Normalize ellipsis
      .trim();
    
    return content;
  }, [section.content, identifier, title, hierarchyType]);

  // Highlight search terms
  const highlightedContent = useMemo(() => {
    if (!searchTerm || !formattedContent) {
      return formattedContent;
    }

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = formattedContent.split(regex);
    
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
  }, [formattedContent, searchTerm]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && onSelectText) {
      onSelectText(selection.toString().trim(), section.id);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Visual styling based on hierarchy
  const getHierarchyStyles = () => {
    const baseStyles = "transition-all duration-200";
    
    switch (hierarchyType) {
      case 'section':
        return {
          container: `${baseStyles} border-l-4 border-blue-500 bg-blue-50 rounded-r-lg shadow-sm`,
          header: "text-xl font-bold text-blue-900 mb-3",
          content: "text-gray-800 leading-relaxed",
          indent: level * 0 // Sections don't indent
        };
      case 'loa':
        return {
          container: `${baseStyles} border-l-4 border-purple-500 bg-purple-50 rounded-r-lg shadow-sm`,
          header: "text-lg font-bold text-purple-900 mb-2",
          content: "text-gray-800 leading-relaxed",
          indent: level * 0 // LOAs don't indent
        };
      case 'capital_letter_item':
        return {
          container: `${baseStyles} border-l-3 border-indigo-400 bg-indigo-25 rounded-r`,
          header: "text-lg font-semibold text-indigo-800 mb-2",
          content: "text-gray-700 leading-relaxed",
          indent: level * 20
        };
      case 'number_item':
        return {
          container: `${baseStyles} border-l-2 border-green-400 bg-green-25 rounded-r`,
          header: "text-base font-medium text-green-800 mb-1",
          content: "text-gray-700 leading-relaxed",
          indent: level * 20
        };
      case 'lowercase_letter_item':
        return {
          container: `${baseStyles} border-l-2 border-orange-300 bg-orange-25 rounded-r`,
          header: "text-sm font-medium text-orange-800 mb-1",
          content: "text-gray-600 leading-relaxed text-sm",
          indent: level * 20
        };
      default:
        return {
          container: `${baseStyles} border-l border-gray-200 hover:border-gray-300 rounded-r`,
          header: "text-base text-gray-900 mb-2",
          content: "text-gray-700 leading-relaxed",
          indent: level * 16
        };
    }
  };

  const styles = getHierarchyStyles();

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

  // Show identifier and title for headers
  const displayTitle = useMemo(() => {
    if (!identifier && !title) return null;
    
    const parts = [];
    if (identifier) parts.push(identifier);
    if (title && title !== identifier) {
      // Clean title of excessive dots and formatting
      const cleanTitle = title.replace(/\.{3,}/g, '').replace(/\s+/g, ' ').trim();
      if (cleanTitle) parts.push(cleanTitle);
    }
    
    return parts.length > 0 ? parts.join('. ') : null;
  }, [identifier, title]);

  const shouldShowAsHeader = hierarchyType === 'section' || hierarchyType === 'loa' || 
                            hierarchyType === 'capital_letter_item' || 
                            (hierarchyType === 'number_item' && level <= 1);

  // Show collapse button if there is content to collapse
  const canCollapse = !!formattedContent;

  return (
    <div 
      id={section.id}
      className={`${styles.container} pl-4 pr-4 py-3 mb-3 group cursor-default`}
      style={{ marginLeft: `${styles.indent}px` }}
      onMouseUp={handleTextSelection}
    >
      {/* Hierarchical breadcrumb for nested items */}
      {parentPath && level > 0 && (
        <div className="text-xs text-gray-500 mb-1 font-mono">
          📍 {parentPath} {identifier && `> ${identifier}`}
        </div>
      )}

      {/* Section header with collapse button */}
      <div className="flex items-start justify-between mb-2">
        {/* Left side - Title and metadata */}
        <div className="flex-1 min-w-0">
          {/* Section title with collapse button */}
          {shouldShowAsHeader && displayTitle && (
            <div className={`${styles.header} flex items-start gap-1`}>
              {canCollapse && (
                <button
                  onClick={toggleExpanded}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-600"
                  aria-expanded={isExpanded}
                  aria-controls={`section-content-${section.id}`}
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}
              {!canCollapse && <div className="w-5" />}
              <div className="flex-1 select-text" style={{ userSelect: 'text' }}>
                {displayTitle}
              </div>
            </div>
          )}

          {/* Section metadata badges */}
          <div className="flex flex-wrap gap-2 opacity-75 group-hover:opacity-100 transition-opacity">
            {/* Page number */}
            {section.originalPage && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                📄 Page {section.originalPage}
              </span>
            )}
            
            {/* Hierarchy type */}
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {hierarchyType.replace('_', ' ')}
            </span>
            
            {/* Category and importance */}
            <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadgeColor(section.metadata.category)}`}>
              {section.metadata.category.replace('_', ' ')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border ${getImportanceBadge(section.metadata.importance)}`}>
              {section.metadata.importance}
            </span>
            
            {/* Children indicator */}
            {hasChildren && (
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                📂 has subsections
              </span>
            )}
            
            {/* View in PDF button */}
            {section.originalPage && onNavigateToPdf && (
              <button
                onClick={() => onNavigateToPdf(section.originalPage!)}
                className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                title={`View page ${section.originalPage} in PDF`}
              >
                📖 View in PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && formattedContent && (
        <div 
          id={`section-content-${section.id}`}
          className={`${styles.content} select-text cursor-text pt-1`} 
          style={{ userSelect: 'text' }}
          onMouseUp={handleTextSelection}
        >
          {highlightedContent}
        </div>
      )}
      {!isExpanded && canCollapse && (
        <div className="text-xs text-gray-400 italic pl-6">Content collapsed...</div>
      )}
    </div>
  );
} 