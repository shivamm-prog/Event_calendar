import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  PlusCircle,
  Users,
  FileBarChart,
  Settings,
  X,
  Award,
} from 'lucide-react';
import { ActiveNavTab } from '../types/rotaract';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  upcomingCount: number;
  liveCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  upcomingCount,
  liveCount,
}) => {
  const { userProfile, isCoreTeam, assignedAvenue } = useAuth();
  const navItems: { id: ActiveNavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    {
      id: 'events',
      label: 'Events',
      icon: Layers,
      badge: liveCount > 0 ? liveCount : upcomingCount,
    },
    { id: 'create_event', label: 'Create Event', icon: PlusCircle },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tabId: ActiveNavTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container: Deep Dark Red */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#5c0000] text-white border-r border-[#420000] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#470000] px-5 bg-[#4d0000]">
          <div className="flex items-center gap-3">
            {/* Rotaract Emblem / Gear */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#5c0000] font-black shadow-xs">
              <Award className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-200">
                Rotaract Club of
              </div>
              <div className="text-lg font-black tracking-tight text-white leading-tight">
                RSCOE
              </div>
              <div className="text-xs text-red-200 tracking-wide font-medium">
                Tathawade · Dist. 3131
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 text-red-200 hover:bg-[#6b0606] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 px-3.5 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-bold transition-all ${
                  isActive
                    ? 'bg-white text-[#5c0000] shadow-md'
                    : 'text-red-100 hover:bg-[#730808] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-[#5c0000]' : 'text-red-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive
                        ? 'bg-[#5c0000] text-white'
                        : liveCount > 0 && item.id === 'events'
                        ? 'bg-white text-[#5c0000]'
                        : 'bg-[#730808] text-white border border-red-300/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Club Information & User Role Footer */}
        <div className="border-t border-[#470000] p-4 bg-[#4d0000]/60 space-y-2.5">
          {userProfile && (
            <div className="rounded-lg border border-red-300/30 bg-[#3d0000] p-2.5 text-xs text-white">
              <div className="flex items-center justify-between">
                <span className="font-extrabold truncate max-w-[130px]">{userProfile.displayName}</span>
                <span className="rounded bg-white px-1.5 py-0.2 text-[9px] font-black uppercase text-[#5c0000]">
                  {isCoreTeam ? 'Core Team' : 'BOD'}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-red-200">
                {isCoreTeam ? (
                  <span className="text-white font-medium">Full Access · All Avenues</span>
                ) : (
                  <span>
                    Avenue: <strong className="text-white">{assignedAvenue || 'Assigned'}</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-red-400/20 bg-[#400000]/50 p-2.5 text-xs">
            <div className="font-bold text-white">Rajarshi Shahu COE</div>
            <div className="text-[11px] text-red-200 mt-0.5">
              JSPM Campus, Tathawade, Pune - 411033
            </div>
            <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-red-400/20 text-[10px] text-red-200">
              <span>R.I. Dist 3131</span>
              <span className="font-bold text-white">Zone 4</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
