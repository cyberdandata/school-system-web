import { useAppStore } from "../store/useAppStore";
import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import dataManager, { activeUser, syncStatus } from '../lib/db';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthModal from './AuthModal';
import { motion } from 'motion/react';
import { 
  LayoutDashboard,
  Home, 
  Users, 
  FileSpreadsheet, 
  GraduationCap, 
  Settings as SettingsIcon, 
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Calendar,
  Wallet,
  ShieldCheck,
  Truck,
  BookOpen,
  Archive,
  BedDouble,
  CalendarClock,
  Stethoscope,
  Scale,
  Trophy,
  UserSquare2,
  Briefcase,
  BarChart3,
  Menu,
  ChevronLeft,
  UserPlus,
  ShoppingCart,
  MessageSquare,
  Bot,
  Bell,
  WifiOff,
  LogIn,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  syncState: typeof syncStatus;
  user: typeof activeUser;
  localUser: any;
}

export default function Sidebar({ currentRoute, setCurrentRoute, syncState, user, localUser }: SidebarProps) {
  const data = useAppStore(state => state.data)!;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTick, setLastSyncTick] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workOffline, setWorkOffline] = useState(() => {
    return localStorage.getItem('otec_work_offline') === 'true' || !dataManager.isSyncEnabled();
  });
  const [isBackupStale, setIsBackupStale] = useState(false);

  useEffect(() => {
    const checkStaleSnapshot = () => {
      try {
        const raw = localStorage.getItem('otec_daily_cloud_snapshots');
        let lastSyncMs = 0;
        if (raw) {
          const snaps = JSON.parse(raw);
          if (Array.isArray(snaps) && snaps.length > 0) {
            const newestUploaded = snaps.find((s: any) => s.uploadedToGDrive);
            const newestSnap = snaps[0];
            if (newestUploaded && newestUploaded.timestamp) {
              lastSyncMs = new Date(newestUploaded.timestamp).getTime();
            } else if (newestSnap && newestSnap.timestamp) {
              lastSyncMs = new Date(newestSnap.timestamp).getTime();
            }
          }
        }

        if (!lastSyncMs) {
          const savedDateStr = localStorage.getItem('otec_last_daily_cloud_snapshot_date');
          if (savedDateStr) {
            lastSyncMs = new Date(savedDateStr).getTime();
          }
        }

        if (!lastSyncMs) {
          setIsBackupStale(true);
        } else {
          const diffMs = Date.now() - lastSyncMs;
          setIsBackupStale(diffMs >= 48 * 60 * 60 * 1000);
        }
      } catch (e) {
        setIsBackupStale(false);
      }
    };

    checkStaleSnapshot();
    const interval = setInterval(checkStaleSnapshot, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Interval to refresh the human readable last sync text e.g. "5s ago"
    const timer = setInterval(() => {
      setLastSyncTick(t => t + 1);
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  const handleToggleWorkOffline = (offline: boolean) => {
    setWorkOffline(offline);
    localStorage.setItem('otec_work_offline', offline ? 'true' : 'false');
    dataManager.setSyncEnabled(!offline);

    if (offline) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Work Offline mode active. Cloud auto-sync is suspended and all edits are stored locally.',
          type: 'info'
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Work Offline disabled. Restoring cloud connectivity and syncing changes...',
          type: 'success'
        }
      }));
      handleManualSync();
    }
  };

  const handleManualSync = async () => {
    if (workOffline) {
      setWorkOffline(false);
      localStorage.setItem('otec_work_offline', 'false');
      dataManager.setSyncEnabled(true);
    } else if (!dataManager.isSyncEnabled()) {
      dataManager.setSyncEnabled(true);
    }

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Syncing local database with cloud storage...',
        type: 'info'
      }
    }));

    try {
      await dataManager.forceSync();
      setLastSyncTick(t => t + 1);
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Manual sync completed successfully!',
          type: 'success'
        }
      }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Sync failed: ' + (err?.message || 'Check network connection'),
          type: 'warning'
        }
      }));
    }
  };

  const lastSync = dataManager.getLastSyncedTime();
  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    try {
      const date = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 10000) return 'Just now';
      if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Never';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, roles: ['superuser', 'teacher', 'accountant', 'security'] },
    { id: 'analytics', label: "Principal's Analytics", icon: BarChart3, roles: ['superuser'] },
    { id: 'student-360', label: 'Student 360° Profile', icon: UserSquare2, roles: ['superuser', 'teacher', 'accountant'] },
    { id: 'staff-360', label: 'Staff 360° Profile', icon: Briefcase, roles: ['superuser'] },
    { id: 'hr', label: 'HR & Payroll', icon: Users, roles: ['superuser', 'accountant'] },
    { id: 'admissions', label: 'Admissions & Enrollment', icon: UserPlus, roles: ['superuser', 'accountant'] },
    { id: 'learners', label: 'Student Directory', icon: Users, roles: ['superuser', 'teacher', 'accountant'] },
    { id: 'scores', label: 'Enter Scores', icon: FileSpreadsheet, roles: ['superuser', 'teacher'] },
    { id: 'reports', label: 'Report Cards', icon: GraduationCap, roles: ['superuser', 'teacher'] },
    { id: 'finance', label: 'School Finances', icon: Wallet, roles: ['superuser', 'accountant'] },
    { id: 'security', label: 'Security & Gate', icon: ShieldCheck, roles: ['superuser', 'security'] },
    { id: 'transport', label: 'Transport & Fleet', icon: Truck, roles: ['superuser', 'accountant', 'security'] },
    { id: 'library', label: 'Library', icon: BookOpen, roles: ['superuser', 'teacher'] },
    { id: 'inventory', label: 'Asset Inventory', icon: Archive, roles: ['superuser', 'accountant'] },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart, roles: ['superuser', 'accountant'] },
    { id: 'hostel', label: 'Hostels & Dorms', icon: BedDouble, roles: ['superuser', 'teacher'] },
    { id: 'clinic', label: 'School Clinic', icon: Stethoscope, roles: ['superuser', 'teacher'] },
    { id: 'discipline', label: 'Discipline', icon: Scale, roles: ['superuser', 'teacher', 'security'] },
    { id: 'extracurricular', label: 'Extracurriculars', icon: Trophy, roles: ['superuser', 'teacher'] },
    { id: 'timetable', label: 'Class Timetable', icon: CalendarClock, roles: ['superuser', 'teacher'] },
    { id: 'teacher-attendance', label: 'Staff Attendance', icon: Users, roles: ['superuser', 'security', 'teacher'] },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, roles: ['superuser', 'teacher', 'accountant', 'security'] },
    { id: 'data', label: 'Import / Export', icon: Database, roles: ['superuser'] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: ['superuser'] },
    { id: 'communications', label: 'Communications', icon: MessageSquare, roles: ['superuser', 'teacher', 'accountant'] },
    { id: 'ai-consultant', label: 'AI Consultant', icon: Bot, roles: ['superuser', 'accountant', 'teacher'] },
    { id: 'notifications', label: 'System Logs', icon: Bell, roles: ['superuser'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert, roles: ['superuser'] },
  ].filter(item => {
    if (!localUser) return true; // fallback if no RBAC enforced
    return item.roles.includes(localUser.role);
  });

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to log out the school? This will clear the local cache to allow another school to log in.')) {
      await signOut(auth);
      localStorage.removeItem('otec_manually_signed_out');
      localStorage.removeItem('otec_offline_only_mode');
      
      // Clear IndexedDB completely
      const req = indexedDB.deleteDatabase('OtecAppDB');
      req.onsuccess = () => {
        window.location.reload();
      };
      req.onerror = () => {
        window.location.reload();
      };
    }
  };

  // Status indicator config
  const getStatusConfig = () => {
    if (workOffline) {
      return { 
        icon: WifiOff, 
        text: 'Work Offline (Forced)', 
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
      };
    }
    switch (syncState) {
      case 'synced':
        return { 
          icon: Cloud, 
          text: 'Cloud Active', 
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
        };
      case 'syncing':
        return { 
          icon: RefreshCw, 
          text: 'Syncing...', 
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
        };
      case 'error':
        return { 
          icon: CloudOff, 
          text: 'Sync Error', 
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
        };
      case 'offline':
      default:
        return { 
          icon: CloudOff, 
          text: 'Offline Mode', 
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <div className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-screen sticky top-0 shrink-0 select-none transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0 overflow-hidden">
                {data.settings.logo ? (
                  <img src={data.settings.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  (data.settings.shortName || 'OT').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="truncate">
                <h1 className="font-bold text-sm tracking-tight text-white truncate">
                  {data.settings.schoolName || 'OTEC'}
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5 truncate">
                  Uganda Report Cards
                </p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
            title={isCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Current Context */}
        {!isCollapsed && (
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[9px] text-slate-300">{data.settings.term}</span>
            <span className="font-mono text-slate-500">{data.settings.year}</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentRoute(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-tight transition-all duration-150 outline-hidden ${
                  isActive
                    ? 'text-blue-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-600/15 rounded-xl border border-blue-500/20 shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className={`relative z-10 flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                  <span className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'} title={isCollapsed ? item.label : ''} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </span>
                  {!isCollapsed && item.id === 'data' && isBackupStale && (
                    <span 
                      className="px-1.5 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase rounded-full animate-pulse shadow-xs shadow-rose-600/50 flex items-center gap-0.5"
                      title="Cloud Snapshot sync overdue (>48 hours)"
                    >
                      <AlertTriangle size={10} />
                      <span>!</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Cloud Sync Status Card */}
        <div className="p-4 mt-auto">
          {user ? (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full bg-slate-800 p-2 rounded-xl mb-3`}>
              {!isCollapsed && (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                    {localUser ? localUser.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'S')}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{localUser ? localUser.name : (user.email || 'School')}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">{localUser ? localUser.role : 'Admin'}</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mb-3 ${isCollapsed ? 'px-0' : ''}`}
              title={isCollapsed ? 'Sign In' : ''}
            >
              <LogIn size={16} />
              {!isCollapsed && <span>Sign In to Cloud</span>}
            </button>
          )}

          {!isCollapsed && (
            <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl text-xs space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sync Engine</span>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${workOffline ? 'bg-amber-500/10 text-amber-400' : isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {workOffline ? 'Forced Local' : isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          {isCollapsed ? '' : (workOffline ? 'Work Offline Mode Active' : 'Offline Storage Active')}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

