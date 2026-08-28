import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const AlertModal: React.FC<Props> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold text-rose-600 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  );
};
