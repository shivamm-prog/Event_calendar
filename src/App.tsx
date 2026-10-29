/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveNavTab, ClubMember, EventStatus, RotaractEvent } from './types/rotaract';
import {
  loadStoredEvents,
  saveStoredEvents,
  loadStoredMembers,
  saveStoredMembers,
  getSampleDemoEvents,
} from './utils/rotaractData';
import { getTodayString } from './utils/dateHelpers';
import { useAuth } from './context/AuthContext';
import {
  subscribeToEvents,
  createEventFirestore,
  updateEventFirestore,
  deleteEventFirestore,
} from './services/eventService';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { CreateEventView } from './components/CreateEventView';
import { CalendarView } from './components/CalendarView';
import { MembersView } from './components/MembersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { EventDetailsModal } from './components/EventDetailsModal';
import { EventFormModal } from './components/EventFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Award, AlertTriangle } from 'lucide-react';

export default function App() {
  const { currentUser, userProfile, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayString());

  // Real-time Cloud Firestore event state
  const [events, setEvents] = useState<RotaractEvent[]>(() => loadStoredEvents());
  const [cloudError, setCloudError] = useState<string | null>(null);

  // Roster members state
  const [members, setMembers] = useState<ClubMember[]>(() => loadStoredMembers());

  // Modals state
  const [detailsEvent, setDetailsEvent] = useState<RotaractEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<RotaractEvent | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
  });

  // Real-time subscription to shared Firestore events collection
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToEvents(
      (cloudEvents) => {
        setEvents(cloudEvents);
        setCloudError(null);
        // Cache to localStorage for fast local startup
        saveStoredEvents(cloudEvents);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setCloudError(
          `Cloud Sync Notice: ${err.message}. Using cached club events.`
        );
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Keep members saved locally
  useEffect(() => {
    saveStoredMembers(members);
  }, [members]);

  // 1. Loading Splash
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#780000] text-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#780000] shadow-2xl animate-pulse">
            <Award className="h-9 w-9 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Rotaract Club of RSCOE
            </h2>
            <p className="text-xs text-red-200 mt-1 font-medium">
              Connecting to Cloud Firestore & Authenticating Portal...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!currentUser) {
    return <LoginView />;
  }

  // Counts for sidebar badges
  const liveCount = events.filter((e) => e.date === getTodayString() || e.status === 'live').length;
  const upcomingCount = events.filter((e) => e.date > getTodayString()).length;

  // Handlers for Events (Synchronized directly with Cloud Firestore)
  const handleSaveEvent = async (
    eventData: Omit<RotaractEvent, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (!userProfile) return;

    try {
      if (existingId) {
        const existing = events.find((ev) => ev.id === existingId);
        const currentAvenue = existing ? existing.avenue : eventData.avenue;
        await updateEventFirestore(existingId, eventData, currentAvenue, userProfile);
      } else {
        await createEventFirestore(eventData, userProfile);
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Cloud Storage Error: ${err.message}`);
    }
  };

  const handleDeleteEvent = (id: string, title: string) => {
    setDeleteDialog({ isOpen: true, id, title });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id || !userProfile) return;
    const target = events.find((ev) => ev.id === deleteDialog.id);
    if (!target) return;

    try {
      await deleteEventFirestore(target.id, target.avenue, userProfile);
      if (detailsEvent?.id === target.id) {
        setDetailsEvent(null);
      }
      if (editingEvent?.id === target.id) {
        setEditingEvent(null);
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Cloud Delete Error: ${err.message}`);
    } finally {
      setDeleteDialog({ isOpen: false, id: '', title: '' });
    }
  };

  const handleStatusChange = async (id: string, newStatus: EventStatus) => {
    if (!userProfile) return;
    const target = events.find((ev) => ev.id === id);
    if (!target) return;

    try {
      await updateEventFirestore(id, { status: newStatus }, target.avenue, userProfile);
      if (detailsEvent && detailsEvent.id === id) {
        setDetailsEvent((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      console.error('Status change failed:', err);
      alert(`Status Update Error: ${err.message}`);
    }
  };

  // Handlers for Members
  const handleAddMember = (
    memberData: Omit<ClubMember, 'id' | 'avatarInitials' | 'joinedDate'>
  ) => {
    const initials = memberData.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newMember: ClubMember = {
      ...memberData,
      id: 'mem-' + Date.now(),
      avatarInitials: initials || 'RT',
      joinedDate: getTodayString(),
    };
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Backup & Import
  const handleImportData = (newEvents: RotaractEvent[], newMembers?: ClubMember[]) => {
    setEvents(newEvents);
    if (newMembers && newMembers.length > 0) {
      setMembers(newMembers);
    }
  };

  // Search handler
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activeTab !== 'events' && activeTab !== 'members') {
      setActiveTab('events');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#780000] font-sans antialiased selection:bg-white selection:text-[#780000]">
      {/* 1. Left Sidebar Navigation (Deep Red) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
        upcomingCount={upcomingCount}
        liveCount={liveCount}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsOpenMobileSidebar(true)}
          onOpenCreateEvent={() => setActiveTab('create_event')}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Optional Cloud sync error banner */}
        {cloudError && (
          <div className="bg-[#520000] px-4 py-2 text-xs text-red-200 border-b border-red-400/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-300 shrink-0" />
              <span>{cloudError}</span>
            </div>
            <button
              type="button"
              onClick={() => setCloudError(null)}
              className="text-white hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main View Area: Deep red background with white panels (70% Red / 30% White distribution) */}
        <main className="flex-1 overflow-y-auto bg-[#780000] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <DashboardView
                events={events}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onOpenEventDetails={(ev) => setDetailsEvent(ev)}
                onSelectEventDateInCalendar={(dStr) => {
                  setSelectedDateStr(dStr);
                  setActiveTab('calendar');
                }}
              />
            )}

            {activeTab === 'events' && (
              <EventsView
                events={events}
                onOpenEventDetails={(ev) => setDetailsEvent(ev)}
                onEditEvent={(ev) => setEditingEvent(ev)}
                onDeleteEvent={handleDeleteEvent}
                onStatusChange={handleStatusChange}
                onOpenCreateEvent={() => setActiveTab('create_event')}
              />
            )}

            {activeTab === 'create_event' && (
              <CreateEventView
                onSaveEvent={(evData) => handleSaveEvent(evData)}
                onNavigateToEvents={() => setActiveTab('events')}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                events={events}
                selectedDateStr={selectedDateStr}
                onSelectDate={(dStr) => setSelectedDateStr(dStr)}
                onOpenEventDetails={(ev) => setDetailsEvent(ev)}
                onOpenCreateEventOnDate={(dStr) => {
                  setSelectedDateStr(dStr);
                  setActiveTab('create_event');
                }}
              />
            )}

            {activeTab === 'members' && (
              <MembersView
                members={members}
                onAddMember={handleAddMember}
                onDeleteMember={handleDeleteMember}
              />
            )}

            {activeTab === 'reports' && <ReportsView events={events} />}

            {activeTab === 'settings' && (
              <SettingsView
                events={events}
                members={members}
                onImportData={handleImportData}
                onClearAllEvents={() => setEvents([])}
                onLoadDemoEvents={() => setEvents(getSampleDemoEvents())}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {/* 1. Full Event Dossier Details */}
      <EventDetailsModal
        isOpen={!!detailsEvent}
        event={detailsEvent}
        onClose={() => setDetailsEvent(null)}
        onEdit={(ev) => {
          setDetailsEvent(null);
          setEditingEvent(ev);
        }}
        onDelete={(id, title) => handleDeleteEvent(id, title)}
        onStatusChange={handleStatusChange}
      />

      {/* 2. Edit Event Form Modal */}
      <EventFormModal
        isOpen={!!editingEvent}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        eventTitle={deleteDialog.title}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', title: '' })}
      />
    </div>
  );
}
