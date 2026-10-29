import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventCategory, RecurrenceType } from '../types/calendar';
import { X, Calendar, Clock, Tag, Repeat, CheckSquare, AlertCircle, Trash2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  onDeleteRequest?: (id: string, title: string) => void;
  initialDate?: string;
  editingEvent?: CalendarEvent | null;
}

const CATEGORIES: EventCategory[] = ['College', 'Personal', 'Projects', 'Meetings', 'Other'];
const RECURRENCE_OPTIONS: { label: string; value: RecurrenceType }[] = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Daily (Every day)', value: 'daily' },
  { label: 'Weekly (Every week)', value: 'weekly' },
  { label: 'Monthly (Every month)', value: 'monthly' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteRequest,
  initialDate,
  editingEvent,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('College');
  const [isTask, setIsTask] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDate(editingEvent.date);
        setStartTime(editingEvent.startTime || '09:00');
        setEndTime(editingEvent.endTime || '10:00');
        setAllDay(editingEvent.allDay);
        setDescription(editingEvent.description || '');
        setCategory(editingEvent.category);
        setIsTask(editingEvent.isTask);
        setRecurrence(editingEvent.recurrence);
        setRecurrenceEnd(editingEvent.recurrenceEnd || '');
      } else {
        // Defaults for new event
        setTitle('');
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setAllDay(false);
        setDescription('');
        setCategory('College');
        setIsTask(false);
        setRecurrence('none');
        setRecurrenceEnd('');
      }
    }
  }, [isOpen, editingEvent, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('Please enter an event title.');
      return;
    }

    if (!date) {
      setErrorMessage('Please select a valid event date.');
      return;
    }

    if (!allDay && startTime && endTime) {
      if (endTime < startTime) {
        setErrorMessage('End time must be after or equal to start time.');
        return;
      }
    }

    if (recurrence !== 'none' && recurrenceEnd) {
      if (recurrenceEnd < date) {
        setErrorMessage('Recurrence end date cannot be earlier than the start date.');
        return;
      }
    }

    onSave(
      {
        title: trimmedTitle,
        date,
        startTime: allDay ? undefined : startTime,
        endTime: allDay ? undefined : endTime,
        allDay,
        description: description.trim(),
        category,
        isTask,
        isCompleted: editingEvent ? editingEvent.isCompleted : false,
        completedDates: editingEvent ? editingEvent.completedDates : [],
        recurrence,
        recurrenceEnd: recurrence !== 'none' && recurrenceEnd ? recurrenceEnd : undefined,
      },
      editingEvent?.id
    );

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 id="modal-title" className="text-lg font-bold text-gray-900">
              {editingEvent ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Event Title <span className="text-red-600">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS101 Project Presentation, Team Sync, Dentist..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Date & All Day */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="event-date" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Date <span className="text-red-600">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="event-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 accent-red-600 focus:ring-red-500"
                />
                <span>All-day event</span>
              </label>
            </div>
          </div>

          {/* Times (if not all day) */}
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="event-start" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  Start Time
                </label>
                <input
                  id="event-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label htmlFor="event-end" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  End Time
                </label>
                <input
                  id="event-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-700">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              Category
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? 'border border-red-600 bg-red-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:border-red-400 hover:text-red-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Task Flag */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <label className="flex cursor-pointer items-start gap-2.5 text-sm select-none">
              <input
                type="checkbox"
                checked={isTask}
                onChange={(e) => setIsTask(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 accent-red-600 focus:ring-red-500"
              />
              <div>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-red-600" />
                  Mark as Task / To-Do
                </span>
                <p className="text-xs text-gray-500">
                  Adds a completion checkbox so you can mark this item finished directly from the calendar.
                </p>
              </div>
            </label>
          </div>

          {/* Recurrence Pattern */}
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-700">
              <Repeat className="h-3.5 w-3.5 text-red-600" />
              Recurrence
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RECURRENCE_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRecurrence(opt.value)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium text-center transition-colors ${
                    recurrence === opt.value
                      ? 'border border-red-600 bg-red-50 text-red-700 font-semibold'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                  }`}
                >
                  {opt.value === 'none' ? 'None' : opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
                </button>
              ))}
            </div>

            {recurrence !== 'none' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label htmlFor="recurrence-end" className="block text-xs font-medium text-gray-600">
                  Repeat until (Optional):
                </label>
                <input
                  id="recurrence-end"
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  placeholder="Ongoing"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to repeat indefinitely. Dynamic recurrence prevents database bloating.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Description / Notes
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add location, meeting link, agenda, or relevant details..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              {editingEvent && onDeleteRequest && (
                <button
                  type="button"
                  onClick={() => onDeleteRequest(editingEvent.id, editingEvent.title)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
