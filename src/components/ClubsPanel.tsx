import React, { useState } from 'react';
import { AppData, ExtracurricularData, Club, ClubMembership } from '../types';
import { Trophy, Plus, Trash2, Users } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface ClubsPanelProps {
  extraState: ExtracurricularData;
  onUpdateExtra: (data: ExtracurricularData) => void;
}

export default function ClubsPanel({ extraState, onUpdateExtra }: ClubsPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState<string | null>(null);
  const [newClub, setNewClub] = useState<Partial<Club>>({ meetingDay: 'Friday' });
  const [newMember, setNewMember] = useState<Partial<ClubMembership>>({ role: 'Member', joinedDate: new Date().toISOString().split('T')[0] });

  const handleAddClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClub.name) return;

    const club: Club = {
      id: 'club-' + Date.now(),
      name: newClub.name,
      description: newClub.description || '',
      patronId: newClub.patronId || '',
      meetingDay: newClub.meetingDay || 'Friday',
      meetingTime: newClub.meetingTime || '16:00'
    };

    onUpdateExtra({
      ...extraState,
      clubs: [club, ...extraState.clubs]
    });

    setNewClub({ meetingDay: 'Friday' });
    setShowAddForm(false);
  };

  const handleDeleteClub = (id: string) => {
    if (confirm('Delete this club and all its memberships?')) {
      onUpdateExtra({
        ...extraState,
        clubs: extraState.clubs.filter(c => c.id !== id),
        memberships: extraState.memberships.filter(m => m.clubId !== id)
      });
    }
  };

  const handleAddMember = (clubId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.learnerId) return;

    const membership: ClubMembership = {
      id: 'mem-' + Date.now(),
      clubId,
      learnerId: newMember.learnerId,
      role: newMember.role as any || 'Member',
      joinedDate: newMember.joinedDate || new Date().toISOString()
    };

    onUpdateExtra({
      ...extraState,
      memberships: [membership, ...extraState.memberships]
    });

    setNewMember({ role: 'Member', joinedDate: new Date().toISOString().split('T')[0] });
    setShowMemberForm(null);
  };

  const handleRemoveMember = (membershipId: string) => {
    if (confirm('Remove learner from this club?')) {
      onUpdateExtra({
        ...extraState,
        memberships: extraState.memberships.filter(m => m.id !== membershipId)
      });
    }
  };

  const staffOptions = [
    ...(data.settings?.teachersList || []),
    ...(data.settings?.nonTeachingStaffList || [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Clubs &amp; Societies
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Create Club'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddClub} className="bg-white p-6 rounded-2xl border border-yellow-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Register New Club</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Club Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Debate Club, Football Team"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-yellow-500"
                value={newClub.name || ''}
                onChange={e => setNewClub({ ...newClub, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Patron / Coach</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-yellow-500"
                value={newClub.patronId || ''}
                onChange={e => setNewClub({ ...newClub, patronId: e.target.value })}
              >
                <option value="">-- Select Staff --</option>
                {staffOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Meeting Day</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-yellow-500"
                value={newClub.meetingDay || 'Friday'}
                onChange={e => setNewClub({ ...newClub, meetingDay: e.target.value })}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Meeting Time</label>
              <input
                type="time"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-yellow-500"
                value={newClub.meetingTime || ''}
                onChange={e => setNewClub({ ...newClub, meetingTime: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <input
                type="text"
                placeholder="What does this club do?"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-yellow-500"
                value={newClub.description || ''}
                onChange={e => setNewClub({ ...newClub, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Club
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {extraState.clubs.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No clubs or extracurricular activities registered yet.
          </div>
        ) : (
          extraState.clubs.map(club => {
            const patron = staffOptions.find(s => s.id === club.patronId);
            const members = extraState.memberships.filter(m => m.clubId === club.id);
            const isAddingMember = showMemberForm === club.id;

            return (
              <div key={club.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{club.name}</h3>
                    <div className="text-xs text-slate-500 mt-1">{club.description || 'No description provided.'}</div>
                  </div>
                  <button onClick={() => handleDeleteClub(club.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="p-4 bg-yellow-50/30 border-b border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Patron:</span> {patron ? patron.name : 'Unassigned'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Meets:</span> {club.meetingDay} {club.meetingTime && `at ${club.meetingTime}`}
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Users size={14} /> Members ({members.length})
                    </h4>
                    <button 
                      onClick={() => setShowMemberForm(isAddingMember ? null : club.id)}
                      className="text-xs font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Member
                    </button>
                  </div>

                  {isAddingMember && (
                    <form onSubmit={(e) => handleAddMember(club.id, e)} className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <select
                        required
                        className="border-slate-200 rounded p-1.5 focus:ring-yellow-500"
                        value={newMember.learnerId || ''}
                        onChange={e => setNewMember({ ...newMember, learnerId: e.target.value })}
                      >
                        <option value="">-- Choose Learner --</option>
                        {data.learners.map(l => (
                          <option key={l.id} value={l.id}>{l.name} ({l.cls})</option>
                        ))}
                      </select>
                      <select
                        required
                        className="border-slate-200 rounded p-1.5 focus:ring-yellow-500"
                        value={newMember.role || 'Member'}
                        onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                      >
                        <option value="Member">Member</option>
                        <option value="President">President</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Captain">Captain</option>
                      </select>
                      <div className="sm:col-span-2 flex justify-end">
                        <button type="submit" className="px-3 py-1 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-600">Save</button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {members.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No members added yet.</p>
                    ) : (
                      members.map(m => {
                        const learner = data.learners.find(l => l.id === m.learnerId);
                        const isLeader = m.role !== 'Member';
                        return (
                          <div key={m.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                            <div>
                              <div className="text-sm font-semibold text-slate-700">{learner ? learner.name : 'Unknown'}</div>
                              <div className="text-[10px] text-slate-500">{learner?.cls}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLeader ? 'bg-yellow-100 text-yellow-700' : 'text-slate-400'}`}>
                                {m.role}
                              </span>
                              <button onClick={() => handleRemoveMember(m.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity p-1">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
