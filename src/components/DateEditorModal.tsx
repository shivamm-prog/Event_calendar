import React, { useState } from 'react';
import { CalendarEvent, EventCategory, RecurrenceType } from '../types/calendar';
import {
  formatDisplayDate,
  formatTime,
  isTaskCompletedOnDate,
  isToday,
} from '../utils/dateUtils';
import {
  X,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Repeat,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DateEditorModalProps {
  isOpen: boolean;
  dateStr: string;
  events: CalendarEvent[];
  onClose: () => void;
  onSaveEvent: (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onToggleTaskComplete: (event: CalendarEvent, dateStr: string) => void;
  onOpenFullEditModal: (event: CalendarEvent) => void;
}

const CATEGORIES: EventCategory[] = ['College', 'Personal', 'Projects', 'Meetings', 'Other'];

export const DateEditorModal: React.FC<DateEditorModalProps> = ({
  isOpen,
  dateStr,
  events,
  onClose,
  onSaveEvent,
  onDeleteEvent,
  onToggleTaskComplete,
  onOpenFullEditModal,
}) => {
  // New event quick form state
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newAllDay, setNewAllDay] = useState(false);
  const [newCategory, setNewCategory] = useState<EventCategory>('Personal');
  const [newIsTask, setNewIsTask] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceType>('none');
  const [newDescription, setNewDescription] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = newTitle.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an event or task title.');
      return;
    }

    if (!newAllDay && newStartTime && newEndTime && newEndTime < newStartTime) {
      setErrorMessage('End time cannot be earlier than start time.');
      return;
    }

    onSaveEvent({
      title: trimmed,
      date: dateStr,
      startTime: newAllDay ? undefined : newStartTime,
      endTime: newAllDay ? undefined : newEndTime,
      allDay: newAllDay,
      category: newCategory,
      isTask: newIsTask,
      isCompleted: false,
      completedDates: [],
      recurrence: newRecurrence,
      description: newDescription.trim(),
    });

    // Reset inputs
    setNewTitle('');
    setNewDescription('');
    setNewIsTask(false);
    setIsFormExpanded(false);
  };

  const isCurrentDay = isToday(dateStr);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-editor-title"
    >
      <div className="relative w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="date-editor-title" className="text-lg font-bold text-gray-900">
                {formatDisplayDate(dateStr)}
              </h2>
              {isCurrentDay && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {events.length} {events.length === 1 ? 'entry on this date' : 'entries on this date'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Entries List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-8 px-4 text-center">
              <p className="text-sm font-medium text-gray-700">No events or tasks on this date</p>
              <p className="text-xs text-gray-400 mt-1">Use the quick add form below to schedule something.</p>
            </div>
          ) : (
            events.map((event) => {
              const isCompleted = isTaskCompletedOnDate(event, dateStr);

              return (
                <div
                  key={`${event.id}-${dateStr}`}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors ${
                    isCompleted
                      ? 'border-gray-200 bg-gray-50 text-gray-500'
                      : 'border-red-100 bg-white hover:border-red-300'
                  }`}
                >
                  {/* Task Checkbox or Dot */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {event.isTask ? (
                      <button
                        type="button"
                        onClick={() => onToggleTaskComplete(event, dateStr)}
                        className="mt-0.5 text-gray-400 hover:text-red-600 shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-red-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-red-600 shrink-0" />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-semibold text-sm truncate ${
                            isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {event.title}
                        </span>
                        <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.2 text-[10px] font-semibold text-red-700">
                          {event.category}
                        </span>
                        {event.recurrence && event.recurrence !== 'none' && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Repeat className="h-3 w-3 text-red-600" />
                            {event.recurrence}
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="h-3 w-3 text-red-600" />
                        <span>
                          {event.allDay
                            ? 'All Day'
                            : `${formatTime(event.startTime)} ${
                                event.endTime ? `– ${formatTime(event.endTime)}` : ''
                              }`}
                        </span>
                      </div>

                      {event.description && (
                        <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenFullEditModal(event)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Edit event"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id, event.title)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Add Form on this Date */}
        <div className="border-t border-gray-100 pt-3">
          {errorMessage && (
            <p className="text-xs text-red-600 mb-2 font-medium">{errorMessage}</p>
          )}

          <form onSubmit={handleQuickAdd} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Add title for this date..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {/* Expandable Options Toggle */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newIsTask}
                  onChange={(e) => setNewIsTask(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 accent-red-600"
                />
                <span>Mark as Task</span>
              </label>

              <button
                type="button"
                onClick={() => setIsFormExpanded(!isFormExpanded)}
                className="flex items-center gap-1 text-red-600 hover:underline font-medium"
              >
                {isFormExpanded ? (
                  <>
                    <span>Fewer Options</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Time & Details</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Expanded Options */}
            {isFormExpanded && (
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAllDay}
                      onChange={(e) => setNewAllDay(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 accent-red-600"
                    />
                    <span>All Day</span>
                  </label>

                  {!newAllDay && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span>Time:</span>
                      <input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
                      />
                    </div>
                  )}
                </div>

                {/* Category selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-500 font-medium">Category:</span>
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        newCategory === cat
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-red-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Recurrence */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">Repeat:</span>
                  {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setNewRecurrence(r)}
                      className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        newRecurrence === r
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-red-400'
                      }`}
                    >
                      {r === 'none' ? 'None' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Optional notes or description..."
                    className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Close */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-black"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
