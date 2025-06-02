'use client';

import React, { ReactNode } from 'react';
import { useMediaQuery } from '../../_hooks/useMediaQuery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

interface ResponsiveLayoutProps {
  documentAContent: ReactNode;
  documentBContent: ReactNode;
  chatPanelContent?: ReactNode;
  comparisonTemplatesContent?: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({
  documentAContent,
  documentBContent,
  chatPanelContent,
  comparisonTemplatesContent,
  className = ''
}: ResponsiveLayoutProps) {
  // Use media query to detect large screens (>1024px as per spec)
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  if (isLargeScreen) {
    // Desktop/Large Screens: Two-column layout
    return (
      <div className={`h-screen flex flex-col ${className}`}>
        {/* Header area for future navigation/controls */}
        <div className="flex-none">
          {/* This will be populated with header content later */}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex gap-4 p-4 min-h-0">
          {/* Left column - Document A */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-gray-900">Current Contract</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                {documentAContent}
              </div>
            </div>
          </div>

          {/* Right column - Document B */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-gray-900">Proposed Contract</h3>
              </div>
              <div className="flex-1 overflow-hidden">
                {documentBContent}
              </div>
            </div>
          </div>

          {/* Optional side panel for chat or tools */}
          {(chatPanelContent || comparisonTemplatesContent) && (
            <div className="w-80 flex-none">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                  <h3 className="font-semibold text-gray-900">Contract Translator</h3>
                </div>
                <div className="flex-1 overflow-hidden">
                  {chatPanelContent}
                  {comparisonTemplatesContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile/Small Screens: Tabbed layout
  return (
    <div className={`h-screen flex flex-col ${className}`}>
      {/* Header area for future navigation/controls */}
      <div className="flex-none">
        {/* This will be populated with header content later */}
      </div>

      {/* Main content area with tabs */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <Tabs defaultValue="current" className="flex-1 flex flex-col">
          {/* Tab navigation */}
          <div className="flex-none mb-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="current" className="flex-1">
                Current Contract
              </TabsTrigger>
              <TabsTrigger value="proposed" className="flex-1">
                Proposed Contract
              </TabsTrigger>
              {(chatPanelContent || comparisonTemplatesContent) && (
                <TabsTrigger value="tools" className="flex-1">
                  Tools
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0">
            <TabsContent value="current" className="h-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                {documentAContent}
              </div>
            </TabsContent>

            <TabsContent value="proposed" className="h-full">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                {documentBContent}
              </div>
            </TabsContent>

            {(chatPanelContent || comparisonTemplatesContent) && (
              <TabsContent value="tools" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                  <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-lg">
                    <h3 className="font-semibold text-gray-900">Contract Translator & Tools</h3>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {chatPanelContent}
                    {comparisonTemplatesContent}
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
} 