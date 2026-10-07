import React, { useState, useEffect } from 'react';
import { AppData, DisciplineData } from '../types';
import dataManager from '../lib/db';
import { Scale, ShieldAlert } from 'lucide-react';

import DisciplineLogPanel from './DisciplineLogPanel';
import { useAppStore } from "../store/useAppStore";

interface DisciplineManagerProps {
  onUpdateDiscipline?: (discipline: DisciplineData) => void;
}

export default function DisciplineManager({ onUpdateDiscipline }: DisciplineManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialDiscipline: DisciplineData = data.discipline || {
    incidents: []
  };

  const [disciplineState, setDisciplineState] = useState<DisciplineData>(initialDiscipline);
  const [activeTab, setActiveTab] = useState<'log'>('log');

  useEffect(() => {
    if (data.discipline) {
      setDisciplineState(data.discipline);
    }
  }, [data.discipline, onUpdateDiscipline]);

  const updateStateAndPersist = (updatedDiscipline: DisciplineData) => {
    setDisciplineState(updatedDiscipline);
    dataManager.updateDisciplineData(updatedDiscipline);
    if (onUpdateDiscipline) onUpdateDiscipline(updatedDiscipline);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30 text-white">
              <Scale size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Disciplinary &amp; Conduct Records</h1>
              </div>
              <p className="text-xs text-slate-400">
                Track student behavior, merits, and demerits securely
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'log' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <ShieldAlert size={20} />
            Incident Log
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'log' && (
          <DisciplineLogPanel 
            disciplineState={disciplineState} 
            onUpdateDiscipline={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
