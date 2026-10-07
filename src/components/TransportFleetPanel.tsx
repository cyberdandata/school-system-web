import React, { useState } from 'react';
import { AppData, TransportVan, TransportData } from '../types';
import { Bus, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface TransportFleetPanelProps {
  transportState: TransportData;
  onUpdateTransport: (data: TransportData) => void;
}

export default function TransportFleetPanel({ transportState, onUpdateTransport }: TransportFleetPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVan, setNewVan] = useState<Partial<TransportVan>>({ status: 'Active', capacity: 14 });

  const drivers = data.settings?.nonTeachingStaffList?.filter(staff => staff.department === 'Transport') || [];

  const handleAddVan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVan.plateNumber) return;

    const van: TransportVan = {
      id: 'van-' + Date.now(),
      plateNumber: newVan.plateNumber,
      capacity: newVan.capacity || 14,
      status: newVan.status as any || 'Active',
      assignedDriverId: newVan.assignedDriverId,
      makeAndModel: newVan.makeAndModel
    };

    onUpdateTransport({
      ...transportState,
      vans: [van, ...transportState.vans]
    });
    setNewVan({ status: 'Active', capacity: 14 });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this van?')) {
      onUpdateTransport({
        ...transportState,
        vans: transportState.vans.filter(v => v.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bus className="text-blue-600" />
          School Fleet Directory
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add New Van'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVan} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Register New Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Number Plate *</label>
              <input
                required
                type="text"
                placeholder="e.g. UBF 123A"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newVan.plateNumber || ''}
                onChange={e => setNewVan({ ...newVan, plateNumber: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Make & Model</label>
              <input
                type="text"
                placeholder="e.g. Toyota Hiace"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newVan.makeAndModel || ''}
                onChange={e => setNewVan({ ...newVan, makeAndModel: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Capacity (Seats)</label>
              <input
                type="number"
                min="1"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newVan.capacity || 14}
                onChange={e => setNewVan({ ...newVan, capacity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assigned Driver</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newVan.assignedDriverId || ''}
                onChange={e => setNewVan({ ...newVan, assignedDriverId: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-blue-500"
                value={newVan.status || 'Active'}
                onChange={e => setNewVan({ ...newVan, status: e.target.value as any })}
              >
                <option value="Active">Active (Running)</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Vehicle
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Number Plate</th>
              <th className="p-4">Make & Model</th>
              <th className="p-4">Capacity</th>
              <th className="p-4">Assigned Driver</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(!transportState.vans || transportState.vans.length === 0) ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No vehicles registered yet.</td>
              </tr>
            ) : (
              transportState.vans.map(van => {
                const driver = drivers.find(d => d.id === van.assignedDriverId);
                return (
                  <tr key={van.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{van.plateNumber}</td>
                    <td className="p-4 text-slate-600">{van.makeAndModel || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{van.capacity} seats</td>
                    <td className="p-4 text-slate-600 font-medium">
                      {driver ? driver.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        van.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        van.status === 'In Maintenance' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {van.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(van.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
