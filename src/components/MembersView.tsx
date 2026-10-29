import React, { useState, useEffect } from 'react';
import { AvenueOfService, ClubMember, UserProfile, UserRole } from '../types/rotaract';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  GraduationCap,
  Shield,
  Trash2,
  X,
  UserCheck,
  ShieldCheck,
  Lock,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToUsers, updateUserRoleAndAvenue } from '../services/eventService';

interface MembersViewProps {
  members: ClubMember[];
  onAddMember: (member: Omit<ClubMember, 'id' | 'avatarInitials' | 'joinedDate'>) => void;
  onDeleteMember: (id: string) => void;
}

const AVENUES: AvenueOfService[] = [
  'Club Service',
  'Community Service',
  'Professional Development',
  'International Service',
  'Technical & Innovations',
  'Sports & Cultural',
  'Public Relations',
];

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  onAddMember,
  onDeleteMember,
}) => {
  const { isCoreTeam, isBOD, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Firestore registered user accounts state (for administrator role & avenue assignment)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);
  const [adminErrorMsg, setAdminErrorMsg] = useState<string | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Edit role drafts: targetUid -> { role: UserRole, avenue?: AvenueOfService }
  const [userDrafts, setUserDrafts] = useState<Record<string, { role: UserRole; avenue: AvenueOfService }>>({});

  // Subscribe to registered users
  useEffect(() => {
    setUsersLoading(true);
    const unsubscribe = subscribeToUsers(
      (users) => {
        setRegisteredUsers(users);
        const drafts: Record<string, { role: UserRole; avenue: AvenueOfService }> = {};
        users.forEach((u) => {
          drafts[u.uid] = {
            role: u.role,
            avenue: u.assignedAvenue || 'Community Service',
          };
        });
        setUserDrafts(drafts);
        setUsersLoading(false);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setUsersLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const handleUpdateUserPermission = async (targetUid: string) => {
    const draft = userDrafts[targetUid];
    if (!draft) return;

    setUpdatingUid(targetUid);
    setAdminSuccessMsg(null);
    setAdminErrorMsg(null);

    try {
      await updateUserRoleAndAvenue(targetUid, draft.role, draft.avenue);
      setAdminSuccessMsg(`Successfully updated role & avenue for user!`);
      setTimeout(() => setAdminSuccessMsg(null), 3500);
    } catch (err: any) {
      setAdminErrorMsg(`Failed to update permissions: ${err.message}`);
    } finally {
      setUpdatingUid(null);
    }
  };

  // New member form
  const [name, setName] = useState('');
  const [role, setRole] = useState('Executive Board Member');
  const [avenue, setAvenue] = useState<AvenueOfService>('Community Service');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [year, setYear] = useState('TE');

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      (m.avenue && m.avenue.toLowerCase().includes(q))
    );
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMember({
      name: name.trim(),
      role: role.trim(),
      avenue,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@rscoe.ac.in`,
      phone: phone.trim() || '+91 98000 00000',
      department,
      year,
    });

    // Reset
    setName('');
    setRole('Executive Board Member');
    setEmail('');
    setPhone('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-7">
      {/* 1. ADMINISTRATOR ROLE & AVENUE ASSIGNMENT PANEL */}
      <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-[#800000] shrink-0">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Role & Avenue Access Control (Cloud Auth)
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {isCoreTeam
                  ? 'Core Team Administrator Panel: Assign roles and specific avenues of service to members.'
                  : 'BOD View: Your role and assigned avenue are managed by the Core Team administrator.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCoreTeam ? (
              <span className="rounded-full bg-green-100 border border-green-300 px-3 py-1 text-xs font-bold text-green-800 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-green-700" />
                Administrator Active
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-gray-500" />
                Read-Only (Managed by Core Team)
              </span>
            )}
          </div>
        </div>

        {adminSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 p-3 text-xs font-semibold text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <span>{adminSuccessMsg}</span>
          </div>
        )}

        {adminErrorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">
            <AlertCircle className="h-4 w-4 text-[#800000]" />
            <span>{adminErrorMsg}</span>
          </div>
        )}

        {/* User Accounts Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#5c0000] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-4">Member Account</th>
                <th className="py-2.5 px-3">Role Status</th>
                <th className="py-2.5 px-3">Assigned Avenue of Service</th>
                {isCoreTeam && <th className="py-2.5 px-4 text-right">Admin Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registeredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                    {usersLoading ? 'Loading registered accounts...' : 'No other registered accounts found.'}
                  </td>
                </tr>
              ) : (
                registeredUsers.map((u) => {
                  const draft = userDrafts[u.uid] || { role: u.role, avenue: u.assignedAvenue || 'Community Service' };
                  const isSelf = u.uid === userProfile?.uid;

                  return (
                    <tr key={u.uid} className="hover:bg-red-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{u.displayName}</span>
                          {isSelf && (
                            <span className="rounded bg-red-100 text-[#800000] px-1.5 py-0.2 text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        {isCoreTeam && !isSelf ? (
                          <select
                            value={draft.role}
                            onChange={(e) =>
                              setUserDrafts({
                                ...userDrafts,
                                [u.uid]: { ...draft, role: e.target.value as UserRole },
                              })
                            }
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-800 focus:border-[#800000]"
                          >
                            <option value="core_team">Core Team</option>
                            <option value="bod">BOD (Director)</option>
                          </select>
                        ) : (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${
                              u.role === 'core_team'
                                ? 'bg-red-100 text-[#800000] border border-red-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {u.role === 'core_team' ? 'Core Team' : 'BOD'}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {draft.role === 'bod' ? (
                          isCoreTeam && !isSelf ? (
                            <select
                              value={draft.avenue}
                              onChange={(e) =>
                                setUserDrafts({
                                  ...userDrafts,
                                  [u.uid]: { ...draft, avenue: e.target.value as AvenueOfService },
                                })
                              }
                              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 focus:border-[#800000]"
                            >
                              {AVENUES.map((av) => (
                                <option key={av} value={av}>
                                  {av}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-bold text-[#800000] bg-red-50 border border-red-200 rounded px-2 py-0.5">
                              {u.assignedAvenue || 'Community Service'}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 italic">Full Access (All 7 Avenues)</span>
                        )}
                      </td>

                      {isCoreTeam && (
                        <td className="py-3 px-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-gray-400 italic">Current Session</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateUserPermission(u.uid)}
                              disabled={updatingUid === u.uid}
                              className="rounded-lg bg-[#800000] px-3 py-1 text-xs font-bold text-white hover:bg-[#660000] disabled:opacity-50 transition-colors shadow-xs"
                            >
                              {updatingUid === u.uid ? 'Saving...' : 'Apply Role & Avenue'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. CLUB ROSTER & DIRECTORY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-[#800000]" />
            Club Roster & Member Directory
          </h2>
          <p className="text-xs text-gray-500">
            Rotaract Club of RSCOE · R.I. District 3131 ({members.length} Registered Members)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members, roles..."
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-xs text-gray-900 focus:border-[#800000] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#800000] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#660000] shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex flex-col rounded-xl border border-red-200 bg-white p-4 shadow-xs hover:border-[#800000] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#800000] font-black text-sm">
                  {member.avatarInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug">{member.name}</h4>
                  <span className="inline-block text-xs font-semibold text-[#800000]">
                    {member.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove ${member.name} from club roster?`)) {
                    onDeleteMember(member.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600 p-1 rounded"
                title="Remove member"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3.5 space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-600">
              {member.avenue && (
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#800000] shrink-0" />
                  <span className="font-medium text-gray-800">{member.avenue}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>
                  {member.department} ({member.year})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>{member.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Add Club Member</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Full Name <span className="text-[#800000]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rtr. Devendra Patil"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Designation</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Director, Co-Chair..."
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Avenue</label>
                  <select
                    value={avenue}
                    onChange={(e) => setAvenue(e.target.value as AvenueOfService)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                  >
                    {AVENUES.map((av) => (
                      <option key={av} value={av}>
                        {av}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                  >
                    <option value="Computer Engineering">Computer Engg</option>
                    <option value="Information Technology">IT</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                    <option value="E&TC Engineering">E&TC</option>
                    <option value="AI & Data Science">AI & DS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#800000] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#800000] px-5 py-2 text-xs font-bold text-white hover:bg-[#660000]"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
