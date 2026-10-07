import React, { useState, useEffect } from 'react';
import { AppData, HostelData } from '../types';
import dataManager from '../lib/db';
import { BedDouble, Home, UserCheck } from 'lucide-react';

import HostelDormsPanel from './HostelDormsPanel';
import HostelAllocationPanel from './HostelAllocationPanel';
import { useAppStore } from "../store/useAppStore";

interface HostelManagerProps {
  onUpdateHostel?: (hostel: HostelData) => void;
}

export default function HostelManager({ onUpdateHostel }: HostelManagerProps) {
  const data = useAppStore(state => state.data)!;
  const initialHostel: HostelData = data.hostel || {
    dormitories: [],
    allocations: []
  };

  const [hostelState, setHostelState] = useState<HostelData>(initialHostel);
  const [activeTab, setActiveTab] = useState<'dorms' | 'allocations'>('dorms');

  useEffect(() => {
    if (data.hostel) {
      setHostelState(data.hostel);
    }
  }, [data.hostel, onUpdateHostel]);

  const updateStateAndPersist = (updatedHostel: HostelData) => {
    setHostelState(updatedHostel);
    dataManager.updateHostelData(updatedHostel);
    if (onUpdateHostel) onUpdateHostel(updatedHostel);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-fuchsia-600 rounded-2xl shadow-lg shadow-fuchsia-500/30 text-white">
              <BedDouble size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Hostel &amp; Dormitory Management</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage dormitories, rooms, and boarder allocations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('dorms')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'dorms' ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Home size={20} />
            Dormitories &amp; Rooms
          </button>
          
          <button
            onClick={() => setActiveTab('allocations')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'allocations' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <UserCheck size={20} />
            Room Allocations
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'dorms' && (
          <HostelDormsPanel 
            hostelState={hostelState} 
            onUpdateHostel={updateStateAndPersist} 
          />
        )}
        
        {activeTab === 'allocations' && (
          <HostelAllocationPanel 
            hostelState={hostelState} 
            onUpdateHostel={updateStateAndPersist} 
          />
        )}
      </div>
    </div>
  );
}
