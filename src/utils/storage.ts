import { CalendarEvent } from '../types/calendar';
import { formatDate } from './dateUtils';

const STORAGE_KEY = 'my_calendar_events_v1';

/**
 * Generate sensible starter events around the current date
 */
export function getInitialSeedEvents(): CalendarEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  // Helper to format specific day in current month
  const makeDateStr = (dayOffset: number) => {
    const d = new Date(year, month, todayDate + dayOffset);
    return formatDate(d);
  };

  const seedEvents: CalendarEvent[] = [
    {
      id: 'seed-1',
      title: 'Software Engineering Lecture',
      date: makeDateStr(0),
      startTime: '10:00',
      endTime: '11:30',
      allDay: false,
      description: 'Review system design principles, data persistence patterns, and unit testing strategies.',
      category: 'College',
      isTask: false,
      isCompleted: false,
      recurrence: 'weekly',
      createdAt: Date.now() - 500000,
      updatedAt: Date.now() - 500000,
    },
    {
      id: 'seed-2',
      title: 'Submit Research Proposal Draft',
      date: makeDateStr(0),
      startTime: '16:00',
      endTime: '17:00',
      allDay: false,
      description: 'Upload the 4-page proposal draft to student portal before the 5 PM cut-off.',
      category: 'Projects',
      isTask: true,
      isCompleted: false,
      recurrence: 'none',
      createdAt: Date.now() - 400000,
      updatedAt: Date.now() - 400000,
    },
    {
      id: 'seed-3',
      title: 'Team Sync & Milestone Review',
      date: makeDateStr(1),
      startTime: '14:00',
      endTime: '15:00',
      allDay: false,
      description: 'Bi-weekly sprint check-in with design and engineering leads on roadmap items.',
      category: 'Meetings',
      isTask: false,
      isCompleted: false,
      recurrence: 'none',
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    },
    {
      id: 'seed-4',
      title: 'Daily Morning Workout & Stretch',
      date: makeDateStr(-2),
      startTime: '07:30',
      endTime: '08:15',
      allDay: false,
      description: 'Core workout, stretching, and 20-minute cardio session.',
      category: 'Personal',
      isTask: true,
      isCompleted: true,
      completedDates: [makeDateStr(-2), makeDateStr(-1)],
      recurrence: 'daily',
      createdAt: Date.now() - 200000,
      updatedAt: Date.now() - 200000,
    },
    {
      id: 'seed-5',
      title: 'Quarterly Project Milestone Planning',
      date: makeDateStr(4),
      startTime: '11:00',
      endTime: '12:30',
      allDay: false,
      description: 'Prioritize next semester deliverables and align on technical stack requirements.',
      category: 'Projects',
      isTask: false,
      isCompleted: false,
      recurrence: 'monthly',
      createdAt: Date.now() - 100000,
      updatedAt: Date.now() - 100000,
    },
    {
      id: 'seed-6',
      title: 'Dentist Routine Appointment',
      date: makeDateStr(6),
      startTime: '15:30',
      endTime: '16:30',
      allDay: false,
      description: 'Annual check-up and teeth cleaning at Dental Care Clinic.',
      category: 'Personal',
      isTask: false,
      isCompleted: false,
      recurrence: 'none',
      createdAt: Date.now() - 50000,
      updatedAt: Date.now() - 50000,
    },
  ];

  return seedEvents;
}

/**
 * Load events from localStorage safely
 */
export function loadEventsFromStorage(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedEvents();
      saveEventsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidEventRecord);
    }
    return getInitialSeedEvents();
  } catch (err) {
    console.error('Failed to load events from storage, falling back to seed:', err);
    return getInitialSeedEvents();
  }
}

/**
 * Save events to localStorage safely
 */
export function saveEventsToStorage(events: CalendarEvent[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    console.error('Failed to save events to storage:', err);
    return false;
  }
}

/**
 * Check if a parsed object has required CalendarEvent fields
 */
function isValidEventRecord(item: any): item is CalendarEvent {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date)
  );
}

/**
 * Export calendar events to a downloadable JSON file
 */
export function exportEventsToFile(events: CalendarEvent[]): void {
  const jsonStr = JSON.stringify(events, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-calendar-backup-${formatDate(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported JSON file string into validated CalendarEvents
 */
export function parseImportedJson(jsonString: string): { success: boolean; events?: CalendarEvent[]; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'File does not contain a list of events.' };
    }
    const validEvents = parsed.filter(isValidEventRecord);
    if (validEvents.length === 0) {
      return { success: false, error: 'No valid calendar events found in this file.' };
    }
    return { success: true, events: validEvents };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Invalid JSON format.' };
  }
}
