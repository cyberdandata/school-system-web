import React, { useState, useEffect } from 'react';
import { AppData, ExtracurricularData } from '../types';
import dataManager from '../lib/db';
import { Trophy, Medal } from 'lucide-react';

import ClubsPanel from './ClubsPanel';
import { useAppStore } from "../store/useAppStore";

interface ExtracurricularManagerProps {
  onUpdateExtra?: (extra: ExtracurricularData) => void;
}

export default function ExtracurricularManager({ onUpdateExtra }: ExtracurricularManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialExtra: ExtracurricularData = data.extracurricular || {
    clubs: [],
    memberships: []
  };

  const [extraState, setExtraState] = useState<ExtracurricularData>(initialExtra);
  const [activeTab, setActiveTab] = useState<'clubs'>('clubs');

  useEffect(() => {
    if (data.extracurricular) {
      setExtraState(data.extracurricular);
    }
  }, [data.extracurricular, onUpdateExtra]);

  const updateStateAndPersist = (updatedExtra: ExtracurricularData) => {
    setExtraState(updatedExtra);
    dataManager.updateExtracurricularData(updatedExtra);
    if (onUpdateExtra) onUpdateExtra(updatedExtra);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/30 text-white">
              <Trophy size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Clubs &amp; Extracurriculars</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage student societies, sports teams, and leadership roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'clubs' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Medal size={20} />
            Clubs Directory
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'clubs' && (
          <ClubsPanel 
            extraState={extraState} 
            onUpdateExtra={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
