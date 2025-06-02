'use client';

import { useState } from 'react';
import { useMediaQuery } from '../../_hooks/useMediaQuery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedResponsiveLayoutProps {
  documentAContent: React.ReactNode;
  documentBContent: React.ReactNode;
  comparisonToolContent: React.ReactNode;
  diffVisualizationContent: React.ReactNode;
  chatPanelContent: React.ReactNode;
}

export default function EnhancedResponsiveLayout({
  documentAContent,
  documentBContent,
  comparisonToolContent,
  diffVisualizationContent,
  chatPanelContent,
}: EnhancedResponsiveLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeRightPanel, setActiveRightPanel] = useState<'comparison' | 'diff' | 'chat'>('diff');
  const [isCurrentContractPanelCollapsed, setIsCurrentContractPanelCollapsed] = useState(false);
  const [isProposedContractPanelCollapsed, setIsProposedContractPanelCollapsed] = useState(false);
  const [isAnalysisToolsPanelCollapsed, setIsAnalysisToolsPanelCollapsed] = useState(false);
  
  // Mobile layout - tabs for all content
  if (!isDesktop) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="flex-1 overflow-hidden p-4">
          <Tabs defaultValue="document-a" className="h-full flex flex-col">
            {/* Tab navigation */}
            <div className="flex-none mb-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="document-a" className="flex-1 text-xs">
                  Current
                </TabsTrigger>
                <TabsTrigger value="document-b" className="flex-1 text-xs">
                  Proposed
                </TabsTrigger>
                <TabsTrigger value="diff-analysis" className="flex-1 text-xs">
                  Diff
                </TabsTrigger>
                <TabsTrigger value="comparison-tool" className="flex-1 text-xs">
                  Compare
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex-1 text-xs">
                  AI Chat
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
              <TabsContent value="document-a" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  {documentAContent}
                </div>
              </TabsContent>

              <TabsContent value="document-b" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  {documentBContent}
                </div>
              </TabsContent>

              <TabsContent value="diff-analysis" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  {diffVisualizationContent}
                </div>
              </TabsContent>

              <TabsContent value="comparison-tool" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  {comparisonToolContent}
                </div>
              </TabsContent>

              <TabsContent value="chat" className="h-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  {chatPanelContent}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop layout - two columns with enhanced right panel
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Column - Documents */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col lg:flex-row gap-2 p-2">
          {/* Document A */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${isCurrentContractPanelCollapsed ? 'flex-none' : 'flex-1'} min-w-0`}>
            <div className="flex items-center p-3 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setIsCurrentContractPanelCollapsed(!isCurrentContractPanelCollapsed)}
                className="p-1 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                aria-label={isCurrentContractPanelCollapsed ? "Expand Current Contract" : "Collapse Current Contract"}
              >
                {isCurrentContractPanelCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              {isCurrentContractPanelCollapsed ? (
                <div className="flex flex-col text-xs font-semibold text-gray-700 text-center leading-tight">
                  <span>Current</span>
                  <span>Contract</span>
                </div>
              ) : (
                <h2 className="text-sm font-semibold text-gray-700">Current Contract</h2>
              )}
            </div>
            {!isCurrentContractPanelCollapsed && (
              <div className="flex-1 overflow-auto">
                {documentAContent}
              </div>
            )}
          </div>
          
          {/* Document B */}
          <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${isProposedContractPanelCollapsed ? 'flex-none' : 'flex-1'} min-w-0`}>
            <div className="flex items-center p-3 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setIsProposedContractPanelCollapsed(!isProposedContractPanelCollapsed)}
                className="p-1 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                aria-label={isProposedContractPanelCollapsed ? "Expand Proposed Contract" : "Collapse Proposed Contract"}
              >
                {isProposedContractPanelCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
              {isProposedContractPanelCollapsed ? (
                <div className="flex flex-col text-xs font-semibold text-gray-700 text-center leading-tight">
                  <span>Proposed</span>
                  <span>Contract</span>
                </div>
              ) : (
                <h2 className="text-sm font-semibold text-gray-700">Proposed Contract</h2>
              )}
            </div>
            {!isProposedContractPanelCollapsed && (
              <div className="flex-1 overflow-auto">
                {documentBContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Analysis Tools */}
      <div className={`flex flex-col border-l border-gray-200 bg-white transition-all duration-300 ease-in-out ${isAnalysisToolsPanelCollapsed ? 'w-16' : 'w-96'}`}>
        {/* Panel Header with Tab Controls */}
        <div className={`p-4 border-b border-gray-200 bg-gray-50`}>
          <div className="flex items-center mb-2">
            <button
              onClick={() => setIsAnalysisToolsPanelCollapsed(!isAnalysisToolsPanelCollapsed)}
              className="p-1 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              aria-label={isAnalysisToolsPanelCollapsed ? "Expand Analysis Tools" : "Collapse Analysis Tools"}
            >
              {isAnalysisToolsPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            {isAnalysisToolsPanelCollapsed ? (
              <div className="flex flex-col text-sm font-semibold text-gray-900 text-center leading-tight">
                <span>Analysis</span>
                <span>Tools</span>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-gray-900">Analysis Tools</h2>
            )}
          </div>
          {!isAnalysisToolsPanelCollapsed && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveRightPanel('diff')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRightPanel === 'diff'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>🔍</span>
                  <span>Diff Analysis</span>
                </div>
              </button>
              <button
                onClick={() => setActiveRightPanel('comparison')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRightPanel === 'comparison'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>📋</span>
                  <span>Compare</span>
                </div>
              </button>
              <button
                onClick={() => setActiveRightPanel('chat')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeRightPanel === 'chat'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>💬</span>
                  <span>AI Chat</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Panel Content */}
        <div className={`flex-1 overflow-hidden ${isAnalysisToolsPanelCollapsed ? 'pt-2' : ''}`}>
          {!isAnalysisToolsPanelCollapsed ? (
            <>
              {activeRightPanel === 'diff' && diffVisualizationContent}
              {activeRightPanel === 'comparison' && comparisonToolContent}
              {activeRightPanel === 'chat' && chatPanelContent}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 p-2">
              <button
                onClick={() => { setActiveRightPanel('diff'); setIsAnalysisToolsPanelCollapsed(false); }}
                className="p-2 hover:bg-gray-100 rounded-md w-full flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open Diff Analysis"
              >
                <span>🔍</span>
              </button>
              <button
                onClick={() => { setActiveRightPanel('comparison'); setIsAnalysisToolsPanelCollapsed(false); }}
                className="p-2 hover:bg-gray-100 rounded-md w-full flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open Compare"
              >
                <span>📋</span>
              </button>
              <button
                onClick={() => { setActiveRightPanel('chat'); setIsAnalysisToolsPanelCollapsed(false); }}
                className="p-2 hover:bg-gray-100 rounded-md w-full flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open AI Chat"
              >
                <span>💬</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 