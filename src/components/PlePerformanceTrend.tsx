import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, ExamSet } from '../types';
import { getGradeRank } from '../lib/defaults';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Info,
  Calendar,
  Layers,
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface PlePerformanceTrendProps {
  }

export default function PlePerformanceTrend({  }: PlePerformanceTrendProps) {
  const data = useAppStore(state => state.data)!;
  const [metric, setMetric] = useState<'aggregate' | 'success_rate'>('aggregate');

  // 1. Get ordered list of all exam sets chronologically (ES1 to ES9)
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

  // 2. Filter Primary 7 active learners
  const p7Learners = useMemo(() => {
    return (data.learners || []).filter(l => l.cls === 'Primary 7' && !l.archived);
  }, [data.learners]);

  // 3. Compute PLE Trend Data across all chronological exam sets
  const trendData = useMemo(() => {
    const sectionKey = 'upper'; // P7 is always in the upper section
    const grading = [...(data.settings.sections[sectionKey]?.grading || [])].sort((a, b) => b.min - a.min);

    return sortedExamSets.map(set => {
      let totalAgg = 0;
      let p7CountWithScores = 0;
      let div1Count = 0;
      let div2Count = 0;
      let div3Count = 0;
      let div4Count = 0;
      let divUCount = 0;

      p7Learners.forEach(learner => {
        const sKey = `${learner.id}|${set.id}`;
        const record = data.scores[sKey];
        if (record) {
          const coreSubjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
          const satCore = coreSubjects.filter(subj => record[subj] !== undefined && typeof record[subj] === 'number');

          if (satCore.length > 0) {
            // Calculate points for each core subject (1 to 9 scale, where D1=1, F9=9)
            const corePoints = coreSubjects.map(subj => {
              const mark = record[subj];
              if (mark === undefined || typeof mark !== 'number') return null;
              const band = grading.find(g => mark >= g.min && mark <= g.max);
              const grade = band?.grade || 'F9';
              return getGradeRank(grade);
            });

            // Estimate missing subjects if any
            const presentPoints = corePoints.filter((p): p is number => p !== null);
            const hasAllCore = presentPoints.length === 4;
            let predictedAggregate = 36;

            if (hasAllCore) {
              predictedAggregate = presentPoints.reduce((sum, p) => sum + p, 0);
            } else if (presentPoints.length > 0) {
              const avgPoints = presentPoints.reduce((sum, p) => sum + p, 0) / presentPoints.length;
              const roundedAvg = Math.round(avgPoints);
              predictedAggregate = corePoints.reduce((sum, p) => {
                return sum + (p === null ? roundedAvg : p);
              }, 0);
            }

            // Determine Predicted Division
            let division = 'Division U';
            const engPoints = corePoints[0] ?? 9;
            const mathPoints = corePoints[1] ?? 9;
            const rules = data.settings.pleOverride || { enabled: false };

            if (rules.enabled) {
              if (predictedAggregate <= 12) {
                if (engPoints > rules.englishMinGradeForDiv1 || mathPoints > rules.mathMinGradeForDiv1) {
                  division = 'Division 2';
                } else {
                  division = 'Division 1';
                }
              } else if (predictedAggregate <= 24) {
                if (engPoints > rules.englishMinGradeForDiv2 || mathPoints > rules.mathMinGradeForDiv2) {
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

            totalAgg += predictedAggregate;
            p7CountWithScores++;

            if (division === 'Division 1') div1Count++;
            else if (division === 'Division 2') div2Count++;
            else if (division === 'Division 3') div3Count++;
            else if (division === 'Division 4') div4Count++;
            else divUCount++;
          }
        }
      });

      return {
        id: set.id,
        term: set.term,
        period: set.period,
        name: `${set.term} (${set.period})`,
        avgAggregate: p7CountWithScores > 0 ? Math.round((totalAgg / p7CountWithScores) * 10) / 10 : null,
        successRate: p7CountWithScores > 0 ? Math.round(((div1Count + div2Count) / p7CountWithScores) * 100) : null,
        studentCount: p7CountWithScores,
        divBreakdown: {
          'Division 1': div1Count,
          'Division 2': div2Count,
          'Division 3': div3Count,
          'Division 4': div4Count,
          'Division U': divUCount
        }
      };
    });
  }, [sortedExamSets, p7Learners, data.scores, data.settings.pleOverride, data.settings.sections]);

  // Filter out any exam sets that do not have recorded scores for P7
  const activeTrendData = useMemo(() => {
    return trendData.filter(d => d.studentCount > 0);
  }, [trendData]);

  // Calculate intelligent insights based on available trend points
  const performanceInsights = useMemo(() => {
    if (activeTrendData.length < 2) return null;

    const first = activeTrendData[0];
    const last = activeTrendData[activeTrendData.length - 1];

    const aggDiff = (first.avgAggregate !== null && last.avgAggregate !== null) 
      ? Math.round((first.avgAggregate - last.avgAggregate) * 10) / 10 
      : 0;

    const successDiff = (first.successRate !== null && last.successRate !== null)
      ? last.successRate - first.successRate
      : 0;

    const isAggImproving = aggDiff > 0; // lower aggregate is better in PLE
    const isSuccessImproving = successDiff > 0;

    return {
      aggDiff: Math.abs(aggDiff),
      successDiff: Math.abs(successDiff),
      isAggImproving,
      isSuccessImproving,
      firstAgg: first.avgAggregate,
      lastAgg: last.avgAggregate,
      firstSuccess: first.successRate,
      lastSuccess: last.successRate,
      firstPeriodName: first.name,
      lastPeriodName: last.name
    };
  }, [activeTrendData]);

  const latestTrendPoint = useMemo(() => {
    if (activeTrendData.length === 0) return null;
    return activeTrendData[activeTrendData.length - 1];
  }, [activeTrendData]);

  if (p7Learners.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <Award size={20} />
          </div>
          <h3 className="text-sm font-black text-slate-950">Primary 7 Performance Trends</h3>
        </div>
        <div className="h-[240px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
          <Layers size={36} className="text-slate-300 mb-2" />
          <h4 className="text-xs font-bold text-slate-800">No P7 Candidates Found</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mt-1">
            Please register some learners in "Primary 7" class to see automatic PLE performance trend analysis.
          </p>
        </div>
      </div>
    );
  }

  if (activeTrendData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950">P7 PLE Class Performance Trend</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Primary Leaving Examination predicted progress</p>
          </div>
        </div>
        <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
          <Activity size={36} className="text-slate-300 mb-2 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-800">No Assessment Data Recorded</h4>
          <p className="text-[11px] text-slate-400 max-w-sm mt-1">
            No PLE candidate mock grades have been recorded yet. Go to the "Enter Scores" panel to input P7 core subject marks (English, Mathematics, Science, Social Studies) to unlock full-fidelity trend analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Award size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950">P7 PLE Class Performance Trend</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Live UNEB Predictions Across Assessment Periods
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle buttons for metric */}
          <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setMetric('aggregate')}
              className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                metric === 'aggregate'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={12} />
              <span>Average Aggregate (Points)</span>
            </button>
            <button
              onClick={() => setMetric('success_rate')}
              className={`px-3 py-1.5 text-[11px] font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                metric === 'success_rate'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle size={12} />
              <span>Division 1 & 2 Success Rate (%)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chart View (LHS) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="h-[280px] w-full bg-slate-50/30 p-2 rounded-2xl border border-slate-100/60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeTrendData}
                margin={{ top: 15, right: 25, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={metric === 'aggregate' ? [4, 36] : [0, 100]}
                  reversed={metric === 'aggregate'} // reversed because 4 is the best and 36 is the worst in UNEB Aggregate
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ 
                    value: metric === 'aggregate' ? '← Lower score is better (4 best, 36 worst) | PLE Aggregate Points' : 'Division 1 & 2 predicted rate (%)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fontSize: 8, fill: '#94a3b8', fontWeight: 800 },
                    offset: 10
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 6px 12px -2px rgb(0 0 0 / 0.05)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  labelStyle={{ fontWeight: 'black', color: '#0f172a', marginBottom: '4px' }}
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
                />
                {metric === 'aggregate' ? (
                  <Line
                    type="monotone"
                    dataKey="avgAggregate"
                    name="Class Average PLE Aggregate"
                    stroke="#2563eb"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Division 1 & 2 Predicted Success Rate (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-start gap-2 text-[10px] text-slate-400 italic px-2 font-medium">
            <Info size={12} className="shrink-0 mt-0.5 text-blue-500" />
            <span>
              {metric === 'aggregate' 
                ? "* The Y-axis is inverted because in Uganda's Primary Leaving Examination (PLE), lower aggregates are superior (aggregate 4-12 constitutes Division 1, 13-24 Division 2)."
                : "* Displays the percentage of candidate students projected to score a Division 1 (Distinction) or Division 2 (Credit) aggregate profile."}
            </span>
          </div>
        </div>

        {/* Breakdown Panel / Stats (RHS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Latest Status summary */}
          {latestTrendPoint && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Latest Profile</span>
                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 uppercase font-mono">
                  {latestTrendPoint.term} · {latestTrendPoint.period}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Avg Aggregate</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {latestTrendPoint.avgAggregate !== null ? `${latestTrendPoint.avgAggregate} pts` : '--'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">D1 &amp; D2 Success</span>
                  <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                    {latestTrendPoint.successRate !== null ? `${latestTrendPoint.successRate}%` : '--'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Latest Division Count</span>
                <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-black">
                  {Object.entries(latestTrendPoint.divBreakdown).map(([div, count]) => {
                    const bgColors: Record<string, string> = {
                      'Division 1': 'bg-blue-50 text-blue-600 border-blue-100',
                      'Division 2': 'bg-emerald-50 text-emerald-600 border-emerald-100',
                      'Division 3': 'bg-amber-50 text-amber-600 border-amber-100',
                      'Division 4': 'bg-orange-50 text-orange-600 border-orange-100',
                      'Division U': 'bg-rose-50 text-rose-600 border-rose-100',
                    };
                    return (
                      <div key={div} className={`p-1 border rounded ${bgColors[div] || 'bg-slate-50'}`} title={div}>
                        <div className="text-[8px] font-bold text-slate-400 truncate uppercase">{div.replace('Division ', 'D')}</div>
                        <div className="text-xs font-black mt-0.5">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Progress / Improvement Insight card */}
          {performanceInsights && (
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-semibold flex items-start gap-3 ${
              (metric === 'aggregate' ? performanceInsights.isAggImproving : performanceInsights.isSuccessImproving)
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                : 'bg-indigo-50/30 border-indigo-100/60 text-indigo-800'
            }`}>
              {metric === 'aggregate' ? (
                performanceInsights.isAggImproving ? (
                  <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                ) : (
                  <TrendingDown className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                )
              ) : (
                performanceInsights.isSuccessImproving ? (
                  <TrendingUp className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                ) : (
                  <TrendingDown className="text-indigo-500 shrink-0 mt-0.5" size={16} />
                )
              )}
              
              <div>
                <b className="font-bold">Trajectory Insight:</b>{' '}
                {metric === 'aggregate' ? (
                  performanceInsights.isAggImproving ? (
                    <span>
                      Primary 7 PLE predictions show an excellent <b className="text-emerald-600">aggregate improvement of {performanceInsights.aggDiff} points</b>, dropping from {performanceInsights.firstAgg} pts in {performanceInsights.firstPeriodName} to {performanceInsights.lastAgg} pts in {performanceInsights.lastPeriodName}.
                    </span>
                  ) : (
                    <span>
                      Primary 7 average aggregate points grew by <b className="text-indigo-600">{performanceInsights.aggDiff} points</b> (from {performanceInsights.firstAgg} to {performanceInsights.lastAgg} pts). Focus on core subject revisions to optimize mock outcomes.
                    </span>
                  )
                ) : (
                  performanceInsights.isSuccessImproving ? (
                    <span>
                      Division 1 &amp; 2 success rate <b className="text-emerald-600">scaled up by {performanceInsights.successDiff}%</b>, reaching {performanceInsights.lastSuccess}% compared to {performanceInsights.firstSuccess}% originally in {performanceInsights.firstPeriodName}.
                    </span>
                  ) : (
                    <span>
                      Success rate remains stable at {performanceInsights.lastSuccess}%. Increase targeted student counselling and focus groups for pupils near the grade boundaries.
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
