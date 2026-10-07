import React, { useState } from 'react';
import { SyncSummaryResult, SyncRecordDetail } from '../lib/dataSyncMerge';
import { 
  CheckCircle2, 
  X, 
  Users, 
  Award, 
  CircleDollarSign, 
  Database, 
  Search, 
  Filter, 
  ArrowRight, 
  Cloud,
  FileSpreadsheet,
  Calendar,
  Sparkles
} from 'lucide-react';

interface DriveSyncSummaryModalProps {
  summary: SyncSummaryResult;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DriveSyncSummaryModal({ summary, onConfirm, onClose }: DriveSyncSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'learner' | 'score' | 'finance'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDetails = summary.recordDetails.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in print:hidden">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl text-cyan-300">
              <Cloud size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                  Google Drive Cloud Sync
                </span>
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                  <Calendar size={12} /> {summary.syncedAt}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Data Auto-Sync & Update Summary</h2>
            </div>
          </div>
          <p className="text-xs text-slate-200 font-medium">
            Source: <span className="font-extrabold text-white">{summary.sourceName || 'Google Drive File'}</span>. Below are the specific records merged and updated into your local database.
          </p>
        </div>

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50/80 border-b border-slate-100">
          
          {/* Learners Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Learners</span>
              <Users size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">
                {summary.learnersAddedCount + summary.learnersUpdatedCount}
              </span>
              <span className="text-[10px] font-bold text-slate-500">records</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 flex gap-1.5">
              <span className="text-emerald-600 font-extrabold">+{summary.learnersAddedCount} New</span>
              <span>•</span>
              <span className="text-blue-600 font-extrabold">{summary.learnersUpdatedCount} Updated</span>
            </div>
          </div>

          {/* Academic Scores Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-purple-600">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Academic Marks</span>
              <Award size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">
                {summary.scoresAddedCount + summary.scoresUpdatedCount}
              </span>
              <span className="text-[10px] font-bold text-slate-500">scores</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 flex gap-1.5">
              <span className="text-emerald-600 font-extrabold">+{summary.scoresAddedCount} New</span>
              <span>•</span>
              <span className="text-blue-600 font-extrabold">{summary.scoresUpdatedCount} Updated</span>
            </div>
          </div>

          {/* Financial Transactions Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Finance & Fees</span>
              <CircleDollarSign size={16} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900">
                {summary.financeAddedCount + summary.financeUpdatedCount}
              </span>
              <span className="text-[10px] font-bold text-slate-500">entries</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 flex gap-1.5">
              <span className="text-emerald-600 font-extrabold">+{summary.financeAddedCount} New</span>
              <span>•</span>
              <span className="text-blue-600 font-extrabold">{summary.financeUpdatedCount} Updated</span>
            </div>
          </div>

          {/* Total Changes Card */}
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-200">Total Synced</span>
              <Sparkles size={16} />
            </div>
            <div className="text-xl font-black">
              {summary.totalAddedCount + summary.totalUpdatedCount + summary.otherRecordsCount}
            </div>
            <p className="text-[10px] text-emerald-100 font-semibold">
              {summary.hasChanges ? 'Database updated' : 'Up to date'}
            </p>
          </div>

        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({summary.recordDetails.length})
            </button>
            <button
              onClick={() => setActiveTab('learner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'learner' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Learners ({summary.learnersAddedCount + summary.learnersUpdatedCount})
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'score' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scores ({summary.scoresAddedCount + summary.scoresUpdatedCount})
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'finance' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Finances ({summary.financeAddedCount + summary.financeUpdatedCount})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search updated records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Record Change Log List */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-2.5 max-h-[360px] bg-slate-50/50">
          {filteredDetails.length > 0 ? (
            filteredDetails.map((item) => (
              <div 
                key={item.id}
                className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.type === 'added' ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] uppercase tracking-wider rounded-md border border-emerald-200">
                        + Added
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold text-[9px] uppercase tracking-wider rounded-md border border-blue-200">
                        ✎ Updated
                      </span>
                    )}

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.details}</p>
                </div>

                {/* Show values comparison if updated */}
                {item.type === 'updated' && (item.previousValue || item.newValue) && (
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-mono self-start sm:self-center shrink-0">
                    <span className="text-rose-600 line-through font-bold">{item.previousValue}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-emerald-600 font-black">{item.newValue}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-2 bg-white rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h4 className="text-sm font-black text-slate-800">
                {summary.hasChanges ? 'No records match search filter' : 'System is already 100% up to date'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {summary.hasChanges 
                  ? 'Try clearing search input or switching tab filter above.'
                  : 'No differences were found between your local database and the Google Drive cloud file.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            Confirm & Save Merged Records
          </button>
        </div>

      </div>
    </div>
  );
}
