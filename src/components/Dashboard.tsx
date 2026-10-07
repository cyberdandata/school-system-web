import { useAppStore } from "../store/useAppStore";
import React, { useState, useEffect } from 'react';
import { AppData, Learner } from '../types';
import { getGradeRank, sectionKeyOfClass, UNEB_GRADING_BANDS } from '../lib/defaults';
import ClassScoreTrends from './ClassScoreTrends';
import PlePerformanceTrend from './PlePerformanceTrend';
import PerformanceSummary from './PerformanceSummary';
import AcademicSummaryRadar from './AcademicSummaryRadar';
import FinanceManager from './FinanceManager';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Award, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  TrendingDown,
  BarChart3,
  Calendar,
  Layers,
  Activity,
  History,
  Printer,
  Database,
  Settings,
  Trash2,
  Clock,
  Wallet,
  BedDouble,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

function formatLogTime(isoString: string) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

interface DashboardProps {
  }

export default function Dashboard({  }: DashboardProps) {
  const data = useAppStore(state => state.data)!;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardView, setDashboardView] = useState<'analytics' | 'finances'>('analytics');

  const activeLearners = (data.learners || []).filter(l => !l.archived);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Filter current term exam sets
  const currentTerm = data.settings.term || 'Term 3';
  const currentTermExamSets = data.settings.examSets.filter(set => set.term === currentTerm);
  
  // 2. Select initial exam set for grade distribution analysis
  const [selectedTrendSetId, setSelectedTrendSetId] = useState<string>(
    currentTermExamSets.length > 0 ? currentTermExamSets[currentTermExamSets.length - 1].id : 'ES9'
  );
  const [activeTrendTab, setActiveTrendTab] = useState<'distribution' | 'trends' | 'summary'>('distribution');

  // 3. Grade Distribution data for selectedTrendSetId
  interface SubjectGradeDist {
    subject: string;
    distinction: number;
    credit: number;
    pass: number;
    fail: number;
    total: number;
  }
  
  const distributionChartData: SubjectGradeDist[] = [];
  const subjectMap: Record<string, { distinction: number; credit: number; pass: number; fail: number; total: number }> = {};

  const examMode = localStorage.getItem('otec_exam_mode') === 'true';

  const getEffectiveGrading = (cls: string, sectionKey: 'preprimary' | 'lower' | 'upper') => {
    if (examMode && (cls === 'Primary 7' || cls === 'P7' || sectionKey === 'upper')) {
      return UNEB_GRADING_BANDS;
    }
    return data.settings.sections[sectionKey].grading;
  };

  activeLearners.forEach(learner => {
    const sKey = `${learner.id}|${selectedTrendSetId}`;
    const record = data.scores[sKey];
    if (record) {
      const sectionKey = sectionKeyOfClass(learner.cls);
      const grading = (examMode && (learner.cls === 'Primary 7' || learner.cls === 'P7' || sectionKey === 'upper'))
        ? UNEB_GRADING_BANDS
        : data.settings.sections[sectionKey].grading;
      
      Object.entries(record).forEach(([subject, m]) => {
        if (typeof m === 'number') {
          const band = grading.find(g => m >= g.min && m <= g.max);
          const grade = band ? band.grade : 'F9';
          
          let category: 'distinction' | 'credit' | 'pass' | 'fail' = 'fail';
          if (['D1', 'D2'].includes(grade)) category = 'distinction';
          else if (['C3', 'C4', 'C5', 'C6'].includes(grade)) category = 'credit';
          else if (['P7', 'P8'].includes(grade)) category = 'pass';
          
          if (!subjectMap[subject]) {
            subjectMap[subject] = { distinction: 0, credit: 0, pass: 0, fail: 0, total: 0 };
          }
          
          subjectMap[subject][category]++;
          subjectMap[subject].total++;
        }
      });
    }
  });

  Object.entries(subjectMap).forEach(([subject, counts]) => {
    distributionChartData.push({
      subject,
      ...counts
    });
  });

  // 4. Term Trend (Average Marks) data for currentTermExamSets
  const termTrendChartData = currentTermExamSets.map(set => {
    let sum = 0;
    let count = 0;
    activeLearners.forEach(learner => {
      const sKey = `${learner.id}|${set.id}`;
      const record = data.scores[sKey];
      if (record) {
        Object.values(record).forEach(m => {
          if (typeof m === 'number') {
            sum += m;
            count++;
          }
        });
      }
    });
    return {
      name: set.label,
      average: count ? Math.round((sum / count) * 10) / 10 : 0,
      studentCount: count
    };
  });

  // Aggregate statistics
  const totalLearners = activeLearners.length;
  const boysCount = activeLearners.filter(l => l.sex === 'Male').length;
  const girlsCount = activeLearners.filter(l => l.sex === 'Female').length;
  const pendingAdmissions = data.admissions?.applicants?.filter(a => a.status === 'Pending').length || 0;

  // Let's analyze scores for active context
  // We'll search for the latest active exam set sat by our candidates. Let's look at ES3 (EOT) or check any exam set with scores.
  const activeExamSets = data.settings.examSets;
  
  // Find all scores
  const allScoreRecords = Object.entries(data.scores);
  let totalMarksCount = 0;
  let totalMarksSum = 0;
  let d1ToC6PassCount = 0;
  let totalGradesCount = 0;

  // Find division counts for candidate class (Primary 7)
  const divCounts = { 'Division 1': 0, 'Division 2': 0, 'Division 3': 0, 'Division 4': 0, 'Division U': 0 };
  let candidateCount = 0;

  // Calculate stats
  activeLearners.forEach(learner => {
    const isP7 = learner.cls === 'Primary 7';
    if (isP7) candidateCount++;

    // Check for standard Term 1 EOT (ES3) or other sets
    // Let's aggregate scores across any available score keys
    activeExamSets.forEach(set => {
      const sKey = `${learner.id}|${set.id}`;
      const record = data.scores[sKey];
      if (record) {
        const marks = Object.values(record);
        marks.forEach(m => {
          if (typeof m === 'number') {
            totalMarksSum += m;
            totalMarksCount++;

            // Grading Check
            const sectionKey = sectionKeyOfClass(learner.cls);
            const grading = getEffectiveGrading(learner.cls, sectionKey);
            const band = grading.find(g => m >= g.min && m <= g.max);
            if (band) {
              totalGradesCount++;
              if (['D1', 'D2', 'C3', 'C4', 'C5', 'C6'].includes(band.grade)) {
                d1ToC6PassCount++;
              }
            }
          }
        });

        // If P7, also evaluate division for this exam set (usually we look at EOT)
        if (isP7 && set.period === 'EOT') {
          const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
          const marksForCore = coreSubjects.map(subj => record[subj]).filter(m => m !== undefined);
          
          if (marksForCore.length === 4) {
            const sectionKey = sectionKeyOfClass(learner.cls);
            const grading = [...getEffectiveGrading(learner.cls, sectionKey)].sort((a,b)=>b.min-a.min);
            const points = marksForCore.map(m => {
              const numMark = m as number;
              const idx = grading.findIndex(g => numMark >= g.min && numMark <= g.max);
              return idx === -1 ? 9 : idx + 1;
            }).sort((a,b)=>a-b);
            
            // Sum of 4 subjects
            let agg = points.reduce((a, b) => a + b, 0);

            // COMPULSORY OVERRIDE check
            let division = 'Division U';
            const engScore = (record['English'] || 0) as number;
            const engGrade = getGradeRank(grading.find(g => engScore >= g.min && engScore <= g.max)?.grade || 'F9');
            const mathScore = (record['Mathematics'] || 0) as number;
            const mathGrade = getGradeRank(grading.find(g => mathScore >= g.min && mathScore <= g.max)?.grade || 'F9');

            const rules = data.settings.pleOverride;
            let demoted = false;

            if (rules.enabled) {
              // Division 1 check: eng and math must be better or equal to required limit
              if (agg <= 12) {
                if (engGrade > rules.englishMinGradeForDiv1 || mathGrade > rules.mathMinGradeForDiv1) {
                  division = 'Division 2'; // Demoted
                  demoted = true;
                } else {
                  division = 'Division 1';
                }
              }
              // Division 2 check:
              if (agg > 12 && agg <= 24) {
                if (engGrade > rules.englishMinGradeForDiv2 || mathGrade > rules.mathMinGradeForDiv2) {
                  division = 'Division 3'; // Demoted
                  demoted = true;
                } else {
                  division = 'Division 2';
                }
              }
              if (!demoted) {
                if (agg > 24 && agg <= 28) division = 'Division 3';
                else if (agg > 28 && agg <= 32) division = 'Division 4';
                else if (agg > 32) division = 'Division U';
              }
            } else {
              if (agg <= 12) division = 'Division 1';
              else if (agg <= 24) division = 'Division 2';
              else if (agg <= 28) division = 'Division 3';
              else if (agg <= 32) division = 'Division 4';
              else division = 'Division U';
            }

            if (division in divCounts) {
              divCounts[division as keyof typeof divCounts]++;
            }
          }
        }
      }
    });
  });

  const overallAverage = totalMarksCount ? Math.round(totalMarksSum / totalMarksCount) : 0;
  const passRate = totalGradesCount ? Math.round((d1ToC6PassCount / totalGradesCount) * 100) : 0;

  // Let's find top performing students in latest Term (Let's query ES3 for demonstration)
  const esId = 'ES3'; // End of Term 1
  const examLabel = activeExamSets.find(s => s.id === esId)?.label || 'EOT Set 1';

  interface LeaderboardItem {
    learner: Learner;
    total: number;
    average: number;
    div?: string;
    agg?: number;
  }

  const p7Leaderboard: LeaderboardItem[] = [];
  const otherLeaderboard: LeaderboardItem[] = [];

  activeLearners.forEach(learner => {
    const record = data.scores[`${learner.id}|${esId}`];
    if (record) {
      const marks = Object.values(record).filter(m => typeof m === 'number') as number[];
      if (marks.length > 0) {
        const sum = marks.reduce((a,b)=>a+b,0);
        const avg = Math.round(sum / marks.length);

        if (learner.cls === 'Primary 7') {
          // Calculate PLE Aggregate and division
          const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
          const coreMarks = coreSubjects.map(s => record[s]).filter(m => typeof m === 'number') as number[];
          let div = 'Division U';
          let agg = 36;
          
          if (coreMarks.length === 4) {
            const sectionKey = sectionKeyOfClass(learner.cls);
            const grading = [...getEffectiveGrading(learner.cls, sectionKey)].sort((a,b)=>b.min-a.min);
            const points = coreMarks.map(m => {
              const idx = grading.findIndex(g => m >= g.min && m <= g.max);
              return idx === -1 ? 9 : idx + 1;
            });
            agg = points.reduce((a,b)=>a+b,0);
            
            const engScore = (record['English'] || 0) as number;
            const engGrade = getGradeRank(grading.find(g => engScore >= g.min && engScore <= g.max)?.grade || 'F9');
            const mathScore = (record['Mathematics'] || 0) as number;
            const mathGrade = getGradeRank(grading.find(g => mathScore >= g.min && mathScore <= g.max)?.grade || 'F9');
            const rules = data.settings.pleOverride;
            let demoted = false;

            if (rules.enabled) {
              if (agg <= 12) {
                if (engGrade > rules.englishMinGradeForDiv1 || mathGrade > rules.mathMinGradeForDiv1) {
                  div = 'Division 2';
                  demoted = true;
                } else {
                  div = 'Division 1';
                }
              }
              if (agg > 12 && agg <= 24) {
                if (engGrade > rules.englishMinGradeForDiv2 || mathGrade > rules.mathMinGradeForDiv2) {
                  div = 'Division 3';
                  demoted = true;
                } else {
                  div = 'Division 2';
                }
              }
              if (!demoted) {
                if (agg > 24 && agg <= 28) div = 'Division 3';
                else if (agg > 28 && agg <= 32) div = 'Division 4';
                else if (agg > 32) div = 'Division U';
              }
            } else {
              if (agg <= 12) div = 'Division 1';
              else if (agg <= 24) div = 'Division 2';
              else if (agg <= 28) div = 'Division 3';
              else if (agg <= 32) div = 'Division 4';
              else div = 'Division U';
            }
          }

          p7Leaderboard.push({ learner, total: sum, average: avg, div, agg });
        } else {
          otherLeaderboard.push({ learner, total: sum, average: avg });
        }
      }
    }
  });

  // Sort Leaderboards
  p7Leaderboard.sort((a, b) => {
    // Primary 7 is primarily ranked by aggregate (lower is better), then average (higher is better)
    const aggA = a.agg ?? 36;
    const aggB = b.agg ?? 36;
    if (aggA !== aggB) return aggA - aggB;
    return b.average - a.average;
  });

  otherLeaderboard.sort((a, b) => b.average - a.average);

  // Core Subject Averages (P7)
  const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
  const subjectPerformance = coreSubjects.map(subject => {
    let sum = 0;
    let count = 0;
    activeLearners.forEach(learner => {
      const record = data.scores[`${learner.id}|${esId}`];
      if (record && typeof record[subject] === 'number') {
        sum += record[subject] as number;
        count++;
      }
    });
    return {
      subject,
      average: count ? Math.round(sum / count) : 0,
      count
    };
  });

  // Check warning flags for active candidates (E.g. students who failed Mathematics/English override but have good aggregates)
  const supportAlerts: { learner: Learner; reason: string; agg?: number }[] = [];
  activeLearners.forEach(learner => {
    if (learner.cls === 'Primary 7') {
      const record = data.scores[`${learner.id}|${esId}`];
      if (record) {
        const engMark = (record['English'] || 0) as number;
        const mathMark = (record['Mathematics'] || 0) as number;
        const sectionKey = sectionKeyOfClass(learner.cls);
        const grading = [...getEffectiveGrading(learner.cls, sectionKey)].sort((a,b)=>b.min-a.min);
        
        const engGrade = grading.find(g => engMark >= g.min && engMark <= g.max)?.grade || 'F9';
        const mathGrade = grading.find(g => mathMark >= g.min && mathMark <= g.max)?.grade || 'F9';

        const engRank = getGradeRank(engGrade);
        const mathRank = getGradeRank(mathGrade);

        const coreMarks = coreSubjects.map(s => record[s]).filter(m => typeof m === 'number') as number[];
        if (coreMarks.length === 4) {
          const points = coreMarks.map(m => {
            const numMark = m as number;
            const idx = grading.findIndex(g => numMark >= g.min && numMark <= g.max);
            return idx === -1 ? 9 : idx + 1;
          });
          const agg = points.reduce((a,b)=>a+b,0);
          const rules = data.settings.pleOverride;

          if (rules.enabled) {
            if (agg <= 12 && (engRank > rules.englishMinGradeForDiv1 || mathRank > rules.mathMinGradeForDiv1)) {
              supportAlerts.push({
                learner,
                reason: `Demoted from Div 1 due to Compulsory Override (Eng: ${engGrade}, Math: ${mathGrade})`,
                agg
              });
            } else if (engRank === 9 || mathRank === 9) {
              supportAlerts.push({
                learner,
                reason: `Critical Fail (F9) in core subject (${engRank === 9 ? 'English' : ''} ${mathRank === 9 ? 'Math' : ''})`,
                agg
              });
            }
          }
        }
      }
    }
  });

  // --- EXECUTIVE KPIs ---
  const totalOutstanding = data.learners.reduce((sum, l) => {
    const bal = l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0;
    return sum + (isNaN(bal) ? 0 : bal);
  }, 0);

  const allStaff = [...(data.settings?.teachersList || []), ...(data.settings?.nonTeachingStaffList || [])];
  const staffOnLeave = allStaff.filter(e => e.status === 'On Leave').length;

  const totalBeds = (data.hostel?.dormitories || []).reduce((sum, dorm) => {
    return sum + (dorm.rooms || []).reduce((rSum, room) => rSum + (room.capacity || 0), 0);
  }, 0);
  const occupiedBeds = (data.hostel?.allocations || []).length;
  const bedVacancies = totalBeds - occupiedBeds;

  const activeVisitors = (data.security?.visitors || []).filter(v => v.status === 'Inside School').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Executive KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Arrears</p>
            <p className="text-xl font-black text-slate-900">UGX {totalOutstanding >= 1000000 ? (totalOutstanding / 1000000).toFixed(1) + 'M' : totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff on Leave</p>
            <p className="text-xl font-black text-slate-900">{staffOnLeave}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <BedDouble size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bed Vacancies</p>
            <p className="text-xl font-black text-slate-900">{bedVacancies}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Visitors</p>
            <p className="text-xl font-black text-slate-900">{activeVisitors}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
            {dashboardView === 'analytics' ? 'Real-Time Performance Analytics' : 'Daily Finance Management'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {dashboardView === 'analytics' 
              ? `Detailed metrics and diagnostic outputs for ${data.settings.schoolName} · ${data.settings.term} ${data.settings.year}`
              : `Manage revenues, tuition payments, bursar ledgers, and operational costs for ${data.settings.schoolName}`
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Live Date and Time Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-700 font-mono shadow-2xs">
            <Clock size={14} className="text-blue-600 animate-pulse" />
            <span>{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-950 font-black">{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">Validated</span>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">PLE Ready</span>
          </div>
        </div>
      </div>

      {/* Dashboard Sub-Tab Selector */}
      <div className="bg-slate-200/60 p-1 rounded-2xl flex gap-1 w-full md:w-max border border-slate-200/20 print:hidden">
        <button
          onClick={() => setDashboardView('analytics')}
          className={`flex-1 md:flex-none px-6 py-2 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
            dashboardView === 'analytics'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 size={14} className={dashboardView === 'analytics' ? 'text-blue-600' : ''} />
          <span>Academic Analytics</span>
        </button>
        <button
          onClick={() => setDashboardView('finances')}
          className={`flex-1 md:flex-none px-6 py-2 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
            dashboardView === 'finances'
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet size={14} className={dashboardView === 'finances' ? 'text-blue-600' : ''} />
          <span>School Finances</span>
        </button>
      </div>

      {dashboardView === 'finances' ? (
        <FinanceManager />
      ) : (
        <>
          {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Learners</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalLearners}</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex gap-3 border-t border-slate-100 pt-3">
            <span>Boys: <b className="text-slate-700">{boysCount}</b></span>
            <span className="text-slate-200">|</span>
            <span>Girls: <b className="text-slate-700">{girlsCount}</b></span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">New Admissions</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingAdmissions}</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-3">
            <Clock size={14} className="text-orange-500" />
            <span>Pending reviews</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">School Average</span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallAverage}%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-3">
            <TrendingUp size={14} className="text-emerald-500" />
            <span>Aggregate score from all papers</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pass Rate (D1 - C6)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{passRate}%</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-3">
            <UserCheck size={14} className="text-emerald-500" />
            <span>Target: Credit pass and above</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">P7 Division 1</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{divCounts['Division 1']}</span>
            <span className="text-xs text-slate-400 font-medium">candidates</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 border-t border-slate-100 pt-3">
            <span>Out of <b className="text-slate-700">{candidateCount}</b> registered candidates</span>
          </div>
        </div>
      </div>

      {/* Recharts Performance Trends & Grade Distributions Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">Performance Trends & Grade Distributions</h3>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Current Term: {currentTerm} Analysis
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab Toggles */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setActiveTrendTab('distribution')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTrendTab === 'distribution'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers size={13} />
                <span>Grade Distribution</span>
              </button>
              <button
                onClick={() => setActiveTrendTab('trends')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTrendTab === 'trends'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Activity size={13} />
                <span>Term-wide Progress</span>
              </button>
              <button
                onClick={() => setActiveTrendTab('summary')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTrendTab === 'summary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award size={13} />
                <span>Performance Summary</span>
              </button>
            </div>

            {/* Exam Set Selector (Only active for distribution tab) */}
            {activeTrendTab === 'distribution' && currentTermExamSets.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                <Calendar size={13} className="text-slate-400" />
                <select
                  value={selectedTrendSetId}
                  onChange={(e) => setSelectedTrendSetId(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-700 outline-none border-none cursor-pointer pr-1"
                >
                  {currentTermExamSets.map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {activeTrendTab === 'distribution' ? (
          <div>
            {distributionChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={distributionChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="subject" 
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                        labelStyle={{ fontWeight: 'black', color: '#0f172a' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        iconType="circle" 
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, fontWeight: 700, color: '#475569' }} 
                      />
                      <Bar dataKey="distinction" name="Distinction (D1-D2)" stackId="a" fill="#10b981" />
                      <Bar dataKey="credit" name="Credit (C3-C6)" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="pass" name="Pass (P7-P8)" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="fail" name="Fail (F9)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center font-medium">
                  * Visualizing exact student count distribution categorized by standard UNEB grading bands across school subjects.
                </p>
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                <Layers size={36} className="text-slate-300 mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-800">No Grade Data Recorded</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  We couldn't find any score entries recorded for this specific exam set. Please head to "Enter Scores" to record some marks first.
                </p>
              </div>
            )}
          </div>
        ) : activeTrendTab === 'trends' ? (
          <div>
            {termTrendChartData.some(item => item.studentCount > 0) ? (
              <div className="space-y-4">
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={termTrendChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                        labelStyle={{ fontWeight: 'black', color: '#0f172a' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={40} 
                        iconType="circle" 
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, fontWeight: 700 }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="average" 
                        name="Overall Class Average (%)" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorAvg)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center font-medium">
                  * Tracing overall academic trajectory and average marks achieved across available assessment milestones for {currentTerm}.
                </p>
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                <Activity size={36} className="text-slate-300 mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-800">No Assessment Milestones</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                  No chronological marks trend has been recorded for this term yet. Ensure scores are entered for BOT, MOT, and EOT sets to see your academic progress!
                </p>
              </div>
            )}
          </div>
        ) : (
          <PerformanceSummary />
        )}
      </div>

      {/* Academic Summary Radar Chart & Curriculum Diagnostic Widget */}
      <AcademicSummaryRadar />

      {/* Class-wide average score trends across different terms and subject sets */}
      <ClassScoreTrends />

      {/* Primary Leaving Examination predicted class-wide performance trend */}
      <PlePerformanceTrend />

      {/* Advanced performance analysis graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P7 Division Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-950 mb-1">Candidate Division Distribution</h3>
          <p className="text-xs text-slate-500 mb-6">Aggregate profile based on {examLabel} results (UNEB Bands)</p>
          
          <div className="space-y-4">
            {Object.entries(divCounts).map(([div, count]) => {
              const maxCount = Math.max(...Object.values(divCounts), 1);
              const percentage = Math.round((count / maxCount) * 100);
              const actualPct = candidateCount ? Math.round((count / candidateCount) * 100) : 0;
              
              // Colors for divisions
              const barColors: { [key: string]: string } = {
                'Division 1': 'bg-blue-600',
                'Division 2': 'bg-emerald-600',
                'Division 3': 'bg-amber-500',
                'Division 4': 'bg-orange-500',
                'Division U': 'bg-slate-500'
              };

              return (
                <div key={div} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{div}</span>
                    <span className="text-slate-500">{count} student(s) <span className="text-slate-400 font-normal">({actualPct}%)</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColors[div] || 'bg-slate-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* P7 Subject Performance Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-950 mb-1">Pass Rates by Core UNEB Subject</h3>
          <p className="text-xs text-slate-500 mb-6">Average marks out of 100 for candidates in {examLabel}</p>

          <div className="space-y-5">
            {subjectPerformance.map((subj) => (
              <div key={subj.subject} className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-600 w-28 shrink-0 truncate">{subj.subject}</span>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-indigo-600 rounded-lg transition-all duration-500 flex items-center px-2 text-[10px] text-white font-bold"
                      style={{ width: `${subj.average}%` }}
                    >
                      {subj.average > 15 ? `${subj.average}%` : ''}
                    </div>
                  </div>
                </div>
                {subj.average <= 15 && (
                  <span className="text-xs font-bold text-slate-700">{subj.average}%</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-50/50 border border-indigo-100/60 rounded-xl text-xs text-indigo-700">
            <b>Insight:</b> Consistent performance across core subjects ensures better aggregate points in PLE.
          </div>
        </div>
      </div>

      {/* Leaderboard Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidates Top Performers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-slate-950">P7 Candidate Rankings</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{examLabel}</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">Ranked by UNEB Aggregate points (sum of 4 core grades, lower is better)</p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2 font-semibold">Rank</th>
                  <th className="pb-2 font-semibold">Candidate Name</th>
                  <th className="pb-2 text-center font-semibold">Aggregate</th>
                  <th className="pb-2 text-center font-semibold">Average</th>
                  <th className="pb-2 text-right font-semibold">Division</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {p7Leaderboard.slice(0, 5).map((item, idx) => (
                  <tr key={item.learner.id} className="hover:bg-slate-50/40">
                    <td className="py-2.5 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{item.learner.name}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-blue-600">{item.agg} agg</td>
                    <td className="py-2.5 text-center font-semibold text-slate-600">{item.average}%</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        item.div === 'Division 1' 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {item.div}
                      </span>
                    </td>
                  </tr>
                ))}
                {p7Leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">No candidate scores recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Warning & Core Override Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-950 mb-1">Compulsory Override Diagnostics</h3>
          <p className="text-xs text-slate-500 mb-4">Candidates requiring academic attention or affected by subject overrides</p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {supportAlerts.map((item, index) => (
              <div 
                key={index} 
                className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl flex items-start gap-3 text-xs text-amber-800"
              >
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-950">{item.learner.name}</div>
                  <div className="text-amber-700 font-medium">{item.reason}</div>
                  <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                    Core Aggregate without override: <span className="underline">{item.agg} pts</span>
                  </div>
                </div>
              </div>
            ))}
            
            {supportAlerts.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                All candidates are passing compulsory subject guidelines cleanly.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* School Calendar & Events Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200/40 rounded-xl">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">School Calendar &amp; Term Milestones</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Official key term events, assessment deadlines, and holidays for this term
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-500 bg-slate-100/80 border border-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            {(data.settings.calendarEvents || []).length} Scheduled Entries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(!data.settings.calendarEvents || data.settings.calendarEvents.length === 0) ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              No calendar events or deadlines defined for this academic term.
            </div>
          ) : (
            [...data.settings.calendarEvents]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((ev) => {
                const dateObj = new Date(ev.date);
                const isPast = dateObj.getTime() < Date.now() - 24 * 60 * 60 * 1000;
                
                // Styles based on type
                let typeBadge = '';
                let borderStyle = 'border-slate-100';
                let iconBg = 'bg-slate-50 text-slate-500';
                
                if (ev.type === 'holiday') {
                  typeBadge = 'bg-amber-500/10 text-amber-700 border-amber-500/20';
                  borderStyle = 'border-amber-100/80 bg-amber-50/5';
                  iconBg = 'bg-amber-500/10 text-amber-600';
                } else if (ev.type === 'deadline') {
                  typeBadge = 'bg-rose-500/10 text-rose-700 border-rose-500/20';
                  borderStyle = 'border-rose-100/80 bg-rose-50/5';
                  iconBg = 'bg-rose-500/10 text-rose-600';
                } else {
                  typeBadge = 'bg-blue-500/10 text-blue-700 border-blue-500/20';
                  borderStyle = 'border-blue-100/80 bg-blue-50/5';
                  iconBg = 'bg-blue-500/10 text-blue-600';
                }

                return (
                  <div 
                    key={ev.id} 
                    className={`flex flex-col justify-between p-4 border rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 ${borderStyle} ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2.5">
                          <div className={`p-2 rounded-xl shrink-0 ${iconBg}`}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block font-mono">
                              {ev.date}
                            </span>
                            <span className={`inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border mt-1 ${typeBadge}`}>
                              {ev.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                          {ev.title}
                        </h4>
                        {ev.description && (
                          <p className="text-[11px] text-slate-500 font-medium mt-1.5 line-clamp-3 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-bold font-mono uppercase">
                        {dateObj.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      {isPast ? (
                        <span className="text-slate-400 font-black uppercase tracking-wider">Concluded</span>
                      ) : (
                        <span className="text-emerald-600 font-black uppercase tracking-wider animate-pulse">Upcoming</span>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* System Activity Log Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-50 text-slate-700 border border-slate-200/40 rounded-xl">
              <History size={18} className="text-slate-600 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950">System Activity Log</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Audit trail of administrative operations
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-500 bg-slate-100/80 border border-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
            {(data.activityLog || []).length} Recorded Operations
          </span>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
          {(data.activityLog || []).map((log) => {
            // Pick icon and color scheme based on log type
            let iconElement = <Activity size={14} />;
            let badgeStyle = "bg-slate-50 text-slate-700 border-slate-200";
            let typeLabel = "Activity";

            switch (log.type) {
              case 'report_printed':
                iconElement = <Printer size={14} />;
                badgeStyle = "bg-blue-50 text-blue-700 border-blue-100";
                typeLabel = "Report Card";
                break;
              case 'data_imported':
                iconElement = <Database size={14} />;
                badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-100";
                typeLabel = "Data Import";
                break;
              case 'settings_modified':
                iconElement = <Settings size={14} />;
                badgeStyle = "bg-violet-50 text-violet-700 border-violet-100";
                typeLabel = "Settings Setup";
                break;
              case 'reset_defaults':
                iconElement = <Trash2 size={14} />;
                badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";
                typeLabel = "System Reset";
                break;
            }

            return (
              <div 
                key={log.id}
                className="flex items-start justify-between gap-4 p-3 bg-slate-50/20 hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 rounded-xl transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badgeStyle}`}>
                    {iconElement}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeStyle}`}>
                        {typeLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {log.details}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">
                      Operator: <span className="font-extrabold text-slate-600">@{log.operator}</span>
                    </p>
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0 pt-1">
                  {formatLogTime(log.timestamp)}
                </span>
              </div>
            );
          })}

          {(!data.activityLog || data.activityLog.length === 0) && (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              No recent system logs or admin activities recorded yet.
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
