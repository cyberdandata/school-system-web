import React, { useState } from 'react';
import { AppData, PettyCashRequisition } from '../types';
import dataManager from '../lib/db';
import { FileDown, CheckCircle, XCircle, Clock, Plus, Filter, Search } from 'lucide-react';
import { formatUGX } from '../utils/formatters';
import { useAppStore } from "../store/useAppStore";

interface FinanceRequisitionsTabProps {
  }

export default function FinanceRequisitionsTab({  }: FinanceRequisitionsTabProps) {
  const data = useAppStore(state => state.data)!;
  const requisitions = data.requisitions || [];
  
  const totalPending = requisitions.filter(r => r.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Requisitions</span>
          <div className="text-2xl font-black text-slate-800">{requisitions.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</span>
          <div className="text-2xl font-black text-amber-600">{formatUGX(totalPending)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Approved This Month</span>
          <div className="text-2xl font-black text-emerald-600">{formatUGX(
            requisitions.filter(r => r.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0)
          )}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="space-y-4">
          <FileDown className="mx-auto text-slate-300 w-12 h-12" />
          <h3 className="text-lg font-bold text-slate-800">No Requisitions Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Track departmental spending and petty cash requests digitally. Approvals bridge directly to the ledger.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-700">
            <Plus size={16} /> New Requisition
          </button>
        </div>
      </div>
    </div>
  );
}
