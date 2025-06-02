'use client';

import React, { useMemo, useState } from 'react';
import { ProcessedDocument, DocumentSection } from '../../_lib/types';

interface DocumentOutlineProps {
  document: ProcessedDocument | null;
  onNavigateToSection?: (sectionId: string) => void;
  className?: string;
}

interface OutlineNode {
  section: DocumentSection;
  children: OutlineNode[];
  level: number;
}

export default function DocumentOutline({ 
  document, 
  onNavigateToSection,
  className = ''
}: DocumentOutlineProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build hierarchical outline from sections
  const outlineTree = useMemo(() => {
    if (!document?.sections) return [];

    // Filter sections that have hierarchy data and should appear in outline
    const hierarchicalSections = document.sections.filter(section => 
      section.hierarchy && 
      (section.hierarchy.type === 'section' || 
       section.hierarchy.type === 'loa' ||
       section.hierarchy.type === 'capital_letter_item' ||
       (section.hierarchy.type === 'number_item' && section.hierarchy.level <= 2))
    );

    // Sort by page number to maintain document order
    hierarchicalSections.sort((a, b) => (a.originalPage || 0) - (b.originalPage || 0));

    const rootNodes: OutlineNode[] = [];
    const nodeMap = new Map<string, OutlineNode>();

    // Create outline nodes
    hierarchicalSections.forEach(section => {
      const node: OutlineNode = {
        section,
        children: [],
        level: section.hierarchy?.level || 0
      };
      nodeMap.set(section.id, node);
    });

    // Build tree structure based on hierarchy
    hierarchicalSections.forEach(section => {
      const node = nodeMap.get(section.id);
      if (!node) return;

      const hierarchy = section.hierarchy!;
      const level = hierarchy.level;

      if (level === 0) {
        // Top-level sections go to root
        rootNodes.push(node);
      } else {
        // Find parent based on level and document order
        const possibleParents = hierarchicalSections.filter(parentSection => {
          const parentHierarchy = parentSection.hierarchy;
          return parentHierarchy && 
                 parentHierarchy.level < level &&
                 (parentSection.originalPage || 0) <= (section.originalPage || 0);
        });

        // Get the closest parent (highest level, latest in document order)
        const parent = possibleParents.reduce((best, current) => {
          const bestLevel = best?.hierarchy?.level || -1;
          const currentLevel = current.hierarchy?.level || -1;
          const bestPage = best?.originalPage || 0;
          const currentPage = current.originalPage || 0;

          if (currentLevel > bestLevel || 
              (currentLevel === bestLevel && currentPage > bestPage)) {
            return current;
          }
          return best;
        }, null as DocumentSection | null);

        if (parent) {
          const parentNode = nodeMap.get(parent.id);
          if (parentNode) {
            parentNode.children.push(node);
          } else {
            rootNodes.push(node);
          }
        } else {
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }, [document?.sections]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNavigate = (sectionId: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      // Default behavior: scroll to section
      const element = globalThis.document?.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getHierarchyIcon = (hierarchyType: string) => {
    switch (hierarchyType) {
      case 'section': return '📋';
      case 'loa': return '📜';
      case 'capital_letter_item': return '🔸';
      case 'number_item': return '🔹';
      default: return '📄';
    }
  };

  const getHierarchyColor = (hierarchyType: string) => {
    switch (hierarchyType) {
      case 'section': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'loa': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'capital_letter_item': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'number_item': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const renderOutlineNode = (node: OutlineNode, depth: number = 0): React.ReactNode => {
    const { section, children } = node;
    const hierarchy = section.hierarchy!;
    const isExpanded = expandedNodes.has(section.id);
    const hasChildren = children.length > 0;

    // Calculate display title
    const parts = [];
    if (hierarchy.identifier) parts.push(hierarchy.identifier);
    if (hierarchy.title && hierarchy.title !== hierarchy.identifier) {
      const cleanTitle = hierarchy.title.replace(/\.{3,}/g, '').replace(/\s+/g, ' ').trim();
      if (cleanTitle) parts.push(cleanTitle);
    }
    const displayTitle = parts.length > 0 ? parts.join('. ') : 'Untitled';

    return (
      <div key={section.id} className="select-none">
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${getHierarchyColor(hierarchy.type)}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleNavigate(section.id)}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(section.id);
              }}
              className="text-xs p-1 hover:bg-white/50 rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? '📖' : '📕'}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          {/* Hierarchy icon */}
          <span className="text-sm">
            {getHierarchyIcon(hierarchy.type)}
          </span>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {displayTitle}
            </div>
            <div className="text-xs text-gray-500">
              Page {section.originalPage} • {hierarchy.type.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {children.map(child => renderOutlineNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!document || outlineTree.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <div className="text-2xl mb-2">📋</div>
        <p className="text-sm">No outline available</p>
        <p className="text-xs text-gray-400 mt-1">
          This document may not have hierarchical structure data
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="border-b border-gray-200 p-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          Document Outline
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {outlineTree.length} top-level sections
        </p>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto p-2">
        {outlineTree.map(node => renderOutlineNode(node))}
      </div>
    </div>
  );
} 