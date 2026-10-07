import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { silentSyncToGoogleDrive, autoRestoreFromGoogleDrive } from './googleDriveService';
import { AppData, BankAccount, BankTransfer, CommunicationsData, SchoolSettings, Learner, ScoreRecord, PsychomotorRecord, CommentRecord, ActivityLog, FinanceTransaction, SecurityData, GateLogEntry, VisitorRecord, UnknownPersonAlert, SecurityGateSystemConfig, TransportData, LibraryData, InventoryData, HostelData, TimetableData, ClinicData, DisciplineData, ExtracurricularData, HRData, AdmissionsData, ProcurementData, Vendor, VendorInvoice, PettyCashRequisition, AuditLog, StaffAttendanceRecord } from '../types';
import { getDemoData, defaultSettings, defaultPrePrimaryGradingBands, defaultSectionSubjects, regenerateUNEBNumbers, getDemoSecurityData } from './defaults';
import { baselineLedgerTransactions } from './ledgerDefaults';


// Electron File System Fallback
let fs: any = null;
let pathModule: any = null;
let userDataPath = '';

if (typeof window !== 'undefined' && (window as any).require) {
  try {
    fs = (window as any).require('fs');
    pathModule = (window as any).require('path');
    
    // Try to get userData path from electron
    try {
      // Store in the database folder of the app
      const dbFolder = pathModule.join((window as any).process.cwd(), 'database');
      if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder, { recursive: true });
      }
      userDataPath = pathModule.join(dbFolder, 'schools_database.json');
    } catch (e) {
      userDataPath = 'database/schools_database.json';
    }
  } catch (e) {
    console.log('Not running in Electron or nodeIntegration disabled', e);
  }
}

const syncBackend = localStorage.getItem('otec_sync_backend') || 'firebase';
const customServerUrl = localStorage.getItem('otec_custom_server_url') || 'http://localhost:5555';

async function saveToFileSystem(data: AppData) {
  if (fs && userDataPath) {
    try {
      fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('Saved to local filesystem:', userDataPath);
    } catch (e) {
      console.error('Failed to save to local filesystem:', e);
    }
  }
}

export async function loadFromFileSystem(): Promise<AppData | null> {
  if (fs && userDataPath) {
    try {
      if (fs.existsSync(userDataPath)) {
        const fileContent = fs.readFileSync(userDataPath, 'utf-8');
        return JSON.parse(fileContent) as AppData;
      }
    } catch (e) {
      console.error('Failed to load from local filesystem:', e);
    }
  }
  return null;
}


export interface SyncMetric {
  id: string;
  timestamp: string;
  durationMs: number;
  payloadKb: number;
  status: 'synced' | 'cached' | 'error' | 'offline';
  trigger: string;
  details?: string;
}

const LOCAL_STORAGE_KEY = 'otec_report_card_data';

// --- INDEXEDDB ABSTRACTION ---
const DB_NAME = 'OTEC_Database';
const STORE_NAME = 'app_data';

let cachedDB: IDBDatabase | null = null;

const getDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  if (cachedDB) {
    return resolve(cachedDB);
  }
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => {
    (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => {
    cachedDB = request.result;
    resolve(cachedDB);
  };
  request.onerror = () => reject(request.error);
});

export const idb = {
  async get(key: string): Promise<any> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async set(key: string, value: any): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
// -----------------------------

let lastSyncMetrics: SyncMetric = {
  id: 'init',
  timestamp: new Date().toLocaleString(),
  durationMs: 0,
  payloadKb: 0,
  status: 'cached',
  trigger: 'startup',
  details: 'Local database state loaded successfully'
};

let syncMetricsHistory: SyncMetric[] = [];
let lastSyncedDataHash: string = '';

try {
  const savedHist = localStorage.getItem('otec_sync_metrics_history');
  if (savedHist) {
    syncMetricsHistory = JSON.parse(savedHist);
    if (syncMetricsHistory.length > 0) {
      lastSyncMetrics = syncMetricsHistory[0];
    }
  }
} catch (e) {
  console.error('Failed to parse sync metrics history', e);
}

export function migrateLowerPrimarySubjects(data: AppData): AppData {
  if (!data || !data.settings || !data.settings.sections) return data;
  
  const lowerSec = data.settings.sections.lower;
  if (lowerSec) {
    const targetNames = ['English', 'Mathematics', 'Literacy 1', 'Literacy 2', 'Religious Education', 'Luganda'];
    const currentNames = lowerSec.subjects.map(s => s.name);
    const isMatched = currentNames.length === targetNames.length && currentNames.every((n, i) => n === targetNames[i]);
    
    if (!isMatched) {
      lowerSec.subjects = targetNames.map(name => ({ name, max: 100 }));
    }
  }

  const preSec = data.settings.sections.preprimary;
  if (preSec) {
    const targetNames = ['Learning Area 1: Social Development', 'Learning Area 2: Environmental Exploration', 'Learning Area 3: Health & Self Care', 'Learning Area 4: Language Development', 'Learning Area 5: Mathematical Concepts'];
    const currentNames = preSec.subjects.map(s => s.name);
    const isMatched = currentNames.length === targetNames.length && currentNames.every((n, i) => n === targetNames[i]);
    
    if (!isMatched) {
      preSec.subjects = targetNames.map(name => ({ name, max: 100 }));
    }
    // Only set default pre-primary grading bands if not set, preserving user customizations and comments
    if (!preSec.grading || preSec.grading.length === 0) {
      preSec.grading = defaultPrePrimaryGradingBands();
    }
  }

  // Head teacher name update
  if (data.settings.headTeacherName === 'Mrs. Namubiru Justine' || !data.settings.headTeacherName) {
    data.settings.headTeacherName = 'Ssemakula Joseph';
    data.settings.headTeacherInitials = 'S.J.';
  }




  // FINANCE MIGRATION 1.0 - Historical Ledger
  const __financeMigratedV1 = data.finances?.some(f => f.description.includes('FINANCE MIGRATION 1.0'));
  
  if (!__financeMigratedV1) {
    if (!data.finances) data.finances = [];
    
    // To prevent duplicate additions, we will filter out any existing ones that might have this tag
    // though the flag should prevent it. We will just push them all.
    baselineLedgerTransactions.forEach(tx => {
      data.finances.push(tx);
    });
  }

  // Restore true staff data if it was overwritten by generic data
  const currentTeachers = data.settings.teachersList || [];
  if (currentTeachers.length === 0 || currentTeachers.some(t => t.id === 't_mabirizi' || t.name === 'MABIRIZI RONALD')) {
    data.settings.teachersList = defaultSettings().teachersList;
    data.settings.nonTeachingStaffList = defaultSettings().nonTeachingStaffList;
  }

  // Ensure calendarEvents exists and is populated
  if (!data.settings.calendarEvents || data.settings.calendarEvents.length === 0) {
    data.settings.calendarEvents = [
      { id: 'E1', title: 'Term 3 Official Opening Day', date: '2026-09-07', type: 'event', description: 'Welcome back students for the final academic term of the year.' },
      { id: 'E2', title: 'Independence Day Holiday', date: '2026-10-09', type: 'holiday', description: 'National public holiday. School remains closed for one day.' },
      { id: 'E3', title: 'Mid-Term Examinations Block', date: '2026-10-19', type: 'deadline', description: 'Mid-Term papers administered across all classes. Marks entry due by end of week.' },
      { id: 'E4', title: 'P7 UNEB PLE Mock Finals', date: '2026-11-09', type: 'deadline', description: 'Final mock series for Primary 7 candidates to prepare for UNEB PLE.' },
      { id: 'E5', title: 'Eid al-Adha Holiday', date: '2026-11-20', type: 'holiday', description: 'Eid holiday observed (subject to sighting of moon). School closed.' },
      { id: 'E6', title: 'End of Term Assessment Exams', date: '2026-11-30', type: 'deadline', description: 'Final End of Term promotional examinations.' },
      { id: 'E7', title: 'Christmas Thanksgiving Festival', date: '2026-12-04', type: 'event', description: 'Academic thanksgiving assembly, choir carols, and community feast.' },
      { id: 'E8', title: 'Report Cards & Graduation Day', date: '2026-12-11', type: 'event', description: 'Primary 7 promotional lists posted and Nurseries Graduation ceremony.' }
    ];
  }

  // Also migrate scores for lower classes!
  const lowerClasses = ['P1', 'P2', 'P3'];
  const lowerLearnerIds = new Set(data.learners.filter(l => lowerClasses.includes(l.cls)).map(l => l.id));

  // Migrate scores for pre-primary classes!
  const preprimaryClasses = ['ZEBRA', 'LION', 'ELEPHANT'];
  const preprimaryLearnerIds = new Set(data.learners.filter(l => preprimaryClasses.includes(l.cls)).map(l => l.id));

  if (data.scores) {
    Object.keys(data.scores).forEach(compositeKey => {
      const [learnerId] = compositeKey.split('|');
      if (lowerLearnerIds.has(learnerId)) {
        const scoreRec = data.scores[compositeKey];
        if (scoreRec) {
          const newScoreRec: Record<string, number | string> = {};
          
          Object.entries(scoreRec).forEach(([subjectName, marks]) => {
            if (subjectName === 'Science') {
              newScoreRec['Literacy 1'] = marks;
            } else if (subjectName === 'Creative Arts') {
              newScoreRec['Luganda'] = marks;
            } else if (subjectName === 'Social Studies') {
              // skip / remove
            } else {
              newScoreRec[subjectName] = marks;
            }
          });

          data.scores[compositeKey] = newScoreRec;
        }
      } else if (preprimaryLearnerIds.has(learnerId)) {
        const scoreRec = data.scores[compositeKey];
        if (scoreRec) {
          const newScoreRec: Record<string, number | string> = {};
          Object.entries(scoreRec).forEach(([subjectName, marks]) => {
            if (subjectName === 'Numeracy') {
              newScoreRec['NUMBERS'] = marks;
            } else if (subjectName === 'Literacy') {
              newScoreRec['ENGLISH'] = marks;
            } else if (subjectName === 'Creative Arts') {
              newScoreRec['DRAWING'] = marks;
            } else if (subjectName === 'Religious Education') {
              newScoreRec['SOCIAL DEVELOPMENTS'] = marks;
            } else if (subjectName === 'Physical Education') {
              newScoreRec['HEALTH HABBITS'] = marks;
            } else {
              newScoreRec[subjectName] = marks;
            }
          });
          data.scores[compositeKey] = newScoreRec;
        }
      }
    });
  }


  // FEES MIGRATION 3.0 - Real Student Data Cleaned
  const __feesMigratedV3 = data.finances?.some(f => f.description.includes('FEES MIGRATION 3.0'));
  
  if (!__feesMigratedV3) {
    // WIPE DEMO STUDENTS (Ensure a clean slate for the real students)
    data.learners = [];
    data.finances = [];
    data.hostel = { dormitories: [], allocations: [] };
    data.transport = { vans: [], routes: [], allocations: [], fuelLogs: [], maintenanceLogs: [] };
    
    // Ensure we have a default dorm and route
    data.hostel.dormitories.push({
      id: 'DORM-MAIN',
      name: 'Main Boarding Wing',
      gender: 'Mixed',
      rooms: [{ id: 'RM-1', name: 'General Ward', capacity: 300 }]
    });
    
    data.transport.routes.push({
      id: 'ROUTE-MAIN',
      name: 'General School Route',
      zones: [{ id: 'ZN-1', name: 'General Zone', distance: '10km', defaultCost: 260000 }]
    });

    const realSpreadsheetData = [
      { name: "Aleem Galugali Afan", cls: "ELEPHANT", paycode: "1010521012", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mugambwa tyrone Tendo Mukasa", cls: "ELEPHANT", paycode: "1010607442", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nikky Nansubuga", cls: "ELEPHANT", paycode: "1010668240", phone: "", due: 200000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nabatanzi Bint Hamis Hannah", cls: "ELEPHANT", paycode: "1010680309", phone: "", due: 270000, paid: 270000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Sempela Paul Troy", cls: "ELEPHANT", paycode: "", phone: "", due: 590000, paid: 590000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ruth Mirab", cls: "ELEPHANT", paycode: "", phone: "", due: 200000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nimurungi Alvin Sserugo", cls: "ELEPHANT", paycode: "", phone: "", due: 80000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nalubega Samantha Zion", cls: "ELEPHANT", paycode: "", phone: "", due: 80000, paid: 0, out: 40000, cat: "", colorCat: "", debt: "0" },
      { name: "Nanyonga Pretty kiwanuka", cls: "ELEPHANT", paycode: "", phone: "", due: 200000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Adeke Dinah", cls: "ELEPHANT", paycode: "", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namutebi Shukran", cls: "ELEPHANT", paycode: "", phone: "", due: 260000, paid: 100000, out: 0, cat: "discount", colorCat: "ream", debt: "0" },
      { name: "Mukisa Daniel", cls: "ELEPHANT", paycode: "", phone: "", due: 540000, paid: 540000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Wesonga Emmanuel", cls: "ZEBRA", paycode: "", phone: "", due: 360000, paid: 230000, out: 60000, cat: "vau user", colorCat: "260000", debt: "0" },
      { name: "Aafruuz Mutambuli Mansoor", cls: "ELEPHANT", paycode: "", phone: "", due: 250000, paid: 100000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mali Gracious", cls: "ELEPHANT", paycode: "", phone: "", due: 80000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nansubuga Shuquran", cls: "ZEBRA", paycode: "1008799582", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Wamala Abdu", cls: "ZEBRA", paycode: "1008807850", phone: "", due: 290000, paid: 210000, out: 1000, cat: "", colorCat: "", debt: "0" },
      { name: "Namwori Grace", cls: "ZEBRA", paycode: "1008878539", phone: "", due: 80000, paid: 80000, out: 0, cat: "teachers child", colorCat: "", debt: "0" },
      { name: "ivana Namutebi", cls: "ZEBRA", paycode: "", phone: "", due: 80000, paid: 60000, out: 0, cat: "cook", colorCat: "", debt: "0" },
      { name: "Ssenyondo Biden kakooza jovan", cls: "ZEBRA", paycode: "1009022251", phone: "", due: 260000, paid: 300000, out: 90000, cat: "ream", colorCat: "", debt: "0" },
      { name: "Nakitende mercy Elizabeth", cls: "ZEBRA", paycode: "1008940427", phone: "", due: 290000, paid: 190000, out: -100000, cat: "", colorCat: "", debt: "0" },
      { name: "Muwanguzi Lael victor", cls: "ZEBRA", paycode: "1009102896", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Gabriell Ayerango Grace", cls: "ZEBRA", paycode: "1009426740", phone: "", due: 410000, paid: 410000, out: 0, cat: "reported in march", colorCat: "", debt: "0" },
      { name: "Mulwanyi Chrizestom", cls: "ZEBRA", paycode: "1008793531", phone: "", due: 220000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kaleb Myles Kolya", cls: "ZEBRA", paycode: "1009836293", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Princess Ayinebyona Nakato", cls: "ZEBRA", paycode: "", phone: "", due: 290000, paid: 215000, out: 145000, cat: "", colorCat: "", debt: "0" },
      { name: "Lauren Asio Malaika", cls: "ZEBRA", paycode: "", phone: "", due: 340000, paid: 340000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Alvin Mutebi", cls: "ZEBRA", paycode: "", phone: "", due: 250000, paid: 250000, out: 0, cat: "escorts", colorCat: "", debt: "0" },
      { name: "Ntambi Ramos Kabenge", cls: "ZEBRA", paycode: "", phone: "", due: 300000, paid: 300000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nakigozi Brovia Martha", cls: "LION", paycode: "1006914417", phone: "", due: 255000, paid: 185000, out: -70000, cat: "f", colorCat: "", debt: "0" },
      { name: "Ssemakula Joseph Asher", cls: "LION", paycode: "1006914745", phone: "", due: 180000, paid: 180000, out: 0, cat: "f", colorCat: "", debt: "0" },
      { name: "Kristian Pendo Ogola", cls: "LION", paycode: "1007134587", phone: "", due: 260000, paid: 260000, out: 0, cat: "f", colorCat: "#REF!", debt: "0" },
      { name: "Nakyeyune Hamnah Sarah", cls: "LION", paycode: "1007092280", phone: "", due: 260000, paid: 270000, out: 80000, cat: "ream", colorCat: "", debt: "0" },
      { name: "Ekisula ebweru salim", cls: "LION", paycode: "1007044996", phone: "", due: 290000, paid: 290000, out: 0, cat: "f", colorCat: "", debt: "0" },
      { name: "Babirye Miracle Victoria", cls: "LION", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "f", colorCat: "yellow =iccsp", debt: "0" },
      { name: "Ganiima Nakkuni Ramsha", cls: "LION", paycode: "", phone: "", due: 260000, paid: 220000, out: 0, cat: "f", colorCat: "", debt: "0" },
      { name: "Kiyimba Joram", cls: "LION", paycode: "1005580041", phone: "", due: 230000, paid: 0, out: 0, cat: "nakyanzi   f", colorCat: "274000", debt: "0" },
      { name: "Mukisa Sharom", cls: "LION", paycode: "1007986138", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Saka Raymond", cls: "LION", paycode: "1007991074", phone: "", due: 290000, paid: 295000, out: 65000, cat: "ream", colorCat: "", debt: "0" },
      { name: "Suhairah Isah", cls: "LION", paycode: "1008057858", phone: "", due: 290000, paid: 380000, out: 90000, cat: "ream", colorCat: "#REF!", debt: "0" },
      { name: "Mubiru Fahim", cls: "LION", paycode: "1008799658", phone: "", due: 260000, paid: 260000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Hossana Nakiberu Abigail", cls: "LION", paycode: "", phone: "", due: 400000, paid: 400000, out: 0, cat: "ream", colorCat: "", debt: "0" },
      { name: "mudoola Travis", cls: "LION", paycode: "", phone: "", due: 80000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ninsiima Dyna", cls: "LION", paycode: "1009792957", phone: "", due: 490000, paid: 490000, out: 0, cat: "van user", colorCat: "", debt: "0" },
      { name: "Namuganyi kellen", cls: "LION", paycode: "", phone: "", due: 290000, paid: 250000, out: 50000, cat: "ream", colorCat: "80000", debt: "0" },
      { name: "Nakibuuka Mary", cls: "LION", paycode: "", phone: "", due: 290000, paid: 250000, out: 90000, cat: "ream", colorCat: "", debt: "0" },
      { name: "Mirembe Lois", cls: "LION", paycode: "", phone: "", due: 80000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Faudel Najib", cls: "p.1", paycode: "", phone: "", due: 310000, paid: 310000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kanamwangi calvin", cls: "lion", paycode: "", phone: "", due: 250000, paid: 150000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kaweesa Gideon Mukisa", cls: "", paycode: "", phone: "", due: 290000, paid: 180000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Victor Mugisha", cls: "P.1", paycode: "1004598780", phone: "705362439", due: 310000, paid: 295000, out: 195000, cat: "staff(eva nakalembe)  f", colorCat: "", debt: "0" },
      { name: "Emmanuella Lubega Namboozo", cls: "P.1", paycode: "1004970591", phone: "706082006", due: 100000, paid: 100000, out: 0, cat: "cassava", colorCat: "", debt: "0" },
      { name: "Mirembe Zuri", cls: "P.1", paycode: "1004702849", phone: "789426721", due: 0, paid: 0, out: 0, cat: "plus lunch f", colorCat: "", debt: "0" },
      { name: "Jeredin Kibumba Bitege", cls: "P.1", paycode: "1005019546", phone: "759659001", due: 310000, paid: 290000, out: 60000, cat: "f", colorCat: "", debt: "0" },
      { name: "Haitham Kyeyune", cls: "P.1", paycode: "1006568232", phone: "", due: 310000, paid: 300000, out: 80000, cat: "lunch also inclusive at this amount f", colorCat: "", debt: "0" },
      { name: "kawalya hormony", cls: "P.1", paycode: "1006597691", phone: "", due: 300000, paid: 300000, out: 0, cat: "plus lunch f", colorCat: "#REF!", debt: "0" },
      { name: "Lwanga Destiny Adrian", cls: "P.1", paycode: "1006613640", phone: "", due: 0, paid: 0, out: 0, cat: "f", colorCat: "red= otm", debt: "0" },
      { name: "Jeremiah Mukisa", cls: "P.1", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "f", colorCat: "", debt: "0" },
      { name: "Gift nakiwala", cls: "P.1", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "f", colorCat: "", debt: "0" },
      { name: "Kizza Brian Bumpenje Prosper", cls: "P.1", paycode: "1006973917", phone: "", due: 0, paid: 0, out: 0, cat: "f", colorCat: "blue =GA", debt: "0" },
      { name: "Nakasujja Ivy Catherine", cls: "P.1", paycode: "1007985992", phone: "", due: 310000, paid: 310000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mukisa Nathaniel", cls: "P.1", paycode: "1007986167", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Crystal Havah Aturinda", cls: "P.1", paycode: "1008016084", phone: "", due: 460000, paid: 460000, out: 0, cat: "", colorCat: "#REF!", debt: "0" },
      { name: "Kajjubi Alkham", cls: "P.1", paycode: "1008448676", phone: "", due: 310000, paid: 280000, out: 70000, cat: "", colorCat: "", debt: "0" },
      { name: "Precious Maali evelyne", cls: "P.1", paycode: "", phone: "", due: 80000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Serena Achadu Barrika", cls: "P.1", paycode: "1008697299", phone: "", due: 410000, paid: 410000, out: 0, cat: "ekwap and humphrey", colorCat: "", debt: "0" },
      { name: "Latifa Nambuya Malika", cls: "P.1", paycode: "", phone: "", due: 500000, paid: 500000, out: 0, cat: "discount aunt p", colorCat: "", debt: "0" },
      { name: "Ojulu George", cls: "P.1", paycode: "1008817815", phone: "", due: 310000, paid: 310000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nanyonjo blessing kiwanuka", cls: "P.1", paycode: "1008730703", phone: "", due: 200000, paid: 200000, out: 0, cat: "discount", colorCat: "", debt: "0" },
      { name: "Dikan Joseph blessing Teem", cls: "P.1", paycode: "", phone: "", due: 360000, paid: 360000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ssekajja Reuben", cls: "P.1", paycode: "", phone: "", due: 310000, paid: 280000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ngoloobe putin", cls: "P.1", paycode: "", phone: "", due: 270000, paid: 170000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mayega Mukiibi Darren", cls: "P.1", paycode: "", phone: "", due: 530000, paid: 530000, out: 0, cat: "plus lunch", colorCat: "", debt: "0" },
      { name: "Jerome Kato Mugwaanya", cls: "P.1", paycode: "", phone: "", due: 300000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Jethro Wasswa Mugwaanya", cls: "p.1", paycode: "", phone: "", due: 300000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namutebi Sarah", cls: "p.1", paycode: "", phone: "", due: 250000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "PRIMARY TWO", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namutamba Faith", cls: "P.2", paycode: "1003372958", phone: "705716541", due: 310000, paid: 60000, out: 60000, cat: "", colorCat: "#REF!", debt: "0" },
      { name: "Kiyimba Jotham", cls: "P.2", paycode: "1003172778", phone: "776727575", due: 310000, paid: 250000, out: 0, cat: "nakyanzi", colorCat: "320000", debt: "0" },
      { name: "Bajjampola Hillary", cls: "P.2", paycode: "1006597116", phone: "", due: 310000, paid: 310000, out: 0, cat: "plus lunch", colorCat: "", debt: "0" },
      { name: "Omarimungu Jordan", cls: "P.2", paycode: "1006613689", phone: "", due: 0, paid: 0, out: 0, cat: "plus lunch", colorCat: "otm", debt: "0" },
      { name: "Hannah isah Mbowa", cls: "P.2", paycode: "1005532248", phone: "", due: 330000, paid: 440000, out: 110000, cat: "", colorCat: "", debt: "0" },
      { name: "Nambi Esther", cls: "P.2", paycode: "1004773962", phone: "782025680", due: 310000, paid: 310000, out: 0, cat: "harmony", colorCat: "", debt: "0" },
      { name: "Edgar Ekwap Barrack", cls: "P.2", paycode: "1008697259", phone: "", due: 410000, paid: 410000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nalubega Kim Keiley", cls: "P.2", paycode: "1008713245", phone: "", due: 310000, paid: 360000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nakalyango Shanitah", cls: "P.2", paycode: "1008849945", phone: "", due: 290000, paid: 290000, out: 0, cat: "discount", colorCat: "", debt: "0" },
      { name: "Namuwaya Mitchel", cls: "P.2", paycode: "1008878445", phone: "", due: 80000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Karungi Lewin Amber", cls: "P.2", paycode: "100888661", phone: "", due: 280000, paid: 150000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Achsah Naava Serah", cls: "P.2", paycode: "1008894881", phone: "", due: 400000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kadyesi Muhammad", cls: "P.2", paycode: "1008984556", phone: "", due: 400000, paid: 400000, out: 0, cat: "van user", colorCat: "", debt: "0" },
      { name: "Kisakye Joshua Achali", cls: "p.2", paycode: "1010605242", phone: "", due: 440000, paid: 440000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nalwanga Nestor", cls: "p.2", paycode: "1010668311", phone: "", due: 275000, paid: 225000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Racheal nite", cls: "p.2", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Clinthen ssebuufu", cls: "p.2", paycode: "", phone: "", due: 310000, paid: 301000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nalugo kelly jay", cls: "p.2", paycode: "", phone: "", due: 310000, paid: 200000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nabwire Getu", cls: "p.2", paycode: "", phone: "", due: 80000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mulungi Josephine", cls: "p.2", paycode: "", phone: "", due: 310000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Delvin Nsubuga", cls: "p.2", paycode: "", phone: "", due: 260000, paid: 100000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "PRIMARY THREE", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Muwanguzi Newton", cls: "P.3", paycode: "1003468140", phone: "709324224", due: 67000, paid: 60000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mukisa Eria Nathan", cls: "P.3", paycode: "1003297990", phone: "772682179", due: 310000, paid: 250000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kalungi Blessing", cls: "P.3", paycode: "1003939847", phone: "705362439", due: 520000, paid: 490000, out: 0, cat: "staff(eva nakalembe)", colorCat: "", debt: "0" },
      { name: "Adrine- Otm Tushemeyirwe", cls: "P.3", paycode: "1003548101", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ssemalulu Rich", cls: "P.3", paycode: "1003272934", phone: "703654744", due: 275000, paid: 220000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Rahmah Rashimah Nakaweesa", cls: "P.3", paycode: "", phone: "754770660", due: 330000, paid: 390000, out: 60000, cat: "", colorCat: "", debt: "0" },
      { name: "Dinah Namwano Mary", cls: "P.3", paycode: "1003307679", phone: "752818987", due: 330000, paid: 540000, out: 210000, cat: "van user", colorCat: "", debt: "0" },
      { name: "Nakawooya Swabrah", cls: "P.3", paycode: "1006613665", phone: "", due: 0, paid: 0, out: 0, cat: "plus lunch", colorCat: "", debt: "0" },
      { name: "Bineme Johnson bosco Jacob", cls: "P.3", paycode: "1006831724", phone: "", due: 310000, paid: 0, out: -360000, cat: "", colorCat: "", debt: "0" },
      { name: "Poni Divine", cls: "P.3", paycode: "1006959658", phone: "", due: 330000, paid: 330000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Atuheire Harmony Beatrice", cls: "P.3", paycode: "1007019895", phone: "", due: 170000, paid: 100000, out: 0, cat: "van user", colorCat: "", debt: "0" },
      { name: "Philiberta Larisa Alla Wasagali", cls: "P.3", paycode: "1006836474", phone: "", due: 310000, paid: 330000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Naiga Sheillah", cls: "P.3", paycode: "1007278529", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Nabangi Ronald", cls: "P.3", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "van user", colorCat: "blue =GA", debt: "0" },
      { name: "Walter Tumukunde", cls: "P.3", paycode: "1008698601", phone: "", due: 460000, paid: 460000, out: 0, cat: "dyna bal50000", colorCat: "", debt: "0" },
      { name: "Chrispas Bajja", cls: "P.3", paycode: "1008704587", phone: "", due: 310000, paid: 211000, out: 0, cat: "EMBROIDERY", colorCat: "", debt: "0" },
      { name: "Namukone Gloria", cls: "P.3", paycode: "1008878201", phone: "", due: 170000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namuwaya Biyonce", cls: "P.3", paycode: "1008878377", phone: "", due: 170000, paid: 170000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nahabwe Precious", cls: "P.3", paycode: "1009035618", phone: "", due: 470000, paid: 200000, out: 305000, cat: "boarding", colorCat: "307000", debt: "0" },
      { name: "Giduno Linus Wagama", cls: "P.3", paycode: "100888871", phone: "", due: 280000, paid: 150000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Amuria Melody muwanguzi", cls: "P.3", paycode: "", phone: "", due: 310000, paid: 300000, out: 0, cat: "van user", colorCat: "", debt: "0" },
      { name: "Farish Akaruhanga", cls: "P.3", paycode: "1010509300", phone: "", due: 310000, paid: 140000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namatovu liz Nestine", cls: "p.3", paycode: "1010668353", phone: "", due: 275000, paid: 225000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nakirya Kautharah", cls: "p.3", paycode: "", phone: "", due: 310000, paid: 300000, out: 100000, cat: "", colorCat: "", debt: "0" },
      { name: "NAMAGANDA MERISHA", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Joy Katiti Cynthia", cls: "P.4", paycode: "1004824716", phone: "706948165", due: 450000, paid: 450000, out: 0, cat: "", colorCat: "e", debt: "0" },
      { name: "Bagyenzi Benjamin", cls: "P.4", paycode: "1004900361", phone: "750002200", due: 355000, paid: 355000, out: 0, cat: "reported in march in boarding", colorCat: "", debt: "0" },
      { name: "Janet Mercy Babirye", cls: "P.4", paycode: "1004637127", phone: "753534870", due: 630000, paid: 630000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namele Joyce Rose", cls: "P.4", paycode: "1003257666", phone: "774564868", due: 415000, paid: 415000, out: 0, cat: "", colorCat: "#REF!", debt: "0" },
      { name: "Mugerwa Samantha", cls: "P.4", paycode: "1004676770", phone: "742472927", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Veronica Wanyana", cls: "P.4", paycode: "1004722926", phone: "706575416", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Abigail Nassali Immaculate", cls: "P.4", paycode: "1005503844", phone: "753640782", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Tosuma Charles Jacob", cls: "P.4", paycode: "10068317216", phone: "", due: 335000, paid: 0, out: -335000, cat: "", colorCat: "", debt: "0" },
      { name: "Nanyonga Precious Kiwanuka", cls: "P.4", paycode: "1008730723", phone: "", due: 300000, paid: 300000, out: 0, cat: "discount", colorCat: "", debt: "0" },
      { name: "Nakayiza Rehemah", cls: "P.4", paycode: "1003308684", phone: "", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Agongo Specioza", cls: "P.4", paycode: "", phone: "", due: 80000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Amoding Destiny Muwanguzi", cls: "P.4", paycode: "", phone: "", due: 335000, paid: 310000, out: 0, cat: "", colorCat: "van", debt: "0" },
      { name: "Namatta Faith |patricia", cls: "P.4", paycode: "", phone: "", due: 290000, paid: 290000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Twabalyaki Peter", cls: "p.4", paycode: "", phone: "", due: 630000, paid: 630000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "kyeyune Genesis", cls: "p.4", paycode: "", phone: "", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Atayi Vivian", cls: "p.4", paycode: "", phone: "", due: 325000, paid: 325000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kuteesa Joyce", cls: "p.4", paycode: "", phone: "", due: 325000, paid: 325000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "RUKUNDO SHERINA", cls: "p.4", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "PRIMARY FIVE", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Josiah Kiyimba", cls: "P.5", paycode: "1001865564", phone: "776727575", due: 330000, paid: 330000, out: 0, cat: "nakyanzi", colorCat: "", debt: "0" },
      { name: "Maraka Carina Rubby", cls: "P.5", paycode: "1002419494", phone: "752246215", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Aleysha Alice Ssemakula", cls: "P.5", paycode: "1003547898", phone: "757211677", due: 80000, paid: 80000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kirabo Angel", cls: "P.5", paycode: "1003321623", phone: "789426721", due: 355000, paid: 355000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Hannah Adriel Bugwata", cls: "P.5", paycode: "1002433736", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Melisa Nagadya", cls: "P.5", paycode: "1003547899", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Victorious Okidi Wairimu", cls: "P.5", paycode: "1003547889", phone: "779523726", due: 67000, paid: 67000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Kaana Shilla", cls: "P.5", paycode: "1003547903", phone: "759611414", due: 67000, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Kyeswa Ronald", cls: "P.5", paycode: "", phone: "779518339", due: 300000, paid: 300000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ddamba Calvin", cls: "P.5", paycode: "1004024843", phone: "700898394", due: 108000, paid: 0, out: 58000, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Angel Nanfuka Nabakiibi", cls: "P.5", paycode: "1004715192", phone: "704855095", due: 630000, paid: 630000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Namugabi Nisha", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Benjamin Omu", cls: "P.5", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Namaganda Prossy", cls: "P.5", paycode: "1007278329", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Wasswa Denis Nsamba", cls: "P.5", paycode: "1007278816", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Matovu Douglas Kato", cls: "P.5", paycode: "1007277212", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Birungi Patience Nasaazi", cls: "P.5", paycode: "0", phone: "", due: 0, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Sam Mukisa Membe", cls: "P.5", paycode: "1003547928", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Akram Gift- Lwanga", cls: "P.5", paycode: "1003547943", phone: "", due: 67000, paid: 0, out: 67000, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Kwagala Lily Victor", cls: "P.5", paycode: "1006963789", phone: "", due: 165000, paid: 165000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nanyange Angel Kiwanuka", cls: "P.5", paycode: "1008730744", phone: "", due: 300000, paid: 300000, out: 0, cat: "discount", colorCat: "", debt: "0" },
      { name: "Nyonyintono Raaiz", cls: "P.5", paycode: "", phone: "", due: 500000, paid: 500000, out: 0, cat: "discount aunt p", colorCat: "", debt: "0" },
      { name: "Nansubuga Pretty", cls: "P.5", paycode: "", phone: "", due: 630000, paid: 0, out: -670000, cat: "", colorCat: "", debt: "0" },
      { name: "ISANKA FRANK", cls: "P.5", paycode: "", phone: "", due: 280000, paid: 130000, out: 0, cat: "INGRIDIENTS 180K", colorCat: "", debt: "0" },
      { name: "Kasowole Hairat", cls: "p.5", paycode: "", phone: "", due: 550000, paid: 550000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "PRIMARY SIX", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kisakye Jonathan", cls: "P.6", paycode: "1003939786", phone: "705362439", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Sharifah Nanyanzi", cls: "P.6", paycode: "1003547922", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ssemakula Wilson", cls: "P.6", paycode: "1002543108", phone: "752674473", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Christiano Kayabula", cls: "P.6", paycode: "1004004316", phone: "772924737", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Apollo Ssewanyana", cls: "P.6", paycode: "1001865576", phone: "706948165", due: 450000, paid: 450000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Destiny - Mukisa", cls: "P.6", paycode: "1003547927", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "David Mugarula", cls: "P.6", paycode: "1003547935", phone: "753743543", due: 67000, paid: 60000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Joshua Mugabo", cls: "P.6", paycode: "1003547938", phone: "759611414", due: 67000, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Kevin Kuguma", cls: "P.6", paycode: "1003547933", phone: "757318075", due: 67000, paid: 30000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Kansaze Gloria", cls: "P.6", paycode: "1003285813", phone: "751424326", due: 335000, paid: 280000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nabutono Alphine", cls: "P.6", paycode: "1005475267", phone: "706981286", due: 500000, paid: 500000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Namikka Joeline", cls: "P.6", paycode: "1007107172", phone: "", due: 355000, paid: 250000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Humphfrey Imamut Bahat", cls: "P.6", paycode: "1008697339", phone: "", due: 630000, paid: 250000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Muhanguzi Drake", cls: "P.6", paycode: "1008448851", phone: "", due: 500000, paid: 400000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Wanyenze Joan", cls: "P.6", paycode: "", phone: "", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nowamani Aaron", cls: "P.6", paycode: "1009035686", phone: "", due: 480000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Buzare Alice", cls: "P.6", paycode: "1008698626", phone: "", due: 690000, paid: 630000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Bataringaya leon", cls: "P.6", paycode: "", phone: "", due: 570000, paid: 400000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "mumbejja takizilati", cls: "p.6", paycode: "", phone: "", due: 380000, paid: 265000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Melvin Nsubuga", cls: "p.6", paycode: "", phone: "", due: 285000, paid: 100000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Marvin Nsubuga", cls: "p.6", paycode: "", phone: "", due: 285000, paid: 100000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Mutabaazi Shifurah", cls: "P.7", paycode: "1003291547", phone: "782956628", due: 435000, paid: 300000, out: 0, cat: "cleared medical", colorCat: "", debt: "0" },
      { name: "Shabirah Isabella Nabakiibi", cls: "P.7", paycode: "1005379075", phone: "708531444", due: 315000, paid: 135000, out: 85000, cat: "", colorCat: "", debt: "0" },
      { name: "Nakawunde Celine", cls: "P.7", paycode: "1004024811", phone: "700898394", due: 217000, paid: 60000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Maraka Tamara Fahima", cls: "P.7", paycode: "1002419485", phone: "752246215", due: 335000, paid: 335000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Waithera Praise Okidi", cls: "P.7", paycode: "1003175525", phone: "755314299", due: 236000, paid: 236000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Prossy Patrah Nagita", cls: "P.7", paycode: "1001865586", phone: "", due: 580000, paid: 580000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Rahuman Kyobe", cls: "P.7", paycode: "1003547952", phone: "", due: 450000, paid: 300000, out: 135000, cat: "cleared medical", colorCat: "", debt: "0" },
      { name: "Alvin Atuhire", cls: "P.7", paycode: "1003547956", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Anitah- Otm Kobusinge", cls: "P.7", paycode: "1003547961", phone: "", due: 150000, paid: 30000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Anorld- Otm Tumukunde", cls: "P.7", paycode: "1003547964", phone: "", due: 150000, paid: 30000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Gerald Bumba", cls: "P.7", paycode: "1003547950", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Regan Okir", cls: "P.7", paycode: "1003547954", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Ashim Mabonga", cls: "P.7", paycode: "1003547980", phone: "756342797", due: 318000, paid: 0, out: 98000, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Itamba Fortunate", cls: "P.7", paycode: "1003547957", phone: "754165864", due: 67000, paid: 67000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Fahim Kyeyune", cls: "P.7", paycode: "1003547953", phone: "704234684", due: 630000, paid: 350000, out: 0, cat: "discount board", colorCat: "", debt: "0" },
      { name: "Pius Muwumba", cls: "P.7", paycode: "1003547965", phone: "", due: 150000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Gether Okasu Ochola", cls: "P.7", paycode: "1005517049", phone: "704715330", due: 860000, paid: 300000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nakajja Tahira Tarah", cls: "P.7", paycode: "1006894127", phone: "", due: 690000, paid: 550000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "kiyimba Sharon", cls: "", paycode: "1007105160", phone: "", due: 530000, paid: 530000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Phillanda Amaria Nambafu", cls: "P.7", paycode: "1007940053", phone: "", due: 650000, paid: 650000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Nakazibwe Desire", cls: "P.7", paycode: "1007093281", phone: "", due: 110000, paid: 0, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Nambalirwa Celline", cls: "P.7", paycode: "1008474726", phone: "", due: 580000, paid: 0, out: 121000, cat: "", colorCat: "", debt: "0" },
      { name: "Lwanga Victor valen", cls: "P.7", paycode: "1008817341", phone: "", due: 580000, paid: 500000, out: 50000, cat: "", colorCat: "", debt: "0" },
      { name: "Mukula Robert Osany", cls: "P.7", paycode: "1008902598", phone: "", due: 500000, paid: 400000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Connoly twesigamukama", cls: "P.7", paycode: "1008971059", phone: "", due: 840000, paid: 400000, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Gift Nandudu", cls: "P.7", paycode: "1009121306", phone: "", due: 580000, paid: 580000, out: 0, cat: "boarding", colorCat: "", debt: "0" },
      { name: "Akiror Patricia", cls: "P.7", paycode: "", phone: "", due: 630000, paid: 335000, out: -300000, cat: "", colorCat: "", debt: "0" },
      { name: "Drileba Jacob", cls: "P.7", paycode: "", phone: "", due: 860000, paid: 810000, out: 30000, cat: "", colorCat: "", debt: "0" },
      { name: "Namaganda vanessa", cls: "p.7", paycode: "", phone: "", due: 70000, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
      { name: "Kajjimu Arthur", cls: "", paycode: "", phone: "", due: 0, paid: 0, out: 0, cat: "", colorCat: "", debt: "0" },
    ];

    realSpreadsheetData.forEach((row, idx) => {
      const learner: Learner = {
        id: 'real-stu-' + Date.now() + '-' + idx,
        name: row.name,
        cls: row.cls,
        admNo: 'OTEC/' + (1000 + idx),
        paycode: row.paycode,
        sex: 'Unknown' as 'Unknown',
        age: ''
      };
      data.learners.push(learner);

      let finalFeeTuition = row.due;
      let finalFeeBoarding = 0;
      let finalFeeVan = 0;
      
      // Boarding logic
      if (row.due === 630000) {
        learner.dayBoarding = 'Boarding';
        finalFeeTuition = 0;
        finalFeeBoarding = 630000;
        
        data.hostel.allocations.push({
          id: 'alloc-' + learner.id,
          learnerId: learner.id,
          dormitoryId: 'DORM-MAIN',
          roomId: 'RM-1',
          allocatedDate: new Date().toISOString()
        });
      }

      // Van logic
      if (row.cat.toLowerCase().includes('van')) {
        let extractedVanFee = parseInt(row.colorCat, 10);
        if (isNaN(extractedVanFee) || extractedVanFee <= 0) {
          extractedVanFee = 260000; 
        }
        
        finalFeeVan = extractedVanFee;
        finalFeeTuition -= extractedVanFee;
        if (finalFeeTuition < 0) finalFeeTuition = 0;
        
        data.transport.allocations.push({
          id: 'trans-' + learner.id,
          learnerId: learner.id,
          routeId: 'ROUTE-MAIN',
          zoneId: 'ZN-1',
          direction: 'Both',
          stopName: 'Default Stop',
          dateAssigned: new Date().toISOString()
        });
      }

      learner.feeTuition = finalFeeTuition;
      learner.feeBoarding = finalFeeBoarding;
      learner.feeVan = finalFeeVan;
      
      let calculatedBalance = row.due - row.paid;
      learner.outstandingBalance = (calculatedBalance).toString();

      if (row.paid > 0) {
        data.finances.push({
          id: 'ft-mig3-' + learner.id,
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          category: 'Fee Payment',
          amount: row.paid,
          studentId: learner.id,
          description: `FEES MIGRATION 3.0 - Historic Payment`,
          recordedBy: 'System Migration',
          paymentMethod: 'Cash',
          term: 'Term 2'
        });
      }
    });
  }
  


  if (data.learners) {
    data.learners = regenerateUNEBNumbers(data.learners);
  }

  return data;
}

export function normalizeLearnerClasses(data: AppData): AppData {
  if (!data || !data.learners) return data;
  
  data.learners = data.learners.map(l => {
    if (!l.cls) return { ...l, cls: 'P1' };
    const c = l.cls.toUpperCase().trim();
    let norm = c;
    if (c === 'PRIMARY 1' || c === 'P.1' || c === 'PRIMARY1') norm = 'P1';
    else if (c === 'PRIMARY 2' || c === 'P.2' || c === 'PRIMARY2') norm = 'P2';
    else if (c === 'PRIMARY 3' || c === 'P.3' || c === 'PRIMARY3') norm = 'P3';
    else if (c === 'PRIMARY 4' || c === 'P.4' || c === 'PRIMARY4') norm = 'P4';
    else if (c === 'PRIMARY 5' || c === 'P.5' || c === 'PRIMARY5') norm = 'P5';
    else if (c === 'PRIMARY 6' || c === 'P.6' || c === 'PRIMARY6') norm = 'P6';
    else if (c === 'PRIMARY 7' || c === 'P.7' || c === 'PRIMARY7') norm = 'P7';
    else if (c.includes('ZEBRA')) norm = 'ZEBRA';
    else if (c.includes('LION')) norm = 'LION';
    else if (c.includes('ELEPHANT')) norm = 'ELEPHANT';
    
    return { ...l, cls: norm };
  });

  return data;
}

// Singleton AppState inside module scope
let currentData: AppData = migrateLowerPrimarySubjects(getDemoData());
let activeUser: User | null = null;
let localActiveUser: any = null; // SystemUserAccount
let syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline' = 'offline';
let syncEnabled = localStorage.getItem('otec_sync_enabled') !== 'false'; // Defaults to true
let onStateChangeCallbacks: (() => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;
let customServerPollInterval: any = null;

// Load initial data from local storage
function loadFromLocal(): AppData {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    try {
      let parsed = JSON.parse(raw);
      // Basic validation
      if (parsed.learners && parsed.settings && parsed.scores) {
        parsed = migrateLowerPrimarySubjects(parsed);
        if (!parsed.finances) {
          parsed.finances = getDemoData().finances || [];
        }
        if (!parsed.security) {
          parsed.security = getDemoSecurityData();
        }
        if (!parsed.activityLog) {
          parsed.activityLog = [
            {
              id: 'init-1',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
              type: 'settings_modified',
              details: 'Initial school settings and academic parameters configured.',
              operator: 'System'
            },
            {
              id: 'init-2',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: 'data_imported',
              details: 'Imported demo dataset of registered student records.',
              operator: 'System'
            }
          ];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local data', e);
    }
  }
  
  const demo = getDemoData();
  demo.activityLog = [
    {
      id: 'init-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'settings_modified',
      details: 'Initial school settings and academic parameters configured.',
      operator: 'System'
    },
    {
      id: 'init-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'data_imported',
      details: 'Imported demo dataset of registered student records.',
      operator: 'System'
    }
  ];
  return demo;
}

// Global Client Session Identifier for multi-browser tab tracking
const TAB_CLIENT_ID = 'browser_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
let knownServerDbVersion = 0;
let hasLocalDirtyState = false;
let lastLocalMutationTime = 0;

let multiBrowserChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    multiBrowserChannel = new BroadcastChannel('otec_multi_browser_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel initialization skipped:', e);
}

// Function to broadcast changes to other browser windows/tabs
function broadcastDataChange(data: AppData) {
  try {
    const payload = {
      clientId: TAB_CLIENT_ID,
      timestamp: Date.now(),
      data
    };
    if (multiBrowserChannel) {
      multiBrowserChannel.postMessage(payload);
    }
    localStorage.setItem('otec_last_broadcast_ts', Date.now().toString());
  } catch (err) {
    console.warn('Failed to broadcast multi-browser change:', err);
  }
}

// Write to local storage (Asynchronous IndexedDB wrapper for speed)
async function saveToLocalAsync(data: AppData, modifiedKey?: keyof AppData) {
  saveToFileSystem(data).catch(console.error);

  try {
    if (modifiedKey) {
      await idb.set(modifiedKey, (data as any)[modifiedKey]);
    } else {
      for (const key of Object.keys(data)) {
        await idb.set(key, (data as any)[key]);
      }
    }
  } catch (e) {
    console.error('Failed to save to IndexedDB', e);
  }
}

function saveToLocal(data: AppData, skipBroadcast: boolean = false, modifiedKey?: keyof AppData) {
  // Fire and forget IndexedDB save (non-blocking)
  saveToLocalAsync(data, modifiedKey).catch(console.error);
  
  if (!skipBroadcast) {
    hasLocalDirtyState = true;
    lastLocalMutationTime = Date.now();
    broadcastDataChange(data);
  }
}

// Data is initialized via dataManager.initDB() asynchronously now
// currentData = loadFromLocal(); // REMOVED

// Restore local session if exists
try {
  const savedLocalSession = localStorage.getItem('otec_local_session');
  if (savedLocalSession) {
    localActiveUser = JSON.parse(savedLocalSession);
  }
} catch(e) {
  console.warn("Failed to restore local user session", e);
}

// Set up multi-browser listeners
if (typeof window !== 'undefined') {
  // 1. BroadcastChannel Listener (Instant same-domain tab-to-tab sync)
  if (multiBrowserChannel) {
    multiBrowserChannel.onmessage = (event) => {
      if (event.data && event.data.clientId !== TAB_CLIENT_ID && event.data.data) {
        console.log(`Received real-time update from secondary browser session (${event.data.clientId}).`);
        let incomingData = event.data.data as AppData;
        incomingData = migrateLowerPrimarySubjects(incomingData);
        
        const incomingStr = JSON.stringify(incomingData);
        const localStr = JSON.stringify(currentData);
        if (incomingStr !== localStr) {
          // Detect dirty state conflict
          if (hasLocalDirtyState) {
            console.warn('Multi-browser concurrency conflict detected! Local session has dirty unsaved state.');
            window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
              detail: {
                localData: JSON.parse(JSON.stringify(currentData)),
                incomingData,
                sourceName: `Secondary Browser Session (${event.data.clientId.slice(0, 12)}...)`,
                timestamp: new Date().toLocaleTimeString()
              }
            }));
            window.dispatchEvent(new CustomEvent('otec-toast', {
              detail: {
                message: 'Multi-Browser Concurrency Conflict: Simultaneous edits detected from secondary browser window! Side-by-side prompt opened.',
                type: 'warning'
              }
            }));
          } else {
            currentData = incomingData;
            saveToLocal(currentData, true); // Save locally without re-broadcasting back
            dataManager.triggerUpdate();

            window.dispatchEvent(new CustomEvent('otec-toast', {
              detail: {
                message: 'Multi-Browser Live Sync: Database synchronized with real-time edits from secondary browser window!',
                type: 'info'
              }
            }));
          }
        }
      }
    };
  }

  // 2. LocalStorage Event Listener (Fallback across tabs/windows)
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY || e.key === 'otec_last_broadcast_ts') {
      const freshData = loadFromLocal();
      const freshStr = JSON.stringify(freshData);
      const localStr = JSON.stringify(currentData);
      if (freshStr !== localStr) {
        if (hasLocalDirtyState) {
          console.warn('LocalStorage event detected dirty state concurrency conflict.');
          window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
            detail: {
              localData: JSON.parse(JSON.stringify(currentData)),
              incomingData: freshData,
              sourceName: 'Secondary Tab (LocalStorage Event)',
              timestamp: new Date().toLocaleTimeString()
            }
          }));
        } else {
          console.log('Storage event detected data mutation from another browser tab.');
          currentData = freshData;
          dataManager.triggerUpdate();

          window.dispatchEvent(new CustomEvent('otec-toast', {
            detail: {
              message: 'Multi-Browser Sync: Changes updated across browser tabs.',
              type: 'info'
            }
          }));
        }
      }
    }
  });

  // 3. Tab Visibility Listener (Refresh from server whenever returning to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerDbVersion();
    }
  });

  // Periodic Background Polling for real-time cloud & multi-browser synchronization
  setInterval(() => {
    // Firestore handles real-time polling natively
  }, 3000);
}

// Check server DB version for changes made by different browsers/devices
async function checkServerDbVersion() {
  // Replaced by Firestore Realtime Sync
}

// Helper to save state to server workspace
async function saveToCloud(data: AppData) {
  if (syncBackend === 'custom') {
    try {
      await fetch(`${customServerUrl.replace(/\/$/, '')}/api/sync/${activeUser?.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      syncStatus = 'synced';
    } catch (e) {
      syncStatus = 'error';
    }
    dataManager.triggerUpdate();
    return true;
  }
  // Default to Firestore
  return true;
}

// Helper to load state from server workspace
async function loadFromWorkspaceServer(forceApply: boolean = false) {
  // Replaced by Firestore
  return false;
}

// Real-time Firestore Sync Listener helper
function setupRealtimeListener(user: User) {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  
  if (syncBackend === 'custom') {
    if (customServerPollInterval) clearInterval(customServerPollInterval);
    // Poll the custom LAN server every 10 seconds
    customServerPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${customServerUrl.replace(/\/$/, '')}/api/sync/${user.uid}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.data && Object.keys(resData.data).length > 0) {
            const str = JSON.stringify(resData.data);
            if (str !== lastSyncedDataHash) {
              currentData = migrateLowerPrimarySubjects(resData.data as AppData);
              saveToLocal(currentData, false);
              lastSyncedDataHash = str;
              dataManager.triggerUpdate();
            }
            syncStatus = 'synced';
            dataManager.triggerUpdate();
          }
        }
      } catch (e) {
        syncStatus = 'offline';
        dataManager.triggerUpdate();
      }
    }, 10000);
    return;
  }

  if (!syncEnabled) return;
  
  const userDocRef = doc(db, 'schools', user.uid, 'data', 'appState');
  unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
    if (!syncEnabled) return;
    
    // Ignore local updates before they hit the cloud
    if (docSnap.metadata.hasPendingWrites) {
      return;
    }
    
    if (docSnap.exists()) {
      let cloudData = docSnap.data() as AppData;
      cloudData = migrateLowerPrimarySubjects(cloudData);
      
      const cloudDataStr = JSON.stringify(cloudData);
      const currentDataStr = JSON.stringify(currentData);
      if (cloudDataStr !== currentDataStr) {
        console.log('Real-time sync: Received update from another device/browser.');
        if (hasLocalDirtyState) {
          window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
            detail: {
              localData: JSON.parse(JSON.stringify(currentData)),
              incomingData: cloudData,
              sourceName: 'Firebase Firestore Cloud Database',
              timestamp: new Date().toLocaleTimeString()
            }
          }));
        } else {
          currentData = cloudData;
          hasLocalDirtyState = false;
          saveToLocal(currentData, true);
          dataManager.triggerUpdate();
          
          // Notify user
          window.dispatchEvent(new CustomEvent('otec-modal-notify', {
            detail: {
              title: 'Live Sync Applied',
              message: 'Your school database was automatically updated with real-time changes from another browser.',
              type: 'success',
              timestamp: new Date().toLocaleString()
            }
          }));
        }
      }
    }
  }, (error: any) => {
    const isOffline = error && (error.code === 'unavailable' || error.message?.toLowerCase().includes('offline') || !navigator.onLine);
    if (isOffline) {
      console.info('Real-time sync snapshot listener suspended: Device offline.');
    } else {
      console.error('Real-time snapshot sync error:', error);
    }
  });
}

// Helper to recursively remove or replace undefined values for Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result;
}

function getStudentTotalTermFees(student: Learner, settings: SchoolSettings): number {
  const hasDetailedFees = student.feeTuition !== undefined ||
                          student.feeBoarding !== undefined ||
                          student.feeVan !== undefined ||
                          student.feeRegistration !== undefined ||
                          student.feeSweater !== undefined ||
                          student.feeClassUniform !== undefined ||
                          student.feeSportsWear !== undefined ||
                          student.feeHair !== undefined ||
                          student.feeHoliday !== undefined ||
                          student.feeOthers !== undefined;

  if (hasDetailedFees) {
    return (student.feeTuition ?? 0) +
           (student.feeBoarding ?? 0) +
           (student.feeVan ?? 0) +
           (student.feeRegistration ?? 0) +
           (student.feeSweater ?? 0) +
           (student.feeClassUniform ?? 0) +
           (student.feeSportsWear ?? 0) +
           (student.feeHair ?? 0) +
           (student.feeHoliday ?? 0) +
           (student.feeOthers ?? 0);
  }

  // Fallback to settings defaults
  let tuition = settings.feeTuitionLower ?? 310000;
  const clsName = (student.cls || '').toUpperCase();
  if (['ZEBRA', 'LION', 'ELEPHANT', 'NURSERY', 'BABY', 'MIDDLE', 'PRE-PRIMARY', 'PREPRIMARY', 'KINDERGARTEN'].some(prefix => clsName.includes(prefix))) {
    tuition = settings.feeTuitionNursery ?? 290000;
  } else if (['P4', 'P5', 'P6', 'P7'].some(prefix => clsName.includes(prefix))) {
    tuition = settings.feeTuitionUpper ?? 335000;
  }

  const isBoarder = (student.dayBoarding || '').toLowerCase().includes('board');
  const boardingFee = isBoarder ? (settings.feeBoarding ?? 630000) : 0;
  const regFee = settings.feeRegistration ?? 20000;
  const sweaterFee = settings.feeSweater ?? 50000;
  const classUniformFee = settings.feeClassUniform ?? 50000;
  const sportsFee = settings.feeSportsWear ?? 70000;
  const hairFee = settings.feeHair ?? 5000;
  const holidayFee = settings.feeHoliday ?? 5000;
  const otherFee = settings.feeOthers ?? 0;
  const vanFee = 0;

  return tuition + boardingFee + regFee + sweaterFee + classUniformFee + sportsFee + hairFee + holidayFee + otherFee + vanFee;
}

const formatUGXLocal = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

export const dataManager = {
  // Initialize Database from IndexedDB (or fallback to old localStorage)
  async initDB(): Promise<AppData> {
    const keys = [
      'learners', 'scores', 'psychomotor', 'comments', 'settings', 'activityLog', 'auditLogs',
      'finances', 'security', 'transport', 'library', 'inventory', 'hostel',
      'timetable', 'clinic', 'discipline', 'extracurricular', 'hr', 'admissions',
      'procurement', 'communications'
    ];
    
    let data: Partial<AppData> = {};
    let isNew = true;
    
    try {
      for (const key of keys) {
        const val = await idb.get(key);
        if (val !== undefined) {
          (data as any)[key] = val;
          isNew = false;
        }
      }
    } catch (e) {
      console.warn('IndexedDB read failed, falling back', e);
    }

    if (isNew) {
      // Migrate from localStorage if exists
      console.log('Migrating from localStorage to IndexedDB...');
      const fsData = await loadFromFileSystem();
      data = fsData || loadFromLocal();
      await saveToLocalAsync(data as AppData);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // Ensure all top-level keys exist by merging with a fresh demo object
    const demoFallback = getDemoData();
    const safeData = { ...demoFallback, ...data } as AppData;

    // Specifically deep-merge settings because it contains critical nested config like authConfig and sections
    if (data.settings) {
      safeData.settings = { ...demoFallback.settings, ...data.settings };
      // Deep merge sections specifically
      if (data.settings.sections) {
        safeData.settings.sections = { ...demoFallback.settings.sections, ...data.settings.sections };
      } else {
        safeData.settings.sections = demoFallback.settings.sections;
      }
      // Ensure examSets exists
      if (!data.settings.examSets) {
        safeData.settings.examSets = demoFallback.settings.examSets;
      }
    }

    // Migrate generic timetable teacher IDs to real staff IDs
    const genericTeacherMapping: Record<string, string> = {
      'T1': 'staff_8', // Okello Joseph
      'T2': 'staff_7', // Babirye Justine
      'T3': 'staff_22', // Onyango Geofrey
      'T4': 'staff_21', // Abago Santa
      'T5': 'staff_16', // Mweru Gonzaga
      'T6': 'staff_2', // Kimera Joy
      'T7': 'staff_4', // Nasangha Nimulod
      'T8': 'staff_3', // Nambirige Norah
      'T9': 'staff_5', // Nannozi Winnie
      'T10': 'staff_12', // Namazzi Brenda
      'T11': 'staff_11', // Katulinde Lilian
      'T12': 'staff_9', // Nakimera Justine
      'T13': 'staff_10' // Nabatanzi Annet
    };

    if (safeData.timetable && safeData.timetable.slots) {
      safeData.timetable.slots = safeData.timetable.slots.map(slot => {
        if (slot.teacherId && genericTeacherMapping[slot.teacherId]) {
          return { ...slot, teacherId: genericTeacherMapping[slot.teacherId] };
        }
        return slot;
      });
    }

    currentData = normalizeLearnerClasses(migrateLowerPrimarySubjects(safeData));
    return currentData;
  },

  // Get current state
  getData(): AppData {
    return currentData;
  },

  // Set the full state
  setData(newData: AppData) {
    currentData = normalizeLearnerClasses(migrateLowerPrimarySubjects(newData));
    saveToLocal(currentData);
    this.triggerUpdate();
    this.syncWithCloud();
  },

  // Add a system log entry
  addActivityLog(type: ActivityLog['type'], details: string, operator?: string) {
    if (!currentData.activityLog) {
      currentData.activityLog = [];
    }
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      type,
      details,
      operator: operator || (activeUser?.email ? activeUser.email.split('@')[0] : 'Teacher')
    };
    currentData.activityLog = [newLog, ...currentData.activityLog].slice(0, 50); // Keep last 50 entries
    saveToLocal(currentData);
    this.triggerUpdate();
    this.syncWithCloud();
  },

  // Modify specific aspects
  saveAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName'>) {
    if (!currentData.auditLogs) {
      currentData.auditLogs = [];
    }
    const newLog: AuditLog = {
      id: 'audit-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      userId: activeUser?.uid || 'system',
      userName: activeUser?.displayName || activeUser?.email || 'System Admin',
      ...log
    };
    currentData.auditLogs = [newLog, ...currentData.auditLogs].slice(0, 1000); // Keep last 1000 entries
    saveToLocal(currentData, false, 'auditLogs');
    this.triggerUpdate();
    this.syncWithCloud(true, 'audit_logged', 'auditLogs');
  },

  updateVendors(vendors: Vendor[]) {
    currentData.vendors = vendors;
    saveToLocal(currentData, false, 'vendors');
    this.triggerUpdate();
    this.syncWithCloud(true, 'vendors_updated', 'vendors');
  },

  updateVendorInvoices(invoices: VendorInvoice[]) {
    currentData.vendorInvoices = invoices;
    saveToLocal(currentData, false, 'vendorInvoices');
    this.triggerUpdate();
    this.syncWithCloud(true, 'vendorInvoices_updated', 'vendorInvoices');
  },

  updateRequisitions(requisitions: PettyCashRequisition[]) {
    currentData.requisitions = requisitions;
    saveToLocal(currentData, false, 'requisitions');
    this.triggerUpdate();
    this.syncWithCloud(true, 'requisitions_updated', 'requisitions');
  },

  updateSettings(settings: SchoolSettings) {
    currentData.settings = settings;
    saveToLocal(currentData, false, 'settings');
    this.triggerUpdate();
    this.syncWithCloud(true, 'settings_updated', 'settings');
    this.addActivityLog('settings_modified', `School configurations updated for term ${settings.term} (${settings.schoolName}).`);
  },

  updateStaffAttendance(records: StaffAttendanceRecord[]) {
    currentData.staffAttendance = records;
    saveToLocal(currentData, false, 'staffAttendance');
    this.triggerUpdate();
    this.syncWithCloud(true, 'staff_attendance_updated', 'staffAttendance');
    this.addActivityLog('staff_attendance_modified', `Staff attendance records were updated (${records.length} total records).`);
  },

  updateLearners(learners: Learner[]) {
    // Keep a map of previous outstanding balances of existing learners
    const prevBalances = new Map<string, number>();
    currentData.learners.forEach(l => {
      prevBalances.set(l.id, parseFloat(l.outstandingBalance || '0'));
    });

    // Save the new learners
    currentData.learners = regenerateUNEBNumbers(learners);
    saveToLocal(currentData, false, 'learners');
    this.triggerUpdate();
    this.syncWithCloud(true, 'learners_updated', 'learners');

    // Check for students whose balance fell below 20% of total term fees
    currentData.learners.forEach(student => {
      const prevBal = prevBalances.get(student.id);
      const newBal = parseFloat(student.outstandingBalance || '0');
      
      const totalFees = getStudentTotalTermFees(student, currentData.settings);
      const threshold = 0.20 * totalFees;

      // Condition: transition from >= 20% to < 20% of total fees
      if (prevBal !== undefined && prevBal >= threshold && newBal < threshold) {
        window.dispatchEvent(new CustomEvent('otec-toast', {
          detail: {
            message: `Student Balance Notice: ${student.name}'s remaining arrears (${formatUGXLocal(newBal)}) has fallen below 20% of their total term fees (${formatUGXLocal(totalFees)}).`,
            type: 'info'
          }
        }));
      }
    });
  },

  updateScores(compositeKey: string, scoreRecord: ScoreRecord) {
    currentData.scores[compositeKey] = scoreRecord;
    
    // Immediate validation check for invalid mark ranges (0-100)
    if (scoreRecord && typeof scoreRecord === 'object') {
      Object.entries(scoreRecord).forEach(([subject, val]) => {
        if (val !== undefined && val !== null && (val as any) !== '') {
          const num = Number(val);
          if (isNaN(num) || num < 0 || num > 100) {
            const [learnerId] = compositeKey.split('|');
            const learner = (currentData.learners || []).find(l => l.id === learnerId);
            const learnerName = learner ? learner.name : 'Learner';

            window.dispatchEvent(
              new CustomEvent('otec-modal-notify', {
                detail: {
                  title: '⚠️ Invalid Mark Range Detected',
                  message: `Invalid mark "${val}" entered for ${learnerName} in ${subject}. Marks must be between 0 and 100.`,
                  type: 'error',
                  timestamp: new Date().toLocaleTimeString()
                }
              })
            );
          }
        }
      });
    }

    saveToLocal(currentData, false, 'scores');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'scores');
  },

  updatePsychomotor(compositeKey: string, psychoRecord: PsychomotorRecord) {
    currentData.psychomotor[compositeKey] = psychoRecord;
    saveToLocal(currentData, false, 'psychomotor');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'psychomotor');
  },

  updateComments(compositeKey: string, commentRecord: CommentRecord) {
    currentData.comments[compositeKey] = commentRecord;
    saveToLocal(currentData, false, 'comments');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'comments');
  },

  updateFinances(finances: FinanceTransaction[]) {
    currentData.finances = finances;
    saveToLocal(currentData, false, 'finances');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'finances');
  },

  updateBankAccounts(bankAccounts: BankAccount[]) {
    currentData.bankAccounts = bankAccounts;
    saveToLocal(currentData, false, 'bankAccounts');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'bankAccounts');
  },

  updateBankTransfers(bankTransfers: BankTransfer[]) {
    currentData.bankTransfers = bankTransfers;
    saveToLocal(currentData, false, 'bankTransfers');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'bankTransfers');
  },


  updateSecurityData(security: SecurityData) {
    currentData.security = security;
    saveToLocal(currentData, false, 'security');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'security');
  },

  updateTransportData(transport: TransportData) {
    currentData.transport = transport;
    saveToLocal(currentData, false, 'transport');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'transport');
  },

  updateLibraryData(library: LibraryData) {
    currentData.library = library;
    saveToLocal(currentData, false, 'library');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'library');
  },

  updateInventoryData(inventory: InventoryData) {
    currentData.inventory = inventory;
    saveToLocal(currentData, false, 'inventory');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'inventory');
  },

  updateHostelData(hostel: HostelData) {
    currentData.hostel = hostel;
    saveToLocal(currentData, false, 'hostel');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'hostel');
  },

  updateTimetableData(timetable: TimetableData) {
    currentData.timetable = timetable;
    saveToLocal(currentData, false, 'timetable');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'timetable');
  },

  updateClinicData(clinic: ClinicData) {
    currentData.clinic = clinic;
    saveToLocal(currentData, false, 'clinic');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'clinic');
  },

  updateDisciplineData(discipline: DisciplineData) {
    currentData.discipline = discipline;
    saveToLocal(currentData, false, 'discipline');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'discipline');
  },

  updateExtracurricularData(extracurricular: ExtracurricularData) {
    currentData.extracurricular = extracurricular;
    saveToLocal(currentData, false, 'extracurricular');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'extracurricular');
  },

  updateAdmissionsData(admissions: AdmissionsData) {
    currentData.admissions = admissions;
    saveToLocal(currentData, false, 'admissions');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'admissions');
  },

  updateProcurementData(procurement: ProcurementData) {
    currentData.procurement = procurement;
    saveToLocal(currentData, false, 'procurement');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'procurement');
  },

  updateCommunicationsData(communications: CommunicationsData) {
    currentData.communications = communications;
    saveToLocal(currentData, false, 'communications');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'communications');
  },

  // Clear everything and load demo
  resetToDefaults() {
    currentData = getDemoData();
    saveToLocal(currentData, false, 'communications');
    this.addActivityLog('reset_defaults', 'Database cleared and reset to system demo defaults.');
  },

  // Wipe EVERYTHING to start fresh with real data
  wipeAllData() {
    currentData = {
      learners: [],
      scores: {},
      psychomotor: {},
      comments: {},
      settings: currentData.settings, // Keep settings like grading bands
      finances: [],
      security: { gateLogs: [], visitors: [], unknownAlerts: [], config: { gateState: 'Closed' as any, autoOpenForStudents: false, autoOpenForTeachers: false, notifyParentsOnEntry: false, notifyParentsOnExit: false, livenessDetectionEnabled: false, antiSpoofingEnabled: false, tailgatingAlarmEnabled: false, hikvisionCamConnected: false, zktecoScannerConnected: false, relayControllerOnline: false, activeGateName: 'Main Gate' } },
      transport: { routes: [], allocations: [], vans: [], fuelLogs: [], maintenanceLogs: [] },
      library: { books: [], issues: [] },
      inventory: { assets: [] },
      hostel: { dormitories: [], allocations: [] },
      timetable: { slots: [] },
      clinic: { records: {}, visits: [] },
      discipline: { incidents: [] },
      extracurricular: { clubs: [], memberships: [] }
    };
    saveToLocal(currentData, false, 'communications');
    this.addActivityLog('wipe_data', 'Database wiped clean for fresh real data entry.');
  },

  // State changes subscription
  subscribe(callback: () => void) {
    onStateChangeCallbacks.push(callback);
    return () => {
      onStateChangeCallbacks = onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  },

  triggerUpdate() {
    onStateChangeCallbacks.forEach(cb => cb());
  },

  getSyncStatus() {
    if (!syncEnabled) return 'offline';
    return syncStatus;
  },

  getLastSyncedTime() {
    return localStorage.getItem('otec_last_synced') || null;
  },

  getActiveUser() {
    return activeUser;
  },

  getLocalActiveUser() {
    return localActiveUser;
  },

  setLocalActiveUser(user: any) {
    localActiveUser = user;
    if (user) {
      localStorage.setItem('otec_local_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('otec_local_session');
    }
    this.triggerUpdate();
  },

  isSyncEnabled() {
    return syncEnabled;
  },

  setSyncEnabled(enabled: boolean) {
    syncEnabled = enabled;
    localStorage.setItem('otec_sync_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      if (activeUser) {
        setupRealtimeListener(activeUser);
      }
      syncStatus = 'syncing';
      this.triggerUpdate();
      this.syncWithCloud(false, 'data_mutation', 'communications');
    } else {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      syncStatus = 'offline';
      this.triggerUpdate();
    }
  },

  // Get latest sync performance metrics
  getLastSyncMetric(): SyncMetric {
    return lastSyncMetrics;
  },

  getSyncHistory(): SyncMetric[] {
    return syncMetricsHistory;
  },

  async forceSync() {
    return this.syncWithCloud(true, 'manual_force', 'communications');
  },

  // Dirty State Management
  isDirty() {
    return hasLocalDirtyState;
  },

  markDirty() {
    hasLocalDirtyState = true;
    lastLocalMutationTime = Date.now();
  },

  clearDirty() {
    hasLocalDirtyState = false;
  },

  // Resolve multi-browser / cloud concurrency conflict
  resolveConflict(choice: 'local' | 'incoming' | 'merge', resolvedData?: AppData) {
    if (choice === 'local') {
      hasLocalDirtyState = false;
      saveToLocal(currentData, false, 'communications');
      this.syncWithCloud(true, 'conflict_resolve_local', 'communications');
    } else if (choice === 'incoming' && resolvedData) {
      hasLocalDirtyState = false;
      currentData = migrateLowerPrimarySubjects(resolvedData);
      saveToLocal(currentData, true, 'communications');
      this.triggerUpdate();
    } else if (choice === 'merge' && resolvedData) {
      hasLocalDirtyState = false;
      currentData = migrateLowerPrimarySubjects(resolvedData);
      saveToLocal(currentData, false, 'communications');
      this.triggerUpdate();
      this.syncWithCloud(true, 'conflict_resolve_merge', 'communications');
    }
  },

  // Simulate a multi-browser concurrency conflict with side-by-side modal
  simulateMultiBrowserConflict(sourceBrowserName: string = "Secondary Staff Terminal (Chrome)") {
    hasLocalDirtyState = true;
    const incomingData: AppData = JSON.parse(JSON.stringify(currentData));
    
    // Add a remote learner or remote score entry to create a realistic conflict
    if (!incomingData.learners) incomingData.learners = [];
    const simulatedRemoteLearner: Learner = {
      id: 'conflict-sim-' + Math.random().toString(36).slice(2, 7),
      admNo: 'OTEC/' + Math.floor(1000 + Math.random() * 8999),
      name: 'Simulated Remote Learner (' + sourceBrowserName.split(' ')[0] + ')',
      cls: incomingData.learners[0]?.cls || 'P.7',
      sex: 'Male',
      age: '12',
      outstandingBalance: '150000',
      guardianPhone: '+256700112233'
    };
    incomingData.learners = [simulatedRemoteLearner, ...incomingData.learners];

    window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
      detail: {
        localData: JSON.parse(JSON.stringify(currentData)),
        incomingData,
        sourceName: sourceBrowserName,
        timestamp: new Date().toLocaleTimeString()
      }
    }));

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Multi-Browser Concurrency Conflict Triggered: Opening side-by-side comparison modal!',
        type: 'warning'
      }
    }));
  },

  // Populate / Simulate changes coming from a secondary browser session
  simulateMultiBrowserMutation(sourceBrowserName: string = "Secondary Chrome Browser (Staff Terminal)") {
    if (!currentData.activityLog) currentData.activityLog = [];
    const simulatedLog: ActivityLog = {
      id: 'mb-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      type: 'scores_recorded',
      details: `Live scores and ledger data broadcast received from ${sourceBrowserName} (Session ID: ${TAB_CLIENT_ID.slice(0, 10)}...).`,
      operator: 'Remote User'
    };
    currentData.activityLog = [simulatedLog, ...currentData.activityLog].slice(0, 50);
    
    saveToLocal(currentData, false, 'communications');
    this.triggerUpdate();
    this.syncWithCloud(true, 'multi_browser_sim', 'communications');
    
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Multi-Browser Event Broadcasted: Live changes sent from ${sourceBrowserName}!`,
        type: 'success'
      }
    }));
  },

  // Sync state to Firebase Firestore & Workspace Cloud Server
  async syncWithCloud(force: boolean = false, triggerReason: string = 'data_mutation', modifiedKey?: keyof AppData) {
    if (!force && triggerReason !== 'app_close') {
      syncStatus = 'synced';
      this.triggerUpdate();
      return;
    }

    if (!syncEnabled) {
      syncStatus = 'offline';
      this.triggerUpdate();
      return;
    }

    const currentStr = JSON.stringify(currentData);
    const payloadKb = Math.round((new Blob([currentStr]).size / 1024) * 10) / 10;

    // Incremental check: sync ONLY if new data is entered in the browser (unless forced)
    if (!force && lastSyncedDataHash && currentStr === lastSyncedDataHash) {
      const cachedMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs: 0,
        payloadKb,
        status: 'cached',
        trigger: triggerReason,
        details: 'Sync skipped: Data unchanged in browser (cached)'
      };
      lastSyncMetrics = cachedMetric;
      syncStatus = 'synced';
      this.triggerUpdate();
      
      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: cachedMetric }));
      return;
    }

    const startTime = performance.now();

    try {
      syncStatus = 'syncing';
      this.triggerUpdate();

      // Always save to standard Workspace server storage
      saveToLocal(currentData, false, modifiedKey);

      // Silent clone to Google Drive if connected
      silentSyncToGoogleDrive(currentData).catch(err => {
        console.warn('Silent auto-sync to Google Drive deferred:', err);
      });

      if (activeUser) {
        if (syncBackend === 'custom') {
          let payloadToSync = currentData;
          if (modifiedKey) {
            payloadToSync = { ...currentData, [modifiedKey]: (currentData as any)[modifiedKey] };
          }
          await fetch(`${customServerUrl.replace(/\/$/, '')}/api/sync/${activeUser.uid}`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(sanitizeForFirestore(payloadToSync))
          });
        } else {
          const userDocRef = doc(db, 'schools', activeUser.uid, 'data', 'appState');
          if (modifiedKey) {
            await setDoc(userDocRef, { [modifiedKey]: sanitizeForFirestore((currentData as any)[modifiedKey]) }, { merge: true });
          } else {
            await setDoc(userDocRef, sanitizeForFirestore(currentData));
          }
        }
      }

      const durationMs = Math.round(performance.now() - startTime);
      lastSyncedDataHash = currentStr;
      
      const successMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs,
        payloadKb,
        status: 'synced',
        trigger: triggerReason,
        details: `Successfully synced ${payloadKb} KB in ${durationMs}ms`
      };

      lastSyncMetrics = successMetric;
      syncMetricsHistory = [successMetric, ...syncMetricsHistory].slice(0, 30);
      localStorage.setItem('otec_sync_metrics_history', JSON.stringify(syncMetricsHistory));

      syncStatus = 'synced';
      localStorage.setItem('otec_last_synced', new Date().toISOString());
      this.triggerUpdate();

      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: successMetric }));
    } catch (e: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isOffline = e && (e.code === 'unavailable' || e.message?.toLowerCase().includes('offline') || !navigator.onLine);
      
      const errorMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs,
        payloadKb,
        status: isOffline ? 'offline' : 'error',
        trigger: triggerReason,
        details: isOffline ? 'Device offline: Changes cached locally' : `Sync failed: ${e.message || 'Unknown network error'}`
      };

      lastSyncMetrics = errorMetric;
      syncMetricsHistory = [errorMetric, ...syncMetricsHistory].slice(0, 30);
      localStorage.setItem('otec_sync_metrics_history', JSON.stringify(syncMetricsHistory));

      if (isOffline) {
        console.info('Cloud sync deferred: Device is currently offline.');
        syncStatus = 'offline';
      } else {
        console.error('Error syncing with cloud', e);
        syncStatus = 'error';
      }
      this.triggerUpdate();

      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: errorMetric }));
    }
  },

  logAuditAction(
    moduleName: 'Finance' | 'Academics' | 'HR' | 'Security' | 'System' | 'Hostel' | 'Transport' | 'Library' | 'Inventory' | 'Admissions' | 'Communications' | 'Procurement',
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    recordId: string,
    details: string,
    previousValue?: any,
    newValue?: any
  ) {
    if (!currentData.auditLogs) currentData.auditLogs = [];
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      userId: activeUser?.uid || 'system',
      userName: activeUser?.displayName || activeUser?.email || 'System User',
      module: moduleName,
      action,
      recordId,
      details,
      previousValue,
      newValue
    };
    currentData.auditLogs = [newLog, ...currentData.auditLogs].slice(0, 1000); // Keep last 1000 entries
    saveToLocal(currentData, true, 'communications');
    this.triggerUpdate();
  },

  // Initialize Auth Listening
  initAuthListener() {
    // Load from workspace server on startup
    if (syncEnabled) {
      loadFromWorkspaceServer(true);

      // Silent Auto-restore from Google Drive if token is active
      autoRestoreFromGoogleDrive().then(driveData => {
        if (driveData && driveData.learners) {
          const migrated = migrateLowerPrimarySubjects(driveData);
          currentData = migrated;
          saveToLocal(currentData, false, 'communications');
          dataManager.triggerUpdate();
          
          window.dispatchEvent(new CustomEvent('otec-modal-notify', {
            detail: {
              title: 'Google Drive Auto-Restore',
              message: 'Restored latest cloud database backup from Google Drive automatically.',
              type: 'success',
              timestamp: new Date().toLocaleString()
            }
          }));
        }
      });
    }

    if (syncBackend === 'custom') {
      const customUserStr = localStorage.getItem('otec_custom_user');
      if (customUserStr) {
        const user = JSON.parse(customUserStr);
        activeUser = user;
        localStorage.removeItem('otec_manually_signed_out');
        
        if (syncEnabled) {
          syncStatus = 'syncing';
          this.triggerUpdate();
          setupRealtimeListener(user);
          
          (async () => {
            try {
              const res = await fetch(`${customServerUrl.replace(/\/$/, '')}/api/sync/${user.uid}`);
              if (res.ok) {
                const resData = await res.json();
                if (resData.data && Object.keys(resData.data).length > 0) {
                  let cloudData = resData.data as AppData;
                  cloudData = migrateLowerPrimarySubjects(cloudData);
                  currentData = cloudData;
                  saveToLocal(currentData, false, 'communications');
                  syncStatus = 'synced';
                  localStorage.setItem('otec_last_synced', new Date().toISOString());
                  this.triggerUpdate();
                }
              }
            } catch(e) {
              console.error('Custom Server offline', e);
              syncStatus = 'offline';
              this.triggerUpdate();
            }
          })();
        }
      }
      this.triggerUpdate();
      return; // Skip Firebase auth listener
    }

    onAuthStateChanged(auth, async (user) => {
      activeUser = user;
      if (user) {
        localStorage.removeItem('otec_manually_signed_out');
        
        if (syncEnabled) {
          syncStatus = 'syncing';
          this.triggerUpdate();
          setupRealtimeListener(user);

          try {
            const userDocRef = doc(db, 'schools', user.uid, 'data', 'appState');
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              // Load cloud state
              let cloudData = docSnap.data() as AppData;
              cloudData = migrateLowerPrimarySubjects(cloudData);
              currentData = cloudData;
              saveToLocal(currentData, false, 'communications');
              syncStatus = 'synced';
              localStorage.setItem('otec_last_synced', new Date().toISOString());
            } else {
              // Document doesn't exist in cloud, upload current local state
              currentData = migrateLowerPrimarySubjects(currentData);
              await setDoc(userDocRef, sanitizeForFirestore(currentData));
              syncStatus = 'synced';
              localStorage.setItem('otec_last_synced', new Date().toISOString());
            }
          } catch (e: any) {
            const isOffline = e && (e.code === 'unavailable' || e.code === 'failed-precondition' || e.message?.toLowerCase().includes('offline') || !navigator.onLine);
            if (isOffline) {
              console.info('Operating in offline mode. Local-first data will sync when connectivity is restored.');
              syncStatus = 'offline';
            } else {
              console.error('Error fetching user data from firestore', e);
              syncStatus = 'error';
            }
            this.triggerUpdate();
          }
        } else {
          syncStatus = 'offline';
        }
      } else {
        syncStatus = 'offline';
      }
      this.triggerUpdate();
    });
  }
};

// Function to flush and save updated database state when closing or leaving the app
function saveOnAppClose() {
  try {
    saveToLocal(currentData, true, 'communications');
    dataManager.syncWithCloud(true, 'app_close');
    // Firestore handles offline caching automatically on writes
    console.log('App closing: Updated data saved to local storage/Firestore offline cache.');
  } catch (err) {
    console.warn('App close save deferred:', err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', saveOnAppClose);
  window.addEventListener('pagehide', saveOnAppClose);
}

// Initialize auth listener and sync state on initial page load
dataManager.initAuthListener();
loadFromWorkspaceServer(true);

export default dataManager;
export { activeUser, syncStatus, saveOnAppClose };
