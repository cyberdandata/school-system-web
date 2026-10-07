import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, Learner } from '../types';
import { sectionKeyOfClass, getGradeRank, UNEB_GRADING_BANDS } from '../lib/defaults';
import { 
  Award, 
  Trophy, 
  BookOpen, 
  Search, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  ChevronDown, 
  Filter, 
  Sparkles, 
  Star, 
  Crown, 
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpDown,
  TrendingDown,
  Info
} from 'lucide-react';

interface PerformanceSummaryProps {
  }

type SectionKey = 'all' | 'preprimary' | 'lower' | 'upper';
type SortField = 'average' | 'total' | 'name' | 'rank';
type SortOrder = 'asc' | 'desc';

export default function PerformanceSummary({  }: PerformanceSummaryProps) {
  const data = useAppStore(state => state.data)!;
  // Filter States
  const [selectedSection, setSelectedSection] = useState<SectionKey>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedExamSetId, setSelectedExamSetId] = useState<string>('all'); // 'all' means Cumulative Average across all sets
  const [selectedSex, setSelectedSex] = useState<'all' | 'Male' | 'Female'>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  
  // Sorting States
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Exam sets list
  const examSets = data.settings.examSets;

  // Filter available classes based on selected section
  const availableClasses = useMemo(() => {
    if (selectedSection === 'all') {
      const clsSet = new Set<string>();
      data.learners.forEach(l => clsSet.add(l.cls));
      return Array.from(clsSet).sort();
    }
    
    const sectionClassMap = {
      preprimary: ['ZEBRA', 'LION', 'ELEPHANT'],
      lower: ['P1', 'P2', 'P3'],
      upper: ['P4', 'P5', 'P6', 'Primary 7']
    };
    return sectionClassMap[selectedSection as Exclude<SectionKey, 'all'>] || [];
  }, [data.learners, selectedSection]);

  // Handle section reset: clear class filter if it is not valid in the new section
  React.useEffect(() => {
    if (selectedClass !== 'all' && !availableClasses.includes(selectedClass)) {
      setSelectedClass('all');
    }
  }, [selectedSection, availableClasses, selectedClass]);

  // Toggle Sorting helper
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to high-to-low for scores, name defaults later
    }
  };

  // 1. CALCULATE STUDENT STATISTICS
  const studentsScores = useMemo(() => {
    const list: Array<{
      learner: Learner;
      scores: Record<string, number>;
      average: number;
      total: number;
      subjectsCount: number;
      hasP7Details: boolean;
      pleAggregate?: number;
      pleDivision?: string;
    }> = [];

    data.learners.forEach(learner => {
      // Apply filters
      const sectionKey = sectionKeyOfClass(learner.cls) as SectionKey;
      if (selectedSection !== 'all' && sectionKey !== selectedSection) return;
      if (selectedClass !== 'all' && learner.cls !== selectedClass) return;
      if (selectedSex !== 'all' && learner.sex !== selectedSex) return;
      
      if (studentSearchQuery.trim()) {
        const query = studentSearchQuery.toLowerCase();
        const matchesName = learner.name.toLowerCase().includes(query);
        const matchesAdm = learner.admNo.toLowerCase().includes(query);
        if (!matchesName && !matchesAdm) return;
      }

      // Aggregate scores
      let sum = 0;
      let count = 0;
      const aggregatedScores: Record<string, number> = {};

      const targetSets = selectedExamSetId === 'all' 
        ? examSets 
        : examSets.filter(set => set.id === selectedExamSetId);

      targetSets.forEach(set => {
        const scoreKey = `${learner.id}|${set.id}`;
        const record = data.scores[scoreKey];
        if (record) {
          Object.entries(record).forEach(([subj, m]) => {
            if (typeof m === 'number') {
              if (aggregatedScores[subj] === undefined) {
                aggregatedScores[subj] = 0;
              }
              aggregatedScores[subj] += m;
            }
          });
        }
      });

      // Calculate averages per subject
      const finalScores: Record<string, number> = {};
      let totalAssessedCount = 0;
      Object.entries(aggregatedScores).forEach(([subj, scoreSum]) => {
        let setParticipation = 0;
        targetSets.forEach(set => {
          const r = data.scores[`${learner.id}|${set.id}`];
          if (r && typeof r[subj] === 'number') setParticipation++;
        });

        if (setParticipation > 0) {
          const finalVal = Math.round(scoreSum / setParticipation);
          finalScores[subj] = finalVal;
          sum += finalVal;
          count++;
        }
      });

      if (count > 0) {
        const avg = Math.round((sum / count) * 10) / 10;
        
        // Compute UNEB PLE aggregate if the student is P7 and has core marks entered
        let hasP7Details = false;
        let pleAggregate: number | undefined;
        let pleDivision: string | undefined;

        if (learner.cls === 'Primary 7') {
          const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
          const coreMarks = coreSubjects.map(s => finalScores[s]).filter(m => m !== undefined);
          
          if (coreMarks.length === 4) {
            hasP7Details = true;
            const examMode = localStorage.getItem('otec_exam_mode') === 'true';
            const rawGrading = examMode ? UNEB_GRADING_BANDS : data.settings.sections.upper.grading;
            const grading = [...rawGrading].sort((a,b)=>b.min-a.min);
            const points = coreMarks.map(m => {
              const idx = grading.findIndex(g => m >= g.min && m <= g.max);
              return idx === -1 ? 9 : idx + 1;
            });
            pleAggregate = points.reduce((a,b)=>a+b,0);

            // Apply overrides
            const engGrade = getGradeRank(grading.find(g => (finalScores['English'] || 0) >= g.min && (finalScores['English'] || 0) <= g.max)?.grade || 'F9');
            const mathGrade = getGradeRank(grading.find(g => (finalScores['Mathematics'] || 0) >= g.min && (finalScores['Mathematics'] || 0) <= g.max)?.grade || 'F9');
            const rules = data.settings.pleOverride;
            let div = 'Division U';
            let demoted = false;

            if (rules.enabled) {
              if (pleAggregate <= 12) {
                if (engGrade > rules.englishMinGradeForDiv1 || mathGrade > rules.mathMinGradeForDiv1) {
                  div = 'Division 2';
                  demoted = true;
                } else {
                  div = 'Division 1';
                }
              }
              if (pleAggregate > 12 && pleAggregate <= 24) {
                if (engGrade > rules.englishMinGradeForDiv2 || mathGrade > rules.mathMinGradeForDiv2) {
                  div = 'Division 3';
                  demoted = true;
                } else {
                  div = 'Division 2';
                }
              }
              if (!demoted) {
                if (pleAggregate > 24 && pleAggregate <= 28) div = 'Division 3';
                else if (pleAggregate > 28 && pleAggregate <= 32) div = 'Division 4';
                else if (pleAggregate > 32) div = 'Division U';
              }
            } else {
              if (pleAggregate <= 12) div = 'Division 1';
              else if (pleAggregate <= 24) div = 'Division 2';
              else if (pleAggregate <= 28) div = 'Division 3';
              else if (pleAggregate <= 32) div = 'Division 4';
              else div = 'Division U';
            }
            pleDivision = div;
          }
        }

        list.push({
          learner,
          scores: finalScores,
          average: avg,
          total: sum,
          subjectsCount: count,
          hasP7Details,
          pleAggregate,
          pleDivision
        });
      }
    });

    // Rank students by their performance overall before applying custom sort
    const rankedList = [...list].sort((a, b) => b.average - a.average);
    const withRanks = rankedList.map((item, index) => ({
      ...item,
      baseRank: index + 1
    }));

    // Apply sorting selection
    withRanks.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'rank') {
        comparison = a.baseRank - b.baseRank;
      } else if (sortField === 'average') {
        comparison = b.average - a.average;
      } else if (sortField === 'total') {
        comparison = b.total - a.total;
      } else if (sortField === 'name') {
        comparison = a.learner.name.localeCompare(b.learner.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return withRanks;
  }, [data, selectedSection, selectedClass, selectedExamSetId, selectedSex, studentSearchQuery, sortField, sortOrder, examSets]);

  // 2. CALCULATE SUBJECT DIAGNOSTICS & RANKINGS
  const subjectStats = useMemo(() => {
    interface SubjectStat {
      name: string;
      section: string;
      average: number;
      totalAssessments: number;
      passRate: number; // >= 50 marks
      distinctionRate: number; // >= 75 marks
      highestMark: number;
      highestStudent?: Learner;
      lowestMark: number;
    }

    const statsMap: Record<string, {
      sum: number;
      count: number;
      passes: number;
      distinctions: number;
      highestMark: number;
      highestStudent?: Learner;
      lowestMark: number;
      sectionKeys: Set<string>;
    }> = {};

    // Determine target exam sets
    const targetSets = selectedExamSetId === 'all' 
      ? examSets 
      : examSets.filter(set => set.id === selectedExamSetId);

    // Scan scores
    data.learners.forEach(learner => {
      const sectionKey = sectionKeyOfClass(learner.cls);
      if (selectedSection !== 'all' && sectionKey !== selectedSection) return;
      if (selectedClass !== 'all' && learner.cls !== selectedClass) return;

      targetSets.forEach(set => {
        const r = data.scores[`${learner.id}|${set.id}`];
        if (r) {
          Object.entries(r).forEach(([subj, m]) => {
            if (typeof m === 'number') {
              if (!statsMap[subj]) {
                statsMap[subj] = {
                  sum: 0,
                  count: 0,
                  passes: 0,
                  distinctions: 0,
                  highestMark: -1,
                  lowestMark: 101,
                  sectionKeys: new Set()
                };
              }

              const stat = statsMap[subj];
              stat.sum += m;
              stat.count++;
              stat.sectionKeys.add(sectionKey);
              if (m >= 50) stat.passes++;
              if (m >= 75) stat.distinctions++;
              if (m > stat.highestMark) {
                stat.highestMark = m;
                stat.highestStudent = learner;
              }
              if (m < stat.lowestMark) {
                stat.lowestMark = m;
              }
            }
          });
        }
      });
    });

    return Object.entries(statsMap).map(([name, val]) => {
      const sectionLabels = Array.from(val.sectionKeys).map(k => {
        if (k === 'preprimary') return 'Nursery';
        if (k === 'lower') return 'Lower P.';
        return 'Upper P.';
      });

      return {
        name,
        section: sectionLabels.join(', '),
        average: val.count > 0 ? Math.round((val.sum / val.count) * 10) / 10 : 0,
        totalAssessments: val.count,
        passRate: val.count > 0 ? Math.round((val.passes / val.count) * 100) : 0,
        distinctionRate: val.count > 0 ? Math.round((val.distinctions / val.count) * 100) : 0,
        highestMark: val.highestMark,
        highestStudent: val.highestStudent,
        lowestMark: val.lowestMark === 101 ? 0 : val.lowestMark
      };
    }).sort((a, b) => b.average - a.average); // Sort by average descending
  }, [data, selectedSection, selectedClass, selectedExamSetId, examSets]);

  // Overall statistics summarizing the query
  const querySummary = useMemo(() => {
    if (studentsScores.length === 0) return null;
    const totalCount = studentsScores.length;
    const overallAverage = Math.round(studentsScores.reduce((a, b) => a + b.average, 0) / totalCount * 10) / 10;
    const countPassed = studentsScores.filter(s => s.average >= 50).length;
    const generalPassRate = Math.round((countPassed / totalCount) * 100);

    const highestStudent = [...studentsScores].sort((a, b) => b.average - a.average)[0];

    return {
      totalCount,
      overallAverage,
      generalPassRate,
      highestStudent
    };
  }, [studentsScores]);

  return (
    <div className="space-y-6" id="performance-summary-panel">
      {/* Mini Overview Widget Row */}
      {querySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {/* Card 1: Students Assessed */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assessed Students</span>
              <span className="text-xl font-extrabold text-slate-950 font-mono">{querySummary.totalCount}</span>
            </div>
          </div>

          {/* Card 2: Query Mean Score */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cohort Mean Score</span>
              <span className="text-xl font-extrabold text-slate-950 font-mono">{querySummary.overallAverage}%</span>
            </div>
          </div>

          {/* Card 3: Class Pass Rate */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Pass Rate (Avg ≥ 50%)</span>
              <span className="text-xl font-extrabold text-slate-950 font-mono">{querySummary.generalPassRate}%</span>
            </div>
          </div>

          {/* Card 4: Top Performer Badge */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Trophy size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Top Cohort Learner</span>
              <span className="text-xs font-black text-slate-800 truncate block mt-0.5" title={querySummary.highestStudent.learner.name}>
                {querySummary.highestStudent.learner.name}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">
                Average {querySummary.highestStudent.average}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Filters Area */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50">
          <Filter size={14} className="text-slate-500" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Performance Filter Suite</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* 1. Academic Assessment Set */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={11} /> Assessment Set
            </label>
            <div className="relative">
              <select
                value={selectedExamSetId}
                onChange={(e) => setSelectedExamSetId(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="all">Cumulative (All Term sets averaged)</option>
                {examSets.map(set => (
                  <option key={set.id} value={set.id}>{set.term} - {set.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* 2. Educational Section */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={11} /> School Section
            </label>
            <div className="relative">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as SectionKey)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="all">All Sections Combined</option>
                <option value="preprimary">Nursery (Pre-Primary)</option>
                <option value="lower">Lower Primary (P1 - P3)</option>
                <option value="upper">Upper Primary (P4 - P7)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* 3. Class Streams */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap size={11} /> Class Stream
            </label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="all">All Classes</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* 4. Gender Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users size={11} /> Gender
            </label>
            <div className="relative">
              <select
                value={selectedSex}
                onChange={(e) => setSelectedSex(e.target.value as 'all' | 'Male' | 'Female')}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="all">All Genders</option>
                <option value="Male">Boys Only</option>
                <option value="Female">Girls Only</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* 5. Student Search */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Search size={11} /> Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                placeholder="Name or Adm No..."
                className="w-full bg-white border border-slate-200 hover:border-slate-300 px-3 py-2 pl-8 rounded-xl text-xs font-medium text-slate-700 outline-none transition-all"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2/3: Top Performing Students Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Top Performing Students Leaderboard</h3>
            </div>
            <span className="text-[10px] bg-slate-200/80 text-slate-600 font-extrabold px-2 py-0.5 rounded-full">
              {studentsScores.length} Found
            </span>
          </div>

          {studentsScores.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto text-slate-300 mb-2" size={32} />
              <h4 className="text-xs font-bold text-slate-800">No matching students found</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                No scores were returned for the current set of filters. Try broadening your criteria or updating student records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50 uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-4 text-center w-12 cursor-pointer select-none" onClick={() => handleSort('rank')}>
                      <span className="flex items-center gap-1 justify-center">
                        Rank <ArrowUpDown size={10} />
                      </span>
                    </th>
                    <th className="py-3 px-4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                      <span className="flex items-center gap-1">
                        Student details <ArrowUpDown size={10} />
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center">Class</th>
                    <th className="py-3 px-3 text-center cursor-pointer select-none" onClick={() => handleSort('total')}>
                      <span className="flex items-center gap-1 justify-center">
                        Total Marks <ArrowUpDown size={10} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center cursor-pointer select-none bg-blue-50/20" onClick={() => handleSort('average')}>
                      <span className="flex items-center gap-1 justify-center text-blue-900">
                        Average (%) <ArrowUpDown size={10} />
                      </span>
                    </th>
                    <th className="py-3 px-4 text-right">Performance Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentsScores.slice(0, 50).map((item) => {
                    // Rank style
                    const isTop1 = item.baseRank === 1;
                    const isTop2 = item.baseRank === 2;
                    const isTop3 = item.baseRank === 3;

                    return (
                      <tr key={item.learner.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* Rank Column */}
                        <td className="py-3 px-4 text-center">
                          {isTop1 ? (
                            <div className="flex justify-center">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-black shadow-xs relative">
                                <Crown size={10} className="absolute -top-1.5 -right-1 text-yellow-300 animate-bounce" />
                                1
                              </span>
                            </div>
                          ) : isTop2 ? (
                            <div className="flex justify-center">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black shadow-xs">
                                2
                              </span>
                            </div>
                          ) : isTop3 ? (
                            <div className="flex justify-center">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600/80 text-white font-black shadow-xs">
                                3
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold font-mono">#{item.baseRank}</span>
                          )}
                        </td>

                        {/* Student Details Column */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                              {item.learner.name}
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                item.learner.sex === 'Male' 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'bg-rose-50 text-rose-600'
                              }`}>
                                {item.learner.sex === 'Male' ? 'B' : 'G'}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">
                              Adm: {item.learner.admNo}
                            </span>
                          </div>
                        </td>

                        {/* Class Column */}
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 font-black rounded-lg text-[10px]">
                            {item.learner.cls}
                          </span>
                        </td>

                        {/* Total Marks Column */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {item.total} <span className="text-[10px] text-slate-400">marks</span>
                        </td>

                        {/* Average Marks Column */}
                        <td className="py-3 px-4 text-center font-mono font-black text-blue-600 bg-blue-50/10 text-sm">
                          {item.average}%
                        </td>

                        {/* Profile Indicator column */}
                        <td className="py-3 px-4 text-right">
                          {item.hasP7Details ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-extrabold text-blue-700 font-mono text-[11px]">
                                {item.pleAggregate} Aggregate pts
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wider border ${
                                item.pleDivision === 'Division 1' 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                  : item.pleDivision === 'Division 2' 
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-amber-50 text-amber-600 border-amber-200'
                              }`}>
                                {item.pleDivision}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-16 bg-slate-100 border border-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full rounded-full ${
                                    item.average >= 75 ? 'bg-emerald-500' :
                                    item.average >= 50 ? 'bg-blue-500' :
                                    item.average >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${item.average}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                {item.average >= 75 ? 'Excellent' :
                                 item.average >= 50 ? 'Good' :
                                 item.average >= 40 ? 'Pass' : 'Weak'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium text-center">
            * Leaderboard renders top 50 matches. Use the general search bar to pinpoint specific student scores.
          </div>
        </div>

        {/* Right 1/3: Subject Diagnostics Rankings Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-150 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Subject Performance Diagnostics</h3>
          </div>

          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 text-[11px] text-indigo-900 font-medium flex items-start gap-2">
            <Sparkles size={14} className="text-indigo-600 mt-0.5 shrink-0" />
            <span>
              Subjects ordered from highest to lowest class-wide average score. Identifies learning curves and academic achievements.
            </span>
          </div>

          {subjectStats.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No subject score recordings returned.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto custom-scrollbar">
              {subjectStats.map((sub, idx) => {
                const getPerformanceEmoji = (avg: number) => {
                  if (avg >= 70) return '⭐';
                  if (avg >= 55) return '📈';
                  return '⚠️';
                };

                return (
                  <div key={sub.name} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                    {/* Header line: Name, Avg, Section */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{sub.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold">({sub.section})</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mt-0.5">
                          Rank #{idx + 1} &middot; {sub.totalAssessments} exam scores
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-950 font-mono">
                          {sub.average}%
                        </span>
                        <span className="text-[10px] block mt-0.5 font-bold text-slate-500">
                          {getPerformanceEmoji(sub.average)} Avg score
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            sub.average >= 70 ? 'bg-emerald-500' :
                            sub.average >= 55 ? 'bg-indigo-500' :
                            sub.average >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${sub.average}%` }}
                        />
                      </div>
                      {/* Secondary metrics (Pass rate and Distinction rate) */}
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          Pass Rate: <b className="text-slate-800">{sub.passRate}%</b>
                        </span>
                        <span className="flex items-center gap-1">
                          Distinction Rate: <b className="text-slate-800">{sub.distinctionRate}%</b>
                        </span>
                      </div>
                    </div>

                    {/* Top Scoring Student Milestone */}
                    {sub.highestStudent && (
                      <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Star size={11} className="text-amber-500 shrink-0" />
                          <span className="text-slate-400 font-bold shrink-0">Top Student:</span>
                          <span className="font-extrabold text-slate-800 truncate" title={sub.highestStudent.name}>
                            {sub.highestStudent.name}
                          </span>
                        </div>
                        <span className="font-extrabold text-emerald-600 shrink-0 font-mono">
                          {sub.highestMark}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
