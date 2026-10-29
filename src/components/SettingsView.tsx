import React, { useRef, useState, useEffect } from 'react';
import { RotaractEvent, ClubMember } from '../types/rotaract';
import {
  Settings,
  Database,
  Download,
  Upload,
  RotateCcw,
  Award,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Sparkles,
  Cloud,
  CloudUpload,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadStoredEvents } from '../utils/rotaractData';
import { migrateLocalEventsToFirestore } from '../services/eventService';

interface SettingsViewProps {
  events: RotaractEvent[];
  members: ClubMember[];
  onImportData: (events: RotaractEvent[], members?: ClubMember[]) => void;
  onClearAllEvents: () => void;
  onLoadDemoEvents: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  events,
  members,
  onImportData,
  onClearAllEvents,
  onLoadDemoEvents,
}) => {
  const { userProfile, isCoreTeam, isBOD, assignedAvenue } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Migration state
  const [localEvents, setLocalEvents] = useState<RotaractEvent[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    try {
      const stored = loadStoredEvents();
      setLocalEvents(stored);
    } catch {
      setLocalEvents([]);
    }
  }, []);

  const handleMigrateToFirestore = async () => {
    if (!userProfile) return;
    if (localEvents.length === 0) {
      setErrorMsg('No local events found in browser storage to migrate.');
      return;
    }

    setIsMigrating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await migrateLocalEventsToFirestore(localEvents, userProfile);
      if (result.errors.length > 0) {
        setErrorMsg(
          `Migrated ${result.successCount} events with ${result.errors.length} warnings. (Ensure avenue authorization matches).`
        );
      } else {
        setSuccessMsg(
          `Successfully migrated ${result.successCount} local events directly into Cloud Firestore! They are now synced in real time across all members.`
        );
      }
    } catch (err: any) {
      setErrorMsg(`Migration failed: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      club: 'Rotaract Club of RSCOE, Tathawade',
      district: 'R.I. District 3131',
      events,
      members,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotaract-rscoe-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg('Complete club database exported as JSON backup.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.events)) {
          onImportData(parsed.events, Array.isArray(parsed.members) ? parsed.members : undefined);
          setSuccessMsg(`Successfully imported ${parsed.events.length} events!`);
        } else if (Array.isArray(parsed)) {
          onImportData(parsed);
          setSuccessMsg(`Successfully imported ${parsed.length} events!`);
        } else {
          setErrorMsg('Uploaded file does not match expected format.');
        }
      } catch (err: any) {
        setErrorMsg('Error parsing JSON backup file: ' + err.message);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Club Identity Information */}
      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#800000]">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Rotaract Club of Rajarshi Shahu College of Engineering
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              JSPM Campus, Tathawade, Pimpri-Chinchwad, Pune — 411033
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <span className="font-semibold text-gray-500 block">Sponsoring Rotary Club</span>
                <span className="font-bold text-[#800000] text-sm">Rotary Club of Pune Nigdi</span>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <span className="font-semibold text-gray-500 block">Rotary International</span>
                <span className="font-bold text-[#800000] text-sm">District 3131 · Zone 4</span>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <span className="font-semibold text-gray-500 block">Host Institution</span>
                <span className="font-bold text-gray-900 text-sm">JSPM's RSCOE (Autonomous)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Firestore Shared Storage Status & Migration */}
      <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-[#800000]">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Cloud Firestore Real-Time Shared Storage</h3>
              <p className="text-xs text-gray-500">
                Shared database active: all Core Team and BOD members see the same live synchronized calendar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-green-50 border border-green-300 px-3 py-1 text-xs font-bold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Firestore Connected
            </span>
          </div>
        </div>

        {/* Local Storage Migration Card */}
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CloudUpload className="h-5 w-5 text-[#800000]" />
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                  Migrate Browser LocalStorage Events to Cloud
                </h4>
              </div>
              <p className="mt-1 text-xs text-gray-600 max-w-xl leading-relaxed">
                If you have existing events previously saved in your browser's localStorage ({localEvents.length} detected), click below to securely upload and migrate them into Cloud Firestore so all club members can view and access them.
              </p>
            </div>

            <button
              type="button"
              onClick={handleMigrateToFirestore}
              disabled={isMigrating || localEvents.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#800000] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#660000] disabled:opacity-50 transition-all shrink-0 shadow-sm"
            >
              <CloudUpload className="h-4 w-4" />
              <span>{isMigrating ? 'Migrating...' : `Migrate Local Events (${localEvents.length})`}</span>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 p-3 text-xs font-semibold text-green-800">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#800000]" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* JSON Backup, Restore, and Reset */}
      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
          <Database className="h-5 w-5 text-[#800000]" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Backup & System Tools</h3>
            <p className="text-xs text-gray-500">
              Download offline club dossiers, restore historical data, or load templates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Export */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Export Backup</h4>
              <p className="mt-1 text-xs text-gray-500">
                Download JSON file of all {events.length} events and {members.length} members.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-[#800000] px-4 py-2 text-xs font-bold text-white hover:bg-[#660000]"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </button>
          </div>

          {/* Import */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Import / Restore</h4>
              <p className="mt-1 text-xs text-gray-500">
                Restore previously exported JSON backup file.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </button>
          </div>

          {/* Load Sample Demo Events */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 p-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900">Load RSCOE Sample Events</h4>
              <p className="mt-1 text-xs text-gray-500">
                Populate standard club projects (Blood Donation, Hackathon, Cleanliness Drive).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Load sample RSCOE events?')) {
                  onLoadDemoEvents();
                  setSuccessMsg('Loaded RSCOE sample activities successfully.');
                }
              }}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-[#800000] hover:bg-red-100"
            >
              <Sparkles className="h-4 w-4" />
              Load Sample Events
            </button>
          </div>

          {/* Clear All Events */}
          <div className="flex flex-col justify-between rounded-xl border border-red-200 p-4 bg-red-50/20">
            <div>
              <h4 className="text-sm font-bold text-red-900">Clear All Events</h4>
              <p className="mt-1 text-xs text-gray-500">
                Wipe all event records and schedule items.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete ALL events?')) {
                  onClearAllEvents();
                  setSuccessMsg('All events have been cleared.');
                }
              }}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
