export type EventCategory = 'College' | 'Personal' | 'Projects' | 'Meetings' | 'Other';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  startTime?: string; // HH:MM (24-hour)
  endTime?: string; // HH:MM (24-hour)
  allDay: boolean;
  description?: string;
  category: EventCategory;
  isTask: boolean;
  isCompleted?: boolean;
  completedDates?: string[]; // Specific dates when recurring task was completed: ['YYYY-MM-DD']
  recurrence: RecurrenceType;
  recurrenceEnd?: string; // Optional end date YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
}

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
}

export type ViewMode = 'month' | 'day' | 'upcoming';
