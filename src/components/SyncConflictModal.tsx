import { useAppStore } from "../store/useAppStore";
import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import dataManager from '../lib/db';
import { mergeDriveDataWithSummary, SyncSummaryResult } from '../lib/dataSyncMerge';
import { 
  AlertTriangle, 
  GitCompare, 
  HardDrive, 
  Cloud, 
  Check, 
  Users, 
  FileSpreadsheet, 
  DollarSign, 
  Sparkles, 
  X, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';

export interface SyncConflictEventDetail {
  localData: AppData;
  incomingData: AppData;
  sourceName?: string;
  timestamp?: string;
}

export default function SyncConflictModal() {
  const data = useAppStore(state => state.data)!;
  const [isOpen, setIsOpen] = useState(false);
  const [conflictData, setConflictData] = useState<SyncConflictEventDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'sideBySide' | 'detailedDiff'>('sideBySide');

  useEffect(() => {
    const handleSyncConflict = (e: Event) => {
      const detail = (e as CustomEvent).detail as SyncConflictEventDetail;
      if (detail && detail.localData && detail.incomingData) {
        setConflictData(detail);
        setIsOpen(true);
      }
    };

    window.addEventListener('otec-sync-conflict', handleSyncConflict);
    return () => {
      window.removeEventListener('otec-sync-conflict', handleSyncConflict);
    };
  }, []);

  if (!isOpen || !conflictData) return null;

  const { localData, incomingData, sourceName = 'Secondary Browser / Cloud', timestamp } = conflictData;

  // Compute smart merge diff summary
  const summary: SyncSummaryResult = mergeDriveDataWithSummary(
    localData, 
    incomingData, 
    sourceName
  );

  const handleResolveLocal = () => {
    dataManager.resolveConflict('local', localData);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Conflict Resolved: Local session data preserved and broadcast to cloud.',
        type: 'success'
      }
    }));
  };

  const handleResolveCloud = () => {
    dataManager.resolveConflict('incoming', incomingData);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Conflict Resolved: Remote cloud database version applied to local session.',
        type: 'info'
      }
    }));
  };

  const handleResolveSmartMerge = () => {
    dataManager.resolveConflict('merge', summary.mergedData);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Conflict Resolved: Smart merge applied! ${summary.totalAddedCount} records added & ${summary.totalUpdatedCount} records updated seamlessly.`,
        type: 'success'
      }
    }));
  };

  const localLearnersCount = localData.learners?.length || 0;
  const localScoresCount = Object.keys(localData.scores || {}).length;
  const localFinancesCount = localData.finances?.length || 0;

  const incomingLearnersCount = incomingData.learners?.length || 0;
  const incomingScoresCount = Object.keys(incomingData.scores || {}).length;
  const incomingFinancesCount = incomingData.finances?.length || 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200/80 overflow-hidden text-slate-900 my-auto flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 shrink-0 relative">
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-amber-200 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            title="Dismiss conflict prompt"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-white shrink-0 animate-bounce">
              <ShieldAlert size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black/30 text-amber-100 text-[10px] font-black uppercase rounded-md tracking-wider border border-white/10">
                  Multi-Browser Concurrency Conflict
                </span>
                {timestamp && (
                  <span className="text-xs text-amber-100/90 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {timestamp}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Choose Data to Preserve: Local vs. Cloud
              </h2>
              <p className="text-xs text-amber-100/90 font-medium mt-1 max-w-2xl">
                Simultaneous edits were detected from <strong>{sourceName}</strong> while active changes existed in this window. Select which version to keep, or perform a smart merge.
              </p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-2 mt-5 bg-black/20 p-1 rounded-xl w-fit border border-white/15 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('sideBySide')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sideBySide' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <GitCompare size={14} />
              <span>Side-by-Side Comparison</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detailedDiff')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'detailedDiff' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Record Difference Breakdown ({summary.recordDetails.length})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'sideBySide' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LOCAL SESSION CARD */}
              <div className="bg-indigo-50/40 border-2 border-indigo-500/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">
                  Active Local Session
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md">
                      <HardDrive size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-indigo-950">This Browser Window</h3>
                      <p className="text-xs text-indigo-700 font-medium">Unsaved or active in-memory changes</p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-white/80 border border-indigo-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <Users size={14} className="mx-auto text-indigo-600" />
                      <span className="text-base font-black text-indigo-950 block">{localLearnersCount}</span>
                      <span className="text-[10px] font-bold text-indigo-700/80 uppercase tracking-tight block">Students</span>
                    </div>

                    <div className="bg-white/80 border border-indigo-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <FileSpreadsheet size={14} className="mx-auto text-indigo-600" />
                      <span className="text-base font-black text-indigo-950 block">{localScoresCount}</span>
                      <span className="text-[10px] font-bold text-indigo-700/80 uppercase tracking-tight block">Scores Sets</span>
                    </div>

                    <div className="bg-white/80 border border-indigo-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <DollarSign size={14} className="mx-auto text-indigo-600" />
                      <span className="text-base font-black text-indigo-950 block">{localFinancesCount}</span>
                      <span className="text-[10px] font-bold text-indigo-700/80 uppercase tracking-tight block">Tx Ledger</span>
                    </div>
                  </div>

                  {/* Settings & Info */}
                  <div className="bg-white/90 border border-indigo-200/60 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">School Name:</span>
                      <span className="font-bold text-indigo-900">{localData.settings?.schoolName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">Active Term & Year:</span>
                      <span className="font-bold text-indigo-900">Term {localData.settings?.term} ({localData.settings?.year})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">Status:</span>
                      <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md text-[10px] uppercase">
                        Unsynced Edits
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResolveLocal}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check size={16} />
                  <span>Preserve Local Session Data</span>
                </button>
              </div>

              {/* CLOUD / REMOTE SESSION CARD */}
              <div className="bg-emerald-50/40 border-2 border-emerald-500/80 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">
                  Remote Cloud / Browser
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pt-2">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
                      <Cloud size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-emerald-950">Remote / Cloud Database</h3>
                      <p className="text-xs text-emerald-700 font-medium">Source: {sourceName}</p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-white/80 border border-emerald-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <Users size={14} className="mx-auto text-emerald-600" />
                      <span className="text-base font-black text-emerald-950 block">{incomingLearnersCount}</span>
                      <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-tight block">Students</span>
                    </div>

                    <div className="bg-white/80 border border-emerald-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <FileSpreadsheet size={14} className="mx-auto text-emerald-600" />
                      <span className="text-base font-black text-emerald-950 block">{incomingScoresCount}</span>
                      <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-tight block">Scores Sets</span>
                    </div>

                    <div className="bg-white/80 border border-emerald-200/80 p-3 rounded-2xl text-center space-y-0.5">
                      <DollarSign size={14} className="mx-auto text-emerald-600" />
                      <span className="text-base font-black text-emerald-950 block">{incomingFinancesCount}</span>
                      <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-tight block">Tx Ledger</span>
                    </div>
                  </div>

                  {/* Settings & Info */}
                  <div className="bg-white/90 border border-emerald-200/60 p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">School Name:</span>
                      <span className="font-bold text-emerald-900">{incomingData.settings?.schoolName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">Active Term & Year:</span>
                      <span className="font-bold text-emerald-900">Term {incomingData.settings?.term} ({incomingData.settings?.year})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold text-slate-500">Status:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[10px] uppercase">
                        Incoming Cloud State
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResolveCloud}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Check size={16} />
                  <span>Preserve Cloud / Remote Data</span>
                </button>
              </div>

            </div>
          ) : (
            /* DETAILED RECORD DIFFERENCE BREAKDOWN */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-amber-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Record Conflict Matrix Summary</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Comparing differences between active local session and {sourceName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                    +{summary.totalAddedCount} New Records
                  </span>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    {summary.totalUpdatedCount} Updated Records
                  </span>
                </div>
              </div>

              {summary.recordDetails.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs font-medium bg-slate-50 rounded-2xl border border-slate-200/60">
                  No explicit individual record conflicts found. Settings or activity logs differ slightly.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {summary.recordDetails.map(item => (
                    <div 
                      key={item.id} 
                      className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            item.category === 'learner' ? 'bg-indigo-100 text-indigo-800' :
                            item.category === 'score' ? 'bg-emerald-100 text-emerald-800' :
                            item.category === 'finance' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {item.category}
                          </span>
                          <span className="font-bold text-slate-900">{item.title}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] font-medium">{item.details}</p>
                      </div>

                      {item.previousValue && item.newValue && (
                        <div className="text-right shrink-0 text-[11px] font-mono">
                          <span className="text-rose-600 line-through mr-1.5">{item.previousValue}</span>
                          <span className="text-emerald-700 font-bold">{item.newValue}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar with Smart Merge Action */}
        <div className="p-6 bg-slate-50 border-t border-slate-200/80 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Sparkles size={16} className="text-amber-500 shrink-0 animate-spin" />
            <span>Smart Merge combines both datasets so no student records or grades are lost.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel / Decide Later
            </button>
            <button
              type="button"
              onClick={handleResolveSmartMerge}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles size={14} />
              <span>Smart Merge Both Datasets</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
