'use client';

import React, { useState } from 'react';
import { useApiKey } from '../../_contexts/ApiKeyContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, isApiKeyValid, clearApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    setApiKey(inputValue);
    onClose();
  };

  const handleClear = () => {
    clearApiKey();
    setInputValue('');
  };

  const handleClose = () => {
    setInputValue(apiKey || '');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="OpenAI API Key">
      <div className="space-y-4">
        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Why do you need an API key?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Your API key enables the Contract Translator chatbot</li>
                <li>Keys are stored locally in your browser (not on our servers)</li>
                <li>You control your OpenAI usage and costs directly</li>
                <li>Get your key from: <strong>platform.openai.com/api-keys</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cost Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 text-xl">💰</div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">Estimated Costs (GPT-4)</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Typical question: ~$0.02-0.05</li>
                <li>Complex contract analysis: ~$0.10-0.20</li>
                <li>Monitor usage at: <strong>platform.openai.com/usage</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {inputValue && !inputValue.startsWith('sk-') && (
            <p className="text-sm text-red-600">API key should start with &lsquo;sk-&rsquo;</p>
          )}
        </div>

        {/* Current Status */}
        {apiKey && (
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isApiKeyValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isApiKeyValid ? 'text-green-700' : 'text-red-700'}>
              {isApiKeyValid ? 'API key is valid' : 'API key format invalid'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between space-x-3 pt-4">
          <div>
            {apiKey && (
              <Button
                variant="secondary"
                onClick={handleClear}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Key
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!inputValue.trim() || !inputValue.startsWith('sk-')}
            >
              Save Key
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>🔒 Your API key is stored locally in your browser and never transmitted to our servers.</p>
        </div>
      </div>
    </Modal>
  );
};

export default ApiKeyModal; 