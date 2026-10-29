import { ClubMember, RotaractEvent } from '../types/rotaract';
import { formatDate } from './dateHelpers';

// Storage key updated so any previous seeded mock events are wiped clean
const EVENTS_STORAGE_KEY = 'rotaract_rscoe_events_clean_v3';
const MEMBERS_STORAGE_KEY = 'rotaract_rscoe_members_clean_v3';

/**
 * Blank initial events list as requested: all events start completely blank
 */
export function getInitialEvents(): RotaractEvent[] {
  return [];
}

/**
 * Optional sample demo events (can be loaded on-demand from Settings if desired)
 */
export function getSampleDemoEvents(): RotaractEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const makeDate = (offsetDays: number) => {
    const d = new Date(year, month, todayDate + offsetDays);
    return formatDate(d);
  };

  return [
    {
      id: 'demo-1',
      title: 'Mega Blood Donation & Health Camp 2026',
      avenue: 'Community Service',
      status: 'live',
      date: makeDate(0),
      startTime: '09:30',
      endTime: '17:00',
      venue: 'RSCOE D-Building Foyer & Health Center, Tathawade',
      chairperson: 'Rtr. Ananya Joshi (Dir. Community Service)',
      budget: 15000,
      expectedAttendees: 200,
      actualAttendees: 145,
      description: 'Annual humanitarian blood donation drive with Sassoon Hospital.',
      objectives: 'Collect safe blood units and encourage student donors.',
      isFlagship: true,
      createdAt: Date.now() - 500000,
      updatedAt: Date.now() - 500000,
    },
    {
      id: 'demo-2',
      title: 'National TechFest "CodeCraft 4.0"',
      avenue: 'Technical & Innovations',
      status: 'upcoming',
      date: makeDate(4),
      startTime: '10:00',
      endTime: '18:00',
      venue: 'RSCOE Central Computing Lab & Auditorium, Tathawade',
      chairperson: 'Rtr. Yash Kulkarni (Dir. Technical)',
      budget: 35000,
      expectedAttendees: 300,
      description: '24-hour inter-collegiate coding hackathon on AI for Social Good.',
      objectives: 'Encourage students to build real-world software prototypes.',
      isFlagship: true,
      createdAt: Date.now() - 400000,
      updatedAt: Date.now() - 400000,
    },
    {
      id: 'demo-3',
      title: 'Project Vruksha: Native Sapling Plantation',
      avenue: 'Community Service',
      status: 'completed',
      date: makeDate(-10),
      startTime: '08:00',
      endTime: '12:00',
      venue: 'Gahunje Hillside, Dehu Road Forest Area, Pune',
      chairperson: 'Rtr. Ananya Joshi',
      budget: 15000,
      actualExpense: 14200,
      expectedAttendees: 100,
      actualAttendees: 110,
      description: 'Planted 500 indigenous trees with 1-year maintenance pledge.',
      objectives: 'Enhance urban green cover and combat soil erosion.',
      reportSummary: 'Planted 520 saplings with support from Forest Dept.',
      createdAt: Date.now() - 300000,
      updatedAt: Date.now() - 300000,
    },
  ];
}

export function getInitialMembers(): ClubMember[] {
  return [
    {
      id: 'mem-1',
      name: 'Rtr. Atharva Patil',
      role: 'President',
      avenue: 'Club Service',
      email: 'president.rotaract@rscoe.ac.in',
      phone: '+91 98220 11442',
      department: 'Computer Engineering',
      year: 'BE',
      avatarInitials: 'AP',
      joinedDate: '2023-08-15',
    },
    {
      id: 'mem-2',
      name: 'Rtr. Shreya Kulkarni',
      role: 'Secretary',
      avenue: 'Club Service',
      email: 'secretary.rotaract@rscoe.ac.in',
      phone: '+91 97654 88219',
      department: 'Information Technology',
      year: 'TE',
      avatarInitials: 'SK',
      joinedDate: '2023-09-01',
    },
    {
      id: 'mem-3',
      name: 'Rtr. Kunal Shinde',
      role: 'Vice President',
      avenue: 'Club Service',
      email: 'vp.rotaract@rscoe.ac.in',
      phone: '+91 99231 44512',
      department: 'Mechanical Engineering',
      year: 'BE',
      avatarInitials: 'KS',
      joinedDate: '2023-08-15',
    },
    {
      id: 'mem-4',
      name: 'Rtr. Neha Joshi',
      role: 'Treasurer',
      avenue: 'Club Service',
      email: 'treasurer.rotaract@rscoe.ac.in',
      phone: '+91 94220 55182',
      department: 'E&TC Engineering',
      year: 'TE',
      avatarInitials: 'NJ',
      joinedDate: '2024-07-10',
    },
    {
      id: 'mem-5',
      name: 'Rtr. Ananya Joshi',
      role: 'Director of Community Service',
      avenue: 'Community Service',
      email: 'community.rotaract@rscoe.ac.in',
      phone: '+91 95450 77319',
      department: 'Civil Engineering',
      year: 'TE',
      avatarInitials: 'AJ',
      joinedDate: '2024-07-15',
    },
    {
      id: 'mem-6',
      name: 'Rtr. Yash Kulkarni',
      role: 'Director of Technical & Innovations',
      avenue: 'Technical & Innovations',
      email: 'tech.rotaract@rscoe.ac.in',
      phone: '+91 98600 33918',
      department: 'Computer Engineering',
      year: 'TE',
      avatarInitials: 'YK',
      joinedDate: '2024-08-01',
    },
  ];
}

/**
 * Load events from localStorage; defaults to completely blank []
 */
export function loadStoredEvents(): RotaractEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      saveStoredEvents([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse events from storage:', err);
    return [];
  }
}

export function saveStoredEvents(events: RotaractEvent[]): void {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save events to storage:', err);
  }
}

export function loadStoredMembers(): ClubMember[] {
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMembers();
      saveStoredMembers(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getInitialMembers();
  } catch (err) {
    console.error('Failed to parse members from storage:', err);
    return getInitialMembers();
  }
}

export function saveStoredMembers(members: ClubMember[]): void {
  try {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save members to storage:', err);
  }
}
