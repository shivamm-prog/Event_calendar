import React, { useState, useEffect } from 'react';
import { AvenueOfService, EventStatus, RotaractEvent } from '../types/rotaract';
import { X, Calendar, Edit3, AlertCircle, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EventFormModalProps {
  isOpen: boolean;
  event: RotaractEvent | null;
  onClose: () => void;
  onSave: (eventData: Omit<RotaractEvent, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
}

const AVENUES: AvenueOfService[] = [
  'Club Service',
  'Community Service',
  'Professional Development',
  'International Service',
  'Technical & Innovations',
  'Sports & Cultural',
  'Public Relations',
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  event,
  onClose,
  onSave,
}) => {
  const { isCoreTeam, isBOD, assignedAvenue, canManageAvenue } = useAuth();

  const [title, setTitle] = useState('');
  const [avenue, setAvenue] = useState<AvenueOfService>('Community Service');
  const [status, setStatus] = useState<EventStatus>('upcoming');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venue, setVenue] = useState('');
  const [chairperson, setChairperson] = useState('');
  const [coChairperson, setCoChairperson] = useState('');
  const [budget, setBudget] = useState('0');
  const [actualExpense, setActualExpense] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('100');
  const [actualAttendees, setActualAttendees] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [isFlagship, setIsFlagship] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasPermission = event ? canManageAvenue(event.avenue) : false;

  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setAvenue(event.avenue);
      setStatus(event.status);
      setDate(event.date);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setVenue(event.venue);
      setChairperson(event.chairperson);
      setCoChairperson(event.coChairperson || '');
      setBudget(String(event.budget));
      setActualExpense(event.actualExpense ? String(event.actualExpense) : '');
      setExpectedAttendees(String(event.expectedAttendees));
      setActualAttendees(event.actualAttendees ? String(event.actualAttendees) : '');
      setDescription(event.description || '');
      setObjectives(event.objectives || '');
      setRegistrationLink(event.registrationLink || '');
      setIsFlagship(!!event.isFlagship);
      setReportSummary(event.reportSummary || '');
      setErrorMsg(null);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hasPermission) {
      setErrorMsg(
        `Permission Denied: You cannot modify events in "${event.avenue}". You are assigned to "${assignedAvenue}".`
      );
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Event title is required.');
      return;
    }
    if (!date) {
      setErrorMsg('Event date is required.');
      return;
    }
    if (!venue.trim()) {
      setErrorMsg('Event venue is required.');
      return;
    }

    // If BOD, avenue cannot be altered
    const targetAvenue = isBOD ? event.avenue : avenue;

    onSave(
      {
        title: trimmedTitle,
        avenue: targetAvenue,
        status,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        chairperson: chairperson.trim() || 'Club Committee',
        coChairperson: coChairperson.trim() || undefined,
        budget: parseFloat(budget) || 0,
        actualExpense: actualExpense ? parseFloat(actualExpense) : undefined,
        expectedAttendees: parseInt(expectedAttendees, 10) || 50,
        actualAttendees: actualAttendees ? parseInt(actualAttendees, 10) : undefined,
        description: description.trim(),
        objectives: objectives.trim(),
        registrationLink: registrationLink.trim() || undefined,
        reportSummary: reportSummary.trim() || undefined,
        isFlagship,
      },
      event.id
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-event-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#800000] text-white">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 id="edit-event-title" className="text-base font-bold text-gray-900">
                Edit Event: {event.title}
              </h3>
              <p className="text-xs text-gray-500">Update event details and reports</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Permission Banner */}
        {!hasPermission ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#800000] mt-0.5" />
            <div>
              <span className="font-extrabold block">Read-Only Permission</span>
              <p className="mt-0.5 leading-relaxed text-red-800">
                You are assigned to the <strong>{assignedAvenue}</strong> avenue as a Board of Directors member. You do not have permission to modify events in <strong>{event.avenue}</strong>.
              </p>
            </div>
          </div>
        ) : isBOD ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 p-2.5 text-xs text-[#800000]">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Authorized BOD Editor for <strong>{assignedAvenue}</strong> avenue. Avenue cannot be transferred.</span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/60 p-2.5 text-xs text-green-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-green-700" />
            <span>Core Team Administrator privileges active. You may modify all parameters including avenue.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-800 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#800000]" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase">
              Event Title <span className="text-[#800000]">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!hasPermission}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-gray-700 uppercase">Avenue of Service</label>
                {isBOD && (
                  <span className="text-[10px] text-[#800000] font-bold flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Locked
                  </span>
                )}
              </div>
              <select
                value={isBOD ? event.avenue : avenue}
                onChange={(e) => {
                  if (isCoreTeam) {
                    setAvenue(e.target.value as AvenueOfService);
                  }
                }}
                disabled={!hasPermission || isBOD}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {AVENUES.map((av) => (
                  <option key={av} value={av}>
                    {av}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
                Event Status Categorization
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  type="button"
                  disabled={!hasPermission}
                  onClick={() => setStatus('upcoming')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all disabled:opacity-50 ${
                    status === 'upcoming'
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  disabled={!hasPermission}
                  onClick={() => setStatus('live')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all disabled:opacity-50 ${
                    status === 'live'
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Live
                </button>
                <button
                  type="button"
                  disabled={!hasPermission}
                  onClick={() => setStatus('completed')}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all disabled:opacity-50 ${
                    status === 'completed' || status === 'past'
                      ? 'bg-[#800000] text-white shadow-xs'
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase">Date</label>
              <input
                type="date"
                required
                disabled={!hasPermission}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">Start Time</label>
              <input
                type="time"
                disabled={!hasPermission}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">End Time</label>
              <input
                type="time"
                disabled={!hasPermission}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase">Venue / Campus Location</label>
            <input
              type="text"
              required
              disabled={!hasPermission}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase">Chairperson</label>
              <input
                type="text"
                disabled={!hasPermission}
                value={chairperson}
                onChange={(e) => setChairperson(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">Co-Chairperson</label>
              <input
                type="text"
                disabled={!hasPermission}
                value={coChairperson}
                onChange={(e) => setCoChairperson(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase">Budget (₹)</label>
              <input
                type="number"
                disabled={!hasPermission}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">Actual Exp (₹)</label>
              <input
                type="number"
                disabled={!hasPermission}
                value={actualExpense}
                onChange={(e) => setActualExpense(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">Expected Att.</label>
              <input
                type="number"
                disabled={!hasPermission}
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase">Actual Att.</label>
              <input
                type="number"
                disabled={!hasPermission}
                value={actualAttendees}
                onChange={(e) => setActualAttendees(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase">Description</label>
            <textarea
              rows={2}
              disabled={!hasPermission}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase">Report / Completion Notes</label>
            <textarea
              rows={2}
              disabled={!hasPermission}
              value={reportSummary}
              onChange={(e) => setReportSummary(e.target.value)}
              placeholder="Notes for District 3131 report..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-[#800000] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasPermission}
              className="rounded-lg bg-[#800000] px-5 py-2 text-xs font-bold text-white hover:bg-[#660000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
