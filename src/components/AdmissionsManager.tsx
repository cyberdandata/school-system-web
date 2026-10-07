import React, { useState, useEffect } from 'react';
import { AppData, AdmissionsData, AdmissionRecord, Learner } from '../types';
import dataManager from '../lib/db';
import GlobalFilterBar from './ui/GlobalFilterBar';
import { UserPlus, Plus, Search, Filter, CheckCircle2, XCircle, Clock, Trash2, ArrowRight } from 'lucide-react';
import { ALL_CLASSES } from '../lib/defaults';
import { useAppStore } from '../store/useAppStore';
import AdmissionForm from './AdmissionForm';

interface AdmissionsManagerProps {
  data: AppData;
  onUpdateAdmissions?: (admissions: AdmissionsData) => void;
  onUpdateLearners?: (learners: Learner[]) => void;
}

export default function AdmissionsManager() {
  const data = useAppStore(state => state.data);
  const updateAdmissions = useAppStore(state => state.updateAdmissions);
  const initialAdmissions: AdmissionsData = data.admissions || { applicants: [] };
  const [admissionsState, setAdmissionsState] = useState<AdmissionsData>(initialAdmissions);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionRecord['status'] | 'All'>('All');

  // Form State
  const [newApplicant, setNewApplicant] = useState<Partial<AdmissionRecord>>({
    status: 'Pending',
    applicationDate: new Date().toISOString(),
    targetClass: 'P1',
    gender: 'Male'
  });

  useEffect(() => {
    if (data.admissions) {
      setAdmissionsState(data.admissions);
    }
  }, [data.admissions]);

  const updateStateAndPersist = (updatedAdmissions: AdmissionsData) => {
    setAdmissionsState(updatedAdmissions);
    dataManager.updateAdmissionsData(updatedAdmissions);
    updateAdmissions(updatedAdmissions);
  };

  const handleAddApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.applicantName || !newApplicant.parentName || !newApplicant.parentPhone) return;

    const applicant: AdmissionRecord = {
      id: 'app-' + Date.now(),
      applicantName: newApplicant.applicantName,
      dateOfBirth: newApplicant.dateOfBirth || '',
      gender: newApplicant.gender as 'Male' | 'Female',
      targetClass: newApplicant.targetClass || 'P1',
      previousSchool: newApplicant.previousSchool || '',
      parentName: newApplicant.parentName,
      parentPhone: newApplicant.parentPhone,
      parentEmail: newApplicant.parentEmail || '',
      applicationDate: new Date().toISOString(),
      entranceExamScore: newApplicant.entranceExamScore,
      status: 'Pending',
      notes: newApplicant.notes || ''
    };

    const updated = {
      ...admissionsState,
      applicants: [applicant, ...admissionsState.applicants]
    };
    
    updateStateAndPersist(updated);
    setShowAddModal(false);
    setNewApplicant({ status: 'Pending', applicationDate: new Date().toISOString(), targetClass: 'P1', gender: 'Male' });
  };

  const handleUpdateStatus = (id: string, newStatus: AdmissionRecord['status']) => {
    const updated = {
      ...admissionsState,
      applicants: admissionsState.applicants.map(app => app.id === id ? { ...app, status: newStatus } : app)
    };
    updateStateAndPersist(updated);
  };

  const handleDeleteApplicant = (id: string) => {
    if (window.confirm('Are you sure you want to delete this application record?')) {
      const updated = {
        ...admissionsState,
        applicants: admissionsState.applicants.filter(app => app.id !== id)
      };
      updateStateAndPersist(updated);
    }
  };

  const handleEnrollLearner = (applicant: AdmissionRecord) => {
    if (window.confirm(`Are you sure you want to officially enroll ${applicant.applicantName} into ${applicant.targetClass}?`)) {
      // 1. Mark as enrolled in admissions
      const updatedAdmissions = {
        ...admissionsState,
        applicants: admissionsState.applicants.map(app => app.id === applicant.id ? { ...app, status: 'Enrolled' } : app)
      };
      
      // 2. Create the new learner record
      const newLearner: Learner = {
        id: `L-${Date.now().toString().slice(-6)}`,
        name: applicant.applicantName,
        cls: applicant.targetClass,
        section: data.settings?.sectionSubjects?.find(s => s.classes.includes(applicant.targetClass))?.name || 'Lower Primary',
        gender: applicant.gender,
        parentPhone: applicant.parentPhone
      };

      const updatedLearners = [newLearner, ...data.learners];

      // 3. Persist both
      setAdmissionsState(updatedAdmissions);
      dataManager.updateAdmissionsData(updatedAdmissions);
      updateAdmissions(updatedAdmissions);

      dataManager.updateLearners(updatedLearners);
      if (onUpdateLearners) onUpdateLearners(updatedLearners);

      window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: `${applicant.applicantName} has been enrolled successfully!`, type: 'success' } }));
    }
  };

  const filteredApplicants = admissionsState.applicants.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white">
              <UserPlus size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Admissions &amp; Enrollment</h1>
              </div>
              <p className="text-xs text-slate-400">Manage prospective students, applications, and official enrollments</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', count: admissionsState.applicants.length, icon: UserPlus, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Pending Review', count: admissionsState.applicants.filter(a => a.status === 'Pending').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Approved', count: admissionsState.applicants.filter(a => a.status === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Enrolled', count: admissionsState.applicants.filter(a => a.status === 'Enrolled').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
              <p className="text-xl font-black text-slate-800">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search applicants or parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Enrolled">Enrolled</option>
          </select>
        </div>
      </div>

      {/* Applicant Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Target Class</th>
                <th className="p-4">Parent Details</th>
                <th className="p-4">Application Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">No applicants found matching your criteria.</td>
                </tr>
              ) : (
                filteredApplicants.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{app.applicantName}</div>
                      <div className="text-xs text-slate-500">{app.gender} • {app.previousSchool || 'No prior school'}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                        {app.targetClass}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">{app.parentName}</div>
                      <div className="text-xs text-slate-500">{app.parentPhone}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value as any)}
                        disabled={app.status === 'Enrolled'}
                        className={`text-xs font-bold px-2 py-1 rounded-md border-0 cursor-pointer ${
                          app.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                          app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                          app.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                          'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        {app.status === 'Enrolled' && <option value="Enrolled">Enrolled</option>}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.status === 'Approved' && (
                          <button
                            onClick={() => handleEnrollLearner(app)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                            title="Enroll and add to Learners database"
                          >
                            <span>Enroll</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteApplicant(app.id)}
                          disabled={app.status === 'Enrolled'}
                          className="p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      
      <AdmissionForm 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSubmitApplicant={(newApplicantData) => {
          const applicant: AdmissionRecord = {
            id: `app-${Date.now()}`,
            ...newApplicantData,
            applicationDate: new Date().toISOString()
          };
          const updatedAdmissions = {
            ...admissionsState,
            applicants: [...admissionsState.applicants, applicant]
          };
          
          setAdmissionsState(updatedAdmissions);
          updateAdmissions(updatedAdmissions);
          setShowAddModal(false);
        }}
      />

    </div>
  );
}
