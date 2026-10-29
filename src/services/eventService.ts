import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AvenueOfService, RotaractEvent, UserProfile, UserRole } from '../types/rotaract';

const EVENTS_COLLECTION = 'events';
const USERS_COLLECTION = 'users';

/**
 * Real-time subscription to all shared club events
 */
export function subscribeToEvents(
  onData: (events: RotaractEvent[]) => void,
  onError: (error: Error) => void
) {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const events: RotaractEvent[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          avenue: data.avenue as AvenueOfService,
          status: data.status || 'upcoming',
          date: data.date || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          venue: data.venue || '',
          chairperson: data.chairperson || '',
          coChairperson: data.coChairperson,
          budget: Number(data.budget) || 0,
          actualExpense: data.actualExpense ? Number(data.actualExpense) : undefined,
          expectedAttendees: Number(data.expectedAttendees) || 0,
          actualAttendees: data.actualAttendees ? Number(data.actualAttendees) : undefined,
          description: data.description || '',
          objectives: data.objectives || '',
          registrationLink: data.registrationLink,
          reportSummary: data.reportSummary,
          isFlagship: Boolean(data.isFlagship),
          createdBy: data.createdBy,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        };
      });
      onData(events);
    },
    (err) => {
      console.error('Firestore events subscription error:', err);
      onError(err);
    }
  );
}

/**
 * Create a new event in Firestore with avenue permission enforcement
 */
export async function createEventFirestore(
  eventData: Omit<RotaractEvent, 'id' | 'createdAt' | 'updatedAt'>,
  userProfile: UserProfile
): Promise<string> {
  // Validate permission
  if (userProfile.role === 'bod' && userProfile.assignedAvenue !== eventData.avenue) {
    throw new Error(
      `Permission Denied: As a BOD member for ${userProfile.assignedAvenue}, you are only authorized to create events for your assigned avenue.`
    );
  }

  const now = Date.now();
  const payload = {
    ...eventData,
    createdBy: userProfile.uid,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), payload);
  return docRef.id;
}

/**
 * Update an existing event in Firestore with avenue permission enforcement
 */
export async function updateEventFirestore(
  eventId: string,
  eventData: Partial<RotaractEvent>,
  currentAvenue: AvenueOfService,
  userProfile: UserProfile
): Promise<void> {
  // Verify existing avenue permission
  if (userProfile.role === 'bod') {
    if (userProfile.assignedAvenue !== currentAvenue) {
      throw new Error(
        `Permission Denied: You cannot modify events in "${currentAvenue}". You are assigned to "${userProfile.assignedAvenue}".`
      );
    }
    // Also prevent changing avenue to a different one
    if (eventData.avenue && eventData.avenue !== userProfile.assignedAvenue) {
      throw new Error(
        `Permission Denied: BOD members cannot transfer events to other avenues.`
      );
    }
  }

  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await updateDoc(docRef, {
    ...eventData,
    updatedAt: Date.now(),
  });
}

/**
 * Delete an event in Firestore with avenue permission enforcement
 */
export async function deleteEventFirestore(
  eventId: string,
  avenue: AvenueOfService,
  userProfile: UserProfile
): Promise<void> {
  if (userProfile.role === 'bod' && userProfile.assignedAvenue !== avenue) {
    throw new Error(
      `Permission Denied: You cannot delete events in "${avenue}". You are only authorized for "${userProfile.assignedAvenue}".`
    );
  }

  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(docRef);
}

/**
 * Migrate existing events from localStorage to Firestore
 */
export async function migrateLocalEventsToFirestore(
  localEvents: RotaractEvent[],
  userProfile: UserProfile
): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];

  for (const event of localEvents) {
    try {
      // Core Team can migrate all; BOD can only migrate their avenue
      if (userProfile.role === 'bod' && event.avenue !== userProfile.assignedAvenue) {
        continue;
      }
      const { id, ...dataWithoutId } = event;
      await addDoc(collection(db, EVENTS_COLLECTION), {
        ...dataWithoutId,
        createdBy: userProfile.uid,
        createdAt: event.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      successCount++;
    } catch (err: any) {
      errors.push(`Failed to migrate "${event.title}": ${err.message}`);
    }
  }

  return { successCount, errors };
}

/**
 * Subscribe to registered club users for Administrator / Core Team role management
 */
export function subscribeToUsers(
  onData: (users: UserProfile[]) => void,
  onError: (error: Error) => void
) {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const users: UserProfile[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: docSnap.id,
          email: d.email || '',
          displayName: d.displayName || d.email?.split('@')[0] || 'Member',
          role: (d.role as UserRole) || 'bod',
          assignedAvenue: d.assignedAvenue as AvenueOfService | undefined,
          createdAt: d.createdAt || Date.now(),
          updatedAt: d.updatedAt || Date.now(),
        };
      });
      onData(users);
    },
    onError
  );
}

/**
 * Core Team Administrator updates another user's role or assigned avenue
 */
export async function updateUserRoleAndAvenue(
  targetUid: string,
  role: UserRole,
  assignedAvenue?: AvenueOfService
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, targetUid);
  await updateDoc(userRef, {
    role,
    assignedAvenue: role === 'bod' ? assignedAvenue || 'Community Service' : null,
    updatedAt: Date.now(),
  });
}
