// Core data types for the contract comparison application

export interface ProcessedDocument {
  id: string;
  title: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'table' | 'list';
  content: string;
  originalPage?: number;
  metadata: SectionMetadata;
  hierarchy?: HierarchyMetadata;
}

export interface HierarchyMetadata {
  level: number;
  type: 'section' | 'loa' | 'capital_letter_item' | 'number_item' | 'lowercase_letter_item' | 'paragraph';
  identifier?: string;
  title?: string;
  parent_path?: string;
  page_range?: [number, number];
  has_children?: boolean;
}

export interface SectionMetadata {
  category: 'scheduling' | 'pay' | 'benefits' | 'work_rules' | 'general';
  importance: 'high' | 'medium' | 'low';
  glossaryTerms?: string[];
  affects?: string[];
  // Additional properties for condensed table of contents
  pageRange?: {
    start: number;
    end: number;
  };
  sectionCount?: number;
  keywords?: string[];
  containsMonetaryInfo?: boolean;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

export interface ComparisonTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: string[];
  guideQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ComparisonSelection {
  documentId: string;
  sectionId: string;
  selectedText: string;
  explanation?: string;
}

export interface UserSettings {
  apiKey?: string;
  theme: 'light' | 'dark';
  preferredLayout: 'auto' | 'columns' | 'tabs';
}

// Hook return types
export interface DocumentContextValue {
  documentA: ProcessedDocument | null;
  documentB: ProcessedDocument | null;
  searchTerm: string;
  categoryFilter: string[];
  isLoading: boolean;
  error: string | null;
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (categories: string[]) => void;
  loadDocument: (documentId: string) => Promise<void>;
}

export interface ApiKeyContextValue {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isValidKey: boolean;
  usage?: {
    requests: number;
    estimatedCost: number;
  };
} 