'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = React.useCallback((message, type = 'success') => {
    const id = `toast-${++toastIdCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  // Intercept window.alert and show toast notifications dynamically based on text content
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      const msg = String(message);
      let type = 'info';

      const lowerMsg = msg.toLowerCase();
      if (
        lowerMsg.includes('banner') &&
        (lowerMsg.includes('updated') || lowerMsg.includes('success') || lowerMsg.includes('removed') || lowerMsg.includes('added')) &&
        !lowerMsg.includes('fail') &&
        !lowerMsg.includes('error')
      ) {
        type = 'success';
      } else if (
        msg.includes('✓') ||
        lowerMsg.includes('success') ||
        lowerMsg.includes('saved') ||
        lowerMsg.includes('deleted') ||
        lowerMsg.includes('removed') ||
        lowerMsg.includes('updated') ||
        lowerMsg.includes('added') ||
        lowerMsg.includes('loaded') ||
        lowerMsg.includes('linked')
      ) {
        type = 'success';
      } else if (
        lowerMsg.includes('fail') ||
        lowerMsg.includes('error') ||
        lowerMsg.includes('could not') ||
        lowerMsg.includes('unable')
      ) {
        type = 'error';
      } else if (
        lowerMsg.includes('required') ||
        lowerMsg.includes('must') ||
        lowerMsg.includes('please') ||
        lowerMsg.includes('invalid') ||
        lowerMsg.includes('warning') ||
        lowerMsg.includes('⚠️') ||
        lowerMsg.includes('empty')
      ) {
        type = 'warning';
      } else {
        type = 'info';
      }

      // Clean emojis at the start of messages for a cleaner enterprise UI
      let cleanMsg = msg
        .replace(/^⚠️\s*/, '')
        .replace(/^✓\s*/, '')
        .replace(/^✕\s*/, '')
        .replace(/^🚀\s*/, '');

      if (cleanMsg.toLowerCase().includes('section title and content')) {
        cleanMsg = 'Please fill in both section title and content.';
        type = 'warning';
      }

      showToast(cleanMsg, type);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container (top-right) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => {
          const isSectionTitleError = toast.message.toLowerCase().includes('section title and content') || toast.message.toLowerCase().includes('both section title and content');

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-xl border-l-4 border-y border-r transition-all duration-300 transform translate-x-0 hover:scale-[1.02] hover:shadow-2xl animate-in slide-in-from-right-8 fade-in ${isSectionTitleError
                  ? 'bg-gradient-to-r from-orange-500/95 to-rose-600/95 border-rose-500 text-white shadow-rose-500/15 backdrop-blur-md'
                  : toast.type === 'success'
                    ? 'bg-emerald-50/90 border-y-emerald-100 border-r-emerald-100 border-l-emerald-500 text-emerald-950 shadow-emerald-500/5 backdrop-blur-md'
                    : toast.type === 'error'
                      ? 'bg-rose-50/90 border-y-rose-100 border-r-rose-100 border-l-rose-500 text-rose-950 shadow-rose-500/5 backdrop-blur-md'
                      : toast.type === 'warning'
                        ? 'bg-amber-50/90 border-y-amber-100 border-r-amber-100 border-l-amber-500 text-amber-950 shadow-amber-500/5 backdrop-blur-md'
                        : 'bg-blue-50/90 border-y-blue-100 border-r-blue-100 border-l-blue-500 text-blue-950 shadow-blue-500/5 backdrop-blur-md'
                }`}
            >
              {isSectionTitleError ? (
                <svg className="w-5 h-5 text-white shrink-0 mt-0.5 animate-in fade-in zoom-in-95 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                </svg>
              ) : (
                <>
                  {toast.type === 'success' && (
                    <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-in fade-in zoom-in-95 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-in fade-in zoom-in-95 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                  )}
                  {toast.type === 'warning' && (
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-in fade-in zoom-in-95 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
                    </svg>
                  )}
                  {toast.type === 'info' && (
                    <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-in fade-in zoom-in-95 duration-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.085 1.086L12.5 13.5H13.75a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75V11.25Zm.75-3a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  )}
                </>
              )}
              <div className="flex-1 text-xs font-bold font-sans pr-1 leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={`transition border-none bg-transparent cursor-pointer text-sm shrink-0 leading-none ${isSectionTitleError ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-650'
                  }`}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
