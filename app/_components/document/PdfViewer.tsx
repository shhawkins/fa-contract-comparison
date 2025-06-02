'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Button from '../ui/Button';

// Configure pdf.js worker to use local file for reliability
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Suppress non-critical errors from react-pdf
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress clipboard-related errors as they don't affect PDF viewing functionality
  if (typeof args[0] === 'string' && args[0].includes('Copy to clipboard is not supported')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

interface PdfViewerProps {
  file: string | null;
  targetPage?: number;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  file, 
  targetPage = 1, 
  className = '' 
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(targetPage);
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastTargetPageRef = React.useRef<number>(targetPage);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF Document loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    
    // Check if it's a worker-related error
    if (error.message.includes('worker') || error.message.includes('Worker')) {
      setError('PDF worker failed to load. Please refresh the page or try again later.');
    } else {
      setError('Failed to load PDF document. Please check if the file exists and try again.');
    }
    setIsLoading(false);
  }, []);

  const onPageLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const onPageLoadSuccess = useCallback(() => {
    setIsLoading(false);
  }, []);

  const onPageLoadError = useCallback((error: Error) => {
    console.error('Page load error:', error);
    setIsLoading(false);
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setPageNumber(page);
    }
  }, [numPages]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);

  // Update page when targetPage prop changes (but not when pageNumber changes internally)
  React.useEffect(() => {
    // Only respond to targetPage changes, not internal pageNumber changes
    if (targetPage !== lastTargetPageRef.current) {
      console.log('targetPage changed from', lastTargetPageRef.current, 'to', targetPage);
      lastTargetPageRef.current = targetPage;
      goToPage(targetPage);
    }
  }, [targetPage, goToPage]);

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📄</div>
          <p>No PDF file available</p>
          <p className="text-sm">Add a PDF file to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-100 ${className}`}>
      {/* PDF Controls */}
      <div className="flex-none bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageNumber - 1)}
              disabled={pageNumber <= 1 || isLoading}
            >
              ←
            </Button>
            <div className="flex items-center space-x-2 text-sm">
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                min={1}
                max={numPages || 1}
              />
              <span className="text-gray-600">
                of {numPages || '...'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber >= (numPages || 1) || isLoading}
            >
              →
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              -
            </Button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              +
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="font-medium">Error Loading PDF</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              }
            >
              <Page
                key={`page-${pageNumber}`}
                pageNumber={pageNumber}
                scale={scale}
                onLoadStart={onPageLoadStart}
                onLoadSuccess={onPageLoadSuccess}
                onLoadError={onPageLoadError}
                loading={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                }
                className="shadow-lg"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer; 