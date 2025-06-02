'use client';

import React from 'react';
import Modal from '../ui/Modal';
import PdfViewer from './PdfViewer';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: string | null;
  targetPage?: number;
}

const PdfModal: React.FC<PdfModalProps> = ({ 
  isOpen, 
  onClose, 
  file, 
  targetPage = 1 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Original Contract PDF"
      className="max-w-7xl w-full mx-4 max-h-[95vh]"
    >
      <div className="h-[80vh]">
        <PdfViewer
          file={file}
          targetPage={targetPage}
          className="h-full"
        />
      </div>
    </Modal>
  );
};

export default PdfModal; 