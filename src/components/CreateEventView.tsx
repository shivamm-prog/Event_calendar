import React, { useState, useEffect } from 'react';
import { AvenueOfService, EventStatus, RotaractEvent } from '../types/rotaract';
import { useAuth } from '../context/AuthContext';
import { determineStatusFromDate, getTodayString } from '../utils/dateHelpers';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  IndianRupee,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  FileText,
  Tag,
  Link as LinkIcon,
  Radio,
  CheckCircle2,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface CreateEventViewProps {
  onSaveEvent: (eventData: Omit<RotaractEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onNavigateToEvents: () => void;
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

const PRESET_VENUES = [
  'RSCOE Main Auditorium, Tathawade',
  'Seminar Hall 1, D-Building Ground Floor',
  'Seminar Hall 2, Mechanical Building',
  'Central Computing Lab 4, IT Dept',
  'RSCOE Central Lawn / Quadrangle',
  'RSCOE Sports Ground, Tathawade',
  'Virtual Session — Google Meet / Zoom',
];

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  onSaveEvent,
  onNavigateToEvents,
}) => {
  const { isCoreTeam, isBOD, assignedAvenue } = useAuth();
  const todayStr = getTodayString();

  const [title, setTitle] = useState('');
  const [avenue, setAvenue] = useState<AvenueOfService>(
    isBOD && assignedAvenue ? assignedAvenue : 'Community Service'
  );

  React.useEffect(() => {
    if (isBOD && assignedAvenue) {
      setAvenue(assignedAvenue);
    }
  }, [isBOD, assignedAvenue]);
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [venue, setVenue] = useState('RSCOE Main Auditorium, Tathawade');
  const [chairperson, setChairperson] = useState('Rtr. Ananya Joshi');
  const [coChairperson, setCoChairperson] = useState('');
  const [budget, setBudget] = useState('5000');
  const [expectedAttendees, setExpectedAttendees] = useState('100');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [isFlagship, setIsFlagship] = useState(false);

  // Status Selector state: directly 'upcoming' | 'live' | 'past'
  const [status, setStatus] = useState<'upcoming' | 'live' | 'past'>('live');
  const [hasManuallySelectedStatus, setHasManuallySelectedStatus] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // When date changes, update status automatically if user hasn't manually overridden
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!hasManuallySelectedStatus) {
      if (newDate === todayStr) {
        setStatus('live');
      } else if (newDate > todayStr) {
        setStatus('upcoming');
      } else {
        setStatus('past');
      }
    }
  };

  const handleSelectStatus = (newStatus: 'upcoming' | 'live' | 'past') => {
    setStatus(newStatus);
    setHasManuallySelectedStatus(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Please enter an event title.');
      return;
    }

    if (!date) {
      setErrorMsg('Please select an event date.');
      return;
    }

    if (!venue.trim()) {
      setErrorMsg('Please specify the event venue or campus location.');
      return;
    }

    if (!chairperson.trim()) {
      setErrorMsg('Project Chairperson name is required.');
      return;
    }

    if (startTime && endTime && endTime < startTime) {
      setErrorMsg('End time cannot be earlier than start time.');
      return;
    }

    const budgetNum = parseFloat(budget) || 0;
    const attendeesNum = parseInt(expectedAttendees, 10) || 50;

    // Convert 'past' to standard stored status
    const effectiveStatus: EventStatus = status === 'past' ? 'completed' : status;

    const targetAvenue = isBOD && assignedAvenue ? assignedAvenue : avenue;

    onSaveEvent({
      title: trimmedTitle,
      avenue: targetAvenue,
      status: effectiveStatus,
      date,
      startTime,
      endTime,
      venue: venue.trim(),
      chairperson: chairperson.trim(),
      coChairperson: coChairperson.trim() || undefined,
      budget: budgetNum,
      expectedAttendees: attendeesNum,
      description: description.trim() || 'Official project conducted under the Rotaract Club of RSCOE.',
      objectives: objectives.trim() || 'Youth leadership, community outreach, and skill development.',
      registrationLink: registrationLink.trim() || undefined,
      isFlagship,
    });

    setSuccessMsg(
      `Event "${trimmedTitle}" has been scheduled as [${status.toUpperCase()}] successfully!`
    );

    // Reset fields
    setTitle('');
    setDescription('');
    setObjectives('');
    setRegistrationLink('');

    setTimeout(() => {
      onNavigateToEvents();
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      {/* Introduction Card */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-[#800000] shrink-0">
            <Sparkles className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Create & Schedule New Event
            </h2>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              Categorize your event as <strong>Upcoming</strong>, <strong>Live</strong>, or{' '}
              <strong>Past</strong> to schedule it into the appropriate club registry.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#800000]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-semibold text-green-800">
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8 shadow-xs space-y-8">
        {/* Section 1: STATUS SELECTOR (UPCOMING | LIVE | PAST) */}
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/80 pb-3">
            <div>
              <label className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-[#800000]" />
                Event Status Categorization <span className="text-[#800000]">*</span>
              </label>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Choose whether this event is categorized as <strong>Upcoming</strong>, <strong>Live</strong>, or <strong>Past</strong>.
              </p>
            </div>
            {hasManuallySelectedStatus && (
              <button
                type="button"
                onClick={() => {
                  setHasManuallySelectedStatus(false);
                  handleDateChange(date);
                }}
                className="text-xs font-bold text-[#800000] hover:underline self-start sm:self-auto"
              >
                Reset to Auto-by-Date
              </button>
            )}
          </div>

          {/* 3 Status Cards */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* UPCOMING OPTION */}
            <button
              type="button"
              onClick={() => handleSelectStatus('upcoming')}
              className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                status === 'upcoming'
                  ? 'border-[#800000] bg-[#800000] text-white shadow-md ring-2 ring-red-400'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:bg-red-50/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg ${status === 'upcoming' ? 'bg-white/20 text-white' : 'bg-red-100 text-[#800000]'}`}>
                  <Clock className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'upcoming' ? 'bg-white text-[#800000]' : 'bg-gray-100 text-gray-600'}`}>
                  {status === 'upcoming' ? 'Selected' : 'Future'}
                </span>
              </div>
              <span className="mt-3 text-base sm:text-lg font-extrabold">Upcoming</span>
              <p className={`mt-1 text-xs leading-relaxed ${status === 'upcoming' ? 'text-red-100' : 'text-gray-500'}`}>
                Scheduled for a future date. Appears in the Upcoming tab.
              </p>
            </button>

            {/* LIVE OPTION */}
            <button
              type="button"
              onClick={() => handleSelectStatus('live')}
              className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                status === 'live'
                  ? 'border-[#800000] bg-[#800000] text-white shadow-md ring-2 ring-red-400'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:bg-red-50/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg ${status === 'live' ? 'bg-white/20 text-white' : 'bg-red-100 text-[#800000]'}`}>
                  <Radio className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'live' ? 'bg-white text-[#800000]' : 'bg-red-100 text-[#800000]'}`}>
                  {status === 'live' ? 'Selected' : 'Today'}
                </span>
              </div>
              <span className="mt-3 text-base sm:text-lg font-extrabold">Live</span>
              <p className={`mt-1 text-xs leading-relaxed ${status === 'live' ? 'text-red-100' : 'text-gray-500'}`}>
                Happening today or active right now on campus. Appears in Live tab.
              </p>
            </button>

            {/* PAST OPTION */}
            <button
              type="button"
              onClick={() => handleSelectStatus('past')}
              className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                status === 'past'
                  ? 'border-[#800000] bg-[#800000] text-white shadow-md ring-2 ring-red-400'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-red-300 hover:bg-red-50/40'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2 rounded-lg ${status === 'past' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700]'}`}>
                  <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'past' ? 'bg-white text-[#800000]' : 'bg-gray-100 text-gray-600'}`}>
                  {status === 'past' ? 'Selected' : 'Completed'}
                </span>
              </div>
              <span className="mt-3 text-base sm:text-lg font-extrabold">Past</span>
              <p className={`mt-1 text-xs leading-relaxed ${status === 'past' ? 'text-red-100' : 'text-gray-500'}`}>
                Already completed or historical event. Appears in Done / Past tab.
              </p>
            </button>
          </div>
        </div>

        {/* Section 2: Project Details */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#800000] uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            1. Project Identification
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Event Title <span className="text-[#800000]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mega Blood Donation Camp 2026, CodeCraft Hackathon..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-bold text-gray-800">
                  Avenue of Service <span className="text-[#800000]">*</span>
                </label>
                {isBOD ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#800000]">
                    <Lock className="h-3 w-3" />
                    Locked to BOD Avenue
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-green-700">
                    <ShieldCheck className="h-3 w-3" />
                    Core Team (All Avenues)
                  </span>
                )}
              </div>
              <select
                value={isBOD && assignedAvenue ? assignedAvenue : avenue}
                onChange={(e) => {
                  if (isCoreTeam) {
                    setAvenue(e.target.value as AvenueOfService);
                  }
                }}
                disabled={isBOD}
                className={`w-full rounded-xl border px-4 py-2.5 text-base font-medium focus:outline-none ${
                  isBOD
                    ? 'border-red-300 bg-red-50/70 text-gray-800 cursor-not-allowed opacity-90'
                    : 'border-gray-300 bg-white text-gray-900 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20'
                }`}
              >
                {AVENUES.map((av) => (
                  <option key={av} value={av}>
                    {av}
                  </option>
                ))}
              </select>
              {isBOD && (
                <p className="mt-1 text-xs text-[#800000] font-medium">
                  🔒 As a Board of Directors member, your events are automatically registered under your assigned avenue ({assignedAvenue}).
                </p>
              )}
            </div>

            <div className="flex items-center pt-2">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-gray-800 select-none">
                <input
                  type="checkbox"
                  checked={isFlagship}
                  onChange={(e) => setIsFlagship(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-[#800000] accent-[#800000] focus:ring-[#800000]"
                />
                <span>Designate as Flagship / Signature Project</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Schedule & Venue */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#800000] uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            2. Schedule & Venue
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Event Date <span className="text-[#800000]">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Today is {todayStr}
              </span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Venue / Campus Location <span className="text-[#800000]">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. RSCOE Main Auditorium, Tathawade or Google Meet"
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
                <select
                  onChange={(e) => {
                    if (e.target.value) setVenue(e.target.value);
                  }}
                  className="rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-gray-700 focus:border-[#800000]"
                >
                  <option value="">Preset Venues...</option>
                  {PRESET_VENUES.map((pv) => (
                    <option key={pv} value={pv}>
                      {pv}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Leadership & Logistics */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#800000] uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Users className="h-4 w-4" />
            3. Project Leadership & Logistics
          </h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Project Chairperson <span className="text-[#800000]">*</span>
              </label>
              <input
                type="text"
                required
                value={chairperson}
                onChange={(e) => setChairperson(e.target.value)}
                placeholder="e.g. Rtr. Ananya Joshi"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Co-Chairperson (Optional)
              </label>
              <input
                type="text"
                value={coChairperson}
                onChange={(e) => setCoChairperson(e.target.value)}
                placeholder="e.g. Rtr. Omkar Shinde"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Estimated Budget (₹)
              </label>
              <div className="relative">
                <IndianRupee className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Expected Participants / Reach
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="5"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Registration / RSVP Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  placeholder="https://forms.gle/... or https://unstop.com/..."
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-base text-gray-900 font-medium focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Narrative & Objectives */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-[#800000] uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            4. Project Narrative & Goals
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Event Description & Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the background, agenda, speakers, activities, and flow of the event..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Rotaract Strategic Objectives
              </label>
              <textarea
                rows={2}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="What community needs does this serve? What skills will members learn?"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Categorized as:</span>
            <span className="rounded-full bg-[#800000] px-3.5 py-1 text-xs font-black uppercase text-white tracking-wider">
              {status}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onNavigateToEvents}
              className="flex-1 sm:flex-none rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm sm:text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[#800000] px-7 py-2.5 text-sm sm:text-base font-bold text-white hover:bg-[#660000] shadow-md transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Schedule Event
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
