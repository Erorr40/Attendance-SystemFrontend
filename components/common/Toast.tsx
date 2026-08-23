import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />,
  error: <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
  info: <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
};

const COLORS = {
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => {
      const newToasts = [{ id, message, type, duration }, ...prev];
      return newToasts.slice(0, 5); // Keep max 5 toasts
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${COLORS[toast.type]} backdrop-blur-sm bg-white/90 dark:bg-[#0F1724]/90`}
    >
      <div className="shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1 text-sm font-medium text-[#263238] dark:text-gray-100 pr-4">
        {toast.message}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 -m-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
