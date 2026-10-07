import React, { useState } from 'react';
import { SecurityData } from '../types';
import { Search, UserPlus, Clock, Download, MapPin, CheckCircle2 } from 'lucide-react';

interface VisitorLogPanelProps {
  secState: SecurityData;
  onUpdateSecurity: (newSec: SecurityData) => void;
}

export default function VisitorLogPanel({ secState, onUpdateSecurity }: VisitorLogPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const visitors = secState.visitors || [];
  
  const filteredVisitors = visitors.filter(v => 
    v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.hostTeacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.vehicleNumberPlate && v.vehicleNumberPlate.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCheckoutVisitor = (visitorId: string) => {
    const updatedVisitors = visitors.map(v => {
      if (v.id === visitorId && v.status === 'Inside School') {
        const arrivalTime = new Date(v.arrivalTime).getTime();
        const departureTime = new Date().getTime();
        const durationMinutes = Math.round((departureTime - arrivalTime) / 60000);
        
        return {
          ...v,
          status: 'Exited' as const,
          actualDepartureTime: new Date().toISOString(),
          durationMinutes
        };
      }
      return v;
    });
    onUpdateSecurity({ ...secState, visitors: updatedVisitors });
  };

  const getDurationString = (minutes?: number) => {
    if (minutes === undefined) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exportCSV = () => {
    let csv = "Visitor Name,Host & Reason,Vehicle Plate,Time In,Time Out,Duration,Status\n";
    filteredVisitors.forEach(v => {
      csv += `${v.visitorName},${v.hostTeacherName} - ${v.reasonForVisit},${v.vehicleNumberPlate || 'N/A'},${formatTime(v.arrivalTime)},${formatTime(v.actualDepartureTime)},${getDurationString(v.durationMinutes)},${v.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitor_log_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800">Visitor Registry & Logs</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monitor visitor duration and vehicle plates</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, host, or plate..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Visitor Name</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Host & Reason</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Vehicle Plate</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Time In</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Time Out</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No visitors found.</p>
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                          {visitor.photoUrl ? (
                            <img src={visitor.photoUrl} alt={visitor.visitorName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-indigo-600 font-black text-sm">{visitor.visitorName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{visitor.visitorName}</p>
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {visitor.badgeNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">{visitor.hostTeacherName}</p>
                      <p className="text-xs font-medium text-slate-500 truncate max-w-[150px]">{visitor.purpose}</p>
                    </td>
                    <td className="p-4">
                      {visitor.vehicleNumberPlate ? (
                        <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 font-mono text-xs font-bold rounded-lg border border-amber-200 uppercase">
                          {visitor.vehicleNumberPlate}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Walk-in</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {formatTime(visitor.arrivalTime)}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700">
                      {formatTime(visitor.actualDepartureTime)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg border border-slate-200">
                        <Clock size={12} />
                        {visitor.status === 'Inside School' ? (
                          <span className="text-amber-600 animate-pulse">Active</span>
                        ) : (
                          getDurationString(visitor.durationMinutes)
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {visitor.status === 'Inside School' ? (
                        <button
                          onClick={() => handleCheckoutVisitor(visitor.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-black transition-colors"
                        >
                          Check Out
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg">
                          <CheckCircle2 size={14} /> Exited
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
