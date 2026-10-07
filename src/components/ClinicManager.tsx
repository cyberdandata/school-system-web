import React, { useState, useEffect } from 'react';
import { AppData, ClinicData } from '../types';
import dataManager from '../lib/db';
import { Stethoscope, HeartPulse, Activity } from 'lucide-react';

import ClinicRecordsPanel from './ClinicRecordsPanel';
import ClinicVisitsPanel from './ClinicVisitsPanel';
import { useAppStore } from "../store/useAppStore";

interface ClinicManagerProps {
  onUpdateClinic?: (clinic: ClinicData) => void;
}

export default function ClinicManager({ onUpdateClinic }: ClinicManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialClinic: ClinicData = data.clinic || {
    records: {},
    visits: []
  };

  const [clinicState, setClinicState] = useState<ClinicData>(initialClinic);
  const [activeTab, setActiveTab] = useState<'records' | 'visits'>('records');

  useEffect(() => {
    if (data.clinic) {
      setClinicState(data.clinic);
    }
  }, [data.clinic, onUpdateClinic]);

  const updateStateAndPersist = (updatedClinic: ClinicData) => {
    setClinicState(updatedClinic);
    dataManager.updateClinicData(updatedClinic);
    if (onUpdateClinic) onUpdateClinic(updatedClinic);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-2xl shadow-lg shadow-rose-500/30 text-white">
              <Stethoscope size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">School Clinic &amp; Health Center</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage student medical records and daily clinic visits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'records' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <HeartPulse size={20} />
            Medical Records
          </button>
          
          <button
            onClick={() => setActiveTab('visits')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'visits' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Activity size={20} />
            Clinic Visits
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'records' && (
          <ClinicRecordsPanel 
            clinicState={clinicState} 
            onUpdateClinic={updateStateAndPersist} 
          />
        )}
        
        {activeTab === 'visits' && (
          <ClinicVisitsPanel 
            clinicState={clinicState} 
            onUpdateClinic={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
