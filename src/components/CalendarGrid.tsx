import React from 'react';
import { CalendarDay, CalendarEvent } from '../types/calendar';
import { DAYS_OF_WEEK } from '../utils/dateUtils';

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedDateStr,
  onSelectDate,
}) => {
  return (
    <div className="w-full bg-white select-none">
      {/* Day of Week Headers (Sunday to Saturday) */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white text-center text-xs sm:text-sm font-semibold">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div
            key={day}
            className={`py-3 ${idx === 0 || idx === 6 ? 'text-red-600' : 'text-gray-700'}`}
          >
            <span className="sm:hidden">{day.charAt(0)}</span>
            <span className="hidden sm:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid: strictly date numbers, nothing else */}
      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {days.map((day) => {
          const isSelected = day.dateString === selectedDateStr;
          const hasEvents = day.events && day.events.length > 0;

          return (
            <button
              key={day.dateString}
              type="button"
              onClick={() => onSelectDate(day.dateString)}
              aria-label={`${day.dateString}, ${hasEvents ? `${day.events.length} events` : 'no events'}`}
              className={`group relative flex flex-col items-center justify-center h-16 sm:h-24 md:h-28 border-b border-r border-gray-200 transition-all cursor-pointer focus:outline-none focus:z-10 ${
                !day.isCurrentMonth
                  ? 'bg-gray-50/50 text-gray-300'
                  : 'bg-white text-gray-900'
              } ${
                isSelected
                  ? 'ring-2 ring-inset ring-red-600 bg-red-50/40 z-10'
                  : 'hover:bg-red-50/25'
              }`}
            >
              {/* Date Number Badge */}
              <span
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-sm sm:text-base transition-colors ${
                  day.isToday
                    ? 'bg-red-600 font-bold text-white shadow-xs'
                    : isSelected
                    ? 'font-bold text-red-600'
                    : day.isCurrentMonth
                    ? 'font-medium text-gray-900 group-hover:text-red-600'
                    : 'font-normal text-gray-300'
                }`}
              >
                {day.dayNumber}
              </span>

              {/* Minimal indicator dot if this date has events */}
              <div className="h-2 flex items-center justify-center mt-1">
                {hasEvents ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      day.isToday ? 'bg-red-600' : 'bg-red-500'
                    }`}
                  />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
