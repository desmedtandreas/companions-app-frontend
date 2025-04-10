import * as Toast from '@radix-ui/react-toast';
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { RiCheckLine, RiErrorWarningLine, RiInformationLine } from '@remixicon/react';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <RiCheckLine className="text-green-300 w-5 h-5" />;
      case 'error':
        return <RiErrorWarningLine className="text-red-300 w-5 h-5" />;
      case 'info':
      default:
        return <RiInformationLine className="text-blue-300 w-5 h-5" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            open
            className={`rounded px-4 py-3 shadow z-50 text-sm font-medium flex items-center gap-3
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
              ${toast.type === 'info' ? 'bg-gray-800 text-white' : ''}
            `}
          >
            {getIcon(toast.type)}
            <Toast.Title>{toast.message}</Toast.Title>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-5 right-5 flex flex-col gap-2 w-80 max-w-full z-50" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
