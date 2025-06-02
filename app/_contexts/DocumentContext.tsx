'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProcessedDocument, DocumentContextValue } from '../_lib/types';

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}

interface DocumentProviderProps {
  children: ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const [documentA, setDocumentA] = useState<ProcessedDocument | null>(null);
  const [documentB, setDocumentB] = useState<ProcessedDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = useCallback(async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/documents/${documentId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.statusText}`);
      }
      
      const document: ProcessedDocument = await response.json();
      
      // For now, we'll load into documentA by default
      // Later we can add logic to determine which slot to use
      if (documentId === 'contractA') {
        setDocumentA(document);
      } else if (documentId === 'contractB') {
        setDocumentB(document);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading document:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue: DocumentContextValue = {
    documentA,
    documentB,
    searchTerm,
    categoryFilter,
    isLoading,
    error,
    setSearchTerm,
    setCategoryFilter,
    loadDocument,
  };

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
} 