import { EventStatus, RotaractEvent } from '../types/rotaract';

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

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

export function formatReadableDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatFullDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${dayName}, ${month} ${day}, ${year}`;
}

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = mStr || '00';
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Determines scheduled status automatically based on date:
 * - Today -> 'live'
 * - Future -> 'upcoming'
 * - Past -> 'completed' (done)
 */
export function determineStatusFromDate(dateStr: string): EventStatus {
  const todayStr = getTodayString();
  if (dateStr === todayStr) return 'live';
  if (dateStr > todayStr) return 'upcoming';
  return 'completed';
}

/**
 * Computes whether an event is 'live', 'upcoming', or 'completed' (past/done)
 */
export function getEventEffectiveStatus(event: RotaractEvent): 'upcoming' | 'live' | 'completed' {
  // If user explicitly marked the event as past or completed, honor that
  if (event.status === 'past' || event.status === 'completed') {
    return 'completed';
  }
  // If user explicitly chose 'live', honor that
  if (event.status === 'live') {
    return 'live';
  }
  // If user explicitly chose 'upcoming', honor that
  if (event.status === 'upcoming') {
    return 'upcoming';
  }

  // Fallback date-based scheduling
  const todayStr = getTodayString();
  if (event.date === todayStr) {
    return 'live';
  }
  if (event.date > todayStr) {
    return 'upcoming';
  }
  return 'completed';
}

export interface CalendarCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: RotaractEvent[];
}

export function buildMonthGrid(
  year: number,
  month: number,
  events: RotaractEvent[]
): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const todayStr = getTodayString();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const d = new Date(year, month - 1, dayNumber);
    const dateString = formatDate(d);
    cells.push({
      date: d,
      dateString,
      dayNumber,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      events: events.filter((e) => e.date === dateString),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month, d);
    const dateString = formatDate(curDate);
    cells.push({
      date: curDate,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      events: events.filter((e) => e.date === dateString),
    });
  }

  // Next month leading days (fill up to 35 or 42)
  const targetCells = cells.length <= 35 ? 35 : 42;
  const remaining = targetCells - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dateString = formatDate(nextDate);
    cells.push({
      date: nextDate,
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      events: events.filter((e) => e.date === dateString),
    });
  }

  return cells;
}
