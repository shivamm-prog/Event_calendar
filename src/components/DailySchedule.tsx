import React from 'react';
import { CalendarEvent, EventCategory } from '../types/calendar';
import {
  formatDisplayDate,
  formatTime,
  isTaskCompletedOnDate,
  isToday,
} from '../utils/dateUtils';
import {
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Repeat,
  Edit2,
  Trash2,
  CalendarX2,
} from 'lucide-react';

interface DailyScheduleProps {
  selectedDateStr: string;
  events: CalendarEvent[];
  selectedCategory: EventCategory | 'All';
  onAddEventToDate: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteRequest: (id: string, title: string) => void;
  onToggleTaskComplete: (event: CalendarEvent, dateStr: string) => void;
}

export const DailySchedule: React.FC<DailyScheduleProps> = ({
  selectedDateStr,
  events,
  selectedCategory,
  onAddEventToDate,
  onSelectEvent,
  onEditEvent,
  onDeleteRequest,
  onToggleTaskComplete,
}) => {
  const visibleEvents =
    selectedCategory === 'All'
      ? events
      : events.filter((e) => e.category === selectedCategory);

  const isCurrentDay = isToday(selectedDateStr);

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-xs">
      {/* Schedule Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              {formatDisplayDate(selectedDateStr)}
            </h3>
            {isCurrentDay && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                Today
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {visibleEvents.length} {visibleEvents.length === 1 ? 'event scheduled' : 'events scheduled'}
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddEventToDate(selectedDateStr)}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Event
        </button>
      </div>

      {/* Events List */}
      <div className="p-4">
        {visibleEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <CalendarX2 className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-gray-900">No events on this day</h4>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
              {selectedCategory !== 'All'
                ? `There are no ${selectedCategory} events scheduled for this date.`
                : 'Your schedule is clear. Plan ahead by adding lectures, meetings, tasks, or personal goals.'}
            </p>
            <button
              type="button"
              onClick={() => onAddEventToDate(selectedDateStr)}
              className="mt-4 flex items-center gap-1.5 rounded-lg border border-red-600 bg-white px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Schedule Event Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEvents.map((event) => {
              const isCompleted = isTaskCompletedOnDate(event, selectedDateStr);

              return (
                <div
                  key={`${event.id}-${selectedDateStr}`}
                  onClick={() => onSelectEvent(event)}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 transition-all cursor-pointer ${
                    isCompleted
                      ? 'border-gray-200 bg-gray-50/70 text-gray-500'
                      : 'border-red-100 bg-white hover:border-red-300 hover:bg-red-50/30'
                  }`}
                >
                  {/* Left: Checkbox (if task) & Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {event.isTask ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskComplete(event, selectedDateStr);
                        }}
                        className="mt-0.5 text-gray-400 hover:text-red-600 shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        aria-label={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-red-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 hover:text-red-500" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-red-600" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`font-semibold text-sm leading-snug truncate ${
                            isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {event.title}
                        </h4>
                        <span className="rounded border border-red-200 bg-red-50 px-2 py-0.2 text-[10px] font-semibold text-red-700">
                          {event.category}
                        </span>

                        {event.recurrence && event.recurrence !== 'none' && (
                          <span
                            className="flex items-center gap-1 text-[11px] text-gray-500"
                            title={`Repeats ${event.recurrence}`}
                          >
                            <Repeat className="h-3 w-3 text-red-600" />
                            {event.recurrence}
                          </span>
                        )}
                      </div>

                      {/* Time info */}
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-red-600" />
                        <span>
                          {event.allDay
                            ? 'All day event'
                            : `${formatTime(event.startTime)} ${
                                event.endTime ? `– ${formatTime(event.endTime)}` : ''
                              }`}
                        </span>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="mt-1.5 text-xs text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Edit event"
                      aria-label="Edit event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRequest(event.id, event.title);
                      }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete event"
                      aria-label="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
