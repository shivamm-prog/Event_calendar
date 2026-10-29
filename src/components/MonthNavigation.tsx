import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { MONTH_NAMES } from '../utils/dateUtils';
import { EventCategory } from '../types/calendar';

interface MonthNavigationProps {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  selectedCategory: EventCategory | 'All';
  onSelectCategory: (cat: EventCategory | 'All') => void;
  viewMode: 'month' | 'agenda' | 'upcoming';
  onChangeViewMode: (mode: 'month' | 'agenda' | 'upcoming') => void;
}

const CATEGORIES: (EventCategory | 'All')[] = ['All', 'College', 'Personal', 'Projects', 'Meetings', 'Other'];

export const MonthNavigation: React.FC<MonthNavigationProps> = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-white py-3 px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Month & Year Title with Navigation */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {MONTH_NAMES[currentMonth]} <span className="text-red-600 font-semibold">{currentYear}</span>
          </h2>

          <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-xs">
            <button
              type="button"
              onClick={onPrevMonth}
              className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-l-lg"
              title="Previous Month"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <button
              type="button"
              onClick={onNextMonth}
              className="p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-r-lg"
              title="Next Month"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToday}
            className="sm:hidden rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-red-400 hover:text-red-600"
          >
            Today
          </button>
        </div>

        {/* View Switcher: Month Grid vs Agenda vs Upcoming (Great on mobile and tablet) */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => onChangeViewMode('month')}
            className={`rounded-md px-3 py-1 transition-all ${
              viewMode === 'month'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly Grid
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('agenda')}
            className={`rounded-md px-3 py-1 transition-all ${
              viewMode === 'agenda'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Agenda
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('upcoming')}
            className={`rounded-md px-3 py-1 transition-all ${
              viewMode === 'upcoming'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 text-xs">
        <span className="flex items-center gap-1 font-semibold text-gray-500 shrink-0">
          <Filter className="h-3 w-3 text-red-600" />
          Filter:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'border border-red-600 bg-red-50 text-red-700 font-semibold'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
