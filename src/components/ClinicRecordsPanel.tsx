import React, { useState } from 'react';
import { AppData, ClinicData, ClinicRecord } from '../types';
import { Stethoscope, Plus, HeartPulse } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface ClinicRecordsPanelProps {
  clinicState: ClinicData;
  onUpdateClinic: (data: ClinicData) => void;
}

export default function ClinicRecordsPanel({ clinicState, onUpdateClinic }: ClinicRecordsPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [showForm, setShowForm] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [record, setRecord] = useState<Partial<ClinicRecord>>({});

  const handleSelectLearner = (id: string) => {
    setSelectedLearner(id);
    if (id) {
      setRecord(clinicState.records[id] || { learnerId: id, bloodGroup: '', allergies: '', chronicConditions: '', emergencyContact: '' });
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearner) return;

    onUpdateClinic({
      ...clinicState,
      records: {
        ...clinicState.records,
        [selectedLearner]: record as ClinicRecord
      }
    });
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Medical Record Saved Successfully!', type: 'success' } }));
    setShowForm(false);
    setSelectedLearner('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="text-rose-500" />
            Student Medical Records
          </h2>
          <p className="text-sm text-slate-500">Maintain allergies and emergency contacts.</p>
        </div>
        <div className="flex-1 md:max-w-md">
          <select
            className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500 font-semibold"
            value={selectedLearner}
            onChange={e => handleSelectLearner(e.target.value)}
          >
            <option value="">-- Search for a Learner --</option>
            {data.learners.map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.cls})</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && selectedLearner && (
        <form onSubmit={handleSave} className="bg-rose-50 p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-rose-800 border-b border-rose-200 pb-2">Medical Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">Blood Group</label>
              <select
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={record.bloodGroup || ''}
                onChange={e => setRecord({ ...record, bloodGroup: e.target.value })}
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">Emergency Contact *</label>
              <input
                required
                type="text"
                placeholder="Parent Name & Phone"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={record.emergencyContact || ''}
                onChange={e => setRecord({ ...record, emergencyContact: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-rose-700 mb-1">Allergies</label>
              <input
                type="text"
                placeholder="e.g. Peanuts, Penicillin (Leave blank if none)"
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={record.allergies || ''}
                onChange={e => setRecord({ ...record, allergies: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-rose-700 mb-1">Chronic Conditions / Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Asthma, needs inhaler..."
                className="w-full border-slate-200 rounded-lg p-2 text-sm focus:ring-rose-500"
                value={record.chronicConditions || ''}
                onChange={e => setRecord({ ...record, chronicConditions: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 text-sm">
              Save Medical Record
            </button>
          </div>
        </form>
      )}

      {/* List of existing records */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Students with Health Alerts</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Learner</th>
              <th className="p-4">Blood</th>
              <th className="p-4">Allergies / Conditions</th>
              <th className="p-4">Emergency Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.values(clinicState.records).length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No medical records created.</td>
              </tr>
            ) : (
              Object.values(clinicState.records)
                .filter(r => r.allergies || r.chronicConditions)
                .map(rec => {
                  const learner = data.learners.find(l => l.id === rec.learnerId);
                  return (
                    <tr key={rec.learnerId} className="hover:bg-rose-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{learner?.name || 'Unknown'} <span className="text-slate-500 font-normal text-xs block">{learner?.cls}</span></td>
                      <td className="p-4 font-bold text-rose-600">{rec.bloodGroup || '-'}</td>
                      <td className="p-4">
                        {rec.allergies && <div className="text-rose-600 text-xs font-semibold mb-1">Allergies: {rec.allergies}</div>}
                        {rec.chronicConditions && <div className="text-slate-600 text-xs">{rec.chronicConditions}</div>}
                      </td>
                      <td className="p-4 text-slate-600 text-xs font-semibold">{rec.emergencyContact}</td>
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
