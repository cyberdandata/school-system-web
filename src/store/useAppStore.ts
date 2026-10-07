import { create } from 'zustand';
import { AppData, AdmissionsData, HRData, LibraryData, TimetableData, TransportData, Learner, FinanceTransaction, SchoolSettings } from '../types';
import dataManager from '../lib/db';

interface AppState {
  data: AppData | null;
  isDbReady: boolean;
  syncState: any;
  activeUser: any;
  localUser: any;
  
  // Actions
  setData: (data: AppData | null) => void;
  setIsDbReady: (ready: boolean) => void;
  setSyncState: (state: any) => void;
  setActiveUser: (user: any) => void;
  setLocalUser: (user: any) => void;
  
  // High-level updaters for specific modules
  updateLearners: (learners: Learner[]) => void;
  updateAdmissions: (admissions: AdmissionsData) => void;
  updateFinance: (finance: FinanceTransaction[]) => void;
  updateHR: (hr: HRData) => void;
  updateLibrary: (library: LibraryData) => void;
  updateTimetable: (timetable: TimetableData) => void;
  updateTransport: (transport: TransportData) => void;
  updateSettings: (settings: SchoolSettings) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  data: null,
  isDbReady: false,
  syncState: null, // Will initialize on app mount
  activeUser: null,
  localUser: null,

  setData: (data) => set({ data }),
  setIsDbReady: (ready) => set({ isDbReady: ready }),
  setSyncState: (state) => set({ syncState: state }),
  setActiveUser: (user) => set({ activeUser: user }),
  setLocalUser: (user) => set({ localUser: user }),

  updateLearners: (learners) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, learners };
    set({ data: newData });
    dataManager.setData(newData);
  },

  updateAdmissions: (admissions) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, admissions };
    set({ data: newData });
    dataManager.updateAdmissionsData(admissions);
  },

  updateFinance: (finance) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, finance };
    set({ data: newData });
    dataManager.setData(newData);
  },

  updateHR: (hr) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, hr };
    set({ data: newData });
    dataManager.setData(newData);
  },

  updateLibrary: (library) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, library };
    set({ data: newData });
    dataManager.updateLibraryData(library);
  },

  updateTimetable: (timetable) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, timetable };
    set({ data: newData });
    dataManager.updateTimetableData(timetable);
  },

  updateTransport: (transport) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, transport };
    set({ data: newData });
    dataManager.updateTransportData(transport);
  },

  updateSettings: (settings) => {
    const { data } = get();
    if (!data) return;
    const newData = { ...data, settings };
    set({ data: newData });
    dataManager.updateSettings(settings);
  }
}));
