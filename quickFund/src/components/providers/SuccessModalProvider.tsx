"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import SuccessModal from '@/components/ui/SuccessModal';

interface SuccessModalContextType {
  showSuccess: (title: string, message: string, options?: SuccessModalOptions) => void;
  hideSuccess: () => void;
}

interface SuccessModalOptions {
  actionText?: string;
  onAction?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SuccessModalContext = createContext<SuccessModalContextType | undefined>(undefined);

export function SuccessModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionText, setActionText] = useState<string | undefined>();
  const [onAction, setOnAction] = useState<(() => void) | undefined>();
  const [autoClose, setAutoClose] = useState(true);
  const [autoCloseDelay, setAutoCloseDelay] = useState(3000);

  const showSuccess = (
    title: string, 
    message: string, 
    options: SuccessModalOptions = {}
  ) => {
    setTitle(title);
    setMessage(message);
    setActionText(options.actionText);
    setOnAction(options.onAction);
    setAutoClose(options.autoClose ?? true);
    setAutoCloseDelay(options.autoCloseDelay ?? 3000);
    setIsOpen(true);
  };

  const hideSuccess = () => {
    setIsOpen(false);
    // Reset state after a short delay to allow for smooth transitions
    setTimeout(() => {
      setTitle('');
      setMessage('');
      setActionText(undefined);
      setOnAction(undefined);
    }, 300);
  };

  return (
    <SuccessModalContext.Provider value={{ showSuccess, hideSuccess }}>
      {children}
      
      <SuccessModal
        isOpen={isOpen}
        onClose={hideSuccess}
        title={title}
        message={message}
        actionText={actionText}
        onAction={onAction}
        autoClose={autoClose}
        autoCloseDelay={autoCloseDelay}
      />
    </SuccessModalContext.Provider>
  );
}

export function useSuccessModal() {
  const context = useContext(SuccessModalContext);
  if (context === undefined) {
    throw new Error('useSuccessModal must be used within a SuccessModalProvider');
  }
  return context;
} 