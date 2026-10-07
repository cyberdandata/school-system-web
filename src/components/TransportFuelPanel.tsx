import { useAppStore } from "../store/useAppStore";
import React, { useState } from 'react';
import { AppData, TransportData, FuelLog, FinanceTransaction } from '../types';
import { Fuel, Plus, Trash2, ArrowRight } from 'lucide-react';

interface TransportFuelPanelProps {
  transportState: TransportData;
  onUpdateTransport: (data: TransportData) => void;
  onUpdateFinances: (finances: FinanceTransaction[]) => void;
}

export default function TransportFuelPanel({ transportState, onUpdateTransport, onUpdateFinances }: TransportFuelPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLog, setNewLog] = useState<Partial<FuelLog>>({
    date: new Date().toISOString().split('T')[0],
    liters: 0,
    cost: 0,
    currentMileage: 0
  });
  const [syncToFinance, setSyncToFinance] = useState(true);

  const handleAddFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.vanId || !newLog.cost || !newLog.liters) return;

    const log: FuelLog = {
      id: 'fuel-' + Date.now(),
      date: newLog.date || new Date().toISOString(),
      vanId: newLog.vanId,
      liters: newLog.liters || 0,
      cost: newLog.cost || 0,
      currentMileage: newLog.currentMileage || 0,
      recordedBy: 'Admin'
    };

    onUpdateTransport({
      ...transportState,
      fuelLogs: [log, ...transportState.fuelLogs]
    });

    if (syncToFinance && data.finances) {
      const van = transportState.vans.find(v => v.id === newLog.vanId);
      const finTx: FinanceTransaction = {
        id: 'tx-fuel-' + Date.now(),
        date: log.date.split('T')[0],
        type: 'expense',
        category: 'Maintenance',
        amount: log.cost,
        description: `Fuel for Van ${van?.plateNumber || 'Unknown'} - ${log.liters} Liters`,
        recordedBy: 'Admin',
        paymentMethod: 'Cash',
        term: 'Term 1'
      };
      onUpdateFinances([finTx, ...data.finances]);
    }

    setNewLog({ date: new Date().toISOString().split('T')[0], liters: 0, cost: 0, currentMileage: 0 });
    setShowAddForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Fuel className="text-amber-600" />
          Fuel &amp; Mileage Logs
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-amber-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Log Refueling'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFuelLog} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Record Fuel Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-amber-500"
                value={newLog.date || ''}
                onChange={e => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Van *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-amber-500"
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
              <label className="block text-xs font-semibold text-slate-500 mb-1">Liters Pumped *</label>
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 50"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-amber-500"
                value={newLog.liters || ''}
                onChange={e => setNewLog({ ...newLog, liters: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Cost (UGX) *</label>
              <input
                required
                type="number"
                min="1000"
                placeholder="e.g. 150000"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-amber-500"
                value={newLog.cost || ''}
                onChange={e => setNewLog({ ...newLog, cost: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Current Mileage (km)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 102500"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-amber-500"
                value={newLog.currentMileage || ''}
                onChange={e => setNewLog({ ...newLog, currentMileage: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={syncToFinance}
                onChange={e => setSyncToFinance(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" 
              />
              <span className="text-xs font-semibold text-slate-600">Auto-sync expense to Finance Manager</span>
            </label>
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Entry
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
              <th className="p-4">Liters</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Mileage (km)</th>
              <th className="p-4">Recorded By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transportState.fuelLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No fuel records found.</td>
              </tr>
            ) : (
              transportState.fuelLogs.map(log => {
                const van = transportState.vans.find(v => v.id === log.vanId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-slate-700">{van ? van.plateNumber : 'Deleted Van'}</td>
                    <td className="p-4 text-slate-600">{log.liters.toFixed(1)} L</td>
                    <td className="p-4 text-rose-600 font-bold">{formatCurrency(log.cost)}</td>
                    <td className="p-4 text-slate-600">{log.currentMileage > 0 ? log.currentMileage.toLocaleString() : 'N/A'}</td>
                    <td className="p-4 text-slate-500">{log.recordedBy}</td>
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
