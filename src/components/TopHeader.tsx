import React from 'react';
import { Menu, Plus, Search, LogOut, Shield, Layers, User } from 'lucide-react';
import { ActiveNavTab } from '../types/rotaract';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  activeTab: ActiveNavTab;
  onOpenMobileMenu: () => void;
  onOpenCreateEvent: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const TAB_TITLES: Record<ActiveNavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time activities, statistics, and schedule at a glance',
  },
  calendar: {
    title: 'Organizational Calendar',
    subtitle: 'Monthly and daily view of all club projects and meetings',
  },
  events: {
    title: 'Event Management',
    subtitle: 'Manage upcoming, live, and past activities of RAC RSCOE',
  },
  create_event: {
    title: 'Create New Event',
    subtitle: 'Register an upcoming project, seminar, camp, or meeting',
  },
  members: {
    title: 'Club Roster & Roles',
    subtitle: 'Board of Directors, Committee Chairs, and Access Management',
  },
  reports: {
    title: 'Activity Reports & Analytics',
    subtitle: 'District reporting metrics, avenue distributions, and impacts',
  },
  settings: {
    title: 'Club Settings & Cloud',
    subtitle: 'Cloud Firestore storage, backup migration, and configuration',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenCreateEvent,
  searchQuery,
  onSearchChange,
}) => {
  const {
    userProfile,
    signOut,
    isCoreTeam,
    assignedAvenue,
    simulatedRole,
    setSimulatedRole,
  } = useAuth();

  const current = TAB_TITLES[activeTab] || {
    title: 'Rotaract Club of RSCOE',
    subtitle: 'Event Management System',
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-[#4d0000] bg-[#660000] px-4 sm:px-6 lg:px-8 py-2 text-white shadow-xs gap-3">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-red-200 hover:bg-[#7a0a0a] hover:text-white lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            {current.title}
          </h1>
          <p className="hidden text-sm text-red-200 sm:block font-medium mt-0.5">{current.subtitle}</p>
        </div>
      </div>

      {/* Right: Search, Role Status Badge, Create Event, and Logout */}
      <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap justify-end">
        {/* Global Search Bar */}
        <div className="relative w-36 sm:w-60">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, venues..."
            className="w-full rounded-xl border border-red-400/40 bg-[#520000] py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-red-300 font-medium focus:border-white focus:bg-[#470000] focus:outline-none shadow-xs"
          />
        </div>

        {/* User Role & Assigned Avenue Badge */}
        {userProfile && (
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-red-400/40 bg-[#520000] px-3 py-1.5 text-xs text-white">
            {isCoreTeam ? (
              <Shield className="h-4 w-4 text-red-200 shrink-0" />
            ) : (
              <Layers className="h-4 w-4 text-red-200 shrink-0" />
            )}
            <div className="text-left">
              <div className="font-extrabold text-[11px] leading-tight flex items-center gap-1.5">
                <span>{userProfile.displayName}</span>
                <span className="rounded bg-white px-1.5 py-0.2 text-[9px] font-black uppercase text-[#660000]">
                  {isCoreTeam ? 'Core Team' : 'BOD'}
                </span>
                {simulatedRole && (
                  <span className="rounded bg-red-200 text-[#660000] px-1 text-[8px] font-bold">
                    Test Mode
                  </span>
                )}
              </div>
              <div className="text-[10px] text-red-200 font-medium leading-tight truncate max-w-[140px]">
                {isCoreTeam ? 'All Avenues Access' : assignedAvenue || 'Avenue Assigned'}
              </div>
            </div>

            {/* If user is Core Team admin in profile, allow testing BOD view */}
            {userProfile.role === 'core_team' && (
              <button
                type="button"
                onClick={() =>
                  setSimulatedRole(
                    simulatedRole === 'bod' ? null : 'bod',
                    'Community Service'
                  )
                }
                title={simulatedRole ? 'Reset back to Core Team' : 'Simulate BOD view (Community Service)'}
                className="ml-1 rounded border border-red-300/50 bg-[#420000] px-1.5 py-0.5 text-[9px] font-bold text-red-100 hover:bg-white hover:text-[#660000] transition-colors"
              >
                {simulatedRole ? 'Reset Admin' : 'Test BOD'}
              </button>
            )}
          </div>
        )}

        {/* Prominent Create Event Button */}
        <button
          type="button"
          onClick={onOpenCreateEvent}
          className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-extrabold text-[#5c0000] shadow-md hover:bg-red-50 hover:shadow-lg transition-all shrink-0 active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span className="hidden sm:inline">Create Event</span>
          <span className="sm:hidden">Create</span>
        </button>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1 rounded-xl border border-red-400/40 bg-[#520000] px-2.5 py-2 text-xs font-bold text-red-100 hover:bg-[#420000] hover:text-white transition-all shrink-0"
          title="Sign Out of Club Portal"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
