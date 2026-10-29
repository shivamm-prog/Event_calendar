import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Radio,
  ArrowRight,
  PlusCircle,
  FileText,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { RotaractEvent } from '../types/rotaract';
import {
  formatFullDate,
  formatReadableDate,
  formatTime12h,
  getEventEffectiveStatus,
  getTodayString,
  MONTH_NAMES,
} from '../utils/dateHelpers';

interface DashboardViewProps {
  events: RotaractEvent[];
  onNavigateToTab: (tab: 'calendar' | 'events' | 'create_event' | 'reports') => void;
  onOpenEventDetails: (event: RotaractEvent) => void;
  onSelectEventDateInCalendar: (dateStr: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  onNavigateToTab,
  onOpenEventDetails,
  onSelectEventDateInCalendar,
}) => {
  const todayStr = getTodayString();

  // Calculate actual statistics dynamically from events
  const totalEventsCount = events.length;
  const liveEvents = events.filter((e) => getEventEffectiveStatus(e) === 'live');
  const upcomingEvents = events
    .filter((e) => getEventEffectiveStatus(e) === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedEvents = events
    .filter((e) => getEventEffectiveStatus(e) === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  // Today's events
  const todayEvents = events.filter((e) => e.date === todayStr);

  // Compact monthly calendar calculation for current month
  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Days array for compact calendar
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = events.some((e) => e.date === dStr);
    const isToday = dStr === todayStr;
    calendarDays.push({ dayNumber: d, dateStr: dStr, hasEvent, isToday });
  }

  return (
    <div className="space-y-6">
      {/* Blank State Onboarding Banner */}
      {totalEventsCount === 0 && (
        <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#800000]" />
              Event Schedule is Blank & Ready
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              All previous events have been removed. Add your club events, and the system will
              automatically schedule whether each event is <strong>Live</strong> (happening today),{' '}
              <strong>Upcoming</strong> (future date), or <strong>Done</strong> (completed/past).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('create_event')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#800000] px-4 py-2 text-xs font-bold text-white hover:bg-[#660000] shadow-xs shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule First Event
          </button>
        </div>
      )}

      {/* 1. Statistics Cards Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Events */}
        <div className="rounded-xl border border-red-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c0000]">
              Total Events
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-[#5c0000]">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {totalEventsCount}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Rotary Year 2026-27</p>
          </div>
        </div>

        {/* Live Events */}
        <div className="rounded-xl border border-red-300 bg-white p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-1.5 w-full bg-[#800000]" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#800000]"></span>
              </span>
              Live Events
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-[#800000]">
              <Radio className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#800000]">
              {liveEvents.length}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Happening today</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-red-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5c0000]">
              Upcoming
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-[#5c0000]">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {upcomingEvents.length}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Scheduled on calendar</p>
          </div>
        </div>

        {/* Completed Events */}
        <div className="rounded-xl border border-red-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Completed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900">
              {completedEvents.length}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Archived & reported</p>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-400/40 bg-[#660000] p-4 text-white">
        <div>
          <h2 className="text-sm font-bold text-white">Organizing Committee Quick Actions</h2>
          <p className="text-xs text-red-200">Execute frequent event workflows with one click</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('create_event')}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[#5c0000] hover:bg-red-50 shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule Event
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('calendar')}
            className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-[#520000] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#470000]"
          >
            <Calendar className="h-4 w-4" />
            Open Full Calendar
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('reports')}
            className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-[#520000] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#470000]"
          >
            <FileText className="h-4 w-4" />
            Club Reports
          </button>
        </div>
      </div>

      {/* 3. Main Split: Left 2 Columns (Live/Today + Upcoming) & Right Column (Compact Calendar + Completed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Today & Upcoming */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Events Happening Today */}
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-[#800000]" />
                  Events Happening Today
                </h3>
                <p className="text-xs text-gray-500">{formatFullDate(todayStr)}</p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-[#800000]">
                {todayEvents.length} Active
              </span>
            </div>

            <div className="mt-4">
              {todayEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-sm font-medium text-gray-600">No club events scheduled for today.</p>
                  <p className="text-xs text-gray-400 mt-1">Check the upcoming activities below or plan a new initiative.</p>
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('create_event')}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#800000] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#660000]"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Schedule for Today
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onOpenEventDetails(event)}
                      className="group cursor-pointer rounded-xl border border-red-200 bg-red-50/40 p-4 transition-all hover:border-[#800000] hover:bg-red-50/70"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded border border-red-300 bg-white px-2 py-0.5 text-xs font-bold text-[#800000]">
                          {event.avenue}
                        </span>
                        <span className="rounded-full bg-[#800000] px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                          LIVE TODAY
                        </span>
                      </div>

                      <h4 className="mt-2 text-base font-bold text-gray-900 group-hover:text-[#800000] transition-colors">
                        {event.title}
                      </h4>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-semibold text-gray-900">
                          <Clock className="h-3.5 w-3.5 text-[#800000]" />
                          {formatTime12h(event.startTime)} – {formatTime12h(event.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#800000]" />
                          {event.venue}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-[#800000]" />
                          Lead: {event.chairperson}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Upcoming Events */}
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#800000]" />
                  Upcoming Events & Projects
                </h3>
                <p className="text-xs text-gray-500">Scheduled on the RSCOE Rotaract calendar</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('events')}
                className="flex items-center gap-1 text-xs font-bold text-[#800000] hover:underline"
              >
                <span>View All ({upcomingEvents.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-xs text-gray-500">
                  No upcoming events scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 4).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onOpenEventDetails(event)}
                      className="group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-gray-200 p-3.5 hover:border-red-300 hover:bg-red-50/30 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#800000]">
                            {event.avenue}
                          </span>
                          {event.isFlagship && (
                            <span className="rounded bg-[#800000] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                              Flagship
                            </span>
                          )}
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-gray-900 truncate group-hover:text-[#800000]">
                          {event.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
                          <span className="font-semibold text-[#800000]">
                            {formatReadableDate(event.date)}
                          </span>
                          <span>·</span>
                          <span>{formatTime12h(event.startTime)}</span>
                          <span>·</span>
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                          {event.expectedAttendees} Expected
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#800000]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Compact Calendar & Recently Completed */}
        <div className="lg:col-span-4 space-y-6">
          {/* Compact Monthly Event Calendar */}
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <p className="text-xs text-gray-500">Monthly schedule</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab('calendar')}
                className="text-xs font-bold text-[#800000] hover:underline"
              >
                Expand
              </button>
            </div>

            {/* Calendar mini grid */}
            <div className="mt-3">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-500 pb-1">
                <span className="text-[#800000]">S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span className="text-[#800000]">S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((cell, idx) => {
                  if (!cell) {
                    return <div key={`empty-${idx}`} className="h-7 w-7" />;
                  }
                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      onClick={() => onSelectEventDateInCalendar(cell.dateStr)}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-colors mx-auto ${
                        cell.isToday
                          ? 'bg-[#800000] text-white font-bold'
                          : cell.hasEvent
                          ? 'bg-red-100 text-[#800000] font-bold hover:bg-red-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cell.dayNumber}
                      {cell.hasEvent && !cell.isToday && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#800000]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-gray-500 text-center border-t border-gray-100 pt-2">
              Highlighted dates have scheduled activities
            </p>
          </div>

          {/* Recently Completed Events */}
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-gray-700" />
                  Recently Completed
                </h3>
                <p className="text-xs text-gray-500">Historical club records</p>
              </div>
              <span className="text-xs font-bold text-gray-600">
                {completedEvents.length} Total
              </span>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {completedEvents.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No completed events on record.
                </div>
              ) : (
                completedEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onOpenEventDetails(event)}
                    className="py-2.5 cursor-pointer hover:bg-red-50/40 px-1 rounded transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-gray-500">
                        {event.avenue}
                      </span>
                      <span className="text-[11px] font-medium text-gray-500">
                        {formatReadableDate(event.date)}
                      </span>
                    </div>
                    <h5 className="mt-0.5 text-xs font-bold text-gray-900 line-clamp-1 hover:text-[#800000]">
                      {event.title}
                    </h5>
                    {event.actualAttendees && (
                      <p className="mt-0.5 text-[11px] text-gray-600">
                        Impact: {event.actualAttendees} Attendees
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
