import React from 'react';
import type { Toast } from '../types/game';

interface ToastContainerProps {
  toasts: Toast[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'levelup':
        return {
          border: 'border-yellow-400',
          bg: 'bg-gradient-to-r from-yellow-900/90 to-amber-900/90',
          text: 'text-yellow-100',
          shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)]',
          animate: 'animate-toast-levelup',
        };
      case 'drop':
        return {
          border: 'border-purple-400',
          bg: 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90',
          text: 'text-purple-100',
          shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
          animate: 'animate-toast-drop',
        };
      case 'boss':
        return {
          border: 'border-red-500',
          bg: 'bg-gradient-to-r from-red-900/90 to-rose-900/90',
          text: 'text-red-100',
          shadow: 'shadow-[0_0_25px_rgba(239,68,68,0.6)]',
          animate: 'animate-toast-boss',
        };
      case 'info':
      default:
        return {
          border: 'border-blue-400',
          bg: 'bg-gradient-to-r from-blue-900/90 to-cyan-900/90',
          text: 'text-blue-100',
          shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
          animate: 'animate-toast-info',
        };
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`${styles.bg} ${styles.border} ${styles.text} ${styles.shadow} ${styles.animate} 
                       border-2 rounded-lg px-6 py-3 min-w-[300px] max-w-[500px]
                       backdrop-blur-sm`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold tracking-wide">{toast.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
