import React, { useState } from 'react';
import { AvenueOfService, RotaractEvent } from '../types/rotaract';
import {
  DAYS_OF_WEEK,
  formatFullDate,
  formatReadableDate,
  formatTime12h,
  MONTH_NAMES,
  buildMonthGrid,
  getEventEffectiveStatus,
} from '../utils/dateHelpers';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Eye,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';

interface CalendarViewProps {
  events: RotaractEvent[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
  onOpenEventDetails: (event: RotaractEvent) => void;
  onOpenCreateEventOnDate: (dateStr: string) => void;
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

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDateStr,
  onSelectDate,
  onOpenEventDetails,
  onOpenCreateEventOnDate,
}) => {
  const initialDate = new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [selectedAvenue, setSelectedAvenue] = useState<AvenueOfService | 'All'>('All');

  // Filter events by avenue if specified
  const filteredEvents =
    selectedAvenue === 'All'
      ? events
      : events.filter((e) => e.avenue === selectedAvenue);

  const monthGrid = buildMonthGrid(currentYear, currentMonth, filteredEvents);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    onSelectDate(todayStr);
  };

  // Events on currently selected date
  const selectedDayEvents = filteredEvents.filter((e) => e.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* 1. Month Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-[#800000]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {MONTH_NAMES[currentMonth]} <span className="text-[#800000]">{currentYear}</span>
            </h2>
            <p className="text-xs text-gray-500">Official RSCOE Rotaract Event Schedule</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Avenue Filter */}
          <div className="flex items-center gap-1.5 text-xs mr-2">
            <Filter className="h-4 w-4 text-[#800000]" />
            <select
              value={selectedAvenue}
              onChange={(e) => setSelectedAvenue(e.target.value as AvenueOfService | 'All')}
              className="rounded-lg border border-gray-300 bg-white py-1.5 px-2.5 text-xs font-semibold text-gray-800 focus:border-[#800000] focus:outline-none"
            >
              {AVENUES.map((av) => (
                <option key={av} value={av}>
                  {av}
                </option>
              ))}
            </select>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-gray-700 hover:bg-red-50 hover:text-[#800000] rounded-l-lg"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-gray-700 hover:bg-red-50 hover:text-[#800000] rounded-r-lg"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-[#800000] hover:text-[#800000]"
          >
            Today
          </button>
        </div>
      </div>

      {/* 2. Calendar Grid + Selected Date Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-red-200 bg-white shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-700">
            {DAYS_OF_WEEK.map((d, idx) => (
              <div
                key={d}
                className={`py-3 ${idx === 0 || idx === 6 ? 'text-[#800000]' : 'text-gray-700'}`}
              >
                <span>{d}</span>
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {monthGrid.map((cell) => {
              const isSelected = cell.dateString === selectedDateStr;

              return (
                <div
                  key={cell.dateString}
                  onClick={() => onSelectDate(cell.dateString)}
                  className={`group relative flex min-h-[90px] sm:min-h-[110px] flex-col border-b border-r border-gray-200 p-1.5 sm:p-2 transition-colors cursor-pointer select-none ${
                    !cell.isCurrentMonth
                      ? 'bg-gray-50/40 text-gray-400'
                      : 'bg-white text-gray-900'
                  } ${
                    isSelected
                      ? 'ring-2 ring-inset ring-[#800000] bg-red-50/30'
                      : 'hover:bg-red-50/20'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold ${
                        cell.isToday
                          ? 'bg-[#800000] text-white shadow-xs'
                          : isSelected
                          ? 'text-[#800000] font-black'
                          : cell.isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.events.length > 0 && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-[#800000]" />
                    )}
                  </div>

                  {/* Event Badges in Cell */}
                  <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                    {cell.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEventDetails(ev);
                        }}
                        className="truncate rounded border border-red-200 bg-red-50/80 px-1.5 py-0.5 text-[10px] font-bold text-[#800000] hover:bg-red-100"
                        title={`${ev.title} (${ev.venue})`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cell.events.length > 2 && (
                      <span className="text-[10px] font-bold text-[#800000] pl-1">
                        +{cell.events.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {formatFullDate(selectedDateStr)}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedDayEvents.length} events scheduled
                </p>
              </div>

              <button
                type="button"
                onClick={() => onOpenCreateEventOnDate(selectedDateStr)}
                className="flex items-center gap-1 rounded-lg bg-[#800000] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#660000]"
                title="Add event on this date"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  <p>No events scheduled on this day.</p>
                  <button
                    type="button"
                    onClick={() => onOpenCreateEventOnDate(selectedDateStr)}
                    className="mt-2 text-xs font-bold text-[#800000] hover:underline"
                  >
                    + Schedule an activity
                  </button>
                </div>
              ) : (
                selectedDayEvents.map((ev) => {
                  const effectiveStatus = getEventEffectiveStatus(ev);

                  return (
                    <div
                      key={ev.id}
                      onClick={() => onOpenEventDetails(ev)}
                      className="cursor-pointer rounded-lg border border-red-100 bg-red-50/30 p-3 hover:border-red-300 hover:bg-red-50/70 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-white px-1.5 py-0.2 text-[10px] font-bold text-[#800000] border border-red-200">
                          {ev.avenue}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-[#800000]">
                          {effectiveStatus}
                        </span>
                      </div>

                      <h4 className="mt-1 text-xs font-bold text-gray-900 line-clamp-2">
                        {ev.title}
                      </h4>

                      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                        <Clock className="h-3 w-3 text-[#800000]" />
                        <span>
                          {formatTime12h(ev.startTime)} – {formatTime12h(ev.endTime)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 truncate">
                        <MapPin className="h-3 w-3 text-[#800000] shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
