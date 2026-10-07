import React, { useState, useEffect } from 'react';
import { AppData, TimetableData } from '../types';
import dataManager from '../lib/db';
import { Calendar, CalendarClock, Users } from 'lucide-react';

import TimetableViewerPanel from './TimetableViewerPanel';
import TeacherWorkloadPanel from './TeacherWorkloadPanel';
import { useAppStore } from "../store/useAppStore";

interface TimetableManagerProps {
  onUpdateTimetable?: (timetable: TimetableData) => void;
}

export default function TimetableManager({ onUpdateTimetable }: TimetableManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialTimetable: TimetableData = data.timetable || {
    slots: []
  };

  const [timetableState, setTimetableState] = useState<TimetableData>(initialTimetable);
  const [activeTab, setActiveTab] = useState<'viewer' | 'workload'>('viewer');

  useEffect(() => {
    if (data.timetable) {
      setTimetableState(data.timetable);
    }
  }, [data.timetable, onUpdateTimetable]);

  const updateStateAndPersist = (updatedTimetable: TimetableData) => {
    setTimetableState(updatedTimetable);
    dataManager.updateTimetableData(updatedTimetable);
    if (onUpdateTimetable) onUpdateTimetable(updatedTimetable);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30 text-white">
              <CalendarClock size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Class Timetable Scheduler</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage weekly schedules for all classes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'viewer' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Calendar size={20} />
            Timetable Viewer
          </button>
          <button
            onClick={() => setActiveTab('workload')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'workload' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Users size={20} />
            Teacher Workload
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'viewer' && (
          <TimetableViewerPanel 
            timetableState={timetableState} 
            onUpdateTimetable={updateStateAndPersist} 
          />
        )}
        {activeTab === 'workload' && (
          <TeacherWorkloadPanel 
            timetableState={timetableState} 
          />
        )}
      </div>
    </div>
  );
}
