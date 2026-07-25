import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Silme Onayı', 
  message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  confirmText = 'Evet, Sil',
  cancelText = 'Vazgeç',
  isDanger = true,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1E271F] rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-emerald-950/30 z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center pt-2 pb-1">
          {/* Danger Icon Badge */}
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-100 dark:border-red-900/30">
            <Trash2 className="w-8 h-8 animate-bounce" />
          </div>

          {/* Title & Message */}
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="py-3 px-4 bg-gray-100 dark:bg-emerald-950/40 hover:bg-gray-200 dark:hover:bg-emerald-900/40 text-gray-700 dark:text-gray-200 font-bold rounded-2xl text-sm transition-colors"
            >
              {cancelText}
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
