'use client';

import { useEffect } from 'react';
import { DocumentProvider, useDocumentContext } from './_contexts/DocumentContext';
import { ApiKeyProvider } from './_contexts/ApiKeyContext';
import ResponsiveLayout from './_components/layout/ResponsiveLayout';
import DocumentViewer from './_components/document/DocumentViewer';
import DocumentControls from './_components/document/DocumentControls';
import ChatPanel from './_components/chat/ChatPanel';

function ContractComparisonApp() {
  const { documentA, loadDocument, isLoading, error, searchTerm, categoryFilter } = useDocumentContext();

  useEffect(() => {
    // Load the current contract on app start
    loadDocument('contractA');
  }, [loadDocument]);

  const handleTextSelection = (selectedText: string, documentId: string, sectionId?: string) => {
    console.log('Text selected:', { selectedText, documentId, sectionId });
    // This will be implemented in Phase 4 when we add comparison tools
  };

  // Enhanced document A content with controls
  const documentAContent = (
    <div className="h-full flex flex-col">
      <DocumentControls className="flex-none" />
      <div className="flex-1 overflow-hidden">
        <DocumentViewer
          document={documentA}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
          onSelectText={handleTextSelection}
          className="h-full"
        />
      </div>
    </div>
  );

  // Integrated chat panel
  const chatPanelContent = (
    <ChatPanel className="h-full" />
  );

  // Placeholder for proposed contract (Document B)
  const documentBContent = (
    <div className="p-4 h-full flex items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-2">📄</div>
        <p>Proposed Contract</p>
        <p className="text-sm">Coming in Phase 4</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contract</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadDocument('contractA')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* App Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Contract Comparison Tool</h1>
            <p className="text-sm text-gray-600">Compare current and proposed flight attendant contracts</p>
          </div>
          <div className="text-sm text-gray-500">
            Phase 3: Enhanced Chatbot Integration 🤖
          </div>
        </div>
      </header>

      {/* Main Application */}
      <ResponsiveLayout
        documentAContent={documentAContent}
        documentBContent={documentBContent}
        chatPanelContent={chatPanelContent}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ApiKeyProvider>
      <DocumentProvider>
        <ContractComparisonApp />
      </DocumentProvider>
    </ApiKeyProvider>
  );
}
