import React, { useState } from 'react';
import { AppData, HostelData, HostelDormitory, HostelRoom } from '../types';
import { Home, Plus, Trash2, Bed } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface HostelDormsPanelProps {
  hostelState: HostelData;
  onUpdateHostel: (data: HostelData) => void;
}

export default function HostelDormsPanel({ hostelState, onUpdateHostel }: HostelDormsPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDorm, setNewDorm] = useState<Partial<HostelDormitory>>({ gender: 'Mixed', rooms: [] });

  const handleAddDorm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDorm.name) return;

    const dorm: HostelDormitory = {
      id: 'dorm-' + Date.now(),
      name: newDorm.name,
      gender: newDorm.gender as any || 'Mixed',
      rooms: newDorm.rooms || [],
      wardenId: newDorm.wardenId
    };

    onUpdateHostel({
      ...hostelState,
      dormitories: [dorm, ...hostelState.dormitories]
    });

    setNewDorm({ gender: 'Mixed', rooms: [] });
    setShowAddForm(false);
  };

  const handleDeleteDorm = (id: string) => {
    if (confirm('Are you sure you want to delete this dormitory?')) {
      onUpdateHostel({
        ...hostelState,
        dormitories: hostelState.dormitories.filter(d => d.id !== id)
      });
    }
  };

  const handleAddRoom = (dormId: string) => {
    const roomName = prompt('Enter Room Name/Number:');
    if (!roomName) return;
    const capacityStr = prompt('Enter Room Capacity (Number of beds):', '4');
    const capacity = parseInt(capacityStr || '4');
    if (isNaN(capacity)) return;

    const newRoom: HostelRoom = {
      id: 'room-' + Date.now(),
      name: roomName,
      capacity
    };

    const updatedDorms = hostelState.dormitories.map(dorm => {
      if (dorm.id === dormId) {
        return { ...dorm, rooms: [...dorm.rooms, newRoom] };
      }
      return dorm;
    });

    onUpdateHostel({
      ...hostelState,
      dormitories: updatedDorms
    });
  };

  const staffOptions = [
    ...(data.settings?.teachersList || []),
    ...(data.settings?.nonTeachingStaffList || [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Home className="text-fuchsia-600" />
          Dormitories &amp; Blocks
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-fuchsia-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add Dormitory'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddDorm} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Register New Dormitory Block</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Dormitory Name *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-fuchsia-500"
                value={newDorm.name || ''}
                onChange={e => setNewDorm({ ...newDorm, name: e.target.value })}
              >
                <option value="">-- Select Block --</option>
                {(data.settings.hostelBlocks || []).map(block => (
                  <option key={block.id} value={block.name}>{block.name}</option>
                ))}
              </select>
              {(!data.settings.hostelBlocks || data.settings.hostelBlocks.length === 0) && (
                <p className="text-[10px] text-rose-500 mt-1">Please add blocks in Settings first.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-fuchsia-500"
                value={newDorm.gender || 'Mixed'}
                onChange={e => setNewDorm({ ...newDorm, gender: e.target.value as any })}
              >
                <option value="Boys">Boys Only</option>
                <option value="Girls">Girls Only</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Warden / Matron</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-fuchsia-500"
                value={newDorm.wardenId || ''}
                onChange={e => setNewDorm({ ...newDorm, wardenId: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {staffOptions.map(staff => (
                  <option key={staff.id} value={staff.id}>{staff.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Dormitory
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {hostelState.dormitories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No dormitories registered yet.
          </div>
        ) : (
          hostelState.dormitories.map(dorm => {
            const warden = staffOptions.find(s => s.id === dorm.wardenId);
            const totalCapacity = dorm.rooms.reduce((sum, r) => sum + r.capacity, 0);

            return (
              <div key={dorm.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{dorm.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dorm.gender === 'Boys' ? 'bg-blue-100 text-blue-800' :
                        dorm.gender === 'Girls' ? 'bg-pink-100 text-pink-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {dorm.gender}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Capacity: {totalCapacity}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDorm(dorm.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-4 flex-1">
                  <div className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                    <span className="font-semibold">Warden:</span> {warden ? warden.name : <span className="italic text-slate-400">Unassigned</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">Rooms ({dorm.rooms.length})</h4>
                      <button 
                        onClick={() => handleAddRoom(dorm.id)}
                        className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Room
                      </button>
                    </div>
                    {dorm.rooms.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No rooms added yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {dorm.rooms.map(room => (
                          <div key={room.id} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">{room.name}</span>
                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                              <Bed size={12} /> {room.capacity}
                            </div>
                          </div>
                        ))}
                      </div>
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
