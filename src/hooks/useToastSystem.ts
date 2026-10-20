import { useState } from 'react';

// === Toast Notification System + histórico de combate (máx. 5) — lógica idêntica ao App.tsx ===
import type { Toast } from '../types/game';

export const useToastSystem = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [combatHistory, setCombatHistory] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'], duration: number = 3000) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    setToasts((prev) => [...prev, newToast]);

    setCombatHistory((prev) => [newToast, ...prev].slice(0, 5));

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return { toasts, combatHistory, addToast };
};
