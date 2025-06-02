'use client';

import { useState, useRef } from 'react';
import { ComparisonItem, TextSelection } from './ComparisonTool';
import Button from '../ui/Button';

interface ComparisonOutputProps {
  comparison: ComparisonItem;
  onUpdate: (updates: Partial<ComparisonItem>) => void;
  onDelete: () => void;
  selections: TextSelection[];
}

export default function ComparisonOutput({
  comparison,
  onUpdate,
  onDelete,
  selections
}: ComparisonOutputProps) {
  const [isExporting, setIsExporting] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const handleTitleChange = (newTitle: string) => {
    onUpdate({ title: newTitle });
  };

  const handleExplanationChange = (newExplanation: string) => {
    onUpdate({ userExplanation: newExplanation });
  };

  const handleAssignSelection = (selectionId: string, side: 'documentA' | 'documentB') => {
    const selection = selections.find(s => s.id === selectionId);
    if (selection) {
      onUpdate({ [side]: selection });
    }
  };

  const handleRemoveSelection = (side: 'documentA' | 'documentB') => {
    onUpdate({ [side]: undefined });
  };

  const handleExportAsImage = async () => {
    if (!comparisonRef.current) return;
    
    setIsExporting(true);
    try {
      // Dynamic import of html2canvas to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(comparisonRef.current, {
        useCORS: true,
        logging: false,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `contract-comparison-${comparison.title.replace(/\s+/g, '-').toLowerCase()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error exporting comparison:', error);
      alert('Error exporting comparison. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAsText = () => {
    const content = `
Contract Comparison: ${comparison.title}

${comparison.userExplanation ? `Explanation: ${comparison.userExplanation}\n` : ''}

CURRENT CONTRACT:
${comparison.documentA ? `
${comparison.documentA.text}
(Page ${comparison.documentA.pageNumber || 'N/A'}, ${comparison.documentA.category || 'General'})
` : 'No selection'}

PROPOSED CONTRACT:
${comparison.documentB ? `
${comparison.documentB.text}
(Page ${comparison.documentB.pageNumber || 'N/A'}, ${comparison.documentB.category || 'General'})
` : 'No selection'}

Generated on: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contract-comparison-${comparison.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const availableSelectionsA = selections.filter(s => s.documentId === 'documentA');
  const availableSelectionsB = selections.filter(s => s.documentId === 'documentB');

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={comparison.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-2 py-1 flex-1"
            placeholder="Comparison title..."
          />
          <div className="flex gap-2">
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>

        <textarea
          value={comparison.userExplanation}
          onChange={(e) => handleExplanationChange(e.target.value)}
          placeholder="Add your explanation of the key differences between these contract sections..."
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      {/* Side-by-Side Comparison */}
      <div ref={comparisonRef} className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{comparison.title}</h2>
          {comparison.userExplanation && (
            <p className="text-gray-600 mt-2 max-w-3xl mx-auto">{comparison.userExplanation}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Contract Side */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Current Contract</h3>
              {comparison.documentA && (
                <button
                  onClick={() => handleRemoveSelection('documentA')}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            {comparison.documentA ? (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  {comparison.documentA.pageNumber && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      Page {comparison.documentA.pageNumber}
                    </span>
                  )}
                  {comparison.documentA.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {comparison.documentA.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 leading-relaxed">{comparison.documentA.text}</p>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-3">No text selected from current contract</p>
                {availableSelectionsA.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Available selections:</p>
                    {availableSelectionsA.map((selection) => (
                      <button
                        key={selection.id}
                        onClick={() => handleAssignSelection(selection.id, 'documentA')}
                        className="block w-full text-left p-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {selection.pageNumber && (
                            <span className="text-xs text-gray-500">Page {selection.pageNumber}</span>
                          )}
                          {selection.category && (
                            <span className="text-xs text-gray-500">{selection.category}</span>
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2">{selection.text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proposed Contract Side */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-800">Proposed Contract</h3>
              {comparison.documentB && (
                <button
                  onClick={() => handleRemoveSelection('documentB')}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            {comparison.documentB ? (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  {comparison.documentB.pageNumber && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Page {comparison.documentB.pageNumber}
                    </span>
                  )}
                  {comparison.documentB.category && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {comparison.documentB.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 leading-relaxed">{comparison.documentB.text}</p>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-3">No text selected from proposed contract</p>
                {availableSelectionsB.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Available selections:</p>
                    {availableSelectionsB.map((selection) => (
                      <button
                        key={selection.id}
                        onClick={() => handleAssignSelection(selection.id, 'documentB')}
                        className="block w-full text-left p-2 text-sm border border-gray-200 rounded hover:border-green-300 hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {selection.pageNumber && (
                            <span className="text-xs text-gray-500">Page {selection.pageNumber}</span>
                          )}
                          {selection.category && (
                            <span className="text-xs text-gray-500">{selection.category}</span>
                          )}
                        </div>
                        <p className="text-gray-700 line-clamp-2">{selection.text}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
          Generated on {new Date().toLocaleDateString()} • Contract Comparison Tool
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Button
          onClick={handleExportAsImage}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              📷 Export as Image
            </>
          )}
        </Button>
        <Button
          onClick={handleExportAsText}
          variant="outline"
          className="flex items-center gap-2"
        >
          📄 Export as Text
        </Button>
      </div>
    </div>
  );
} 