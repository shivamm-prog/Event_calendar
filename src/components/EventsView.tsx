import React, { useState } from 'react';
import {
  AvenueOfService,
  EventStatus,
  RotaractEvent,
} from '../types/rotaract';
import {
  formatReadableDate,
  formatTime12h,
  getEventEffectiveStatus,
} from '../utils/dateHelpers';
import {
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Radio,
  CheckCircle2,
  Calendar,
  Grid,
  List,
  Download,
  IndianRupee,
  User,
  PlusCircle,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EventsViewProps {
  events: RotaractEvent[];
  onOpenEventDetails: (event: RotaractEvent) => void;
  onEditEvent: (event: RotaractEvent) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onStatusChange: (id: string, newStatus: EventStatus) => void;
  onOpenCreateEvent: () => void;
}

const AVENUES: (AvenueOfService | 'All')[] = [
  'All',
  'Club Service',
  'Community Service',
  'Professional Development',
  'International Service',
  'Technical & Innovations',
  'Sports & Cultural',
  'Public Relations',
];

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onOpenEventDetails,
  onEditEvent,
  onDeleteEvent,
  onStatusChange,
  onOpenCreateEvent,
}) => {
  const { isCoreTeam, isBOD, assignedAvenue, canManageAvenue } = useAuth();
  // Tabs: UPCOMING | LIVE | PAST
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvenue, setSelectedAvenue] = useState<AvenueOfService | 'All'>('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Categorize events by effective status
  const upcomingEvents = events.filter((e) => getEventEffectiveStatus(e) === 'upcoming');
  const liveEvents = events.filter((e) => getEventEffectiveStatus(e) === 'live');
  const pastEvents = events.filter((e) => getEventEffectiveStatus(e) === 'completed');

  const currentTabEvents =
    activeTab === 'upcoming'
      ? upcomingEvents
      : activeTab === 'live'
      ? liveEvents
      : pastEvents;

  // Filter by search and avenue
  const filteredEvents = currentTabEvents.filter((ev) => {
    const matchesAvenue = selectedAvenue === 'All' || ev.avenue === selectedAvenue;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q) ||
      ev.chairperson.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q);
    return matchesAvenue && matchesSearch;
  });

  // Export current list to CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Title',
      'Avenue',
      'Status',
      'Date',
      'StartTime',
      'EndTime',
      'Venue',
      'Chairperson',
      'ExpectedAttendees',
      'ActualAttendees',
      'Budget',
    ];
    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.avenue}"`,
      e.status,
      e.date,
      e.startTime,
      e.endTime,
      `"${e.venue.replace(/"/g, '""')}"`,
      `"${e.chairperson.replace(/"/g, '""')}"`,
      e.expectedAttendees,
      e.actualAttendees || 0,
      e.budget,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rscoe-rotaract-${activeTab}-events-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. THREE CLEARLY VISIBLE TABS: UPCOMING | LIVE | PAST */}
      <div className="rounded-xl border border-red-200 bg-white p-2 sm:p-2.5 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {/* UPCOMING TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-xl py-3 px-3 text-sm sm:text-base font-extrabold tracking-wide uppercase transition-all ${
              activeTab === 'upcoming'
                ? 'bg-[#800000] text-white shadow-sm'
                : 'text-gray-700 hover:bg-red-50 hover:text-[#800000]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 stroke-[2.5]" />
              Upcoming
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                activeTab === 'upcoming'
                  ? 'bg-white text-[#800000]'
                  : 'bg-red-100 text-[#800000]'
              }`}
            >
              {upcomingEvents.length}
            </span>
          </button>

          {/* LIVE TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-xl py-3 px-3 text-sm sm:text-base font-extrabold tracking-wide uppercase transition-all ${
              activeTab === 'live'
                ? 'bg-[#800000] text-white shadow-sm ring-2 ring-red-400'
                : 'text-gray-700 hover:bg-red-50 hover:text-[#800000]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Radio className="h-4 w-4 stroke-[2.5]" />
              Live
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                activeTab === 'live'
                  ? 'bg-white text-[#800000]'
                  : 'bg-red-100 text-[#800000]'
              }`}
            >
              {liveEvents.length}
            </span>
          </button>

          {/* PAST TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-xl py-3 px-3 text-sm sm:text-base font-extrabold tracking-wide uppercase transition-all ${
              activeTab === 'past'
                ? 'bg-[#800000] text-white shadow-sm'
                : 'text-gray-700 hover:bg-red-50 hover:text-[#800000]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
              Past
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                activeTab === 'past'
                  ? 'bg-white text-[#800000]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {pastEvents.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Controls Bar: Search, Avenue Filter, Layout Toggle & Export */}
      <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} events by title, venue, chairperson...`}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]"
          />
        </div>

        {/* Filters and Layout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Avenue Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-4 w-4 text-[#800000]" />
            <select
              value={selectedAvenue}
              onChange={(e) => setSelectedAvenue(e.target.value as AvenueOfService | 'All')}
              className="rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-800 focus:border-[#800000] focus:outline-none"
            >
              {AVENUES.map((av) => (
                <option key={av} value={av}>
                  {av === 'All' ? 'All Avenues' : av}
                </option>
              ))}
            </select>
          </div>

          {/* Grid vs Table Layout */}
          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`rounded p-1.5 text-xs transition-colors ${
                viewLayout === 'grid'
                  ? 'bg-white text-[#800000] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Card Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`rounded p-1.5 text-xs transition-colors ${
                viewLayout === 'table'
                  ? 'bg-white text-[#800000] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-[#800000] hover:bg-red-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Event List or Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-white py-14 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#800000]">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-gray-900">
            No {activeTab.toUpperCase()} events found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-gray-500">
            {searchQuery || selectedAvenue !== 'All'
              ? 'Try modifying your search or avenue filter to see more activities.'
              : `There are currently no events categorized as ${activeTab} in the RSCOE system.`}
          </p>
          <button
            type="button"
            onClick={onOpenCreateEvent}
            className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#800000] px-4 py-2 text-xs font-bold text-white hover:bg-[#660000]"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule New Event
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const effectiveStatus = getEventEffectiveStatus(event);
            const canModify = canManageAvenue(event.avenue);

            return (
              <div
                key={event.id}
                className="flex flex-col rounded-xl border border-red-200 bg-white shadow-xs hover:border-[#800000] hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Top Banner */}
                <div className="border-b border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-bold text-[#800000]">
                      {event.avenue}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!canModify && (
                        <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 border border-gray-200">
                          <Lock className="h-2.5 w-2.5" />
                          BOD {assignedAvenue} View
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          effectiveStatus === 'live'
                            ? 'bg-[#800000] text-white ring-2 ring-red-400'
                            : effectiveStatus === 'upcoming'
                            ? 'bg-red-100 text-[#800000]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {effectiveStatus === 'live' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                        {effectiveStatus}
                      </span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onOpenEventDetails(event)}
                    className="mt-2.5 text-base font-bold text-gray-900 cursor-pointer hover:text-[#800000] transition-colors line-clamp-2"
                  >
                    {event.title}
                  </h3>
                </div>

                {/* Card Body Details */}
                <div className="flex-1 p-4 space-y-2.5 text-xs text-gray-600">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Clock className="h-4 w-4 text-[#800000] shrink-0" />
                    <span>
                      {formatReadableDate(event.date)} · {formatTime12h(event.startTime)} –{' '}
                      {formatTime12h(event.endTime)}
                    </span>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#800000] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>

                  {/* Chairperson */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#800000] shrink-0" />
                    <span className="truncate">Chair: {event.chairperson}</span>
                  </div>

                  {/* Attendees & Budget */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-gray-700">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-500" />
                      {effectiveStatus === 'completed'
                        ? `${event.actualAttendees || 0} Attended`
                        : `${event.expectedAttendees} Expected`}
                    </span>
                    <span className="flex items-center gap-0.5 font-bold text-[#800000]">
                      <IndianRupee className="h-3 w-3" />
                      {event.budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-gray-100 bg-gray-50/50 p-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenEventDetails(event)}
                    className="flex items-center gap-1 text-xs font-bold text-[#800000] hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {canModify ? (
                      <>
                        {/* Status quick toggle */}
                        {effectiveStatus === 'upcoming' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'live')}
                              className="rounded bg-[#800000] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#660000]"
                              title="Schedule as Live right now"
                            >
                              Start Live
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'completed')}
                              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                              title="Mark event as Done / Completed"
                            >
                              Mark Done
                            </button>
                          </>
                        )}
                        {effectiveStatus === 'live' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'completed')}
                              className="rounded bg-[#800000] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#660000]"
                              title="Mark event as Done / Completed"
                            >
                              Mark Done
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'upcoming')}
                              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                              title="Reschedule as Upcoming"
                            >
                              To Upcoming
                            </button>
                          </>
                        )}
                        {effectiveStatus === 'completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'live')}
                              className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-bold text-[#800000] hover:bg-red-100"
                              title="Reopen event as Live today"
                            >
                              Reopen Live
                            </button>
                            <button
                              type="button"
                              onClick={() => onStatusChange(event.id, 'upcoming')}
                              className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                              title="Reschedule as Upcoming"
                            >
                              To Upcoming
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onEditEvent(event)}
                          className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-[#800000]"
                          title="Edit event"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(event.id, event.title)}
                          className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-[#800000]"
                          title="Delete event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span
                        className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500 border border-gray-200"
                        title={`Restricted to ${event.avenue} avenue`}
                      >
                        <Lock className="h-3 w-3 text-gray-400" />
                        Read-Only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="overflow-x-auto rounded-xl border border-red-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#660000] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-3">Avenue</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Venue</th>
                <th className="py-3 px-3">Lead Chair</th>
                <th className="py-3 px-3">Attendees</th>
                <th className="py-3 px-3">Budget</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-red-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">
                    <button
                      type="button"
                      onClick={() => onOpenEventDetails(event)}
                      className="text-left hover:text-[#800000] hover:underline"
                    >
                      {event.title}
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#800000]">
                      {event.avenue}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium whitespace-nowrap">
                    <div>{formatReadableDate(event.date)}</div>
                    <div className="text-[10px] text-gray-500">
                      {formatTime12h(event.startTime)}
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-[150px] truncate">{event.venue}</td>
                  <td className="py-3 px-3 truncate">{event.chairperson}</td>
                  <td className="py-3 px-3 font-semibold">
                    {event.actualAttendees || event.expectedAttendees}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#800000]">
                    ₹{event.budget.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenEventDetails(event)}
                      className="p-1 text-gray-600 hover:text-[#800000]"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canManageAvenue(event.avenue) ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditEvent(event)}
                          className="p-1 text-gray-600 hover:text-[#800000] ml-1"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(event.id, event.title)}
                          className="p-1 text-gray-600 hover:text-[#800000] ml-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="ml-2 text-[10px] text-gray-400 italic">Read-only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
