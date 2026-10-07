import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Calendar, Clock, Trash2, CheckCircle2, AlertTriangle, Info, ShieldAlert, ArrowUpRight, Zap, RefreshCw, HardDrive, Cpu, Activity, SearchCheck, CheckCircle, AlertOctagon } from 'lucide-react';
import dataManager, { SyncMetric } from '../lib/db';
import { validateDataset, runDataAuditAndNotify, ValidationSummary, ValidationIssue } from '../lib/dataValidation';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  read: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [drawerTab, setDrawerTab] = useState<'logs' | 'performance' | 'audit'>('logs');

  // Performance monitor state
  const [lastMetric, setLastMetric] = useState<SyncMetric>(dataManager.getLastSyncMetric());
  const [metricHistory, setMetricHistory] = useState<SyncMetric[]>(dataManager.getSyncHistory());
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  // Data Validation Audit state
  const [auditSummary, setAuditSummary] = useState<ValidationSummary | null>(null);
  const [auditFilter, setAuditFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const handleRunAudit = () => {
    const summary = runDataAuditAndNotify(dataManager.getData(), true);
    setAuditSummary(summary);
  };

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('otec_system_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load system notification logs.', e);
      }
    }
  }, []);

  // Listen for sync metrics and notifications
  useEffect(() => {
    const handleSyncMetric = (e: Event) => {
      const metric = (e as CustomEvent).detail as SyncMetric;
      if (metric) {
        setLastMetric(metric);
        setMetricHistory(dataManager.getSyncHistory());
      }
    };

    window.addEventListener('otec-sync-metric', handleSyncMetric);
    return () => window.removeEventListener('otec-sync-metric', handleSyncMetric);
  }, []);

  // Listen for custom event 'otec-modal-notify'
  useEffect(() => {
    const handleModalNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.message) return;

      const newNotification: NotificationItem = {
        id: 'notify-' + Math.random().toString(36).slice(2, 9),
        title: detail.title || 'System Notification',
        message: detail.message,
        type: detail.type || 'info',
        timestamp: detail.timestamp || new Date().toLocaleString(),
        read: false
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 50); // Limit to last 50
        localStorage.setItem('otec_system_notifications', JSON.stringify(updated));
        return updated;
      });

      // Set active toast modal to show on screen
      setActiveToast(newNotification);
    };

    window.addEventListener('otec-modal-notify', handleModalNotification);
    return () => window.removeEventListener('otec-modal-notify', handleModalNotification);
  }, []);

  // Auto clear active toast
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('otec_system_notifications', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear your notification history logs?')) {
      setNotifications([]);
      localStorage.removeItem('otec_system_notifications');
    }
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('otec_system_notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="text-emerald-500 shrink-0 animate-bounce" size={16} />,
          bg: 'bg-emerald-50 border-emerald-200/60 text-emerald-950',
          badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-amber-500 shrink-0" size={16} />,
          bg: 'bg-amber-50 border-amber-200/60 text-amber-950',
          badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20'
        };
      case 'error':
        return {
          icon: <ShieldAlert className="text-rose-500 shrink-0" size={16} />,
          bg: 'bg-rose-50 border-rose-200/60 text-rose-950',
          badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-blue-500 shrink-0" size={16} />,
          bg: 'bg-slate-50 border-slate-200/60 text-slate-950',
          badge: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
        };
    }
  };
  return (
    <>
      <div className="h-full flex flex-col bg-slate-50 animate-in fade-in duration-300">
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 overflow-hidden flex flex-col">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 shrink-0 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/35 text-blue-400 rounded-xl border border-blue-500/20">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 tracking-tight">System Logs & Performance</h3>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Real-time Diagnostic Center</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-bold w-full sm:w-auto">
              <button
                onClick={() => setDrawerTab('logs')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'logs'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell size={14} />
                <span>Logs ({notifications.length})</span>
              </button>
              <button
                onClick={() => setDrawerTab('performance')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'performance'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap size={14} className="text-amber-400" />
                <span>Sync</span>
              </button>
              <button
                onClick={() => {
                  setDrawerTab('audit');
                  if (!auditSummary) handleRunAudit();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  drawerTab === 'audit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SearchCheck size={14} className="text-emerald-400" />
                <span>Audit</span>
              </button>
            </div>
            
            {drawerTab === 'logs' && (
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1.5 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Clear All logs</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 custom-scrollbar">
                {drawerTab === 'audit' ? (
                  <div className="space-y-4">
                    {/* Data Audit Overview Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-4 text-white shadow-md border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SearchCheck size={16} className="text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Dataset Validation Engine</span>
                        </div>
                        <button
                          onClick={handleRunAudit}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={11} />
                          <span>Re-Audit Now</span>
                        </button>
                      </div>

                      {auditSummary ? (
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50">
                            <div className="text-[10px] text-rose-400 font-bold">Errors</div>
                            <div className="text-base font-black text-rose-400">{auditSummary.errorCount}</div>
                            <div className="text-[8.5px] text-slate-400">Range &lt;0 / &gt;100</div>
                          </div>

                          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50">
                            <div className="text-[10px] text-amber-400 font-bold">Warnings</div>
                            <div className="text-base font-black text-amber-400">{auditSummary.warningCount}</div>
                            <div className="text-[8.5px] text-slate-400">Missing Marks</div>
                          </div>

                          <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/50">
                            <div className="text-[10px] text-blue-400 font-bold">Pending</div>
                            <div className="text-base font-black text-blue-400">{auditSummary.infoCount}</div>
                            <div className="text-[8.5px] text-slate-400">Comments</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-2">Click Re-Audit Now to run validation checks.</p>
                      )}
                    </div>

                    {/* Filter Pills */}
                    {auditSummary && auditSummary.totalIssues > 0 && (
                      <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl text-[10px] font-bold">
                        {(['all', 'error', 'warning', 'info'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setAuditFilter(f)}
                            className={`flex-1 py-1 rounded-lg capitalize transition-all ${
                              auditFilter === f ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {f === 'all' ? `All (${auditSummary.totalIssues})` : f === 'error' ? `Errors (${auditSummary.errorCount})` : f === 'warning' ? `Missing (${auditSummary.warningCount})` : `Comments (${auditSummary.infoCount})`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Issues List */}
                    <div className="space-y-2">
                      {!auditSummary || auditSummary.totalIssues === 0 ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
                          <CheckCircle size={24} className="text-emerald-600 mx-auto" />
                          <h4 className="font-extrabold text-xs text-emerald-900">Dataset 100% Validated</h4>
                          <p className="text-[10.5px] text-emerald-800 leading-relaxed">
                            No invalid marks, range errors, or missing scores were detected across all learners and exam sets.
                          </p>
                        </div>
                      ) : (
                        auditSummary.issues
                          .filter(i => auditFilter === 'all' || i.severity === auditFilter)
                          .map((issue) => (
                            <div
                              key={issue.id}
                              className={`p-3 rounded-xl border text-xs space-y-1 ${
                                issue.severity === 'error'
                                  ? 'bg-rose-50/80 border-rose-200/80 text-rose-950'
                                  : issue.severity === 'warning'
                                    ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                                    : 'bg-blue-50/80 border-blue-200/80 text-blue-950'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span className="flex items-center gap-1.5">
                                  {issue.severity === 'error' ? (
                                    <AlertOctagon size={13} className="text-rose-600 shrink-0" />
                                  ) : issue.severity === 'warning' ? (
                                    <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                                  ) : (
                                    <Info size={13} className="text-blue-600 shrink-0" />
                                  )}
                                  <span>{issue.learnerName} ({issue.cls})</span>
                                </span>
                                <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-white/60 border border-black/5">
                                  {issue.examSetLabel || 'General'}
                                </span>
                              </div>
                              <p className="text-[10.5px] leading-relaxed text-slate-700">
                                {issue.details}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ) : drawerTab === 'performance' ? (
                  <div className="space-y-4">
                    {/* Realtime Performance Monitor Cards */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-4 text-white shadow-md border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-amber-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Sync Engine Performance</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                          lastMetric.status === 'synced'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : lastMetric.status === 'cached'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                          {lastMetric.status === 'synced' ? '🟢 Live Synced' : lastMetric.status === 'cached' ? '⚡ Cached (Unchanged)' : '🔴 Sync Deferred'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={11} className="text-amber-400" /> Cycle Duration
                          </div>
                          <div className="text-lg font-black text-amber-400 mt-0.5">
                            {lastMetric.status === 'cached' ? '0 ms' : `${lastMetric.durationMs} ms`}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {lastMetric.durationMs < 100 ? '⚡ Ultra-fast' : 'Normal network'}
                          </div>
                        </div>

                        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <HardDrive size={11} className="text-blue-400" /> Payload Size
                          </div>
                          <div className="text-lg font-black text-blue-400 mt-0.5">
                            {lastMetric.payloadKb} KB
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Incremental compressed
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Last cycle: {lastMetric.timestamp}
                        </span>
                        <button
                          onClick={async () => {
                            setIsSyncingNow(true);
                            await dataManager.forceSync();
                            setIsSyncingNow(false);
                          }}
                          disabled={isSyncingNow}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw size={11} className={isSyncingNow ? 'animate-spin' : ''} />
                          <span>Test Sync Now</span>
                        </button>
                      </div>
                    </div>

                    {/* Sync Optimization Rules Box */}
                    <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3 text-[11px] text-blue-900 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5 text-blue-950">
                        <Zap size={13} className="text-amber-500 fill-amber-500" />
                        <span>Smart Incremental Sync Active</span>
                      </div>
                      <p className="text-blue-800/90 leading-relaxed text-[10.5px]">
                        The database checks for changes before syncing. Network requests trigger <strong>only when new data is entered in the browser</strong> to save bandwidth and maximize response time.
                      </p>
                    </div>

                    {/* Sync Metrics Execution History */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Sync Cycle Execution Log</span>
                        <span>{metricHistory.length} Cycles</span>
                      </div>

                      {metricHistory.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic text-center py-4">No sync metrics logged yet.</p>
                      ) : (
                        metricHistory.map((m, idx) => (
                          <div key={m.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-800 flex items-center gap-1 text-[11px]">
                                {m.status === 'cached' ? (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                )}
                                {m.trigger === 'manual_force' ? 'Manual Sync Test' : m.trigger === 'startup' ? 'Startup Initialization' : 'Browser Data Update'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500">{m.timestamp}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-0.5">
                              <span>Duration: <strong className="text-amber-600">{m.durationMs}ms</strong></span>
                              <span>Payload: <strong className="text-blue-600">{m.payloadKb} KB</strong></span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                m.status === 'synced' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {m.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center">
                      <Bell size={18} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-700">No Operations Recorded Yet</h4>
                      <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed mt-1">
                        Any student additions, marks updates, and excel imports will be logged here with timestamps.
                      </p>
                    </div>
                  </div>
                ) : (
                  notifications.map(n => {
                    const styles = getTypeStyles(n.type);
                    return (
                      <div
                        key={n.id}
                        className={`p-3.5 border rounded-2xl shadow-xs transition-all flex gap-3 relative overflow-hidden group ${styles.bg}`}
                      >
                        <div className="mt-0.5">{styles.icon}</div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-xs text-slate-950 pr-2 leading-tight">
                              {n.title}
                            </span>
                            <button
                              onClick={(e) => deleteNotification(n.id, e)}
                              className="text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Delete log"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700 leading-relaxed pr-3">
                            {n.message}
                          </p>

                          {/* Time and Date Badge */}
                          <div className="flex items-center gap-3.5 pt-1 text-[9px] text-slate-500 font-bold">
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar size={10} className="text-slate-400" />
                              <span>{n.timestamp.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center gap-1 font-medium">
                              <Clock size={10} className="text-slate-400" />
                              <span>{n.timestamp.split(',')[1] || n.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

        </div>
      </div>

      {/* Floating Micro-Modal Toast Notification Panel (Triggers immediately on update) */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className={`fixed bottom-6 right-20 z-[99999] max-w-sm w-[340px] p-4 rounded-2xl shadow-2xl border flex gap-3 cursor-pointer select-text overflow-hidden ${
              getTypeStyles(activeToast.type).bg
            }`}
            onClick={() => {
              setIsDrawerOpen(true);
              setActiveToast(null);
            }}
          >
            {/* Ambient sliding accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-right from-blue-500 to-indigo-500 animate-pulse" />

            <div className="mt-0.5 shrink-0">{getTypeStyles(activeToast.type).icon}</div>
            <div className="space-y-1.5 flex-1 pr-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 leading-none">
                  {activeToast.title}
                </span>
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  NEW UPDATE
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-700 leading-relaxed">
                {activeToast.message}
              </p>
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-400">
                <Clock size={9} />
                <span>{activeToast.timestamp}</span>
                <span className="text-indigo-600 font-extrabold hover:underline flex items-center ml-auto">
                  Sync Log <ArrowUpRight size={10} />
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveToast(null);
              }}
              className="text-slate-400 hover:text-slate-600 shrink-0 font-bold self-start mt-0.5"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
