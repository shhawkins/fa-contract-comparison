'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '../../_services/chatService';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 border border-gray-200'
          }`}
        >
          {/* Role indicator for assistant */}
          {isAssistant && (
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium">Contract Translator</span>
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
          
          {/* Timestamp */}
          {message.timestamp && (
            <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-2 ml-2' : 'order-1 mr-2'}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isUser ? '👤' : '🤖'}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 