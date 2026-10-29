import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  eventTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="relative w-full max-w-md rounded-xl border border-red-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#800000]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-gray-900">
              Delete Event from System?
            </h3>
            <p className="mt-1 text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{eventTitle}"</span>?
              This will remove all associated participant metrics and district reporting records.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-[#800000] px-4 py-2 text-xs font-bold text-white hover:bg-[#660000]"
          >
            <Trash2 className="h-4 w-4" />
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
