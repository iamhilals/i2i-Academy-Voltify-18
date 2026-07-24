import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

// Global toast merkezi. `voltify_toast` custom event'ini dinler ve sağ üstte
// gösterir. Aynı mesaj tekrar tetiklenirse (ör. 2 sn'lik polling hatası) yeni
// toast eklemez — böylece ekran spam olmaz. Ham stack trace ASLA gösterilmez.
let idCounter = 0;

const STYLES = {
  error: {
    icon: AlertTriangle,
    ring: 'border-red-200 dark:border-red-900/40',
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  success: {
    icon: CheckCircle,
    ring: 'border-emerald-200 dark:border-emerald-900/40',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  info: {
    icon: Info,
    ring: 'border-blue-200 dark:border-blue-900/40',
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
};

const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { message, type = 'error' } = e.detail || {};
      if (!message) return;
      const id = ++idCounter;
      setToasts((prev) => {
        if (prev.some((t) => t.message === message)) return prev; // dedupe
        return [...prev, { id, message, type }];
      });
      setTimeout(() => remove(id), 5000);
    };
    window.addEventListener('voltify_toast', handler);
    return () => window.removeEventListener('voltify_toast', handler);
  }, [remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-[min(92vw,380px)]">
      {toasts.map((t) => {
        const style = STYLES[t.type] || STYLES.error;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            role="alert"
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md
              bg-white/95 dark:bg-[#1E271F]/95 ${style.ring} animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
              <Icon className={`w-5 h-5 ${style.accent}`} />
            </div>
            <p className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug pt-1">
              {t.message}
            </p>
            <button
              onClick={() => remove(t.id)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastHost;
