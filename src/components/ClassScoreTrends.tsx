import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, Subject, ExamSet } from '../types';
import { sectionKeyOfClass, TERMS, PERIODS, SECTIONS } from '../lib/defaults';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  BookOpen,
  Filter,
  Sparkles,
  Award,
  BarChart3,
  GraduationCap,
  ChevronRight,
  Info
} from 'lucide-react';

interface ClassScoreTrendsProps {
  }

type SectionKey = 'preprimary' | 'lower' | 'upper';

const SUBJECT_COLORS: Record<string, string> = {
  // Pre-primary
  'NUMBERS': '#3b82f6', // Blue
  'ENGLISH': '#10b981', // Emerald
  'HEALTH HABBITS': '#f43f5e', // Rose
  'SOCIAL DEVELOPMENTS': '#f59e0b', // Amber
  'READING': '#8b5cf6', // Violet
  'WRITING': '#ec4899', // Pink
  'DRAWING': '#06b6d4', // Cyan

  // Lower & Upper standard
  'Mathematics': '#3b82f6',
  'English': '#10b981',
  'Science': '#f43f5e',
  'Social Studies': '#f59e0b',
  'Religious Education': '#8b5cf6',
  'Literacy 1': '#06b6d4',
  'Literacy 2': '#14b8a6',
  'Luganda': '#ec4899',
  'ICT / Integrated Studies': '#6366f1'
};

const getSubjectColor = (subjectName: string): string => {
  return SUBJECT_COLORS[subjectName] || '#64748b';
};

export default function ClassScoreTrends({  }: ClassScoreTrendsProps) {
  const data = useAppStore(state => state.data)!;
  const [selectedSection, setSelectedSection] = useState<SectionKey>('upper');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [chartView, setChartView] = useState<'multi' | 'overall'>('multi');
  const [activeSubject, setActiveSubject] = useState<string>('all');

  // 1. Get ordered list of exams chronologically (ES1 to ES9)
  const sortedExamSets = useMemo(() => {
    const termOrder = ['Term 1', 'Term 2', 'Term 3'];
    const periodOrder = ['BOT', 'MOT', 'EOT'];
    return [...data.settings.examSets].sort((a, b) => {
      const tA = termOrder.indexOf(a.term);
      const tB = termOrder.indexOf(b.term);
      if (tA !== tB) return tA - tB;
      const pA = periodOrder.indexOf(a.period);
      const pB = periodOrder.indexOf(b.period);
      return pA - pB;
    });
  }, [data.settings.examSets]);

  // Get current available classes for the selected section
  const availableClasses = useMemo(() => {
    return SECTIONS[selectedSection]?.classes || [];
  }, [selectedSection]);

  // Reset selected class filter when section changes
  React.useEffect(() => {
    setSelectedClass('all');
    setActiveSubject('all');
  }, [selectedSection]);

  // Get subjects for selected section
  const subjects = useMemo(() => {
    return data.settings.sections[selectedSection]?.subjects || [];
  }, [data.settings.sections, selectedSection]);

  // Calculate trends data
  const trendData = useMemo(() => {
    return sortedExamSets.map(examSet => {
      // Filter learners belonging to current section/class
      const sectionLearners = data.learners.filter(learner => {
        const isSec = sectionKeyOfClass(learner.cls) === selectedSection;
        if (!isSec) return false;
        if (selectedClass !== 'all' && learner.cls !== selectedClass) return false;
        return true;
      });

      const subjectAverages: Record<string, number | null> = {};
      let totalMarks = 0;
      let totalMarksCount = 0;
      let totalAssessedStudents = new Set<string>();

      subjects.forEach(subj => {
        let sum = 0;
        let count = 0;

        sectionLearners.forEach(learner => {
          const scoreKey = `${learner.id}|${examSet.id}`;
          const scores = data.scores[scoreKey];
          if (scores && typeof scores[subj.name] === 'number') {
            sum += scores[subj.name] as number;
            count++;
            totalMarks += scores[subj.name] as number;
            totalMarksCount++;
            totalAssessedStudents.add(learner.id);
          }
        });

        // average for specific subject in this exam set
        subjectAverages[subj.name] = count > 0 ? Math.round((sum / count) * 10) / 10 : null;
      });

      return {
        id: examSet.id,
        label: examSet.period,
        term: examSet.term,
        termLabel: `${examSet.term} (${examSet.period})`,
        overall: totalMarksCount > 0 ? Math.round((totalMarks / totalMarksCount) * 10) / 10 : null,
        studentCount: totalAssessedStudents.size,
        ...subjectAverages
      };
    });
  }, [sortedExamSets, data.learners, data.scores, selectedSection, selectedClass, subjects]);

  // Filter out sets that have no score submissions at all (to keep chart concise and beautiful)
  const activeTrendData = useMemo(() => {
    return trendData.filter(d => d.studentCount > 0);
  }, [trendData]);

  // Generate smart insights based on trend data
  const insights = useMemo(() => {
    if (activeTrendData.length === 0) return null;

    const firstSet = activeTrendData[0];
    const lastSet = activeTrendData[activeTrendData.length - 1];

    // Calculate progress for each subject
    const subjectProgress = subjects.map(subj => {
      const firstVal = firstSet[subj.name];
      const lastVal = lastSet[subj.name];
      if (typeof firstVal === 'number' && typeof lastVal === 'number') {
        return {
          name: subj.name,
          diff: Math.round((lastVal - firstVal) * 10) / 10,
          current: lastVal
        };
      }
      return null;
    }).filter((item): item is { name: string; diff: number; current: number } => item !== null);

    // Most Improved subject
    const mostImproved = subjectProgress.length > 0 
      ? [...subjectProgress].sort((a, b) => b.diff - a.diff)[0] 
      : null;

    // Highest performing subject in the latest exam
    const highestPerforming = subjectProgress.length > 0
      ? [...subjectProgress].sort((a, b) => b.current - a.current)[0]
      : null;

    // Highest peak milestone overall
    const highestMilestone = [...activeTrendData].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0];

    // Longitudinal Overall growth rate
    const overallGrowth = (firstSet.overall !== null && lastSet.overall !== null)
      ? Math.round((lastSet.overall - firstSet.overall) * 10) / 10
      : 0;

    return {
      mostImproved,
      highestPerforming,
      highestMilestone,
      overallGrowth,
      subjectProgress
    };
  }, [activeTrendData, subjects]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6" id="class-wide-trends-dashboard">
      {/* Visual Component Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl mt-0.5">
            <TrendingUp size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-950">Longitudinal Performance Trends</h3>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black rounded uppercase tracking-wider">
                Multi-Term
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 leading-snug">
              Compare average marks across assessment sets chronologically (Term 1 to Term 3)
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-[11px] font-extrabold text-slate-600">
            <button
              onClick={() => setChartView('multi')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'multi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Subject Comparison
            </button>
            <button
              onClick={() => setChartView('overall')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'overall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Overall Growth Trend
            </button>
          </div>
        </div>
      </div>

      {/* Controls Segment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/70 border border-slate-200/50 rounded-2xl">
        {/* 1. Subject Set selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <BookOpen size={11} /> Subject Set (Section)
          </label>
          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200/65">
            {(['preprimary', 'lower', 'upper'] as SectionKey[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all text-center cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sec === 'preprimary' ? 'Nursery' : sec === 'lower' ? 'Lower P.' : 'Upper P.'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Class Filter */}
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
              <option value="all">All Combined ({SECTIONS[selectedSection]?.label})</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter size={12} />
            </div>
          </div>
        </div>

        {/* 3. Subject Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <BarChart3 size={11} /> Focus Subject
          </label>
          <div className="relative">
            <select
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
              disabled={chartView === 'overall'}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all cursor-pointer appearance-none"
            >
              <option value="all">Show All Trends</option>
              {subjects.map(subj => (
                <option key={subj.name} value={subj.name}>{subj.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Region */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3/4 Columns: The Recharts Trend Visualization */}
        <div className="lg:col-span-3 space-y-3">
          {activeTrendData.length === 0 ? (
            <div className="h-[350px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/40 p-8 text-center">
              <BarChart3 size={42} className="text-slate-300 mb-2 animate-bounce" />
              <h4 className="text-xs font-bold text-slate-800">No Assessment Data Found</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                No score records were found for learners in {SECTIONS[selectedSection]?.label} across the term series. Add scores in 'Grades Entry' to populate this trend card.
              </p>
            </div>
          ) : (
            <div className="h-[360px] w-full bg-slate-50/30 p-4 border border-slate-100 rounded-2xl relative">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'overall' ? (
                  <AreaChart
                    data={activeTrendData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorOverallGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="termLabel" 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
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
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      labelStyle={{ fontWeight: 'black', color: '#0f172a', marginBottom: 4 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={35} 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ fontSize: 11, fontWeight: 800 }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="overall" 
                      name="Overall Set Average (%)" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorOverallGrad)" 
                    />
                  </AreaChart>
                ) : (
                  <LineChart
                    data={activeTrendData}
                    margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="termLabel" 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }}
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
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                      labelStyle={{ fontWeight: 'black', color: '#0f172a', marginBottom: 4 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={35} 
                      iconType="circle" 
                      iconSize={6}
                      wrapperStyle={{ fontSize: 10, fontWeight: 700 }} 
                    />
                    
                    {/* Render active lines based on subject filter */}
                    {subjects.map(subj => {
                      const isFocused = activeSubject === 'all' || activeSubject === subj.name;
                      if (!isFocused) return null;
                      
                      return (
                        <Line
                          key={subj.name}
                          type="monotone"
                          dataKey={subj.name}
                          name={subj.name}
                          stroke={getSubjectColor(subj.name)}
                          strokeWidth={activeSubject === subj.name ? 4 : 2}
                          dot={{ r: activeSubject === subj.name ? 5 : 3, strokeWidth: 1 }}
                          activeDot={{ r: 7 }}
                          connectNulls={true}
                        />
                      );
                    })}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-semibold leading-relaxed">
            <Info size={13} className="text-slate-400 shrink-0" />
            <span>
              Calculated dynamically as the average grade marks achieved by the {data.learners.filter(l => sectionKeyOfClass(l.cls) === selectedSection).length} students in this category. Click subjects in the legend above to compare and track specific trends.
            </span>
          </div>
        </div>

        {/* Right 1/4 Column: Smart Academic Insights & Subject Growth Summary */}
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl space-y-3.5">
            <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles size={13} className="text-indigo-600" /> Academic Insights
            </h4>

            {insights ? (
              <div className="space-y-3 text-[11px] font-medium text-slate-700">
                {/* 1. Longitudinal Growth rate */}
                <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Overall Growth</span>
                  <div className="flex items-center gap-1">
                    {insights.overallGrowth >= 0 ? (
                      <span className="font-extrabold text-emerald-600 font-mono">+{insights.overallGrowth}%</span>
                    ) : (
                      <span className="font-extrabold text-rose-600 font-mono">{insights.overallGrowth}%</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold">since T1</span>
                  </div>
                </div>

                {/* 2. Most Improved Subject */}
                {insights.mostImproved && (
                  <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">Most Improved Subject</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900 truncate pr-2">{insights.mostImproved.name}</span>
                      <span className="text-emerald-600 font-mono font-extrabold shrink-0">+{insights.mostImproved.diff}%</span>
                    </div>
                  </div>
                )}

                {/* 3. Highest Performing Subject */}
                {insights.highestPerforming && (
                  <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">Highest Average Subject</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900 truncate pr-2">{insights.highestPerforming.name}</span>
                      <span className="text-blue-600 font-mono font-extrabold shrink-0">{insights.highestPerforming.current}%</span>
                    </div>
                  </div>
                )}

                {/* 4. Best Term Milestone */}
                {insights.highestMilestone && (
                  <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">Peak Academic Set</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-extrabold text-slate-900">{insights.highestMilestone.termLabel}</span>
                      <span className="text-indigo-600 font-mono font-extrabold">{insights.highestMilestone.overall}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Add evaluation marks to receive smart academic trajectory recommendations and progress indexes.
              </p>
            )}
          </div>

          {/* Mini-table with Subject list & Latest Average */}
          <div className="border border-slate-100 bg-slate-50/30 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Subject Averages Overview
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
              {subjects.map(subj => {
                const latestAverage = activeTrendData.length > 0 
                  ? activeTrendData[activeTrendData.length - 1][subj.name] 
                  : null;

                return (
                  <div key={subj.name} className="flex items-center justify-between text-[11px] border-b border-slate-100/50 pb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <div 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: getSubjectColor(subj.name) }} 
                      />
                      <span className="font-bold text-slate-700 truncate">{subj.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {latestAverage !== null && latestAverage !== undefined ? `${latestAverage}%` : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
