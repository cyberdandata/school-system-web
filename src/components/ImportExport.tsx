import { useAppStore } from "../store/useAppStore";
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AppData, Learner, ScoreRecord, FinanceTransaction } from '../types';
import { ALL_CLASSES, sectionKeyOfClass } from '../lib/defaults';
import dataManager from '../lib/db';
import BackupManager from './BackupManager';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  FileDown, 
  HelpCircle,
  RefreshCw,
  Sparkles,
  X,
  Info,
  BookOpen,
  Cloud,
  CloudOff,
  WifiOff,
  Activity
} from 'lucide-react';

interface StagedRowValidation {
  rowNum: number;
  identifier: string;
  status: 'valid' | 'invalid' | 'warning';
  messages: string[];
  data: any;
}

interface ImportExportProps {
  onUpdateLearners: (learners: Learner[]) => void;
  onImportScores: (scores: { [compositeKey: string]: ScoreRecord }) => void;
  onResetData: () => void;
  onImportStaff?: (staff: any[]) => void;
  onImportTimetable?: (slots: any[]) => void;
}

export default function ImportExport({ 
  onUpdateLearners, 
  onImportScores, 
  onResetData,
  onImportStaff,
  onImportTimetable
}: ImportExportProps) {
  const data = useAppStore(state => state.data)!;
  const [dragActive, setDragActive] = useState(false);
  const [importType, setImportType] = useState<'learners' | 'scores' | 'finances' | 'staff' | 'timetable'>('learners');
  const [selectedClass, setSelectedClass] = useState(ALL_CLASSES[0]);
  const [selectedExamSet, setSelectedExamSet] = useState(data.settings.examSets[0]?.id || '');
  const [includeCurrentScores, setIncludeCurrentScores] = useState(true);
  const [importLog, setImportLog] = useState<{ success: boolean; msg: string }[]>([]);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTick, setLastSyncTick] = useState(0);
  const [workOffline, setWorkOffline] = useState(() => {
    return localStorage.getItem('otec_work_offline') === 'true' || !dataManager.isSyncEnabled();
  });

  const syncState = dataManager.getSyncStatus();

  React.useEffect(() => {
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

  // Real-time validation layer and staging states
  const [stagedFileName, setStagedFileName] = useState<string>('');
  const [stagedRows, setStagedRows] = useState<any[] | null>(null);
  const [stagedHeaders, setStagedHeaders] = useState<string[]>([]);
  const [stagedValidations, setStagedValidations] = useState<StagedRowValidation[]>([]);
  const [stagedType, setStagedType] = useState<'learners' | 'scores' | 'finances' | 'staff' | 'timetable' | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const validateExcelData = (sheet: XLSX.WorkSheet, type: 'learners' | 'scores' | 'finances' | 'staff' | 'timetable'): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Get headers
    const sheetData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    if (sheetData.length === 0) {
      return { valid: false, errors: ['The selected spreadsheet appears to be empty.'] };
    }
    const headers = (sheetData[0] as any[]) || [];
    const headersLower = headers.map(h => String(h || '').trim().toLowerCase());
    
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (type === 'learners') {
      // Required headers check
      const hasName = headersLower.some(h => ['name', 'student name', 'full name', 'first name', 'last name'].includes(h));
      const hasClass = headersLower.some(h => ['class code', 'class', 'cls'].includes(h));
      
      if (!hasName) {
        errors.push("Missing required header for Student Name. Please include 'Student Name', 'Full Name', or 'First Name' and 'Last Name'.");
      }
      if (!hasClass) {
        errors.push("Missing required header for Class Stream. Please include 'Class Code', 'Class', or 'cls'.");
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      // Format/Numeric validations per row
      rows.forEach((row, idx) => {
        const rowNum = idx + 2;
        
        // Validate Age (if present)
        const ageKey = Object.keys(row).find(k => ['age'].includes(k.toLowerCase()));
        if (ageKey && row[ageKey] !== undefined && row[ageKey] !== '') {
          const ageStr = String(row[ageKey]).trim();
          const ageNum = Number(ageStr);
          if (isNaN(ageNum)) {
            errors.push(`Row ${rowNum}: Age value '${ageStr}' is not a valid numeric format.`);
          } else if (ageNum < 0 || ageNum > 100) {
            errors.push(`Row ${rowNum}: Age value '${ageStr}' is out of realistic range (0 - 100).`);
          }
        }

        // Validate Outstanding Balance (if present)
        const balKey = Object.keys(row).find(k => ['outstanding balance', 'balance'].includes(k.toLowerCase()));
        if (balKey && row[balKey] !== undefined && row[balKey] !== '') {
          const balStr = String(row[balKey]).trim().replace(/[^0-9.-]+/g, "");
          const balNum = Number(balStr);
          if (isNaN(balNum)) {
            errors.push(`Row ${rowNum}: Outstanding Balance '${row[balKey]}' is not a valid numeric format.`);
          }
        }
      });
    }

    if (type === 'staff') {
      const hasName = headersLower.some(h => ['name', 'full name', 'first name'].includes(h));
      const hasRole = headersLower.some(h => ['role', 'title', 'job title', 'position', 'type'].includes(h));
      if (!hasName || !hasRole) {
        errors.push("Missing required headers for Staff. Please include 'Name' and 'Role/Title'.");
      }
    }

    if (type === 'timetable') {
      const required = ['class', 'day', 'start time', 'end time', 'subject'];
      const missing = required.filter(r => !headersLower.some(h => h.includes(r)));
      if (missing.length > 0) {
        errors.push(`Missing required headers for Timetable: ${missing.join(', ')}`);
      }
    }

    if (type === 'scores') {
      // Required headers check
      const hasLookup = headersLower.some(h => ['admno', 'admission number', 'adm no', 'admission no', 'name', 'student name', 'full name'].includes(h));
      if (!hasLookup) {
        errors.push("Missing required lookup header. Please include either 'Adm No', 'Admission Number', or 'Student Name' to match scores.");
      }

      const sectionKey = sectionKeyOfClass(selectedClass);
      const subjects = data.settings.sections[sectionKey].subjects;
      
      // Check if at least one subject exists
      const foundSubjects = subjects.filter(sub => 
        headersLower.includes(sub.name.toLowerCase())
      );

      if (foundSubjects.length === 0) {
        errors.push(`No matching subject columns found in spreadsheet headers for selected class "${selectedClass}". Expected columns like: ${subjects.map(s => `'${s.name}'`).join(', ')}.`);
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      // Check numeric scores per row
      rows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const lookup = row.admNo || row['admission number'] || row['Adm No'] || row['ADMISSION NO'] || row.name || row['student name'] || row['Full Name'];
        const studentIdentifier = lookup ? `(${lookup})` : `at Row ${rowNum}`;

        foundSubjects.forEach(sub => {
          const matchKey = Object.keys(row).find(k => k.toLowerCase() === sub.name.toLowerCase());
          if (matchKey && row[matchKey] !== undefined && row[matchKey] !== '') {
            const scoreStr = String(row[matchKey]).trim();
            const scoreNum = Number(scoreStr);
            if (isNaN(scoreNum)) {
              errors.push(`Row ${rowNum} ${studentIdentifier}: Score '${scoreStr}' for ${sub.name} is not a valid number.`);
            } else if (scoreNum < 0 || scoreNum > sub.max) {
              errors.push(`Row ${rowNum} ${studentIdentifier}: Score ${scoreNum} for ${sub.name} is out of bounds (must be 0 - ${sub.max}).`);
            }
          }
        });
      });
    }

    if (type === 'finances') {
      // Required headers check
      const hasAmount = headersLower.some(h => ['amount', 'amount (ugx)', 'amount (ux)'].includes(h));
      if (!hasAmount) {
        errors.push("Missing required header for financial transaction: 'Amount'.");
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      // Check numeric amounts per row
      rows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const amountKey = Object.keys(row).find(k => ['amount', 'amount (ugx)', 'amount (ux)'].includes(k.toLowerCase()));
        if (amountKey) {
          const amountStr = String(row[amountKey]).trim();
          const amountNum = Number(amountStr);
          if (row[amountKey] === undefined || row[amountKey] === '') {
            errors.push(`Row ${rowNum}: Amount is required and cannot be blank.`);
          } else if (isNaN(amountNum)) {
            errors.push(`Row ${rowNum}: Amount value '${amountStr}' is not a valid number.`);
          } else if (amountNum <= 0) {
            errors.push(`Row ${rowNum}: Amount must be a positive number greater than zero.`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const validateAndStageFile = (file: File) => {
    const reader = new FileReader();
    setImportLog([]);
    setStagedFileName(file.name);

    reader.onload = (e) => {
      try {
        const dataBytes = e.target?.result;
        const workbook = XLSX.read(dataBytes, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        if (rows.length === 0) {
          setImportLog([{ success: false, msg: 'The selected spreadsheet appears to be empty.' }]);
          setStagedRows(null);
          setStagedValidations([]);
          return;
        }

        // Get headers
        const sheetData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
        const headers = (sheetData[0] as any[] || []).map(h => String(h || '').trim());
        const headersLower = headers.map(h => h.toLowerCase());
        setStagedHeaders(headers);

        const validations: StagedRowValidation[] = [];

        if (importType === 'learners') {
          const seenAdmNosInFile = new Set<string>();
          const seenNamesInFile = new Set<string>();

          rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const messages: string[] = [];
            let status: 'valid' | 'invalid' | 'warning' = 'valid';

            const firstName = row['First Name'] || row['first name'] || row['FIRST NAME'] || '';
            const middleName = row['Middle Name'] || row['middle name'] || row['MIDDLE NAME'] || '';
            const lastName = row['Last Name'] || row['last name'] || row['LAST NAME'] || '';

            let name = row.name || row['student name'] || row['Full Name'] || row['STUDENT NAME'] || row['Student Name'];
            if (!name && (firstName || lastName)) {
              name = [firstName, middleName, lastName].filter(Boolean).join(' ');
            }

            const admNo = row['Reg Number'] || row['reg number'] || row['REG NUMBER'] || row.admNo || row['admission number'] || row['Adm No'] || row['ADMISSION NO'];
            const age = row.age || row['Age'] || row['AGE'];
            const clsName = row['Class Code'] || row['class code'] || row['CLASS CODE'] || row.class || row.cls || row['Class'] || row['CLASS'];

            const identifier = name ? String(name).trim() : `Row ${rowNum}`;

            if (!name) {
              status = 'invalid';
              messages.push("Missing student name or First/Last name fields.");
            }

            if (!clsName) {
              status = 'invalid';
              messages.push("Missing class stream field.");
            } else {
              let normCls = String(clsName).trim();
              const upperCls = normCls.toUpperCase();
              if (upperCls === 'PRIMARY 7' || upperCls === 'PRIMARY SEVEN' || upperCls === 'P 7' || upperCls === 'P.7') normCls = 'P7';
              else if (upperCls === 'PRIMARY 6' || upperCls === 'PRIMARY SIX' || upperCls === 'P 6' || upperCls === 'P.6') normCls = 'P6';
              else if (upperCls === 'PRIMARY 5' || upperCls === 'PRIMARY FIVE' || upperCls === 'P 5' || upperCls === 'P.5') normCls = 'P5';
              else if (upperCls === 'PRIMARY 4' || upperCls === 'PRIMARY FOUR' || upperCls === 'P 4' || upperCls === 'P.4') normCls = 'P4';
              else if (upperCls === 'PRIMARY 3' || upperCls === 'PRIMARY THREE' || upperCls === 'P 3' || upperCls === 'P.3') normCls = 'P3';
              else if (upperCls === 'PRIMARY 2' || upperCls === 'PRIMARY TWO' || upperCls === 'P 2' || upperCls === 'P.2') normCls = 'P2';
              else if (upperCls === 'PRIMARY 1' || upperCls === 'PRIMARY ONE' || upperCls === 'P 1' || upperCls === 'P.1') normCls = 'P1';

              if (!ALL_CLASSES.includes(normCls)) {
                status = 'invalid';
                messages.push(`Class stream "${clsName}" is unrecognized. Must match a valid class (e.g. P1 to P7).`);
              } else {
                if (name) {
                  const dbNameClassDup = data.learners.some(l => l.name.toLowerCase().trim() === String(name).trim().toLowerCase() && l.cls === normCls);
                  if (dbNameClassDup) {
                    status = 'warning';
                    messages.push(`Student "${name}" is already registered in class "${normCls}" in the database.`);
                  }
                  
                  const keyNameClassFile = `${String(name).trim().toLowerCase()}|${normCls}`;
                  if (seenNamesInFile.has(keyNameClassFile)) {
                    status = 'warning';
                    messages.push(`Duplicate entry for student "${name}" in class "${normCls}" within the CSV file.`);
                  } else {
                    seenNamesInFile.add(keyNameClassFile);
                  }
                }
              }
            }

            if (admNo) {
              const cleanAdm = String(admNo).trim();
              const lowerAdm = cleanAdm.toLowerCase();

              if (seenAdmNosInFile.has(lowerAdm)) {
                status = 'invalid';
                messages.push(`Duplicate Admission No "${cleanAdm}" found multiple times inside the CSV file.`);
              } else {
                seenAdmNosInFile.add(lowerAdm);
              }

              const dbAdmDup = data.learners.some(l => l.admNo.toLowerCase().trim() === lowerAdm);
              if (dbAdmDup) {
                status = 'invalid';
                messages.push(`Admission No "${cleanAdm}" is already registered in the school database.`);
              }
            }

            if (age !== undefined && age !== '') {
              const ageStr = String(age).trim();
              const ageNum = Number(ageStr);
              if (isNaN(ageNum)) {
                status = 'invalid';
                messages.push(`Age value '${ageStr}' is not a valid number.`);
              } else if (ageNum < 1 || ageNum > 100) {
                status = 'invalid';
                messages.push(`Age value '${ageStr}' is out of realistic range (1 - 100).`);
              }
            }

            const balKey = Object.keys(row).find(k => ['outstanding balance', 'balance'].includes(k.toLowerCase()));
            if (balKey && row[balKey] !== undefined && row[balKey] !== '') {
              const balStr = String(row[balKey]).trim().replace(/[^0-9.-]+/g, "");
              const balNum = Number(balStr);
              if (isNaN(balNum)) {
                status = 'invalid';
                messages.push(`Outstanding Balance '${row[balKey]}' is not a valid numeric value.`);
              }
            }

            validations.push({
              rowNum,
              identifier,
              status,
              messages,
              data: row
            });
          });
        } else if (importType === 'scores') {
          const sectionKey = sectionKeyOfClass(selectedClass);
          const subjects = data.settings.sections[sectionKey].subjects;
          const foundSubjects = subjects.filter(sub => 
            headersLower.includes(sub.name.toLowerCase())
          );

          if (foundSubjects.length === 0) {
            setImportLog([{ success: false, msg: `No matching subject columns found in headers for class "${selectedClass}". Expected: ${subjects.map(s => s.name).join(', ')}` }]);
            setStagedRows(null);
            setStagedValidations([]);
            return;
          }

          const seenLookupsInFile = new Set<string>();

          rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const messages: string[] = [];
            let status: 'valid' | 'invalid' | 'warning' = 'valid';

            const lookup = row.admNo || row['admission number'] || row['Adm No'] || row['ADMISSION NO'] || row.name || row['student name'] || row['Full Name'];
            const identifier = lookup ? String(lookup).trim() : `Row ${rowNum}`;

            if (!lookup) {
              status = 'invalid';
              messages.push("Missing lookup field (Admission No or Student Name).");
            } else {
              const lookupStr = String(lookup).trim().toLowerCase();

              if (seenLookupsInFile.has(lookupStr)) {
                status = 'invalid';
                messages.push(`Duplicate entry for student reference "${lookup}" within the scores sheet.`);
              } else {
                seenLookupsInFile.add(lookupStr);
              }

              const learner = data.learners.find(
                l => l.cls === selectedClass && 
                (l.admNo.toLowerCase() === lookupStr || l.name.toLowerCase() === lookupStr)
              );

              if (!learner) {
                status = 'invalid';
                messages.push(`Student "${lookup}" not found in registered database for class stream "${selectedClass}".`);
              } else {
                let hasMarks = false;
                foundSubjects.forEach(sub => {
                  const matchKey = Object.keys(row).find(k => k.toLowerCase() === sub.name.toLowerCase());
                  if (matchKey && row[matchKey] !== undefined && row[matchKey] !== '') {
                    const scoreStr = String(row[matchKey]).trim();
                    const scoreNum = Number(scoreStr);
                    if (isNaN(scoreNum)) {
                      status = 'invalid';
                      messages.push(`Invalid non-numeric score '${scoreStr}' for ${sub.name}.`);
                    } else if (scoreNum < 0 || scoreNum > sub.max) {
                      status = 'invalid';
                      messages.push(`Score ${scoreNum} for ${sub.name} is out of bounds (must be 0 - ${sub.max}).`);
                    } else {
                      hasMarks = true;
                    }
                  }
                });

                if (!hasMarks) {
                  status = 'warning';
                  messages.push("No score entries found in this row for any mapped subjects.");
                }
              }
            }

            validations.push({
              rowNum,
              identifier,
              status,
              messages,
              data: row
            });
          });
        } else if (importType === 'finances') {
          rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const messages: string[] = [];
            let status: 'valid' | 'invalid' | 'warning' = 'valid';

            const amountRaw = row['Amount'] || row['amount'] || row['AMOUNT'] || row['Amount (UGX)'] || row['amount (ux)'] || row['amount (ugx)'];
            const lookupStudent = row['Adm No'] || row['admNo'] || row['Admission No'] || row['admission number'] || row['Student Name'] || row['student name'] || row['Student'] || row['student'] || row['Linked Student'] || row['linked student'];

            const identifier = lookupStudent ? `Finances: ${lookupStudent}` : `Row ${rowNum}`;

            if (amountRaw === undefined || amountRaw === '') {
              status = 'invalid';
              messages.push("Amount field is required and cannot be empty.");
            } else {
              const amountNum = Number(amountRaw);
              if (isNaN(amountNum)) {
                status = 'invalid';
                messages.push(`Amount value '${amountRaw}' is not a valid number.`);
              } else if (amountNum <= 0) {
                status = 'invalid';
                messages.push("Amount must be a positive number greater than 0.");
              }
            }

            if (lookupStudent) {
              const lookupStr = String(lookupStudent).trim().toLowerCase();
              const matchedLearner = data.learners.find(
                l => l.admNo.toLowerCase() === lookupStr || 
                     l.name.toLowerCase() === lookupStr || 
                     (l.paycode && l.paycode.toLowerCase() === lookupStr)
              );

              if (!matchedLearner) {
                status = 'warning';
                messages.push(`Linked Student lookup "${lookupStudent}" was not found in register database (will import as general transaction).`);
              }
            }

            validations.push({
              rowNum,
              identifier,
              status,
              messages,
              data: row
            });
          });
        } else if (importType === 'staff') {
          rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const messages: string[] = [];
            let status: 'valid' | 'invalid' | 'warning' = 'valid';

            const name = row['Name'] || row['name'] || row['Full Name'] || row['full name'] || row['First Name'] || row['first name'];
            const role = row['Role'] || row['role'] || row['Title'] || row['title'] || row['Job Title'] || row['job title'];
            
            const identifier = name ? String(name) : `Row ${rowNum}`;

            if (!name || String(name).trim() === '') {
              status = 'invalid';
              messages.push("Staff Name is required.");
            }
            if (!role || String(role).trim() === '') {
              status = 'invalid';
              messages.push("Role/Title is required.");
            }

            validations.push({
              rowNum,
              identifier,
              status,
              messages,
              data: row
            });
          });
        } else if (importType === 'timetable') {
          rows.forEach((row, idx) => {
            const rowNum = idx + 2;
            const messages: string[] = [];
            let status: 'valid' | 'invalid' | 'warning' = 'valid';

            const cls = row['Class'] || row['class'];
            const day = row['Day'] || row['day'];
            const startTime = row['Start Time'] || row['start time'] || row['StartTime'];
            const endTime = row['End Time'] || row['end time'] || row['EndTime'];
            const subject = row['Subject'] || row['subject'];
            
            const identifier = cls ? `${cls} (${day || '?'})` : `Row ${rowNum}`;

            if (!cls || String(cls).trim() === '') {
              status = 'invalid';
              messages.push("Class is required.");
            }
            if (!day || String(day).trim() === '') {
              status = 'invalid';
              messages.push("Day is required.");
            }
            if (!startTime || !endTime) {
              status = 'invalid';
              messages.push("Start Time and End Time are required.");
            }
            if (!subject || String(subject).trim() === '') {
              status = 'invalid';
              messages.push("Subject is required.");
            }

            validations.push({
              rowNum,
              identifier,
              status,
              messages,
              data: row
            });
          });
        }

        setStagedRows(rows);
        setStagedValidations(validations);
        setStagedType(importType);

      } catch (err) {
        console.error(err);
        setImportLog([{ success: false, msg: 'Error parsing file. Please check that it is a valid spreadsheet.' }]);
        setStagedRows(null);
        setStagedValidations([]);
      }
    };

    reader.readAsBinaryString(file);
  };

  const processFile = (file: File) => {
    validateAndStageFile(file);
  };

  const applyStagedImport = () => {
    if (!stagedRows || stagedValidations.length === 0) return;

    // Filter out rows that have blocked 'invalid' status
    const validStaged = stagedValidations.filter(v => v.status !== 'invalid');
    if (validStaged.length === 0) {
      alert("No valid rows to import. Please resolve validation errors or upload a corrected template.");
      return;
    }

    const rowsToImport = validStaged.map(v => v.data);

    if (stagedType === 'learners') {
      importLearnersFromRows(rowsToImport);
    } else if (stagedType === 'scores') {
      importScoresFromRows(rowsToImport);
    } else if (stagedType === 'finances') {
      importFinancesFromRows(rowsToImport);
    } else if (stagedType === 'staff') {
      if (onImportStaff) onImportStaff(rowsToImport);
      setImportLog([{ success: true, msg: `Successfully imported ${rowsToImport.length} staff records.` }]);
    } else if (stagedType === 'timetable') {
      if (onImportTimetable) onImportTimetable(rowsToImport);
      setImportLog([{ success: true, msg: `Successfully imported ${rowsToImport.length} timetable slots.` }]);
    }

    // Reset staged validation values
    setStagedRows(null);
    setStagedValidations([]);
    setStagedType(null);
    setStagedFileName('');
  };

  const importLearnersFromRows = (rows: any[]) => {
    const logs: { success: boolean; msg: string }[] = [];
    const newLearners: Learner[] = [...data.learners];
    let count = 0;

    rows.forEach((row, idx) => {
      // First Name, Middle Name, Last Name
      const firstName = row['First Name'] || row['first name'] || row['FIRST NAME'] || '';
      const middleName = row['Middle Name'] || row['middle name'] || row['MIDDLE NAME'] || '';
      const lastName = row['Last Name'] || row['last name'] || row['LAST NAME'] || '';

      let name = row.name || row['student name'] || row['Full Name'] || row['STUDENT NAME'] || row['Student Name'];
      if (!name && (firstName || lastName)) {
        name = [firstName, middleName, lastName].filter(Boolean).join(' ');
      }

      const admNo = row['Reg Number'] || row['reg number'] || row['REG NUMBER'] || row.admNo || row['admission number'] || row['Adm No'] || row['ADMISSION NO'];
      const sexRaw = row['Gender'] || row['gender'] || row['GENDER'] || row.sex || row['SEX'];
      const age = row.age || row['Age'] || row['AGE'] || '12';
      const clsName = row['Class Code'] || row['class code'] || row['CLASS CODE'] || row.class || row.cls || row['Class'] || row['CLASS'];

      if (!name) {
        logs.push({ success: false, msg: `Row ${idx + 2}: Missing student name or First/Last name fields.` });
        return;
      }

      if (!clsName) {
        logs.push({ success: false, msg: `Row ${idx + 2} (${name}): Missing class stream field.` });
        return;
      }

      let normCls = String(clsName).trim();
      const upperCls = normCls.toUpperCase();
      if (upperCls === 'PRIMARY 7' || upperCls === 'PRIMARY SEVEN' || upperCls === 'P 7' || upperCls === 'P.7') normCls = 'P7';
      else if (upperCls === 'PRIMARY 6' || upperCls === 'PRIMARY SIX' || upperCls === 'P 6' || upperCls === 'P.6') normCls = 'P6';
      else if (upperCls === 'PRIMARY 5' || upperCls === 'PRIMARY FIVE' || upperCls === 'P 5' || upperCls === 'P.5') normCls = 'P5';
      else if (upperCls === 'PRIMARY 4' || upperCls === 'PRIMARY FOUR' || upperCls === 'P 4' || upperCls === 'P.4') normCls = 'P4';
      else if (upperCls === 'PRIMARY 3' || upperCls === 'PRIMARY THREE' || upperCls === 'P 3' || upperCls === 'P.3') normCls = 'P3';
      else if (upperCls === 'PRIMARY 2' || upperCls === 'PRIMARY TWO' || upperCls === 'P 2' || upperCls === 'P.2') normCls = 'P2';
      else if (upperCls === 'PRIMARY 1' || upperCls === 'PRIMARY ONE' || upperCls === 'P 1' || upperCls === 'P.1') normCls = 'P1';

      if (!ALL_CLASSES.includes(normCls)) {
        logs.push({ success: false, msg: `Row ${idx + 2} (${name}): Class stream "${clsName}" must match exactly (e.g. "P7" or "ZEBRA" or "Primary 7").` });
        return;
      }

      const cleanAdm = admNo ? String(admNo).trim() : `OTEC/GEN/${Date.now().toString(36).slice(-4)}${idx}`;
      
      // Duplicate check (both by Admission No and by Name & Class to maintain absolute integrity)
      const matchesAdm = newLearners.some(l => l.admNo.toLowerCase() === cleanAdm.toLowerCase());
      const matchesNameClass = newLearners.some(l => l.name.toLowerCase().trim() === String(name).trim().toLowerCase() && l.cls === normCls);
      
      if (matchesAdm || matchesNameClass) {
        const reason = matchesAdm 
          ? `Admission No "${cleanAdm}" is already registered.` 
          : `Student "${name}" is already registered in class "${normCls}".`;
        logs.push({ success: false, msg: `Row ${idx + 2} (${name}): Skipped. ${reason}` });
        return;
      }

      let sex: 'Male' | 'Female' = 'Male';
      if (sexRaw && /f/i.test(String(sexRaw))) {
        sex = 'Female';
      }

      const studentAccount = row['Student Account'] || row['student account'] || row['STUDENT ACCOUNT'] || '';
      const studentPhone = row['Student Phone'] || row['student phone'] || row['STUDENT PHONE'] || '';
      const paymentCode = row['Payment Code'] || row['payment code'] || row['PAYMENT CODE'] || row.paycode || '';
      const active = row['Active'] || row['active'] || row['ACTIVE'] || 'Yes';
      const studentEmail = row['Student Email'] || row['student email'] || row['STUDENT EMAIL'] || '';
      const guardianName = row['Guardian Name'] || row['guardian name'] || row['GUARDIAN NAME'] || '';
      const guardianEmail = row['Guardian Email'] || row['guardian email'] || row['GUARDIAN EMAIL'] || '';
      const guardianPhone = row['Guardian Phone'] || row['guardian phone'] || row['GUARDIAN PHONE'] || '';
      const guardianRelation = row['Guardian Relation'] || row['guardian relation'] || row['GUARDIAN RELATION'] || '';
       const outstandingBalance = row['Outstanding Balance'] || row['outstanding balance'] || row['OUTSTANDING BALANCE'] || '0';
      const dayBoarding = row['Day Boarding'] || row['day boarding'] || row['DAY BOARDING'] || 'Day';
      const suiteCode = row['Suite Code'] || row['suite code'] || row['SUITE CODE'] || '';
      const unebNo = row['UNEB Index'] || row['uneb index'] || row['unebNo'] || row['UNEB No'] || row['uneb no'] || row['uneb'] || row['UNEB'] || '';

      newLearners.push({
        id: 'L' + Math.random().toString(36).slice(2, 9),
        name: String(name).trim(),
        firstName: firstName || undefined,
        middleName: middleName || undefined,
        lastName: lastName || undefined,
        admNo: cleanAdm,
        sex,
        age: age ? String(age).trim() : '12',
        cls: normCls,
        paycode: paymentCode || undefined,
        lin: row.lin || row['LIN'] || `LIN-2026-${100000 + idx}`,
        photo: row.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(String(name).trim())}`,
        studentAccount: studentAccount || undefined,
        studentPhone: studentPhone || undefined,
        active: active || undefined,
        studentEmail: studentEmail || undefined,
        guardianName: guardianName || undefined,
        guardianEmail: guardianEmail || undefined,
        guardianPhone: guardianPhone || undefined,
        guardianRelation: guardianRelation || undefined,
        outstandingBalance: outstandingBalance || undefined,
        dayBoarding: dayBoarding || undefined,
        suiteCode: suiteCode || undefined,
        unebNo: unebNo ? String(unebNo).trim() : undefined
      });
      count++;
    });

    onUpdateLearners(newLearners);
    dataManager.addActivityLog('data_imported', `Imported ${count} new student register files from spreadsheet.`);
    
    // Custom event to show a beautiful floating modal notification with date/time of change!
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'Data Update Performed',
        message: `Successfully imported and registered ${count} new learner record(s) from Excel file. App database updated with full student account, day/boarding, outstanding balance, and contact listings.`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));

    logs.unshift({ success: true, msg: `Successfully imported ${count} new student file(s) into directory.` });
    setImportLog(logs);
  };

  const importScoresFromRows = (rows: any[]) => {
    const logs: { success: boolean; msg: string }[] = [];
    const scoresToImport: { [key: string]: ScoreRecord } = { ...data.scores };
    const sectionKey = sectionKeyOfClass(selectedClass);
    const subjects = data.settings.sections[sectionKey].subjects;
    let count = 0;

    rows.forEach((row, idx) => {
      const lookup = row.admNo || row['admission number'] || row['Adm No'] || row['ADMISSION NO'] || row.name || row['student name'] || row['Full Name'];
      if (!lookup) {
        logs.push({ success: false, msg: `Row ${idx + 2}: Missing lookup field (Admission No or Name).` });
        return;
      }

      // Find matching learner in the registered database
      const learner = data.learners.find(
        l => l.cls === selectedClass && 
        (l.admNo.toLowerCase() === String(lookup).trim().toLowerCase() || l.name.toLowerCase() === String(lookup).trim().toLowerCase())
      );

      if (!learner) {
        logs.push({ success: false, msg: `Row ${idx + 2} ("${lookup}"): Student not found in registered "${selectedClass}" directory.` });
        return;
      }

      const cKey = `${learner.id}|${selectedExamSet}`;
      const record: ScoreRecord = {};
      let hasMarks = false;

      subjects.forEach(sub => {
        // Search in rows matching subject name (case insensitive)
        const matchKey = Object.keys(row).find(k => k.toLowerCase() === sub.name.toLowerCase());
        if (matchKey && row[matchKey] !== undefined && row[matchKey] !== '') {
          const m = Number(row[matchKey]);
          if (!isNaN(m) && m >= 0 && m <= sub.max) {
            record[sub.name] = m;
            hasMarks = true;
          } else {
            logs.push({ success: false, msg: `Row ${idx + 2} (${learner.name}): Invalid score "${row[matchKey]}" for ${sub.name}. Capped between 0 and ${sub.max}.` });
          }
        }
      });

      if (hasMarks) {
        scoresToImport[cKey] = record;
        count++;
      }
    });

    onImportScores(scoresToImport);
    const selectedExamSetObj = data.settings.examSets.find(set => set.id === selectedExamSet);
    const examLabel = selectedExamSetObj ? selectedExamSetObj.label : selectedExamSet;
    dataManager.addActivityLog('data_imported', `Imported marks records for ${count} students in class ${selectedClass} (${examLabel}).`);
    logs.unshift({ success: true, msg: `Successfully updated scores for ${count} student(s) in selected exam paper.` });
    setImportLog(logs);
  };

  const importFinancesFromRows = (rows: any[]) => {
    const logs: { success: boolean; msg: string }[] = [];
    const currentFinances: FinanceTransaction[] = [...(data.finances || [])];
    const currentLearners: Learner[] = [...data.learners];
    let count = 0;
    let totalAmt = 0;

    rows.forEach((row, idx) => {
      const dateRaw = row['Date'] || row['date'] || row['DATE'] || new Date().toISOString().split('T')[0];
      const typeRaw = row['Type'] || row['type'] || row['TYPE'] || 'income';
      const categoryRaw = row['Category'] || row['category'] || row['CATEGORY'] || 'Tuition Fees';
      const amountRaw = row['Amount'] || row['amount'] || row['AMOUNT'] || row['Amount (UGX)'] || row['amount (ux)'] || row['amount (ugx)'];
      const descRaw = row['Description'] || row['description'] || row['DESCRIPTION'] || `${categoryRaw} Excel Import`;
      const payMethodRaw = row['Payment Method'] || row['paymentMethod'] || row['payment method'] || row['PAYMENT METHOD'] || 'Cash';
      
      const lookupStudent = row['Adm No'] || row['admNo'] || row['Admission No'] || row['admission number'] || row['Student Name'] || row['student name'] || row['Student'] || row['student'] || row['Linked Student'] || row['linked student'];

      if (!amountRaw || isNaN(Number(amountRaw)) || Number(amountRaw) <= 0) {
        logs.push({ success: false, msg: `Row ${idx + 2}: Invalid or missing positive amount.` });
        return;
      }

      const amount = Number(amountRaw);
      const type = String(typeRaw).toLowerCase().trim() === 'expense' ? 'expense' : 'income';
      
      // Map payment method to valid options
      let paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque' = 'Cash';
      const payMethodStr = String(payMethodRaw).toLowerCase();
      if (payMethodStr.includes('bank') || payMethodStr.includes('transfer')) paymentMethod = 'Bank Transfer';
      else if (payMethodStr.includes('mobile') || payMethodStr.includes('money') || payMethodStr.includes('momo')) paymentMethod = 'Mobile Money';
      else if (payMethodStr.includes('cheque') || payMethodStr.includes('check')) paymentMethod = 'Cheque';

      // Find matching student if specified
      let studentId: string | undefined = undefined;
      let matchedLearner: Learner | undefined = undefined;

      if (lookupStudent) {
        const lookupStr = String(lookupStudent).trim().toLowerCase();
        matchedLearner = currentLearners.find(
          l => l.admNo.toLowerCase() === lookupStr || 
               l.name.toLowerCase() === lookupStr || 
               (l.paycode && l.paycode.toLowerCase() === lookupStr)
        );
        if (matchedLearner) {
          studentId = matchedLearner.id;
        } else {
          logs.push({ success: false, msg: `Row ${idx + 2}: Student lookup "${lookupStudent}" not found in register.` });
        }
      }

      const txId = 'tx-imported-' + Math.random().toString(36).slice(2, 9);
      
      const newTx: FinanceTransaction = {
        id: txId,
        date: String(dateRaw).trim(),
        type,
        category: String(categoryRaw).trim(),
        amount,
        studentId,
        description: String(descRaw).trim(),
        recordedBy: dataManager.getActiveUser()?.email?.split('@')[0] || 'Excel Import',
        paymentMethod
      };

      currentFinances.push(newTx);
      count++;
      totalAmt += amount;

      // Automatically update the student outstanding fees if applicable (type === 'income' and has outstanding balance)
      if (matchedLearner && type === 'income') {
        const currentBal = Number((matchedLearner.outstandingBalance || '0').replace(/[^0-9.-]+/g, "")) || 0;
        if (currentBal > 0) {
          const newBal = Math.max(0, currentBal - amount);
          matchedLearner.outstandingBalance = newBal.toLocaleString();
        }
      }
    });

    // Save
    if (count > 0) {
      dataManager.updateFinances(currentFinances);
      onUpdateLearners(currentLearners); // update student records to persist new balances!
      dataManager.addActivityLog('finance_modified', `Imported ${count} finance transactions from spreadsheet totaling UGX ${totalAmt.toLocaleString()}.`);
      
      window.dispatchEvent(new CustomEvent('otec-modal-notify', {
        detail: {
          title: 'Financial Ledger Imported',
          message: `Successfully imported and processed ${count} transaction ledger entries. Active student fee accounts adjusted and updated.`,
          type: 'success',
          timestamp: new Date().toLocaleString()
        }
      }));
    }

    logs.unshift({ success: true, msg: `Successfully imported ${count} financial transaction record(s) totaling ${totalAmt.toLocaleString()} UGX.` });
    setImportLog(logs);
  };

  const importStaffFromRows = (rows: any[]) => {
    const logs: { success: boolean; msg: string }[] = [];
    const newSettings = { ...data.settings };
    let teacherCount = 0;
    let nonTeachingCount = 0;

    const currentTeachers = [...(newSettings.teachersList || [])];
    const currentNonTeaching = [...(newSettings.nonTeachingStaffList || [])];

    rows.forEach((row, idx) => {
      const name = row['Name'] || row['name'] || row['Full Name'] || row['full name'] || row['First Name'] || row['first name'];
      const role = row['Role'] || row['role'] || row['Title'] || row['title'] || row['Job Title'] || row['job title'];
      const phone = row['Phone'] || row['phone'] || '';
      const email = row['Email'] || row['email'] || '';
      
      if (!name || !role) return;

      const isTeacher = String(role).toLowerCase().includes('teacher') || String(role).toLowerCase().includes('master');
      
      if (isTeacher) {
        currentTeachers.push({
          id: 'TCH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          name: String(name),
          subjects: [],
          classes: [],
          phone: String(phone),
          email: String(email),
          role: String(role)
        });
        teacherCount++;
      } else {
        currentNonTeaching.push({
          id: 'NTS-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          name: String(name),
          role: String(role),
          phone: String(phone),
          email: String(email)
        });
        nonTeachingCount++;
      }
    });

    newSettings.teachersList = currentTeachers;
    newSettings.nonTeachingStaffList = currentNonTeaching;
    dataManager.updateSettings(newSettings);
    
    logs.push({ success: true, msg: `Imported ${teacherCount} teachers and ${nonTeachingCount} non-teaching staff successfully.` });
    dataManager.addActivityLog('data_imported', `Imported ${teacherCount} teachers and ${nonTeachingCount} non-teaching staff from spreadsheet.`);
    setImportLog(logs);
  };

  const importTimetableFromRows = (rows: any[]) => {
    const logs: { success: boolean; msg: string }[] = [];
    const currentTimetable = { ...data.timetable };
    const currentSlots = [...(currentTimetable.slots || [])];
    let count = 0;

    rows.forEach((row, idx) => {
      const cls = row['Class'] || row['class'];
      const day = row['Day'] || row['day'];
      const startTime = row['Start Time'] || row['start time'] || row['StartTime'];
      const endTime = row['End Time'] || row['end time'] || row['EndTime'];
      const subject = row['Subject'] || row['subject'];
      const teacherName = row['Teacher'] || row['teacher'] || '';
      const roomId = row['Room'] || row['room'] || '';

      if (!cls || !day || !startTime || !endTime || !subject) return;

      // Find teacher ID if name provided
      let teacherId = '';
      if (teacherName) {
        const teacher = (data.settings.teachersList || []).find(t => t.name.toLowerCase() === String(teacherName).toLowerCase());
        if (teacher) teacherId = teacher.id;
      }

      currentSlots.push({
        id: 'ts-' + Math.random().toString(36).substr(2, 6),
        classId: String(cls),
        dayOfWeek: String(day) as any,
        startTime: String(startTime),
        endTime: String(endTime),
        subjectId: String(subject),
        teacherId,
        roomId: String(roomId)
      });
      count++;
    });

    currentTimetable.slots = currentSlots;
    dataManager.updateTimetableData(currentTimetable);
    
    logs.push({ success: true, msg: `Imported ${count} timetable slots successfully.` });
    dataManager.addActivityLog('data_imported', `Imported ${count} timetable slots from spreadsheet.`);
    setImportLog(logs);
  };

  const downloadStaffTemplate = () => {
    const wsData = [
      {
        'Name': 'John Doe',
        'Role': 'Senior Teacher',
        'Phone': '0772123456',
        'Email': 'john.doe@example.com'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'OTEC_Staff_Template.xlsx');
    
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Staff import template downloaded successfully!',
        type: 'success'
      }
    }));
  };

  const downloadTimetableTemplate = () => {
    const wsData = [
      {
        'Class': 'P7',
        'Day': 'Monday',
        'Start Time': '08:00',
        'End Time': '09:00',
        'Subject': 'Mathematics',
        'Teacher': 'John Doe',
        'Room': 'Block A'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'OTEC_Timetable_Template.xlsx');
    
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Timetable import template downloaded successfully!',
        type: 'success'
      }
    }));
  };

  const downloadFinanceTemplate = () => {
    const wsData = [
      {
        'Date': '2026-07-11',
        'Type': 'income',
        'Category': 'Tuition Fees',
        'Amount': 450000,
        'Description': 'Term 3 tuition payment',
        'Payment Method': 'Bank Transfer',
        'Adm No': 'OTEC/2026/1088'
      },
      {
        'Date': '2026-07-12',
        'Type': 'expense',
        'Category': 'Teacher Salaries',
        'Amount': 1200000,
        'Description': 'Primary section salaries',
        'Payment Method': 'Bank Transfer',
        'Adm No': ''
      }
    ];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FinanceTemplate');
    XLSX.writeFile(wb, 'OTEC_Finances_Template.xlsx');

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Finances import template spreadsheet downloaded successfully!',
        type: 'success'
      }
    }));
  };

  // Template Generation and Export
  const downloadLearnerTemplate = () => {
    const wsData = [
      {
        'Sl No.': 1,
        'First Name': 'Joan',
        'Middle Name': 'Agatha',
        'Last Name': 'Nagawa',
        'Student Account': 'ACC-088',
        'Class Code': 'P7',
        'Student Phone': '0706948165',
        'Payment Code': '1004824716',
        'Active': 'Yes',
        'Student Email': 'joan.nagawa@school.ug',
        'Guardian Name': 'Hajarah Nakanwagi',
        'Guardian Email': 'hajarah@gmail.com',
        'Guardian Phone': '0706948165',
        'Gender': 'F',
        'Reg Number': 'OTEC/2026/1088',
        'Guardian Relation': 'Mother',
        'Outstanding Balance': '50000',
        'Day Boarding': 'Day',
        'Suite Code': 'S-12'
      },
      {
        'Sl No.': 2,
        'First Name': 'Robert',
        'Middle Name': '',
        'Last Name': 'Kiyemba',
        'Student Account': 'ACC-089',
        'Class Code': 'P7',
        'Student Phone': '0705362439',
        'Payment Code': '1004598780',
        'Active': 'Yes',
        'Student Email': 'robert.kiyemba@school.ug',
        'Guardian Name': 'Eva Nakalembe',
        'Guardian Email': 'eva@gmail.com',
        'Guardian Phone': '0705362439',
        'Gender': 'M',
        'Reg Number': 'OTEC/2026/1089',
        'Guardian Relation': 'Mother',
        'Outstanding Balance': '0',
        'Day Boarding': 'Boarding',
        'Suite Code': 'S-14'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'OTEC_Learners_Template.xlsx');
    
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Learners import template spreadsheet downloaded successfully!',
        type: 'success'
      }
    }));
  };

  const downloadScoresTemplate = () => {
    const sectionKey = sectionKeyOfClass(selectedClass);
    const subjects = data.settings.sections[sectionKey].subjects;
    const classLearners = data.learners.filter(l => l.cls === selectedClass);

    if (classLearners.length === 0) {
      alert(`Please register students in "${selectedClass}" stream first before downloading a scores input template.`);
      return;
    }

    const examSetObj = data.settings.examSets.find(set => set.id === selectedExamSet);
    const examLabel = examSetObj ? examSetObj.label : 'Exam';

    const wsData = classLearners.map(l => {
      const row: any = { 
        'Adm No': l.admNo, 
        'Student Name': l.name,
        'Sex': l.sex || '',
        ...(l.unebNo ? { 'UNEB Index': l.unebNo } : {})
      };

      // Get current score record for this student and selected exam set
      const cKey = `${l.id}|${selectedExamSet}`;
      const existingScores = data.scores[cKey] || {};

      subjects.forEach(s => {
        const scoreVal = existingScores[s.name];
        row[s.name] = (includeCurrentScores && scoreVal !== undefined) ? scoreVal : ''; // prefill if option is checked
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ScoresTemplate');
    
    const safeClassName = selectedClass.replace(/\s+/g, '_');
    const safeExamName = examLabel.replace(/\s+/g, '_');
    XLSX.writeFile(wb, `OTEC_${safeClassName}_${safeExamName}_Scores_Template.xlsx`);

    // Alert or Notify via system modal
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'Scores Template Generated',
        message: `Successfully generated a customized Excel scores sheet for ${selectedClass} (${examLabel}). ${includeCurrentScores ? 'Prefilled with current student scores for editing/bulk-update.' : 'Formatted with blank score spaces.'}`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));
  };

  const exportAllDataToCSV = () => {
    const wsData = data.learners.map(l => ({
      'Student Name': l.name,
      'Admission Number': l.admNo,
      'Sex': l.sex,
      'Age': l.age,
      'Class Stream': l.cls
    }));
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Learners Directory');
    XLSX.writeFile(wb, 'OTEC_Learners_Directory_Export.xlsx');
  };

  const exportDataAuditJSON = () => {
    try {
      const examSets = data.settings.examSets || [];
      const auditLearners = data.learners.map(l => {
        // Find performance records for this learner
        const performance = examSets.map(set => {
          const key = `${l.id}|${set.id}`;
          const scoresRecord = data.scores[key] || {};
          return {
            examSetId: set.id,
            examLabel: set.label,
            term: set.term,
            period: set.period,
            scores: scoresRecord
          };
        }).filter(p => Object.keys(p.scores).length > 0); // only export exams where they have scores

        return {
          id: l.id,
          name: l.name,
          firstName: l.firstName,
          middleName: l.middleName,
          lastName: l.lastName,
          admNo: l.admNo,
          sex: l.sex,
          age: l.age,
          class: l.cls,
          unebNo: l.unebNo || null,
          paycode: l.paycode || null,
          outstandingBalance: l.outstandingBalance || null,
          performance
        };
      });

      const auditPayload = {
        auditId: `audit-${Math.random().toString(36).substring(2, 11)}`,
        exportTimestamp: new Date().toISOString(),
        schoolInfo: {
          schoolName: data.settings.schoolName,
          shortName: data.settings.shortName,
          motto: data.settings.motto,
          currentTerm: data.settings.term,
          currentYear: data.settings.year,
        },
        summary: {
          totalLearners: data.learners.length,
          p7CandidateCount: data.learners.filter(l => l.cls === 'P7' || l.cls === 'Primary 7').length,
          examSetsConfigured: examSets.length,
          totalScoreRecords: Object.keys(data.scores).length
        },
        learners: auditLearners
      };

      const blob = new Blob([JSON.stringify(auditPayload, null, 2)], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", blobUrl);
      downloadAnchor.setAttribute("download", `${data.settings.shortName.replace(/\s+/g, '_')}_Academic_Audit_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      // Log activity
      dataManager.addActivityLog('data_imported', `Generated Academic Data Audit JSON containing ${auditPayload.summary.totalLearners} learners and exam scores.`);

      // Notify user via existing notification event
      window.dispatchEvent(new CustomEvent('otec-modal-notify', {
        detail: {
          title: 'Audit Archive Exported',
          message: `Academic performance data audit successfully exported. Prepared JSON payload for offline archiving.`,
          type: 'success',
          timestamp: new Date().toLocaleString()
        }
      }));

    } catch (err: any) {
      alert(`Error generating export audit: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Data Management &amp; Integration</h2>
          <p className="text-slate-500 text-xs mt-1">
            Directly import student enrollments and class exam marks from standard spreadsheets, or export system backups.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">Excel / XLSX Standards</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left column: Excel / CSV Importer (col span 2) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-950">Spreadsheet Importer Wizard</h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200/50 transition-colors cursor-pointer animate-pulse"
              >
                <HelpCircle size={12} />
                <span>Upload Help &amp; Templates</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button 
                onClick={() => { setImportType('learners'); setImportLog([]); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  importType === 'learners' 
                    ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                1. Import Learners
              </button>
              <button 
                onClick={() => { setImportType('scores'); setImportLog([]); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  importType === 'scores' 
                    ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                2. Import Scores
              </button>
              <button 
                onClick={() => { setImportType('finances'); setImportLog([]); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  importType === 'finances' 
                    ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                3. Import Finances
              </button>
              <button 
                onClick={() => { setImportType('staff'); setImportLog([]); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  importType === 'staff' 
                    ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                4. Import Staff
              </button>
              <button 
                onClick={() => { setImportType('timetable'); setImportLog([]); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  importType === 'timetable' 
                    ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                5. Import Timetable
              </button>
            </div>
          </div>

          {importType === 'scores' && (
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/40 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Class Stream</label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  >
                    {ALL_CLASSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Exam Paper Set</label>
                  <select
                    value={selectedExamSet}
                    onChange={e => setSelectedExamSet(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  >
                    {data.settings.examSets.map(s => (
                      <option key={s.id} value={s.id}>{s.term} — Set {s.setNo} {s.period} ({s.label})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-blue-100/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeCurrentScores}
                    onChange={e => setIncludeCurrentScores(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Prefill template with current scores (for bulk-updating)</span>
                </label>
                
                <button
                  type="button"
                  onClick={downloadScoresTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs text-[11px] cursor-pointer"
                >
                  <FileDown size={12} />
                  <span>Download Scores Sheet Template</span>
                </button>
              </div>
            </div>
          )}

          {/* Drag & Drop Stage */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-blue-600 bg-blue-50/20' 
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 text-slate-500 rounded-xl mb-3 shadow-xs">
              <Upload size={20} />
            </div>
            <p className="text-xs font-bold text-slate-700">Drag &amp; drop student spreadsheet file here</p>
            <p className="text-[10px] text-slate-400 mt-1">Accepts Excel (.xlsx, .xls) and standard CSV files</p>
          </div>

          {/* Staged Validation & Preview Layer */}
          {stagedRows && stagedValidations.length > 0 && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 animate-in fade-in duration-200 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <FileSpreadsheet className="text-blue-600 animate-bounce" size={16} />
                    <span>Real-Time Import Validation Layer</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Staged File: <span className="text-slate-700 font-black">{stagedFileName}</span> • Mode: <span className="text-blue-600 font-black capitalize">{stagedType}</span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setStagedRows(null);
                      setStagedValidations([]);
                      setStagedType(null);
                      setStagedFileName('');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-colors cursor-pointer border border-slate-200"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={applyStagedImport}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    Import {stagedValidations.filter(v => v.status !== 'invalid').length} Valid Rows
                  </button>
                </div>
              </div>

              {/* Validation Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-left shadow-2xs">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Staged Rows</span>
                  <span className="text-sm font-mono font-black text-slate-900">{stagedValidations.length}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 border border-emerald-150/40 rounded-xl text-left shadow-2xs">
                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Ready (No Blockers)</span>
                  <span className="text-sm font-mono font-black text-emerald-700">
                    {stagedValidations.filter(v => v.status !== 'invalid').length}
                  </span>
                </div>
                <div className="p-3 bg-rose-50/50 border border-rose-150/40 rounded-xl text-left shadow-2xs">
                  <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-wider block">Blocked Errors</span>
                  <span className="text-sm font-mono font-black text-rose-700">
                    {stagedValidations.filter(v => v.status === 'invalid').length}
                  </span>
                </div>
              </div>

              {/* Interactive Validation Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar bg-white">
                <table className="min-w-full divide-y divide-slate-150 text-[11px] text-left">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 text-center w-12 bg-slate-50">Row</th>
                      <th className="px-3 py-2 bg-slate-50">Identity</th>
                      <th className="px-3 py-2 bg-slate-50">Status</th>
                      <th className="px-3 py-2 bg-slate-50">Real-Time Validation Diagnostics</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 font-semibold text-slate-800">
                    {stagedValidations.map((v) => (
                      <tr key={v.rowNum} className={`hover:bg-slate-50/50 ${v.status === 'invalid' ? 'bg-rose-50/10' : v.status === 'warning' ? 'bg-amber-50/10' : ''}`}>
                        <td className="px-3 py-2 text-center text-slate-400 font-mono font-bold">{v.rowNum}</td>
                        <td className="px-3 py-2 text-slate-900 font-bold">{v.identifier}</td>
                        <td className="px-3 py-2">
                          {v.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150/40 rounded-full text-[9px] font-black uppercase tracking-wider">
                              <Check size={9} />
                              <span>Pass</span>
                            </span>
                          ) : v.status === 'warning' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-150/40 rounded-full text-[9px] font-black uppercase tracking-wider">
                              <AlertCircle size={9} />
                              <span>Warn</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-150/40 rounded-full text-[9px] font-black uppercase tracking-wider">
                              <AlertCircle size={9} />
                              <span>Block</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {v.messages.length > 0 ? (
                            <div className="space-y-0.5">
                              {v.messages.map((m, mIdx) => (
                                <div key={mIdx} className={`text-[10px] font-bold ${v.status === 'invalid' ? 'text-rose-600' : 'text-amber-600'}`}>
                                  • {m}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">Validated successfully and ready for import</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Log Outputs */}
          {importLog.length > 0 && (
            <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50 max-h-[250px] overflow-y-auto custom-scrollbar">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Import Diagnostics Log</span>
              {importLog.map((log, index) => (
                <div key={index} className={`text-xs flex gap-2 items-start ${log.success ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
                  {log.success ? <Check size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-500" />}
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Export Utilities */}
        <div className="space-y-6">
          {/* Download templates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">Download Templates</h3>
            <p className="text-xs text-slate-500">Ensure Excel columns match exactly before uploading back.</p>

            <button
              onClick={downloadLearnerTemplate}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/50"
            >
              <FileDown size={14} />
              <span>Learners Register Template</span>
            </button>

            <button
              onClick={downloadFinanceTemplate}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/50"
            >
              <FileDown size={14} className="text-indigo-600" />
              <span>Finances Ledger Template</span>
            </button>

            <button
              onClick={downloadStaffTemplate}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/50"
            >
              <FileDown size={14} className="text-purple-600" />
              <span>Staff Register Template</span>
            </button>

            <button
              onClick={downloadTimetableTemplate}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/50"
            >
              <FileDown size={14} className="text-teal-600" />
              <span>Timetable Template</span>
            </button>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Marks Sheet Template</label>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Class</label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900"
                  >
                    {ALL_CLASSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 font-bold mb-1 uppercase">Exam Set</label>
                  <select
                    value={selectedExamSet}
                    onChange={e => setSelectedExamSet(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900"
                  >
                    {data.settings.examSets.map(s => (
                      <option key={s.id} value={s.id}>{s.term} - Set {s.setNo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] pt-1">
                <input
                  type="checkbox"
                  checked={includeCurrentScores}
                  onChange={e => setIncludeCurrentScores(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3 cursor-pointer"
                />
                <span className="font-semibold text-slate-600">Prefill current scores for update</span>
              </label>

              <button
                onClick={downloadScoresTemplate}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200/50 cursor-pointer"
              >
                <FileDown size={14} />
                <span>Scores Input Sheet Template</span>
              </button>
            </div>
          </div>

          {/* Exports Center */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">System Exports</h3>
            <p className="text-xs text-slate-500">Download registered learner databases and offline archives.</p>

            <div className="space-y-3.5">
              <button
                onClick={exportAllDataToCSV}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/10 cursor-pointer"
              >
                <Download size={14} />
                <span>Export Full Register (.xlsx)</span>
              </button>

              <button
                onClick={exportDataAuditJSON}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-800/10 cursor-pointer border border-slate-700"
              >
                <FileDown size={14} className="text-amber-400" />
                <span>Export Data Audit (.json)</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-100">
              * The <b>Data Audit</b> JSON file contains all student demographic keys, computed UNEB index codes, and historical exam score records compiled in a single secure archive for offline verification.
            </p>
          </div>

          {/* Hard Reset */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-rose-950">Danger Zone</h3>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Resets all configurations, settings, registers and scores back to the original OTEC demonstration defaults.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you absolutely sure you want to hard reset the database? This deletes all your custom school, learner and mark entries permanently.')) {
                  onResetData();
                  alert('Database hard reset to demo standards completed.');
                }
              }}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} />
              <span>Reset Database to Defaults</span>
            </button>
            <div className="pt-3 border-t border-rose-100">
              <p className="text-[11px] text-rose-700 leading-relaxed mb-2 font-bold">
                Wipe everything completely clean to start fresh with your own real data (No Demo Data).
              </p>
              <button
                onClick={() => {
                  const confirmed1 = confirm('WARNING: This will wipe EVERYTHING completely empty. You will lose all learners, scores, finances, and logs. This is for starting 100% fresh with your own data.');
                  if (confirmed1) {
                    const pwd = prompt('Type "WIPE" to confirm:');
                    if (pwd === 'WIPE') {
                      dataManager.wipeAllData();
                      alert('Database wiped completely clean.');
                      window.location.reload(); // Quickest way to force full app remount with empty state
                    }
                  }
                }}
                className="w-full py-2 bg-red-950 hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                <AlertCircle size={12} />
                <span>Wipe Database Completely Empty</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync Center & Backup Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            Cloud Synchronization Engine
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Manage your connection to the cloud storage and force synchronization.
          </p>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${workOffline ? 'bg-amber-500' : syncState === 'synced' ? 'bg-emerald-500' : syncState === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'}`} />
              {syncState === 'syncing' && !workOffline && (
                <span className="absolute -inset-1 rounded-full bg-amber-500/40 animate-ping" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800">{statusConfig.text}</span>
              <span className="text-xs text-slate-500 font-medium">Last Sync: {formatLastSync()}</span>
            </div>
          </div>

          {/* Explicit Work Offline Toggle */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff size={16} className={workOffline ? "text-amber-500" : "text-slate-400"} />
                <span className="text-slate-800 font-bold text-sm">Work Offline</span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleWorkOffline(!workOffline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  workOffline ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={workOffline}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    workOffline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-tight">
              {workOffline 
                ? "Local-only mode active. Edits will stay on this browser until synced."
                : "Auto cloud sync active for live multi-browser updates."}
            </p>
          </div>

          {/* Manual Sync Now Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncState === 'syncing'}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} className={syncState === 'syncing' ? 'animate-spin text-white' : 'text-blue-100'} />
            <span>{syncState === 'syncing' ? 'Synchronizing...' : 'Force Sync Now'}</span>
          </button>
        </div>

        <div>
          <BackupManager />
        </div>
      </div>

      {/* GUIDED BATCH UPLOAD WIZARD MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">OTEC Student Register &amp; Marks Import Guide</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Step-by-step workbook instructions &amp; download center</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 custom-scrollbar leading-relaxed">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</div>
                <div className="space-y-1.5 font-sans">
                  <h4 className="font-extrabold text-slate-950">Download the Official Excel Template</h4>
                  <p>Choose the template that fits your immediate data update action. Each file is pre-configured with the exact column structures our database parser expects.</p>
                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => { downloadLearnerTemplate(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer text-xs"
                      >
                        <FileDown size={14} className="text-blue-600" />
                        <span>Download Students Register Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { downloadScoresTemplate(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer text-xs"
                      >
                        <FileDown size={14} className="text-emerald-600" />
                        <span>Download Prefilled Score Entry Template</span>
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => { downloadFinanceTemplate(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer text-xs"
                      >
                        <FileDown size={14} className="text-indigo-600" />
                        <span>Download School Finances Ledger Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { downloadStaffTemplate(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer text-xs"
                      >
                        <FileDown size={14} className="text-purple-600" />
                        <span>Download Staff Register Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { downloadTimetableTemplate(); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-200/60 transition-all cursor-pointer text-xs"
                      >
                        <FileDown size={14} className="text-teal-600" />
                        <span>Download Timetable Template</span>
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold italic block pt-1">
                    *Tip: The scores template is dynamically prefilled with names and registration numbers of candidates enrolled in the currently selected stream!
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</div>
                <div className="space-y-1 font-sans">
                  <h4 className="font-extrabold text-slate-950">Prepare and Enter Your Local Marks Data</h4>
                  <p>Open the spreadsheet in Microsoft Excel, Google Sheets, or LibreOffice and adhere strictly to these validation guidelines:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-1.5 text-slate-500">
                    <li><strong className="text-slate-700">Do not rename or shuffle column headers</strong> like Name, Adm No, English, Mathematics, SST, or Science.</li>
                    <li>Ensure academic mark inputs are numeric values within the subject range limit (e.g. between <strong className="text-slate-700">0 and 100</strong>).</li>
                    <li>If a learner was absent, leave the mark cell blank instead of entering letters.</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</div>
                <div className="space-y-1 font-sans">
                  <h4 className="font-extrabold text-slate-950">Automatic Anti-Duplicate Mapping System</h4>
                  <p>The importer executes precise verification steps on every spreadsheet line to secure directory integrity:</p>
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 text-[11px] text-amber-800 flex gap-2.5 items-start mt-1.5">
                    <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-950 mb-0.5">Verification &amp; Duplicate Prevention:</span>
                      To avoid duplicate student listings or orphaned mark sheets, records are mapped dynamically using the unique <strong className="text-amber-950">Registration / Admission Number (admNo)</strong>. If a matching learner exists, their scores are updated for that specific exam set; otherwise, they are securely flagged.
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">4</div>
                <div className="space-y-1 font-sans">
                  <h4 className="font-extrabold text-slate-950">Drop &amp; Import with Diagnostics</h4>
                  <p>Drag the compiled .xlsx file and drop it on the dotted upload canvas, or click to upload. An instant diagnostic report is generated line-by-line showing successful matches or invalid score flags.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Dismiss Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
