import React, { useState } from 'react';
import { AppData, HostelData, HostelAllocation } from '../types';
import { UserCheck, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface HostelAllocationPanelProps {
  hostelState: HostelData;
  onUpdateHostel: (data: HostelData) => void;
}

export default function HostelAllocationPanel({ hostelState, onUpdateHostel }: HostelAllocationPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAllocation, setNewAllocation] = useState<Partial<HostelAllocation>>({
    allocatedDate: new Date().toISOString().split('T')[0]
  });

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllocation.dormitoryId || !newAllocation.roomId || !newAllocation.learnerId) return;

    const allocation: HostelAllocation = {
      id: 'alloc-' + Date.now(),
      dormitoryId: newAllocation.dormitoryId,
      roomId: newAllocation.roomId,
      learnerId: newAllocation.learnerId,
      allocatedDate: newAllocation.allocatedDate || new Date().toISOString()
    };

    onUpdateHostel({
      ...hostelState,
      allocations: [allocation, ...hostelState.allocations]
    });

    setNewAllocation({ allocatedDate: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
  };

  const handleRemoveAllocation = (id: string) => {
    if (confirm('Remove this learner from the room?')) {
      onUpdateHostel({
        ...hostelState,
        allocations: hostelState.allocations.filter(a => a.id !== id)
      });
    }
  };

  // Get available rooms for selected dorm
  const selectedDorm = hostelState.dormitories.find(d => d.id === newAllocation.dormitoryId);
  const rooms = selectedDorm?.rooms || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="text-blue-600" />
          Room Allocations
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Allocate Learner'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAllocate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Assign Learner to Room</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Learner *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newAllocation.learnerId || ''}
                onChange={e => setNewAllocation({ ...newAllocation, learnerId: e.target.value })}
              >
                <option value="">-- Choose Learner --</option>
                {data.learners.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.cls})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Dormitory *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newAllocation.dormitoryId || ''}
                onChange={e => setNewAllocation({ ...newAllocation, dormitoryId: e.target.value, roomId: '' })}
              >
                <option value="">-- Choose Dormitory --</option>
                {hostelState.dormitories.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.gender})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Room *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newAllocation.roomId || ''}
                onChange={e => setNewAllocation({ ...newAllocation, roomId: e.target.value })}
                disabled={!newAllocation.dormitoryId}
              >
                <option value="">-- Choose Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newAllocation.allocatedDate || ''}
                onChange={e => setNewAllocation({ ...newAllocation, allocatedDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Allocation
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Learner Name</th>
              <th className="p-4">Class</th>
              <th className="p-4">Dormitory</th>
              <th className="p-4">Room</th>
              <th className="p-4">Allocation Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hostelState.allocations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No learners have been allocated to rooms.</td>
              </tr>
            ) : (
              hostelState.allocations.map(alloc => {
                const learner = data.learners.find(l => l.id === alloc.learnerId);
                const dorm = hostelState.dormitories.find(d => d.id === alloc.dormitoryId);
                const room = dorm?.rooms.find(r => r.id === alloc.roomId);

                return (
                  <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{learner ? learner.name : 'Unknown'}</td>
                    <td className="p-4 text-slate-600">{learner ? learner.cls : 'N/A'}</td>
                    <td className="p-4 font-semibold text-slate-700">{dorm ? dorm.name : 'Unknown Dorm'}</td>
                    <td className="p-4 font-semibold text-blue-600">{room ? room.name : 'Unknown Room'}</td>
                    <td className="p-4 text-slate-500">{new Date(alloc.allocatedDate).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleRemoveAllocation(alloc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
