'use client';

import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" style={{transform: 'scale(0.98)'}}>
        {/* Modal Header */}
        <div className="primary-gradient px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-base">🚀</span>
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <span className="text-base">✕</span>
            </button>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-grow overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
