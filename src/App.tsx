import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import dataManager from './lib/db';
import { AppData, Learner, ScoreRecord, PsychomotorRecord, CommentRecord, SchoolSettings } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Learners from './components/Learners';
import Scores from './components/Scores';
import ReportCard from './components/ReportCard';
import ImportExport from './components/ImportExport';
import Settings from './components/Settings';
import AcademicCalendar from './components/AcademicCalendar';
import BackupManager from './components/BackupManager';
import AIChatbot from './components/AIChatbot';
import NotificationCenter from './components/NotificationCenter';
import FinanceManager from './components/FinanceManager';
import SecurityManager from './components/SecurityManager';
import TransportManager from './components/TransportManager';
import LibraryManager from './components/LibraryManager';
import InventoryManager from './components/InventoryManager';
import HostelManager from './components/HostelManager';
import TimetableManager from './components/TimetableManager';
import ClinicManager from './components/ClinicManager';
import DisciplineManager from './components/DisciplineManager';
import ExtracurricularManager from './components/ExtracurricularManager';
import TeacherAttendance from './components/TeacherAttendance';
import Student360 from './components/Student360';
import Staff360 from './components/Staff360';
import HRManager from './components/HRManager';
import AdmissionsManager from './components/AdmissionsManager';
import ProcurementManager from './components/ProcurementManager';
import CommunicationsEngine from './components/CommunicationsEngine';
import ParentPortal from './components/ParentPortal';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import OnboardingTour from './components/OnboardingTour';
import SyncConflictModal from './components/SyncConflictModal';
import AuthModal from './components/AuthModal';
import TenantAuthModal from './components/TenantAuthModal';
import AuditLogViewer from './components/AuditLogViewer';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, X, Sparkles, HelpCircle, Save, Printer, ArrowRight, Menu, LogOut } from 'lucide-react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const { data, isDbReady, syncState, activeUser, localUser, setData, setIsDbReady, setSyncState, setActiveUser, setLocalUser } = useAppStore();
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showOnboardingTour, setShowOnboardingTour] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'info' | 'warning' | 'error' }>>([]);
  const [cachedLogo, setCachedLogo] = useState<string | null>(null);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to log out the school? This will clear the local cache.')) {
      await signOut(auth);
      localStorage.removeItem('otec_manually_signed_out');
      localStorage.removeItem('otec_offline_only_mode');
      
      const req = indexedDB.deleteDatabase('OtecAppDB');
      req.onsuccess = () => window.location.reload();
      req.onerror = () => window.location.reload();
    }
  };

  useEffect(() => {
    if (isDbReady && data && data.learners) {
      const hasBadLearners = data.learners.some(l => l.admNo && l.admNo.toLowerCase().startsWith('adm'));
      if (hasBadLearners) {
        console.log('Cleaning up test learners with admNo starting with adm...');
        const newLearners = data.learners.filter(l => !(l.admNo && l.admNo.toLowerCase().startsWith('adm')));
        const newData = { ...data, learners: newLearners };
        setData(newData);
        dataManager.setData(newData);
        setToasts(prev => [...prev, { id: Date.now().toString(), message: 'Removed test learners (adm)', type: 'info' }]);
      }
    }
  }, [isDbReady, data, setData]);

  useEffect(() => {
    // Attempt to quickly read the logo from IndexedDB before full init
    try {
      const request = indexedDB.open('OtecAppDB', 1);
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('otec_store')) return;
        
        const tx = db.transaction('otec_store', 'readonly');
        const store = tx.objectStore('otec_store');
        const getReq = store.get('app_data');
        
        getReq.onsuccess = () => {
          if (getReq.result && getReq.result.settings && getReq.result.settings.logo) {
            setCachedLogo(getReq.result.settings.logo);
          }
        };
      };
    } catch (err) {
      // Ignore initial DB errors
    }
  }, []);

  useEffect(() => {
    // Initialize IndexedDB
    dataManager.initDB().then((initialData) => {
      // Auto-import external data just once
      if (!localStorage.getItem('otec_db_imported_v7')) {
        console.log('Injecting extracted data from extracted_updates.json...');
        
        // Fetch the updates payload
        fetch('/extracted_updates.json')
          .then(res => res.json())
          .then(updates => {
            const mergedData = { ...initialData };
            
            // Merge finances (filter out old System Imports to prevent duplicates)
            const oldFinances = (mergedData.finances || []).filter(f => f.recordedBy !== 'System Import');
            const newFinances = (updates.finances || []).map((f: any) => {
               // Try to find the student ID for fees
               if (f.studentNameMatch && mergedData.learners) {
                 const student = mergedData.learners.find(l => 
                   l.name.toLowerCase() === f.studentNameMatch.toLowerCase() || 
                   l.name.toLowerCase().includes(f.studentNameMatch.split(' ').pop()?.toLowerCase() || '')
                 );
                 if (student) f.studentId = student.id;
                 delete f.studentNameMatch;
               }
               return f;
            });
            mergedData.finances = [...oldFinances, ...newFinances];
            
            // Merge staff
            if (!mergedData.settings) mergedData.settings = {} as any;
            const oldTeachers = (mergedData.settings.teachersList || []).filter((t: any) => !t.id.startsWith('tchr-'));
            const newTeachers = ((updates as any).teachersList || []);
            mergedData.settings.teachersList = [...oldTeachers, ...newTeachers];
            
            const oldNTS = (mergedData.settings.nonTeachingStaffList || []).filter((t: any) => !t.id.startsWith('ntsf-'));
            const newNTS = ((updates as any).nonTeachingStaffList || []);
            mergedData.settings.nonTeachingStaffList = [...oldNTS, ...newNTS];
            
            // Update or Add learners based on updates
            if (updates.learnerUpdates && mergedData.learners) {
              const newLearners: any[] = [];
              updates.learnerUpdates.forEach((u: any) => {
                let found = false;
                mergedData.learners = mergedData.learners.map(l => {
                  const matchFull = l.name.toLowerCase() === u.fullName.toLowerCase();
                  const matchLast = u.lastName && u.lastName.trim() !== '' ? l.name.toLowerCase().includes(u.lastName.toLowerCase()) : false;
                  const matchFirst = u.firstName && u.firstName.trim() !== '' ? l.name.toLowerCase().includes(u.firstName.toLowerCase()) : false;
                  const isMatch = matchFull || (matchFirst && matchLast);
                  
                  if (isMatch) {
                    found = true;
                    if (u.outstandingBalance) {
                      return { ...l, outstandingBalance: u.outstandingBalance };
                    }
                  }
                  return l;
                });
                
                if (!found) {
                  // Add missing learner
                  newLearners.push({
                    id: 'L-' + Math.random().toString(36).substr(2, 9),
                    name: u.fullName,
                    admNo: 'ADM-' + Math.floor(1000 + Math.random() * 9000),
                    sex: 'Male', // Default, would need manual update
                    age: '12',
                    cls: 'P.4', // Default class
                    outstandingBalance: u.outstandingBalance || '0'
                  });
                }
              });
              mergedData.learners = [...mergedData.learners, ...newLearners];
            }
            
            dataManager.setData(mergedData);
            setData(mergedData);
            localStorage.setItem('otec_db_imported_v7', 'true');
            
            const summaryParts = [];
            if (newFinances.length > 0) summaryParts.push(`${newFinances.length} financial records`);
            if (newTeachers.length > 0) summaryParts.push(`${newTeachers.length} teachers`);
            if (newNTS.length > 0) summaryParts.push(`${newNTS.length} non-teaching staff`);
            if (updates.learnerUpdates) summaryParts.push(`${updates.learnerUpdates.length} student updates`);
            
            const summaryStr = summaryParts.length > 0 ? summaryParts.join(', ') : 'no new records';
            
            alert(`System Sync Complete!\n\nYour data has been successfully updated from the Excel extracts.\nSummary of additions:\n- ${summaryStr}`);
            
            addToast('External Excel data has been successfully merged into the system!', 'success');
          })
          .catch(err => console.error("Failed to load updates:", err));
      } else {
        setData(initialData);
      }
      
      setIsDbReady(true);
      
      const onboardingCompleted = localStorage.getItem('otec_onboarding_completed');
      if (onboardingCompleted !== 'true') {
        setShowOnboardingTour(true);
      }
      // Perform synchronization once when the page opens
      dataManager.syncWithCloud(true, 'page_open');
    });
  }, []);

  const currentRouteRef = React.useRef(currentRoute);
  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // React to reactive state updates from db synchronization engine
  useEffect(() => {
    const unsubscribe = dataManager.subscribe(() => {
      const freshData = dataManager.getData();
      setData({ ...freshData });
      setSyncState(dataManager.getSyncStatus());
      setActiveUser(dataManager.getActiveUser());
      setLocalUser(dataManager.getLocalActiveUser());
      
      // Update app title dynamically based on settings
      if (freshData.settings?.schoolName) {
        document.title = freshData.settings.schoolName;
      } else {
        document.title = "School Management System";
      }
    });
    return unsubscribe;
  }, []);

  // Listen to custom window otec-toast and route change events
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.message) {
        addToast(detail.message, detail.type || 'info');
      }
    };
    const handleBeforeUnload = () => {
      const currentData = dataManager.getData();
      try {
        localStorage.setItem('otec_fallback_backup', JSON.stringify(currentData));
      } catch (e) { }
      dataManager.syncWithCloud(true, 'app_close');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    const handleRouteChange = (e: Event) => {
      const targetRoute = (e as CustomEvent).detail;
      if (targetRoute) {
        setCurrentRoute(targetRoute);
      }
    };
    window.addEventListener('otec-toast', handleCustomToast);
    window.addEventListener('otec-route-change', handleRouteChange);
    return () => {
      window.removeEventListener('otec-toast', handleCustomToast);
      window.removeEventListener('otec-route-change', handleRouteChange);
    };
  }, []);

  // Sync state observer toast trigger
  const lastSyncState = React.useRef(syncState);
  useEffect(() => {
    if (syncState !== lastSyncState.current) {
      if (syncState === 'syncing') {
        addToast('Cloud Sync: Synchronizing with secure storage...', 'info');
      } else if (syncState === 'synced') {
        addToast('Cloud Sync: Database successfully updated in cloud!', 'success');
      } else if (syncState === 'error') {
        addToast('Cloud Sync: Database save failed. Operating on local cache.', 'warning');
      } else if (syncState === 'offline') {
        addToast('Cloud Sync: Working offline (local persistence active).', 'info');
      }
      lastSyncState.current = syncState;
    }
  }, [syncState]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Avoid intercepting if user is typing in inputs, textareas or editables
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      );

      // 1. Toggle Keyboard Shortcut Dialog with '?' key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (isTyping) return;
        e.preventDefault();
        setShowShortcutsHelp(prev => !prev);
        return;
      }

      // 2. Navigation Shortcuts with 'Alt' modifier
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        let targetRoute = '';
        let routeName = '';

        if (key === 'd') { targetRoute = 'dashboard'; routeName = 'Dashboard'; }
        else if (key === 'g') { targetRoute = 'scores'; routeName = 'Grades & Comments'; }
        else if (key === 'r') { targetRoute = 'reports'; routeName = 'Report Cards Hub'; }
        else if (key === 'l') { targetRoute = 'learners'; routeName = 'Learners Directory'; }
        else if (key === 'f') { targetRoute = 'finance'; routeName = 'Financial Manager'; }
        else if (key === 'c') { targetRoute = 'calendar'; routeName = 'School Calendar'; }
        else if (key === 'm') { targetRoute = 'communications'; routeName = 'Communications Engine'; }
        else if (key === 's') { targetRoute = 'settings'; routeName = 'System Settings'; }
        else if (key === 'e') { targetRoute = 'data'; routeName = 'Excel & Data Integration'; }

        if (targetRoute) {
          e.preventDefault();
          setCurrentRoute(targetRoute);
          addToast(`Navigated to ${routeName} Module via Alt+${key.toUpperCase()}`, 'success');
          return;
        }
      }

      // 3. Operational Shortcuts (Ctrl+S / Ctrl+P)
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          const activeRoute = currentRouteRef.current;
          if (activeRoute === 'scores') {
            window.dispatchEvent(new CustomEvent('otec-shortcut-save'));
          } else {
            addToast('Ctrl+S is only active inside the Grades (Scores) module to commit marksheets.', 'warning');
          }
        } else if (key === 'p') {
          e.preventDefault();
          const activeRoute = currentRouteRef.current;
          if (activeRoute === 'reports') {
            window.dispatchEvent(new CustomEvent('otec-shortcut-print'));
          } else {
            addToast('Ctrl+P is active inside the Report Cards Hub to open and run printer layouts.', 'warning');
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const handleUpdateLearners = (newLearners: Learner[]) => {
    dataManager.updateLearners(newLearners);
    addToast('Student roster database updated and auto-saved.', 'success');
  };

  const handleUpdateScores = (compositeKey: string, scoreRecord: ScoreRecord) => {
    dataManager.updateScores(compositeKey, scoreRecord);
    addToast('Marksheet saved and updated in system.', 'success');
  };

  const handleUpdatePsychomotor = (compositeKey: string, psychoRecord: PsychomotorRecord) => {
    dataManager.updatePsychomotor(compositeKey, psychoRecord);
    addToast('Psychomotor skills and behavioral ratings updated.', 'success');
  };

  const handleUpdateComments = (compositeKey: string, commentRecord: CommentRecord) => {
    dataManager.updateComments(compositeKey, commentRecord);
    addToast('Teacher evaluation comments and initials recorded.', 'success');
  };

  const handleImportScoresBatch = (importedScores: { [key: string]: ScoreRecord }) => {
    const updated = { ...data.scores, ...importedScores };
    dataManager.setData({
      ...data,
      scores: updated
    });
    addToast('Successfully imported batch scoresheet from Excel!', 'success');
  };

  const handleUpdateSettings = (newSettings: SchoolSettings) => {
    dataManager.updateSettings(newSettings);
    addToast('System settings and grading criteria updated.', 'success');
  };

  const handleResetData = () => {
    dataManager.resetToDefaults();
    addToast('All local student data was reset to system defaults.', 'warning');
  };

  // RBAC Roles Definition
  const ROUTE_ROLES: Record<string, string[]> = {
    'dashboard': ['superuser', 'teacher', 'accountant', 'security'],
    'analytics': ['superuser'],
    'student-360': ['superuser', 'teacher', 'accountant'],
    'staff-360': ['superuser'],
    'hr': ['superuser', 'accountant'],
    'admissions': ['superuser', 'accountant'],
    'learners': ['superuser', 'teacher', 'accountant'],
    'scores': ['superuser', 'teacher'],
    'reports': ['superuser', 'teacher'],
    'finance': ['superuser', 'accountant'],
    'security': ['superuser', 'security'],
    'transport': ['superuser', 'accountant', 'security'],
    'library': ['superuser', 'teacher'],
    'inventory': ['superuser', 'accountant'],
    'procurement': ['superuser', 'accountant'],
    'hostel': ['superuser', 'teacher'],
    'clinic': ['superuser', 'teacher'],
    'discipline': ['superuser', 'teacher', 'security'],
    'extracurricular': ['superuser', 'teacher'],
    'timetable': ['superuser', 'teacher'],
    'teacher-attendance': ['superuser', 'security', 'teacher'],
    'calendar': ['superuser', 'teacher', 'accountant', 'security'],
    'data': ['superuser'],
    'settings': ['superuser'],
    'communications': ['superuser', 'teacher', 'accountant'],
    'ai-consultant': ['superuser', 'accountant', 'teacher'],
    'notifications': ['superuser'],
    'audit-logs': ['superuser'],
  };

  // Render sub page
  const renderActivePage = () => {
    if (!data) return null;

    if (localUser && ROUTE_ROLES[currentRoute] && !ROUTE_ROLES[currentRoute].includes(localUser.role)) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center px-4 bg-slate-50">
          <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500 max-w-md">Your current role ({localUser.role}) does not have permission to view the "{currentRoute}" module. Please contact the system administrator if you believe this is an error.</p>
          <button onClick={() => setCurrentRoute('dashboard')} className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md">Return to Dashboard</button>
        </div>
      );
    }

    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'learners':
        return (
          <Learners 
            onUpdateLearners={handleUpdateLearners} 
          />
        );
      case 'admissions':
        return (
          <AdmissionsManager />
        );
      case 'scores':
        return (
          <Scores 
            onUpdateScores={handleUpdateScores}
            onUpdatePsychomotor={handleUpdatePsychomotor}
            onUpdateComments={handleUpdateComments}
          />
        );
      case 'reports':
        return <ReportCard />;
      case 'data':
        return (
          <ImportExport 
            onUpdateLearners={handleUpdateLearners}
            onImportScores={handleImportScoresBatch}
            onResetData={handleResetData}
          />
        );
      case 'settings':
        return (
          <Settings 
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'hr':
        return (
          <HRManager
            onUpdateHR={(payroll, appraisals) => {
              const updatedData = { ...data, hr: { payroll, appraisals } };
              setData(updatedData);
              dataManager.setData(updatedData);
              addToast("HR data updated successfully", 'success');
            }}
            onUpdateStaff={(teachers, nonTeachingStaff) => {
               const updatedData = { 
                 ...data, 
                 settings: { 
                   ...data.settings, 
                   teachers, 
                   nonTeachingStaff 
                 } 
               };
               setData(updatedData);
               dataManager.setData(updatedData);
               addToast("Staff directory updated successfully", 'success');
            }}
          />
        );

      case 'calendar':
        return (
          <AcademicCalendar 
            onUpdateSettings={handleUpdateSettings}
          />
        );
      case 'finance':
        return <FinanceManager />;
      case 'security':
        return (
          <SecurityManager 
            onUpdateSecurity={(updatedSec) => dataManager.updateSecurityData(updatedSec)} 
          />
        );
      case 'transport':
        return (
          <TransportManager 
            onUpdateTransport={(updatedTrans) => dataManager.updateTransportData(updatedTrans)} 
          />
        );
      case 'library':
        return (
          <LibraryManager 
            onUpdateLibrary={(updatedLib) => dataManager.updateLibraryData(updatedLib)} 
          />
        );
      case 'inventory':
        return (
          <InventoryManager 
            onUpdateInventory={(updatedInv) => dataManager.updateInventoryData(updatedInv)} 
          />
        );
      case 'procurement':
        return (
          <ProcurementManager 
            onUpdateProcurement={(updatedProc) => dataManager.updateProcurementData(updatedProc)}
            onUpdateInventory={(updatedInv) => dataManager.updateInventoryData(updatedInv)}
          />
        );
      case 'hostel':
        return (
          <HostelManager 
            onUpdateHostel={(updatedHostel) => dataManager.updateHostelData(updatedHostel)} 
          />
        );
      case 'timetable':
        return (
          <TimetableManager 
            onUpdateTimetable={(updatedTimetable) => dataManager.updateTimetableData(updatedTimetable)} 
          />
        );
      case 'clinic':
        return (
          <ClinicManager 
            onUpdateClinic={(updatedClinic) => dataManager.updateClinicData(updatedClinic)} 
          />
        );
      case 'discipline':
        return (
          <DisciplineManager 
            onUpdateDiscipline={(updatedDiscipline) => dataManager.updateDisciplineData(updatedDiscipline)} 
          />
        );
      case 'extracurricular':
        return (
          <ExtracurricularManager 
            onUpdateExtra={(updatedExtra) => dataManager.updateExtracurricularData(updatedExtra)} 
          />
        );
      case 'student-360':
        return <Student360 />;
      case 'ai-consultant':
        return <AIChatbot />;
      case 'notifications':
        return <NotificationCenter />;
      case 'staff-360':
        return <Staff360 />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'teacher-attendance':
        return <TeacherAttendance />;
      case 'communications':
        return (
          <CommunicationsEngine 
            onUpdateCommunications={(comms) => dataManager.updateCommunicationsData(comms)}
          />
        );
      case 'audit-logs':
        return <AuditLogViewer />;
      default:
        return <Dashboard />;
    }
  };

  if (!isDbReady || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
        {cachedLogo ? (
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <img src={cachedLogo} alt="School Logo" className="w-24 h-24 object-contain rounded-full shadow-lg relative z-10 animate-bounce" />
          </div>
        ) : (
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-lg"></div>
        )}
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Welcome to OTEC Edu-AI</h2>
        <p className="text-slate-500 font-medium text-sm mt-2">Loading your digital campus...</p>
      </div>
    );
  }

  const isOfflineOnly = localStorage.getItem('otec_offline_only_mode') === 'true';
  const showTenantAuth = !activeUser && !isOfflineOnly && !localStorage.getItem('otec_manually_signed_out');

  if (showTenantAuth) {
    return <TenantAuthModal />;
  }

  if (data.settings.authConfig?.requireLoginOnStartup && !localUser) {
    return (
      <div className="flex h-screen bg-slate-100 items-center justify-center font-sans">
        <AuthModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

    // Parent Portal Bypass Layout
  if (currentRoute === 'parent-portal' && data) {
    return (
      <ParentPortal 
        onExit={() => setCurrentRoute('dashboard')} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-blue-600/20 selection:text-blue-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden print:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Hidden when printing */}
      <div className={`print:hidden shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-full overflow-y-auto`}>
        <Sidebar 
          currentRoute={currentRoute} 
          setCurrentRoute={(route) => {
            setCurrentRoute(route);
            if (window.innerWidth < 1024) setShowSidebar(false);
          }} 
          syncState={syncState}
          user={activeUser}
          localUser={localUser}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:overflow-visible">
        {/* Dynamic Header - Hidden when printing */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 print:hidden shadow-xs relative z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 truncate max-w-[150px] sm:max-w-none">
              {currentRoute === 'dashboard' && 'Dashboard Analytics'}
              {currentRoute === 'learners' && 'Learners Directory'}
              {currentRoute === 'scores' && 'Grades & Comments Entry'}
              {currentRoute === 'reports' && 'Report Cards Hub'}
              {currentRoute === 'finance' && 'School Finances & Accounting Ledgers'}
              {currentRoute === 'calendar' && 'School Calendar & Events Planner'}
              {currentRoute === 'transport' && 'Transport & Fleet Management'}
              {currentRoute === 'library' && 'Library Management'}
              {currentRoute === 'inventory' && 'Inventory & Asset Management'}
              {currentRoute === 'hostel' && 'Hostel & Dormitory Management'}
              {currentRoute === 'timetable' && 'Class Timetable Scheduler'}
              {currentRoute === 'clinic' && 'School Clinic & Health'}
              {currentRoute === 'discipline' && 'Disciplinary & Conduct'}
              {currentRoute === 'extracurricular' && 'Clubs & Extracurriculars'}
              {currentRoute === 'student-360' && 'Student 360° Profile'}
              {currentRoute === 'staff-360' && 'Staff 360° Profile'}
              {currentRoute === 'communications' && 'Communications Engine'}
              {currentRoute === 'analytics' && "Principal's Dashboard"}
              {currentRoute === 'data' && 'Excel & Data Integration'}
              {currentRoute === 'settings' && 'System Settings'}
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={data.settings.term}
                onChange={(e) => {
                  handleUpdateSettings({
                    ...data.settings,
                    term: e.target.value
                  });
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-700 text-xs font-bold rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs transition-colors"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
              <span className="hidden sm:inline px-2.5 py-1 bg-slate-50 border border-slate-200/50 text-slate-500 text-xs font-semibold rounded-lg uppercase tracking-wider">
                {data.settings.year}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setCurrentRoute('parent-portal')}
              className="hidden sm:block px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="Launch Parent Portal"
            >
              Parent Portal
            </button>
            <button 
              onClick={() => setCurrentRoute('data')}
              className="hidden sm:block px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Import/Export
            </button>
            <button 
              onClick={() => setCurrentRoute('reports')}
              className="px-2.5 py-1.5 sm:px-3.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs shadow-blue-600/10 cursor-pointer"
            >
              <span className="hidden sm:inline">Generate Reports</span>
              <span className="sm:hidden">Reports</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center shrink-0">
              {localUser ? localUser.name.slice(0, 2).toUpperCase() : (activeUser ? activeUser.email?.slice(0, 2).toUpperCase() : 'GS')}
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              title="Log Out School"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Panel */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-[1400px] w-full mx-auto print:p-0 print:overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="h-full w-full"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Background Periodic Backup Trigger */}
        <BackupManager backgroundOnly={true} />
      </div>

      {/* Keyboard Shortcuts Interactive Guide Overlay */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShortcutsHelp(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[99999] print:hidden"
            />

            {/* Panel Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="fixed inset-0 m-auto max-w-lg h-fit max-h-[85vh] bg-white border border-slate-200 rounded-3xl shadow-2xl z-[100000] flex flex-col overflow-hidden print:hidden"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-800 rounded-xl text-amber-400">
                    <Keyboard size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-white">System Keyboard Shortcuts Map</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Accelerate your administrative workflows</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-800">
                
                {/* Navigation Section */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-500" />
                    Global Navigation Shortcuts (Alt Modifiers)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'D', desc: 'Dashboard Analytics' },
                      { key: 'G', desc: 'Grades & Comments' },
                      { key: 'R', desc: 'Report Cards Hub' },
                      { key: 'L', desc: 'Learners Directory' },
                      { key: 'F', desc: 'Financial Manager' },
                      { key: 'C', desc: 'School Calendar' },
                      { key: 'M', desc: 'Communications Engine' },
                      { key: 'S', desc: 'System Settings' },
                      { key: 'E', desc: 'Excel & Data Integration' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
                        <span className="font-semibold text-slate-600">{item.desc}</span>
                        <div className="flex items-center gap-0.5">
                          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 text-[10px] font-bold rounded shadow-xs text-slate-500">Alt</kbd>
                          <span className="text-[10px] text-slate-300 font-bold">+</span>
                          <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 text-[10px] font-black rounded shadow-xs text-slate-800">{item.key}</kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations Section */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                    <HelpCircle size={11} className="text-blue-500" />
                    Context-Aware Core Operations
                  </h4>
                  
                  <div className="space-y-2">
                    {/* Ctrl+S */}
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Save size={12} className="text-blue-600" />
                          <span className="font-black text-blue-900">Commit Marksheet Draft</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Saves all local grades, comments, psychomotor ratings, and teacher initials inside the <span className="text-slate-800">Grades &amp; Comments (Scores)</span> module.
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                        <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 text-[10px] font-bold rounded shadow-xs text-blue-700">Ctrl</kbd>
                        <span className="text-[10px] text-blue-300 font-bold">+</span>
                        <kbd className="px-1.5 py-0.5 bg-white border border-blue-200 text-[10px] font-black rounded shadow-xs text-blue-900">S</kbd>
                      </div>
                    </div>

                    {/* Ctrl+P */}
                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Printer size={12} className="text-emerald-600" />
                          <span className="font-black text-emerald-900">Print Student Report Card</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                          Launches the printing overlay and exports standard PDF copies inside the <span className="text-slate-800">Report Cards Hub</span> module.
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                        <kbd className="px-1.5 py-0.5 bg-white border border-emerald-200 text-[10px] font-bold rounded shadow-xs text-emerald-700">Ctrl</kbd>
                        <span className="text-[10px] text-emerald-300 font-bold">+</span>
                        <kbd className="px-1.5 py-0.5 bg-white border border-emerald-200 text-[10px] font-black rounded shadow-xs text-emerald-900">P</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Info Footer */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">?</kbd> to toggle panel</span>
                  <button
                    onClick={() => setShowShortcutsHelp(false)}
                    className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-0"
                  >
                    <span>Got it</span>
                    <ArrowRight size={10} />
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Multi-Browser Concurrency Conflict Side-by-Side Modal */}
      <SyncConflictModal />

      {/* Onboarding Tour Interactive Modal */}
      <OnboardingTour 
        currentRoute={currentRoute} 
        setCurrentRoute={setCurrentRoute} 
        isOpen={showOnboardingTour} 
        onClose={() => setShowOnboardingTour(false)} 
      />

      {/* Floating Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 animate-slide-up-fade text-xs font-bold leading-relaxed ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 shadow-emerald-500/10' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800 shadow-amber-500/10' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800 shadow-rose-500/10' :
              'bg-slate-900 border-slate-800 text-white shadow-slate-900/20'
            }`}
          >
            <span className="text-sm shrink-0">
              {toast.type === 'success' && '✅'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 font-bold ml-1 hover:scale-110 cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
