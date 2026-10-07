import React, { useState, useMemo } from 'react';
import { AppData, StaffAttendanceRecord } from '../types';
import { Users, Calendar, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import dataManager from '../lib/db';
import { useAppStore } from "../store/useAppStore";

interface TeacherAttendanceProps {
  }

export default function TeacherAttendance({  }: TeacherAttendanceProps) {
  const data = useAppStore(state => state.data)!;
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Teachers' | 'Non-Teaching'>('All');

  // Combine teachers and non-teaching staff
  const staffMembers = useMemo(() => {
    const teachers = (data.settings.teachersList || []).map(t => ({
      id: t.id,
      name: t.name,
      role: t.specialization || 'Teacher',
      type: 'teacher' as const
    }));
    const nonTeaching = (data.settings.nonTeachingStaffList || []).map(n => ({
      id: n.id,
      name: n.name,
      role: n.role || n.department || 'Staff',
      type: 'non-teaching' as const
    }));
    return [...teachers, ...nonTeaching].sort((a, b) => a.name.localeCompare(b.name));
  }, [data.settings.teachersList, data.settings.nonTeachingStaffList]);

  // Current day records
  const currentRecords = useMemo(() => {
    return (data.staffAttendance || []).filter(r => r.date === selectedDate);
  }, [data.staffAttendance, selectedDate]);

  const filteredStaff = useMemo(() => {
    return staffMembers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' ? true : 
                          (filterType === 'Teachers' ? s.type === 'teacher' : s.type === 'non-teaching');
      return matchesSearch && matchesType;
    });
  }, [staffMembers, searchTerm, filterType]);

  const handleStatusChange = (staffId: string, staffType: 'teacher' | 'non-teaching', status: 'Present' | 'Late' | 'Absent') => {
    const allRecords = [...(data.staffAttendance || [])];
    const existingIndex = allRecords.findIndex(r => r.date === selectedDate && r.staffId === staffId);
    
    if (existingIndex >= 0) {
      allRecords[existingIndex] = {
        ...allRecords[existingIndex],
        status,
        timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      allRecords.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        staffId,
        staffType,
        date: selectedDate,
        status,
        timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    dataManager.updateStaffAttendance(allRecords);
  };

  const getRecordForStaff = (staffId: string) => {
    return currentRecords.find(r => r.staffId === staffId);
  };

  // Stats
  const totalStaff = staffMembers.length;
  const presentCount = currentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = currentRecords.filter(r => r.status === 'Absent').length;
  const lateCount = currentRecords.filter(r => r.status === 'Late').length;
  const unmarkedCount = totalStaff - currentRecords.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Users size={24} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Attendance System</h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md">
            Manage daily attendance records for all teaching and non-teaching staff.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <Calendar className="text-slate-400 mr-2" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-slate-800 font-bold text-sm w-full outline-none"
            />
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Users className="text-slate-500" size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Staff</div>
            <div className="text-2xl font-black text-slate-800">{totalStaff}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle className="text-emerald-600" size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Present</div>
            <div className="text-2xl font-black text-slate-800">{presentCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Clock className="text-amber-600" size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Late</div>
            <div className="text-2xl font-black text-slate-800">{lateCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <XCircle className="text-rose-600" size={24} />
          </div>
          <div>
            <div className="text-sm font-semibold text-rose-600 uppercase tracking-wide">Absent</div>
            <div className="text-2xl font-black text-slate-800">{absentCount}</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search staff by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="All">All Staff Types</option>
              <option value="Teachers">Teachers Only</option>
              <option value="Non-Teaching">Non-Teaching Staff Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-slate-200">Staff Member</th>
                <th className="p-4 font-bold border-b border-slate-200">Role / Type</th>
                <th className="p-4 font-bold border-b border-slate-200">Status</th>
                <th className="p-4 font-bold border-b border-slate-200">Time Recorded</th>
                <th className="p-4 font-bold border-b border-slate-200 w-64 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length > 0 ? (
                filteredStaff.map(staff => {
                  const record = getRecordForStaff(staff.id);
                  const isPresent = record?.status === 'Present';
                  const isLate = record?.status === 'Late';
                  const isAbsent = record?.status === 'Absent';

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{staff.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">{staff.role}</div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                          {staff.type === 'teacher' ? 'Teacher' : 'Non-Teaching'}
                        </div>
                      </td>
                      <td className="p-4">
                        {record ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                            isPresent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            isLate ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPresent && <CheckCircle size={12} />}
                            {isLate && <Clock size={12} />}
                            {isAbsent && <XCircle size={12} />}
                            {record.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Not Marked
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600 font-medium">
                          {record?.timeRecorded || '--:--'}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusChange(staff.id, staff.type, 'Present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isPresent 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleStatusChange(staff.id, staff.type, 'Late')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isLate 
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleStatusChange(staff.id, staff.type, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAbsent 
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={32} className="text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No staff members found.</p>
                      <p className="text-sm mt-1">Adjust your search or filter settings.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
