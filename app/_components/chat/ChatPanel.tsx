'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApiKey } from '../../_contexts/ApiKeyContext';
import { useDocumentContext } from '../../_contexts/DocumentContext';
import { useChatApi } from '../../_hooks/useChatApi';
import { ChatService } from '../../_services/chatService';
import ChatMessage from './ChatMessage';
import ApiKeyModal from './ApiKeyModal';
import Button from '../ui/Button';

interface ChatPanelProps {
  className?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ className = '' }) => {
  const { apiKey, isApiKeyValid } = useApiKey();
  const { documentA } = useDocumentContext();
  const { messages, isLoading, error, sendMessage, clearMessages, retryLastMessage } = useChatApi();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when API key becomes valid
  useEffect(() => {
    if (isApiKeyValid && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isApiKeyValid]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');

    // Extract relevant contract context based on the message
    const contractContext = documentA ? 
      ChatService.extractRelevantContext(message, documentA) : '';

    await sendMessage(message, contractContext);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    retryLastMessage();
  };

  // Suggested questions for first-time users
  const suggestedQuestions = [
    "What are the main differences in scheduling rules?",
    "How has the pay scale changed?",
    "What benefits are new or different?",
    "Explain the overtime policy in simple terms",
    "What are the work rules I should know about?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🤖</span>
              Contract Translator
            </h2>
            <p className="text-sm text-gray-600">Plain English contract assistance</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* API Key Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isApiKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">
                {isApiKeyValid ? 'Ready' : 'Setup Required'}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsApiKeyModalOpen(true)}
            >
              {apiKey ? 'Update Key' : 'Setup API Key'}
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isApiKeyValid ? (
          /* Setup prompt */
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">🔑</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup Required</h3>
              <p className="text-gray-600 mb-4">
                Add your OpenAI API key to start using the Contract Translator. 
                This enables AI-powered contract analysis in plain English.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsApiKeyModalOpen(true)}
              >
                Add API Key
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Welcome message with suggestions */
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="text-blue-400 mr-3 text-xl">💡</div>
                <div>
                  <p className="text-blue-800 font-medium">Welcome to Contract Translator!</p>
                  <p className="text-blue-700 text-sm mt-1">
                    I&rsquo;m here to help you understand your contract in plain English. 
                    Ask me anything about scheduling, pay, benefits, or work rules.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="block w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
                  >
                    &ldquo;{question}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">Contract Translator is thinking...</span>
              </div>
            )}
            
            {/* Error handling */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-red-600 text-xl">⚠️</div>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRetry}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {isApiKeyValid && (
        <div className="flex-none p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your contract... (Press Enter to send, Shift+Enter for new line)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3"
              >
                Send
              </Button>
              {messages.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={clearMessages}
                  size="sm"
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default ChatPanel; 