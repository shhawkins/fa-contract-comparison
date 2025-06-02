'use client';

import React, { useEffect, useState } from 'react';
import { DocumentProvider, useDocumentContext } from './_contexts/DocumentContext';
import { ApiKeyProvider } from './_contexts/ApiKeyContext';
import EnhancedResponsiveLayout from './_components/layout/EnhancedResponsiveLayout';
import DocumentViewer from './_components/document/DocumentViewer';
import DocumentControls from './_components/document/DocumentControls';
import PdfModal from './_components/document/PdfModal';
import ChatPanel from './_components/chat/ChatPanel';
import ComparisonTool from './_components/comparison/ComparisonTool';
import DiffVisualization from './_components/comparison/DiffVisualization';

function ContractComparisonApp() {
  const { documentA, documentB, loadDocument, isLoading, error, searchTerm, categoryFilter } = useDocumentContext();
  const [pdfTargetPage, setPdfTargetPage] = useState<number>(1);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [currentPdfFile, setCurrentPdfFile] = useState<string>('/documents/current-contract.pdf');

  useEffect(() => {
    // Load both contracts on app start
    loadDocument('contractA');
    loadDocument('contractB');
  }, [loadDocument]);

  const handleTextSelection = (selectedText: string, documentId: string, sectionId?: string) => {
    console.log('Text selected:', { selectedText, documentId, sectionId });
    
    // Find section metadata for the selection from the appropriate document
    const document = documentId === 'documentA' ? documentA : documentB;
    const section = document?.sections?.find(s => s.id === sectionId);
    
    // Log selection details for debugging
    console.log('Selection details:', {
      text: selectedText,
      documentId: documentId as 'documentA' | 'documentB',
      sectionId: sectionId || '',
      pageNumber: section?.originalPage,
      category: section?.metadata.category
    });
  };

  const handleNavigateToPdf = (pageNumber: number, documentId?: string) => {
    console.log('Navigating to PDF page:', pageNumber, 'for document:', documentId);
    setPdfTargetPage(pageNumber);
    
    // Set the appropriate PDF file based on document
    if (documentId === 'documentB') {
      setCurrentPdfFile('/documents/proposed-contract.pdf');
    } else {
      setCurrentPdfFile('/documents/current-contract.pdf');
    }
    
    setIsPdfModalOpen(true);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
  };

  // Check if we have hierarchical data to show outline
  const hasHierarchicalData = documentA?.sections?.some(section => section.hierarchy) || 
                              documentB?.sections?.some(section => section.hierarchy);

  // Document A content with enhanced hierarchical display
  const documentAContent = (
    <DocumentViewer
      document={documentA}
      searchTerm={searchTerm}
      categoryFilter={categoryFilter}
      onSelectText={(text, sectionId) => handleTextSelection(text, 'documentA', sectionId)}
      onNavigateToPdf={(page) => handleNavigateToPdf(page, 'documentA')}
      className="h-full"
    />
  );

  // Document B content with hierarchical display
  const documentBContent = (
    documentB ? (
      <DocumentViewer
        document={documentB}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        onSelectText={(text, sectionId) => handleTextSelection(text, 'documentB', sectionId)}
        onNavigateToPdf={(page) => handleNavigateToPdf(page, 'documentB')}
        className="h-full"
      />
    ) : (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposed contract...</p>
        </div>
      </div>
    )
  );

  // Comparison tool content
  const comparisonContent = (
    <div className="h-full overflow-auto">
      <ComparisonTool className="h-full" />
    </div>
  );

  // NEW: Diff visualization content for Phase 6
  const diffVisualizationContent = (
    <div className="h-full overflow-auto">
      <DiffVisualization 
        className="h-full" 
        selectedCategory={Array.isArray(categoryFilter) ? categoryFilter[0] || 'all' : categoryFilter}
        importanceFilter={['high', 'medium', 'low']}
      />
    </div>
  );

  // Chat panel content
  const chatPanelContent = (
    <div className="h-full overflow-auto">
      <ChatPanel className="h-full" />
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
            <p className="text-sm text-gray-600">
              Enhanced hierarchical contract analysis with AI-powered insights
              {hasHierarchicalData && <span className="text-green-600 ml-2">🏗️ Hierarchical Structure Active</span>}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Enhanced PDF Processing 🚀
          </div>
        </div>
      </header>

      {/* Global Search Controls - Spans both contracts */}
      <div className="bg-white border-b border-gray-200">
        <DocumentControls className="max-w-none" />
      </div>

      {/* Main Application with Enhanced Layout */}
      <EnhancedResponsiveLayout
        documentAContent={documentAContent}
        documentBContent={documentBContent}
        comparisonToolContent={comparisonContent}
        diffVisualizationContent={diffVisualizationContent}
        chatPanelContent={chatPanelContent}
      />

      {/* PDF Modal */}
      <PdfModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        file={currentPdfFile}
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
