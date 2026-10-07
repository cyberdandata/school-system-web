import React, { useMemo } from 'react';
import { AppData, TimetableData } from '../types';
import { Users, BookOpen, Clock, Calendar } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface TeacherWorkloadPanelProps {
  timetableState: TimetableData;
}

export default function TeacherWorkloadPanel({ timetableState }: TeacherWorkloadPanelProps) {
  const data = useAppStore(state => state.data)!;
  const workloadSummary = useMemo(() => {
    // Collect teachers from settings and HR
    const teachersList = data.settings?.teachersList || [];
    const teacherMap = new Map<string, string>();
    teachersList.forEach(t => teacherMap.set(t.id, t.name));
    
    // Some timetables might just have text for the teacher instead of IDs, handle both.
    const workload = new Map<string, { name: string, totalPeriods: number, classes: Set<string> }>();
    
    // Initialize with known teachers
    teachersList.forEach(t => {
      workload.set(t.name, { name: t.name, totalPeriods: 0, classes: new Set() });
    });

    timetableState.slots.forEach(slot => {
      if (!slot.teacherId) return;
      
      const teacherName = (teacherMap.get(slot.teacherId) || slot.teacherId) as string;
      if (!workload.has(teacherName)) {
        workload.set(teacherName, { name: teacherName, totalPeriods: 0, classes: new Set() });
      }
      
      const record = workload.get(teacherName)!;
      record.totalPeriods += 1;
      record.classes.add(slot.classId);
    });

    return Array.from(workload.values()).sort((a, b) => b.totalPeriods - a.totalPeriods);
  }, [data.hr, timetableState.slots]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users size={20} className="text-indigo-600" />
          Teacher Workload Summary
        </h2>
        <p className="text-xs text-slate-500">Overview of assigned periods per week and estimated per month.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
              <th className="px-6 py-3">Teacher Name</th>
              <th className="px-6 py-3">Assigned Classes</th>
              <th className="px-6 py-3 text-center">Periods / Week</th>
              <th className="px-6 py-3 text-center">Est. Periods / Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workloadSummary.map((wl, idx) => (
              <tr key={idx} className="hover:bg-indigo-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{wl.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {Array.from(wl.classes).map(c => (
                      <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">
                        {c}
                      </span>
                    ))}
                    {wl.classes.size === 0 && <span className="text-slate-400 italic text-xs">No classes</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                    {wl.totalPeriods}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center min-w-[32px] h-[32px] rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                    {wl.totalPeriods * 4}
                  </span>
                </td>
              </tr>
            ))}
            {workloadSummary.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                  No teacher workload data available. Please assign teachers to slots in the timetable.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
