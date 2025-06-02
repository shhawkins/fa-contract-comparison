import { useState, useCallback, useRef } from 'react';
import { ChatService, ChatMessage, ChatResponse } from '../_services/chatService';
import { useApiKey } from '../_contexts/ApiKeyContext';

interface UseChatApiReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string, contractContext?: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useChatApi(): UseChatApiReturn {
  const { apiKey, isApiKeyValid } = useApiKey();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const lastMessageRef = useRef<{ message: string; contractContext?: string } | null>(null);

  // Initialize or update chat service when API key changes
  const getChatService = useCallback(() => {
    if (!apiKey || !isApiKeyValid) {
      return null;
    }

    if (!chatServiceRef.current || chatServiceRef.current['apiKey'] !== apiKey) {
      chatServiceRef.current = new ChatService(apiKey);
    }

    return chatServiceRef.current;
  }, [apiKey, isApiKeyValid]);

  const sendMessage = useCallback(async (message: string, contractContext?: string) => {
    if (!message.trim()) return;

    const chatService = getChatService();
    if (!chatService) {
      setError('Please configure your OpenAI API key to use the chat feature.');
      return;
    }

    // Store for potential retry
    lastMessageRef.current = { message, contractContext };

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Get conversation history (excluding system messages)
      const conversationHistory = messages.filter(msg => msg.role !== 'system');

      const response: ChatResponse = await chatService.sendMessage(
        message,
        conversationHistory,
        contractContext
      );

      if (response.error) {
        setError(response.error);
        // Remove the user message if there was an error
        setMessages(prev => prev.slice(0, -1));
      } else {
        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [getChatService, messages]);

  const retryLastMessage = useCallback(async () => {
    if (!lastMessageRef.current) return;
    
    const { message, contractContext } = lastMessageRef.current;
    await sendMessage(message, contractContext);
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    lastMessageRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
} 