import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData } from '../types';
import { sectionKeyOfClass, UNEB_GRADING_BANDS, ALL_CLASSES } from '../lib/defaults';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend
} from 'recharts';
import {
  Sparkles,
  Target,
  Award,
  AlertTriangle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  BarChart2,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb
} from 'lucide-react';

interface AcademicSummaryRadarProps {
  }

export default function AcademicSummaryRadar({  }: AcademicSummaryRadarProps) {
  const data = useAppStore(state => state.data)!;
  // Class selection (ALL or specific class e.g. P7)
  const [selectedClass, setSelectedClass] = useState<string>('P7');

  // Exam set selection (ALL or specific exam set ID)
  const currentTerm = data.settings.term || 'Term 3';
  const termExamSets = useMemo(() => {
    return (data.settings.examSets || []).filter(s => s.term === currentTerm);
  }, [data.settings.examSets, currentTerm]);

  const [selectedSetId, setSelectedSetId] = useState<string>('ALL');

  // Target benchmark target mark (default 70%)
  const [benchmarkTarget, setBenchmarkTarget] = useState<number>(70);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  // Active learners matching selected class filter
  const activeLearners = useMemo(() => {
    const all = (data.learners || []).filter(l => !l.archived);
    if (selectedClass === 'ALL') return all;
    return all.filter(l => l.cls === selectedClass);
  }, [data.learners, selectedClass]);

  // Determine subject list for selected class
  const classSubjects = useMemo(() => {
    if (selectedClass !== 'ALL') {
      const sKey = sectionKeyOfClass(selectedClass);
      return data.settings.sections[sKey]?.subjects || [];
    }
    // Aggregate unique subjects across upper primary or all sections
    const set = new Set<string>();
    Object.values(data.settings.sections).forEach(sec => {
      sec.subjects.forEach(sub => set.add(sub.name));
    });
    return Array.from(set).map(name => ({ name, code: name.substring(0, 4).toUpperCase(), max: 100 }));
  }, [data.settings.sections, selectedClass]);

  // Calculate radar chart data & performance stats per subject
  const subjectAnalytics = useMemo(() => {
    if (activeLearners.length === 0 || classSubjects.length === 0) return [];

    // Filter score records
    const targetSetIds = selectedSetId === 'ALL'
      ? (termExamSets.length > 0 ? termExamSets.map(s => s.id) : (data.settings.examSets || []).map(s => s.id))
      : [selectedSetId];

    return classSubjects.map(subj => {
      let sum = 0;
      let count = 0;
      let passCount = 0;
      let maxScore = 0;
      let minScore = 100;

      activeLearners.forEach(learner => {
        targetSetIds.forEach(setId => {
          const cKey = `${learner.id}|${setId}`;
          const scoreRecord = data.scores[cKey];
          if (scoreRecord && scoreRecord[subj.name] !== undefined && scoreRecord[subj.name] !== null) {
            const raw = Number(scoreRecord[subj.name]);
            if (!isNaN(raw)) {
              sum += raw;
              count++;
              if (raw >= 50) passCount++;
              if (raw > maxScore) maxScore = raw;
              if (raw < minScore) minScore = raw;
            }
          }
        });
      });

      const average = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      const passRate = count > 0 ? Math.round((passCount / count) * 100) : 0;
      if (minScore === 100 && count === 0) minScore = 0;

      // Grade lookup for average
      const grading = UNEB_GRADING_BANDS;
      const gradeObj = grading.find(g => average >= g.min && average <= g.max) || { grade: 'F9', remark: 'Fail' };

      return {
        subject: subj.name,
        shortCode: subj.name.length > 12 ? `${subj.name.substring(0, 10)}..` : subj.name,
        average,
        passRate,
        maxScore,
        minScore,
        totalEntries: count,
        grade: gradeObj.grade,
        remark: gradeObj.remark,
        benchmark: benchmarkTarget,
        fullMark: 100
      };
    });
  }, [activeLearners, classSubjects, selectedSetId, termExamSets, data.scores, data.settings.examSets, benchmarkTarget]);

  // Diagnostic Insights (Strengths vs Weaknesses)
  const curriculumDiagnosis = useMemo(() => {
    if (subjectAnalytics.length === 0) {
      return {
        strengths: [],
        weaknesses: [],
        overallAvg: 0,
        parityIndex: 'N/A',
        leadSubject: null,
        lagSubject: null
      };
    }

    const sortedByAvg = [...subjectAnalytics].sort((a, b) => b.average - a.average);

    const totalSum = subjectAnalytics.reduce((acc, s) => acc + s.average, 0);
    const overallAvg = Math.round((totalSum / subjectAnalytics.length) * 10) / 10;

    // Strengths: averages >= 65% or top 2 subjects
    const strengths = sortedByAvg.filter(s => s.average >= 65);
    const topStrengths = strengths.length > 0 ? strengths : sortedByAvg.slice(0, 2);

    // Weaknesses: averages < 60% or bottom subjects
    const weaknesses = sortedByAvg.filter(s => s.average < 60);
    const priorityWeaknesses = weaknesses.length > 0 ? weaknesses : sortedByAvg.slice(-2).reverse();

    // Standard deviation / Parity index
    const variance = subjectAnalytics.reduce((acc, s) => acc + Math.pow(s.average - overallAvg, 2), 0) / subjectAnalytics.length;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
    
    let parityLabel = 'Balanced Mastery';
    if (stdDev > 12) parityLabel = 'High Disparity (Needs Core Alignment)';
    else if (stdDev > 7) parityLabel = 'Moderate Variance';

    return {
      strengths: topStrengths,
      weaknesses: priorityWeaknesses,
      overallAvg,
      parityIndex: `${parityLabel} (±${stdDev} pts)`,
      leadSubject: sortedByAvg[0] || null,
      lagSubject: sortedByAvg[sortedByAvg.length - 1] || null
    };
  }, [subjectAnalytics]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Widget Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-md shadow-indigo-500/10">
            <Sparkles size={22} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-950 tracking-tight">
                Academic Summary &amp; Curriculum Diagnostic
              </h3>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full tracking-wider border border-indigo-100">
                Radar Matrix
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Multi-dimensional subject performance analysis highlighting curriculum strengths and intervention priorities.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Layers size={13} className="text-indigo-600" />
            <span className="text-[10px] uppercase text-slate-400">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">✨ All Primary Classes</option>
              {ALL_CLASSES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Exam Set Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Filter size={13} className="text-blue-600" />
            <span className="text-[10px] uppercase text-slate-400">Assessment:</span>
            <select
              value={selectedSetId}
              onChange={e => setSelectedSetId(e.target.value)}
              className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">All Sets in {currentTerm}</option>
              {termExamSets.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Benchmark Toggle */}
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 cursor-pointer ${
              showBenchmark
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Target Benchmark Overlay on Radar Chart"
          >
            <Target size={13} className={showBenchmark ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Target Benchmark ({benchmarkTarget}%)</span>
          </button>

        </div>
      </div>

      {/* Main Grid: Left Radar Chart / Right Curriculum Diagnostic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left: Recharts Radar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-3 relative">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Subject Mastery Profile ({selectedClass === 'ALL' ? 'School-Wide' : selectedClass})
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {activeLearners.length} Learners Evaluated
            </span>
          </div>

          {/* Recharts Radar Chart */}
          {subjectAnalytics.length > 0 ? (
            <div className="h-[340px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="78%"
                  data={subjectAnalytics}
                >
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="shortCode"
                    tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 800 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }}
                  />
                  
                  {/* Actual Class Subject Average */}
                  <Radar
                    name="Class Average (%)"
                    dataKey="average"
                    stroke="#4f46e5"
                    fill="#6366f1"
                    fillOpacity={0.45}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3730a3', strokeWidth: 1 }}
                  />

                  {/* Target Benchmark Overlay */}
                  {showBenchmark && (
                    <Radar
                      name={`Target (${benchmarkTarget}%)`}
                      dataKey="benchmark"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataItem = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                              <span className="font-black text-amber-300 text-sm">{dataItem.subject}</span>
                              <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded font-extrabold text-[10px]">
                                {dataItem.grade}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Class Avg Score:</span>
                              <span className="font-black text-white">{dataItem.average}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Pass Rate (D1-C6):</span>
                              <span className="font-bold text-emerald-400">{dataItem.passRate}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-400">Highest Score:</span>
                              <span className="font-bold text-blue-300">{dataItem.maxScore} marks</span>
                            </div>
                            <div className="pt-1 text-[10px] text-slate-400 italic">
                              Evaluation remark: {dataItem.remark}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: '10px' }}
                    iconType="circle"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white p-6 text-center">
              <BookOpen size={32} className="text-slate-300 mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Assessment Data Available</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Record student marks in the 'Grades &amp; Comments' module to populate this radar matrix.
              </p>
            </div>
          )}

          {/* Benchmark Slider Tool */}
          {showBenchmark && (
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Sliders size={13} className="text-emerald-600" />
                <span>Adjust Target Benchmark:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={benchmarkTarget}
                  onChange={e => setBenchmarkTarget(Number(e.target.value))}
                  className="w-28 accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                  {benchmarkTarget}%
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right: Curriculum Diagnostic Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                Overall Class Average
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-indigo-950">{curriculumDiagnosis.overallAvg}%</span>
                <span className="text-[11px] font-bold text-indigo-600">Mean Score</span>
              </div>
              <p className="text-[10px] text-indigo-700/80 mt-1 font-medium">
                {curriculumDiagnosis.parityIndex}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">
                Lead Subject
              </span>
              <div className="mt-1">
                <span className="text-sm font-black text-emerald-950 truncate block">
                  {curriculumDiagnosis.leadSubject?.subject || 'N/A'}
                </span>
                <span className="text-xs font-mono font-extrabold text-emerald-700">
                  {curriculumDiagnosis.leadSubject ? `${curriculumDiagnosis.leadSubject.average}% Avg` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Curriculum Strengths 🏆 */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs uppercase tracking-wider">
                <Award size={15} className="text-emerald-600" />
                <span>Curriculum Strengths</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                High Performance
              </span>
            </div>

            <div className="space-y-2">
              {curriculumDiagnosis.strengths.length > 0 ? (
                curriculumDiagnosis.strengths.slice(0, 3).map(item => (
                  <div key={item.subject} className="bg-white p-2.5 rounded-xl border border-emerald-100/90 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{item.subject}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Pass Rate: <strong>{item.passRate}%</strong> · Max: {item.maxScore} marks
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-black text-xs rounded-lg inline-flex items-center gap-1">
                        <ArrowUpRight size={12} /> {item.average}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No subject currently meets the 65%+ strength benchmark.</p>
              )}
            </div>
          </div>

          {/* Areas Needing Support ⚠️ */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs uppercase tracking-wider">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>Priority Focus / Weaknesses</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                Remedial Needed
              </span>
            </div>

            <div className="space-y-2">
              {curriculumDiagnosis.weaknesses.length > 0 ? (
                curriculumDiagnosis.weaknesses.slice(0, 3).map(item => (
                  <div key={item.subject} className="bg-white p-2.5 rounded-xl border border-amber-100/90 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 block">{item.subject}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Pass Rate: <strong>{item.passRate}%</strong> · Grade: {item.grade}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-mono font-black text-xs rounded-lg inline-flex items-center gap-1">
                        <ArrowDownRight size={12} /> {item.average}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-700 font-bold">All subjects currently meet passing performance levels!</p>
              )}
            </div>
          </div>

          {/* Actionable Recommendation Box */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-800">
            <div className="flex items-center gap-1.5 font-black text-amber-300 uppercase tracking-wider text-[11px]">
              <Lightbulb size={14} className="text-amber-400" />
              <span>Instructional Recommendation</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {curriculumDiagnosis.weaknesses.length > 0 ? (
                <span>
                  Prioritize weekly topical quizzes and double revision periods for <strong>{curriculumDiagnosis.weaknesses[0]?.subject}</strong> to raise overall candidate aggregate scores.
                </span>
              ) : (
                <span>
                  Maintain high-performance momentum with speed tests and past paper mock questions across all subjects.
                </span>
              )}
            </p>
          </div>

        </div>

      </div>

      {/* Bottom Subject Cards Grid */}
      {subjectAnalytics.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Detailed Subject Breakdown ({subjectAnalytics.length} Subjects)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Hover radar chart points or review breakdown below
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subjectAnalytics.map(subj => (
              <div 
                key={subj.subject}
                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 p-3 rounded-2xl transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 truncate">{subj.subject}</span>
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 font-extrabold text-[9px] rounded">
                    {subj.grade}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-lg font-black text-indigo-900 font-mono">{subj.average}%</span>
                  <span className="text-[10px] text-slate-500 font-bold">Max: {subj.maxScore}</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      subj.average >= 70 ? 'bg-emerald-500' : subj.average >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, subj.average)}%` }}
                  />
                </div>

                <div className="text-[9.5px] text-slate-400 font-semibold flex justify-between pt-0.5">
                  <span>Pass: {subj.passRate}%</span>
                  <span>{subj.totalEntries} entries</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
