import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
