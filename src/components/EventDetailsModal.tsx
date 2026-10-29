import React from 'react';
import { RotaractEvent, EventStatus } from '../types/rotaract';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Radio,
  ExternalLink,
  Target,
  FileText,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import {
  formatFullDate,
  formatTime12h,
  getEventEffectiveStatus,
} from '../utils/dateHelpers';
import { useAuth } from '../context/AuthContext';

interface EventDetailsModalProps {
  isOpen: boolean;
  event: RotaractEvent | null;
  onClose: () => void;
  onEdit: (event: RotaractEvent) => void;
  onDelete: (id: string, title: string) => void;
  onStatusChange: (id: string, newStatus: EventStatus) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { isCoreTeam, isBOD, assignedAvenue, canManageAvenue } = useAuth();

  if (!isOpen || !event) return null;

  const effectiveStatus = getEventEffectiveStatus(event);
  const canEdit = canManageAvenue(event.avenue);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-[#800000]">
                {event.avenue}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                  effectiveStatus === 'live'
                    ? 'bg-[#800000] text-white ring-2 ring-red-400'
                    : effectiveStatus === 'upcoming'
                    ? 'bg-red-100 text-[#800000]'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {effectiveStatus}
              </span>
              {event.isFlagship && (
                <span className="rounded bg-[#800000] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Flagship
                </span>
              )}
              {!canEdit && (
                <span className="rounded bg-gray-100 text-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Read-Only (BOD {assignedAvenue})
                </span>
              )}
            </div>

            <h2 id="dossier-title" className="mt-2 text-xl font-black text-gray-900 leading-tight">
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-gray-700">
          {!canEdit && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-[#800000]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                You are viewing this event as BOD for <strong>{assignedAvenue}</strong>. Modifications are reserved for <strong>{event.avenue}</strong> directors or Core Team administrators.
              </span>
            </div>
          )}

          {/* Key Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-red-100 bg-red-50/30 p-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-[#800000] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Date</span>
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {formatFullDate(event.date)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-[#800000] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Time</span>
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:col-span-2">
              <MapPin className="h-4 w-4 text-[#800000] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Venue</span>
                <span className="font-semibold text-gray-900">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Leaders, Budget & Audience */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">
                Project Chair
              </span>
              <span className="font-bold text-gray-900 mt-0.5 block truncate">
                {event.chairperson}
              </span>
              {event.coChairperson && (
                <span className="text-[10px] text-gray-500 block truncate">
                  Co-chair: {event.coChairperson}
                </span>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Attendees</span>
              <span className="font-bold text-gray-900 mt-0.5 block">
                {event.actualAttendees
                  ? `${event.actualAttendees} Confirmed`
                  : `${event.expectedAttendees} Expected`}
              </span>
            </div>

            <div className="rounded-lg border border-gray-200 p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-gray-500 block">Budget (₹)</span>
              <span className="font-bold text-[#800000] mt-0.5 block text-sm">
                ₹{event.budget.toLocaleString('en-IN')}
                {event.actualExpense && (
                  <span className="text-[10px] text-gray-500 block font-normal">
                    Actual: ₹{event.actualExpense.toLocaleString('en-IN')}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Project Description & Flow
              </span>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-xs leading-relaxed text-gray-800">
                {event.description}
              </div>
            </div>
          )}

          {/* Objectives */}
          {event.objectives && (
            <div>
              <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Objectives & Community Impact
              </span>
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-xs leading-relaxed text-gray-800 flex items-start gap-2">
                <Target className="h-4 w-4 text-[#800000] shrink-0 mt-0.5" />
                <span>{event.objectives}</span>
              </div>
            </div>
          )}

          {/* Registration Link */}
          {event.registrationLink && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#800000] text-xs">Public Registration Link</span>
                <p className="text-[11px] text-gray-600 truncate max-w-sm">
                  {event.registrationLink}
                </p>
              </div>
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded bg-[#800000] px-3 py-1 text-xs font-bold text-white hover:bg-[#660000]"
              >
                <span>Open</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Report Summary if completed */}
          {event.reportSummary && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5">
              <span className="text-xs font-bold text-gray-900 uppercase block mb-1">
                Post-Event Completion Notes
              </span>
              <p className="text-xs text-gray-600">{event.reportSummary}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          {canEdit ? (
            <button
              type="button"
              onClick={() => onDelete(event.id, event.title)}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-[#800000] hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Event
            </button>
          ) : (
            <span className="text-[11px] text-gray-400 italic">Editing restricted to {event.avenue}</span>
          )}

          <div className="flex items-center gap-2">
            {canEdit && effectiveStatus !== 'completed' && (
              <button
                type="button"
                onClick={() => onStatusChange(event.id, 'completed')}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-gray-500" />
                Mark Completed
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="flex items-center gap-1 rounded-lg bg-[#800000] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#660000]"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Event
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
