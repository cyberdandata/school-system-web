import React, { useState, useEffect } from 'react';
import { AppData, ScoreRecord, PsychomotorRecord, CommentRecord, ExamSet } from '../types';
import { ALL_CLASSES, sectionKeyOfClass, PERIODS, getGradeRank, UNEB_GRADING_BANDS } from '../lib/defaults';
import dataManager from '../lib/db';
import VoiceDictation from './VoiceDictation';
import BulkGradeModal from './BulkGradeModal';
import { 
  FileEdit, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Save, 
  User, 
  Activity, 
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Filter,
  Check,
  X,
  Users,
  Award,
  ClipboardList,
  FileSpreadsheet,
  Plus,
  Search,
  Loader2,
  Clock,
  Zap,
  Building2,
  Eye,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Brain,
  Calculator,
  Trophy,
  RefreshCcw,
  Lock,
  Printer,
  ArrowRight,
  UserPlus,
  FileText,
  ChevronDown
} from 'lucide-react';
import app from '../lib/firebase';
// firebase/functions is used only for primary teacher/head comment generation
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppStore } from "../store/useAppStore";

export function AutoSaveIndicatorBadge({ 
  status, 
  lastSavedTime,
  className = ""
}: { 
  status: 'idle' | 'debouncing' | 'saving' | 'saved' | null; 
  lastSavedTime: string | null;
  className?: string;
}) {
  if (status === 'debouncing') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/10 border border-amber-500/30 text-amber-700 shadow-2xs animate-in fade-in zoom-in-95 duration-150 ${className}`}>
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="tracking-tight">Debouncing Edits...</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-500/10 border border-blue-500/30 text-blue-700 shadow-2xs animate-in fade-in zoom-in-95 duration-150 ${className}`}>
        <Loader2 size={13} className="animate-spin text-blue-600 shrink-0" />
        <span className="tracking-tight">Saving to Database...</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 shadow-2xs animate-in fade-in zoom-in-95 duration-150 ${className}`}>
        <div className="relative flex items-center justify-center shrink-0">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-50"></span>
          <CheckCircle2 size={14} className="text-emerald-600 relative z-10" />
        </div>
        <span className="tracking-tight">
          Auto-Saved {lastSavedTime ? `(${lastSavedTime})` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 border border-slate-200/60 text-slate-600 ${className}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="tracking-tight">Auto-Save Active</span>
    </div>
  );
}

interface ScoresProps {
  onUpdateScores: (compositeKey: string, record: ScoreRecord) => void;
  onUpdatePsychomotor: (compositeKey: string, record: PsychomotorRecord) => void;
  onUpdateComments: (compositeKey: string, record: CommentRecord) => void;
}

// Custom, RFC 4180-compliant CSV parser that handles quoted cells, commas, and line-breaks correctly
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [];
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
    } else {
      cell += char;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines;
}

// Automatically guess which column name matches our system subject
function guessSubjectColumn(subjectName: string, headers: string[]): string {
  const sName = subjectName.toLowerCase();
  
  // 1. Exact match
  const exact = headers.find(h => h.toLowerCase() === sName);
  if (exact) return exact;

  // 2. Exact match on clean alphanumeric strings
  const cleanSName = sName.replace(/[^a-z0-9]/g, '');
  const cleanExact = headers.find(h => h.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanSName);
  if (cleanExact) return cleanExact;

  // 3. Subject-specific aliases & abbreviations
  if (sName.includes('math')) {
    const mathCol = headers.find(h => {
      const lh = h.toLowerCase();
      return lh === 'math' || lh === 'maths' || lh === 'mathematics' || lh.includes('math');
    });
    if (mathCol) return mathCol;
  }
  if (sName.includes('english')) {
    const engCol = headers.find(h => h.toLowerCase().includes('eng'));
    if (engCol) return engCol;
  }
  if (sName.includes('science')) {
    const sciCol = headers.find(h => h.toLowerCase().includes('sci') || h.toLowerCase().includes('science'));
    if (sciCol) return sciCol;
  }
  if (sName.includes('social studies')) {
    const sstCol = headers.find(h => h.toLowerCase().includes('sst') || h.toLowerCase().includes('social') || h.toLowerCase().includes('studies'));
    if (sstCol) return sstCol;
  }
  if (sName.includes('kiswahili')) {
    const kisCol = headers.find(h => h.toLowerCase().includes('kis') || h.toLowerCase().includes('swa'));
    if (kisCol) return kisCol;
  }

  // 4. Case-insensitive substring match
  const sub = headers.find(h => {
    const lh = h.toLowerCase();
    return lh.includes(sName) || sName.includes(lh);
  });
  if (sub) return sub;

  return '';
}

export default function Scores({ onUpdateScores, onUpdatePsychomotor, onUpdateComments }: ScoresProps) {
  const data = useAppStore(state => state.data)!;
  // Selector states
  const [selectedClass, setSelectedClass] = useState(ALL_CLASSES[0]);
  const [selectedExamSet, setSelectedExamSet] = useState('');
  const [selectedLearner, setSelectedLearner] = useState('');
  const [learnerSearch, setLearnerSearch] = useState('');
  const [entryLayoutMode, setEntryLayoutMode] = useState<'classic' | 'unified'>('classic');
  const [mobileViewType, setMobileViewType] = useState<'table' | 'cards'>('table');
  const [activeScoresTab, setActiveScoresTab] = useState<'completeness' | 'leaderboard' | 'school-matrix'>('school-matrix');
  const [examMode, setExamMode] = useState<boolean>(() => {
    return localStorage.getItem('otec_exam_mode') === 'true';
  });
  const [unifiedMarks, setUnifiedMarks] = useState<{ [setId: string]: { [subject: string]: string } }>({});

  // School-Wide All-Classes Upload Matrix States
  const [matrixExamSet, setMatrixExamSet] = useState<string>('');
  const [matrixSectionFilter, setMatrixSectionFilter] = useState<'all' | 'preprimary' | 'lower' | 'upper'>('all');
  const [matrixStatusFilter, setMatrixStatusFilter] = useState<'all' | 'missed' | 'partial' | 'complete'>('all');
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  useEffect(() => {
    if (!matrixExamSet && selectedExamSet) {
      setMatrixExamSet(selectedExamSet);
    } else if (!matrixExamSet && data.settings.examSets.length > 0) {
      setMatrixExamSet(data.settings.examSets[0].id);
    }
  }, [selectedExamSet, data.settings.examSets, matrixExamSet]);

  const allClassesMatrixData = React.useMemo(() => {
    const targetExamSet = matrixExamSet || selectedExamSet || data.settings.examSets[0]?.id || '';
    
    const classReports = ALL_CLASSES.map(clsName => {
      const clsSection = sectionKeyOfClass(clsName);
      const clsLearners = data.learners.filter(l => l.cls === clsName);
      const clsSubjects = data.settings.sections[clsSection]?.subjects || [];

      const subjectStats = clsSubjects.map(subj => {
        let recordedCount = 0;
        clsLearners.forEach(learner => {
          const cKey = `${learner.id}|${targetExamSet}`;
          const legacyCKey = `${learner.id}_${targetExamSet}`;
          const rec = data.scores[cKey] || data.scores[legacyCKey];
          if (rec) {
            let val: unknown = rec[subj.name];
            if (val === undefined || val === null || val === '') {
              if (subj.name === 'Social Studies') {
                val = rec['SST'] ?? rec['S.S.T'];
              } else if (subj.name === 'Mathematics') {
                val = rec['Math'];
              } else if (subj.name === 'Science') {
                val = rec['Sci'];
              } else if (subj.name === 'English') {
                val = rec['Eng'];
              }
            }
            if (val !== undefined && val !== null && String(val).trim() !== '') {
              recordedCount++;
            }
          }
        });

        const totalLearners = clsLearners.length;
        const pct = totalLearners > 0 ? Math.round((recordedCount / totalLearners) * 100) : 0;
        let status: 'complete' | 'partial' | 'missed' = 'missed';
        if (recordedCount === totalLearners && totalLearners > 0) {
          status = 'complete';
        } else if (recordedCount > 0) {
          status = 'partial';
        }

        return {
          subject: subj,
          recordedCount,
          totalLearners,
          pct,
          status
        };
      });

      const totalExpected = clsLearners.length * clsSubjects.length;
      const totalRecorded = subjectStats.reduce((sum, s) => sum + s.recordedCount, 0);
      const overallPct = totalExpected > 0 ? Math.round((totalRecorded / totalExpected) * 100) : 0;

      let classStatus: 'no_students' | 'complete' | 'partial' | 'missed' = 'missed';
      if (clsLearners.length === 0) {
        classStatus = 'no_students';
      } else if (overallPct === 100) {
        classStatus = 'complete';
      } else if (overallPct > 0) {
        classStatus = 'partial';
      } else {
        classStatus = 'missed';
      }

      const completedSubjs = subjectStats.filter(s => s.status === 'complete').length;
      const partialSubjs = subjectStats.filter(s => s.status === 'partial').length;
      const missedSubjs = subjectStats.filter(s => s.status === 'missed').length;

      return {
        clsName,
        clsSection,
        learnersCount: clsLearners.length,
        subjectsCount: clsSubjects.length,
        subjectStats,
        totalExpected,
        totalRecorded,
        overallPct,
        classStatus,
        completedSubjs,
        partialSubjs,
        missedSubjs
      };
    });

    const filteredReports = classReports.filter(rep => {
      if (matrixSectionFilter !== 'all' && rep.clsSection !== matrixSectionFilter) {
        return false;
      }
      if (matrixStatusFilter !== 'all') {
        if (matrixStatusFilter === 'missed' && rep.classStatus !== 'missed') return false;
        if (matrixStatusFilter === 'partial' && rep.classStatus !== 'partial') return false;
        if (matrixStatusFilter === 'complete' && rep.classStatus !== 'complete') return false;
      }
      if (matrixSearch.trim() !== '') {
        const query = matrixSearch.toLowerCase();
        if (!rep.clsName.toLowerCase().includes(query)) return false;
      }
      return true;
    });

    const activeClasses = classReports.filter(c => c.learnersCount > 0);
    const totalClasses = activeClasses.length;
    const completeClassesCount = activeClasses.filter(c => c.classStatus === 'complete').length;
    const partialClassesCount = activeClasses.filter(c => c.classStatus === 'partial').length;
    const missedClassesCount = activeClasses.filter(c => c.classStatus === 'missed').length;

    const grandExpected = activeClasses.reduce((sum, c) => sum + c.totalExpected, 0);
    const grandRecorded = activeClasses.reduce((sum, c) => sum + c.totalRecorded, 0);
    const schoolWidePct = grandExpected > 0 ? Math.round((grandRecorded / grandExpected) * 100) : 0;

    return {
      allReports: classReports,
      filteredReports,
      totalClasses,
      completeClassesCount,
      partialClassesCount,
      missedClassesCount,
      schoolWidePct,
      targetExamSet
    };
  }, [data.learners, data.scores, data.settings.sections, data.settings.examSets, matrixExamSet, selectedExamSet, matrixSectionFilter, matrixStatusFilter, matrixSearch]);

  // CSV Bulk Upload States
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [isDraggingCSV, setIsDraggingCSV] = useState(false);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [csvRows, setCSVRows] = useState<string[][]>([]);
  const [csvMapping, setCSVMapping] = useState<{
    studentIdentifierCol: string;
    studentIdentifierType: 'name' | 'admNo' | 'id';
    subjectMappings: { [subjectName: string]: string };
  }>({
    studentIdentifierCol: '',
    studentIdentifierType: 'name',
    subjectMappings: {}
  });
  const [csvFeedback, setCSVFeedback] = useState<{
    totalRows: number;
    matchedLearnersCount: number;
    updatesPreview: Array<{
      learnerId: string;
      learnerName: string;
      learnerAdmNo: string;
      status: 'matched' | 'unmatched';
      currentScores: { [subj: string]: number };
      newScores: { [subj: string]: number };
      warnings: string[];
    }>;
  } | null>(null);

  // Quick Add Exam Set States
  const [showQuickAddExam, setShowQuickAddExam] = useState(false);
  const [quickExamTerm, setQuickExamTerm] = useState(data.settings.term || 'Term 1');
  const [quickExamPeriod, setQuickExamPeriod] = useState<'BOT' | 'MOT' | 'EOT'>('EOT');
  const [quickExamLabel, setQuickExamLabel] = useState('Set 1 EOT');
  const [quickExamSetNo, setQuickExamSetNo] = useState('1');

  React.useEffect(() => {
    setQuickExamLabel(`Set ${quickExamSetNo} ${quickExamPeriod}`);
  }, [quickExamPeriod, quickExamSetNo]);

  // Local state for score entries
  const [marks, setMarks] = useState<{ [subject: string]: string }>({});
  // Local state for psychomotor ratings
  const [psycho, setPsycho] = useState<{ [skill: string]: number }>({});
  // Local state for comments & initials
  const [teacherCmt, setTeacherCmt] = useState('');
  const [headCmt, setHeadCmt] = useState('');
  const [teacherInitials, setTeacherInitials] = useState('');
  const [headInitials, setHeadInitials] = useState('');
  const [nextTermBegins, setNextTermBegins] = useState('');

  // Comment Templates Selection Override and calculations
  const [templateBandOverride, setTemplateBandOverride] = useState<string | null>(null);

  // Auto Save and Sync States
  const [reportFilter, setReportFilter] = useState<'all' | 'completed' | 'partial' | 'missed'>('all');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'debouncing' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Local storage draft states
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const [unifiedDraftRestored, setUnifiedDraftRestored] = useState(false);
  const [unifiedDraftTime, setUnifiedDraftTime] = useState<string | null>(null);

  const triggerAutoSaveState = () => {
    setAutoSaveStatus('saving');
    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setAutoSaveStatus('saved');
    }, 600);
  };

  const autoSaveScores = (updatedMarks: { [subject: string]: string }) => {
    if (!selectedLearner || !selectedExamSet) return;
    triggerAutoSaveState();
    const cKey = `${selectedLearner}|${selectedExamSet}`;
    const scoresToSave: ScoreRecord = {};
    Object.entries(updatedMarks).forEach(([subj, val]) => {
      if (val !== '') scoresToSave[subj] = Number(val);
    });
    onUpdateScores(cKey, scoresToSave);
  };

  const autoSavePsychomotor = (updatedPsycho: { [skill: string]: number }) => {
    if (!selectedLearner || !selectedExamSet) return;
    triggerAutoSaveState();
    const cKey = `${selectedLearner}|${selectedExamSet}`;
    onUpdatePsychomotor(cKey, updatedPsycho);
  };

  const autoSaveComments = (updatedComments: Partial<CommentRecord>) => {
    if (!selectedLearner || !selectedExamSet) return;
    triggerAutoSaveState();
    const cKey = `${selectedLearner}|${selectedExamSet}`;
    const commentsToSave: CommentRecord = {
      teacher: updatedComments.teacher !== undefined ? updatedComments.teacher : teacherCmt,
      head: updatedComments.head !== undefined ? updatedComments.head : headCmt,
      teacherInitials: updatedComments.teacherInitials !== undefined ? updatedComments.teacherInitials : teacherInitials,
      headInitials: updatedComments.headInitials !== undefined ? updatedComments.headInitials : headInitials,
      nextTermBegins: updatedComments.nextTermBegins !== undefined ? updatedComments.nextTermBegins : nextTermBegins
    };
    onUpdateComments(cKey, commentsToSave);
  };

  // Get active exam sets for this class
  const classExamSets = React.useMemo(() => {
    return data.settings.examSets.filter(s => s.classes.includes(selectedClass));
  }, [data.settings.examSets, selectedClass]);
  
  // Sort term exam sets by set number, then by period order (BOT -> MOT -> EOT)
  const activeTerm = data.settings.term || 'Term 1';
  const sortedTermExamSets = React.useMemo(() => {
    const termSets = classExamSets.filter(s => s.term === activeTerm);
    const periodOrder = { 'BOT': 1, 'MOT': 2, 'EOT': 3 };
    return [...termSets].sort((a, b) => {
      if (a.setNo !== b.setNo) return a.setNo - b.setNo;
      return (periodOrder[a.period as 'BOT' | 'MOT' | 'EOT'] || 0) - (periodOrder[b.period as 'BOT' | 'MOT' | 'EOT'] || 0);
    });
  }, [classExamSets, activeTerm]);

  const set1Set = sortedTermExamSets[0] || null;
  const set2Set = sortedTermExamSets[1] || null;
  const set3Set = sortedTermExamSets[2] || null;

  const classLearners = React.useMemo(() => {
    return data.learners.filter(l => l.cls === selectedClass);
  }, [data.learners, selectedClass]);

  const sectionKey = sectionKeyOfClass(selectedClass);
  const subjects = React.useMemo(() => {
    return data.settings.sections[sectionKey].subjects;
  }, [data.settings.sections, sectionKey]);

  const grading = React.useMemo(() => {
    if (examMode && (selectedClass === 'Primary 7' || selectedClass === 'P7' || sectionKey === 'upper')) {
      return UNEB_GRADING_BANDS;
    }
    return data.settings.sections[sectionKey].grading;
  }, [data.settings.sections, sectionKey, examMode, selectedClass]);
  const isPLEClass = selectedClass === 'Primary 7' || selectedClass === 'P7';

  const [autoCommentEnabled, setAutoCommentEnabled] = useState<boolean>(true);

  const detectedBand = React.useMemo(() => {
    const validMarks = Object.values(marks).filter(v => v !== '').map(Number);
    if (validMarks.length === 0) return null;
    const average = Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length);
    return grading.find(g => average >= g.min && average <= g.max) || null;
  }, [marks, grading]);

  // Automatic comment generation when student marks are entered or updated
  useEffect(() => {
    if (!autoCommentEnabled || !detectedBand || !selectedLearner || !selectedExamSet) return;

    let updatedTeacher = teacherCmt;
    let updatedHead = headCmt;
    let shouldSave = false;

    if (!teacherCmt && detectedBand.classComments && detectedBand.classComments.length > 0) {
      updatedTeacher = detectedBand.classComments[0];
      setTeacherCmt(updatedTeacher);
      shouldSave = true;
    }

    if (!headCmt && detectedBand.headComments && detectedBand.headComments.length > 0) {
      updatedHead = detectedBand.headComments[0];
      setHeadCmt(updatedHead);
      shouldSave = true;
    }

    if (shouldSave) {
      autoSaveComments({ teacher: updatedTeacher, head: updatedHead });
    }
  }, [detectedBand, autoCommentEnabled, selectedLearner, selectedExamSet]);

  const activeTemplateBand = React.useMemo(() => {
    if (templateBandOverride) {
      return grading.find(g => g.grade === templateBandOverride) || null;
    }
    return detectedBand || grading[0] || null;
  }, [templateBandOverride, detectedBand, grading]);

  const applyCommentTemplate = (text: string, role: 'teacher' | 'head') => {
    if (role === 'teacher') {
      setTeacherCmt(text);
      autoSaveComments({ teacher: text });
    } else {
      setHeadCmt(text);
      autoSaveComments({ head: text });
    }
  };

  // Compute completeness status for each learner in the selected class and exam set
  const learnerOverviewList = classLearners.map(learner => {
    const cKey = `${learner.id}|${selectedExamSet}`;
    const scoreRecord = data.scores[cKey] || {};
    
    const enteredSubjects: string[] = [];
    const missedSubjects: string[] = [];
    
    subjects.forEach(sub => {
      const val = scoreRecord[sub.name];
      if (val !== undefined && val !== null) {
        enteredSubjects.push(sub.name);
      } else {
        missedSubjects.push(sub.name);
      }
    });
    
    let status: 'completed' | 'partial' | 'missed_all' = 'completed';
    if (enteredSubjects.length === 0) {
      status = 'missed_all';
    } else if (missedSubjects.length > 0) {
      status = 'partial';
    }
    
    return {
      learner,
      scoreRecord,
      enteredSubjects,
      missedSubjects,
      status
    };
  });

  const filteredOverview = learnerOverviewList.filter(item => {
    if (reportFilter === 'all') return true;
    if (reportFilter === 'completed') return item.status === 'completed';
    if (reportFilter === 'partial') return item.status === 'partial';
    if (reportFilter === 'missed') return item.status === 'missed_all';
    return true;
  });

  // Initialize selectors
  useEffect(() => {
    if (classExamSets.length > 0) {
      setSelectedExamSet(classExamSets[0].id);
    } else {
      setSelectedExamSet('');
    }
  }, [selectedClass]);

  useEffect(() => {
    setLearnerSearch('');
    if (classLearners.length > 0) {
      setSelectedLearner(classLearners[0].id);
    } else {
      setSelectedLearner('');
    }
  }, [selectedClass]);

  // Discard local draft and reload fresh values from database for Classic mode
  const discardClassicDraft = () => {
    localStorage.removeItem(`school_scores_draft_${selectedLearner}_${selectedExamSet}`);
    setDraftRestored(false);
    setDraftTime(null);
    
    if (!selectedLearner || !selectedExamSet) return;
    const cKey = `${selectedLearner}|${selectedExamSet}`;
    const existingScores = data.scores[cKey] || {};
    const marksObj: { [subject: string]: string } = {};
    subjects.forEach(s => {
      marksObj[s.name] = existingScores[s.name] !== undefined ? String(existingScores[s.name]) : '';
    });
    setMarks(marksObj);

    const existingPsycho = data.psychomotor[cKey] || {};
    const psychoObj: { [skill: string]: number } = {};
    data.settings.psychomotor.forEach(sk => {
      psychoObj[sk] = existingPsycho[sk] || 0;
    });
    setPsycho(psychoObj);

    const existingCmt = (data.comments[cKey] || {}) as CommentRecord;
    setTeacherCmt(existingCmt.teacher || '');
    setHeadCmt(existingCmt.head || '');
    setTeacherInitials(existingCmt.teacherInitials || data.settings.classTeachers[selectedClass]?.initials || '');
    setHeadInitials(existingCmt.headInitials || data.settings.headTeacherInitials || '');
    setNextTermBegins(existingCmt.nextTermBegins || '');
  };

  // Discard local draft and reload fresh values from database for Unified mode
  const discardUnifiedDraft = () => {
    localStorage.removeItem(`school_scores_draft_unified_${selectedLearner}`);
    setUnifiedDraftRestored(false);
    setUnifiedDraftTime(null);

    if (!selectedLearner) return;
    const uniMarks: { [setId: string]: { [subject: string]: string } } = {};
    sortedTermExamSets.forEach(sSet => {
      const cKey = `${selectedLearner}|${sSet.id}`;
      const existingScores = data.scores[cKey] || {};
      const marksObj: { [subject: string]: string } = {};
      subjects.forEach(sub => {
        marksObj[sub.name] = existingScores[sub.name] !== undefined ? String(existingScores[sub.name]) : '';
      });
      uniMarks[sSet.id] = marksObj;
    });
    setUnifiedMarks(uniMarks);
  };

  // Load existing data whenever selectedLearner or selectedExamSet changes
  useEffect(() => {
    setDraftRestored(false);
    setDraftTime(null);
    setTemplateBandOverride(null);

    if (!selectedLearner || !selectedExamSet) {
      setMarks({});
      setPsycho({});
      setTeacherCmt('');
      setHeadCmt('');
      setTeacherInitials('');
      setHeadInitials('');
      setNextTermBegins('');
      return;
    }

    const cKey = `${selectedLearner}|${selectedExamSet}`;
    
    // Load fresh scores, psychomotor and comments from state database
    const existingScores = data.scores[cKey] || {};
    const marksObj: { [subject: string]: string } = {};
    subjects.forEach(s => {
      marksObj[s.name] = existingScores[s.name] !== undefined ? String(existingScores[s.name]) : '';
    });

    const existingPsycho = data.psychomotor[cKey] || {};
    const psychoObj: { [skill: string]: number } = {};
    data.settings.psychomotor.forEach(sk => {
      psychoObj[sk] = existingPsycho[sk] || 0;
    });

    const existingCmt = (data.comments[cKey] || {}) as CommentRecord;
    const defaultTeacherInitials = data.settings.classTeachers[selectedClass]?.initials || '';
    const defaultHeadInitials = data.settings.headTeacherInitials || '';

    let loadedMarks = marksObj;
    let loadedPsycho = psychoObj;
    let loadedTeacherCmt = existingCmt.teacher || '';
    let loadedHeadCmt = existingCmt.head || '';
    let loadedTeacherInitials = existingCmt.teacherInitials || defaultTeacherInitials;
    let loadedHeadInitials = existingCmt.headInitials || defaultHeadInitials;
    let loadedNextTermBegins = existingCmt.nextTermBegins || '';

    // Check if a saved local storage draft exists for this specific student & exam set
    const draftStr = localStorage.getItem(`school_scores_draft_${selectedLearner}_${selectedExamSet}`);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        // Verify if draft actually has differences from db state before activating restoration alert
        const isDiff = 
          JSON.stringify(draft.marks) !== JSON.stringify(marksObj) ||
          JSON.stringify(draft.psycho) !== JSON.stringify(psychoObj) ||
          draft.teacherCmt !== (existingCmt.teacher || '') ||
          draft.headCmt !== (existingCmt.head || '') ||
          draft.teacherInitials !== (existingCmt.teacherInitials || defaultTeacherInitials) ||
          draft.headInitials !== (existingCmt.headInitials || defaultHeadInitials) ||
          draft.nextTermBegins !== (existingCmt.nextTermBegins || '');

        if (isDiff) {
          loadedMarks = draft.marks || marksObj;
          loadedPsycho = draft.psycho || psychoObj;
          loadedTeacherCmt = draft.teacherCmt !== undefined ? draft.teacherCmt : loadedTeacherCmt;
          loadedHeadCmt = draft.headCmt !== undefined ? draft.headCmt : loadedHeadCmt;
          loadedTeacherInitials = draft.teacherInitials !== undefined ? draft.teacherInitials : loadedTeacherInitials;
          loadedHeadInitials = draft.headInitials !== undefined ? draft.headInitials : loadedHeadInitials;
          loadedNextTermBegins = draft.nextTermBegins !== undefined ? draft.nextTermBegins : loadedNextTermBegins;
          
          setDraftRestored(true);
          if (draft.updatedAt) {
            setDraftTime(new Date(draft.updatedAt).toLocaleTimeString());
          }
        }
      } catch (e) {
        console.error('Failed to parse draft from localStorage', e);
      }
    }

    setMarks(loadedMarks);
    setPsycho(loadedPsycho);
    setTeacherCmt(loadedTeacherCmt);
    setHeadCmt(loadedHeadCmt);
    setTeacherInitials(loadedTeacherInitials);
    setHeadInitials(loadedHeadInitials);
    setNextTermBegins(loadedNextTermBegins);
  }, [selectedLearner, selectedExamSet, selectedClass, data, subjects]);

  // Debounced Auto-Save Engine for Classic mode
  useEffect(() => {
    if (!selectedLearner || !selectedExamSet || entryLayoutMode !== 'classic') return;

    // Check if current form inputs differ from database state
    const cKey = `${selectedLearner}|${selectedExamSet}`;
    const existingScores = data.scores[cKey] || {};
    const existingPsycho = data.psychomotor[cKey] || {};
    const existingCmt = (data.comments[cKey] || {}) as CommentRecord;
    const defaultTeacherInitials = data.settings.classTeachers[selectedClass]?.initials || '';
    const defaultHeadInitials = data.settings.headTeacherInitials || '';

    const isMarksChanged = subjects.some(s => {
      const dbVal = existingScores[s.name] !== undefined ? String(existingScores[s.name]) : '';
      const currentVal = marks[s.name] || '';
      return dbVal !== currentVal;
    });

    const isPsychoChanged = data.settings.psychomotor.some(sk => {
      const dbVal = existingPsycho[sk] || 0;
      const currentVal = psycho[sk] || 0;
      return dbVal !== currentVal;
    });

    const isCommentsChanged = 
      (existingCmt.teacher || '') !== teacherCmt ||
      (existingCmt.head || '') !== headCmt ||
      (existingCmt.teacherInitials || defaultTeacherInitials) !== teacherInitials ||
      (existingCmt.headInitials || defaultHeadInitials) !== headInitials ||
      (existingCmt.nextTermBegins || '') !== nextTermBegins;

    const hasUnsavedChanges = isMarksChanged || isPsychoChanged || isCommentsChanged;

    if (!hasUnsavedChanges) {
      localStorage.removeItem(`school_scores_draft_${selectedLearner}_${selectedExamSet}`);
      setDraftRestored(false);
      setDraftTime(null);
      return;
    }

    // Set debouncing state immediately upon user input
    setAutoSaveStatus('debouncing');

    const handler = setTimeout(() => {
      setAutoSaveStatus('saving');

      // 1. Commit Scores
      const scoresToSave: ScoreRecord = {};
      Object.entries(marks).forEach(([subj, val]) => {
        if (val !== '') scoresToSave[subj] = Number(val);
      });
      onUpdateScores(cKey, scoresToSave);

      // 2. Commit Psychomotor
      onUpdatePsychomotor(cKey, psycho);

      // 3. Commit Comments
      onUpdateComments(cKey, {
        teacher: teacherCmt,
        head: headCmt,
        teacherInitials: teacherInitials,
        headInitials: headInitials,
        nextTermBegins: nextTermBegins
      });

      // Clear draft since values are now saved to database
      localStorage.removeItem(`school_scores_draft_${selectedLearner}_${selectedExamSet}`);
      setDraftRestored(false);
      setDraftTime(null);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setAutoSaveStatus('saved');
    }, 800);

    return () => clearTimeout(handler);
  }, [marks, psycho, teacherCmt, headCmt, teacherInitials, headInitials, nextTermBegins, selectedLearner, selectedExamSet, entryLayoutMode, data, subjects, selectedClass, onUpdateScores, onUpdatePsychomotor, onUpdateComments]);

  // Unified Marks Loader and Handlers
  const lastLoadedLearnerRef = React.useRef<string>('');
  
  useEffect(() => {
    setUnifiedDraftRestored(false);
    setUnifiedDraftTime(null);

    if (!selectedLearner) {
      setUnifiedMarks({});
      lastLoadedLearnerRef.current = '';
      return;
    }
    
    // Load from DB
    const uniMarks: { [setId: string]: { [subject: string]: string } } = {};
    sortedTermExamSets.forEach(sSet => {
      const cKey = `${selectedLearner}|${sSet.id}`;
      const existingScores = data.scores[cKey] || {};
      const marksObj: { [subject: string]: string } = {};
      subjects.forEach(sub => {
        marksObj[sub.name] = existingScores[sub.name] !== undefined ? String(existingScores[sub.name]) : '';
      });
      uniMarks[sSet.id] = marksObj;
    });

    let loadedUnifiedMarks = uniMarks;

    // Check if saved unified draft exists in local storage
    const draftStr = localStorage.getItem(`school_scores_draft_unified_${selectedLearner}`);
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        // Verify differences
        if (JSON.stringify(draft.unifiedMarks) !== JSON.stringify(uniMarks)) {
          loadedUnifiedMarks = draft.unifiedMarks || uniMarks;
          setUnifiedDraftRestored(true);
          if (draft.updatedAt) {
            setUnifiedDraftTime(new Date(draft.updatedAt).toLocaleTimeString());
          }
        }
      } catch (e) {
        console.error('Failed to parse unified draft from localStorage', e);
      }
    }

    setUnifiedMarks(loadedUnifiedMarks);
    lastLoadedLearnerRef.current = selectedLearner;
  }, [selectedLearner, selectedClass, sortedTermExamSets, subjects, data]);

  // Debounced Auto-Save Engine for Unified mode
  useEffect(() => {
    if (!selectedLearner || entryLayoutMode !== 'unified') return;

    let hasUnsavedChanges = false;
    const uniMarksFromDB: { [setId: string]: { [subject: string]: string } } = {};
    sortedTermExamSets.forEach(sSet => {
      const cKey = `${selectedLearner}|${sSet.id}`;
      const existingScores = data.scores[cKey] || {};
      const marksObj: { [subject: string]: string } = {};
      subjects.forEach(sub => {
        const dbVal = existingScores[sub.name] !== undefined ? String(existingScores[sub.name]) : '';
        marksObj[sub.name] = dbVal;
        const currentVal = unifiedMarks[sSet.id]?.[sub.name] ?? '';
        if (dbVal !== currentVal) {
          hasUnsavedChanges = true;
        }
      });
      uniMarksFromDB[sSet.id] = marksObj;
    });

    if (!hasUnsavedChanges) {
      localStorage.removeItem(`school_scores_draft_unified_${selectedLearner}`);
      setUnifiedDraftRestored(false);
      setUnifiedDraftTime(null);
      return;
    }

    setAutoSaveStatus('debouncing');

    const handler = setTimeout(() => {
      setAutoSaveStatus('saving');

      sortedTermExamSets.forEach(sSet => {
        const cKey = `${selectedLearner}|${sSet.id}`;
        const scoresToSave: ScoreRecord = {};
        const setMarksObj = unifiedMarks[sSet.id] || {};
        Object.entries(setMarksObj).forEach(([subj, val]) => {
          if (val !== '') scoresToSave[subj] = Number(val);
        });
        onUpdateScores(cKey, scoresToSave);
      });

      localStorage.removeItem(`school_scores_draft_unified_${selectedLearner}`);
      setUnifiedDraftRestored(false);
      setUnifiedDraftTime(null);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);
      setAutoSaveStatus('saved');
    }, 800);

    return () => clearTimeout(handler);
  }, [unifiedMarks, selectedLearner, entryLayoutMode, data, sortedTermExamSets, subjects, onUpdateScores]);

  const handleUnifiedMarkChange = (setId: string, subjectName: string, value: string, max: number) => {
    const num = Number(value);
    if (value !== '' && (isNaN(num) || num < 0 || num > max)) {
      return; // prevent invalid numbers
    }
    setUnifiedMarks(prev => ({
      ...prev,
      [setId]: {
        ...(prev[setId] || {}),
        [subjectName]: value
      }
    }));
  };

  const handleUnifiedBlur = (setId: string) => {
    if (!selectedLearner || !setId) return;
    triggerAutoSaveState();
    const cKey = `${selectedLearner}|${setId}`;
    const scoresToSave: ScoreRecord = {};
    const setMarksObj = unifiedMarks[setId] || {};
    Object.entries(setMarksObj).forEach(([subj, val]) => {
      if (val !== '') scoresToSave[subj] = Number(val);
    });
    onUpdateScores(cKey, scoresToSave);
  };

  const getLiveGrade = (markStr: string) => {
    const num = Number(markStr);
    if (markStr === '' || isNaN(num)) return { grade: '-', remark: '-' };
    const band = grading.find(g => num >= g.min && num <= g.max);
    return band ? { grade: band.grade, remark: band.remark } : { grade: '-', remark: '-' };
  };

  const calculatePLEGrade = (currentMarks: { [subjectName: string]: string }) => {
    const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
    const sortedGrading = [...grading].sort((a, b) => b.min - a.min);
    
    const coreDetails = coreSubjects.map(subj => {
      let markStr = currentMarks[subj] || '';
      if (markStr === '') {
        if (subj === 'Social Studies' && currentMarks['SST'] !== undefined) markStr = currentMarks['SST'];
        if (subj === 'Social Studies' && currentMarks['S.S.T'] !== undefined) markStr = currentMarks['S.S.T'];
        if (subj === 'Mathematics' && currentMarks['Math'] !== undefined) markStr = currentMarks['Math'];
        if (subj === 'Science' && currentMarks['Sci'] !== undefined) markStr = currentMarks['Sci'];
        if (subj === 'English' && currentMarks['Eng'] !== undefined) markStr = currentMarks['Eng'];
      }
      const marksVal = markStr !== '' ? Number(markStr) : undefined;
      let grade = '-';
      let points = 9;
      let isMissing = true;

      if (marksVal !== undefined && !isNaN(marksVal)) {
        isMissing = false;
        const gradeBand = sortedGrading.find(g => marksVal >= g.min && marksVal <= g.max);
        grade = gradeBand?.grade || 'F9';
        points = getGradeRank(grade);
      }

      return {
        subject: subj,
        marks: marksVal !== undefined ? marksVal : null,
        grade,
        points,
        isMissing
      };
    });

    const satCore = coreDetails.filter(c => !c.isMissing);
    const hasAllCore = satCore.length === 4;

    // Estimate missing core points based on student's core average, or default to 9
    let predictedAggregate = 36;
    let isEstimated = false;

    if (hasAllCore) {
      predictedAggregate = coreDetails.reduce((sum, c) => sum + c.points, 0);
    } else if (satCore.length > 0) {
      isEstimated = true;
      const avgPoints = satCore.reduce((sum, c) => sum + c.points, 0) / satCore.length;
      const roundedAvg = Math.round(avgPoints);
      predictedAggregate = coreDetails.reduce((sum, c) => {
        return sum + (c.isMissing ? roundedAvg : c.points);
      }, 0);
    } else {
      predictedAggregate = 36; // Default to worst if absolutely no scores
    }

    // Division calculation based on the predictedAggregate (or aggregate if all sat)
    let division = 'Division U';
    let label = 'Ungraded (Fail)';
    let badgeColor = 'bg-rose-50 text-rose-600 border-rose-100';
    let textColor = 'text-rose-600';

    const engGrade = coreDetails.find(c => c.subject === 'English')?.points ?? 9;
    const mathGrade = coreDetails.find(c => c.subject === 'Mathematics')?.points ?? 9;
    
    const rules = data.settings.pleOverride || { enabled: false };

    if (rules.enabled) {
      if (predictedAggregate <= 12) {
        if (engGrade > rules.englishMinGradeForDiv1 || mathGrade > rules.mathMinGradeForDiv1) {
          division = 'Division 2';
        } else {
          division = 'Division 1';
        }
      } else if (predictedAggregate <= 24) {
        if (engGrade > rules.englishMinGradeForDiv2 || mathGrade > rules.mathMinGradeForDiv2) {
          division = 'Division 3';
        } else {
          division = 'Division 2';
        }
      } else if (predictedAggregate <= 28) {
        division = 'Division 3';
      } else if (predictedAggregate <= 32) {
        division = 'Division 4';
      } else {
        division = 'Division U';
      }
    } else {
      if (predictedAggregate <= 12) division = 'Division 1';
      else if (predictedAggregate <= 24) division = 'Division 2';
      else if (predictedAggregate <= 28) division = 'Division 3';
      else if (predictedAggregate <= 32) division = 'Division 4';
      else division = 'Division U';
    }

    if (division === 'Division 1') {
      label = 'Superb Distinction';
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
      textColor = 'text-blue-700';
    } else if (division === 'Division 2') {
      label = 'Strong Credit';
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      textColor = 'text-emerald-700';
    } else if (division === 'Division 3') {
      label = 'Satisfactory Pass';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      textColor = 'text-amber-700';
    } else if (division === 'Division 4') {
      label = 'Basic Pass';
      badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
      textColor = 'text-orange-700';
    }

    return {
      aggregate: predictedAggregate,
      division,
      label,
      badgeColor,
      textColor,
      isEstimated,
      satCount: satCore.length,
      coreDetails
    };
  };

  const classRankings = React.useMemo(() => {
    if (!selectedExamSet) return { ranked: [], ungraded: [] };
    
    const rankedList = classLearners.map(learner => {
      const cKey = `${learner.id}|${selectedExamSet}`;
      const scoreRecord = data.scores[cKey] || {};
      
      const stringMarks: { [subjectName: string]: string } = {};
      let totalMarks = 0;
      let satCount = 0;
      
      Object.entries(scoreRecord).forEach(([sub, val]) => {
        if (val !== undefined && val !== null) {
          stringMarks[sub] = String(val);
          totalMarks += Number(val);
          satCount++;
        }
      });
      
      const pleResult = calculatePLEGrade(stringMarks);
      const averageMark = satCount > 0 ? totalMarks / satCount : 0;
      
      return {
        learner,
        aggregate: pleResult.aggregate,
        division: pleResult.division,
        satCount,
        averageMark,
        scoreRecord,
        pleResult
      };
    });

    const gradedStudents = rankedList.filter(s => s.satCount > 0);
    const ungradedStudents = rankedList.filter(s => s.satCount === 0);

    // Sort graded:
    // 1. By aggregate PLE point performance (LOWER is better!)
    // 2. By average mark (HIGHER is better) as tie-breaker
    gradedStudents.sort((a, b) => {
      if (a.aggregate !== b.aggregate) {
        return a.aggregate - b.aggregate;
      }
      return b.averageMark - a.averageMark;
    });

    let currentRank = 1;
    const rankedStudents = gradedStudents.map((student, index) => {
      if (index > 0) {
        const prev = gradedStudents[index - 1];
        if (student.aggregate !== prev.aggregate || student.averageMark !== prev.averageMark) {
          currentRank = index + 1;
        }
      }
      return {
        ...student,
        rank: currentRank
      };
    });

    return {
      ranked: rankedStudents,
      ungraded: ungradedStudents
    };
  }, [classLearners, selectedExamSet, data.scores, examMode, selectedClass]);

  const handleMarkChange = (subject: string, value: string, max: number) => {
    if (sectionKey !== 'preprimary') {
      const num = Number(value);
      if (value !== '' && (isNaN(num) || num < 0 || num > max)) {
        return; // prevent invalid numbers
      }
    }
    setMarks(prev => ({ ...prev, [subject]: value }));
  };

  const handleSaveAll = () => {
    if (!selectedLearner || !selectedExamSet) {
      alert('Please select a student and an exam set before saving.');
      return;
    }

    const cKey = `${selectedLearner}|${selectedExamSet}`;

    // 1. Save Scores
    const scoresToSave: ScoreRecord = {};
    Object.entries(marks).forEach(([subj, val]) => {
      if (val !== '') scoresToSave[subj] = sectionKey === 'preprimary' ? String(val) : Number(val);
    });
    onUpdateScores(cKey, scoresToSave);

    // 2. Save Psychomotor
    onUpdatePsychomotor(cKey, psycho);

    // 3. Save Comments
    onUpdateComments(cKey, {
      teacher: teacherCmt,
      head: headCmt,
      teacherInitials: teacherInitials,
      headInitials: headInitials,
      nextTermBegins: nextTermBegins
    });
    
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Results saved successfully!', type: 'success' } }));
  };

  // Handle saving via keyboard (Ctrl+S or Cmd+S)
  const saveAllRef = React.useRef(handleSaveAll);
  React.useEffect(() => {
    saveAllRef.current = handleSaveAll;
  });

  React.useEffect(() => {
    const handleShortcutSave = () => {
      saveAllRef.current();
    };
    window.addEventListener('otec-shortcut-save', handleShortcutSave);
    return () => {
      window.removeEventListener('otec-shortcut-save', handleShortcutSave);
    };
  }, []);

  // CSV Matching Student Logic
  const findMatchingStudentInClass = (csvVal: string, type: 'name' | 'admNo' | 'id') => {
    const cleanedCsv = csvVal.trim().toLowerCase();
    if (!cleanedCsv) return null;

    if (type === 'id') {
      return classLearners.find(l => l.id.toLowerCase() === cleanedCsv) || null;
    }
    if (type === 'admNo') {
      const cleanAdm = (s: string) => s.replace(/[^a-z0-9]/g, '').toLowerCase();
      const target = cleanAdm(cleanedCsv);
      return classLearners.find(l => cleanAdm(l.admNo) === target) || null;
    }

    // Exact Match
    const exact = classLearners.find(l => l.name.trim().toLowerCase() === cleanedCsv);
    if (exact) return exact;

    // Word-based Match (order independent: e.g. "John Mugerwa" vs "Mugerwa John")
    const csvWords = cleanedCsv.split(/\s+/).filter(Boolean);
    const wordMatch = classLearners.find(l => {
      const sysWords = l.name.toLowerCase().split(/\s+/).filter(Boolean);
      if (csvWords.length !== sysWords.length) return false;
      return sysWords.every(w => csvWords.includes(w));
    });
    if (wordMatch) return wordMatch;

    // Partial/substring match
    const partialMatch = classLearners.find(l => {
      const sysName = l.name.toLowerCase();
      return sysName.includes(cleanedCsv) || cleanedCsv.includes(sysName);
    });
    return partialMatch || null;
  };

  // Generate real-time preview of mapped CSV rows against active class roster
  const generateCSVPreview = (
    rows: string[][],
    headers: string[],
    mapping: {
      studentIdentifierCol: string;
      studentIdentifierType: 'name' | 'admNo' | 'id';
      subjectMappings: { [subjectName: string]: string };
    }
  ) => {
    const studentColIndex = headers.indexOf(mapping.studentIdentifierCol);
    if (studentColIndex === -1) {
      setCSVFeedback(null);
      return;
    }

    const updatesPreview: Array<{
      learnerId: string;
      learnerName: string;
      learnerAdmNo: string;
      status: 'matched' | 'unmatched';
      currentScores: { [subj: string]: number | string };
      newScores: { [subj: string]: number | string };
      warnings: string[];
    }> = [];
    let matchedCount = 0;

    rows.forEach(row => {
      const csvIdentifierVal = row[studentColIndex];
      if (!csvIdentifierVal || csvIdentifierVal.trim() === '') return;

      const matchedStudent = findMatchingStudentInClass(csvIdentifierVal, mapping.studentIdentifierType);
      
      const newScores: { [subj: string]: number | string } = {};
      const warnings: string[] = [];

      subjects.forEach(sub => {
        const csvColHeader = mapping.subjectMappings[sub.name];
        if (!csvColHeader) return;

        const colIdx = headers.indexOf(csvColHeader);
        if (colIdx === -1) return;

        const valStr = row[colIdx];
        if (valStr === undefined || valStr === null || valStr.trim() === '') return;

        const valNum = Number(valStr);
        if (isNaN(valNum)) {
          warnings.push(`Subject '${sub.name}': Invalid non-numeric score '${valStr}'`);
          return;
        }

        if (valNum < 0 || valNum > sub.max) {
          warnings.push(`Subject '${sub.name}': Score ${valNum} exceeds maximum limits (0-${sub.max})`);
          return;
        }

        newScores[sub.name] = valNum;
      });

      if (matchedStudent) {
        matchedCount++;
        const cKey = `${matchedStudent.id}|${selectedExamSet}`;
        const currentScoreRecord = data.scores[cKey] || {};

        updatesPreview.push({
          learnerId: matchedStudent.id,
          learnerName: matchedStudent.name,
          learnerAdmNo: matchedStudent.admNo,
          status: 'matched',
          currentScores: currentScoreRecord,
          newScores,
          warnings
        });
      } else {
        updatesPreview.push({
          learnerId: '',
          learnerName: csvIdentifierVal,
          learnerAdmNo: '',
          status: 'unmatched',
          currentScores: {},
          newScores,
          warnings: [...warnings, `Student '${csvIdentifierVal}' not found in roster for ${selectedClass}`]
        });
      }
    });

    setCSVFeedback({
      totalRows: rows.length,
      matchedLearnersCount: matchedCount,
      updatesPreview
    });
  };

  // Trigger when mapping setup changes or on initialization
  const handleCSVMappingChange = (key: string, value: string, isSubject: boolean = false) => {
    let newMapping;
    if (isSubject) {
      newMapping = {
        ...csvMapping,
        subjectMappings: {
          ...csvMapping.subjectMappings,
          [key]: value
        }
      };
    } else {
      newMapping = {
        ...csvMapping,
        [key]: value
      };
    }
    setCSVMapping(newMapping);
    generateCSVPreview(csvRows, csvHeaders, newMapping);
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCSVFile(file);
  };

  const processCSVFile = (file: File) => {
    setCSVFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert("The uploaded CSV file is empty or formatted incorrectly.");
        return;
      }
      const headers = parsed[0].map(h => h.trim());
      const rows = parsed.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));

      setCSVHeaders(headers);
      setCSVRows(rows);

      // Try guessing student identifier column
      const guessedStudentCol = headers.find(h => /name|student|learner|full\s*name/i.test(h)) || headers[0] || '';
      const guessedStudentType = /adm|no|reg|admission/i.test(guessedStudentCol) ? 'admNo' : 'name';

      // Guess subject mappings
      const guessedSubjectMappings: { [subjectName: string]: string } = {};
      subjects.forEach(sub => {
        guessedSubjectMappings[sub.name] = guessSubjectColumn(sub.name, headers);
      });

      const initialMapping = {
        studentIdentifierCol: guessedStudentCol,
        studentIdentifierType: guessedStudentType as 'name' | 'admNo' | 'id',
        subjectMappings: guessedSubjectMappings
      };

      setCSVMapping(initialMapping);
      generateCSVPreview(rows, headers, initialMapping);
    };
    reader.readAsText(file);
  };

  const handleApplyCSVScores = () => {
    if (!csvFeedback || csvFeedback.matchedLearnersCount === 0) {
      alert("No matched students were found to apply. Please check your mapping or selected class.");
      return;
    }

    const confirmMsg = `Are you sure you want to bulk-update scores for ${csvFeedback.matchedLearnersCount} students in ${selectedClass} for the selected exam set? Existing scores will be merged and updated.`;
    if (!confirm(confirmMsg)) return;

    const mergedScores = { ...data.scores };

    csvFeedback.updatesPreview.forEach(item => {
      if (item.status === 'matched') {
        const cKey = `${item.learnerId}|${selectedExamSet}`;
        const existingRecord = mergedScores[cKey] || {};
        
        mergedScores[cKey] = {
          ...existingRecord,
          ...item.newScores
        };
      }
    });

    // Save to DB
    dataManager.setData({
      ...data,
      scores: mergedScores
    });

    // Reset CSV upload state
    setShowCSVUpload(false);
    setCSVFile(null);
    setCSVHeaders([]);
    setCSVRows([]);
    setCSVFeedback(null);

    // Dispatch toast event
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Successfully bulk-imported scoresheet from CSV for ${csvFeedback.matchedLearnersCount} students!`,
        type: 'success'
      }
    }));
  };

  const handleApplyBulkGrades = (updatedScoresMap: { [compositeKey: string]: ScoreRecord }, summaryMessage: string) => {
    Object.entries(updatedScoresMap).forEach(([compositeKey, scoreRecord]) => {
      onUpdateScores(compositeKey, scoreRecord);
    });

    triggerAutoSaveState();

    try {
      dataManager.addActivityLog('scores_recorded', summaryMessage);
    } catch (err) {
      console.log(err);
    }

    if (selectedLearner && selectedExamSet) {
      const currentKey = `${selectedLearner}|${selectedExamSet}`;
      if (updatedScoresMap[currentKey]) {
        const currentUpdated = updatedScoresMap[currentKey];
        setMarks(prev => {
          const nextMarks = { ...prev };
          Object.entries(currentUpdated).forEach(([subj, val]) => {
            if (val !== undefined && val !== null) {
              nextMarks[subj] = String(val);
            }
          });
          return nextMarks;
        });
      }
    }

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: summaryMessage,
        type: 'success'
      }
    }));
  };

  // AI comment generating loading states
  const [generatingTeacher, setGeneratingTeacher] = useState(false);
  const [generatingHead, setGeneratingHead] = useState(false);
  const [teacherGenTone, setTeacherGenTone] = useState<'balanced' | 'supportive' | 'remedial' | null>(null);
  const [headGenTone, setHeadGenTone] = useState<'balanced' | 'supportive' | 'remedial' | null>(null);

  const [generatingPrePrimary, setGeneratingPrePrimary] = useState<Record<string, boolean>>({});

  // ─── Nursery Fallback Comment Bank ────────────────────────────────────────
  // Used when offline or when the AI backend is unavailable.
  // Organised by learning area keyword (case-insensitive substring match).
  const NURSERY_FALLBACK_COMMENTS: Record<string, string[]> = {
    'social development': [
      '{name} shows a warm and friendly nature towards classmates and participates actively in group activities.',
      '{name} is learning to share and cooperate with peers, showing steady progress in social interactions.',
      '{name} demonstrates growing confidence in social settings and enjoys collaborative play with friends.',
      '{name} is kind and respectful to others, and is developing strong interpersonal skills.',
      '{name} participates enthusiastically in group activities and is becoming a helpful member of the class.',
    ],
    'environmental exploration': [
      '{name} shows curiosity about the world around them and asks thoughtful questions during outdoor explorations.',
      '{name} actively observes nature and surroundings, demonstrating a growing interest in the environment.',
      '{name} enjoys hands-on discovery activities and is developing good observational skills.',
      '{name} is beginning to understand the connection between living things and their environment.',
      '{name} shows enthusiasm for exploring and discovering new things in the natural world.',
    ],
    'health': [
      '{name} is developing good personal hygiene habits and understands the importance of cleanliness.',
      '{name} is learning to take care of their body and follows daily health routines with little prompting.',
      '{name} shows awareness of healthy food choices and personal safety practices.',
      '{name} participates positively in physical activities and demonstrates an understanding of keeping healthy.',
      '{name} is growing in their ability to care for themselves independently and maintains good hygiene.',
    ],
    'language development': [
      '{name} is making excellent progress in expressing ideas clearly and listening attentively during class discussions.',
      '{name} shows a growing vocabulary and eagerly participates in story time and language activities.',
      '{name} is developing strong listening skills and enjoys sharing their thoughts with the class.',
      '{name} communicates with increasing confidence and demonstrates a love for stories and language.',
      '{name} is expanding their ability to express needs and ideas clearly, both verbally and through drawing.',
    ],
    'mathematical': [
      '{name} is developing a solid understanding of numbers and enjoys counting activities with enthusiasm.',
      '{name} can identify basic shapes and patterns and is growing in their mathematical confidence.',
      '{name} participates actively in number games and is beginning to grasp simple addition concepts.',
      '{name} shows a natural curiosity about quantities and comparisons, which is building a strong math foundation.',
      '{name} is progressing well in early numeracy skills, including sorting, matching, and counting objects.',
    ],
    // Generic fallback for any unrecognised subject
    'default': [
      '{name} is making good progress and shows enthusiasm in learning activities.',
      '{name} participates actively in class and demonstrates a positive attitude towards learning.',
      '{name} is growing in confidence and engages well with all classroom activities.',
      '{name} shows curiosity and creativity, and continues to develop their skills steadily.',
      '{name} is a focused learner who always tries their best in every activity.',
    ],
  };

  const getNurseryFallback = (subjectName: string, studentName: string): string => {
    const lower = subjectName.toLowerCase();
    const matchedKey = Object.keys(NURSERY_FALLBACK_COMMENTS).find(
      k => k !== 'default' && lower.includes(k)
    ) || 'default';
    const pool = NURSERY_FALLBACK_COMMENTS[matchedKey];
    const comment = pool[Math.floor(Math.random() * pool.length)];
    return comment.replace(/\{name\}/g, studentName.split(' ')[0] || studentName);
  };

  const generatePrePrimaryComment = async (subjectName: string) => {
    if (!selectedLearner) return;
    const activeLearner = classLearners.find(l => l.id === selectedLearner);
    const studentName = activeLearner ? activeLearner.name : 'the student';

    setGeneratingPrePrimary(prev => ({ ...prev, [subjectName]: true }));

    // Helper: use offline fallback and show a toast
    const useFallback = (reason: string) => {
      const fallbackText = getNurseryFallback(subjectName, studentName);
      setMarks(prev => ({ ...prev, [subjectName]: fallbackText }));
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: { message: `📵 ${reason} — Using offline comment instead.`, type: 'warning' }
      }));
    };

    // Check offline first — skip API call entirely
    if (!navigator.onLine) {
      useFallback('You are offline');
      setGeneratingPrePrimary(prev => ({ ...prev, [subjectName]: false }));
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch('http://localhost:3001/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          contents: `You are a warm early childhood educator. Write a short (1-2 sentences), encouraging observation for ${studentName.split(' ')[0]} in the learning area of "${subjectName}". Use simple, kind words suitable for a parent to read. Do NOT include a grade or score.`
        })
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const resData = await response.json();

      if (resData.success && resData.text) {
        setMarks(prev => ({ ...prev, [subjectName]: resData.text.trim() }));
        window.dispatchEvent(new CustomEvent('otec-toast', {
          detail: { message: `✨ AI observation generated for ${subjectName}`, type: 'success' }
        }));
      } else {
        throw new Error('AI returned empty response');
      }
    } catch (e: any) {
      // Categorise the error for a helpful message
      const isOffline = !navigator.onLine;
      const isTimeout = e?.name === 'AbortError';
      const isServerDown = e?.message?.includes('fetch') || e?.message?.includes('Failed to fetch') || e?.message?.includes('Server responded');

      const reason = isOffline
        ? 'No internet connection'
        : isTimeout
        ? 'AI server timed out (8s)'
        : isServerDown
        ? 'AI server not running — start with: npm run server'
        : `AI error: ${e?.message || 'Unknown'}`;

      console.warn('[Nursery AI]', reason, e);
      useFallback(reason);
    } finally {
      setGeneratingPrePrimary(prev => ({ ...prev, [subjectName]: false }));
    }
  };

  // AI-style Auto-generate comment
  const handleAutoComment = async (role: 'teacher' | 'head', tone: 'balanced' | 'supportive' | 'remedial' = 'balanced') => {
    const validMarks = Object.values(marks).filter(v => v !== '').map(Number);
    if (validMarks.length === 0) {
      alert('Please record some marks first before generating remarks.');
      return;
    }

    const average = Math.round(validMarks.reduce((a, b) => a + b, 0) / validMarks.length);
    const band = grading.find(g => average >= g.min && average <= g.max);
    if (!band) return;

    // 1. Calculate static fallback first in case server or API fails
    const pool = role === 'teacher' ? band.classComments : band.headComments;
    const fallbackText = role === 'teacher' 
      ? 'A steady and positive performance. Keep aiming higher.' 
      : 'Please support the student’s homework efforts at home.';
    const staticComment = pool && pool.length > 0 
      ? pool[Math.floor(Math.random() * pool.length)] 
      : fallbackText;

    // 2. Set loading state
    if (role === 'teacher') {
      setGeneratingTeacher(true);
      setTeacherGenTone(tone);
    } else {
      setGeneratingHead(true);
      setHeadGenTone(tone);
    }

    try {
      const activeLearner = classLearners.find(l => l.id === selectedLearner);
      const studentName = activeLearner ? activeLearner.name : 'the student';

      const subjectMarks: Record<string, number> = {};
      Object.entries(marks).forEach(([subj, val]) => {
        if (val !== '') subjectMarks[subj] = Number(val);
      });

      const functions = getFunctions(app);
      const generateComment = httpsCallable(functions, 'generateComment');
      
      const response = await generateComment({
        studentName,
        subjectMarks,
        average,
        overallGrade: band.remark,
        role,
        classLevel: selectedClass,
        tone,
      });

      const resData = response.data as { comment: string };
      if (resData.comment) {
        if (role === 'teacher') {
          setTeacherCmt(resData.comment);
          autoSaveComments({ teacher: resData.comment });
        } else {
          setHeadCmt(resData.comment);
          autoSaveComments({ head: resData.comment });
        }
      } else {
        // Fallback to static selection
        console.warn("AI returned empty, falling back to static comment pool.");
        if (role === 'teacher') {
          setTeacherCmt(staticComment);
          autoSaveComments({ teacher: staticComment });
        } else {
          setHeadCmt(staticComment);
          autoSaveComments({ head: staticComment });
        }
      }
    } catch (err) {
      console.error("Failed to query Gemini API comment generator, falling back to local pool:", err);
      if (role === 'teacher') {
        setTeacherCmt(staticComment);
        autoSaveComments({ teacher: staticComment });
      } else {
        setHeadCmt(staticComment);
        autoSaveComments({ head: staticComment });
      }
    } finally {
      if (role === 'teacher') {
        setGeneratingTeacher(false);
        setTeacherGenTone(null);
      } else {
        setGeneratingHead(false);
        setHeadGenTone(null);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Grades & Comments Recorder</h2>
          <p className="text-slate-500 text-xs mt-1">
            Record subject marks, rate psychomotor development skills, and configure custom comments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <AutoSaveIndicatorBadge status={autoSaveStatus} lastSavedTime={lastSavedTime} />
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            Active Class: {selectedClass}
          </span>
          <button
            type="button"
            onClick={() => {
              setActiveScoresTab('school-matrix');
              const el = document.getElementById('otec-scores-matrix-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
          >
            <Building2 size={14} className="fill-white/20" />
            <span>🏫 All Classes Marks Status</span>
            {allClassesMatrixData.missedClassesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {allClassesMatrixData.missedClassesCount} Missed
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowBulkAssignModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
          >
            <Zap size={14} className="fill-white" />
            <span>⚡ Bulk Grade Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!selectedExamSet) {
                alert("Please select or add an exam set first before importing scores.");
                return;
              }
              setShowCSVUpload(true);
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-md shadow-slate-800/10 cursor-pointer flex items-center gap-1.5 transition-all uppercase tracking-wider"
          >
            <span>📁 Bulk CSV Upload</span>
          </button>
        </div>
      </div>

      {/* Selector Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Select Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            >
              {ALL_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Select Exam Set</label>
              <button
                type="button"
                onClick={() => setShowQuickAddExam(true)}
                className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                + Quick Add Set
              </button>
            </div>
            <select
              value={selectedExamSet}
              onChange={e => setSelectedExamSet(e.target.value)}
              disabled={classExamSets.length === 0}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50"
            >
              {classExamSets.map(s => (
                <option key={s.id} value={s.id}>{s.term} — Set {s.setNo} {s.period} ({s.label})</option>
              ))}
              {classExamSets.length === 0 && <option value="">No active exam sets found</option>}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Select Student</label>
              <input
                type="text"
                placeholder="🔍 Search Student..."
                value={learnerSearch}
                onChange={e => {
                  setLearnerSearch(e.target.value);
                  const val = e.target.value.toLowerCase();
                  const matches = classLearners.filter(l => 
                    l.name.toLowerCase().includes(val) || 
                    (l.admNo && l.admNo.toLowerCase().includes(val))
                  );
                  if (matches.length > 0) {
                    setSelectedLearner(matches[0].id);
                  }
                }}
                className="px-2.5 py-1 max-w-[135px] bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 focus:bg-white focus:outline-hidden transition-all"
              />
            </div>
            <select
              value={selectedLearner}
              onChange={e => setSelectedLearner(e.target.value)}
              disabled={classLearners.length === 0}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50"
            >
              {classLearners
                .filter(l => 
                  l.name.toLowerCase().includes(learnerSearch.toLowerCase()) || 
                  (l.admNo && l.admNo.toLowerCase().includes(learnerSearch.toLowerCase()))
                )
                .map(l => (
                  <option key={l.id} value={l.id}>{l.name} {l.admNo ? `(${l.admNo})` : ''}</option>
                ))}
              {classLearners.length > 0 && classLearners.filter(l => 
                l.name.toLowerCase().includes(learnerSearch.toLowerCase()) || 
                (l.admNo && l.admNo.toLowerCase().includes(learnerSearch.toLowerCase()))
              ).length === 0 && <option value="">No matching students</option>}
              {classLearners.length === 0 && <option value="">No students in class stream</option>}
            </select>
          </div>
        </div>

        {/* UNEB PLE Exam Mode Toggle and Info Panel */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  🛡️ UNEB PLE Exam Mode
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${examMode ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                  {examMode ? 'Active (Mock Rules Enforced)' : 'Inactive (School Defaults)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-normal max-w-3xl">
                Enables UNEB PLE official grading scale (<span className="font-bold text-slate-700">D1: 90-100%</span>, <span className="font-bold text-slate-700">D2: 80-89%</span>, <span className="font-bold text-slate-700">C3: 70-79%</span>, up to <span className="font-bold text-slate-700">F9: 0-39%</span>) and PLE Division aggregate thresholds. Designed to evaluate student mock examinations using official national criteria.
              </p>
            </div>
            <button
              type="button"
              id="otec-exam-mode-toggle"
              onClick={() => {
                const newVal = !examMode;
                setExamMode(newVal);
                localStorage.setItem('otec_exam_mode', String(newVal));
              }}
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${examMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <span className="sr-only">Toggle UNEB Exam Mode</span>
              <span
                className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${examMode ? 'translate-x-5.5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {examMode && (
            <div className="mt-4 p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-xl space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 text-xs font-black text-indigo-800">
                <span>📊 Official UNEB PLE Assessment Matrices</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grading Thresholds Column */}
                <div className="bg-white border border-indigo-50 p-3 rounded-lg shadow-3xs">
                  <span className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">PLE Grading Bands Matrix</span>
                  <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">D1 (1 pt)</span>
                      <span className="text-[9px] text-slate-500 font-medium">90 - 100%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">D2 (2 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">80 - 89%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">C3 (3 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">70 - 79%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">C4 (4 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">60 - 69%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">C5 (5 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">55 - 59%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">C6 (6 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">50 - 54%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">P7 (7 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">45 - 49%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800">P8 (8 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">40 - 44%</span>
                    </div>
                    <div className="border border-slate-100 p-1.5 rounded-md text-center bg-slate-50/50">
                      <span className="block font-bold text-slate-800 text-rose-600">F9 (9 pts)</span>
                      <span className="text-[9px] text-slate-500 font-medium">0 - 39%</span>
                    </div>
                  </div>
                </div>

                {/* Division Thresholds Column */}
                <div className="bg-white border border-indigo-50 p-3 rounded-lg shadow-3xs flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">PLE Division Classification Rules</span>
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-700">Division 1 (First Grade)</span>
                        <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">4 to 12 points</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-700">Division 2 (Second Grade)</span>
                        <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">13 to 24 points</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-700">Division 3 (Third Grade)</span>
                        <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">25 to 28 points</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-700">Division 4 (Fourth Grade)</span>
                        <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">29 to 32 points</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[9.5px] text-indigo-600 font-bold bg-indigo-50/40 p-2 rounded-md mt-2 flex items-center gap-1.5">
                    <span>💡 Standard UNEB rules require candidates to pass English and Mathematics to achieve Division 1.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedLearner || !selectedExamSet ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
          {(data.learners || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-3xs">
                  <Users size={26} className="stroke-[1.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                  !
                </div>
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">Student Registry Required</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  You must register students before you can record grades, manage marks, or write end-of-term evaluations.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'learners' }))}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Users size={12} />
                  <span>Go to Learner Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'data' }))}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={12} className="text-emerald-600" />
                  <span>Import Excel Roster</span>
                </button>
              </div>
            </div>
          ) : classExamSets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-3xs">
                  <ClipboardList size={26} className="stroke-[1.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-black">
                  +
                </div>
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">No Assessment Sets Setup</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  No active exam sets exist for class {selectedClass}. You must configure an assessment set (e.g., BOT, MOT, EOT) to enter and compile marksheet grades.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAddExam(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={12} />
                  <span>Create Exam Set</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'data' }))}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={12} className="text-emerald-600" />
                  <span>Import Excel Scoresheet</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
                <FileEdit size={22} className="stroke-[1.5]" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">Record Sheet Ready</h3>
                <p className="text-[10.5px] text-slate-400 font-bold leading-relaxed">
                  Please select an active Student and an Exam Set from the selection dropdowns above to initiate grades & comments recording.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Draft Restored Banner */}
          {((entryLayoutMode === 'classic' && draftRestored) || (entryLayoutMode === 'unified' && unifiedDraftRestored)) && (
            <div className="lg:col-span-12 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in slide-in-from-top duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="text-amber-600 mt-0.5 shrink-0 animate-pulse" size={18} />
                <div>
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Unsaved Progress Restored</h4>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    We've recovered your auto-saved session {entryLayoutMode === 'classic' ? (draftTime ? `from ${draftTime}` : '') : (unifiedDraftTime ? `from ${unifiedDraftTime}` : '')}. 
                    These inputs are kept in your browser's local storage and are not yet committed to the main school database.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={entryLayoutMode === 'classic' ? discardClassicDraft : discardUnifiedDraft}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <X size={11} /> Discard Draft
                </button>
                <button
                  type="button"
                  onClick={entryLayoutMode === 'classic' ? handleSaveAll : () => {
                    // Save all unified sets
                    sortedTermExamSets.forEach(sSet => {
                      const cKey = `${selectedLearner}|${sSet.id}`;
                      const scoresToSave: ScoreRecord = {};
                      const setMarksObj = unifiedMarks[sSet.id] || {};
                      Object.entries(setMarksObj).forEach(([subj, val]) => {
                        if (val !== '') scoresToSave[subj] = Number(val);
                      });
                      onUpdateScores(cKey, scoresToSave);
                    });
                    localStorage.removeItem(`school_scores_draft_unified_${selectedLearner}`);
                    setUnifiedDraftRestored(false);
                    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Successfully saved all unified marks to school database!', type: 'success' } }));
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <Save size={11} /> Commit to Database
                </button>
              </div>
            </div>
          )}
          {/* Marks Entry Spreadsheet (col span 7) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileEdit size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-950">Academic Grades Grid</h3>
                <AutoSaveIndicatorBadge status={autoSaveStatus} lastSavedTime={lastSavedTime} />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAssignModal(true)}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Apply average or specific marks to multiple learners"
                >
                  <Zap size={12} className="text-indigo-600 fill-indigo-600" />
                  <span>⚡ Bulk Assign Marks</span>
                </button>

                <div className="flex items-center bg-slate-100 border border-slate-200/50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEntryLayoutMode('classic')}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                      entryLayoutMode === 'classic'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Single Set
                  </button>
                  {sectionKey !== 'preprimary' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEntryLayoutMode('unified');
                      // Reset student loaded ref to force refresh when switching
                      lastLoadedLearnerRef.current = '';
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      entryLayoutMode === 'unified'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>Sets 1, 2 &amp; 3</span>
                    <span className="bg-blue-500 text-white text-[8px] font-extrabold px-1 rounded-sm">NEW</span>
                  </button>
                  )}
                </div>
              </div>
            </div>

            {/* Dedicated Visual Pulse Notification Banner for Auto-Debounced Save */}
            {autoSaveStatus === 'debouncing' && (
              <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Auto-save debouncing active... Changes automatically committing to database in 800ms
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Debouncing...
                </span>
              </div>
            )}

            {autoSaveStatus === 'saving' && (
              <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <Loader2 size={15} className="animate-spin text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-blue-950">
                    Syncing changes directly to school database...
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Committing...
                </span>
              </div>
            )}

            {autoSaveStatus === 'saved' && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-60"></span>
                    <CheckCircle2 size={15} className="text-emerald-600 relative z-10" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950">
                    All grade changes automatically debounced &amp; saved to database {lastSavedTime ? `at ${lastSavedTime}` : ''}
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={11} /> Saved &amp; Synced
                </span>
              </div>
            )}

            {/* Live PLE Grade / Division Predictor Banner */}
            {isPLEClass && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 border border-blue-100 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-blue-600 animate-pulse" size={16} />
                    <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">Live PLE Predictor &amp; Suggester</h4>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-100/30 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Candidate Tracker
                  </span>
                </div>

                {entryLayoutMode === 'classic' ? (() => {
                  const ple = calculatePLEGrade(marks);
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-4 bg-white p-4 rounded-xl border border-blue-100/50 shadow-2xs flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Predicted Result</span>
                        <span className={`text-xl font-extrabold tracking-tight mt-1 ${ple.textColor}`}>
                          {ple.division}
                        </span>
                        <span className={`text-[11px] font-bold mt-0.5 px-2 py-0.5 rounded-md ${ple.badgeColor}`}>
                          {ple.label}
                        </span>

                        {(() => {
                          const learnerRankInfo = classRankings.ranked.find(s => s.learner.id === selectedLearner);
                          if (learnerRankInfo) {
                            return (
                              <div className="mt-3 pt-2 border-t border-slate-100 w-full font-sans">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class Standing</span>
                                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-amber-100 shadow-3xs">
                                  🏆 Rank {learnerRankInfo.rank} of {classRankings.ranked.length}
                                </span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="mt-3 pt-2 border-t border-slate-100 w-full font-sans">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class Standing</span>
                                <span className="text-[9px] font-black uppercase text-slate-400 mt-1 inline-block bg-slate-50 px-2 py-0.5 rounded-md">
                                  Not Ranked
                                </span>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      <div className="md:col-span-8 space-y-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-xs font-bold text-slate-700 block">UNEB Aggregate Score</span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                              {ple.isEstimated ? `⚠️ Estimated based on ${ple.satCount} completed core subject(s)` : 'Based on actual recorded marks'}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-slate-900">{ple.aggregate} / 36 <span className="text-xs text-slate-400 font-normal">pts</span></span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              ple.aggregate <= 12 ? 'bg-blue-600' :
                              ple.aggregate <= 24 ? 'bg-emerald-500' :
                              ple.aggregate <= 28 ? 'bg-amber-500' :
                              ple.aggregate <= 32 ? 'bg-orange-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(5, (100 * (36 - ple.aggregate)) / 32)}%` }}
                          />
                        </div>

                        {/* Core details pill grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {ple.coreDetails.map(c => (
                            <div key={c.subject} className="bg-white/80 border border-slate-100 px-2 py-1.5 rounded-lg text-center flex flex-col justify-center">
                              <span className="text-[9px] font-black text-slate-500 uppercase truncate">{c.subject === 'Social Studies' ? 'SST' : c.subject === 'Mathematics' ? 'Math' : c.subject}</span>
                              <span className={`text-xs font-black mt-0.5 ${c.isMissing ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                                {c.isMissing ? '—' : `${c.marks} (${c.grade})`}
                              </span>
                              <span className={`text-[8px] font-black uppercase tracking-wider mt-0.5 ${
                                c.isMissing ? 'text-slate-400' :
                                c.grade.startsWith('D') ? 'text-blue-600' :
                                c.grade.startsWith('C') ? 'text-emerald-600' :
                                c.grade.startsWith('P') ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {c.isMissing ? 'Pending' :
                                 c.grade.startsWith('D') ? 'Dist.' :
                                 c.grade.startsWith('C') ? 'Credit' :
                                 c.grade.startsWith('P') ? 'Pass' : 'Fail'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { set: set1Set, label: 'SET 1 (BOT)' },
                      { set: set2Set, label: 'SET 2 (MOT)' },
                      { set: set3Set, label: 'SET 3 (EOT)' }
                    ].map(({ set, label }) => {
                      if (!set) {
                        return (
                          <div key={label} className="bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center flex flex-col justify-center py-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                            <span className="text-xs text-slate-400 mt-1 font-medium italic">Not Registered</span>
                          </div>
                        );
                      }
                      
                      const setMarks = unifiedMarks[set.id] || {};
                      const ple = calculatePLEGrade(setMarks);
                      return (
                        <div key={set.id} className="bg-white p-3.5 rounded-xl border border-blue-50/50 shadow-3xs flex flex-col justify-between space-y-2.5">
                          <div className="flex justify-between items-center pb-1.5 border-b border-slate-50">
                            <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider">{label}</span>
                            <span className="text-[9.5px] font-bold text-slate-400">{ple.satCount}/4 sat</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500">Predicted:</span>
                            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${ple.badgeColor}`}>
                              {ple.division}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500">Aggregate:</span>
                            <span className="text-xs font-black text-slate-800">{ple.aggregate} pts</span>
                          </div>

                          <div className="text-center pt-1 border-t border-slate-50">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${ple.textColor}`}>
                              {ple.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mobile View Mode Switcher / Scroll Hint */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pb-1">
              <span className="flex items-center gap-1 sm:hidden text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                {mobileViewType === 'table' ? 'Swipe horizontally to view table' : 'Card View (Optimized for Mobile)'}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 ml-auto">
                <button
                  type="button"
                  onClick={() => setMobileViewType('table')}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                    mobileViewType === 'table' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setMobileViewType('cards')}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                    mobileViewType === 'cards' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>

            {mobileViewType === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {entryLayoutMode === 'unified' ? (
                  subjects.map((sub) => {
                    const set1Val = set1Set ? (unifiedMarks[set1Set.id]?.[sub.name] ?? '') : '';
                    const set2Val = set2Set ? (unifiedMarks[set2Set.id]?.[sub.name] ?? '') : '';
                    const set3Val = set3Set ? (unifiedMarks[set3Set.id]?.[sub.name] ?? '') : '';

                    const set1GradeObj = getLiveGrade(set1Val);
                    const set2GradeObj = getLiveGrade(set2Val);
                    const set3GradeObj = getLiveGrade(set3Val);

                    return (
                      <div key={sub.name} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-extrabold text-xs text-slate-900">{sub.name}</span>
                          <span className="text-[10px] font-bold text-slate-400">Max: {sub.max}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                            <span className="block text-[9px] font-black text-slate-400 uppercase">SET 1</span>
                            {set1Set ? (
                              <div className="mt-1 flex flex-col items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder="Marks"
                                  value={set1Val}
                                  onChange={e => handleUnifiedMarkChange(set1Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set1Set.id)}
                                  className="w-full text-center px-1 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600"
                                />
                                <span className={`text-[10px] font-black mt-1 ${set1GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {set1GradeObj.grade}
                                </span>
                              </div>
                            ) : <span className="text-[9px] text-slate-400 italic block mt-1">N/A</span>}
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                            <span className="block text-[9px] font-black text-slate-400 uppercase">SET 2</span>
                            {set2Set ? (
                              <div className="mt-1 flex flex-col items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder="Marks"
                                  value={set2Val}
                                  onChange={e => handleUnifiedMarkChange(set2Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set2Set.id)}
                                  className="w-full text-center px-1 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600"
                                />
                                <span className={`text-[10px] font-black mt-1 ${set2GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {set2GradeObj.grade}
                                </span>
                              </div>
                            ) : <span className="text-[9px] text-slate-400 italic block mt-1">N/A</span>}
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                            <span className="block text-[9px] font-black text-slate-400 uppercase">SET 3</span>
                            {set3Set ? (
                              <div className="mt-1 flex flex-col items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder="Marks"
                                  value={set3Val}
                                  onChange={e => handleUnifiedMarkChange(set3Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set3Set.id)}
                                  className="w-full text-center px-1 py-1 text-xs font-bold bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-600"
                                />
                                <span className={`text-[10px] font-black mt-1 ${set3GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {set3GradeObj.grade}
                                </span>
                              </div>
                            ) : <span className="text-[9px] text-slate-400 italic block mt-1">N/A</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  subjects.map((s) => {
                    const markVal = marks[s.name] || '';
                    const live = getLiveGrade(markVal);

                    return (
                      <div key={s.name} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-extrabold text-xs text-slate-900">{s.name}</span>
                          <span className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                            live.grade.startsWith('D') ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            live.grade.startsWith('C') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            live.grade.startsWith('P') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            live.grade === 'F9' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {live.grade}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-1">
                          {sectionKey === 'preprimary' ? (
                            <div className="flex-1 w-full">
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-black uppercase text-slate-400">Teacher's Observation</label>
                                <button
                                  onClick={() => generatePrePrimaryComment(s.name)}
                                  disabled={generatingPrePrimary[s.name]}
                                  title={!navigator.onLine ? 'Offline — will use pre-written comment' : 'Generate AI observation via Gemini'}
                                  className={`text-[9px] px-2 py-0.5 rounded font-bold transition-colors disabled:opacity-50 ${
                                    !navigator.onLine
                                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  }`}
                                >
                                  {generatingPrePrimary[s.name] ? '⏳ Generating...' : !navigator.onLine ? '📵 Offline Comment' : '✨ Auto AI'}
                                </button>
                              </div>
                              <textarea
                                placeholder="Enter observation or generate..."
                                value={markVal}
                                onChange={e => handleMarkChange(s.name, e.target.value, s.max)}
                                onBlur={() => autoSaveScores(marks)}
                                rows={2}
                                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-600 resize-none custom-scrollbar"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Enter Marks (0-{s.max})</label>
                                <input
                                  type="number"
                                  min="0"
                                  max={s.max}
                                  placeholder={`Max: ${s.max}`}
                                  value={markVal}
                                  onChange={e => handleMarkChange(s.name, e.target.value, s.max)}
                                  onBlur={() => autoSaveScores(marks)}
                                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-900 focus:ring-2 focus:ring-blue-600"
                                />
                              </div>
                              <div className="flex-1 text-right">
                                <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Remark</span>
                                <span className="text-[11px] font-semibold text-slate-700 block truncate">{live.remark}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : entryLayoutMode === 'unified' ? (
              <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl bg-white">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/80">
                      <th className="py-3 px-3.5 font-bold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[120px] shadow-2xs">Subject</th>
                      
                      {/* Column 1: Set 1 */}
                      <th className="py-3 px-3 font-semibold text-center w-36">
                        <span className="block text-[10px] font-black text-slate-800">SET 1 ({set1Set ? set1Set.period : 'BOT'})</span>
                        <span className="block text-[9px] text-slate-400 truncate max-w-[120px] mx-auto">{set1Set ? set1Set.label : 'Not Registered'}</span>
                      </th>
                      
                      {/* Column 2: Set 2 */}
                      <th className="py-3 px-3 font-semibold text-center w-36">
                        <span className="block text-[10px] font-black text-slate-800">SET 2 ({set2Set ? set2Set.period : 'MOT'})</span>
                        <span className="block text-[9px] text-slate-400 truncate max-w-[120px] mx-auto">{set2Set ? set2Set.label : 'Not Registered'}</span>
                      </th>
                      
                      {/* Column 3: Set 3 */}
                      <th className="py-3 px-3 font-semibold text-center w-36">
                        <span className="block text-[10px] font-black text-slate-800">SET 3 ({set3Set ? set3Set.period : 'EOT'})</span>
                        <span className="block text-[9px] text-slate-400 truncate max-w-[120px] mx-auto">{set3Set ? set3Set.label : 'Not Registered'}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((sub) => {
                      const set1Val = set1Set ? (unifiedMarks[set1Set.id]?.[sub.name] ?? '') : '';
                      const set2Val = set2Set ? (unifiedMarks[set2Set.id]?.[sub.name] ?? '') : '';
                      const set3Val = set3Set ? (unifiedMarks[set3Set.id]?.[sub.name] ?? '') : '';
                      
                      const set1GradeObj = getLiveGrade(set1Val);
                      const set2GradeObj = getLiveGrade(set2Val);
                      const set3GradeObj = getLiveGrade(set3Val);

                      return (
                        <tr key={sub.name} className="hover:bg-slate-50/40">
                          <td className="py-3 px-3.5 font-bold text-slate-800 sticky left-0 bg-white z-10 shadow-2xs border-r border-slate-100">{sub.name}</td>
                          
                          {/* Set 1 Input */}
                          <td className="py-2.5 px-3">
                            {set1Set ? (
                              <div className="flex items-center gap-2 justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder={`Max: ${sub.max}`}
                                  value={set1Val}
                                  onChange={e => handleUnifiedMarkChange(set1Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set1Set.id)}
                                  className="w-18 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                />
                                <span className={`w-8 text-[11px] font-mono font-black text-left shrink-0 ${
                                  set1GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'
                                }`}>
                                  {set1GradeObj.grade}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 block text-center italic">Unavailable</span>
                            )}
                          </td>

                          {/* Set 2 Input */}
                          <td className="py-2.5 px-3">
                            {set2Set ? (
                              <div className="flex items-center gap-2 justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder={`Max: ${sub.max}`}
                                  value={set2Val}
                                  onChange={e => handleUnifiedMarkChange(set2Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set2Set.id)}
                                  className="w-18 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                />
                                <span className={`w-8 text-[11px] font-mono font-black text-left shrink-0 ${
                                  set2GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'
                                }`}>
                                  {set2GradeObj.grade}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 block text-center italic">Unavailable</span>
                            )}
                          </td>

                          {/* Set 3 Input */}
                          <td className="py-2.5 px-3">
                            {set3Set ? (
                              <div className="flex items-center gap-2 justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.max}
                                  placeholder={`Max: ${sub.max}`}
                                  value={set3Val}
                                  onChange={e => handleUnifiedMarkChange(set3Set.id, sub.name, e.target.value, sub.max)}
                                  onBlur={() => handleUnifiedBlur(set3Set.id)}
                                  className="w-18 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                />
                                <span className={`w-8 text-[11px] font-mono font-black text-left shrink-0 ${
                                  set3GradeObj.grade === 'F9' ? 'text-rose-600' : 'text-blue-600'
                                }`}>
                                  {set3GradeObj.grade}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 block text-center italic">Unavailable</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold">
                    <tr>
                      <td className="py-3 px-3.5 font-black text-slate-800 sticky left-0 bg-slate-50 z-10 shadow-2xs border-r border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          <span>UNEB PLE Aggregate</span>
                        </div>
                      </td>
                      {[set1Set, set2Set, set3Set].map((sSet, idx) => {
                        if (!sSet) {
                          return (
                            <td key={idx} className="py-3 px-3 text-center text-slate-400 text-xs italic">
                              —
                            </td>
                          );
                        }
                        const setMarksObj = unifiedMarks[sSet.id] || {};
                        const setPle = calculatePLEGrade(setMarksObj);
                        return (
                          <td key={sSet.id} className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded font-mono font-black text-xs">
                                {setPle.aggregate} pts
                              </span>
                              <span className={`text-[9.5px] font-black uppercase ${setPle.textColor}`}>
                                {setPle.division}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-xl bg-white">
                <table className="w-full text-left text-xs min-w-[360px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/80">
                      <th className="py-3 px-3.5 font-bold text-slate-700">Subject</th>
                      <th className="py-3 px-3 font-semibold text-center w-28">Marks (/100)</th>
                      <th className="py-3 px-3 font-semibold text-center w-20">Grade</th>
                      <th className="py-3 px-3.5 font-semibold">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((s) => {
                      const markVal = marks[s.name] || '';
                      const live = getLiveGrade(markVal);

                      return (
                        <tr key={s.name} className="hover:bg-slate-50/30">
                          <td className="py-3 px-3.5 font-bold text-slate-800">{s.name}</td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max={s.max}
                              placeholder={`Max: ${s.max}`}
                              value={markVal}
                              onChange={e => handleMarkChange(s.name, e.target.value, s.max)}
                              onBlur={() => autoSaveScores(marks)}
                              className="w-24 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-center text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                                live.grade.startsWith('D') 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                  : live.grade.startsWith('C')
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : live.grade.startsWith('P')
                                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                  : live.grade === 'F9'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : 'bg-slate-100 text-slate-400'
                              }`}>
                                {live.grade}
                              </span>
                              {live.grade !== '-' && (
                                <span className={`text-[8px] font-black uppercase tracking-wider ${
                                  live.grade.startsWith('D') ? 'text-blue-600' :
                                  live.grade.startsWith('C') ? 'text-emerald-600' :
                                  live.grade.startsWith('P') ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                  {live.grade.startsWith('D') ? 'Distinction' :
                                   live.grade.startsWith('C') ? 'Credit' :
                                   live.grade.startsWith('P') ? 'Pass' : 'Fail'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-500 font-semibold text-[11px]">{live.remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {(() => {
                    const pleRes = calculatePLEGrade(marks);
                    let sumMarks = 0;
                    let validCount = 0;
                    subjects.forEach(s => {
                      const m = marks[s.name];
                      if (m !== undefined && m !== null && m !== '') {
                        const n = Number(m);
                        if (!isNaN(n)) {
                          sumMarks += n;
                          validCount++;
                        }
                      }
                    });
                    const avgPct = validCount > 0 ? Math.round((sumMarks / validCount) * 10) / 10 : 0;

                    return (
                      <tfoot className="border-t-2 border-slate-200 bg-slate-50/90 font-bold">
                        <tr>
                          <td className="py-3.5 px-3.5 font-black text-slate-800">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                              <span>UNEB Aggregate &amp; Performance</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-mono font-black text-slate-900 text-sm">{sumMarks} / {subjects.length * 100}</span>
                              <span className="text-[9.5px] font-bold text-slate-500">Avg: {avgPct}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="px-2.5 py-0.5 rounded-md font-mono font-black text-xs bg-indigo-100 text-indigo-900 border border-indigo-200">
                                {pleRes.aggregate} pts
                              </span>
                              <span className="text-[8.5px] font-black uppercase text-indigo-600 mt-0.5">
                                Agg. Points
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg font-black text-xs uppercase ${pleRes.badgeColor}`}>
                                {pleRes.division}
                              </span>
                              <span className={`text-[10.5px] font-bold ${pleRes.textColor}`}>
                                {pleRes.label}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    );
                  })()}
                </table>
              </div>
            )}
          </div>

          {/* Psychomotor Ratings & Comments (col span 5) */}
          <div className="space-y-8 lg:col-span-5">
            {/* Psychomotor Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Activity size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-950">Development &amp; Psychomotor</h3>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {data.settings.psychomotor.map((skill) => {
                  const rating = psycho[skill] || 0;

                  return (
                    <div key={skill} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">{skill}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const updated = { ...psycho, [skill]: star };
                              setPsycho(updated);
                              autoSavePsychomotor(updated);
                            }}
                            className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                              star <= rating ? 'text-amber-500' : 'text-slate-200'
                            }`}
                          >
                            <Star size={14} fill={star <= rating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MessageSquare size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-950">Teacher Comments &amp; Initials</h3>
              </div>

              {/* Predefined Comment Templates Selector Tool */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">Quick Comment Templates</span>
                    </div>

                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={autoCommentEnabled}
                        onChange={e => setAutoCommentEnabled(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>Auto-fill Comments</span>
                    </label>
                  </div>
                  {detectedBand ? (
                    <span className="self-start sm:self-auto text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                      <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Auto-Matched: {detectedBand.grade} ({detectedBand.remark})
                    </span>
                  ) : (
                    <span className="self-start sm:self-auto text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                      Browse Templates by Grade
                    </span>
                  )}
                </div>

                {/* Grade Level Selector Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200">
                  {grading.map((band) => {
                    const isDetected = detectedBand?.grade === band.grade;
                    const isActive = activeTemplateBand?.grade === band.grade;
                    
                    return (
                      <button
                        key={band.grade}
                        type="button"
                        onClick={() => setTemplateBandOverride(band.grade)}
                        className={`shrink-0 px-2.5 py-1 text-[10px] font-extrabold rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : isDetected
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={`${band.remark} (${band.min}% - ${band.max}%)`}
                      >
                        {band.grade} <span className="opacity-80 font-normal">({band.remark})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Predefined Templates Grid */}
                {activeTemplateBand && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {/* Class Teacher Options */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Class Teacher Templates
                      </div>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {(!activeTemplateBand.classComments || activeTemplateBand.classComments.length === 0) ? (
                          <p className="text-[10px] text-slate-400 italic">No predefined templates available</p>
                        ) : (
                          activeTemplateBand.classComments.map((comment, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => applyCommentTemplate(comment, 'teacher')}
                              className="w-full text-left p-2.5 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-900 transition-all font-medium leading-relaxed group"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[11px] line-clamp-3">{comment}</span>
                                <span className="text-[9px] text-blue-600 font-extrabold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-1 py-0.5 rounded-sm">
                                  Apply
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Head Teacher Options */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Head Teacher Templates
                      </div>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                        {(!activeTemplateBand.headComments || activeTemplateBand.headComments.length === 0) ? (
                          <p className="text-[10px] text-slate-400 italic">No predefined templates available</p>
                        ) : (
                          activeTemplateBand.headComments.map((comment, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => applyCommentTemplate(comment, 'head')}
                              className="w-full text-left p-2.5 bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-lg text-slate-700 hover:text-blue-900 transition-all font-medium leading-relaxed group"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-[11px] line-clamp-3">{comment}</span>
                                <span className="text-[9px] text-blue-600 font-extrabold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-1 py-0.5 rounded-sm">
                                  Apply
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {templateBandOverride && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setTemplateBandOverride(null)}
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-bold hover:underline"
                    >
                      Reset to student's auto-detected grade
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Class Teacher's Comment</label>
                    <div className="flex items-center gap-2">
                      <VoiceDictation
                        onTranscript={(text) => {
                          const updated = teacherCmt ? `${teacherCmt.trim()} ${text}` : text;
                          setTeacherCmt(updated);
                          autoSaveComments({ teacher: updated });
                        }}
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={teacherCmt}
                    onChange={e => setTeacherCmt(e.target.value)}
                    onBlur={e => autoSaveComments({ teacher: e.target.value })}
                    placeholder="Provide constructive assessment comments..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  
                  {/* Smart Comment Suggestions */}
                  <div className="mt-2 p-2 bg-slate-50/60 border border-slate-200/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      <Sparkles size={11} className="text-blue-500 animate-pulse" />
                      <span>Smart Comment Drafts:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={generatingTeacher}
                        onClick={() => handleAutoComment('teacher', 'balanced')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          teacherGenTone === 'balanced' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {teacherGenTone === 'balanced' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>⚖️ Balanced</span>
                      </button>
                      <button
                        type="button"
                        disabled={generatingTeacher}
                        onClick={() => handleAutoComment('teacher', 'supportive')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          teacherGenTone === 'supportive' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {teacherGenTone === 'supportive' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>🌸 Supportive</span>
                      </button>
                      <button
                        type="button"
                        disabled={generatingTeacher}
                        onClick={() => handleAutoComment('teacher', 'remedial')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          teacherGenTone === 'remedial' 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {teacherGenTone === 'remedial' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>📈 Growth Focus</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Head Teacher's Comment</label>
                    <div className="flex items-center gap-2">
                      <VoiceDictation
                        onTranscript={(text) => {
                          const updated = headCmt ? `${headCmt.trim()} ${text}` : text;
                          setHeadCmt(updated);
                          autoSaveComments({ head: updated });
                        }}
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={headCmt}
                    onChange={e => setHeadCmt(e.target.value)}
                    onBlur={e => autoSaveComments({ head: e.target.value })}
                    placeholder="Provide official headteacher's comment..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />

                  {/* Smart Comment Suggestions */}
                  <div className="mt-2 p-2 bg-slate-50/60 border border-slate-200/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      <Sparkles size={11} className="text-blue-500 animate-pulse" />
                      <span>Smart Comment Drafts:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={generatingHead}
                        onClick={() => handleAutoComment('head', 'balanced')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          headGenTone === 'balanced' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {headGenTone === 'balanced' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>⚖️ Balanced</span>
                      </button>
                      <button
                        type="button"
                        disabled={generatingHead}
                        onClick={() => handleAutoComment('head', 'supportive')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          headGenTone === 'supportive' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {headGenTone === 'supportive' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>🌸 Supportive</span>
                      </button>
                      <button
                        type="button"
                        disabled={generatingHead}
                        onClick={() => handleAutoComment('head', 'remedial')}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          headGenTone === 'remedial' 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {headGenTone === 'remedial' && <span className="animate-spin inline-block h-2 w-2 border border-white border-t-transparent rounded-full" />}
                        <span>📈 Growth Focus</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Class Teacher Initials</label>
                    <input
                      type="text"
                      placeholder="e.g. S.D."
                      value={teacherInitials}
                      onChange={e => setTeacherInitials(e.target.value)}
                      onBlur={e => autoSaveComments({ teacherInitials: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Head Teacher Initials</label>
                    <input
                      type="text"
                      placeholder="e.g. N.J."
                      value={headInitials}
                      onChange={e => setHeadInitials(e.target.value)}
                      onBlur={e => autoSaveComments({ headInitials: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Next Term Resumption Date</label>
                  <input
                    type="date"
                    value={nextTermBegins}
                    onChange={e => {
                      setNextTermBegins(e.target.value);
                      autoSaveComments({ nextTermBegins: e.target.value });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Global Save Trigger */}
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/10 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={14} />
              <span>Save Full Report File</span>
            </button>
          </div>
        </div>
      )}

      {/* Completeness Overview Report & Missed Exams Tracker */}
      {(selectedExamSet || data.settings.examSets.length > 0) && (
        <div id="otec-scores-matrix-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 mt-8 animate-in fade-in duration-300 font-sans">
          {/* Main Module Tabs Switcher */}
          <div className="flex border-b border-slate-200 -mx-6 px-6 pb-4 items-center justify-between flex-wrap gap-4">
            <div className="flex bg-slate-100 border border-slate-200/50 p-1 rounded-xl flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setActiveScoresTab('school-matrix')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScoresTab === 'school-matrix'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 size={14} className="text-emerald-600" />
                <span>🏫 All Classes Marks Overview Panel</span>
                {allClassesMatrixData.missedClassesCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full">
                    {allClassesMatrixData.missedClassesCount} Missed
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveScoresTab('completeness')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScoresTab === 'completeness'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck size={14} />
                <span>📋 Selected Class Tracker ({selectedClass})</span>
              </button>

              <button
                type="button"
                id="otec-leaderboard-tab-btn"
                onClick={() => setActiveScoresTab('leaderboard')}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeScoresTab === 'leaderboard'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Award size={14} className="text-amber-500" />
                <span>🏆 Class Leaderboard</span>
              </button>
            </div>

            {activeScoresTab === 'school-matrix' ? (
              <p className="text-[11px] text-slate-500 font-bold leading-normal">
                School Status: <span className="text-emerald-700 font-black">{allClassesMatrixData.completeClassesCount} Complete</span> • <span className="text-rose-600 font-black">{allClassesMatrixData.missedClassesCount} Missed</span>
              </p>
            ) : activeScoresTab === 'completeness' ? (
              <p className="text-[11px] text-slate-400 font-bold leading-normal">
                Class: <span className="text-slate-700">{selectedClass}</span> • Exam: <span className="text-slate-700">{data.settings.examSets.find(s => s.id === selectedExamSet)?.label || 'Selected Set'}</span>
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                  Ranked Candidates: {classRankings.ranked.length} / {classLearners.length}
                </span>
              </div>
            )}
          </div>

          {/* School-Wide All Classes Matrix Panel */}
          {activeScoresTab === 'school-matrix' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Info & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                    <Building2 className="text-emerald-600" size={18} />
                    All Classes Uploaded Marks Overview &amp; Missed Classes Tracker
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    School-wide matrix preview showing subject submission status across all classes to immediately spot missed uploads.
                  </p>
                </div>

                {/* Exam Set & Filter Controls Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-black uppercase text-slate-500 px-2">Exam Paper:</span>
                    <select
                      value={matrixExamSet || selectedExamSet || ''}
                      onChange={e => setMatrixExamSet(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
                    >
                      {data.settings.examSets.map(s => (
                        <option key={s.id} value={s.id}>{s.term} — {s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setMatrixSectionFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        matrixSectionFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixSectionFilter('preprimary')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        matrixSectionFilter === 'preprimary' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Nursery
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixSectionFilter('lower')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        matrixSectionFilter === 'lower' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Lower (P1-P3)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixSectionFilter('upper')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        matrixSectionFilter === 'upper' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Upper (P4-P7)
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Filter Cards / Summary Banner */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                {/* Total Classes */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Active Classes</span>
                  <div className="text-lg font-black text-slate-900">{allClassesMatrixData.totalClasses} Streams</div>
                </div>

                {/* Fully Uploaded */}
                <button
                  type="button"
                  onClick={() => setMatrixStatusFilter(matrixStatusFilter === 'complete' ? 'all' : 'complete')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    matrixStatusFilter === 'complete' 
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500' 
                      : 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-100/50 text-slate-900'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${matrixStatusFilter === 'complete' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                    🟢 100% Uploaded
                  </span>
                  <div className={`text-lg font-black mt-0.5 ${matrixStatusFilter === 'complete' ? 'text-white' : 'text-emerald-800'}`}>
                    {allClassesMatrixData.completeClassesCount} Classes
                  </div>
                </button>

                {/* Partially Uploaded */}
                <button
                  type="button"
                  onClick={() => setMatrixStatusFilter(matrixStatusFilter === 'partial' ? 'all' : 'partial')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    matrixStatusFilter === 'partial' 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400' 
                      : 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-100/50 text-slate-900'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${matrixStatusFilter === 'partial' ? 'text-amber-100' : 'text-amber-600'}`}>
                    🟡 Partially Uploaded
                  </span>
                  <div className={`text-lg font-black mt-0.5 ${matrixStatusFilter === 'partial' ? 'text-white' : 'text-amber-800'}`}>
                    {allClassesMatrixData.partialClassesCount} Classes
                  </div>
                </button>

                {/* Missed / Zero Marks */}
                <button
                  type="button"
                  onClick={() => setMatrixStatusFilter(matrixStatusFilter === 'missed' ? 'all' : 'missed')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    matrixStatusFilter === 'missed' 
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500' 
                      : 'bg-rose-50/60 border-rose-200/90 hover:bg-rose-100/60 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${matrixStatusFilter === 'missed' ? 'text-rose-100' : 'text-rose-600'}`}>
                      🔴 Missed / No Marks
                    </span>
                    {allClassesMatrixData.missedClassesCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </div>
                  <div className={`text-lg font-black mt-0.5 ${matrixStatusFilter === 'missed' ? 'text-white' : 'text-rose-800'}`}>
                    {allClassesMatrixData.missedClassesCount} Classes
                  </div>
                </button>

                {/* School Overall Progress */}
                <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl space-y-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">School Marks Progress</span>
                  <div className="text-lg font-extrabold flex items-center justify-between">
                    <span>{allClassesMatrixData.schoolWidePct}%</span>
                    <span className="text-[10px] font-medium text-slate-400">Recorded</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        allClassesMatrixData.schoolWidePct === 100 ? 'bg-emerald-400' : allClassesMatrixData.schoolWidePct > 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${allClassesMatrixData.schoolWidePct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Class Cards List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Class Submissions Matrix ({allClassesMatrixData.filteredReports.length} Shown)</span>
                    {matrixStatusFilter !== 'all' && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                        Filtered by: {matrixStatusFilter}
                      </span>
                    )}
                  </h4>

                  <input
                    type="text"
                    placeholder="Search class name..."
                    value={matrixSearch}
                    onChange={e => setMatrixSearch(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden max-w-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allClassesMatrixData.filteredReports.map(rep => {
                    const statusStyles = {
                      complete: {
                        cardBg: 'bg-emerald-50/20 border-emerald-200',
                        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                        badgeText: '🟢 100% FULLY UPLOADED',
                        barColor: 'bg-emerald-500'
                      },
                      partial: {
                        cardBg: 'bg-amber-50/20 border-amber-200',
                        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
                        badgeText: `🟡 IN PROGRESS (${rep.overallPct}%)`,
                        barColor: 'bg-amber-500'
                      },
                      missed: {
                        cardBg: 'bg-rose-50/30 border-rose-300 shadow-xs',
                        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
                        badgeText: '🔴 ⚠️ MISSED (0% MARKS UPLOADED)',
                        barColor: 'bg-rose-500'
                      },
                      no_students: {
                        cardBg: 'bg-slate-50/50 border-slate-200',
                        badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
                        badgeText: '⚪ NO LEARNERS REGISTERED',
                        barColor: 'bg-slate-300'
                      }
                    }[rep.classStatus];

                    return (
                      <div 
                        key={rep.clsName}
                        className={`p-4 rounded-2xl border ${statusStyles.cardBg} transition-all space-y-3.5 relative`}
                      >
                        {/* Card Top Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-black text-slate-950 font-sans tracking-tight">{rep.clsName}</h5>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                {rep.clsSection === 'preprimary' ? 'Nursery' : rep.clsSection === 'lower' ? 'Lower P1-P3' : 'Upper P4-P7'}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-slate-500 block mt-0.5">
                              {rep.learnersCount} Registered Students • {rep.subjectsCount} Section Subjects
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border shadow-3xs ${statusStyles.badgeBg}`}>
                              {statusStyles.badgeText}
                            </span>
                          </div>
                        </div>

                        {/* Overall Class Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase">
                            <span>Upload Completion Rate</span>
                            <span>{rep.overallPct}% ({rep.totalRecorded}/{rep.totalExpected} mark entries)</span>
                          </div>
                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${statusStyles.barColor}`}
                              style={{ width: `${rep.overallPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Subject Breakdown Badges */}
                        {rep.subjectStats.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Submissions Breakdown:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {rep.subjectStats.map(s => {
                                const subjStyle = s.status === 'complete' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' 
                                  : s.status === 'partial' 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200/80' 
                                  : 'bg-rose-100/80 text-rose-800 border-rose-300 font-bold';

                                return (
                                  <div 
                                    key={s.subject.name}
                                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border flex items-center gap-1.5 ${subjStyle}`}
                                  >
                                    <span>{s.subject.name}:</span>
                                    <span className="font-extrabold">{s.recordedCount}/{s.totalLearners}</span>
                                    {s.status === 'complete' && <span className="text-emerald-600">✓</span>}
                                    {s.status === 'partial' && <span className="text-amber-600">⏳</span>}
                                    {s.status === 'missed' && <span className="text-rose-600 font-extrabold">⚠️ MISSED</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No subjects configured for this section.</p>
                        )}

                        {/* Action Footer */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                          <span className="text-[10.5px] font-medium text-slate-500">
                            {rep.classStatus === 'missed' 
                              ? '⚠️ Entire class marks are missing!' 
                              : rep.classStatus === 'partial' 
                              ? `⏳ ${rep.missedSubjs} subjects still missing marks` 
                              : 'All subject marks entered'}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClass(rep.clsName);
                              if (allClassesMatrixData.targetExamSet) {
                                setSelectedExamSet(allClassesMatrixData.targetExamSet);
                              }
                              setActiveScoresTab('completeness');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <span>✏️ Record Marks for {rep.clsName}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {allClassesMatrixData.filteredReports.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500">No classes match your current search or status filter.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setMatrixSectionFilter('all');
                          setMatrixStatusFilter('all');
                          setMatrixSearch('');
                        }}
                        className="mt-2 text-xs font-bold text-blue-600 underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeScoresTab === 'completeness' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" size={18} />
                    Marks Recording Status &amp; Missing Tracker
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    A live scannable overview of all entered marks, completeness statuses, and students who missed.
                  </p>
                </div>
                
                {/* Quick Status Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Filter Report:</span>
              <button
                type="button"
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Class ({classLearners.length})
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'completed' 
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/10' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50'
                }`}
              >
                Completed ({learnerOverviewList.filter(i => i.status === 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('partial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'partial' 
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/10' 
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100/50'
                }`}
              >
                Partially Missed ({learnerOverviewList.filter(i => i.status === 'partial').length})
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('missed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportFilter === 'missed' 
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-500/10' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100/50'
                }`}
              >
                Missed All ({learnerOverviewList.filter(i => i.status === 'missed_all').length})
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stream Registry</span>
              <div className="text-xl font-extrabold text-slate-900">{classLearners.length} Students</div>
            </div>
            <div className="p-4 bg-emerald-50/45 border border-emerald-100/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Perfect Complete Entry</span>
              <div className="text-xl font-extrabold text-emerald-800">
                {learnerOverviewList.filter(i => i.status === 'completed').length} ({Math.round((learnerOverviewList.filter(i => i.status === 'completed').length / (classLearners.length || 1)) * 100)}%)
              </div>
            </div>
            <div className="p-4 bg-amber-50/45 border border-amber-100/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Partially Complete</span>
              <div className="text-xl font-extrabold text-amber-800">
                {learnerOverviewList.filter(i => i.status === 'partial').length} Students
              </div>
            </div>
            <div className="p-4 bg-rose-50/45 border border-rose-100/60 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Missed All Assessments</span>
              <div className="text-xl font-extrabold text-rose-800">
                {learnerOverviewList.filter(i => i.status === 'missed_all').length} Students
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] w-56">Student Name &amp; Admission</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center w-28">Status</th>
                  {subjects.map(subj => (
                    <th key={subj.name} className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center whitespace-nowrap">
                      {subj.name}
                    </th>
                  ))}
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-slate-400">Assessment Logs / Missed Papers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOverview.map(({ learner, scoreRecord, enteredSubjects, missedSubjects, status }) => {
                  const isCurrent = selectedLearner === learner.id;
                  return (
                    <tr 
                      key={learner.id} 
                      onClick={() => setSelectedLearner(learner.id)}
                      className={`hover:bg-slate-50/50 cursor-pointer transition-all duration-150 ${
                        isCurrent ? 'bg-blue-50/35 hover:bg-blue-50/50 border-l-2 border-l-blue-600' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{learner.name}</div>
                        {learner.admNo && <div className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">{learner.admNo}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {status === 'completed' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Completed
                          </span>
                        )}
                        {status === 'partial' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                            Partial
                          </span>
                        )}
                        {status === 'missed_all' && (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-rose-50 text-rose-700 border border-rose-100">
                            Missed All
                          </span>
                        )}
                      </td>
                      {subjects.map(subj => {
                        const mark = scoreRecord[subj.name];
                        const isMissed = mark === undefined || mark === null;
                        return (
                          <td key={subj.name} className="py-3 px-4 text-center font-mono font-bold">
                            {!isMissed ? (
                              <span className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md text-[11px]">
                                {mark}
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold text-[10px] tracking-wide bg-rose-50/30 px-1.5 py-0.5 rounded border border-dashed border-rose-200/50">
                                MISSED
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-xs font-semibold text-slate-500 max-w-xs truncate">
                        {status === 'completed' && (
                          <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            All {enteredSubjects.length} subjects recorded
                          </span>
                        )}
                        {status === 'partial' && (
                          <span className="text-amber-700 text-[11px]">
                            Missed ({missedSubjects.length}): <strong className="font-bold">{missedSubjects.join(', ')}</strong>
                          </span>
                        )}
                        {status === 'missed_all' && (
                          <span className="text-rose-600 font-bold text-[11px] flex items-center gap-1 bg-rose-50/40 py-0.5 px-1.5 rounded border border-rose-100">
                            <AlertCircle size={13} className="shrink-0" />
                            Missed entire exam set ({subjects.length} subjects)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredOverview.length === 0 && (
                  <tr>
                    <td colSpan={subjects.length + 3} className="py-12 text-center bg-slate-50/30">
                      <div className="flex flex-col items-center justify-center space-y-3 py-6">
                        <div className="w-12 h-12 rounded-full bg-slate-150/50 flex items-center justify-center text-slate-400">
                          <Search size={18} className="stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">No Overview Matches Found</p>
                          <p className="text-[10px] text-slate-400 font-bold max-w-sm mx-auto leading-normal">
                            No student profiles in class {selectedClass} match the active filter "{reportFilter}".
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReportFilter('all')}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors shadow-3xs cursor-pointer"
                        >
                          Show All Students
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            </div>
          )}

        {/* Class Leaderboard Tab */}
        {activeScoresTab === 'leaderboard' && (
          <div className="space-y-6 animate-in fade-in duration-300 font-sans">
            
            {/* Intro / Explanation banner */}
            <div className="p-4 bg-amber-50/45 border border-amber-100 rounded-xl flex items-start gap-3">
              <span className="text-xl">🏆</span>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Class Leaderboard Calculations</h4>
                <p className="text-[11px] text-amber-700 leading-normal font-medium">
                  Rankings are calculated dynamically based on **aggregate PLE point performance** across the core subjects (English, Mathematics, Science, and Social Studies). Lower aggregate points represent higher academic performance (4 pts is perfect, 36 pts is ungraded). Average raw marks are used to break ties between equal aggregate scores.
                </p>
                {examMode ? (
                  <p className="text-[10px] text-indigo-700 font-bold mt-1.5 flex items-center gap-1.5 bg-indigo-50/60 px-2 py-1 rounded-md border border-indigo-100/50 w-fit">
                    <span>🛡️ UNEB PLE Exam Mode active: calculations are weighted using official UNEB national grading scales.</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-fit">
                    <span>ℹ️ School default grading rules are currently active. Toggle PLE Exam Mode above to enforce national standards.</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Performance Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-blue-100/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Performing Candidate</span>
                  {classRankings.ranked.length > 0 ? (
                    <div className="mt-1">
                      <span className="block text-sm font-black text-slate-900 truncate max-w-[200px]">
                        {classRankings.ranked[0].learner.name}
                      </span>
                      <span className="text-[10.5px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                        Rank 1st • {classRankings.ranked[0].aggregate} pts ({classRankings.ranked[0].division})
                      </span>
                    </div>
                  ) : (
                    <span className="block text-xs font-bold text-slate-400 mt-1">No graded candidates</span>
                  )}
                </div>
                <span className="text-3xl">👑</span>
              </div>

              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">First Grade (Div 1) Count</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-emerald-800">
                      {classRankings.ranked.filter(s => s.division === 'Division 1').length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      students ({Math.round((classRankings.ranked.filter(s => s.division === 'Division 1').length / (classLearners.length || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
                <span className="text-3xl">🎓</span>
              </div>

              <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 border border-purple-100/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Average Aggregate Score</span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-purple-800">
                      {classRankings.ranked.length > 0 
                        ? (classRankings.ranked.reduce((sum, s) => sum + s.aggregate, 0) / classRankings.ranked.length).toFixed(1)
                        : '-'
                      }
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">points (lower is better)</span>
                  </div>
                </div>
                <span className="text-3xl">📊</span>
              </div>
            </div>

            {/* Leaderboard Standings Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center w-16">Rank</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] w-64">Student Name &amp; Admission</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center w-32">PLE Aggregate</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center w-32">PLE Division</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center w-28">Average Mark</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-center">Core Subject Points breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classRankings.ranked.map((student) => {
                    const isCurrent = selectedLearner === student.learner.id;
                    const rankColors: Record<number, { bg: string, text: string, icon: string }> = {
                      1: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800 font-black', icon: '🥇' },
                      2: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700 font-black', icon: '🥈' },
                      3: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700 font-black', icon: '🥉' },
                    };
                    const customStyle = rankColors[student.rank] || { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600 font-bold', icon: '' };
                    
                    return (
                      <tr 
                        key={student.learner.id} 
                        onClick={() => setSelectedLearner(student.learner.id)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-all duration-150 ${
                          isCurrent ? 'bg-blue-50/35 hover:bg-blue-50/50 border-l-2 border-l-blue-600' : ''
                        }`}
                      >
                        {/* Rank Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg text-[11px] border shadow-3xs ${customStyle.bg} ${customStyle.text}`}>
                            <span>{customStyle.icon} {student.rank}</span>
                          </div>
                        </td>

                        {/* Learner Column */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            {student.learner.name}
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                          </div>
                          {student.learner.admNo && (
                            <div className="text-[10px] font-mono text-slate-400 font-bold mt-0.5">
                              ADM: {student.learner.admNo}
                            </div>
                          )}
                        </td>

                        {/* PLE Aggregate Column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-black text-slate-800">{student.aggregate} pts</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                              {student.satCount} / 4 core
                            </span>
                          </div>
                        </td>

                        {/* Division Column */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${student.pleResult.badgeColor}`}>
                            {student.division}
                          </span>
                        </td>

                        {/* Average Mark Column */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-700 font-bold">
                          {student.averageMark.toFixed(1)}%
                        </td>

                        {/* Core breakdown Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {student.pleResult.coreDetails.map(c => {
                              const subjectPillColor = (points: number) => {
                                if (points <= 2) return 'bg-emerald-50 text-emerald-800 border-emerald-100'; // distinction
                                if (points <= 6) return 'bg-blue-50 text-blue-800 border-blue-100'; // credit
                                if (points <= 8) return 'bg-amber-50 text-amber-800 border-amber-100'; // pass
                                return 'bg-rose-50 text-rose-800 border-rose-100'; // fail
                              };
                              return (
                                <div 
                                  key={c.subject} 
                                  className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${subjectPillColor(c.points)}`}
                                  title={`${c.subject}: ${c.marks !== null ? `${c.marks}%` : 'No Marks'} (Grade ${c.grade})`}
                                >
                                  <span className="opacity-70">{c.subject === 'Social Studies' ? 'SST' : c.subject === 'Mathematics' ? 'MTH' : c.subject === 'Science' ? 'SCI' : 'ENG'}:</span>
                                  <span>{c.grade} ({c.points}p)</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {classRankings.ranked.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center bg-slate-50/30">
                        <div className="flex flex-col items-center justify-center space-y-3 py-6">
                          <div className="w-12 h-12 rounded-full bg-slate-150/50 flex items-center justify-center text-slate-400">
                            <Award size={18} className="stroke-[1.5]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">No Ranked Candidates</p>
                            <p className="text-[10px] text-slate-400 font-bold max-w-sm mx-auto leading-normal">
                              There are no students with active exam score records for this exam set. Enter student marks above to generate class leaderboards.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ungraded Candidates Section */}
            {classRankings.ungraded.length > 0 && (
              <div className="space-y-3.5 pt-4 border-t border-slate-100">
                <span className="block text-[10.5px] font-black text-slate-500 uppercase tracking-wider">
                  ⚠️ Ungraded Candidates / Missed All Examinations ({classRankings.ungraded.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {classRankings.ungraded.map(({ learner }) => (
                    <div 
                      key={learner.id}
                      onClick={() => setSelectedLearner(learner.id)}
                      className="bg-slate-50 hover:bg-slate-100/75 border border-slate-200/50 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all animate-in fade-in"
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-900">{learner.name}</span>
                        {learner.admNo && <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{learner.admNo}</span>}
                      </div>
                      <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                        No Scores
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    )}

      {/* Quick Add Exam Set Modal */}
      {showQuickAddExam && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <span className="text-xl">📝</span>
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Quick Add Exam Paper Set</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Activate a new assessment paper</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Academic Term</label>
                <select
                  value={quickExamTerm}
                  onChange={e => setQuickExamTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Assessment Period</label>
                <select
                  value={quickExamPeriod}
                  onChange={e => {
                    setQuickExamPeriod(e.target.value as 'BOT' | 'MOT' | 'EOT');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                >
                  <option value="BOT">Beginning of Term (BOT)</option>
                  <option value="MOT">Mid Term (MOT)</option>
                  <option value="EOT">End of Term (EOT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Display Label</label>
                <input
                  type="text"
                  value={quickExamLabel}
                  onChange={e => setQuickExamLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  placeholder="e.g. End of Term Assessments"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Set Number / Weight Index</label>
                <input
                  type="number"
                  value={quickExamSetNo}
                  onChange={e => setQuickExamSetNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuickAddExam(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!quickExamLabel.trim()) {
                    alert('Please enter a display label.');
                    return;
                  }
                  const id = 'set-' + Math.random().toString(36).slice(2, 9);
                  const newSet: ExamSet = {
                    id,
                    label: quickExamLabel,
                    term: quickExamTerm,
                    period: quickExamPeriod,
                    setNo: Number(quickExamSetNo) || 1,
                    classes: [...ALL_CLASSES]
                  };

                  const updatedSettings = {
                    ...data.settings,
                    examSets: [...data.settings.examSets, newSet]
                  };

                  dataManager.updateSettings(updatedSettings);
                  
                  setSelectedExamSet(id);
                  setShowQuickAddExam(false);

                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: {
                      message: `New Exam Set "${quickExamTerm} — ${quickExamLabel}" successfully registered!`,
                      type: 'success'
                    }
                  }));
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Create Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal */}
      {showCSVUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Bulk CSV Scores Importer</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Class Stream: <span className="text-blue-600 font-extrabold">{selectedClass}</span> • Exam Paper: <span className="text-emerald-600 font-extrabold">{data.settings.examSets.find(s => s.id === selectedExamSet)?.label || 'Selected Set'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCSVUpload(false);
                  setCSVFile(null);
                  setCSVHeaders([]);
                  setCSVRows([]);
                  setCSVFeedback(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {!csvFile ? (
                /* STEP 1: Upload Zone */
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCSV(true); }}
                  onDragLeave={() => setIsDraggingCSV(false)}
                  onDrop={(e) => { 
                    e.preventDefault(); 
                    setIsDraggingCSV(false); 
                    if (e.dataTransfer.files?.[0]) processCSVFile(e.dataTransfer.files[0]); 
                  }}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all flex flex-col items-center justify-center gap-4 ${
                    isDraggingCSV 
                      ? 'border-blue-500 bg-blue-50/30' 
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-black">
                    📥
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Drag &amp; Drop Score Sheet CSV</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-1 max-w-md mx-auto leading-relaxed">
                      Drop your spreadsheet CSV file here, or click to upload. 
                      Make sure your file contains student identity keys (Name, Admission Number, or System ID) and score columns.
                    </p>
                  </div>
                  <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/10 cursor-pointer transition-all uppercase tracking-wider">
                    Browse File
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleCSVFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <div className="pt-6 border-t border-slate-100 w-full max-w-lg">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Example Template Format:</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-mono text-[10px] text-slate-600 space-y-1">
                      <div>Student Name, English, Mathematics, Integrated Science</div>
                      <div>Mugerwa John, 78, 85, 90</div>
                      <div>Nakitende Sarah, 85, 92, 88</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STEP 2: Mapping UI & Live Preview */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Mappings Control */}
                  <div className="lg:col-span-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50">
                      <span className="text-sm">⚙️</span>
                      <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Column Mapping Settings</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Identity mapping */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                          Student ID Column
                        </label>
                        <select
                          value={csvMapping.studentIdentifierCol}
                          onChange={(e) => handleCSVMappingChange('studentIdentifierCol', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                        >
                          {csvHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                          Match Student By
                        </label>
                        <select
                          value={csvMapping.studentIdentifierType}
                          onChange={(e) => handleCSVMappingChange('studentIdentifierType', e.target.value as 'name' | 'admNo' | 'id')}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                        >
                          <option value="name">Full Student Name (Fuzzy Match)</option>
                          <option value="admNo">Admission No. (ADM/YYYY/XXX)</option>
                          <option value="id">System Primary Identifier</option>
                        </select>
                      </div>

                      <div className="h-px bg-slate-200/50 my-2" />

                      {/* Subject mappings */}
                      <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          Map Subjects Columns
                        </label>
                        {subjects.map(sub => {
                          const currentMappedHeader = csvMapping.subjectMappings[sub.name] || '';
                          return (
                            <div key={sub.name} className="flex flex-col gap-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                <span>{sub.name}</span>
                                <span className="text-slate-400 lowercase normal-case">max {sub.max}</span>
                              </span>
                              <select
                                value={currentMappedHeader}
                                onChange={(e) => handleCSVMappingChange(sub.name, e.target.value, true)}
                                className="w-full mt-1 px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-900"
                              >
                                <option value="">-- Skip / Do Not Import --</option>
                                {csvHeaders.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Matching Preview */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📊</span>
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                          Validation &amp; Preview
                        </h4>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 border border-slate-200/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Loaded: {csvRows.length} Row(s)
                      </span>
                    </div>

                    {csvFeedback ? (
                      <div className="space-y-4">
                        {/* Summary Bar */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Matched Students</div>
                            <div className="text-lg font-black text-emerald-900 mt-1">
                              {csvFeedback.matchedLearnersCount} / {csvFeedback.totalRows}
                            </div>
                          </div>
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Skipped / Unmatched</div>
                            <div className="text-lg font-black text-amber-900 mt-1">
                              {csvFeedback.totalRows - csvFeedback.matchedLearnersCount}
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center">
                            <div className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Accuracy</div>
                            <div className="text-lg font-black text-blue-900 mt-1">
                              {csvFeedback.totalRows > 0 
                                ? Math.round((csvFeedback.matchedLearnersCount / csvFeedback.totalRows) * 100)
                                : 0}%
                            </div>
                          </div>
                        </div>

                        {/* Interactive Grid of student records */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[9px] border-b border-slate-200 sticky top-0 z-10">
                              <tr>
                                <th className="py-2.5 px-4">CSV Student Name</th>
                                <th className="py-2.5 px-4">System Record Link</th>
                                {subjects.map(sub => {
                                  if (!csvMapping.subjectMappings[sub.name]) return null;
                                  return (
                                    <th key={sub.name} className="py-2.5 px-3 text-center">
                                      {sub.name}
                                    </th>
                                  );
                                })}
                                <th className="py-2.5 px-4">Status / Warnings</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white font-medium">
                              {csvFeedback.updatesPreview.map((item, idx) => {
                                const isMatched = item.status === 'matched';
                                return (
                                  <tr 
                                    key={idx} 
                                    className={`hover:bg-slate-50/50 ${!isMatched ? 'bg-rose-50/20' : ''}`}
                                  >
                                    <td className="py-2 px-4 font-bold text-slate-800">
                                      {item.learnerName}
                                    </td>
                                    <td className="py-2 px-4">
                                      {isMatched ? (
                                        <div>
                                          <div className="font-extrabold text-slate-900">{item.learnerName}</div>
                                          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">{item.learnerAdmNo}</div>
                                        </div>
                                      ) : (
                                        <span className="text-rose-600 font-extrabold uppercase tracking-wide text-[9px]">
                                          ⚠️ Unmatched Student
                                        </span>
                                      )}
                                    </td>
                                    {subjects.map(sub => {
                                      if (!csvMapping.subjectMappings[sub.name]) return null;
                                      const mappedVal = item.newScores[sub.name];
                                      const hasVal = mappedVal !== undefined;
                                      return (
                                        <td key={sub.name} className="py-2 px-3 text-center font-bold">
                                          {hasVal ? (
                                            <span className="text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                              {mappedVal}
                                            </span>
                                          ) : (
                                            <span className="text-slate-300">—</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                    <td className="py-2 px-4">
                                      {item.warnings.length > 0 ? (
                                        <div className="space-y-0.5">
                                          {item.warnings.map((warn, wIdx) => (
                                            <div key={wIdx} className="text-[9px] text-amber-700 font-semibold flex items-center gap-1">
                                              <span>⚠️</span> {warn}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-emerald-700 font-extrabold uppercase tracking-wide text-[9px] flex items-center gap-1">
                                          <Check size={10} /> Valid Record
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 font-bold bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                        Please select valid student and score column mappings on the left.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-between bg-slate-50/50">
              {csvFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setCSVFile(null);
                    setCSVHeaders([]);
                    setCSVRows([]);
                    setCSVFeedback(null);
                  }}
                  className="px-4 py-2 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                >
                  Change File
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCSVUpload(false);
                    setCSVFile(null);
                    setCSVHeaders([]);
                    setCSVRows([]);
                    setCSVFeedback(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                {csvFile && (
                  <button
                    type="button"
                    onClick={handleApplyCSVScores}
                    disabled={!csvFeedback || csvFeedback.matchedLearnersCount === 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Apply Bulk Scores ({csvFeedback?.matchedLearnersCount || 0})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Grade & Mark Assignment Modal */}
      <BulkGradeModal
        isOpen={showBulkAssignModal}
        onClose={() => setShowBulkAssignModal(false)}
        initialClass={selectedClass}
        initialExamSetId={selectedExamSet}
        onApplyBulkGrades={handleApplyBulkGrades}
      />
    </div>
  );
}
