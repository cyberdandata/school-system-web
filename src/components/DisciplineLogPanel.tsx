import React, { useState, useMemo } from 'react';
import { AppData, DisciplineData, DisciplineIncident } from '../types';
import { Scale, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlobalFilterBar from './ui/GlobalFilterBar';
import { useAppStore } from "../store/useAppStore";

interface DisciplineLogPanelProps {
  disciplineState: DisciplineData;
  onUpdateDiscipline: (data: DisciplineData) => void;
}

export default function DisciplineLogPanel({ disciplineState, onUpdateDiscipline }: DisciplineLogPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showAddForm, setShowAddForm] = useState(false);

  // === Filters ===
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterSex, setFilterSex] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const resetFilters = () => { setSearch(''); setFilterClass('All'); setFilterSex('All'); setFilterType('All'); };
  const [newIncident, setNewIncident] = useState<Partial<DisciplineIncident>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Demerit',
    points: 1
  });

  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.learnerId || !newIncident.description) return;

    const incident: DisciplineIncident = {
      id: 'incident-' + Date.now(),
      learnerId: newIncident.learnerId,
      date: newIncident.date || new Date().toISOString(),
      type: newIncident.type as 'Merit' | 'Demerit' || 'Demerit',
      points: Number(newIncident.points) || 1,
      description: newIncident.description,
      actionTaken: newIncident.actionTaken || 'None',
      reportedBy: newIncident.reportedBy || 'Staff'
    };

    onUpdateDiscipline({
      ...disciplineState,
      incidents: [incident, ...disciplineState.incidents]
    });

    setNewIncident({
      date: new Date().toISOString().split('T')[0],
      type: 'Demerit',
      points: 1
    });
    setShowAddForm(false);
  };

  const handleDeleteIncident = (id: string) => {
    if (confirm('Delete this conduct record?')) {
      onUpdateDiscipline({
        ...disciplineState,
        incidents: disciplineState.incidents.filter(i => i.id !== id)
      });
    }
  };

  const staffOptions = [
    ...(data.settings?.teachersList || []),
    ...(data.settings?.nonTeachingStaffList || [])
  ];

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return disciplineState.incidents.filter(incident => {
      const learner = data.learners.find(l => l.id === incident.learnerId);
      if (!learner) return false;
      const matchSearch = search === '' ||
        (learner.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (incident.description || '').toLowerCase().includes(search.toLowerCase());
      const matchClass = filterClass === 'All' || learner.cls === filterClass;
      const matchSex = filterSex === 'All' || learner.sex === filterSex;
      const matchType = filterType === 'All' || incident.type === filterType;
      return matchSearch && matchClass && matchSex && matchType;
    });
  }, [disciplineState.incidents, data.learners, search, filterClass, filterSex, filterType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Scale className="text-orange-500" />
          Disciplinary &amp; Conduct Log
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 transition-colors"
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Log Incident'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleLogIncident} className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-700 border-b pb-2">Record Conduct Incident</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Learner *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.learnerId || ''}
                onChange={e => setNewIncident({ ...newIncident, learnerId: e.target.value })}
              >
                <option value="">-- Choose Learner --</option>
                {data.learners.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.cls})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500 font-bold"
                value={newIncident.type || 'Demerit'}
                onChange={e => setNewIncident({ ...newIncident, type: e.target.value as any })}
              >
                <option value="Demerit">Demerit (Negative)</option>
                <option value="Merit">Merit (Positive)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Points *</label>
              <input
                required
                type="number"
                min="1"
                max="10"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.points || ''}
                onChange={e => setNewIncident({ ...newIncident, points: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date *</label>
              <input
                required
                type="date"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.date || ''}
                onChange={e => setNewIncident({ ...newIncident, date: e.target.value })}
              />
            </div>
            <div className="md:col-span-4 lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Reason *</label>
              <select
                required
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.description || ''}
                onChange={e => {
                  const val = e.target.value;
                  const offense = data.settings.disciplineOffenses?.find(o => o.name === val);
                  if (offense) {
                    setNewIncident({ ...newIncident, description: val, type: offense.type, points: offense.defaultPoints || 1 });
                  } else {
                    setNewIncident({ ...newIncident, description: val });
                  }
                }}
              >
                <option value="">-- Select Offense/Merit --</option>
                {(data.settings.disciplineOffenses || []).map(offense => (
                  <option key={offense.id} value={offense.name}>{offense.name}</option>
                ))}
              </select>
              {(!data.settings.disciplineOffenses || data.settings.disciplineOffenses.length === 0) && (
                <p className="text-[10px] text-rose-500 mt-1">Please add offenses in Settings first.</p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Action Taken</label>
              <input
                type="text"
                placeholder="e.g. Warning, Detention, Praise"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.actionTaken || ''}
                onChange={e => setNewIncident({ ...newIncident, actionTaken: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reported By</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-orange-500"
                value={newIncident.reportedBy || ''}
                onChange={e => setNewIncident({ ...newIncident, reportedBy: e.target.value })}
              >
                <option value="">-- Select Staff --</option>
                {staffOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm">
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* === Filters === */}
      <GlobalFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search learner name or incident..."
        showClassFilter
        selectedClass={filterClass}
        onClassChange={setFilterClass}
        showSexFilter
        selectedSex={filterSex}
        onSexChange={setFilterSex}
        showTypeFilter
        selectedType={filterType}
        onTypeChange={setFilterType}
        typeLabel="Incident Type"
        typeOptions={[
          { label: 'Demerit (Negative)', value: 'Demerit' },
          { label: 'Merit (Positive)', value: 'Merit' },
        ]}
        onReset={resetFilters}
      />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Learner</th>
              <th className="p-4 text-center">Type</th>
              <th className="p-4">Incident Details</th>
              <th className="p-4">Action &amp; Reporter</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  {disciplineState.incidents.length === 0 ? 'No disciplinary incidents recorded.' : 'No incidents match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredIncidents.map(incident => {
                const learner = data.learners.find(l => l.id === incident.learnerId);
                const staff = staffOptions.find(s => s.id === incident.reportedBy);
                const isMerit = incident.type === 'Merit';
                
                return (
                  <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                      {new Date(incident.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {learner ? learner.name : 'Unknown'}
                      <span className="block text-xs text-slate-500 font-normal">{learner?.cls}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isMerit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isMerit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {incident.points} {isMerit ? 'Merits' : 'Demerits'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{incident.description}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 text-xs">{incident.actionTaken}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">By: {staff ? staff.name : incident.reportedBy}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteIncident(incident.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
