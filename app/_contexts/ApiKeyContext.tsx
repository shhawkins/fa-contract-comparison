'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../_hooks/useLocalStorage';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isApiKeyValid: boolean;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [storedApiKey, setStoredApiKey] = useLocalStorage<string | null>('openai-api-key', null);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);

  // Validate API key format (basic validation)
  useEffect(() => {
    if (storedApiKey) {
      // OpenAI API keys start with 'sk-' and are typically 48-51 characters long
      const isValid = storedApiKey.startsWith('sk-') && storedApiKey.length >= 48;
      setIsApiKeyValid(isValid);
    } else {
      setIsApiKeyValid(false);
    }
  }, [storedApiKey]);

  const setApiKey = (key: string | null) => {
    if (key && key.trim()) {
      setStoredApiKey(key.trim());
    } else {
      setStoredApiKey(null);
    }
  };

  const clearApiKey = () => {
    setStoredApiKey(null);
  };

  const value: ApiKeyContextType = {
    apiKey: storedApiKey,
    setApiKey,
    isApiKeyValid,
    clearApiKey,
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
} 