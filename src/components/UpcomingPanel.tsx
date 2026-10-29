import React, { useState } from 'react';
import { CalendarEvent, EventCategory } from '../types/calendar';
import {
  formatShortDate,
  formatTime,
  getUpcomingOccurrences,
  formatDate,
} from '../utils/dateUtils';
import { Calendar, Clock, ChevronRight, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface UpcomingPanelProps {
  events: CalendarEvent[];
  selectedCategory: EventCategory | 'All';
  onSelectDate: (dateStr: string) => void;
  onOpenEventDetails: (event: CalendarEvent, dateStr: string) => void;
  onToggleTaskComplete: (event: CalendarEvent, dateStr: string) => void;
}

export const UpcomingPanel: React.FC<UpcomingPanelProps> = ({
  events,
  selectedCategory,
  onSelectDate,
  onOpenEventDetails,
  onToggleTaskComplete,
}) => {
  const [showAll, setShowAll] = useState(false);
  const todayStr = formatDate(new Date());

  // Get upcoming occurrences starting from today
  const allUpcoming = getUpcomingOccurrences(events, todayStr, 60);

  // Filter by category
  const filteredUpcoming =
    selectedCategory === 'All'
      ? allUpcoming
      : allUpcoming.filter((item) => item.event.category === selectedCategory);

  const displayList = showAll ? filteredUpcoming : filteredUpcoming.slice(0, 6);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-red-600" />
            Upcoming Events
          </h3>
          <p className="text-xs text-gray-500">Scheduled in next 60 days</p>
        </div>

        {filteredUpcoming.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-semibold text-red-600 hover:text-red-700"
          >
            {showAll ? 'Show Fewer' : `View All (${filteredUpcoming.length})`}
          </button>
        )}
      </div>

      <div className="mt-3 divide-y divide-gray-100">
        {displayList.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No upcoming events found.
          </div>
        ) : (
          displayList.map(({ event, occurrenceDate, isCompleted }) => {
            const isTargetToday = occurrenceDate === todayStr;

            return (
              <div
                key={`${event.id}-${occurrenceDate}`}
                onClick={() => {
                  onSelectDate(occurrenceDate);
                  onOpenEventDetails(event, occurrenceDate);
                }}
                className="group flex items-start justify-between gap-3 py-2.5 hover:bg-red-50/40 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {event.isTask ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskComplete(event, occurrenceDate);
                      }}
                      className="mt-0.5 text-gray-400 hover:text-red-600 shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-red-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  ) : (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-red-600 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {event.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                      <span className={`font-medium ${isTargetToday ? 'text-red-600 font-bold' : ''}`}>
                        {isTargetToday ? 'Today' : formatShortDate(occurrenceDate)}
                      </span>
                      <span>·</span>
                      <span>
                        {event.allDay ? 'All Day' : formatTime(event.startTime)}
                      </span>
                      <span>·</span>
                      <span className="text-gray-600">{event.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(occurrenceDate);
                    }}
                    title="Jump to date in calendar"
                    className="p-1 text-gray-400 group-hover:text-red-600"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
