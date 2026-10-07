import { useAppStore } from "../store/useAppStore";
import React, { useState } from 'react';
import { AppData, TransportData, MaintenanceLog, FinanceTransaction } from '../types';
import { Wrench, Plus, PenTool } from 'lucide-react';

interface TransportMaintenancePanelProps {
  transportState: TransportData;
  onUpdateTransport: (data: TransportData) => void;
  onUpdateFinances: (finances: FinanceTransaction[]) => void;
}

export default function TransportMaintenancePanel({ transportState, onUpdateTransport, onUpdateFinances }: TransportMaintenancePanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<MaintenanceLog>>({
    date: new Date().toISOString().split('T')[0],
    serviceType: 'Routine',
    cost: 0
  });
  const [syncToFinance, setSyncToFinance] = useState(true);

  const handleAddMaintenanceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.vanId || !newLog.cost || !newLog.description) return;

    const log: MaintenanceLog = {
      id: 'maint-' + Date.now(),
      date: newLog.date || new Date().toISOString(),
      vanId: newLog.vanId,
      serviceType: newLog.serviceType as any || 'Routine',
      description: newLog.description,
      cost: newLog.cost || 0,
      nextServiceDate: newLog.nextServiceDate,
      recordedBy: 'Admin'
    };

    onUpdateTransport({
      ...transportState,
      maintenanceLogs: [log, ...transportState.maintenanceLogs]
    });

    if (syncToFinance && data.finances) {
      const van = transportState.vans.find(v => v.id === newLog.vanId);
      const finTx: FinanceTransaction = {
        id: 'tx-maint-' + Date.now(),
        date: log.date.split('T')[0],
        type: 'expense',
        category: 'Maintenance',
        amount: log.cost,
        description: `Maintenance (${log.serviceType}) for Van ${van?.plateNumber || 'Unknown'}: ${log.description}`,
        recordedBy: 'Admin',
        paymentMethod: 'Bank Transfer',
        term: 'Term 1'
      };
      onUpdateFinances([finTx, ...data.finances]);
    }

    setNewLog({ date: new Date().toISOString().split('T')[0], serviceType: 'Routine', cost: 0 });
    setShowAddForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Wrench className="text-indigo-600" />
          Maintenance &amp; Service History
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Log Maintenance'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddMaintenanceLog} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Record Service / Repair</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Service Date</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.date || ''}
                onChange={e => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Van *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.vanId || ''}
                onChange={e => setNewLog({ ...newLog, vanId: e.target.value })}
              >
                <option value="">-- Choose Van --</option>
                {transportState.vans.map(van => (
                  <option key={van.id} value={van.id}>{van.plateNumber} ({van.makeAndModel})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Service Type</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.serviceType || 'Routine'}
                onChange={e => setNewLog({ ...newLog, serviceType: e.target.value as any })}
              >
                <option value="Routine">Routine Service</option>
                <option value="Repair">Breakdown / Repair</option>
                <option value="Inspection">Inspection</option>
                <option value="Tires">Tires & Suspension</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Cost (UGX) *</label>
              <input
                required
                type="number"
                min="0"
                placeholder="e.g. 250000"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.cost || ''}
                onChange={e => setNewLog({ ...newLog, cost: parseFloat(e.target.value) })}
              />
            </div>
            <div className="col-span-1 md:col-span-2 xl:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description of Work Done *</label>
              <input
                required
                type="text"
                placeholder="e.g. Changed oil, filters, and replaced brake pads"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.description || ''}
                onChange={e => setNewLog({ ...newLog, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Next Service Due (Optional)</label>
              <input
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-indigo-500"
                value={newLog.nextServiceDate || ''}
                onChange={e => setNewLog({ ...newLog, nextServiceDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={syncToFinance}
                onChange={e => setSyncToFinance(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span className="text-xs font-semibold text-slate-600">Auto-sync expense to Finance Manager</span>
            </label>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Record
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Van</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Next Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transportState.maintenanceLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No maintenance records found.</td>
              </tr>
            ) : (
              transportState.maintenanceLogs.map(log => {
                const van = transportState.vans.find(v => v.id === log.vanId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-700">{van ? van.plateNumber : 'Deleted Van'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                        {log.serviceType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{log.description}</td>
                    <td className="p-4 text-rose-600 font-bold">{formatCurrency(log.cost)}</td>
                    <td className="p-4 text-slate-500">
                      {log.nextServiceDate ? new Date(log.nextServiceDate).toLocaleDateString() : 'N/A'}
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
