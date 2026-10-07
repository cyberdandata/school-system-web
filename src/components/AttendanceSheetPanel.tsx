import React, { useState, useMemo } from 'react';
import { AppData, SecurityData } from '../types';
import { FileSpreadsheet, Users, ShieldCheck, Download, Search } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface AttendanceSheetPanelProps {
  secState: SecurityData;
}

export default function AttendanceSheetPanel({ secState }: AttendanceSheetPanelProps) {
  const data = useAppStore(state => state.data)!;
  const [activeTab, setActiveTab] = useState<'Student' | 'Teacher' | 'Non-Teaching Staff'>('Student');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all people
  const learners = data.learners || data.students || [];
  const teachers = data.settings?.teachersList || data.teachers || [];
  const nonTeaching = data.settings?.nonTeachingStaffList || [
    { id: 'nt-1', name: 'James Ouma', department: 'Security' },
    { id: 'nt-2', name: 'Sarah Namukasa', department: 'Cleaning' },
    { id: 'nt-3', name: 'John Doe', department: 'Transport' },
  ];

  // Compute attendance map: personId -> Set of unique dates
  const attendanceMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    (secState.gateLogs || []).forEach(log => {
      // Only count if they are marked Present or Approved (for Entry)
      if (log.status === 'Present' || log.direction === 'Entry' || log.status === 'Approved') {
        const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
        if (log.personId) {
          if (!map.has(log.personId)) {
            map.set(log.personId, new Set());
          }
          map.get(log.personId)!.add(dateStr);
        }
      }
    });
    return map;
  }, [secState.gateLogs]);

  // Generate rows based on active tab
  const rows = useMemo(() => {
    let list: any[] = [];
    if (activeTab === 'Student') list = learners;
    if (activeTab === 'Teacher') list = teachers;
    if (activeTab === 'Non-Teaching Staff') list = nonTeaching;

    return list
      .filter(person => person.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(person => {
        const uniqueDays = attendanceMap.get(person.id)?.size || 0;
        return {
          id: person.id,
          name: person.name,
          detail: activeTab === 'Student' ? (person.cls || person.grade || 'N/A') : 
                  activeTab === 'Teacher' ? (person.specialization || person.initials || 'Staff') :
                  (person.department || 'N/A'),
          daysAttended: uniqueDays,
          totalDays: 20, // Simplified assumption
          rate: Math.round((uniqueDays / 20) * 100)
        };
      })
      .sort((a, b) => b.daysAttended - a.daysAttended);
  }, [activeTab, searchQuery, learners, teachers, nonTeaching, attendanceMap]);

  const exportCSV = () => {
    let csv = "Name,Role,Days Attended,Total School Days,Attendance Rate\n";
    rows.forEach(r => {
      csv += `${r.name},${r.role},${r.daysAttended},${r.totalDays},${r.rate}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('Student')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Student' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Learners
          </button>
          <button
            onClick={() => setActiveTab('Teacher')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Teacher' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Teaching Staff
          </button>
          <button
            onClick={() => setActiveTab('Non-Teaching Staff')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Non-Teaching Staff' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Non-Teaching Staff
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button onClick={exportCSV} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">
                  {activeTab === 'Student' ? 'Class' : activeTab === 'Teacher' ? 'Specialization' : 'Department'}
                </th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Days Attended (Term)</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No records found.</p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          activeTab === 'Student' ? 'bg-blue-100 text-blue-600' :
                          activeTab === 'Teacher' ? 'bg-purple-100 text-purple-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {activeTab === 'Student' ? <Users size={14} /> : <ShieldCheck size={14} />}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-600">
                      {row.detail}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-block px-3 py-1 bg-slate-50 text-slate-700 rounded-lg font-black text-sm border border-slate-200">
                        {row.daysAttended}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {row.daysAttended > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase">
                          No Data
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
