"use client";

import { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  actionText,
  onAction,
  autoClose = true,
  autoCloseDelay = 3000
}: SuccessModalProps) {
  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all duration-300 scale-100">
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Success Icon */}
            <div className="relative pt-12 pb-6 px-6 text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {title}
              </h3>
              
              {/* Message */}
              <p className="text-slate-600 text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Button */}
            {actionText && onAction && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    onAction();
                    onClose();
                  }}
                  className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 focus:bg-cyan-700 active:bg-cyan-800 hover:scale-105 focus:scale-105 active:scale-95 hover:shadow-lg focus:shadow-lg active:shadow-md transition-all duration-300 touch-manipulation select-none"
                >
                  {actionText}
                </button>
              </div>
            )}

            {/* Progress Bar for Auto-close */}
            {autoClose && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                <div 
                  className="h-full bg-green-500 transition-all duration-300 ease-linear"
                  style={{
                    width: '100%',
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </>
  );
} 