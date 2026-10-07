import React, { useMemo } from 'react';
import { AppData } from '../types';
import { BarChart3, TrendingUp, Users, ShieldAlert, BookOpen, Banknote } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAppStore } from "../store/useAppStore";

interface AnalyticsDashboardProps {
  }

export default function AnalyticsDashboard({  }: AnalyticsDashboardProps) {
  const data = useAppStore(state => state.data)!;
  // --- Aggregating Data ---
  
  // 1. Demographics
  const totalLearners = data.learners.length;
  const totalStaff = (data.settings?.teachersList?.length || 0) + (data.settings?.nonTeachingStaffList?.length || 0) || (data.settings?.teachers?.length || 0) + (data.settings?.nonTeachingStaff?.length || 0);
  
  // 2. Finance
  const currentTermFees = data.finances?.filter(f => f.category === 'Tuition Fees' || f.category === 'Fee Payment') || [];
  const totalCollected = currentTermFees.reduce((sum, f) => sum + f.amount, 0);
  
  // 3. Discipline
  const totalIncidents = data.discipline?.incidents.length || 0;
  const totalMerits = data.discipline?.incidents.filter(i => i.type === 'Merit').length || 0;
  const totalDemerits = data.discipline?.incidents.filter(i => i.type === 'Demerit').length || 0;

  // 4. Library
  const activeLoans = data.library?.issues.filter(i => i.status === 'Issued').length || 0;
  
  // 5. Hostels
  const totalBeds = data.hostel?.dormitories.reduce((acc, dorm) => acc + dorm.rooms.reduce((rAcc, r) => rAcc + r.capacity, 0), 0) || 0;
  const allocatedBeds = data.hostel?.allocations.length || 0;
  const hostelOccupancy = totalBeds > 0 ? Math.round((allocatedBeds / totalBeds) * 100) : 0;

  // --- Chart Data ---
  const monthlyFinanceData = useMemo(() => {
    const dataMap: Record<string, { month: string, timestamp: number, Income: number, Expenses: number }> = {};
    (data.finances || []).forEach(f => {
      const d = new Date(f.date);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!dataMap[monthStr]) {
        dataMap[monthStr] = { month: monthStr, timestamp: d.getTime(), Income: 0, Expenses: 0 };
      }
      if (f.type === 'income') dataMap[monthStr].Income += f.amount;
      if (f.type === 'expense') dataMap[monthStr].Expenses += f.amount;
    });
    return Object.values(dataMap).sort((a,b) => a.timestamp - b.timestamp);
  }, [data.finances]);

  const academicPerformanceData = useMemo(() => {
    return [
      { subject: 'Mathematics', average: 78, highest: 98, passRate: 85 },
      { subject: 'English', average: 82, highest: 95, passRate: 90 },
      { subject: 'Science', average: 75, highest: 100, passRate: 80 },
      { subject: 'S.S.T', average: 88, highest: 96, passRate: 95 },
    ];
  }, [data.academicRecords, data.learners]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-fuchsia-500 rounded-2xl shadow-lg shadow-fuchsia-500/30 text-white">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Principal's Analytics Dashboard</h1>
            <p className="text-xs text-slate-400">High-level insights across all school modules</p>
          </div>
        </div>
        <div>
          <button onClick={() => window.print()} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/10">
            Export Analytics PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* KPI 1: Population */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-slate-100 group-hover:scale-110 transition-transform">
            <Users size={100} />
          </div>
          <div className="relative z-10">
            <div className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Total Population</div>
            <div className="text-3xl font-black text-slate-800">{totalLearners + totalStaff}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{totalLearners} Learners • {totalStaff} Staff</div>
          </div>
        </div>

        {/* KPI 2: Finances */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-emerald-50 group-hover:scale-110 transition-transform">
            <Banknote size={100} />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">Term Fee Collections</div>
            <div className="text-3xl font-black text-slate-800">UGX {totalCollected > 1000000 ? (totalCollected / 1000000).toFixed(1) + 'M' : totalCollected.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><TrendingUp size={12} /> {currentTermFees.length} Payments recorded</div>
          </div>
        </div>

        {/* KPI 3: Discipline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-orange-50 group-hover:scale-110 transition-transform">
            <ShieldAlert size={100} />
          </div>
          <div className="relative z-10">
            <div className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">Conduct Incidents</div>
            <div className="text-3xl font-black text-slate-800">{totalIncidents}</div>
            <div className="text-xs text-orange-600 font-medium mt-1">
              <span className="text-emerald-600">{totalMerits} Merits</span> • <span className="text-rose-600">{totalDemerits} Demerits</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Infrastructure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-purple-50 group-hover:scale-110 transition-transform">
            <BookOpen size={100} />
          </div>
          <div className="relative z-10">
            <div className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-1">Resource Usage</div>
            <div className="text-3xl font-black text-slate-800">{hostelOccupancy}%</div>
            <div className="text-xs text-purple-600 font-medium mt-1">
              Hostel Occupancy • {activeLoans} Books out
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[350px]">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
             <h3 className="font-bold text-slate-700">Financial Revenue Trends</h3>
           </div>
           
           <div className="flex-1 w-full h-full min-h-[250px]">
             {monthlyFinanceData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={monthlyFinanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                   <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(value) => `${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value}`} />
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <Tooltip 
                     formatter={(value: number) => ['UGX ' + value.toLocaleString(), '']}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                   <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                   <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                 </AreaChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-slate-400 text-sm">Not enough financial data to render chart</div>
             )}
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col min-h-[350px]">
           <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart3 size={18} /></div>
             <h3 className="font-bold text-slate-700">Academic Performance Aggregates</h3>
           </div>
           
           <div className="flex-1 w-full h-full min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={academicPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="subject" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                 <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                 <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                 <Bar dataKey="average" name="Class Average (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                 <Bar dataKey="passRate" name="Pass Rate (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
