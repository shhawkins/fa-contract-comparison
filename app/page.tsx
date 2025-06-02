'use client';

import { useEffect, useState } from 'react';
import { DocumentProvider, useDocumentContext } from './_contexts/DocumentContext';
import { ApiKeyProvider } from './_contexts/ApiKeyContext';
import ResponsiveLayout from './_components/layout/ResponsiveLayout';
import DocumentViewer from './_components/document/DocumentViewer';
import DocumentControls from './_components/document/DocumentControls';
import PdfModal from './_components/document/PdfModal';
import ComparisonTool from './_components/comparison/ComparisonTool';

function ContractComparisonApp() {
  const { documentA, loadDocument, isLoading, error, searchTerm, categoryFilter } = useDocumentContext();
  const [pdfTargetPage, setPdfTargetPage] = useState<number>(1);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [lastSelection, setLastSelection] = useState<{
    text: string;
    documentId: 'documentA' | 'documentB';
    sectionId: string;
    pageNumber?: number;
    category?: string;
  } | null>(null);

  useEffect(() => {
    // Load the current contract on app start
    loadDocument('contractA');
  }, [loadDocument]);

  const handleTextSelection = (selectedText: string, documentId: string, sectionId?: string) => {
    console.log('Text selected:', { selectedText, documentId, sectionId });
    
    // Find section metadata for the selection
    const section = documentA?.sections?.find(s => s.id === sectionId);
    
    setLastSelection({
      text: selectedText,
      documentId: documentId as 'documentA' | 'documentB',
      sectionId: sectionId || '',
      pageNumber: section?.originalPage,
      category: section?.metadata.category
    });
  };

  const handleNavigateToPdf = (pageNumber: number) => {
    console.log('Navigating to PDF page:', pageNumber);
    setPdfTargetPage(pageNumber);
    setIsPdfModalOpen(true);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  // Document A content without controls (controls moved to header)
  const documentAContent = (
    <div className="h-full overflow-hidden">
      <DocumentViewer
        document={documentA}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        onSelectText={handleTextSelection}
        onNavigateToPdf={handleNavigateToPdf}
        className="h-full"
      />
    </div>
  );

  // Comparison tool replacing chat panel temporarily for Phase 4
  const comparisonContent = (
    <div className="h-full overflow-auto">
      <ComparisonTool className="h-full" />
    </div>
  );

  // Placeholder for proposed contract (Phase 4) - also uses same search
  const documentBContent = (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Proposed Contract</h3>
          <p className="text-gray-600 mb-4">Upload or load a proposed contract to compare</p>
          <p className="text-sm text-gray-500">Coming in Phase 4: Comparison Tools & Templates</p>
          <p className="text-xs text-gray-400 mt-2">When loaded, this document will also be searchable using the search bar above</p>
          {lastSelection && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 max-w-md mx-auto">
              <p className="text-xs text-gray-600 mb-1">Last selected text from current contract:</p>
              <p className="text-sm text-gray-800 line-clamp-3">{lastSelection.text}</p>
              <div className="flex items-center gap-2 mt-2">
                {lastSelection.pageNumber && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Page {lastSelection.pageNumber}
                  </span>
                )}
                {lastSelection.category && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {lastSelection.category}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
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
            Phase 4: Comparison Tools & Templates 🚀
          </div>
        </div>
      </header>

      {/* Global Search Controls - Spans both contracts */}
      <div className="bg-white border-b border-gray-200">
        <DocumentControls className="max-w-none" />
      </div>

      {/* Main Application */}
      <ResponsiveLayout
        documentAContent={documentAContent}
        documentBContent={documentBContent}
        chatPanelContent={comparisonContent}
      />

      {/* PDF Modal */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        file="/documents/current-contract.pdf"
        targetPage={pdfTargetPage}
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
