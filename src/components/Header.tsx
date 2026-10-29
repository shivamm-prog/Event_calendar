import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Database,
  X,
  ChevronRight as ChevronRightSmall,
} from 'lucide-react';
import { CalendarEvent } from '../types/calendar';
import { MONTH_NAMES, formatShortDate } from '../utils/dateUtils';

interface HeaderProps {
  currentYear: number;
  currentMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  events: CalendarEvent[];
  onOpenAddModal: () => void;
  onSelectEventDate: (dateStr: string, eventId?: string) => void;
  onOpenStorageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  events,
  onOpenAddModal,
  onSelectEventDate,
  onOpenStorageModal,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filteredEvents = searchQuery.trim()
    ? events.filter((e) => {
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q)
        );
      })
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (event: CalendarEvent) => {
    onSelectEventDate(event.date, event.id);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Month Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-xs">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:inline">
              My Calendar
            </span>
          </div>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          {/* Month & Year with Navigation Controls */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {MONTH_NAMES[currentMonth]} <span className="text-red-600">{currentYear}</span>
            </h1>

            <div className="flex items-center rounded-lg border border-gray-300 bg-white shadow-xs ml-1">
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
              onClick={onGoToToday}
              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-red-400 hover:text-red-600"
            >
              Today
            </button>
          </div>
        </div>

        {/* Right Actions: Search, Add Event, Storage */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div ref={searchContainerRef} className="relative">
            {isSearchOpen ? (
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-40 sm:w-60 rounded-lg border border-red-500 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:border-red-400 hover:text-red-600"
                title="Search events"
                aria-label="Search events"
              >
                <Search className="h-4 w-4" />
              </button>
            )}

            {/* Search Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl z-50">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {filteredEvents.length} results found
                </div>
                {filteredEvents.length === 0 ? (
                  <p className="p-3 text-center text-xs text-gray-500">No matching events.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEvents.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="flex w-full items-start justify-between gap-2 p-2 text-left rounded hover:bg-red-50/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-red-600 font-medium">
                            {formatShortDate(item.date)}
                          </p>
                        </div>
                        <ChevronRightSmall className="h-4 w-4 text-gray-400 self-center" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Event Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Event</span>
          </button>

          {/* Storage & Backup */}
          <button
            type="button"
            onClick={onOpenStorageModal}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:border-red-400 hover:text-red-600"
            title="Data & Backup Settings"
            aria-label="Storage and backup settings"
          >
            <Database className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
