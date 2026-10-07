import React, { useState } from 'react';
import { AppData } from '../types';
import { Briefcase, CalendarClock, ShieldCheck, Archive, BookOpen, Clock } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";

interface Staff360Props {
  }

export default function Staff360({  }: Staff360Props) {
  const data = useAppStore(state => state.data)!;
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const allStaff = [
    ...(data.settings?.teachersList || []),
    ...(data.settings?.nonTeachingStaffList || [])
  ];

  const staff = allStaff.find(s => s.id === selectedStaffId);
  const isTeacher = data.settings?.teachersList?.some(t => t.id === selectedStaffId);

  // Aggregate Data Collections
  const staffTimetable = data.timetable?.slots.filter(s => s.teacherId === selectedStaffId) || [];
  
  // Gate Attendance (Mock logic to find their latest logs from security)
  const staffGateLogs = data.security?.gateLogs.filter(l => l.personName.includes(staff?.name || '')) || [];
  
  // Inventory Assigned
  const staffAssets = data.inventory?.assets.filter(a => a.assignedTo === selectedStaffId) || [];
  
  // Library Books
  const staffLibraryIssues = data.library?.issues.filter(i => i.borrowerType === 'Teacher' && i.borrowerId === selectedStaffId && i.status === 'Issued') || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/30 text-white">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Staff 360° Profile</h1>
            <p className="text-xs text-slate-400">Comprehensive view for teachers and non-teaching staff</p>
          </div>
        </div>
        <div className="flex-1 lg:max-w-md">
          <select
            className="w-full bg-slate-800 border-slate-700 text-white rounded-xl p-3 focus:ring-sky-500 font-semibold"
            value={selectedStaffId}
            onChange={e => setSelectedStaffId(e.target.value)}
          >
            <option value="">-- Search for a Staff Member --</option>
            <optgroup label="Teachers">
              {data.settings?.teachersList?.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Teacher)</option>
              ))}
            </optgroup>
            <optgroup label="Non-Teaching Staff">
              {data.settings?.nonTeachingStaffList?.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Staff)</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {!staff ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Staff Selected</h2>
          <p>Please select a staff member from the dropdown above to view their profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Core Profile & Logistics */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Briefcase size={100} />
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xl border-2 border-sky-200">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{staff.name}</h2>
                  <p className="text-sky-600 font-bold text-sm">{isTeacher ? 'Teaching Staff' : 'Non-Teaching Staff'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm relative z-10">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
            </div>

            {/* Attendance (Gate Logs) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-500" /> Recent Gate Logs
              </h3>
              
              <div className="space-y-3">
                {staffGateLogs.length === 0 ? (
                  <div className="text-sm text-slate-500 italic">No recent gate activity.</div>
                ) : (
                  staffGateLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2">
                        {log.direction === 'Entry' ? (
                          <div className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">IN</div>
                        ) : (
                          <div className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">OUT</div>
                        )}
                        <span className="font-semibold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Academics (If Teacher) */}
          <div className="space-y-6 lg:col-span-2">
            {isTeacher && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <CalendarClock size={18} className="text-emerald-500" /> Timetable Overview
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                    const daySlots = staffTimetable.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    return (
                      <div key={day} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">{day.substring(0, 3)}</div>
                        <div className="space-y-1">
                          {daySlots.length === 0 ? (
                            <div className="text-[10px] text-slate-400 text-center italic">Free</div>
                          ) : (
                            daySlots.map(slot => (
                              <div key={slot.id} className="bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] p-1.5 rounded text-center">
                                <div className="font-bold">{slot.classId}</div>
                                <div>{slot.subjectId}</div>
                                <div className="text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5"><Clock size={8} /> {slot.startTime}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets & Inventory */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <Archive size={18} className="text-fuchsia-500" /> Assigned Assets
                </h3>
                <div className="space-y-2">
                  {staffAssets.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No assets assigned.</div>
                  ) : (
                    staffAssets.map(asset => (
                      <div key={asset.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <div>
                          <div className="font-semibold text-slate-700">{asset.name}</div>
                          <div className="text-[10px] text-slate-500">{asset.category}</div>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          asset.condition === 'New' || asset.condition === 'Good' ? 'bg-emerald-100 text-emerald-700' :
                          asset.condition === 'Fair' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {asset.condition}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Library Borrowing */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" /> Active Book Loans
                </h3>
                <div className="space-y-3">
                  {staffLibraryIssues.length === 0 ? (
                    <div className="text-sm text-slate-500 italic">No active book loans.</div>
                  ) : (
                    staffLibraryIssues.map(issue => {
                      const book = data.library?.books.find(b => b.id === issue.bookId);
                      const isOverdue = new Date(issue.dueDate) < new Date();
                      return (
                        <div key={issue.id} className="p-2 rounded-lg border border-slate-100 bg-slate-50 text-sm flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-700 text-xs">{book ? book.title : 'Unknown Book'}</div>
                            <div className="text-[10px] text-slate-500">Issued: {new Date(issue.issueDate).toLocaleDateString()}</div>
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-1 rounded ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
