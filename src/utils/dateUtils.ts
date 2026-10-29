import { CalendarDay, CalendarEvent } from '../types/calendar';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_OF_WEEK_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Format a Date object into YYYY-MM-DD local string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD into a local Date without timezone offset distortion
 */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  const todayStr = formatDate(new Date());
  return dateStr === todayStr;
}

/**
 * Check if two date strings are the same
 */
export function isSameDate(d1: string, d2: string): boolean {
  return d1 === d2;
}

/**
 * Format 24h time "14:30" to "2:30 PM"
 */
export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = mStr || '00';
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Format display date like "Wednesday, October 29, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const dayName = DAYS_OF_WEEK_FULL[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${dayName}, ${monthName} ${day}, ${year}`;
}

/**
 * Format short display date like "Oct 29, 2026"
 */
export function formatShortDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const monthName = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${monthName} ${day}, ${year}`;
}

/**
 * Determines whether a CalendarEvent occurs on a specific YYYY-MM-DD date,
 * correctly taking into account recurrence rules without duplicating records.
 */
export function eventOccursOnDate(event: CalendarEvent, targetDateStr: string): boolean {
  // Event cannot occur before its base start date
  if (targetDateStr < event.date) {
    return false;
  }

  // Event cannot occur after its recurrenceEnd if defined
  if (event.recurrenceEnd && targetDateStr > event.recurrenceEnd) {
    return false;
  }

  // Non-recurring: must match exact date
  if (!event.recurrence || event.recurrence === 'none') {
    return event.date === targetDateStr;
  }

  // Daily recurrence: occurs every day on or after start date
  if (event.recurrence === 'daily') {
    return true;
  }

  const startDate = parseDate(event.date);
  const targetDate = parseDate(targetDateStr);

  // Weekly recurrence: must match the same day of the week (0 = Sunday, 6 = Saturday)
  if (event.recurrence === 'weekly') {
    return startDate.getDay() === targetDate.getDay();
  }

  // Monthly recurrence: must match the same day of the month
  if (event.recurrence === 'monthly') {
    const startDayOfMonth = startDate.getDate();
    const targetDayOfMonth = targetDate.getDate();

    if (startDayOfMonth === targetDayOfMonth) {
      return true;
    }

    // Edge case: start date is 31st (or 29/30th), but target month has fewer days.
    // If targetDate is the last day of its month and startDayOfMonth >= last day, it matches.
    const lastDayOfTargetMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0
    ).getDate();

    if (startDayOfMonth > lastDayOfTargetMonth && targetDayOfMonth === lastDayOfTargetMonth) {
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Check whether a specific instance of a task on a given date is completed
 */
export function isTaskCompletedOnDate(event: CalendarEvent, dateStr: string): boolean {
  if (!event.isTask) return false;
  if (event.recurrence && event.recurrence !== 'none') {
    return !!(event.completedDates && event.completedDates.includes(dateStr));
  }
  return !!event.isCompleted;
}

/**
 * Sort events chronologically: All-day first, then by startTime, then title
 */
export function sortEventsChronologically(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    // All-day events first
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;

    // Compare start times
    if (a.startTime && b.startTime) {
      const timeCompare = a.startTime.localeCompare(b.startTime);
      if (timeCompare !== 0) return timeCompare;
    } else if (a.startTime && !b.startTime) {
      return -1;
    } else if (!a.startTime && b.startTime) {
      return 1;
    }

    // Alphabetical title fallback
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get all events occurring on a specific date, sorted chronologically
 */
export function getEventsForDate(events: CalendarEvent[], dateStr: string): CalendarEvent[] {
  const matching = events.filter((e) => eventOccursOnDate(e, dateStr));
  return sortEventsChronologically(matching);
}

/**
 * Generates the full 35 or 42 grid cells for the monthly calendar
 * Sunday is index 0.
 */
export function buildMonthCalendarGrid(
  year: number,
  month: number,
  selectedDateStr: string,
  events: CalendarEvent[]
): CalendarDay[] {
  const days: CalendarDay[] = [];

  // First day of target month (0 = Sun, 1 = Mon, ... 6 = Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Total days in the current month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const todayStr = formatDate(new Date());

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 1, dayNumber);
    const dateString = formatDate(prevDate);
    const dayEvents = getEventsForDate(events, dateString);

    days.push({
      date: prevDate,
      dateString,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr,
      events: dayEvents,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateString = formatDate(curDate);
    const dayEvents = getEventsForDate(events, dateString);

    days.push({
      date: curDate,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr,
      events: dayEvents,
    });
  }

  // 3. Next month leading days (to fill up rows to 35 or 42 cells)
  const totalCellsSoFar = days.length;
  const targetTotalCells = totalCellsSoFar <= 35 ? 35 : 42;
  const remainingCells = targetTotalCells - totalCellsSoFar;

  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateString = formatDate(nextDate);
    const dayEvents = getEventsForDate(events, dateString);

    days.push({
      date: nextDate,
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isSelected: dateString === selectedDateStr,
      events: dayEvents,
    });
  }

  return days;
}

export interface UpcomingOccurrence {
  event: CalendarEvent;
  occurrenceDate: string;
  isCompleted: boolean;
}

/**
 * Look ahead for upcoming occurrences up to 60 days from a reference date
 */
export function getUpcomingOccurrences(
  events: CalendarEvent[],
  fromDateStr: string,
  daysAhead = 60
): UpcomingOccurrence[] {
  const results: UpcomingOccurrence[] = [];
  const startDate = parseDate(fromDateStr);

  for (let i = 0; i < daysAhead; i++) {
    const targetDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + i
    );
    const targetDateStr = formatDate(targetDate);

    for (const event of events) {
      if (eventOccursOnDate(event, targetDateStr)) {
        results.push({
          event,
          occurrenceDate: targetDateStr,
          isCompleted: isTaskCompletedOnDate(event, targetDateStr),
        });
      }
    }
  }

  // Sort upcoming chronologically by occurrenceDate, then start time
  return results.sort((a, b) => {
    if (a.occurrenceDate !== b.occurrenceDate) {
      return a.occurrenceDate.localeCompare(b.occurrenceDate);
    }
    if (a.event.allDay && !b.event.allDay) return -1;
    if (!a.event.allDay && b.event.allDay) return 1;
    const timeA = a.event.startTime || '';
    const timeB = b.event.startTime || '';
    return timeA.localeCompare(timeB);
  });
}
