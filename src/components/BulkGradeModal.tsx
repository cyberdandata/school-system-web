import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo } from 'react';
import { AppData, ScoreRecord, Learner } from '../types';
import { ALL_CLASSES, sectionKeyOfClass, UNEB_GRADING_BANDS } from '../lib/defaults';
import { 
  X, 
  Zap, 
  Users, 
  CheckSquare, 
  Square, 
  Search, 
  Calculator, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';

interface BulkGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass: string;
  initialExamSetId: string;
  onApplyBulkGrades: (updatedScoresMap: { [compositeKey: string]: ScoreRecord }, summaryMessage: string) => void;
}

export default function BulkGradeModal({
  isOpen,
  onClose,
  initialClass,
  initialExamSetId,
  onApplyBulkGrades
}: BulkGradeModalProps) {
  const data = useAppStore(state => state.data)!;
  if (!isOpen) return null;

  // Selected parameters
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || ALL_CLASSES[0]);
  
  // Available exam sets for selected class
  const classExamSets = useMemo(() => {
    return data.settings.examSets || [];
  }, [data.settings.examSets]);

  const [selectedExamSetId, setSelectedExamSetId] = useState<string>(() => {
    if (initialExamSetId && classExamSets.some(s => s.id === initialExamSetId)) {
      return initialExamSetId;
    }
    return classExamSets[0]?.id || '';
  });

  // Subjects for selected class
  const sectionKey = sectionKeyOfClass(selectedClass);
  const subjects = useMemo(() => {
    return data.settings.sections[sectionKey]?.subjects || [];
  }, [data.settings.sections, sectionKey]);

  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Scope: 'all' | 'missing_only' | 'selected'
  const [learnerScope, setLearnerScope] = useState<'all' | 'missing_only' | 'selected'>('missing_only');
  const [selectedLearnerIds, setSelectedLearnerIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode: 'fixed_mark' | 'class_average' | 'grade_band'
  const [assignmentMode, setAssignmentMode] = useState<'fixed_mark' | 'class_average' | 'grade_band'>('fixed_mark');
  const [fixedMark, setFixedMark] = useState<number>(75);
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>('D2');

  // Learners in selected class
  const classLearners = useMemo(() => {
    return data.learners.filter(l => l.cls === selectedClass);
  }, [data.learners, selectedClass]);

  // Grading criteria for selected class
  const grading = useMemo(() => {
    if (selectedClass === 'Primary 7' || selectedClass === 'P7' || sectionKey === 'upper') {
      return UNEB_GRADING_BANDS;
    }
    return data.settings.sections[sectionKey]?.grading || UNEB_GRADING_BANDS;
  }, [data.settings.sections, sectionKey, selectedClass]);

  // Calculate real-time class average for each subject
  const classAverages = useMemo(() => {
    if (!selectedExamSetId) return {};
    const averages: { [subj: string]: number } = {};

    subjects.forEach(sub => {
      let sum = 0;
      let count = 0;
      classLearners.forEach(l => {
        const cKey = `${l.id}|${selectedExamSetId}`;
        const score = data.scores[cKey]?.[sub.name];
        if (score !== undefined && score !== null && !isNaN(Number(score))) {
          sum += Number(score);
          count++;
        }
      });
      averages[sub.name] = count > 0 ? Math.round(sum / count) : 65; // Default fallback if 0 entries
    });

    return averages;
  }, [classLearners, selectedExamSetId, subjects, data.scores]);

  // Representative mark for chosen grade band
  const bandMarkMap: { [band: string]: number } = {
    'D1': 88,
    'D2': 78,
    'C3': 68,
    'C4': 61,
    'C5': 56,
    'C6': 51,
    'P7': 46,
    'P8': 41,
    'F9': 30
  };

  // Determine target score for a specific subject
  const getCalculatedTargetMark = (subjName: string): number => {
    if (assignmentMode === 'fixed_mark') {
      return Math.min(100, Math.max(0, Number(fixedMark) || 0));
    }
    if (assignmentMode === 'class_average') {
      return classAverages[subjName] !== undefined ? classAverages[subjName] : 65;
    }
    if (assignmentMode === 'grade_band') {
      const bandObj = grading.find(g => g.grade === selectedGradeBand);
      if (bandObj) {
        return Math.round((bandObj.min + bandObj.max) / 2);
      }
      return bandMarkMap[selectedGradeBand] || 75;
    }
    return 70;
  };

  // Determine grade object for a given numeric mark
  const getGradeForMark = (mark: number) => {
    const matched = grading.find(g => mark >= g.min && mark <= g.max);
    return matched ? matched.grade : 'F9';
  };

  // Learners matching search & scope filters
  const filteredLearners = useMemo(() => {
    return classLearners.filter(l => {
      const matchesSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.admNo && l.admNo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [classLearners, searchQuery]);

  // Target subjects to assign grades to
  const targetSubjects = useMemo(() => {
    if (selectedSubject === 'ALL') {
      return subjects;
    }
    return subjects.filter(s => s.name === selectedSubject);
  }, [subjects, selectedSubject]);

  // Determine if a learner qualifies for bulk assignment based on scope
  const doesLearnerQualify = (learner: Learner) => {
    const cKey = `${learner.id}|${selectedExamSetId}`;
    const learnerScores = data.scores[cKey] || {};

    if (learnerScope === 'all') return true;

    if (learnerScope === 'missing_only') {
      // Qualifies if ANY target subject has a missing/unrecorded mark
      return targetSubjects.some(sub => {
        const val = learnerScores[sub.name];
        return val === undefined || val === null || (val as any) === '';
      });
    }

    if (learnerScope === 'selected') {
      return selectedLearnerIds.includes(learner.id);
    }

    return true;
  };

  // Compute preview list of updates
  const previewList = useMemo(() => {
    if (!selectedExamSetId) return [];

    return classLearners.map(learner => {
      const cKey = `${learner.id}|${selectedExamSetId}`;
      const currentScores = data.scores[cKey] || {};
      const qualifies = doesLearnerQualify(learner);

      const proposedScores: { [subj: string]: number } = {};
      const changesCount = { updated: 0, skipped: 0 };

      targetSubjects.forEach(sub => {
        const existingVal = currentScores[sub.name];
        const hasExisting = existingVal !== undefined && existingVal !== null && (existingVal as any) !== '';

        if (learnerScope === 'missing_only' && hasExisting) {
          // Keep existing
          proposedScores[sub.name] = Number(existingVal);
          changesCount.skipped++;
        } else if (qualifies) {
          proposedScores[sub.name] = getCalculatedTargetMark(sub.name);
          changesCount.updated++;
        } else {
          // Not selected/qualified
          if (hasExisting) {
            proposedScores[sub.name] = Number(existingVal);
          }
          changesCount.skipped++;
        }
      });

      return {
        learner,
        currentScores,
        proposedScores,
        qualifies,
        willBeUpdated: qualifies && changesCount.updated > 0
      };
    });
  }, [classLearners, selectedExamSetId, targetSubjects, learnerScope, selectedLearnerIds, assignmentMode, fixedMark, selectedGradeBand, data.scores]);

  const totalAffectedLearners = useMemo(() => {
    return previewList.filter(p => p.willBeUpdated).length;
  }, [previewList]);

  // Handle select all / deselect all
  const handleToggleSelectAll = () => {
    if (selectedLearnerIds.length === filteredLearners.length) {
      setSelectedLearnerIds([]);
    } else {
      setSelectedLearnerIds(filteredLearners.map(l => l.id));
    }
  };

  const handleToggleSelectLearner = (id: string) => {
    if (selectedLearnerIds.includes(id)) {
      setSelectedLearnerIds(selectedLearnerIds.filter(i => i !== id));
    } else {
      setSelectedLearnerIds([...selectedLearnerIds, id]);
    }
  };

  // Apply Changes Action
  const handleApply = () => {
    if (!selectedExamSetId) {
      alert("Please select a valid Exam Set before committing bulk grades.");
      return;
    }

    if (totalAffectedLearners === 0) {
      alert("No learners qualify or are selected for bulk grade assignment under the current scope.");
      return;
    }

    const updatedScoresMap: { [compositeKey: string]: ScoreRecord } = {};

    previewList.forEach(item => {
      if (item.willBeUpdated) {
        const cKey = `${item.learner.id}|${selectedExamSetId}`;
        const existingRecord = data.scores[cKey] || {};
        
        // Merge proposed scores with existing scores for other subjects
        const mergedRecord: ScoreRecord = { ...existingRecord };
        
        targetSubjects.forEach(sub => {
          const newMark = item.proposedScores[sub.name];
          if (newMark !== undefined) {
            mergedRecord[sub.name] = newMark;
          }
        });

        updatedScoresMap[cKey] = mergedRecord;
      }
    });

    const subjLabel = selectedSubject === 'ALL' ? 'all subjects' : selectedSubject;
    const modeLabel = 
      assignmentMode === 'fixed_mark' ? `${fixedMark} marks` :
      assignmentMode === 'class_average' ? 'Class Average' :
      `Grade ${selectedGradeBand}`;

    const summaryMsg = `Bulk Grade Assignment applied: Updated ${totalAffectedLearners} learners in ${selectedClass} for ${subjLabel} using ${modeLabel}.`;

    onApplyBulkGrades(updatedScoresMap, summaryMsg);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 print:hidden overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-5xl w-full my-auto shadow-2xl flex flex-col overflow-hidden max-h-[92vh] text-slate-900">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 shrink-0 relative flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-inner">
              <Zap size={26} className="text-amber-300 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-black/25 text-blue-100 text-[10px] font-black uppercase rounded-md tracking-wider border border-white/10">
                  Bulk Data Entry Assistant
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Fast Batch Assignment
                </span>
              </div>
              <h3 className="text-xl font-black mt-0.5 text-white tracking-tight">
                Bulk Grade & Mark Assignment Tool
              </h3>
              <p className="text-xs text-blue-100/90 font-medium mt-0.5 max-w-xl">
                Apply fixed marks, class averages, or target UNEB grade bands across multiple learners at once.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            
            {/* 1. Target Class & Exam Set */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Layers size={14} className="text-blue-600" />
                <span>1. Target Class & Exam Set</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ALL_CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Exam Set</label>
                <select
                  value={selectedExamSetId}
                  onChange={e => setSelectedExamSetId(e.target.value)}
                  disabled={classExamSets.length === 0}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                >
                  {classExamSets.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.term} — Set {s.setNo} {s.period} ({s.label})
                    </option>
                  ))}
                  {classExamSets.length === 0 && <option value="">No Exam Sets Found</option>}
                </select>
              </div>
            </div>

            {/* 2. Target Subject */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <SlidersHorizontal size={14} className="text-indigo-600" />
                <span>2. Target Subject</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject Scope</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="ALL">✨ All Subjects in {selectedClass}</option>
                  {subjects.map(s => (
                    <option key={s.name} value={s.name}>{s.name} (Max: {s.max})</option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-medium">
                {selectedSubject === 'ALL' ? (
                  <span>Assigning marks across <strong>{subjects.length} subjects</strong> in this class.</span>
                ) : (
                  <span>Targeting <strong>{selectedSubject}</strong> specifically. Current class average: <strong>{classAverages[selectedSubject] || 'N/A'} marks</strong>.</span>
                )}
              </div>
            </div>

            {/* 3. Learner Scope Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Users size={14} className="text-emerald-600" />
                <span>3. Learner Scope</span>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'missing_only', label: 'Missing / Unrecorded Marks Only', desc: 'Preserves existing student grades' },
                  { id: 'all', label: 'All Students in Class', desc: 'Overwrites existing marks' },
                  { id: 'selected', label: 'Manually Selected Students', desc: 'Choose specific learners below' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    onClick={() => setLearnerScope(opt.id as any)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      learnerScope === opt.id 
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold shadow-2xs' 
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="learnerScope"
                      checked={learnerScope === opt.id}
                      onChange={() => setLearnerScope(opt.id as any)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs block font-bold leading-tight">{opt.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium block leading-tight">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Grade Assignment Strategy Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-amber-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Select Grade Assignment Strategy
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                Calculation Mode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Option 1: Fixed Mark */}
              <div
                onClick={() => setAssignmentMode('fixed_mark')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  assignmentMode === 'fixed_mark'
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Specific Fixed Mark</span>
                  <input
                    type="radio"
                    checked={assignmentMode === 'fixed_mark'}
                    onChange={() => setAssignmentMode('fixed_mark')}
                    className="text-amber-600"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight">
                  Assign an exact numerical mark to all targeted learners.
                </p>

                {assignmentMode === 'fixed_mark' && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={fixedMark}
                        onChange={e => setFixedMark(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-24 px-3 py-1.5 text-center text-sm font-black bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-amber-900">
                        = {getGradeForMark(fixedMark)} Grade
                      </span>
                    </div>

                    {/* Quick Mark Presets */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[100, 85, 75, 65, 50, 0].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFixedMark(val); }}
                          className={`px-2 py-0.5 text-[9.5px] font-black rounded-md border transition-all cursor-pointer ${
                            fixedMark === val 
                              ? 'bg-amber-600 text-white border-amber-600' 
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Class Average */}
              <div
                onClick={() => setAssignmentMode('class_average')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  assignmentMode === 'class_average'
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Class Average Mark</span>
                  <input
                    type="radio"
                    checked={assignmentMode === 'class_average'}
                    onChange={() => setAssignmentMode('class_average')}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight">
                  Automatically apply the current class average score for missing learners.
                </p>

                {assignmentMode === 'class_average' && (
                  <div className="pt-2 text-xs font-black text-blue-900 bg-white/90 p-2.5 rounded-xl border border-blue-200 animate-in fade-in duration-150">
                    {selectedSubject === 'ALL' ? (
                      <span>Calculates average per subject dynamically across class</span>
                    ) : (
                      <span>Calculated Avg for {selectedSubject}: {classAverages[selectedSubject] || 65} marks ({getGradeForMark(classAverages[selectedSubject] || 65)})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Option 3: UNEB Grade Band */}
              <div
                onClick={() => setAssignmentMode('grade_band')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                  assignmentMode === 'grade_band'
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Target Grade Band</span>
                  <input
                    type="radio"
                    checked={assignmentMode === 'grade_band'}
                    onChange={() => setAssignmentMode('grade_band')}
                    className="text-indigo-600"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 font-medium leading-tight">
                  Assign marks based on a specific UNEB Grade Band (e.g., D1, D2, C3).
                </p>

                {assignmentMode === 'grade_band' && (
                  <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                    <select
                      value={selectedGradeBand}
                      onChange={e => setSelectedGradeBand(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-xl text-xs font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                    >
                      {grading.map(g => (
                        <option key={g.grade} value={g.grade}>
                          {g.grade} ({g.label} — {g.min}-{g.max} marks)
                        </option>
                      ))}
                    </select>

                    <div className="text-[10px] font-bold text-indigo-800 bg-white p-2 rounded-lg border border-indigo-100">
                      Representative Mark: <strong>{getCalculatedTargetMark(selectedSubject === 'ALL' ? subjects[0]?.name || '' : selectedSubject)} marks</strong>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Live Preview Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            
            {/* Table Action Bar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Learners Impact Preview ({classLearners.length} Total in {selectedClass})
                </h4>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                  {totalAffectedLearners} Will Be Updated
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 w-44"
                  />
                </div>

                {learnerScope === 'selected' && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    {selectedLearnerIds.length === filteredLearners.length ? <CheckSquare size={13} /> : <Square size={13} />}
                    <span>{selectedLearnerIds.length === filteredLearners.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table Content */}
            <div className="max-h-[280px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider sticky top-0 bg-white z-10">
                    {learnerScope === 'selected' && (
                      <th className="p-3 w-10 text-center">#</th>
                    )}
                    <th className="p-3">Student Name &amp; Adm No</th>
                    <th className="p-3">Current Score</th>
                    <th className="p-3">Proposed New Score &amp; Grade</th>
                    <th className="p-3 text-right">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic font-medium">
                        No learners found in {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    previewList
                      .filter(item => {
                        if (!searchQuery) return true;
                        return item.learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.learner.admNo && item.learner.admNo.toLowerCase().includes(searchQuery.toLowerCase()));
                      })
                      .map(item => {
                        const targetSubjName = selectedSubject === 'ALL' ? 'All Subjects' : selectedSubject;
                        const currentVal = selectedSubject === 'ALL' 
                          ? 'Multi' 
                          : item.currentScores[selectedSubject];
                        
                        const proposedVal = selectedSubject === 'ALL'
                          ? 'Multi'
                          : item.proposedScores[selectedSubject];

                        const proposedGrade = typeof proposedVal === 'number' ? getGradeForMark(proposedVal) : 'N/A';

                        return (
                          <tr 
                            key={item.learner.id}
                            className={`transition-colors hover:bg-slate-50/80 ${
                              item.willBeUpdated ? 'bg-emerald-50/20' : 'opacity-70'
                            }`}
                          >
                            {learnerScope === 'selected' && (
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedLearnerIds.includes(item.learner.id)}
                                  onChange={() => handleToggleSelectLearner(item.learner.id)}
                                  className="text-emerald-600 focus:ring-emerald-500 rounded"
                                />
                              </td>
                            )}

                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{item.learner.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">{item.learner.admNo || 'No Adm No'}</span>
                            </td>

                            <td className="p-3 font-mono font-medium">
                              {currentVal !== undefined && currentVal !== null && currentVal !== '' ? (
                                <span className="text-slate-700 font-bold">{currentVal}</span>
                              ) : (
                                <span className="text-amber-600 font-bold italic bg-amber-50 px-2 py-0.5 rounded text-[10px]">Missing</span>
                              )}
                            </td>

                            <td className="p-3">
                              {item.willBeUpdated ? (
                                <div className="flex items-center gap-2 font-mono">
                                  <span className="font-extrabold text-emerald-900 text-sm">{proposedVal}</span>
                                  {proposedGrade !== 'N/A' && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px]">
                                      Grade {proposedGrade}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px] font-medium">Unchanged</span>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              {item.willBeUpdated ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-lg">
                                  <Check size={12} /> Will Update
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-lg">
                                  Skipped
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-100 border-t border-slate-200/90 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span>
              <strong>{totalAffectedLearners} learners</strong> in {selectedClass} will receive updated marks for {selectedSubject === 'ALL' ? 'all subjects' : selectedSubject}.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={totalAffectedLearners === 0 || !selectedExamSetId}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Zap size={14} className="fill-white" />
              <span>Apply Bulk Grades ({totalAffectedLearners})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
