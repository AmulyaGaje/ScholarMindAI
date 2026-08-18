import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children, maxWidth = 'max-w-md' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className={`bg-bgCard border border-border p-6 rounded-2xl w-full ${maxWidth} relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-textMuted hover:text-textPrimary hover:bg-bgInput transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
