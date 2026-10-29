import React, { useRef, useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CalendarEvent } from '../types/calendar';
import { exportEventsToFile, parseImportedJson } from '../utils/storage';

interface StorageInfoModalProps {
  isOpen: boolean;
  events: CalendarEvent[];
  onClose: () => void;
  onImportEvents: (newEvents: CalendarEvent[]) => void;
  onResetToSeed: () => void;
}

export const StorageInfoModal: React.FC<StorageInfoModalProps> = ({
  isOpen,
  events,
  onClose,
  onImportEvents,
  onResetToSeed,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportEventsToFile(events);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseImportedJson(content);
      if (res.success && res.events) {
        onImportEvents(res.events);
        setImportStatus(`Successfully imported ${res.events.length} events!`);
      } else {
        setImportError(res.error || 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => {
      setImportError('Error reading uploaded file.');
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="storage-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 id="storage-modal-title" className="text-lg font-bold text-gray-900">
              Storage & Data Management
            </h3>
            <p className="text-xs text-gray-500">Local browser persistence settings</p>
          </div>
        </div>

        {/* LocalStorage Notice */}
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50/60 p-3.5 text-sm text-gray-800">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="space-y-1">
              <p className="font-semibold text-red-900">Browser LocalStorage Notice</p>
              <p className="text-xs leading-relaxed text-gray-700">
                All your calendar events and task states are saved securely in your current browser's{' '}
                <span className="font-mono font-medium">localStorage</span>. Data is private to this machine and does{' '}
                <strong>not</strong> synchronize across different devices, incognito windows, or distinct browsers.
              </p>
              <p className="text-xs text-gray-600">
                To move your calendar to another device or keep a safe backup, use the Export and Import options below.
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {importStatus && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2.5 text-xs text-green-800">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span>{importStatus}</span>
          </div>
        )}

        {importError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{importError}</span>
          </div>
        )}

        {/* Action Tools */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Export Backup</p>
              <p className="text-xs text-gray-500">Download your calendar events as a .json file</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON ({events.length})
            </button>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Import Calendar</p>
              <p className="text-xs text-gray-500">Restore events from a previously saved JSON file</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-3.5 w-3.5 text-gray-600" />
                Select File
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Reset to Sample Data</p>
              <p className="text-xs text-gray-500">Restores starter college, project, and personal events</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all events to default starter items? Existing events will be replaced.')) {
                  onResetToSeed();
                  setImportStatus('Reset to sample starter events.');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Data
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
