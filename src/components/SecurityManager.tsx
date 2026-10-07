import React, { useState, useEffect } from 'react';
import { AppData, SecurityData, VisitorRecord, UnknownPersonAlert } from '../types';
import dataManager from '../lib/db';
import { ShieldCheck, UserCheck, Users, FileSpreadsheet } from 'lucide-react';

import EntryControlPanel from './EntryControlPanel';
import AttendanceSheetPanel from './AttendanceSheetPanel';
import VisitorLogPanel from './VisitorLogPanel';
import { useAppStore } from "../store/useAppStore";

interface SecurityManagerProps {
  onUpdateSecurity?: (updatedSec: SecurityData) => void;
}

export default function SecurityManager({ onUpdateSecurity }: SecurityManagerProps) {
  const data = useAppStore(state => state.data)!;
  // Default sample alerts if none provided
  const defaultInitialAlerts: UnknownPersonAlert[] = [];

  const defaultInitialVisitors: VisitorRecord[] = [];

  const initialSecurity: SecurityData = data.security && data.security.gateLogs && data.security.gateLogs.length > 0 ? data.security : {
    gateLogs: data.security?.gateLogs || [],
    visitors: data.security?.visitors && data.security.visitors.length > 0 ? data.security.visitors : defaultInitialVisitors,
    unknownAlerts: data.security?.unknownAlerts && data.security.unknownAlerts.length > 0 ? data.security.unknownAlerts : defaultInitialAlerts,
    config: (data.security?.config as any) || {
      gateState: 'Locked',
      autoOpenForStudents: true,
      autoOpenForTeachers: true,
      notifyParentsOnEntry: true,
      notifyParentsOnExit: true,
      livenessDetectionEnabled: true,
      antiSpoofingEnabled: true,
      tailgatingAlarmEnabled: true,
      hikvisionCamConnected: true,
      zktecoScannerConnected: true,
      relayControllerOnline: true,
      activeGateName: 'Main Gate - Gate A'
    }
  };

  const [secState, setSecState] = useState<SecurityData>(initialSecurity);
  const [activeTab, setActiveTab] = useState<'entry' | 'attendance' | 'visitors'>('entry');

  // Keep state synced with external data updates
  useEffect(() => {
    if (data.security) {
      setSecState(data.security);
    }
  }, [data.security, onUpdateSecurity]);

  // Persist State Helper
  const updateStateAndPersist = (updatedSec: SecurityData) => {
    setSecState(updatedSec);
    dataManager.updateSecurityData(updatedSec);
    if (onUpdateSecurity) onUpdateSecurity(updatedSec);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">Security &amp; Gate Control</h1>
              </div>
              <p className="text-xs text-slate-400">
                Manage Entries, Monitor Attendance, and View Visitor Logs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'entry' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <UserCheck size={20} />
            Entry Control
          </button>
          
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet size={20} />
            Attendance Sheet
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all font-bold text-sm min-w-[120px] ${
              activeTab === 'visitors' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Users size={20} />
            Visitor Log
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {activeTab === 'entry' && (
          <EntryControlPanel secState={secState} onUpdateSecurity={updateStateAndPersist} />
        )}
        
        {activeTab === 'attendance' && (
          <AttendanceSheetPanel secState={secState} />
        )}
        
        {activeTab === 'visitors' && (
          <VisitorLogPanel secState={secState} onUpdateSecurity={updateStateAndPersist} />
        )}
      </div>
    </div>
  );
}
