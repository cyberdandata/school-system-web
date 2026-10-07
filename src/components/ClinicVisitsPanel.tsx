import React, { useState, useMemo } from 'react';
import { AppData, ClinicData, ClinicVisit } from '../types';
import { Activity, Plus, Trash2 } from 'lucide-react';
import GlobalFilterBar from './ui/GlobalFilterBar';
import { useAppStore } from "../store/useAppStore";

interface ClinicVisitsPanelProps {
  clinicState: ClinicData;
  onUpdateClinic: (data: ClinicData) => void;
}

export default function ClinicVisitsPanel({ clinicState, onUpdateClinic }: ClinicVisitsPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);

  // === Filters ===
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSex, setFilterSex] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const resetFilters = () => { setSearch(''); setFilterClass('All'); setFilterSex('All'); setFilterDateFrom(''); setFilterDateTo(''); };
  const [newVisit, setNewVisit] = useState<Partial<ClinicVisit>>({
    date: new Date().toISOString().split('T')[0]
  });

  const handleLogVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisit.learnerId || !newVisit.symptoms) return;

    const visit: ClinicVisit = {
      id: 'visit-' + Date.now(),
      learnerId: newVisit.learnerId,
      date: newVisit.date || new Date().toISOString(),
      symptoms: newVisit.symptoms,
      diagnosis: newVisit.diagnosis || 'Pending',
      treatment: newVisit.treatment || 'None',
      nurseName: newVisit.nurseName || 'Duty Nurse'
    };

    onUpdateClinic({
      ...clinicState,
      visits: [visit, ...clinicState.visits]
    });

    setNewVisit({ date: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
  };

  const handleDeleteVisit = (id: string) => {
    if (confirm('Delete this visit log?')) {
      onUpdateClinic({
        ...clinicState,
        visits: clinicState.visits.filter(v => v.id !== id)
      });
    }
  };

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return clinicState.visits.filter(visit => {
      const learner = data.learners.find(l => l.id === visit.learnerId);
      if (!learner) return false;
      const matchSearch = search === '' ||
        (learner.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (visit.symptoms || '').toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'All' || learner.cls === filterClass;
      const matchSex = filterSex === 'All' || learner.sex === filterSex;
      const visitDate = visit.date ? visit.date.substring(0, 10) : '';
      const matchFrom = filterDateFrom === '' || visitDate >= filterDateFrom;
      const matchTo = filterDateTo === '' || visitDate <= filterDateTo;
      return matchSearch && matchClass && matchSex && matchFrom && matchTo;
    });
  }, [clinicState.visits, data.learners, search, filterClass, filterSex, filterDateFrom, filterDateTo]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="text-rose-500" />
          Clinic Visit Log
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-rose-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Log New Visit'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleLogVisit} className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Log Learner Clinic Visit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Learner *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.learnerId || ''}
                onChange={e => setNewVisit({ ...newVisit, learnerId: e.target.value })}
              >
                <option value="">-- Choose Learner --</option>
                {data.learners.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.cls})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date *</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.date || ''}
                onChange={e => setNewVisit({ ...newVisit, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Attending Nurse / Staff</label>
              <input
                type="text"
                placeholder="e.g. Nurse Jane"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.nurseName || ''}
                onChange={e => setNewVisit({ ...newVisit, nurseName: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Symptoms Presented *</label>
              <input
                required
                type="text"
                placeholder="e.g. Headache, fever, stomach pain"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.symptoms || ''}
                onChange={e => setNewVisit({ ...newVisit, symptoms: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Diagnosis &amp; Notes</label>
              <input
                type="text"
                placeholder="e.g. Malaria test negative. Given paracetamol."
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.treatment || ''}
                onChange={e => setNewVisit({ ...newVisit, treatment: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Medicine Prescribed</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={newVisit.medicinePrescribed || ''}
                onChange={e => setNewVisit({ ...newVisit, medicinePrescribed: e.target.value })}
              >
                <option value="">-- No Medicine --</option>
                {(data.settings.clinicMedicines || []).map(med => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>
              {(!data.settings.clinicMedicines || data.settings.clinicMedicines.length === 0) && (
                <p className="text-[10px] text-rose-500 mt-1">Please add medicines in Settings first.</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Visit Log
            </button>
          </div>
        </form>
      )}

      {/* === Filters === */}
      <GlobalFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search learner or symptoms..."
        showClassFilter
        selectedClass={filterClass}
        onClassChange={setFilterClass}
        showSexFilter
        selectedSex={filterSex}
        onSexChange={setFilterSex}
        showDateFilter
        dateFrom={filterDateFrom}
        dateTo={filterDateTo}
        onDateFromChange={setFilterDateFrom}
        onDateToChange={setFilterDateTo}
        onReset={resetFilters}
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Learner</th>
              <th className="p-4">Symptoms</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Medicine</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredVisits.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {clinicState.visits.length === 0 ? 'No clinic visits logged yet.' : 'No visits match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredVisits.map(visit => {
                const learner = data.learners.find(l => l.id === visit.learnerId);
                return (
                  <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                      {new Date(visit.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {learner ? learner.name : 'Unknown'}
                      <span className="block text-xs text-slate-500 font-normal">{learner?.cls}</span>
                    </td>
                    <td className="p-4 text-slate-700">{visit.symptoms}</td>
                    <td className="p-4 text-slate-600 text-xs">{visit.treatment}</td>
                    <td className="p-4">
                      {visit.medicinePrescribed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          {visit.medicinePrescribed}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic text-xs">None</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteVisit(visit.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
