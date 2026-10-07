import React from 'react';
import { AppData, AuditLog } from '../types';
import DataTable, { ColumnDef } from './ui/DataTable';
import { ShieldAlert, Activity, User, Clock, FileText, Database } from 'lucide-react';
import { useAppStore } from "../store/useAppStore";


interface AuditLogViewerProps {
  }

export default function AuditLogViewer({  }: AuditLogViewerProps) {
  const data = useAppStore(state => state.data)!;
  const logs = data.auditLogs || [];

  const columns: ColumnDef<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: row => new Date(row.timestamp).getTime(),
      render: row => (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Clock size={12} />
          {new Date(row.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </div>
      )
    },
    {
      key: 'user',
      header: 'User',
      accessor: row => row.userName,
      render: row => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{row.userName}</p>
            <p className="text-xs text-slate-500">{row.userId}</p>
          </div>
        </div>
      )
    },
    {
      key: 'module',
      header: 'Module',
      accessor: row => row.module,
      render: row => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
          {row.module}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action',
      accessor: row => row.action,
      render: row => {
        let color = 'bg-blue-100 text-blue-700 border-blue-200';
        if (row.action === 'CREATE') color = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (row.action === 'DELETE') color = 'bg-rose-100 text-rose-700 border-rose-200';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${color}`}>
            {row.action}
          </span>
        );
      }
    },
    {
      key: 'details',
      header: 'Details',
      accessor: row => row.details,
      render: row => (
        <div className="max-w-md">
          <p className="text-sm font-medium text-slate-800">{row.details}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5" title={row.recordId}>ID: {row.recordId}</p>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20">
              <ShieldAlert size={28} strokeWidth={2.5} />
            </div>
            Security & Audit Logs
          </h1>
          <p className="text-slate-500 mt-2 font-medium max-w-2xl">
            Immutable system audit trail tracking all critical actions across the platform for financial and data security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Logs</p>
            <p className="text-2xl font-black text-slate-900">{logs.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Creations</p>
            <p className="text-2xl font-black text-slate-900">{logs.filter(l => l.action === 'CREATE').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Updates</p>
            <p className="text-2xl font-black text-slate-900">{logs.filter(l => l.action === 'UPDATE').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Deletions</p>
            <p className="text-2xl font-black text-slate-900">{logs.filter(l => l.action === 'DELETE').length}</p>
          </div>
        </div>
      </div>

      <DataTable 
        data={logs} 
        columns={columns} 
        defaultPageSize={20}
        exportFilename="audit-logs-export.csv"
        searchPlaceholder="Search audit logs..."
      />
    </div>
  );
}
