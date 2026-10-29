export type AvenueOfService =
  | 'Club Service'
  | 'Community Service'
  | 'Professional Development'
  | 'International Service'
  | 'Technical & Innovations'
  | 'Sports & Cultural'
  | 'Public Relations';

export type EventStatus = 'upcoming' | 'live' | 'past' | 'completed';

export type UserRole = 'core_team' | 'bod';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedAvenue?: AvenueOfService;
  createdAt: number;
  updatedAt: number;
}

export interface RotaractEvent {
  id: string;
  title: string;
  avenue: AvenueOfService;
  status: EventStatus;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  venue: string; // e.g. "RSCOE Main Auditorium", "Seminar Hall D-Building"
  chairperson: string; // e.g. "Rtr. Ananya Kulkarni"
  coChairperson?: string;
  budget: number; // in INR
  actualExpense?: number;
  expectedAttendees: number;
  actualAttendees?: number;
  description: string;
  objectives: string;
  registrationLink?: string;
  reportSummary?: string;
  isFlagship?: boolean;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClubMember {
  id: string;
  name: string;
  role: string; // e.g. "Club President", "Secretary", "Dir. Community Service"
  avenue?: AvenueOfService;
  email: string;
  phone: string;
  department: string; // e.g. "Computer Engineering", "Information Technology"
  year: string; // "FE" | "SE" | "TE" | "BE"
  avatarInitials: string;
  joinedDate: string;
}

export type ActiveNavTab =
  | 'dashboard'
  | 'calendar'
  | 'events'
  | 'create_event'
  | 'members'
  | 'reports'
  | 'settings';
