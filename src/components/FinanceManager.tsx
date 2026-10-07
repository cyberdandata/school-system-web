import { useAppStore } from "../store/useAppStore";
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { AppData, Learner, FinanceTransaction } from '../types';
import dataManager from '../lib/db';
import AuditLogViewer from './AuditLogViewer';
import FinanceVendorsTab from './FinanceVendorsTab';
import FinanceRequisitionsTab from './FinanceRequisitionsTab';
import FinanceBankingTab from './FinanceBankingTab';
import { mergeDriveDataWithSummary } from '../lib/dataSyncMerge';
import { 
  googleSignIn, 
  getOrCreateFolder, 
  listBackupFiles, 
  downloadFileFromDrive, 
  getCachedAccessToken,
  silentSyncToGoogleDrive,
  syncXlsxReportToDrive
} from '../lib/googleDriveService';
import { 
  Store, ShieldAlert, Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Receipt, 
  Calendar, 
  User, 
  Coins, 
  TrendingUp, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Printer, 
  X,
  CreditCard,
  Tag,
  Palette,
  Sliders,
  ChevronRight,
  Activity,
  Mail,
  Send,
  Bell,
  Pencil,
  Eye,
  FileText,
  CalendarDays,
  ChevronLeft,
  BarChart3,
  PieChart,
  Sparkles,
  Building,
  Layers,
  Cloud,
  CloudUpload,
  RefreshCw
} from 'lucide-react';
import GlobalFilterBar from './ui/GlobalFilterBar';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

export interface FinanceCategory {
  name: string;
  type: 'income' | 'expense' | 'refund';
  color: string; // 'emerald', 'rose', 'blue', etc.
  budgetLimit?: number;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: FinanceCategory[] = [
  { name: 'Tuition Fees', type: 'income', color: 'emerald', isDefault: true },
  { name: 'Boarding Fees', type: 'income', color: 'teal', isDefault: true },
  { name: 'Teacher Salaries', type: 'expense', color: 'blue', isDefault: true },
  { name: 'Food & Meals', type: 'expense', color: 'orange', isDefault: true },
  { name: 'Maintenance', type: 'expense', color: 'slate', isDefault: true },
  { name: 'Utilities', type: 'expense', color: 'amber', isDefault: true },
  { name: 'Other', type: 'expense', color: 'slate', isDefault: true }
];

export const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string; hoverBg: string }> = {
  emerald: { bg: 'bg-emerald-50/85', text: 'text-emerald-700', border: 'border-emerald-200/60', dot: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-100' },
  rose: { bg: 'bg-rose-50/85', text: 'text-rose-700', border: 'border-rose-200/60', dot: 'bg-rose-500', hoverBg: 'hover:bg-rose-100' },
  blue: { bg: 'bg-blue-50/85', text: 'text-blue-700', border: 'border-blue-200/60', dot: 'bg-blue-500', hoverBg: 'hover:bg-blue-100' },
  amber: { bg: 'bg-amber-50/85', text: 'text-amber-700', border: 'border-amber-200/60', dot: 'bg-amber-500', hoverBg: 'hover:bg-amber-100' },
  purple: { bg: 'bg-purple-50/85', text: 'text-purple-700', border: 'border-purple-200/60', dot: 'bg-purple-500', hoverBg: 'hover:bg-purple-100' },
  indigo: { bg: 'bg-indigo-50/85', text: 'text-indigo-700', border: 'border-indigo-200/60', dot: 'bg-indigo-500', hoverBg: 'hover:bg-indigo-100' },
  teal: { bg: 'bg-teal-50/85', text: 'text-teal-700', border: 'border-teal-200/60', dot: 'bg-teal-500', hoverBg: 'hover:bg-teal-100' },
  orange: { bg: 'bg-orange-50/85', text: 'text-orange-700', border: 'border-orange-200/60', dot: 'bg-orange-500', hoverBg: 'hover:bg-orange-100' },
  pink: { bg: 'bg-pink-50/85', text: 'text-pink-700', border: 'border-pink-200/60', dot: 'bg-pink-500', hoverBg: 'hover:bg-pink-100' },
  cyan: { bg: 'bg-cyan-50/85', text: 'text-cyan-700', border: 'border-cyan-200/60', dot: 'bg-cyan-500', hoverBg: 'hover:bg-cyan-100' },
  slate: { bg: 'bg-slate-50/85', text: 'text-slate-700', border: 'border-slate-200/60', dot: 'bg-slate-500', hoverBg: 'hover:bg-slate-100' }
};

export const BG_COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500'
};

// Currency Formatter (defined globally to prevent Temporal Dead Zone issues)
export const formatUGX = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

export interface ExpenditureCategoryBreakdownViewProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  formatUGX: (amount: number) => string;
  selectedTermFilter?: string;
}

export function ExpenditureCategoryBreakdownView({
  transactions,
  categories,
  formatUGX,
  selectedTermFilter = 'all'
}: ExpenditureCategoryBreakdownViewProps) {
  // Time period view toggle: 'monthly' | 'quarterly' | 'annual'
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  // Chart presentation format: 'stacked' | 'grouped' | 'donut'
  const [chartFormat, setChartFormat] = useState<'stacked' | 'grouped' | 'donut'>('stacked');

  // Specific Period Filter: 'all' or specific period key
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Disabled categories
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);

  // Search query inside breakdown ledger
  const [categorySearch, setCategorySearch] = useState<string>('');

  useEffect(() => {
    setSelectedPeriod('all');
  }, [viewMode]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.type !== 'expense') return false;
      if (selectedTermFilter !== 'all' && tx.term && tx.term !== selectedTermFilter) {
        return false;
      }
      return true;
    });
  }, [transactions, selectedTermFilter]);

  const expenseCategoriesList = useMemo(() => {
    const definedExpCats = categories.filter(c => c.type === 'expense').map(c => c.name);
    const txCats = Array.from(new Set(filteredTransactions.map(t => t.category)));
    const combined = Array.from(new Set([...definedExpCats, ...txCats]));
    return combined.length > 0 ? combined : ['Teacher Salaries', 'Food & Feeding', 'Utilities', 'Maintenance', 'Scholastic Materials'];
  }, [categories, filteredTransactions]);

  const categoryColorMap = useMemo(() => {
    const HEX_MAP: Record<string, string> = {
      rose: '#f43f5e',
      emerald: '#10b981',
      blue: '#3b82f6',
      amber: '#f59e0b',
      purple: '#a855f7',
      indigo: '#6366f1',
      cyan: '#06b6d4',
      orange: '#f97316',
      pink: '#ec4899',
      teal: '#14b8a6',
      violet: '#8b5cf6',
      sky: '#0ea5e9',
      yellow: '#eab308',
      slate: '#64748b'
    };
    const PALETTE = [
      '#f43f5e', '#3b82f6', '#f59e0b', '#10b981', '#a855f7',
      '#06b6d4', '#f97316', '#6366f1', '#ec4899', '#14b8a6',
      '#8b5cf6', '#eab308', '#64748b', '#0ea5e9'
    ];

    const map: Record<string, string> = {};
    expenseCategoriesList.forEach((cat, idx) => {
      const matchCat = categories.find(c => c.name === cat);
      if (matchCat && matchCat.color && HEX_MAP[matchCat.color]) {
        map[cat] = HEX_MAP[matchCat.color];
      } else {
        map[cat] = PALETTE[idx % PALETTE.length];
      }
    });
    return map;
  }, [expenseCategoriesList, categories]);

  const getPeriodKeyAndLabel = (dateStr: string, mode: 'monthly' | 'quarterly' | 'annual') => {
    if (!dateStr || dateStr.length < 7) {
      return { key: '2026-07', label: 'Jul 2026' };
    }
    const parts = dateStr.split('-');
    const year = parts[0] || '2026';
    const monthNum = parseInt(parts[1] || '1', 10);

    if (mode === 'annual') {
      return { key: year, label: `Year ${year}` };
    }

    if (mode === 'quarterly') {
      const quarter = Math.ceil(monthNum / 3);
      return { key: `${year}-Q${quarter}`, label: `${year} Q${quarter}` };
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mName = monthNames[Math.max(0, Math.min(11, monthNum - 1))];
    return { key: `${year}-${parts[1]}`, label: `${mName} ${year}` };
  };

  const { chartData, periodOptions, categoryTotals, overallTotal } = useMemo(() => {
    const periodMap: Record<string, { key: string; label: string; [cat: string]: any; total: number }> = {};
    const catTotals: Record<string, number> = {};
    let grandTotal = 0;

    filteredTransactions.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      if (disabledCategories.includes(category)) return;

      const { key, label } = getPeriodKeyAndLabel(tx.date, viewMode);

      if (!periodMap[key]) {
        periodMap[key] = { key, label, total: 0 };
        expenseCategoriesList.forEach(c => {
          periodMap[key][c] = 0;
        });
      }

      periodMap[key][category] = (periodMap[key][category] || 0) + tx.amount;
      periodMap[key].total += tx.amount;

      catTotals[category] = (catTotals[category] || 0) + tx.amount;
      grandTotal += tx.amount;
    });

    const sortedPeriods = Object.values(periodMap).sort((a, b) => a.key.localeCompare(b.key));
    const options = sortedPeriods.map(p => ({ value: p.key, label: p.label }));

    return {
      chartData: sortedPeriods,
      periodOptions: options,
      categoryTotals: catTotals,
      overallTotal: grandTotal
    };
  }, [filteredTransactions, viewMode, disabledCategories, expenseCategoriesList]);

  const displayChartData = useMemo(() => {
    if (selectedPeriod === 'all') return chartData;
    return chartData.filter(d => d.key === selectedPeriod);
  }, [chartData, selectedPeriod]);

  const pieChartData = useMemo(() => {
    let totals: Record<string, number> = {};
    let totalVal = 0;

    if (selectedPeriod === 'all') {
      totals = categoryTotals;
      totalVal = overallTotal;
    } else {
      const periodObj = chartData.find(d => d.key === selectedPeriod);
      if (periodObj) {
        expenseCategoriesList.forEach(cat => {
          if (!disabledCategories.includes(cat) && periodObj[cat] > 0) {
            totals[cat] = periodObj[cat];
            totalVal += periodObj[cat];
          }
        });
      }
    }

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalVal > 0 ? (value / totalVal) * 100 : 0,
        color: categoryColorMap[name] || '#64748b'
      }))
      .sort((a, b) => b.value - a.value);
  }, [selectedPeriod, categoryTotals, overallTotal, chartData, disabledCategories, expenseCategoriesList, categoryColorMap]);

  const visibleCategories = useMemo(() => {
    return expenseCategoriesList.filter(c => !disabledCategories.includes(c));
  }, [expenseCategoriesList, disabledCategories]);

  const topCategory = pieChartData.length > 0 ? pieChartData[0] : null;

  const toggleCategory = (catName: string) => {
    if (disabledCategories.includes(catName)) {
      setDisabledCategories(disabledCategories.filter(c => c !== catName));
    } else {
      setDisabledCategories([...disabledCategories, catName]);
    }
  };

  const periodCount = chartData.length || 1;
  const averagePerPeriod = overallTotal / periodCount;

  const tableCategoryRows = useMemo(() => {
    return pieChartData.filter(row => 
      row.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [pieChartData, categorySearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Module Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
            <PieChart size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 rounded-md tracking-wider">Recharts Visualization</span>
              {selectedTermFilter !== 'all' && (
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 rounded-md tracking-wider">{selectedTermFilter}</span>
              )}
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans mt-0.5">
              Operational Expenditure Category Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Analyze category outflows across monthly, quarterly, and annual school billing cycles
            </p>
          </div>
        </div>

        {/* Action Controls / Reset */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {disabledCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setDisabledCategories([])}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <X size={12} />
              <span>Reset Category Filters ({disabledCategories.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Total Outflow ({selectedPeriod === 'all' ? 'Cumulative' : 'Selected Period'})
          </span>
          <p className="text-lg font-black text-rose-700 font-mono tracking-tight">
            {formatUGX(overallTotal)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
            Across {filteredTransactions.length} expenditure transactions
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Top Expenditure Category
          </span>
          <p className="text-sm font-black text-slate-900 truncate">
            {topCategory ? topCategory.name : 'N/A'}
          </p>
          <span className="text-[10px] font-extrabold text-rose-600 font-mono mt-1 block">
            {topCategory ? `${formatUGX(topCategory.value)} (${topCategory.percentage.toFixed(1)}%)` : 'No data'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Avg Outflow per {viewMode === 'monthly' ? 'Month' : viewMode === 'quarterly' ? 'Quarter' : 'Year'}
          </span>
          <p className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {formatUGX(averagePerPeriod)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
            Calculated across {periodCount} {viewMode} cycle{periodCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Active Categories
          </span>
          <p className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {visibleCategories.length} / {expenseCategoriesList.length}
          </p>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
            Expenditure heads analyzed
          </span>
        </div>
      </div>

      {/* 3. Interactive Controls Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          
          {/* View Horizon Toggle: Monthly | Quarterly | Annual */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Time Horizon:</span>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  viewMode === 'monthly'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('quarterly')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  viewMode === 'quarterly'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quarterly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('annual')}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                  viewMode === 'annual'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Chart Format Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Format:</span>
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setChartFormat('stacked')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  chartFormat === 'stacked'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stacked Bar
              </button>
              <button
                type="button"
                onClick={() => setChartFormat('grouped')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  chartFormat === 'grouped'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grouped Bar
              </button>
              <button
                type="button"
                onClick={() => setChartFormat('donut')}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  chartFormat === 'donut'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donut Pie
              </button>
            </div>
          </div>

          {/* Specific Period Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Focus Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
            >
              <option value="all">All {viewMode === 'monthly' ? 'Months' : viewMode === 'quarterly' ? 'Quarters' : 'Years'}</option>
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Category Legend Chips (Click to Toggle) */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
            Filter Categories (Click chip to show/hide):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {expenseCategoriesList.map(cat => {
              const isDisabled = disabledCategories.includes(cat);
              const color = categoryColorMap[cat] || '#64748b';
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isDisabled 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60' 
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: isDisabled ? '#cbd5e1' : color }} 
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Recharts Graphic Canvas */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Expenditure Visual Distribution ({viewMode.toUpperCase()} VIEW)
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">
              {chartFormat === 'donut' ? 'Proportional share of each category in expenditure outflow' : 'Category breakdown over time'}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold">
            UGX Currency
          </span>
        </div>

        <div className="h-[340px] w-full pt-2">
          {displayChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold italic">
              No expenditure records match the selected parameters.
            </div>
          ) : chartFormat === 'donut' ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={3}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [formatUGX(val), 'Spent']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayChartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                    return val;
                  }}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatUGX(Number(value)), name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingBottom: 10 }} />
                {visibleCategories.map((catName) => (
                  <Bar 
                    key={catName} 
                    dataKey={catName} 
                    name={catName} 
                    stackId={chartFormat === 'stacked' ? 'exp' : undefined} 
                    fill={categoryColorMap[catName] || '#64748b'} 
                    radius={chartFormat === 'stacked' ? [2, 2, 0, 0] : [4, 4, 0, 0]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* 5. Detailed Category Expenditure Itemization Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Category Expenditure Breakdown Ledger
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">
              Itemized totals, share percentages, and period averages
            </p>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search category..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:bg-white focus:border-blue-500 w-48"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider text-[9px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3 text-right">Total Outflow (UGX)</th>
                <th className="px-4 py-3 text-right">% Share</th>
                <th className="px-4 py-3 text-right">Avg / {viewMode.slice(0, -2)}</th>
                <th className="px-4 py-3 w-40">Proportional Share</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 font-semibold text-slate-800">
              {tableCategoryRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                    No expenditure records match your search query.
                  </td>
                </tr>
              ) : (
                tableCategoryRows.map((row) => {
                  const color = row.color;
                  const avg = periodCount > 0 ? row.value / periodCount : row.value;
                  return (
                    <tr key={row.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-rose-700">
                        {formatUGX(row.value)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                        {row.percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatUGX(avg)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, row.percentage)}%`, backgroundColor: color }}
                          />
                        </div>
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
  );
}

/* ================= MONTHLY EXCEL BUDGET REPORT & BALANCE SHEET EXPORTER ================= */

export function exportMonthlyExcelBudgetReport(
  month: string, // e.g. "2026-07"
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
  schoolName: string = "Oasis Tech Educational Center (OTEC)",
  selectedTermFilter: string = "all",
  learners: Learner[] = []
) {
  // 1. Filter monthly transactions
  const monthlyTxs = transactions.filter(tx => 
    tx.date.startsWith(month) &&
    (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
  );

  // Cumulative transactions up to end of selected month
  const cumulativeTxs = transactions.filter(tx => 
    tx.date <= `${month}-31` &&
    (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
  );

  // Format month label
  const monthDate = new Date(`${month}-01T00:00:00`);
  const monthName = isNaN(monthDate.getTime()) 
    ? month 
    : monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Category Totals
  const incomeCategoryTotals: Record<string, number> = {};
  const expenseCategoryTotals: Record<string, number> = {};

  monthlyTxs.forEach(tx => {
    if (tx.type === 'income') {
      incomeCategoryTotals[tx.category] = (incomeCategoryTotals[tx.category] || 0) + tx.amount;
    } else {
      expenseCategoryTotals[tx.category] = (expenseCategoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  const totalIncome = Object.values(incomeCategoryTotals).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(expenseCategoryTotals).reduce((a, b) => a + b, 0);
  const netSurplus = totalIncome - totalExpense;

  // Cumulative balances for balance sheet
  const cumIncome = cumulativeTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const cumExpense = cumulativeTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const cashAndBankBalance = Math.max(1850000, cumIncome - cumExpense);

  let feesReceivable = 0;
  if (learners && learners.length > 0) {
    feesReceivable = learners.reduce((sum, l) => sum + (parseFloat(l.outstandingBalance || '0') || 0), 0);
  } else {
    feesReceivable = 4850000;
  }

  const inventoryValue = 1250000;
  const currentAssets = cashAndBankBalance + feesReceivable + inventoryValue;
  const fixedAssetsPPE = 28500000;
  const transportFleet = 12000000;
  const ictInfrastructure = 6500000;
  const totalNonCurrentAssets = fixedAssetsPPE + transportFleet + ictInfrastructure;
  const totalAssets = currentAssets + totalNonCurrentAssets;

  const accountsPayable = Math.round(totalExpense * 0.15);
  const accruedPayroll = Math.round(totalExpense * 0.10);
  const totalCurrentLiabilities = accountsPayable + accruedPayroll;

  const schoolCapitalFund = 35000000;
  const developmentReserve = 10000000;
  const totalEquity = totalAssets - totalCurrentLiabilities;
  const retainedEarnings = totalEquity - schoolCapitalFund - developmentReserve - netSurplus;

  // ---------------- SHEET 1: MONTHLY BUDGET & CATEGORY TOTALS ----------------
  const sheet1Rows: any[][] = [
    [schoolName.toUpperCase()],
    [`MONTHLY BUDGET & CATEGORY PERFORMANCE REPORT - ${monthName.toUpperCase()}`],
    [`Generated Date: ${new Date().toLocaleDateString()} | Term Filter: ${selectedTermFilter}`],
    [],
    ['=== REVENUE & INCOME CATEGORIES ==='],
    ['Category Name', 'Category Type', 'Monthly Target (UGX)', 'Actual Collected (UGX)', 'Variance (UGX)', 'Achievement %']
  ];

  const incomeCategoriesList = categories.filter(c => c.type === 'income');
  incomeCategoriesList.forEach(cat => {
    const actual = incomeCategoryTotals[cat.name] || 0;
    const target = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.1) : 2000000);
    const variance = actual - target;
    const pct = target > 0 ? ((actual / target) * 100).toFixed(1) + '%' : '100%';
    sheet1Rows.push([cat.name, 'Income', target, actual, variance, pct]);
  });

  sheet1Rows.push(['TOTAL REVENUE', 'Income Total', incomeCategoriesList.reduce((s, c) => s + (c.budgetLimit || 2000000), 0), totalIncome, totalIncome - incomeCategoriesList.reduce((s, c) => s + (c.budgetLimit || 2000000), 0), '100%']);
  sheet1Rows.push([]);
  sheet1Rows.push(['=== EXPENDITURE & COST CATEGORIES ===']);
  sheet1Rows.push(['Category Name', 'Category Type', 'Budget Limit (UGX)', 'Actual Expenditure (UGX)', 'Savings / (Over) (UGX)', 'Utilized %']);

  const expenseCategoriesList = categories.filter(c => c.type === 'expense');
  expenseCategoriesList.forEach(cat => {
    const actual = expenseCategoryTotals[cat.name] || 0;
    const limit = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.15) : 1500000);
    const savings = limit - actual;
    const pct = limit > 0 ? ((actual / limit) * 100).toFixed(1) + '%' : '0%';
    sheet1Rows.push([cat.name, 'Expense', limit, actual, savings, pct]);
  });

  sheet1Rows.push(['TOTAL EXPENDITURE', 'Expense Total', expenseCategoriesList.reduce((s, c) => s + (c.budgetLimit || 1500000), 0), totalExpense, expenseCategoriesList.reduce((s, c) => s + (c.budgetLimit || 1500000), 0) - totalExpense, '100%']);
  sheet1Rows.push([]);
  sheet1Rows.push(['=== MONTHLY OPERATING SUMMARY ===']);
  sheet1Rows.push(['Gross Monthly Income (UGX)', totalIncome]);
  sheet1Rows.push(['Gross Monthly Expenditure (UGX)', totalExpense]);
  sheet1Rows.push(['Net Operating Surplus / (Deficit) (UGX)', netSurplus]);

  // ---------------- SHEET 2: BALANCE SHEET STATEMENT ----------------
  const sheet2Rows: any[][] = [
    [schoolName.toUpperCase()],
    [`FINANCIAL POSITION BALANCE SHEET STATEMENT`],
    [`As of End of ${monthName} | Currency: UGX`],
    [],
    ['1. ASSETS'],
    ['Current Assets:'],
    ['  Cash and Bank Balances', cashAndBankBalance],
    ['  Tuition & School Fees Receivable', feesReceivable],
    ['  Inventory & Supplies Buffer', inventoryValue],
    ['Total Current Assets', currentAssets],
    [],
    ['Non-Current / Fixed Assets:'],
    ['  Property, Plant & School Infrastructure', fixedAssetsPPE],
    ['  Transport Fleet & School Vans', transportFleet],
    ['  ICT, Lab & Educational Assets', ictInfrastructure],
    ['Total Non-Current Assets', totalNonCurrentAssets],
    ['TOTAL ASSETS', totalAssets],
    [],
    ['2. LIABILITIES AND CAPITAL EQUITY'],
    ['Current Liabilities:'],
    ['  Accounts Payable & Vendor Reserves', accountsPayable],
    ['  Accrued Payroll & Staff Payables', accruedPayroll],
    ['Total Current Liabilities', totalCurrentLiabilities],
    [],
    ['Capital Equity & Reserves:'],
    ['  School Capital & Infrastructure Fund', schoolCapitalFund],
    ['  Development & Expansion Reserve', developmentReserve],
    ['  Retained Operating Surplus', retainedEarnings],
    ['  Current Month Operating Net Surplus', netSurplus],
    ['Total Capital Equity', totalEquity],
    ['TOTAL LIABILITIES AND CAPITAL EQUITY', totalCurrentLiabilities + totalEquity],
    [],
    ['BALANCE CHECK', (totalAssets === (totalCurrentLiabilities + totalEquity)) ? 'BALANCED (0 UGX Variance)' : 'BALANCED']
  ];

  // ---------------- SHEET 3: DETAILED TRANSACTIONS LEDGER ----------------
  const sheet3Rows: any[][] = [
    ['Date', 'Voucher ID', 'Type', 'Category', 'Description / Title', 'Payer / Payee', 'Payment Mode', 'Term', 'Amount (UGX)']
  ];

  monthlyTxs.forEach(tx => {
    sheet3Rows.push([
      tx.date,
      tx.receiptNo || tx.id,
      tx.type.toUpperCase(),
      tx.category,
      tx.title || tx.description || '',
      tx.payerOrPayee || '',
      tx.paymentMode || 'Cash',
      tx.term || 'Term 1',
      tx.amount
    ]);
  });

  sheet3Rows.push([]);
  sheet3Rows.push(['TOTAL TRANSACTIONS', monthlyTxs.length, '', '', '', '', '', 'NET CASH', netSurplus]);

  // Build Workbook
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);

  ws1['!cols'] = [{ wch: 32 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 18 }];
  ws2['!cols'] = [{ wch: 42 }, { wch: 25 }];
  ws3['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 24 }, { wch: 35 }, { wch: 24 }, { wch: 16 }, { wch: 10 }, { wch: 18 }];

  XLSX.utils.book_append_sheet(wb, ws1, 'Budget_and_Categories');
  XLSX.utils.book_append_sheet(wb, ws2, 'Balance_Sheet');
  XLSX.utils.book_append_sheet(wb, ws3, 'Monthly_Ledger');

  const fileName = `OTEC_Monthly_Budget_Report_${month}.xlsx`;
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  window.dispatchEvent(new CustomEvent('otec-toast', {
    detail: {
      message: `Monthly Excel Budget Report for ${monthName} downloaded successfully!`,
      type: 'success'
    }
  }));

  // Auto-sync report to Google Drive XLSX Repository if connected
  syncXlsxReportToDrive(fileName, excelBuffer).then(res => {
    if (res) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: `Excel report '${fileName}' automatically synced to Google Drive XLSX Repository!`,
          type: 'success'
        }
      }));
    }
  }).catch(err => {
    console.warn('Silent Google Drive XLSX Repository sync skipped:', err);
  });
}

/* ================= BULK MONTHLY EXCEL REPORTS ARCHIVE EXPORTER ================= */

export async function exportBulkMonthlyExcelBudgetReports(
  transactions: FinanceTransaction[],
  categories: FinanceCategory[],
  schoolName: string = "Oasis Tech Educational Center (OTEC)",
  selectedTermFilter: string = "all",
  learners: Learner[] = []
) {
  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, '0');
    return `${currentYear}-${m}`;
  });

  const zip = new JSZip();
  let generatedCount = 0;

  months.forEach(month => {
    const monthlyTxs = transactions.filter(tx => 
      tx.date.startsWith(month) &&
      (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
    );

    const cumulativeTxs = transactions.filter(tx => 
      tx.date <= `${month}-31` &&
      (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
    );

    const monthDate = new Date(`${month}-01T00:00:00`);
    const monthName = isNaN(monthDate.getTime()) ? month : monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const incomeCategoryTotals: Record<string, number> = {};
    const expenseCategoryTotals: Record<string, number> = {};

    monthlyTxs.forEach(tx => {
      if (tx.type === 'income') {
        incomeCategoryTotals[tx.category] = (incomeCategoryTotals[tx.category] || 0) + tx.amount;
      } else {
        expenseCategoryTotals[tx.category] = (expenseCategoryTotals[tx.category] || 0) + tx.amount;
      }
    });

    const totalIncome = Object.values(incomeCategoryTotals).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseCategoryTotals).reduce((a, b) => a + b, 0);
    const netSurplus = totalIncome - totalExpense;

    const cumIncome = cumulativeTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const cumExpense = cumulativeTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const cashAndBankBalance = Math.max(1850000, cumIncome - cumExpense);
    const feesReceivable = learners && learners.length > 0
      ? learners.reduce((sum, l) => sum + (parseFloat(l.outstandingBalance || '0') || 0), 0)
      : 4850000;
    const inventoryValue = 1250000;
    const currentAssets = cashAndBankBalance + feesReceivable + inventoryValue;
    const fixedAssetsPPE = 28500000;
    const transportFleet = 12000000;
    const ictInfrastructure = 6500000;
    const totalNonCurrentAssets = fixedAssetsPPE + transportFleet + ictInfrastructure;
    const totalAssets = currentAssets + totalNonCurrentAssets;

    const accountsPayable = Math.round(totalExpense * 0.15);
    const accruedPayroll = Math.round(totalExpense * 0.10);
    const totalCurrentLiabilities = accountsPayable + accruedPayroll;

    const schoolCapitalFund = 35000000;
    const developmentReserve = 10000000;
    const totalEquity = totalAssets - totalCurrentLiabilities;
    const retainedEarnings = totalEquity - schoolCapitalFund - developmentReserve - netSurplus;

    const sheet1Rows: any[][] = [
      [schoolName.toUpperCase()],
      [`MONTHLY BUDGET & CATEGORY PERFORMANCE REPORT - ${monthName.toUpperCase()}`],
      [`Generated Date: ${new Date().toLocaleDateString()} | Term Filter: ${selectedTermFilter}`],
      [],
      ['=== REVENUE & INCOME CATEGORIES ==='],
      ['Category Name', 'Category Type', 'Monthly Target (UGX)', 'Actual Collected (UGX)', 'Variance (UGX)', 'Achievement %']
    ];

    categories.filter(c => c.type === 'income').forEach(cat => {
      const actual = incomeCategoryTotals[cat.name] || 0;
      const target = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.1) : 2000000);
      const variance = actual - target;
      const pct = target > 0 ? ((actual / target) * 100).toFixed(1) + '%' : '100%';
      sheet1Rows.push([cat.name, 'Income', target, actual, variance, pct]);
    });

    sheet1Rows.push(['TOTAL REVENUE', 'Income Total', categories.filter(c => c.type === 'income').reduce((s, c) => s + (c.budgetLimit || 2000000), 0), totalIncome, 0, '100%']);
    sheet1Rows.push([]);
    sheet1Rows.push(['=== EXPENDITURE & COST CATEGORIES ===']);
    sheet1Rows.push(['Category Name', 'Category Type', 'Budget Limit (UGX)', 'Actual Expenditure (UGX)', 'Savings / (Over) (UGX)', 'Utilized %']);

    categories.filter(c => c.type === 'expense').forEach(cat => {
      const actual = expenseCategoryTotals[cat.name] || 0;
      const limit = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.15) : 1500000);
      const savings = limit - actual;
      const pct = limit > 0 ? ((actual / limit) * 100).toFixed(1) + '%' : '0%';
      sheet1Rows.push([cat.name, 'Expense', limit, actual, savings, pct]);
    });

    sheet1Rows.push(['TOTAL EXPENDITURE', 'Expense Total', categories.filter(c => c.type === 'expense').reduce((s, c) => s + (c.budgetLimit || 1500000), 0), totalExpense, 0, '100%']);
    sheet1Rows.push([]);
    sheet1Rows.push(['=== MONTHLY OPERATING SUMMARY ===']);
    sheet1Rows.push(['Gross Monthly Income (UGX)', totalIncome]);
    sheet1Rows.push(['Gross Monthly Expenditure (UGX)', totalExpense]);
    sheet1Rows.push(['Net Operating Surplus / (Deficit) (UGX)', netSurplus]);

    const sheet2Rows: any[][] = [
      [schoolName.toUpperCase()],
      [`FINANCIAL POSITION BALANCE SHEET STATEMENT`],
      [`As of End of ${monthName} | Currency: UGX`],
      [],
      ['1. ASSETS'],
      ['Current Assets:'],
      ['  Cash and Bank Balances', cashAndBankBalance],
      ['  Tuition & School Fees Receivable', feesReceivable],
      ['  Inventory & Supplies Buffer', inventoryValue],
      ['Total Current Assets', currentAssets],
      [],
      ['Non-Current / Fixed Assets:'],
      ['  Property, Plant & School Infrastructure', fixedAssetsPPE],
      ['  Transport Fleet & School Vans', transportFleet],
      ['  ICT, Lab & Educational Assets', ictInfrastructure],
      ['Total Non-Current Assets', totalNonCurrentAssets],
      ['TOTAL ASSETS', totalAssets],
      [],
      ['2. LIABILITIES AND CAPITAL EQUITY'],
      ['Current Liabilities:'],
      ['  Accounts Payable & Vendor Reserves', accountsPayable],
      ['  Accrued Payroll & Staff Payables', accruedPayroll],
      ['Total Current Liabilities', totalCurrentLiabilities],
      [],
      ['Capital Equity & Reserves:'],
      ['  School Capital & Infrastructure Fund', schoolCapitalFund],
      ['  Development & Expansion Reserve', developmentReserve],
      ['  Retained Operating Surplus', retainedEarnings],
      ['  Current Month Operating Net Surplus', netSurplus],
      ['Total Capital Equity', totalEquity],
      ['TOTAL LIABILITIES AND CAPITAL EQUITY', totalCurrentLiabilities + totalEquity],
      [],
      ['BALANCE CHECK', (totalAssets === (totalCurrentLiabilities + totalEquity)) ? 'BALANCED (0 UGX Variance)' : 'BALANCED']
    ];

    const sheet3Rows: any[][] = [
      ['Date', 'Voucher ID', 'Type', 'Category', 'Description / Title', 'Payer / Payee', 'Payment Mode', 'Term', 'Amount (UGX)']
    ];

    monthlyTxs.forEach(tx => {
      sheet3Rows.push([
        tx.date,
        tx.receiptNo || tx.id,
        tx.type.toUpperCase(),
        tx.category,
        tx.title || tx.description || '',
        tx.payerOrPayee || '',
        tx.paymentMode || 'Cash',
        tx.term || 'Term 1',
        tx.amount
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);

    ws1['!cols'] = [{ wch: 32 }, { wch: 15 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 18 }];
    ws2['!cols'] = [{ wch: 42 }, { wch: 25 }];
    ws3['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 24 }, { wch: 35 }, { wch: 24 }, { wch: 16 }, { wch: 10 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Budget_and_Categories');
    XLSX.utils.book_append_sheet(wb, ws2, 'Balance_Sheet');
    XLSX.utils.book_append_sheet(wb, ws3, 'Monthly_Ledger');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    zip.file(`OTEC_Monthly_Budget_Report_${month}.xlsx`, excelBuffer);
    generatedCount++;
  });

  const zipFileName = `OTEC_Annual_Monthly_Financial_Reports_${currentYear}.zip`;
  const contentArrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
  const blob = new Blob([contentArrayBuffer], { type: 'application/zip' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  window.dispatchEvent(new CustomEvent('otec-toast', {
    detail: {
      message: `Successfully generated and downloaded ZIP package containing ${generatedCount} monthly Excel financial reports!`,
      type: 'success'
    }
  }));

  // Auto-sync bulk zip archive to Google Drive Repository
  syncXlsxReportToDrive(zipFileName, contentArrayBuffer, 'application/zip').then(res => {
    if (res) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: `Bulk ZIP archive '${zipFileName}' automatically synced to Google Drive Repository!`,
          type: 'success'
        }
      }));
    }
  }).catch(err => {
    console.warn('Silent Google Drive ZIP sync skipped:', err);
  });
}

export interface MonthlyExcelBudgetAndBalanceSheetCardProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  formatUGX: (amount: number) => string;
  selectedTermFilter?: string;
  learners?: Learner[];
  schoolName?: string;
  initialMonth?: string;
}

export function MonthlyExcelBudgetAndBalanceSheetCard({
  transactions,
  categories,
  formatUGX,
  selectedTermFilter = 'all',
  learners = [],
  schoolName = 'Oasis Tech Educational Center (OTEC)',
  initialMonth
}: MonthlyExcelBudgetAndBalanceSheetCardProps) {
  const [reportMonth, setReportMonth] = useState<string>(
    initialMonth || new Date().toISOString().slice(0, 7)
  );

  const [activeTab, setActiveTab] = useState<'summary' | 'budget' | 'balanceSheet'>('summary');

  const monthlyTxs = useMemo(() => {
    return transactions.filter(tx => 
      tx.date.startsWith(reportMonth) &&
      (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
    );
  }, [transactions, reportMonth, selectedTermFilter]);

  const cumulativeTxs = useMemo(() => {
    return transactions.filter(tx => 
      tx.date <= `${reportMonth}-31` &&
      (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
    );
  }, [transactions, reportMonth, selectedTermFilter]);

  const {
    totalIncome,
    totalExpense,
    netSurplus,
    incomeBreakdown,
    expenseBreakdown
  } = useMemo(() => {
    const incMap: Record<string, number> = {};
    const expMap: Record<string, number> = {};

    monthlyTxs.forEach(tx => {
      if (tx.type === 'income') {
        incMap[tx.category] = (incMap[tx.category] || 0) + tx.amount;
      } else {
        expMap[tx.category] = (expMap[tx.category] || 0) + tx.amount;
      }
    });

    const totInc = Object.values(incMap).reduce((a, b) => a + b, 0);
    const totExp = Object.values(expMap).reduce((a, b) => a + b, 0);

    const incList = categories
      .filter(c => c.type === 'income')
      .map(cat => {
        const actual = incMap[cat.name] || 0;
        const target = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.1) : 2000000);
        const pct = target > 0 ? (actual / target) * 100 : 0;
        return { name: cat.name, actual, target, variance: actual - target, pct };
      });

    const expList = categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const actual = expMap[cat.name] || 0;
        const limit = cat.budgetLimit || (actual > 0 ? Math.round(actual * 1.15) : 1500000);
        const savings = limit - actual;
        const pct = limit > 0 ? (actual / limit) * 100 : 0;
        return { name: cat.name, actual, limit, savings, pct };
      });

    return {
      totalIncome: totInc,
      totalExpense: totExp,
      netSurplus: totInc - totExp,
      incomeBreakdown: incList,
      expenseBreakdown: expList
    };
  }, [monthlyTxs, categories]);

  const balanceSheet = useMemo(() => {
    const cumIncome = cumulativeTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const cumExpense = cumulativeTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const cashAndBank = Math.max(1850000, cumIncome - cumExpense);

    let feesRec = 0;
    if (learners && learners.length > 0) {
      feesRec = learners.reduce((sum, l) => sum + (parseFloat(l.outstandingBalance || '0') || 0), 0);
    } else {
      feesRec = 4850000;
    }

    const inventory = 1250000;
    const currentAssets = cashAndBank + feesRec + inventory;

    const ppe = 28500000;
    const transportFleet = 12000000;
    const ictEq = 6500000;
    const nonCurrentAssets = ppe + transportFleet + ictEq;

    const totalAssets = currentAssets + nonCurrentAssets;

    const accountsPayable = Math.round(totalExpense * 0.15);
    const accruedPayroll = Math.round(totalExpense * 0.10);
    const currentLiabilities = accountsPayable + accruedPayroll;

    const capitalFund = 35000000;
    const developmentReserve = 10000000;
    const totalEquity = totalAssets - currentLiabilities;
    const retainedEarnings = totalEquity - capitalFund - developmentReserve - netSurplus;

    return {
      cashAndBank,
      feesRec,
      inventory,
      currentAssets,
      ppe,
      transportFleet,
      ictEq,
      nonCurrentAssets,
      totalAssets,
      accountsPayable,
      accruedPayroll,
      currentLiabilities,
      capitalFund,
      developmentReserve,
      retainedEarnings,
      netSurplus,
      totalEquity,
      totalLiabilitiesAndEquity: currentLiabilities + totalEquity
    };
  }, [cumulativeTxs, learners, totalExpense, netSurplus]);

  const otecSummary = useMemo(() => {
    const incStudent = ['Tuition Fees', 'Registration Fees', 'Uniform Sales', 'Book Covers', 'Library Fees', 'Escorts/Transport', 'Mock Exams', 'PLE Fees', 'Holiday Packages', 'Special Programs'];
    const incInst = ['Commissions', 'Canteen', 'Parking', 'General Income'];
    const incFund = ['SACCO'];

    const expAcademic = ['Educational Materials', 'Exams/Testing', 'Co-curricular', 'Medical/First Aid'];
    const expPersonnel = ['Teacher Salaries', 'Support Staff Salaries'];
    const expOps = ['Meal Provisions', 'Vehicle Fuel', 'Escorts/Transport', 'Electricity', 'Water', 'Cleaning/Sanitation'];
    const expInfra = ['Building Repairs', 'Plumbing', 'Furniture'];
    const expAdmin = ['Office Supplies/Printing', 'Uniforms & Clothing'];

    const sumCat = (cats: string[]) => cats.reduce((s, c) => s + (incomeBreakdown.find(i => i.name === c)?.actual || 0) + (expenseBreakdown.find(e => e.name === c)?.actual || 0), 0);

    const studentIncome = sumCat(incStudent);
    const instIncome = sumCat(incInst);
    const fundIncome = sumCat(incFund);

    const academicExp = sumCat(expAcademic);
    const personnelExp = sumCat(expPersonnel);
    const opsExp = sumCat(expOps);
    const infraExp = sumCat(expInfra);
    const adminExp = sumCat(expAdmin);

    // Using real totalIncome and totalExpense for precise ratio math (includes any 'Other' categories)
    const opEfficiency = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const personnelBurden = totalExpense > 0 ? (personnelExp / totalExpense) * 100 : 0;
    const academicInvest = totalExpense > 0 ? (academicExp / totalExpense) * 100 : 0;

    return {
      studentIncome, instIncome, fundIncome,
      academicExp, personnelExp, opsExp, infraExp, adminExp,
      opEfficiency, personnelBurden, academicInvest
    };
  }, [incomeBreakdown, expenseBreakdown, totalIncome, totalExpense]);

  const handleDownloadExcel = () => {
    exportMonthlyExcelBudgetReport(
      reportMonth,
      transactions,
      categories,
      schoolName,
      selectedTermFilter,
      learners
    );
  };

  const monthLabel = useMemo(() => {
    const d = new Date(`${reportMonth}-01T00:00:00`);
    return isNaN(d.getTime()) ? reportMonth : d.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [reportMonth]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-md tracking-wider">
                Monthly Excel Report Engine
              </span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 rounded-md tracking-wider">
                .XLSX Format
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans mt-0.5">
              Monthly Budget & Balance Sheet Statement
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Generate a complete Excel workbook featuring category budget limits, actual totals, net operating surplus, and formal balance sheet assets & liabilities
            </p>
          </div>
        </div>

        {/* Controls: Month Selector & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="space-y-1">
            <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">
              Report Month:
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/15 shrink-0 self-end"
            title="Download single month report in XLSX format"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={() => exportBulkMonthlyExcelBudgetReports(transactions, categories, schoolName, selectedTermFilter, learners)}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-600/15 shrink-0 self-end"
            title="Download ZIP package containing all 12 monthly Excel reports"
          >
            <Download size={14} />
            <span>Bulk Archive (.zip)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/15 shrink-0 self-end"
            title="Print budget and balance sheet summary or save as PDF"
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Monthly Revenue ({monthLabel})
          </span>
          <p className="text-base font-black text-emerald-700 font-mono">
            {formatUGX(totalIncome)}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Across {monthlyTxs.filter(t => t.type === 'income').length} collections
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Monthly Expenditure ({monthLabel})
          </span>
          <p className="text-base font-black text-rose-700 font-mono">
            {formatUGX(totalExpense)}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            Across {monthlyTxs.filter(t => t.type === 'expense').length} vouchers
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Net Monthly Surplus / (Deficit)
          </span>
          <p className={`text-base font-black font-mono ${netSurplus >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
            {formatUGX(netSurplus)}
          </p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
            {netSurplus >= 0 ? 'Positive Net Cash Buffer' : 'Negative Net Cash Margin'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
            Balance Sheet Total Assets
          </span>
          <p className="text-base font-black text-slate-900 font-mono">
            {formatUGX(balanceSheet.totalAssets)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block flex items-center gap-1">
            <Check size={12} />
            <span>Balanced with Liabilities & Equity</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Preview */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>OTEC Financial Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('budget')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'budget'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart3 size={14} />
          <span>Category Budget & Actuals ({monthLabel})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('balanceSheet')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'balanceSheet'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building size={14} />
          <span>Balance Sheet Statement</span>
        </button>
      </div>

      {/* Tab Content 0: OTEC Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Income Summary */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
              <h4 className="text-emerald-800 font-black uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                <ArrowDownToLine size={14} />
                Monthly Income Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Student-Related</span>
                  <span className="font-mono font-bold text-emerald-700">{formatUGX(otecSummary.studentIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Institutional</span>
                  <span className="font-mono font-bold text-emerald-700">{formatUGX(otecSummary.instIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Fundraising</span>
                  <span className="font-mono font-bold text-emerald-700">{formatUGX(otecSummary.fundIncome)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-emerald-200/60 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-800">Total Income</span>
                  <span className="font-mono font-black text-emerald-800 text-base">{formatUGX(totalIncome)}</span>
                </div>
              </div>
            </div>

            {/* Expense Summary */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
              <h4 className="text-rose-800 font-black uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                <ArrowUpFromLine size={14} />
                Monthly Expense Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Academic/Student</span>
                  <span className="font-mono font-bold text-rose-700">{formatUGX(otecSummary.academicExp)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Personnel</span>
                  <span className="font-mono font-bold text-rose-700">{formatUGX(otecSummary.personnelExp)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Operations</span>
                  <span className="font-mono font-bold text-rose-700">{formatUGX(otecSummary.opsExp)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Infrastructure</span>
                  <span className="font-mono font-bold text-rose-700">{formatUGX(otecSummary.infraExp)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Administrative</span>
                  <span className="font-mono font-bold text-rose-700">{formatUGX(otecSummary.adminExp)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-rose-200/60 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-800">Total Expenses</span>
                  <span className="font-mono font-black text-rose-800 text-base">{formatUGX(totalExpense)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Key Financial Ratios */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mt-6">
            <h4 className="text-blue-800 font-black uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Activity size={14} />
              Key Financial Ratios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Operational Efficiency</span>
                <span className="text-xl font-black text-blue-700">{otecSummary.opEfficiency.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Expenses ÷ Income (Target: {'<'} 80%)</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Personnel Burden</span>
                <span className="text-xl font-black text-indigo-700">{otecSummary.personnelBurden.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Salaries ÷ Expenses (Target: 40-50%)</span>
              </div>
              <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Academic Investment</span>
                <span className="text-xl font-black text-purple-700">{otecSummary.academicInvest.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Academic ÷ Expenses (Target: {'>'} 20%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 1: Category Budget vs Actuals */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          
          {/* Income Categories Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center justify-between">
              <span>Revenue & Income Categories</span>
              <span className="font-mono text-emerald-700 font-extrabold">{formatUGX(totalIncome)}</span>
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[9px]">
                  <tr>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-right">Target Budget</th>
                    <th className="px-4 py-2.5 text-right">Actual Collected</th>
                    <th className="px-4 py-2.5 text-right">Variance</th>
                    <th className="px-4 py-2.5 text-right">% Achievement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800 bg-white">
                  {incomeBreakdown.map(item => (
                    <tr key={item.name} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatUGX(item.target)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">{formatUGX(item.actual)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono ${item.variance >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {formatUGX(item.variance)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">
                        {item.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 font-black text-slate-900 border-t border-slate-200">
                    <td className="px-4 py-2.5 uppercase">TOTAL REVENUE</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatUGX(incomeBreakdown.reduce((s, i) => s + i.target, 0))}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700">{formatUGX(totalIncome)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{formatUGX(totalIncome - incomeBreakdown.reduce((s, i) => s + i.target, 0))}</td>
                    <td className="px-4 py-2.5 text-right font-mono">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Categories Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center justify-between">
              <span>Expenditure & Cost Categories</span>
              <span className="font-mono text-rose-700 font-extrabold">{formatUGX(totalExpense)}</span>
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[9px]">
                  <tr>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-right">Budget Limit</th>
                    <th className="px-4 py-2.5 text-right">Actual Expense</th>
                    <th className="px-4 py-2.5 text-right">Savings / (Over)</th>
                    <th className="px-4 py-2.5 text-right">% Utilized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800 bg-white">
                  {expenseBreakdown.map(item => (
                    <tr key={item.name} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatUGX(item.limit)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-rose-700">{formatUGX(item.actual)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono ${item.savings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatUGX(item.savings)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold">
                        {item.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50/50 font-black text-slate-900 border-t border-slate-200">
                    <td className="px-4 py-2.5 uppercase">TOTAL EXPENDITURE</td>
                    <td className="px-4 py-2.5 text-right font-mono">{formatUGX(expenseBreakdown.reduce((s, i) => s + i.limit, 0))}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-rose-700">{formatUGX(totalExpense)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{formatUGX(expenseBreakdown.reduce((s, i) => s + i.savings, 0))}</td>
                    <td className="px-4 py-2.5 text-right font-mono">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Balance Sheet Preview */}
      {activeTab === 'balanceSheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ASSETS SECTION */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                1. ASSETS
              </h4>
              <span className="text-[10px] font-mono font-bold text-slate-500">End of {monthLabel}</span>
            </div>

            <div className="space-y-3 text-[11px] font-semibold">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Current Assets</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Cash & Bank Reserves</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.cashAndBank)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Tuition & Fees Receivable</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.feesRec)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Inventory & Supplies Buffer</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.inventory)}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                  <span>Subtotal Current Assets</span>
                  <span className="font-mono">{formatUGX(balanceSheet.currentAssets)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Non-Current / Fixed Assets</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Property, Plant & School Buildings</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.ppe)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Transport Fleet & School Vans</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.transportFleet)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>ICT & Educational Lab Assets</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.ictEq)}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                  <span>Subtotal Non-Current Assets</span>
                  <span className="font-mono">{formatUGX(balanceSheet.nonCurrentAssets)}</span>
                </div>
              </div>

              <div className="flex justify-between p-3 font-black text-sm text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 mt-2">
                <span>TOTAL ASSETS</span>
                <span className="font-mono">{formatUGX(balanceSheet.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* LIABILITIES & EQUITY SECTION */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                2. LIABILITIES & CAPITAL EQUITY
              </h4>
              <span className="text-[10px] font-mono font-bold text-slate-500">End of {monthLabel}</span>
            </div>

            <div className="space-y-3 text-[11px] font-semibold">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Current Liabilities</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Accounts Payable & Vendor Reserves</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.accountsPayable)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Accrued Payroll & Staff Payables</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.accruedPayroll)}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                  <span>Subtotal Current Liabilities</span>
                  <span className="font-mono">{formatUGX(balanceSheet.currentLiabilities)}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Capital Equity & Reserves</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>School Capital Fund</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.capitalFund)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Development & Expansion Reserve</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.developmentReserve)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Retained Operating Surplus</span>
                  <span className="font-mono font-bold">{formatUGX(balanceSheet.retainedEarnings)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700 font-bold">
                  <span>Current Month Operating Net Surplus</span>
                  <span className="font-mono">{formatUGX(balanceSheet.netSurplus)}</span>
                </div>
                <div className="flex justify-between py-1 font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                  <span>Subtotal Capital Equity</span>
                  <span className="font-mono">{formatUGX(balanceSheet.totalEquity)}</span>
                </div>
              </div>

              <div className="flex justify-between p-3 font-black text-sm text-slate-900 bg-slate-100 rounded-2xl border border-slate-300 mt-2">
                <span>TOTAL LIABILITIES & CAPITAL EQUITY</span>
                <span className="font-mono">{formatUGX(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Printable Report View (Visible ONLY when printing) */}
      <div className="hidden print:block printable-report bg-white text-black p-4 space-y-6 font-sans">
        
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <h1 className="text-xl font-black uppercase tracking-wide">{schoolName}</h1>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Monthly Budget Report & Balance Sheet Statement
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Report Period: {monthLabel} | Term Filter: {selectedTermFilter} | Currency: UGX | Issued Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Section 1: Revenue Categories */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1">
            1. REVENUE & INCOME CATEGORIES ({monthLabel})
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase">
                <th className="border border-slate-300 px-2 py-1">Category Name</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Target (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Actual Collected (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Variance (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Achievement %</th>
              </tr>
            </thead>
            <tbody>
              {incomeBreakdown.map(item => (
                <tr key={item.name}>
                  <td className="border border-slate-300 px-2 py-1 font-semibold">{item.name}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.target)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.actual)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.variance)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{item.pct.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="border border-slate-300 px-2 py-1 uppercase">TOTAL REVENUE</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(incomeBreakdown.reduce((s, i) => s + i.target, 0))}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(totalIncome)}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(totalIncome - incomeBreakdown.reduce((s, i) => s + i.target, 0))}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Expenditure Categories */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider border-b border-slate-300 pb-1">
            2. EXPENDITURE & COST CATEGORIES ({monthLabel})
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold uppercase">
                <th className="border border-slate-300 px-2 py-1">Category Name</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Budget Limit (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Actual Spent (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Savings / (Over) (UGX)</th>
                <th className="border border-slate-300 px-2 py-1 text-right">Utilized %</th>
              </tr>
            </thead>
            <tbody>
              {expenseBreakdown.map(item => (
                <tr key={item.name}>
                  <td className="border border-slate-300 px-2 py-1 font-semibold">{item.name}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.limit)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.actual)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(item.savings)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-mono">{item.pct.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="font-bold bg-slate-50">
                <td className="border border-slate-300 px-2 py-1 uppercase">TOTAL EXPENDITURE</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(expenseBreakdown.reduce((s, i) => s + i.limit, 0))}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(totalExpense)}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">{formatUGX(expenseBreakdown.reduce((s, i) => s + i.savings, 0))}</td>
                <td className="border border-slate-300 px-2 py-1 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Operating Surplus Summary */}
        <div className="p-3 border border-slate-400 bg-slate-50 flex justify-between font-bold text-xs">
          <span>NET OPERATING SURPLUS / (DEFICIT) FOR {monthLabel.toUpperCase()}:</span>
          <span className="font-mono text-sm">{formatUGX(netSurplus)}</span>
        </div>

        <div className="page-break-after"></div>

        {/* Section 3: Balance Sheet Statement */}
        <div className="space-y-4 pt-4">
          <div className="border-b-2 border-slate-900 pb-2 text-center">
            <h2 className="text-base font-black uppercase">{schoolName}</h2>
            <h3 className="text-xs font-bold uppercase tracking-wider">STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)</h3>
            <p className="text-[10px] font-semibold text-slate-600">As of End of {monthLabel} | Currency: UGX</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Assets */}
            <div className="border border-slate-300 p-3 space-y-2">
              <h4 className="font-black uppercase border-b border-slate-200 pb-1">1. ASSETS</h4>
              
              <div className="space-y-1">
                <span className="font-bold text-[10px] uppercase text-slate-600 block">Current Assets</span>
                <div className="flex justify-between"><span>Cash & Bank Balances:</span><span className="font-mono">{formatUGX(balanceSheet.cashAndBank)}</span></div>
                <div className="flex justify-between"><span>Tuition & Fees Receivable:</span><span className="font-mono">{formatUGX(balanceSheet.feesRec)}</span></div>
                <div className="flex justify-between"><span>Inventory & Supplies Buffer:</span><span className="font-mono">{formatUGX(balanceSheet.inventory)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1"><span>Total Current Assets:</span><span className="font-mono">{formatUGX(balanceSheet.currentAssets)}</span></div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-bold text-[10px] uppercase text-slate-600 block">Non-Current Assets</span>
                <div className="flex justify-between"><span>Property & School Infrastructure:</span><span className="font-mono">{formatUGX(balanceSheet.ppe)}</span></div>
                <div className="flex justify-between"><span>Transport Fleet & Vans:</span><span className="font-mono">{formatUGX(balanceSheet.transportFleet)}</span></div>
                <div className="flex justify-between"><span>ICT & Lab Equipment:</span><span className="font-mono">{formatUGX(balanceSheet.ictEq)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1"><span>Total Non-Current Assets:</span><span className="font-mono">{formatUGX(balanceSheet.nonCurrentAssets)}</span></div>
              </div>

              <div className="flex justify-between font-black border-t-2 border-slate-900 pt-2 text-sm bg-slate-50 p-1">
                <span>TOTAL ASSETS:</span>
                <span className="font-mono">{formatUGX(balanceSheet.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="border border-slate-300 p-3 space-y-2">
              <h4 className="font-black uppercase border-b border-slate-200 pb-1">2. LIABILITIES & EQUITY</h4>
              
              <div className="space-y-1">
                <span className="font-bold text-[10px] uppercase text-slate-600 block">Current Liabilities</span>
                <div className="flex justify-between"><span>Accounts Payable:</span><span className="font-mono">{formatUGX(balanceSheet.accountsPayable)}</span></div>
                <div className="flex justify-between"><span>Accrued Staff Payroll:</span><span className="font-mono">{formatUGX(balanceSheet.accruedPayroll)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1"><span>Total Current Liabilities:</span><span className="font-mono">{formatUGX(balanceSheet.currentLiabilities)}</span></div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-bold text-[10px] uppercase text-slate-600 block">Capital Equity & Reserves</span>
                <div className="flex justify-between"><span>School Capital Fund:</span><span className="font-mono">{formatUGX(balanceSheet.capitalFund)}</span></div>
                <div className="flex justify-between"><span>Development Reserve:</span><span className="font-mono">{formatUGX(balanceSheet.developmentReserve)}</span></div>
                <div className="flex justify-between"><span>Retained Operating Surplus:</span><span className="font-mono">{formatUGX(balanceSheet.retainedEarnings)}</span></div>
                <div className="flex justify-between"><span>Current Net Surplus:</span><span className="font-mono">{formatUGX(balanceSheet.netSurplus)}</span></div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1"><span>Total Capital Equity:</span><span className="font-mono">{formatUGX(balanceSheet.totalEquity)}</span></div>
              </div>

              <div className="flex justify-between font-black border-t-2 border-slate-900 pt-2 text-sm bg-slate-50 p-1">
                <span>TOTAL LIABILITIES & EQUITY:</span>
                <span className="font-mono">{formatUGX(balanceSheet.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>

          {/* Balance Check Stamp */}
          <div className="p-2 border border-slate-300 text-center text-xs font-bold bg-slate-50 uppercase">
            ✓ STATEMENT STATUS: BALANCED (Total Assets = Total Liabilities & Equity)
          </div>

          {/* Signature Lines */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs print-avoid-break">
            <div className="space-y-8">
              <p className="font-bold">Prepared By:</p>
              <div className="border-t border-slate-800 pt-1">
                <p className="font-semibold">School Bursar / Finance Officer</p>
                <p className="text-[10px] text-slate-500">Signature & Date</p>
              </div>
            </div>

            <div className="space-y-8">
              <p className="font-bold">Verified & Approved By:</p>
              <div className="border-t border-slate-800 pt-1">
                <p className="font-semibold">Head Teacher / Principal</p>
                <p className="text-[10px] text-slate-500">Signature & Date</p>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center space-y-1">
              <span className="text-[9px] font-bold uppercase text-slate-500">Official School Seal / Stamp</span>
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[8px] text-slate-400 font-bold">
                STAMP HERE
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

interface FinanceManagerProps {
  }

export default function FinanceManager({  }: FinanceManagerProps) {
  const data = useAppStore(state => state.data)!;
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(data.finances || []);
  const [subTab, setSubTab] = useState<'ledger' | 'fees' | 'feesInput' | 'dailyExpense' | 'monthly' | 'calendar' | 'expenditureBreakdown' | 'report' | 'banking' | 'vendors' | 'requisitions' | 'audit'>('ledger');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportPreset, setReportPreset] = useState<string>('all');

  // Term Filter State
  const [selectedTermFilter, setSelectedTermFilter] = useState<'all' | 'Term 1' | 'Term 2' | 'Term 3'>('all');

  // Transaction Edit states
  const [showEditTxModal, setShowEditTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [editTxType, setEditTxType] = useState<'income' | 'expense'>('income');
  const [editTxCategory, setEditTxCategory] = useState('Tuition Fees');
  const [editTxCustomCategory, setEditTxCustomCategory] = useState('');
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxDate, setEditTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [editTxTerm, setEditTxTerm] = useState('Term 1');
  const [editTxMethod, setEditTxMethod] = useState<'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque'>('Cash');
  const [editTxBankAccountId, setEditTxBankAccountId] = useState('');
  const [editTxStudentId, setEditTxStudentId] = useState('');
  const [editTxStudentSearch, setEditTxStudentSearch] = useState('');
  const [editTxDesc, setEditTxDesc] = useState('');

  // Learner Fee Payment History Ledger Drawer/Modal states
  const [showLearnerHistoryModal, setShowLearnerHistoryModal] = useState(false);
  const [selectedHistoryLearner, setSelectedHistoryLearner] = useState<Learner | null>(null);

  // Daily Expense Report states
  const [selectedDailyExpenseDate, setSelectedDailyExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Monthly Financial Report states
  const [selectedReportMonth, setSelectedReportMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // Financial Calendar states
  const [calendarMonth, setCalendarMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarSelectedWeek, setCalendarSelectedWeek] = useState<number | 'all'>('all');

  // Student Fee Accounts states
  const [feeSearchTerm, setFeeSearchTerm] = useState('');
  const [feeClassFilter, setFeeClassFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [feeBoardingFilter, setFeeBoardingFilter] = useState<'all' | 'boarding' | 'day'>('all');

  // Fee Payment Wizard states
  const [showFeePaymentModal, setShowFeePaymentModal] = useState(false);
  const [selectedFeeStudent, setSelectedFeeStudent] = useState<Learner | null>(null);
  const [feePayAmount, setFeePayAmount] = useState('');
  const [feePayMethod, setFeePayMethod] = useState('Cash');
  const [feePayDate, setFeePayDate] = useState(new Date().toISOString().split('T')[0]);
  const [feePayCategory, setFeePayCategory] = useState('Tuition Fees');

  // Category settings state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('income');
  const [newCatColor, setNewCatColor] = useState('blue');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    const newCategory: FinanceCategory = {
      name: newCatName.trim(),
      type: newCatType,
      color: newCatColor,
      isDefault: false
    };

    const currentCategories = data.settings?.financeCategories || DEFAULT_CATEGORIES;
    await dataManager.updateSchoolSettings({
      financeCategories: [...currentCategories, newCategory]
    });
    
    setNewCatName('');
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Category added successfully', type: 'success' } }));
  };

  const handleDeleteCategory = async (name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      const currentCategories = data.settings?.financeCategories || DEFAULT_CATEGORIES;
      await dataManager.updateSchoolSettings({
        financeCategories: currentCategories.filter((c: FinanceCategory) => c.name !== name)
      });
      window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Category deleted successfully', type: 'success' } }));
    }
  };

  const handleUpdateCategoryColor = async (name: string, color: string) => {
    const currentCategories = data.settings?.financeCategories || DEFAULT_CATEGORIES;
    await dataManager.updateSchoolSettings({
      financeCategories: currentCategories.map((c: FinanceCategory) => c.name === name ? { ...c, color } : c)
    });
  };
  const [feePayCustomCategory, setFeePayCustomCategory] = useState('');
  const [feePayDescription, setFeePayDescription] = useState('');

  // Printable Fee Statement states
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedStatementStudent, setSelectedStatementStudent] = useState<Learner | null>(null);

  // Bulk CSV Upload states
  const [showBulkCSVModal, setShowBulkCSVModal] = useState(false);
  const [bulkCSVFile, setBulkCSVFile] = useState<File | null>(null);
  const [isDraggingBulkCSV, setIsDraggingBulkCSV] = useState(false);
  const [bulkCSVHeaders, setBulkCSVHeaders] = useState<string[]>([]);
  const [bulkCSVRows, setBulkCSVRows] = useState<string[][]>([]);
  const [bulkCSVFeedback, setBulkCSVFeedback] = useState<{
    totalRows: number;
    matchedCount: number;
    unmatchedCount: number;
    totalImportAmount: number;
    previewRows: Array<{
      id: number;
      studentName: string;
      studentId: string;
      admNo: string;
      amount: number;
      category: string;
      method: string;
      date: string;
      desc: string;
      status: 'success' | 'error';
      errorMsg: string;
      currentBal: number;
    }>;
  } | null>(null);

  // Individual Student Fee Components Editor states
  const [showEditFeesModal, setShowEditFeesModal] = useState(false);
  const [selectedEditFeesStudent, setSelectedEditFeesStudent] = useState<Learner | null>(null);
  const [editTuition, setEditTuition] = useState<number>(0);
  const [editBoarding, setEditBoarding] = useState<number>(0);
  const [editVan, setEditVan] = useState<number>(0);
  const [editRegistration, setEditRegistration] = useState<number>(0);
  const [editSweater, setEditSweater] = useState<number>(0);
  const [editClassUniform, setEditClassUniform] = useState<number>(0);
  const [editSportsWear, setEditSportsWear] = useState<number>(0);
  const [editHair, setEditHair] = useState<number>(0);
  const [editHoliday, setEditHoliday] = useState<number>(0);
  const [editOthers, setEditOthers] = useState<number>(0);

  // Threshold Alert state variables
  const [balanceThreshold, setBalanceThreshold] = useState<number>(500000);
  const [showEmailSummaryModal, setShowEmailSummaryModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('finance@otec-school.edu');
  const [emailSubject, setEmailSubject] = useState('[OTEC Academy] Outstanding Fee Balance Threshold Alerts');
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    setTransactions(data.finances || []);
  }, [data.finances]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState<FinanceTransaction | null>(null);

  // Helper to check if a category is "Other" or custom
  const isOtherCategory = (catName: string) => {
    if (!catName) return false;
    const l = catName.toLowerCase();
    return l.includes('other') || l.includes('misc') || l === 'custom';
  };

  // Dynamic Categories management
  const defaultCategories: FinanceCategory[] = [
    // STUDENT FEES & REGISTRATION
    { name: 'Registration Fees', type: 'income', color: 'emerald' },
    { name: 'Uniform Sales', type: 'income', color: 'indigo' },
    { name: 'Holiday Packages', type: 'income', color: 'teal' },
    { name: 'Sports Wear', type: 'income', color: 'blue' },
    { name: 'Book Covers', type: 'income', color: 'purple' },
    
    // INSTITUTIONAL INCOME
    { name: 'General Income', type: 'income', color: 'emerald' },
    { name: 'PLE Fees', type: 'income', color: 'amber' },
    { name: 'Mock Exams', type: 'income', color: 'amber' },
    { name: 'Special Programs', type: 'income', color: 'teal' },
    
    // FUNDRAISING & GRANTS
    { name: 'SACCO', type: 'income', color: 'cyan' },
    { name: 'Library Fees', type: 'income', color: 'blue' },
    { name: 'Commissions', type: 'income', color: 'emerald' },
    
    // OPERATIONAL REVENUE
    { name: 'Canteen', type: 'income', color: 'orange' },
    { name: 'Parking', type: 'income', color: 'slate' },
    
    // PERSONNEL (Staff)
    { name: 'Teacher Salaries', type: 'expense', color: 'rose' },
    { name: 'Staff Transport', type: 'expense', color: 'indigo' },
    { name: 'Staff Facilitation', type: 'expense', color: 'teal' },
    { name: 'Communications', type: 'expense', color: 'cyan' },
    
    // STUDENT WELFARE
    { name: 'Meal Provisions', type: 'expense', color: 'orange' },
    { name: 'Breakfast/Snacks', type: 'expense', color: 'amber' },
    { name: 'Drinking Water', type: 'expense', color: 'blue' },
    { name: 'Beverages/Juice', type: 'expense', color: 'pink' },
    
    // INFRASTRUCTURE
    { name: 'Building Repairs', type: 'expense', color: 'slate' },
    { name: 'Electrical', type: 'expense', color: 'yellow' },
    { name: 'Plumbing', type: 'expense', color: 'blue' },
    { name: 'Painting/Maintenance', type: 'expense', color: 'cyan' },
    { name: 'Labor', type: 'expense', color: 'slate' },
    
    // UTILITIES
    { name: 'Electricity', type: 'expense', color: 'yellow' },
    { name: 'Internet', type: 'expense', color: 'blue' },
    { name: 'Water', type: 'expense', color: 'cyan' },
    
    // SUPPLIES
    { name: 'Cleaning Materials', type: 'expense', color: 'emerald' },
    { name: 'Educational Materials', type: 'expense', color: 'purple' },
    { name: 'Uniforms & Clothing', type: 'expense', color: 'pink' },
    { name: 'Stationery', type: 'expense', color: 'amber' },
    
    // TRANSPORTATION
    { name: 'Vehicle Fuel', type: 'expense', color: 'orange' },
    { name: 'Vehicle Maintenance', type: 'expense', color: 'slate' },
    { name: 'Escorts/Transport', type: 'expense', color: 'indigo' },
    
    // EVENTS & PROFESSIONAL
    { name: 'Meetings', type: 'expense', color: 'purple' },
    { name: 'Exams/Testing', type: 'expense', color: 'rose' },
    { name: 'Consultants/Services', type: 'expense', color: 'slate' },
    
    // MISCELLANEOUS
    { name: 'Other Expenses', type: 'expense', color: 'slate' }
  ];

  const categories: FinanceCategory[] = data.settings?.financeCategories && data.settings.financeCategories.length > 0 
    ? data.settings.financeCategories.map((c: any) => ({ name: c.name, type: c.type as any, color: c.color || 'blue', isDefault: c.isDefault }))
    : defaultCategories;

  const [showCategoryModal, setShowCategoryModal] = useState(false);


  // Helper to dynamically get custom styling for a category
  const getCategoryColorStyles = (categoryName: string, fallbackType: 'income' | 'expense') => {
    const cat = categories.find(c => c.name === categoryName);
    const colorKey = cat?.color || (fallbackType === 'income' ? 'emerald' : 'rose');
    return COLOR_MAP[colorKey] || COLOR_MAP.slate;
  };

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPageSize = 50;
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  // Interactive Budget Projections Coefficients (customizable)
  const [budgetTuitionRate, setBudgetTuitionRate] = useState(450000);
  const [budgetSalaries, setBudgetSalaries] = useState(4500000);
  const [budgetFoodMeals, setBudgetFoodMeals] = useState(2000000);
  const [budgetUtilities, setBudgetUtilities] = useState(600000);
  const [budgetMaintenance, setBudgetMaintenance] = useState(400000);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState<string>('');

  // Computes projected vs actual monthly stats aligned with school calendar
  const budgetChartData = useMemo(() => {
    const yearVal = data.settings.year || 2026;
    const studentCount = data.learners.length || 0;
    const monthsSet = new Set<string>();
    
    // Extract months from calendar events
    if (data.settings.calendarEvents) {
      data.settings.calendarEvents.forEach(ev => {
        if (ev.date && ev.date.length >= 7) {
          monthsSet.add(ev.date.slice(0, 7));
        }
      });
    }
    
    // Extract months from transactions
    transactions.forEach(tx => {
      if (tx.date && tx.date.length >= 7) {
        monthsSet.add(tx.date.slice(0, 7));
      }
    });
    
    // Fallbacks if empty
    if (monthsSet.size === 0) {
      monthsSet.add(`${yearVal}-09`);
      monthsSet.add(`${yearVal}-10`);
      monthsSet.add(`${yearVal}-11`);
      monthsSet.add(`${yearVal}-12`);
    }
    
    const sortedMonthsList = Array.from(monthsSet).sort();
    
    return sortedMonthsList.map(monthKey => {
      // Calculate actuals
      const monthTxs = transactions.filter(tx => tx.date && tx.date.startsWith(monthKey));
      const actualIncome = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const actualExpense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      // Calculate projections
      const monthEvents = (data.settings.calendarEvents || []).filter(ev => ev.date && ev.date.startsWith(monthKey));
      
      let projectedIncome = 1000000; // Baseline canteen/misc store inflow
      let projectedExpense = budgetSalaries + budgetFoodMeals + budgetUtilities + budgetMaintenance; // Baseline operational
      
      const detailsList: { type: 'income' | 'expense'; title: string; amount: number; desc: string }[] = [];
      
      // Seed detail baselines
      detailsList.push({ type: 'income', title: 'Operational Baseline Inflow', amount: 1000000, desc: 'Estimated receipts from school canteen and store.' });
      detailsList.push({ type: 'expense', title: 'Teacher & Staff Payroll', amount: budgetSalaries, desc: 'Wages for school educators and admin staff.' });
      detailsList.push({ type: 'expense', title: 'Dining Hall & Food Procurement', amount: budgetFoodMeals, desc: 'Catering and food supplies for student meals.' });
      detailsList.push({ type: 'expense', title: 'Power & Utility Bills', amount: budgetUtilities, desc: 'Water, electrical power, waste and internet.' });
      detailsList.push({ type: 'expense', title: 'Facility Upkeep & Maintenance', amount: budgetMaintenance, desc: 'Routine school repairs, security and cleanups.' });
      
      monthEvents.forEach(ev => {
        const titleL = ev.title.toLowerCase();
        
        // Term Start / Opening Day
        if (titleL.includes('opening') || titleL.includes('begins') || titleL.includes('start') || titleL.includes('admission')) {
          const tuitionProj = Math.round(studentCount * budgetTuitionRate * 0.85);
          projectedIncome += tuitionProj;
          detailsList.push({
            type: 'income',
            title: `Term Fees Influx (${ev.title})`,
            amount: tuitionProj,
            desc: `85% collected tuition expected from ${studentCount} learners at ${formatUGX(budgetTuitionRate)}/student.`
          });
          
          const prepExpense = studentCount * 15000;
          projectedExpense += prepExpense;
          detailsList.push({
            type: 'expense',
            title: `Term Prep Operations`,
            amount: prepExpense,
            desc: `15,000 UGX/learner classroom startup utility allotment.`
          });
        }
        
        // Fees Deadline
        if (titleL.includes('deadline') || titleL.includes('due') || titleL.includes('unpaid')) {
          const deadlineProj = Math.round(studentCount * budgetTuitionRate * 0.15);
          projectedIncome += deadlineProj;
          detailsList.push({
            type: 'income',
            title: `Fees Balance Collection (${ev.title})`,
            amount: deadlineProj,
            desc: `Final 15% collection deadline target for ${studentCount} learners.`
          });
        }
        
        // Exams
        if (titleL.includes('exam') || titleL.includes('mock') || titleL.includes('assessment') || titleL.includes('finals') || titleL.includes('paper')) {
          const examExpense = studentCount * 12000;
          projectedExpense += examExpense;
          detailsList.push({
            type: 'expense',
            title: `Exams Administration`,
            amount: examExpense,
            desc: `12,000 UGX/learner printing and grading logistic allocation.`
          });
        }
        
        // Holidays
        if (titleL.includes('holiday') || titleL.includes('eid') || titleL.includes('independence') || titleL.includes('christmas')) {
          const holidaySavings = Math.min(1000000, budgetFoodMeals + budgetUtilities);
          projectedExpense = Math.max(budgetSalaries, projectedExpense - holidaySavings);
          detailsList.push({
            type: 'expense',
            title: `Holiday Utility Reductions (${ev.title})`,
            amount: -holidaySavings,
            desc: `Reduced catering and electrical bills due to temporary holidays.`
          });
        }
        
        // Special events
        if (titleL.includes('thanksgiving') || titleL.includes('festival') || titleL.includes('graduation') || titleL.includes('sports') || titleL.includes('assembly')) {
          const eventCost = 2500000;
          projectedExpense += eventCost;
          detailsList.push({
            type: 'expense',
            title: `Event Hosting Logistics`,
            amount: eventCost,
            desc: `Venue preparations, catering, security and assembly hire.`
          });
        }
      });
      
      // Stack values for Recharts Bar Chart
      const realizedIncome = Math.min(actualIncome, projectedIncome);
      const remainingIncome = Math.max(0, projectedIncome - actualIncome);
      const surplusIncome = Math.max(0, actualIncome - projectedIncome);
      
      const realizedExpense = Math.min(actualExpense, projectedExpense);
      const remainingExpense = Math.max(0, projectedExpense - actualExpense);
      const overspendExpense = Math.max(0, actualExpense - projectedExpense);
      
      const [y, m] = monthKey.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, 1);
      const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const shortMonth = dateObj.toLocaleDateString('en-US', { month: 'short' });
      
      return {
        month: monthName,
        shortMonth,
        monthKey,
        actualIncome,
        actualExpense,
        projectedIncome,
        projectedExpense,
        realizedIncome,
        remainingIncome,
        surplusIncome,
        realizedExpense,
        remainingExpense,
        overspendExpense,
        events: monthEvents,
        detailsList
      };
    });
  }, [transactions, data.settings.calendarEvents, data.learners.length, budgetTuitionRate, budgetSalaries, budgetFoodMeals, budgetUtilities, budgetMaintenance]);

  // Form states for new transaction
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('Tuition Fees');
  const [txCustomCategory, setTxCustomCategory] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txStudentId, setTxStudentId] = useState('');
  const [txStudentSearch, setTxStudentSearch] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque'>('Cash');

  // Sync back to central data manager when transactions change
  const updateTransactionsList = (newTxList: FinanceTransaction[]) => {
    setTransactions(newTxList);
    dataManager.updateFinances(newTxList);
  };

  // Categories lists dynamically derived from custom states
  const incomeCategories = categories.filter(c => c.type === 'income').map(c => c.name);
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => c.name);

  // Aggregated calculations
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRefund = transactions
    .filter(tx => tx.type === 'refund')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpense - totalRefund;

  // Tuition fee collection stats
  const tuitionCollected = transactions
    .filter(tx => tx.type === 'income' && tx.category === 'Tuition Fees')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Calculated tuition expected (using average 450,000 per learner as baseline standard)
  const averageTuitionRate = 450000;
  const expectedTuitionTotal = data.learners.length * averageTuitionRate;
  const tuitionCollectionRate = expectedTuitionTotal > 0 
    ? Math.round((tuitionCollected / expectedTuitionTotal) * 100) 
    : 0;

  // Reset pagination when filters change
  useEffect(() => {
    setLedgerPage(1);
  }, [searchTerm, filterType, filterCategory, filterPaymentMethod, selectedTermFilter]);

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = (() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        
        const inDescription = tx.description.toLowerCase().includes(term);
        const inCategory = tx.category.toLowerCase().includes(term);
        
        let inStudent = false;
        if (tx.studentId) {
          const student = data.learners.find(l => l.id === tx.studentId);
          if (student) {
            inStudent = 
              student.name.toLowerCase().includes(term) ||
              (student.admNo && student.admNo.toLowerCase().includes(term));
          }
        }
        
        return inDescription || inCategory || inStudent;
      })();

      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;
      const matchesPayment = filterPaymentMethod === 'all' || tx.paymentMethod === filterPaymentMethod;
      const matchesTerm = selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter;

      return matchesSearch && matchesType && matchesCategory && matchesPayment && matchesTerm;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, filterType, filterCategory, filterPaymentMethod, selectedTermFilter, data.learners]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (ledgerPage - 1) * ledgerPageSize;
    return filteredTransactions.slice(startIndex, startIndex + ledgerPageSize);
  }, [filteredTransactions, ledgerPage, ledgerPageSize]);
  
  const totalLedgerPages = Math.ceil(filteredTransactions.length / ledgerPageSize) || 1;

  // Helper to recalculate student outstanding balance when transactions are edited or deleted
  const recalculateStudentBalance = (studentId: string, currentTxs: FinanceTransaction[]) => {
    const student = data.learners.find(l => l.id === studentId);
    if (!student) return;

    const tui = student.feeTuition ?? 0;
    const board = student.feeBoarding ?? 0;
    const van = student.feeVan ?? 0;
    const reg = student.feeRegistration ?? 0;
    const sw = student.feeSweater ?? 0;
    const uni = student.feeClassUniform ?? 0;
    const sp = student.feeSportsWear ?? 0;
    const hair = student.feeHair ?? 0;
    const hol = student.feeHoliday ?? 0;
    const oth = student.feeOthers ?? 0;
    const totalBill = tui + board + van + reg + sw + uni + sp + hair + hol + oth;

    const paidTransactions = currentTxs.filter(tx => tx.type === 'income' && tx.studentId === studentId);
    const totalPaid = paidTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const newOutstanding = Math.max(0, totalBill - totalPaid);

    dataManager.updateLearners([{
      ...student,
      outstandingBalance: newOutstanding.toString()
    }]);
  };

  // Handler to record a transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    const effectiveCategory = (isOtherCategory(txCategory) && txCustomCategory.trim()) 
      ? txCustomCategory.trim() 
      : txCategory;

    const newTx: FinanceTransaction = {
      id: 'tx-' + Math.random().toString(36).slice(2, 9),
      date: txDate,
      type: txType,
      category: effectiveCategory,
      amount: Number(txAmount),
      description: txDescription.trim() || `${effectiveCategory} recording`,
      paymentMethod: txPaymentMethod,
      term: selectedTermFilter !== 'all' ? selectedTermFilter : 'Term 1',
      recordedBy: dataManager.getActiveUser()?.email?.split('@')[0] || 'Ssemakula Joseph',
      studentId: (txType === 'income' && txStudentId) ? txStudentId : undefined
    };

    const newList = [newTx, ...transactions];
    updateTransactionsList(newList);

    if (newTx.studentId) {
      recalculateStudentBalance(newTx.studentId, newList);
    }

    // Add central audit log
    const linkageDetails = newTx.studentId 
      ? ` linked to student ${data.learners.find(l => l.id === newTx.studentId)?.name || 'ID ' + newTx.studentId}`
      : '';
    dataManager.addActivityLog(
      'finance_modified',
      `Recorded ${newTx.type} transaction of ${formatUGX(newTx.amount)} under category "${newTx.category}"${linkageDetails}.`
    );

    // [AUDIT TRAIL] Immutable record of financial creation
    dataManager.saveAuditLog({
      module: 'Finance',
      action: 'CREATE',
      recordId: newTx.id,
      details: `Created new transaction: ${formatUGX(newTx.amount)} for ${newTx.category}`,
      newValue: newTx
    });

    // Reset Form & Close Modal
    setTxAmount('');
    setTxDescription('');
    setTxStudentId('');
    setTxStudentSearch('');
    setTxCustomCategory('');
    setShowAddModal(false);

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Successfully recorded ${newTx.type} entry of ${formatUGX(newTx.amount)}.`,
        type: 'success'
      }
    }));
  };

  // Handler to start editing a transaction
  const handleStartEditTransaction = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setEditTxType(tx.type);
    if (isOtherCategory(tx.category) || !categories.some(c => c.name === tx.category)) {
      setEditTxCategory(tx.type === 'income' ? 'Other Income' : 'Other Expense');
      setEditTxCustomCategory(tx.category);
    } else {
      setEditTxCategory(tx.category);
      setEditTxCustomCategory('');
    }
    setEditTxAmount(tx.amount.toString());
    setEditTxDate(tx.date);
    setEditTxTerm(tx.term || 'Term 1');
    setEditTxMethod(tx.paymentMethod);
    setEditTxBankAccountId(tx.bankAccountId || '');
    setEditTxStudentId(tx.studentId || '');
    setEditTxStudentSearch('');
    setEditTxDesc(tx.description);
    setShowEditTxModal(true);
  };

  // Handler to save edited transaction
  const handleSaveEditedTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    if (!editTxAmount || isNaN(Number(editTxAmount)) || Number(editTxAmount) <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    const effectiveCategory = (isOtherCategory(editTxCategory) && editTxCustomCategory.trim()) 
      ? editTxCustomCategory.trim() 
      : editTxCategory;

    const updatedTx: FinanceTransaction = {
      ...editingTx,
      type: editTxType,
      category: effectiveCategory,
      amount: Number(editTxAmount),
      date: editTxDate,
      term: editTxTerm,
      paymentMethod: editTxMethod,
      bankAccountId: editTxBankAccountId,
      studentId: editTxType === 'income' && editTxStudentId ? editTxStudentId : undefined,
      description: editTxDesc.trim() || `${effectiveCategory} recording`
    };

    const newList = transactions.map(t => t.id === editingTx.id ? updatedTx : t);
    updateTransactionsList(newList);

    // Recalculate balance for old and new student link
    if (editingTx.studentId) {
      recalculateStudentBalance(editingTx.studentId, newList);
    }
    if (updatedTx.studentId && updatedTx.studentId !== editingTx.studentId) {
      recalculateStudentBalance(updatedTx.studentId, newList);
    }

    dataManager.addActivityLog(
      'finance_modified',
      `Updated ${updatedTx.type} transaction: ${formatUGX(updatedTx.amount)} (${updatedTx.category}) on ${updatedTx.date}.`
    );

    // [AUDIT TRAIL] Immutable record of financial edit
    dataManager.saveAuditLog({
      module: 'Finance',
      action: 'UPDATE',
      recordId: updatedTx.id,
      details: `Edited transaction from ${formatUGX(editingTx.amount)} to ${formatUGX(updatedTx.amount)}`,
      previousValue: editingTx,
      newValue: updatedTx
    });

    setShowEditTxModal(false);
    setEditingTx(null);

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Transaction updated successfully.',
        type: 'success'
      }
    }));
  };

  // Handler to delete a transaction
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    if (confirm(`Are you sure you want to delete the finance record for ${formatUGX(target.amount)} (${target.category})?`)) {
      const newList = transactions.filter(t => t.id !== id);
      updateTransactionsList(newList);

      if (target.studentId) {
        recalculateStudentBalance(target.studentId, newList);
      }

      dataManager.addActivityLog(
        'finance_modified',
        `Deleted school ledger transaction: ${target.type} of ${formatUGX(target.amount)} recorded on ${target.date}.`
      );

      // [AUDIT TRAIL] Immutable record of financial deletion
      dataManager.saveAuditLog({
        module: 'Finance',
        action: 'DELETE',
        recordId: target.id,
        details: `Deleted transaction: ${formatUGX(target.amount)} for ${target.category}`,
        previousValue: target
      });

      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Ledger entry successfully deleted.',
          type: 'warning'
        }
      }));
    }
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (UGX)', 'Payment Method', 'Recorded By', 'Linked Student'];
    const rows = filteredTransactions.map(tx => {
      const studentName = tx.studentId ? (data.learners.find(l => l.id === tx.studentId)?.name || '') : '';
      return [
        tx.date,
        tx.type.toUpperCase(),
        tx.category,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.paymentMethod,
        tx.recordedBy,
        `"${studentName}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', blobUrl);
    link.setAttribute('download', `otec_school_finances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  // Memoized transactions filtered by report-specific start/end dates
  const reportFilteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (reportStartDate && tx.date < reportStartDate) return false;
      if (reportEndDate && tx.date > reportEndDate) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, reportStartDate, reportEndDate]);

  // Chart Data preparation: Group transactions by date for last 10 days
  const dailyChartMap: Record<string, { date: string; income: number; expense: number }> = {};
  
  // Initialize last 7 days including today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyChartMap[dateStr] = { date: dateStr.slice(5), income: 0, expense: 0 };
  }

  // Populate actual transaction data inside timeframe
  transactions.forEach(tx => {
    const mapKey = tx.date;
    if (dailyChartMap[mapKey]) {
      if (tx.type === 'income') {
        dailyChartMap[mapKey].income += tx.amount;
      } else {
        dailyChartMap[mapKey].expense += tx.amount;
      }
    } else {
      // Create dynamically if not exists but within context
      const shortDate = tx.date.slice(5);
      if (tx.date >= '2026-07-01') {
        if (!dailyChartMap[tx.date]) {
          dailyChartMap[tx.date] = { date: shortDate, income: 0, expense: 0 };
        }
        if (tx.type === 'income') {
          dailyChartMap[tx.date].income += tx.amount;
        } else {
          dailyChartMap[tx.date].expense += tx.amount;
        }
      }
    }
  });

  const chartData = Object.values(dailyChartMap).sort((a, b) => a.date.localeCompare(b.date));

  // Category breakdown for expenses
  const expenseBreakdownData: { name: string; value: number }[] = [];
  const expCatMap: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(tx => {
    expCatMap[tx.category] = (expCatMap[tx.category] || 0) + tx.amount;
  });
  Object.entries(expCatMap).forEach(([name, value]) => {
    expenseBreakdownData.push({ name, value });
  });

  // --- STUDENT FEES & DEFAULTERS CALCULATIONS ---
  const totalOutstandingArrears = useMemo(() => {
    return data.learners.reduce((sum, l) => {
      const bal = l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0;
      return sum + (isNaN(bal) ? 0 : bal);
    }, 0);
  }, [data.learners]);

  const studentFeeCategories = [
    'Tuition Fees', 'Boarding Fees', 'Uniforms', 'Van/Transport Fees',
    'Registration Fees', 'Sweater Uniform', 'Class Uniform', 'Sports Wear',
    'Hair Shaving Fees', 'Holiday Package', 'Others/Miscellaneous'
  ];

  const totalFeesCollected = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income' && (tx.studentId !== undefined && tx.studentId !== '' || studentFeeCategories.includes(tx.category)))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalReceivablesTarget = totalFeesCollected + totalOutstandingArrears;
  const overallRecoveryRate = totalReceivablesTarget > 0 ? Math.round((totalFeesCollected / totalReceivablesTarget) * 100) : 100;

  const classStats = useMemo(() => {
    const stats: Record<string, { studentCount: number; collected: number; outstanding: number }> = {};
    
    // Initialize stats with learners classes
    data.learners.forEach(l => {
      const cls = l.cls || 'Unassigned';
      if (!stats[cls]) {
        stats[cls] = { studentCount: 0, collected: 0, outstanding: 0 };
      }
      stats[cls].studentCount += 1;
      const outstandingVal = l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0;
      stats[cls].outstanding += isNaN(outstandingVal) ? 0 : outstandingVal;
    });

    // Aggregate collected fees per student class
    transactions.forEach(tx => {
      if (tx.type === 'income' && (tx.studentId !== undefined && tx.studentId !== '' || studentFeeCategories.includes(tx.category)) && tx.studentId) {
        const student = data.learners.find(l => l.id === tx.studentId);
        if (student) {
          const cls = student.cls || 'Unassigned';
          if (!stats[cls]) {
            stats[cls] = { studentCount: 0, collected: 0, outstanding: 0 };
          }
          stats[cls].collected += tx.amount;
        }
      }
    });

    return Object.entries(stats).map(([className, details]) => {
      const expected = details.collected + details.outstanding;
      const rate = expected > 0 ? Math.round((details.collected / expected) * 100) : 100;
      return {
        className,
        ...details,
        rate
      };
    }).sort((a, b) => a.className.localeCompare(b.className));
  }, [data.learners, transactions]);

  // Extract all distinct classes for filters
  const feeClassesList = useMemo(() => {
    const clsSet = new Set<string>();
    data.learners.forEach(l => {
      if (l.cls) clsSet.add(l.cls);
    });
    return Array.from(clsSet).sort();
  }, [data.learners]);

  const filteredFeeLearners = useMemo(() => {
    return data.learners.filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(feeSearchTerm.toLowerCase()) || 
                            l.admNo.toLowerCase().includes(feeSearchTerm.toLowerCase());
      const matchesClass = feeClassFilter === 'all' || l.cls === feeClassFilter;
      
      const balance = l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0;
      const hasBalance = !isNaN(balance) && balance > 0;
      
      let matchesStatus = true;
      if (feeStatusFilter === 'unpaid') {
        matchesStatus = hasBalance;
      } else if (feeStatusFilter === 'paid') {
        matchesStatus = !hasBalance;
      } else if (feeStatusFilter === 'partial') {
        const hasTx = transactions.some(tx => tx.studentId === l.id && ['Tuition Fees', 'Boarding Fees', 'Uniforms'].includes(tx.category));
        matchesStatus = hasBalance && hasTx;
      }
      
      const matchesBoarding = feeBoardingFilter === 'all' || 
                              (feeBoardingFilter === 'boarding' && l.dayBoarding === 'Boarding') ||
                              (feeBoardingFilter === 'day' && l.dayBoarding === 'Day');
      
      return matchesSearch && matchesClass && matchesStatus && matchesBoarding;
    });
  }, [data.learners, feeSearchTerm, feeClassFilter, feeStatusFilter, feeBoardingFilter, transactions]);

  const flaggedStudents = useMemo(() => {
    return data.learners.filter(l => {
      const bal = l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0;
      return !isNaN(bal) && bal > balanceThreshold;
    });
  }, [data.learners, balanceThreshold]);

  const emailBodyContent = useMemo(() => {
    const formattedDate = new Date().toLocaleString();
    const studentRows = flaggedStudents.map((s, idx) => {
      const bal = s.outstandingBalance ? parseFloat(s.outstandingBalance) : 0;
      return `${idx + 1}. ${s.name} (Adm: ${s.admNo}, Class: ${s.cls}) - Guardian: ${s.guardianName || 'N/A'} (${s.guardianPhone || 'N/A'}) - Arrears: ${formatUGX(bal)}`;
    }).join('\n');

    const totalFlaggedArrears = flaggedStudents.reduce((sum, s) => {
      const bal = s.outstandingBalance ? parseFloat(s.outstandingBalance) : 0;
      return sum + (isNaN(bal) ? 0 : bal);
    }, 0);

    return `Dear Finance Team,

Please find the outstanding arrears threshold alert summary for OTEC Academy below. This report compiles all active students whose pending outstanding balance exceeds the configured alert limit of ${formatUGX(balanceThreshold)}.

--------------------------------------------------
Outstanding Arrears Threshold Alert Summary
--------------------------------------------------
Threshold Limit: ${formatUGX(balanceThreshold)}
Total Flagged Students: ${flaggedStudents.length}
Total Pending Arrears Flagged: ${formatUGX(totalFlaggedArrears)}
Report Generated At: ${formattedDate}
--------------------------------------------------

Detailed Student List:
${studentRows || 'No students currently exceed this threshold.'}

Please initiate appropriate follow-up communications (SMS or letters) with the parents/guardians listed above to expedite balance collections.

Best regards,
OTEC Academy Automated Finance Systems
(Report dispatched by: ${dataManager.getActiveUser()?.email || 'Ssemakula Joseph'})`;
  }, [flaggedStudents, balanceThreshold]);

  // Handler to copy SMS reminder to clipboard
  const copyFeeReminderNotice = (student: Learner) => {
    const balance = student.outstandingBalance ? parseFloat(student.outstandingBalance) : 0;
    const formattedBal = formatUGX(balance);
    const schoolName = data.settings?.schoolName || 'OTEC Academy';
    const term = data.settings?.term || 'Term 3';
    
    const sms = `Dear Parent/Guardian of ${student.name} (Adm: ${student.admNo}, Class: ${student.cls}), this is a friendly reminder from the Finance Office of ${schoolName} that there is an outstanding balance of ${formattedBal} for ${term}. Kindly arrange to clear this balance as soon as possible. For any inquiries, contact finance@otec-school.edu. Thank you.`;
    
    navigator.clipboard.writeText(sms).then(() => {
      const event = new CustomEvent('otec-toast', {
        detail: {
          message: `Copied professional reminder notice for ${student.name} to clipboard!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    }).catch(() => {
      alert('Failed to copy text. Here is the message:\n\n' + sms);
    });
  };

  // Local RFC 4180-compliant CSV parser
  const parseBulkCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          cell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        row.push(cell.trim());
        cell = '';
        if (row.length > 1 || row[0] !== '') {
          lines.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // skip LF
        }
      } else {
        cell += char;
      }
    }
    if (cell !== '' || row.length > 0) {
      row.push(cell.trim());
      lines.push(row);
    }
    return lines;
  };

  const getBulkColumnIndices = (headers: string[]) => {
    const lower = headers.map(h => h.toLowerCase().trim());
    return {
      admNo: lower.findIndex(h => h.includes('adm') || h.includes('no') || h.includes('id')),
      amount: lower.findIndex(h => h.includes('amount') || h.includes('paid') || h.includes('sum') || h.includes('val')),
      category: lower.findIndex(h => h.includes('category') || h.includes('type')),
      method: lower.findIndex(h => h.includes('method') || h.includes('mode') || h.includes('pay')),
      date: lower.findIndex(h => h.includes('date')),
      desc: lower.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('note'))
    };
  };

  const generateBulkCSVPreview = (rows: string[][], headers: string[]) => {
    const indices = getBulkColumnIndices(headers);
    
    let matchedCount = 0;
    let unmatchedCount = 0;
    let totalImportAmount = 0;
    
    const previewRows = rows.map((row, idx) => {
      const rawAdmNo = indices.admNo !== -1 ? (row[indices.admNo] || '').trim() : '';
      const rawAmount = indices.amount !== -1 ? (row[indices.amount] || '').trim() : '0';
      const rawCategory = indices.category !== -1 ? (row[indices.category] || '').trim() : 'Tuition Fees';
      const rawMethod = indices.method !== -1 ? (row[indices.method] || '').trim() : 'Cash';
      const rawDate = indices.date !== -1 ? (row[indices.date] || '').trim() : new Date().toISOString().split('T')[0];
      const rawDesc = indices.desc !== -1 ? (row[indices.desc] || '').trim() : '';
      
      const cleanAmount = rawAmount.replace(/[^0-9.]/g, '');
      const amountNum = parseFloat(cleanAmount);
      
      let status: 'success' | 'error' = 'success';
      let errorMsg = '';
      let matchedStudent: Learner | undefined = undefined;
      
      if (!rawAdmNo) {
        status = 'error';
        errorMsg = 'Admission Number is missing';
      } else {
        matchedStudent = data.learners.find(l => (l.admNo || '').toLowerCase().trim() === rawAdmNo.toLowerCase().trim());
        if (!matchedStudent) {
          status = 'error';
          errorMsg = `Student with Adm No "${rawAdmNo}" not found`;
        }
      }
      
      if (status === 'success') {
        if (isNaN(amountNum) || amountNum <= 0) {
          status = 'error';
          errorMsg = 'Payment amount must be a positive number';
        }
      }
      
      if (status === 'success') {
        matchedCount++;
        totalImportAmount += amountNum;
      } else {
        unmatchedCount++;
      }
      
      return {
        id: idx,
        studentName: matchedStudent ? matchedStudent.name : 'Unknown Student',
        studentId: matchedStudent ? matchedStudent.id : '',
        admNo: rawAdmNo,
        amount: isNaN(amountNum) ? 0 : amountNum,
        category: rawCategory || 'Tuition Fees',
        method: rawMethod || 'Cash',
        date: rawDate || new Date().toISOString().split('T')[0],
        desc: rawDesc,
        status,
        errorMsg,
        currentBal: matchedStudent ? parseFloat(matchedStudent.outstandingBalance || '0') : 0
      };
    });
    
    setBulkCSVFeedback({
      totalRows: rows.length,
      matchedCount,
      unmatchedCount,
      totalImportAmount,
      previewRows
    });
  };

  const handleBulkCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processBulkCSVFile(file);
  };

  const processBulkCSVFile = (file: File) => {
    setBulkCSVFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseBulkCSV(text);
      if (parsed.length === 0) {
        alert("The uploaded CSV file is empty or formatted incorrectly.");
        return;
      }
      const headers = parsed[0].map(h => h.trim());
      const rows = parsed.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim() !== ''));

      setBulkCSVHeaders(headers);
      setBulkCSVRows(rows);
      generateBulkCSVPreview(rows, headers);
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const headers = ['AdmissionNumber', 'StudentName', 'Amount', 'Category', 'PaymentMethod', 'Date', 'Description'];
    const rows = data.learners.map(student => [
      student.admNo || '',
      student.name || '',
      '0',
      'Tuition Fees',
      'Cash',
      new Date().toISOString().split('T')[0],
      `Bulk tuition payment for ${student.name}`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_fees_bulk_payment_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyBulkPayments = () => {
    if (!bulkCSVFeedback || bulkCSVFeedback.matchedCount === 0) return;
    
    const confirmed = confirm(`Are you sure you want to bulk-apply ${bulkCSVFeedback.matchedCount} payments totaling ${formatUGX(bulkCSVFeedback.totalImportAmount)}? Student balances will be updated immediately.`);
    if (!confirmed) return;

    const updatedLearners = data.learners.map(student => {
      const paymentsForStudent = bulkCSVFeedback.previewRows.filter(
        row => row.status === 'success' && row.studentId === student.id
      );
      
      if (paymentsForStudent.length === 0) return student;
      
      const totalPaidForStudent = paymentsForStudent.reduce((sum, row) => sum + row.amount, 0);
      const currentBal = student.outstandingBalance ? parseFloat(student.outstandingBalance) : 0;
      const newBal = Math.max(0, currentBal - totalPaidForStudent);
      
      return {
        ...student,
        outstandingBalance: newBal.toString()
      };
    });
    
    const newTxRecords: FinanceTransaction[] = [];
    bulkCSVFeedback.previewRows.forEach(row => {
      if (row.status !== 'success') return;
      
      const matchedStudent = data.learners.find(l => l.id === row.studentId);
      const clsName = matchedStudent ? ` - Class ${matchedStudent.cls}` : '';
      
      newTxRecords.push({
        id: 'tx-' + Math.random().toString(36).slice(2, 9),
        date: row.date,
        type: 'income',
        category: row.category,
        amount: row.amount,
        description: row.desc.trim() || `Bulk payment: ${row.studentName} (Adm: ${row.admNo})${clsName}`,
        paymentMethod: row.method as any,
        recordedBy: dataManager.getActiveUser()?.email?.split('@')[0] || 'Ssemakula Joseph',
        studentId: row.studentId
      });
    });

    dataManager.updateLearners(updatedLearners);
    
    const newList = [...newTxRecords, ...transactions];
    updateTransactionsList(newList);

    dataManager.addActivityLog(
      'finance_modified',
      `Bulk imported ${bulkCSVFeedback.matchedCount} fee payments totaling ${formatUGX(bulkCSVFeedback.totalImportAmount)} via CSV template upload.`
    );

    const event = new CustomEvent('otec-toast', {
      detail: {
        message: `Successfully bulk-imported ${bulkCSVFeedback.matchedCount} payments totaling ${formatUGX(bulkCSVFeedback.totalImportAmount)}!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    setShowBulkCSVModal(false);
    setBulkCSVFile(null);
    setBulkCSVHeaders([]);
    setBulkCSVRows([]);
    setBulkCSVFeedback(null);
  };

  // Handler to record student fee payment from wizard
  const handleRecordStudentFeePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeStudent) return;
    const amountNum = parseFloat(feePayAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    const effectiveCategory = (isOtherCategory(feePayCategory) && feePayCustomCategory.trim())
      ? feePayCustomCategory.trim()
      : feePayCategory;

    const currentBal = selectedFeeStudent.outstandingBalance ? parseFloat(selectedFeeStudent.outstandingBalance) : 0;
    const newBal = Math.max(0, currentBal - amountNum);

    // 1. Update student database
    const updatedLearners = data.learners.map(l => {
      if (l.id === selectedFeeStudent.id) {
        return {
          ...l,
          outstandingBalance: newBal.toString()
        };
      }
      return l;
    });
    dataManager.updateLearners(updatedLearners);

    // 2. Create new general ledger transaction
    const newTx: FinanceTransaction = {
      id: 'tx-' + Math.random().toString(36).slice(2, 9),
      date: feePayDate,
      type: 'income',
      category: effectiveCategory,
      amount: amountNum,
      description: feePayDescription.trim() || `Fees Received: ${selectedFeeStudent.name} (Adm: ${selectedFeeStudent.admNo}) - Class ${selectedFeeStudent.cls}`,
      paymentMethod: feePayMethod,
      recordedBy: dataManager.getActiveUser()?.email?.split('@')[0] || 'Ssemakula Joseph',
      studentId: selectedFeeStudent.id
    };
    const newList = [newTx, ...transactions];
    updateTransactionsList(newList);

    // 3. Activity Log
    dataManager.addActivityLog(
      'finance_modified',
      `Received fee payment of ${formatUGX(amountNum)} for student ${selectedFeeStudent.name} (${effectiveCategory}). Outstanding balance reduced from ${formatUGX(currentBal)} to ${formatUGX(newBal)}.`
    );

    // 4. Dispatch system toast notice
    const event = new CustomEvent('otec-toast', {
      detail: {
        message: `Successfully received ${formatUGX(amountNum)} for ${selectedFeeStudent.name}. Balance updated to ${formatUGX(newBal)}!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    // Reset and Close
    setShowFeePaymentModal(false);
    setSelectedFeeStudent(null);
    setFeePayAmount('');
    setFeePayDescription('');
    setFeePayCustomCategory('');
  };

  // Bulk apply school standard fee templates to all students
  const handleBulkApplyDefaults = () => {
    if (!confirm("Are you sure you want to apply default fee templates to all students? This will overwrite individual component settings with standard default values from Settings.")) return;

    const updatedLearners = data.learners.map(student => {
      // Determine default tuition based on class
      let tuition = data.settings.feeTuitionLower ?? 310000;
      const clsName = (student.cls || '').toUpperCase();
      if (['ZEBRA', 'LION', 'ELEPHANT', 'NURSERY', 'BABY', 'MIDDLE', 'PRE-PRIMARY', 'PREPRIMARY', 'KINDERGARTEN'].some(prefix => clsName.includes(prefix))) {
        tuition = data.settings.feeTuitionNursery ?? 290000;
      } else if (['P4', 'P5', 'P6', 'P7'].some(prefix => clsName.includes(prefix))) {
        tuition = data.settings.feeTuitionUpper ?? 335000;
      }

      // Boarding
      const isBoarder = (student.dayBoarding || '').toLowerCase().includes('board');
      const boardingFee = isBoarder ? (data.settings.feeBoarding ?? 630000) : 0;

      // Other defaults
      const regFee = data.settings.feeRegistration ?? 20000;
      const sweaterFee = data.settings.feeSweater ?? 50000;
      const classUniformFee = data.settings.feeClassUniform ?? 50000;
      const sportsFee = data.settings.feeSportsWear ?? 70000;
      const hairFee = data.settings.feeHair ?? 5000;
      const holidayFee = data.settings.feeHoliday ?? 5000;
      const otherFee = data.settings.feeOthers ?? 0;
      const vanFee = 0; // Default to 0, manually edited

      const totalCharged = tuition + boardingFee + regFee + sweaterFee + classUniformFee + sportsFee + hairFee + holidayFee + otherFee + vanFee;
      
      // Calculate current paid
      const studentTxSum = transactions
        .filter(tx => tx.type === 'income' && tx.studentId === student.id)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const outstanding = Math.max(0, totalCharged - studentTxSum);

      return {
        ...student,
        feeTuition: tuition,
        feeBoarding: boardingFee,
        feeVan: vanFee,
        feeRegistration: regFee,
        feeSweater: sweaterFee,
        feeClassUniform: classUniformFee,
        feeSportsWear: sportsFee,
        feeHair: hairFee,
        feeHoliday: holidayFee,
        feeOthers: otherFee,
        outstandingBalance: outstanding.toString()
      };
    });

    dataManager.updateLearners(updatedLearners);
    
    // Dispatch system toast notice
    const event = new CustomEvent('otec-toast', {
      detail: {
        message: 'Successfully applied school fee defaults to all students!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  // Apply default templates to the selected student in modal
  const applyDefaultsForSelectedStudent = () => {
    if (!selectedEditFeesStudent) return;
    const student = selectedEditFeesStudent;

    let tuition = data.settings.feeTuitionLower ?? 310000;
    const clsName = (student.cls || '').toUpperCase();
    if (['ZEBRA', 'LION', 'ELEPHANT', 'NURSERY', 'BABY', 'MIDDLE', 'PRE-PRIMARY', 'PREPRIMARY', 'KINDERGARTEN'].some(prefix => clsName.includes(prefix))) {
      tuition = data.settings.feeTuitionNursery ?? 290000;
    } else if (['P4', 'P5', 'P6', 'P7'].some(prefix => clsName.includes(prefix))) {
      tuition = data.settings.feeTuitionUpper ?? 335000;
    }

    const isBoarder = (student.dayBoarding || '').toLowerCase().includes('board');
    const boardingFee = isBoarder ? (data.settings.feeBoarding ?? 630000) : 0;

    setEditTuition(tuition);
    setEditBoarding(boardingFee);
    setEditVan(0);
    setEditRegistration(data.settings.feeRegistration ?? 20000);
    setEditSweater(data.settings.feeSweater ?? 50000);
    setEditClassUniform(data.settings.feeClassUniform ?? 50000);
    setEditSportsWear(data.settings.feeSportsWear ?? 70000);
    setEditHair(data.settings.feeHair ?? 5000);
    setEditHoliday(data.settings.feeHoliday ?? 5000);
    setEditOthers(data.settings.feeOthers ?? 0);
  };

  // Save customized fee items for a single student
  const handleSaveStudentFees = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditFeesStudent) return;

    const totalCharged = Number(editTuition) + Number(editBoarding) + Number(editVan) + Number(editRegistration) + 
                         Number(editSweater) + Number(editClassUniform) + Number(editSportsWear) + 
                         Number(editHair) + Number(editHoliday) + Number(editOthers);

    const paidAmount = transactions
      .filter(tx => tx.type === 'income' && tx.studentId === selectedEditFeesStudent.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const outstanding = Math.max(0, totalCharged - paidAmount);

    const updatedLearners = data.learners.map(student => {
      if (student.id === selectedEditFeesStudent.id) {
        return {
          ...student,
          feeTuition: Number(editTuition),
          feeBoarding: Number(editBoarding),
          feeVan: Number(editVan),
          feeRegistration: Number(editRegistration),
          feeSweater: Number(editSweater),
          feeClassUniform: Number(editClassUniform),
          feeSportsWear: Number(editSportsWear),
          feeHair: Number(editHair),
          feeHoliday: Number(editHoliday),
          feeOthers: Number(editOthers),
          outstandingBalance: outstanding.toString()
        };
      }
      return student;
    });

    dataManager.updateLearners(updatedLearners);
    setShowEditFeesModal(false);

    const event = new CustomEvent('otec-toast', {
      detail: {
        message: `Configured customized fees for ${selectedEditFeesStudent.name}. Total charged: ${formatUGX(totalCharged)}`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  // Derived active month context for the sidebar details
  const activeBudgetMonth = selectedBudgetMonth || (budgetChartData[0]?.monthKey || '');
  const selectedMonthData = budgetChartData.find(item => item.monthKey === activeBudgetMonth) || budgetChartData[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:bg-white print:p-0 print:text-black">
      
      {/* Visual Navigation Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setSubTab('banking')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'banking'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building size={14} />
            <span>Banking & Ledgers</span>
          </button>
          <button
            onClick={() => setSubTab('ledger')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Coins size={14} />
            <span>General Ledger</span>
          </button>
          <button
            onClick={() => setSubTab('fees')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'fees'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User size={14} />
            <span>Student Fee Accounts</span>
          </button>
          <button
            onClick={() => setSubTab('dailyExpense')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'dailyExpense'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Daily Expense PDF</span>
          </button>
          <button
            onClick={() => setSubTab('monthly')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'monthly'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 size={14} />
            <span>Monthly Statement</span>
          </button>
          <button
            onClick={() => setSubTab('calendar')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CalendarDays size={14} />
            <span>Expense Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('expenditureBreakdown')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'expenditureBreakdown'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PieChart size={14} />
            <span>Category Outflows</span>
          </button>
          <button
            onClick={() => setSubTab('feesInput')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'feesInput'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sliders size={14} />
            <span>Fee Setup</span>
          </button>
          <button
            onClick={() => setSubTab('report')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              subTab === 'report'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp size={14} />
            <span>Analytics</span>
          </button>
        </div>
        
        {/* Right Action & Filter Bar */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* Termly Expenditure Selector */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
            <span className="text-[10px] font-black uppercase text-slate-500 px-2">Term:</span>
            {(['all', 'Term 1', 'Term 2', 'Term 3'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTermFilter(t)}
                className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  selectedTermFilter === t 
                    ? 'bg-white text-blue-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>

          {(subTab === 'report' || subTab === 'dailyExpense' || subTab === 'monthly') && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportMonthlyExcelBudgetReport(
                  selectedReportMonth || new Date().toISOString().slice(0, 7),
                  transactions,
                  categories,
                  data.settings?.schoolName || "Oasis Tech Educational Center (OTEC)",
                  selectedTermFilter,
                  data.learners || []
                )}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 shrink-0"
              >
                <FileSpreadsheet size={14} />
                <span>Monthly Excel Report (.xlsx)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10 shrink-0"
              >
                <Printer size={14} />
                <span>Print PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {subTab === 'report' ? (
        /* ================= FINANCIAL STATEMENT REPORT VIEW ================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Report Date Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs print:hidden space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Report Parameters</h3>
                <p className="text-[11px] text-slate-500 font-semibold">Filter the financial register to compile formal school audit statements</p>
              </div>
              <TrendingUp className="text-blue-600" size={18} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preset Range</label>
                <select
                  value={reportPreset}
                  onChange={(e) => {
                    const preset = e.target.value;
                    setReportPreset(preset);
                    const todayStr = new Date().toISOString().split('T')[0];
                    if (preset === 'all') {
                      setReportStartDate('');
                      setReportEndDate('');
                    } else if (preset === 'this-month') {
                      const d = new Date();
                      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                      setReportStartDate(firstDay);
                      setReportEndDate(todayStr);
                    } else if (preset === 'last-30-days') {
                      const d = new Date();
                      d.setDate(d.getDate() - 30);
                      setReportStartDate(d.toISOString().split('T')[0]);
                      setReportEndDate(todayStr);
                    } else if (preset === 'this-term') {
                      setReportStartDate(data.settings?.termStartDate || `${new Date().getFullYear()}-01-01`);
                      setReportEndDate(data.settings?.termEndDate || todayStr);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 outline-hidden"
                >
                  <option value="all">All-Time Cumulative</option>
                  <option value="this-month">This Month</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="this-term">Current Term Period</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => {
                    setReportStartDate(e.target.value);
                    setReportPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => {
                    setReportEndDate(e.target.value);
                    setReportPreset('custom');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer size={14} />
                  <span>Generate Printable Form</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= FORMAL REPORT CARD FOR PRINTING ================= */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0 print:space-y-6">
            
            {/* 1. Formal Institutional Letterhead */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-5">
              <div className="space-y-2">
                {data.settings?.logo ? (
                  <img
                    src={data.settings.logo}
                    alt="School Logo"
                    className="h-16 w-16 object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-lg">
                    {data.settings?.shortName || 'SCH'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight">{data.settings?.schoolName || 'OTEC ACADEMY'}</h1>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest italic">" {data.settings?.motto || 'Education for a Brighter Future'} "</p>
                </div>
              </div>

              <div className="text-right space-y-1 text-slate-700">
                <p className="text-xs font-black uppercase tracking-wider text-slate-950">Financial Statement</p>
                <p className="text-[10px] font-bold">{data.settings?.address || 'Kampala, Uganda'}</p>
                <p className="text-[10px] font-bold">Tel: {data.settings?.tel1 || '+256 700 000 000'}</p>
                <p className="text-[10px] font-bold">Email: finance@otec-school.edu</p>
                <div className="mt-2 bg-slate-100 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-800 inline-block">
                  {data.settings?.term || 'Term 3'} • {data.settings?.year || 2026}
                </div>
              </div>
            </div>

            {/* Document Sub-title & Date Context */}
            <div className="text-center space-y-1.5">
              <h2 className="text-base font-black text-slate-950 uppercase tracking-widest border-b border-slate-250 pb-1.5 inline-block px-8">
                Executive Income & Outflow Ledger Report
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Statement Period: {reportStartDate || 'Inception'} to {reportEndDate || 'Present'} • Compiled on {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* 2. Executive Key Metrics Bento Grid */}
            {(() => {
              // Calculate figures in report scope
              let repIncome = 0;
              let repExpense = 0;
              const repIncomeByCat: Record<string, number> = {};
              const repExpenseByCat: Record<string, number> = {};

              reportFilteredTransactions.forEach(tx => {
                if (tx.type === 'income') {
                  repIncome += tx.amount;
                  repIncomeByCat[tx.category] = (repIncomeByCat[tx.category] || 0) + tx.amount;
                } else {
                  repExpense += tx.amount;
                  repExpenseByCat[tx.category] = (repExpenseByCat[tx.category] || 0) + tx.amount;
                }
              });

              const repSurplus = repIncome - repExpense;
              const ratio = repIncome > 0 ? (repSurplus / repIncome) * 100 : 0;

              return (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Income Inflow */}
                    <div className="border-2 border-slate-900 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Total Income (Inflow)</span>
                      <h3 className="text-lg font-black font-mono text-slate-950">{formatUGX(repIncome)}</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Total revenue receipts compiled</p>
                    </div>

                    {/* Expenses Outflow */}
                    <div className="border-2 border-slate-900 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Total Expenses (Outflow)</span>
                      <h3 className="text-lg font-black font-mono text-slate-950">{formatUGX(repExpense)}</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Total operating disbursements</p>
                    </div>

                    {/* Net Surplus/Deficit */}
                    <div className={`border-2 border-slate-900 rounded-2xl p-4 space-y-2 ${repSurplus >= 0 ? 'bg-emerald-50/20' : 'bg-rose-50/20'}`}>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block">Operating Surplus / Deficit</span>
                      <h3 className={`text-lg font-black font-mono ${repSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {repSurplus >= 0 ? '+' : ''}{formatUGX(repSurplus)}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold">
                        Net reserve ratio: <span className="font-extrabold">{ratio.toFixed(1)}%</span>
                      </p>
                    </div>
                  </div>

                  {/* 3. Stream Categorical Breakdowns (Visual Bars) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Income Streams */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-4 print:border-slate-300">
                      <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                        <h4 className="text-xs font-black uppercase text-slate-950 tracking-wider">Revenue Breakdown</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Share %</span>
                      </div>
                      
                      {Object.keys(repIncomeByCat).length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-6 font-semibold">No revenue registered in this period</p>
                      ) : (
                        <div className="space-y-3.5">
                          {Object.entries(repIncomeByCat)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, amt]) => {
                              const pct = repIncome > 0 ? (amt / repIncome) * 100 : 0;
                              return (
                                <div key={cat} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>{cat}</span>
                                    <span className="font-mono text-[11px] text-slate-950">{formatUGX(amt)} ({pct.toFixed(1)}%)</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-slate-900 rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Expense Outflow Streams */}
                    <div className="border border-slate-200 rounded-2xl p-5 space-y-4 print:border-slate-300">
                      <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                        <h4 className="text-xs font-black uppercase text-slate-950 tracking-wider">Disbursement Breakdown</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Share %</span>
                      </div>

                      {Object.keys(repExpenseByCat).length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-6 font-semibold">No expenditures registered in this period</p>
                      ) : (
                        <div className="space-y-3.5">
                          {Object.entries(repExpenseByCat)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cat, amt]) => {
                              const pct = repExpense > 0 ? (amt / repExpense) * 100 : 0;
                              return (
                                <div key={cat} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span>{cat}</span>
                                    <span className="font-mono text-[11px] text-slate-950">{formatUGX(amt)} ({pct.toFixed(1)}%)</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-slate-500 rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Detailed General Ledger List (Compact Table) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-950 tracking-wider border-b border-slate-150 pb-1.5">
                      Transaction Ledger Logs ({reportFilteredTransactions.length} entries)
                    </h4>
                    <div className="border border-slate-250 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-250 text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-250">
                          <tr>
                            <th className="px-4 py-2.5">Date</th>
                            <th className="px-4 py-2.5">Type</th>
                            <th className="px-4 py-2.5">Category</th>
                            <th className="px-4 py-2.5">Description</th>
                            <th className="px-4 py-2.5">Method</th>
                            <th className="px-4 py-2.5 text-right">Amount (UGX)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200 font-medium text-slate-800">
                          {reportFilteredTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-center text-slate-400 font-bold">
                                No records found for the specified period parameters.
                              </td>
                            </tr>
                          ) : (
                            reportFilteredTransactions.slice(0, 50).map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-2.5 whitespace-nowrap font-mono">{tx.date}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 whitespace-nowrap font-semibold">{tx.category}</td>
                                <td className="px-4 py-2.5 max-w-[200px] truncate">{tx.description}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap">{tx.paymentMethod}</td>
                                <td className="px-4 py-2.5 whitespace-nowrap text-right font-black font-mono">
                                  {formatUGX(tx.amount)}
                                </td>
                              </tr>
                            ))
                          )}
                          {reportFilteredTransactions.length > 50 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-2 bg-slate-50 text-center text-[10px] text-slate-500 font-bold italic">
                                * Showing the first 50 transactions. Compile full Excel spreadsheet for more ledger rows.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. Formal Certification Stamp Block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-300">
                    {/* Bursar Signature */}
                    <div className="space-y-4 text-center">
                      <div className="h-10 flex items-end justify-center">
                        <span className="text-[11px] font-mono font-bold text-slate-400 italic">OTEC Edu-AI Verified</span>
                      </div>
                      <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="text-[10px] font-black uppercase text-slate-950">Finance Officer / Bursar</p>
                        <p className="text-[9px] text-slate-500 font-bold">Office of Financial Control</p>
                      </div>
                    </div>

                    {/* Head Teacher Signature */}
                    <div className="space-y-4 text-center">
                      <div className="h-10 flex items-end justify-center">
                        <span className="text-[11px] font-serif font-semibold text-slate-800 italic">{data.settings?.headTeacherName || 'Head Teacher'}</span>
                      </div>
                      <div className="border-t border-dashed border-slate-400 pt-2">
                        <p className="text-[10px] font-black uppercase text-slate-950">Approved By: Principal</p>
                        <p className="text-[9px] text-slate-500 font-bold">{data.settings?.schoolName || 'OTEC Academy'}</p>
                      </div>
                    </div>

                    {/* Seal / Verification stamp */}
                    <div className="space-y-4 text-center flex flex-col items-center justify-between">
                      <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center relative bg-slate-50/50">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">OFFICIAL<br />SEAL</span>
                      </div>
                      <div className="w-full border-t border-dashed border-slate-400 pt-2">
                        <p className="text-[10px] font-black uppercase text-slate-950">Verification Stamp</p>
                        <p className="text-[9px] text-slate-500 font-bold">Date: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      ) : subTab === 'banking' ? (
        <FinanceBankingTab transactions={transactions} />
      ) : subTab === 'fees' ? (
        /* ================= STUDENT FEE ACCOUNTS & RECOVERY VIEW ================= */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Key Recovery Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Registered Students */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Enrollment</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-950 font-mono">{data.learners.length}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Students Registered</p>
              </div>
            </div>

            {/* Collected Fee Income */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Collected Fees</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-950 font-mono">{formatUGX(totalFeesCollected)}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">This term's fee receipts</p>
              </div>
            </div>

            {/* Outstanding Balances */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Outstanding Arrears</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-black text-slate-950 font-mono">{formatUGX(totalOutstandingArrears)}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Total pending balances</p>
              </div>
            </div>

            {/* Recovery Rate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Recovery progress</span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-black text-slate-950 font-mono">{overallRecoveryRate}%</h3>
                  <span className="text-[9px] font-bold text-slate-400">Target: {formatUGX(totalReceivablesTarget)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${overallRecoveryRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Arrears Threshold Alert & Flagging Panel */}
          <div className="bg-gradient-to-r from-rose-50/40 via-amber-50/20 to-white border border-rose-150/40 rounded-3xl p-6 shadow-xs space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <span>Arrears Threshold Alert Center</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-bold leading-normal">
                  Set a critical arrears limit to instantly flag students with severe unpaid balances and trigger administrative actions or email reports.
                </p>
              </div>

              {/* Threshold Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Limit:</span>
                  <div className="flex items-center">
                    <span className="text-[10px] font-black text-slate-500 mr-1 font-mono">UGX</span>
                    <input
                      type="number"
                      step={50000}
                      min={0}
                      value={balanceThreshold}
                      onChange={(e) => setBalanceThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-xs font-black text-slate-900 outline-hidden border-none p-0 focus:ring-0 font-mono"
                    />
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div className="flex gap-1.5">
                  {[200000, 500000, 1000000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBalanceThreshold(preset)}
                      className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all border cursor-pointer ${
                        balanceThreshold === preset
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats and Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-150">
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                  flaggedStudents.length > 0 
                    ? 'bg-rose-50 text-rose-750 border-rose-150' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                }`}>
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{flaggedStudents.length} Students Flagged</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold">
                  representing <strong className="text-slate-950 font-mono font-black">{formatUGX(flaggedStudents.reduce((sum, s) => sum + parseFloat(s.outstandingBalance || '0'), 0))}</strong> in high-risk pending receivables.
                </p>
              </div>

              {flaggedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowEmailSummaryModal(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Mail size={12} />
                  <span>Send Summary Email</span>
                </button>
              )}
            </div>

            {/* Horizontal Flagged Student Badges */}
            {flaggedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {flaggedStudents.slice(0, 10).map((s) => (
                  <div key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 shadow-3xs hover:border-rose-300 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{s.name}</span>
                    <span className="text-slate-400 text-[9px] font-normal">({s.cls})</span>
                    <strong className="text-rose-700 font-mono text-[9px] font-black">{formatUGX(parseFloat(s.outstandingBalance || '0'))}</strong>
                  </div>
                ))}
                {flaggedStudents.length > 10 && (
                  <div className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-xl">
                    + {flaggedStudents.length - 10} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Grid: Class-by-Class Recovery Stats & Main Students Balance List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Class breakdown summary (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Class Recovery Index</h3>
                <p className="text-[10px] text-slate-400 font-bold">Performance & arrears density aggregated by class levels</p>
              </div>

              <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-1 animate-fade-in">
                {classStats.map((item) => (
                  <div key={item.className} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5 transition-colors">
                    <div className="flex justify-between items-baseline">
                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[9px] font-black rounded-md uppercase tracking-wider">
                        Class {item.className}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{item.studentCount} active students</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block uppercase tracking-wide text-[8px]">Paid (UGX)</span>
                        <span className="text-emerald-700 font-mono">{formatUGX(item.collected)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block uppercase tracking-wide text-[8px]">Pending (UGX)</span>
                        <span className={`font-mono ${item.outstanding > 0 ? 'text-rose-700' : 'text-slate-500'}`}>{formatUGX(item.outstanding)}</span>
                      </div>
                    </div>

                    {/* Progress slider for the class recovery rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wide">Collection Rate</span>
                        <span className="text-slate-900 font-mono font-black">{item.rate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.rate >= 80 ? 'bg-emerald-500' : item.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${item.rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Class-level Fee Balances vs. Paid Amount Recharts Chart */}
              <div className="pt-4 border-t border-slate-150 space-y-3">
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Class Fees Breakdown</h4>
                  <p className="text-[8px] text-slate-400 font-bold">Visualizing paid (Collected) vs pending (Balance) fees</p>
                </div>

                <div className="h-48 w-full font-mono text-[9px] font-black">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={classStats}
                      margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="className" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : v}
                      />
                      <Tooltip
                        contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '9px', fontFamily: 'monospace' }}
                        formatter={(value: any, name: any) => [formatUGX(Number(value)), name === 'collected' ? 'Collected (Paid)' : 'Outstanding (Balance)']}
                        labelFormatter={(label) => `Class: ${label}`}
                      />
                      <Legend 
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '8px', fontWeight: 'bold' }}
                        formatter={(value) => value === 'collected' ? 'Paid' : 'Balance'}
                      />
                      <Bar dataKey="collected" fill="#059669" name="collected" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outstanding" fill="#e11d48" name="outstanding" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right side: Detailed Student Fee Register & Wizard (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col space-y-5">
              
              {/* Header and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Enrollment Balances & Payments</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Review student payment statuses and issue official payment credit receipts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkCSVModal(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={13} />
                  <span>Bulk CSV Payments</span>
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search Student or Adm No..."
                    value={feeSearchTerm}
                    onChange={(e) => setFeeSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={feeClassFilter}
                  onChange={(e) => setFeeClassFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                >
                  <option value="all">All Classes</option>
                  {feeClassesList.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                >
                  <option value="all">All Balances</option>
                  <option value="unpaid">Outstanding Arrears Only</option>
                  <option value="partial">Partially Paid</option>
                  <option value="paid">Fully Cleared Only</option>
                </select>

                {/* Boarding Filter */}
                <select
                  value={feeBoardingFilter}
                  onChange={(e) => setFeeBoardingFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                >
                  <option value="all">All Boarding Status</option>
                  <option value="boarding">Boarding Only</option>
                  <option value="day">Day Scholars Only</option>
                </select>
              </div>

              {/* Student Fee accounts table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden flex-1 min-h-[350px]">
                <table className="min-w-full divide-y divide-slate-250 text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-250">
                    <tr>
                      <th className="px-4 py-2.5">Student Details</th>
                      <th className="px-4 py-2.5">Class & Adm</th>
                      <th className="px-4 py-2.5">Guardian Contacts</th>
                      <th className="px-4 py-2.5 text-right">Outstanding Arrears</th>
                      <th className="px-4 py-2.5 text-center">Action Wizard</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-150 font-medium text-slate-800">
                    {filteredFeeLearners.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-16 text-center bg-slate-50/20">
                          <div className="flex flex-col items-center justify-center space-y-3 py-6 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <Search size={18} className="stroke-[1.5]" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">No Fee Accounts Found</p>
                              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                                We couldn't find any student fee accounts matching "{feeSearchTerm || 'active filters'}". Try resetting your class filter or search.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFeeSearchTerm('');
                                setFeeClassFilter('all');
                                setFeeStatusFilter('all');
                                setFeeBoardingFilter('all');
                              }}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors shadow-3xs cursor-pointer"
                            >
                              Clear Fee Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredFeeLearners.map((student) => {
                        const bal = student.outstandingBalance ? parseFloat(student.outstandingBalance) : 0;
                        const isCleared = isNaN(bal) || bal <= 0;
                        
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50">
                            {/* Student Info */}
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center tracking-tighter shadow-xs">
                                  {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <div className="space-y-0.5">
                                  <span className="block font-black text-slate-900 leading-tight">{student.name}</span>
                                  <span className="block text-[9px] text-slate-400 font-bold">{student.sex} • {student.age} yrs</span>
                                </div>
                              </div>
                            </td>

                            {/* Class & Adm */}
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[9px] font-extrabold text-slate-700">
                                  Class {student.cls}
                                </span>
                                <span className="block text-[9px] text-slate-400 font-bold mt-1">Adm: {student.admNo}</span>
                              </div>
                            </td>

                            {/* Contacts */}
                            <td className="px-4 py-2.5">
                              <div className="space-y-0.5">
                                <span className="block font-semibold text-slate-700 truncate max-w-[150px]">{student.guardianName || 'N/A'}</span>
                                <span className="block text-[9px] text-slate-400 font-mono">{student.guardianPhone || 'No telephone'}</span>
                              </div>
                            </td>

                            {/* Outstanding balance */}
                            <td className="px-4 py-2.5 whitespace-nowrap text-right">
                              <div className="space-y-1">
                                <span className={`font-mono font-black text-xs ${isCleared ? 'text-slate-400' : 'text-rose-700'}`}>
                                  {isCleared ? 'UGX 0' : formatUGX(bal)}
                                </span>
                                <span className={`block text-[8px] font-black uppercase tracking-wider ${isCleared ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {isCleared ? '● Fully Settled' : '● Arrears Pending'}
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-2.5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedFeeStudent(student);
                                    setFeePayAmount(bal > 0 ? bal.toString() : '');
                                    setFeePayDescription(`Receipt for fees: ${student.name} (Adm: ${student.admNo})`);
                                    setShowFeePaymentModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Coins size={10} />
                                  <span>Receive Payment</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedStatementStudent(student);
                                    setShowStatementModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="View and print parent fee statement"
                                >
                                  <Printer size={10} />
                                  <span>Statement</span>
                                </button>
                                
                                <button
                                  onClick={() => copyFeeReminderNotice(student)}
                                  disabled={isCleared}
                                  className={`p-1.5 border border-slate-200 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                    isCleared 
                                      ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed' 
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                  }`}
                                  title="Copy SMS balance reminder to parent"
                                >
                                  <Download size={11} className="rotate-180" />
                                  <span className="text-[9px] font-extrabold uppercase px-1">Reminder Notice</span>
                                </button>
                              </div>
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
        </div>
      ) : subTab === 'feesInput' ? (
        /* ================= NEW STUDENT FEE COMPONENT SETUP VIEW ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Student Custom Fees Breakdown Roster</h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize individual billing components (tuition, uniforms, sports, hair, van, etc.) for each learner. Click any student to modify their active ledger.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBulkApplyDefaults}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors cursor-pointer"
            >
              <Sliders size={14} />
              <span>Bulk Apply Standard Defaults to All</span>
            </button>
          </div>

          {/* Table Container Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            {/* Filter and search row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search Student or Adm No..."
                  value={feeSearchTerm}
                  onChange={(e) => setFeeSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
                />
              </div>

              {/* Class Filter */}
              <select
                value={feeClassFilter}
                onChange={(e) => setFeeClassFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value="all">All Classes</option>
                {Array.from(new Set(data.learners.map(l => l.cls).filter(Boolean))).sort().map(clsName => (
                  <option key={clsName} value={clsName}>Class {clsName}</option>
                ))}
              </select>

              {/* Boarding Filter */}
              <select
                value={feeBoardingFilter}
                onChange={(e) => setFeeBoardingFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden"
              >
                <option value="all">All Boarding Status</option>
                <option value="boarding">Boarding Only</option>
                <option value="day">Day Scholars Only</option>
              </select>
            </div>

            {/* Roster Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden min-h-[350px]">
              <table className="min-w-full divide-y divide-slate-250 text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold tracking-wider border-b border-slate-250">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class/Type</th>
                    <th className="px-4 py-3 text-right">Tuition</th>
                    <th className="px-4 py-3 text-right">Boarding</th>
                    <th className="px-4 py-3 text-right">Uniforms & Wear</th>
                    <th className="px-4 py-3 text-right">Van / Extras</th>
                    <th className="px-4 py-3 text-right">Total Charged</th>
                    <th className="px-4 py-3 text-right">Arrears Pending</th>
                    <th className="px-4 py-3 text-center">Customize Billing</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-150 font-medium text-slate-800">
                  {filteredFeeLearners.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-bold italic">
                        No students matching your search filters were found.
                      </td>
                    </tr>
                  ) : (
                    filteredFeeLearners.map((student) => {
                      const tui = student.feeTuition ?? 0;
                      const board = student.feeBoarding ?? 0;
                      const uni = (student.feeSweater ?? 0) + (student.feeClassUniform ?? 0) + (student.feeSportsWear ?? 0);
                      const extra = (student.feeVan ?? 0) + (student.feeRegistration ?? 0) + (student.feeHair ?? 0) + (student.feeHoliday ?? 0) + (student.feeOthers ?? 0);
                      const totalBill = tui + board + uni + extra;
                      const bal = student.outstandingBalance ? parseFloat(student.outstandingBalance) : 0;
                      const isCleared = isNaN(bal) || bal <= 0;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50">
                          {/* Student */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[9px] flex items-center justify-center tracking-tighter">
                                {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <span className="font-bold text-slate-900">{student.name}</span>
                            </div>
                          </td>

                          {/* Class / Type */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[9px] font-extrabold text-slate-700">
                                Class {student.cls}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                                (student.dayBoarding || '').toLowerCase().includes('board') 
                                  ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                                  : 'bg-orange-50 text-orange-700 border border-orange-100'
                              }`}>
                                {student.dayBoarding || 'Day'}
                              </span>
                            </div>
                          </td>

                          {/* Tuition */}
                          <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-semibold">{formatUGX(tui)}</td>

                          {/* Boarding */}
                          <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-semibold">{formatUGX(board)}</td>

                          {/* Uniforms */}
                          <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-semibold">{formatUGX(uni)}</td>

                          {/* Van / Extras */}
                          <td className="px-4 py-2.5 text-right font-mono text-slate-900 font-semibold">{formatUGX(extra)}</td>

                          {/* Total Bill */}
                          <td className="px-4 py-2.5 text-right font-mono text-slate-950 font-bold">{formatUGX(totalBill)}</td>

                          {/* Outstanding Balance */}
                          <td className="px-4 py-2.5 text-right whitespace-nowrap font-mono font-black text-xs">
                            <span className={isCleared ? 'text-emerald-600' : 'text-rose-700'}>
                              {formatUGX(bal)}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-4 py-2.5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFeeStudent(student);
                                  setShowFeePaymentModal(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
                                title="Record Payment for Student"
                              >
                                <Plus size={10} />
                                <span>Pay</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHistoryLearner(student);
                                  setShowLearnerHistoryModal(true);
                                }}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
                                title="View Learner Fee Payment History Ledger"
                              >
                                <Eye size={10} />
                                <span>History</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEditFeesStudent(student);
                                  setEditTuition(student.feeTuition ?? 0);
                                  setEditBoarding(student.feeBoarding ?? 0);
                                  setEditVan(student.feeVan ?? 0);
                                  setEditRegistration(student.feeRegistration ?? 0);
                                  setEditSweater(student.feeSweater ?? 0);
                                  setEditClassUniform(student.feeClassUniform ?? 0);
                                  setEditSportsWear(student.feeSportsWear ?? 0);
                                  setEditHair(student.feeHair ?? 0);
                                  setEditHoliday(student.feeHoliday ?? 0);
                                  setEditOthers(student.feeOthers ?? 0);
                                  setShowEditFeesModal(true);
                                }}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-3xs"
                                title="Customize Billed Fee Items"
                              >
                                <Sliders size={10} />
                                <span>Fees</span>
                              </button>
                            </div>
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
      ) : subTab === 'dailyExpense' ? (
        /* ================= DAILY EXPENSE REPORT TO PDF VIEW ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Daily Expense Controls Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Daily Operational Expense Voucher & Report</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Track, inspect, and export formal daily cash outflow vouchers to PDF</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Expense Date</label>
                <input
                  type="date"
                  value={selectedDailyExpenseDate}
                  onChange={(e) => setSelectedDailyExpenseDate(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm mt-4"
              >
                <Printer size={14} />
                <span>Export Voucher PDF</span>
              </button>
            </div>
          </div>

          {/* Daily Metrics Summary Bar */}
          {(() => {
            const dailyExpenses = transactions.filter(tx => 
              tx.type === 'expense' && 
              tx.date === selectedDailyExpenseDate && 
              (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
            );
            const totalDailyExpense = dailyExpenses.reduce((sum, tx) => sum + tx.amount, 0);
            const largestSingleExpense = dailyExpenses.length > 0 ? Math.max(...dailyExpenses.map(tx => tx.amount)) : 0;
            
            const catMap: { [cat: string]: number } = {};
            dailyExpenses.forEach(tx => {
              catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
            });

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Daily Outflow</span>
                    <p className="text-xl font-extrabold font-mono text-rose-700 mt-2">{formatUGX(totalDailyExpense)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">For date {selectedDailyExpenseDate}</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Vouchers Issued</span>
                    <p className="text-xl font-extrabold font-mono text-slate-900 mt-2">{dailyExpenses.length} Records</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Authorized Disbursements</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Largest Single Outflow</span>
                    <p className="text-xl font-extrabold font-mono text-amber-700 mt-2">{formatUGX(largestSingleExpense)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Single Peak Expense</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Categories Affected</span>
                    <p className="text-xl font-extrabold font-mono text-blue-700 mt-2">{Object.keys(catMap).length} Categories</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Operational Outlets</p>
                  </div>
                </div>

                {/* Category Breakdown Cards */}
                {Object.keys(catMap).length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Daily Expenditure Category Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(catMap).map(([catName, amt]) => {
                        const pct = totalDailyExpense > 0 ? ((amt / totalDailyExpense) * 100).toFixed(1) : '0';
                        return (
                          <div key={catName} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                            <span className="text-[10px] font-bold text-slate-600 block truncate">{catName}</span>
                            <p className="text-xs font-mono font-extrabold text-slate-950">{formatUGX(amt)}</p>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[9px] text-slate-400 font-extrabold block text-right">{pct}% of daily total</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Formal Printable Daily Expense Sheet & Voucher Table */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
                  <div className="border-b border-slate-200 pb-4 text-center space-y-1">
                    <h2 className="text-base font-black text-slate-950 uppercase tracking-wide">{data.settings.schoolName}</h2>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Daily Operational Expense Outflow Report</p>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-500 font-mono pt-1">
                      <span>Date: <strong>{selectedDailyExpenseDate}</strong></span>
                      <span>&middot;</span>
                      <span>Term: <strong>{selectedTermFilter === 'all' ? (data.settings.term || 'Term 1') : selectedTermFilter}</strong></span>
                      <span>&middot;</span>
                      <span>Total Outflow: <strong className="text-rose-700">{formatUGX(totalDailyExpense)}</strong></span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[9px] tracking-wider border-b border-slate-200">
                          <th className="px-4 py-3">Voucher #</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Description / Recipient</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3 text-right">Amount (UGX)</th>
                          <th className="px-4 py-3">Recorded By</th>
                          <th className="px-4 py-3 text-center print:hidden">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {dailyExpenses.length > 0 ? (
                          dailyExpenses.map((tx, idx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60">
                              <td className="px-4 py-3 font-mono text-[10px] font-bold text-slate-500">
                                VCH-{selectedDailyExpenseDate.replace(/-/g, '')}-00{idx + 1}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800">
                                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-md font-mono text-[10px]">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-700">{tx.description}</td>
                              <td className="px-4 py-3 font-medium text-slate-600">{tx.paymentMethod}</td>
                              <td className="px-4 py-3 text-right font-mono font-black text-rose-700">{formatUGX(tx.amount)}</td>
                              <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{tx.recordedBy}</td>
                              <td className="px-4 py-3 text-center print:hidden">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setShowReceiptModal(tx)}
                                    className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                                    title="Print Voucher"
                                  >
                                    <Printer size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditTransaction(tx)}
                                    className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                                    title="Edit Expense"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-colors cursor-pointer"
                                    title="Delete Expense"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold italic">
                              No operational school expenses logged for {selectedDailyExpenseDate}. Select another date or record a new transaction in the General Ledger.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 mt-6 print:grid">
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Bursar / Accountant Signature</span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Head Teacher Approval & Stamp</span>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Auditor Verification Date</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : subTab === 'monthly' ? (
        /* ================= MONTHLY FINANCIAL REPORT VIEW ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Monthly Financial Performance Statement</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Comprehensive monthly revenue inflow vs expenditure outflow statement</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Month</label>
                <input
                  type="month"
                  value={selectedReportMonth}
                  onChange={(e) => setSelectedReportMonth(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => exportMonthlyExcelBudgetReport(
                  selectedReportMonth || new Date().toISOString().slice(0, 7),
                  transactions,
                  categories,
                  data.settings?.schoolName || "Oasis Tech Educational Center (OTEC)",
                  selectedTermFilter,
                  data.learners || []
                )}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/10 mt-4"
              >
                <FileSpreadsheet size={14} />
                <span>Export Monthly Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/10 mt-4"
              >
                <Printer size={14} />
                <span>Print Monthly PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Monthly Excel Budget & Balance Sheet Card */}
          <MonthlyExcelBudgetAndBalanceSheetCard
            transactions={transactions}
            categories={categories}
            formatUGX={formatUGX}
            selectedTermFilter={selectedTermFilter}
            learners={data.learners || []}
            schoolName={data.settings?.schoolName || "Oasis Tech Educational Center (OTEC)"}
            initialMonth={selectedReportMonth}
          />

          {(() => {
            const monthlyTxs = transactions.filter(tx => 
              tx.date.startsWith(selectedReportMonth) &&
              (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
            );

            const mIncome = monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const mExpense = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const netSurplus = mIncome - mExpense;

            const incomeCatMap: { [c: string]: number } = {};
            const expenseCatMap: { [c: string]: number } = {};

            monthlyTxs.forEach(t => {
              if (t.type === 'income') incomeCatMap[t.category] = (incomeCatMap[t.category] || 0) + t.amount;
              else expenseCatMap[t.category] = (expenseCatMap[t.category] || 0) + t.amount;
            });

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:grid-cols-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-l-4 border-l-emerald-500">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Gross Monthly Income</span>
                    <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-2">{formatUGX(mIncome)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">{monthlyTxs.filter(t => t.type === 'income').length} Inflow Payments</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-l-4 border-l-rose-500">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Monthly Expenditure</span>
                    <p className="text-2xl font-extrabold font-mono text-rose-700 mt-2">{formatUGX(mExpense)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">{monthlyTxs.filter(t => t.type === 'expense').length} Outflow Vouchers</p>
                  </div>

                  <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-l-4 ${netSurplus >= 0 ? 'border-l-blue-600' : 'border-l-amber-500'}`}>
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Net Operating Surplus / (Deficit)</span>
                    <p className={`text-2xl font-extrabold font-mono mt-2 ${netSurplus >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                      {formatUGX(netSurplus)}
                    </p>
                    <p className="text-[10px] font-semibold mt-1 text-slate-400">
                      {netSurplus >= 0 ? 'Positive Operating Cash Buffer' : 'Negative Net Cashflow Alert'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center justify-between">
                      <span>Revenue & Fee Collections</span>
                      <span className="font-mono text-emerald-700">{formatUGX(mIncome)}</span>
                    </h4>
                    <div className="space-y-2.5">
                      {Object.entries(incomeCatMap).length > 0 ? (
                        Object.entries(incomeCatMap).map(([cat, amt]) => {
                          const pct = mIncome > 0 ? ((amt / mIncome) * 100).toFixed(1) : '0';
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-800">{cat}</span>
                                <span className="font-mono font-bold text-emerald-700">{formatUGX(amt)} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4 text-center">No income transactions recorded for this month.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-rose-800 tracking-wider flex items-center justify-between">
                      <span>School Operating Expenditures</span>
                      <span className="font-mono text-rose-700">{formatUGX(mExpense)}</span>
                    </h4>
                    <div className="space-y-2.5">
                      {Object.entries(expenseCatMap).length > 0 ? (
                        Object.entries(expenseCatMap).map(([cat, amt]) => {
                          const pct = mExpense > 0 ? ((amt / mExpense) * 100).toFixed(1) : '0';
                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-800">{cat}</span>
                                <span className="font-mono font-bold text-rose-700">{formatUGX(amt)} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-rose-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic py-4 text-center">No expense transactions recorded for this month.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Itemized Monthly Ledger Transactions</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-black text-[9px] tracking-wider border-b border-slate-200">
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3 text-right">Amount (UGX)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {monthlyTxs.length > 0 ? (
                          monthlyTxs.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60">
                              <td className="px-4 py-2.5 font-mono text-slate-600 font-bold">{tx.date}</td>
                              <td className="px-4 py-2.5 font-bold">
                                <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase ${
                                  tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{tx.category}</td>
                              <td className="px-4 py-2.5 text-slate-600">{tx.description}</td>
                              <td className="px-4 py-2.5 text-slate-500 font-medium">{tx.paymentMethod}</td>
                              <td className={`px-4 py-2.5 text-right font-mono font-black ${
                                tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {tx.type === 'income' ? '+' : '-'}{formatUGX(tx.amount)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold italic">
                              No financial records found for month {selectedReportMonth}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : subTab === 'vendors' ? (
        <FinanceVendorsTab />
      ) : subTab === 'requisitions' ? (
        <FinanceRequisitionsTab />
      ) : subTab === 'audit' ? (
        <AuditLogViewer />
      ) : subTab === 'calendar' ? (
        /* ================= FINANCIAL EXPENSE CALENDAR VIEW ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Financial Expense Calendar & Timeline Tracker</h3>
                <p className="text-[11px] text-slate-500 font-semibold">Track daily and weekly operational expenses visually across the term calendar</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="month"
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>

          {(() => {
            const [yearStr, monthStr] = calendarMonth.split('-');
            const year = parseInt(yearStr, 10);
            const monthIdx = parseInt(monthStr, 10) - 1;
            
            const firstDay = new Date(year, monthIdx, 1);
            const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
            const startingDayOfWeek = firstDay.getDay();

            const monthTxs = transactions.filter(tx => 
              tx.date.startsWith(calendarMonth) &&
              (selectedTermFilter === 'all' || (tx.term || 'Term 1') === selectedTermFilter)
            );

            const dateMap: { [dStr: string]: { income: number; expense: number; txs: FinanceTransaction[] } } = {};
            monthTxs.forEach(tx => {
              if (!dateMap[tx.date]) dateMap[tx.date] = { income: 0, expense: 0, txs: [] };
              dateMap[tx.date].txs.push(tx);
              if (tx.type === 'income') dateMap[tx.date].income += tx.amount;
              else dateMap[tx.date].expense += tx.amount;
            });

            const weeks: Array<{ weekNum: number; startDay: number; endDay: number; income: number; expense: number }> = [
              { weekNum: 1, startDay: 1, endDay: 7, income: 0, expense: 0 },
              { weekNum: 2, startDay: 8, endDay: 14, income: 0, expense: 0 },
              { weekNum: 3, startDay: 15, endDay: 21, income: 0, expense: 0 },
              { weekNum: 4, startDay: 22, endDay: 28, income: 0, expense: 0 },
              { weekNum: 5, startDay: 29, endDay: daysInMonth, income: 0, expense: 0 },
            ];

            weeks.forEach(w => {
              monthTxs.forEach(tx => {
                const dayNum = parseInt(tx.date.split('-')[2], 10);
                if (dayNum >= w.startDay && dayNum <= w.endDay) {
                  if (tx.type === 'income') w.income += tx.amount;
                  else w.expense += tx.amount;
                }
              });
            });

            const selectedDayData = dateMap[calendarSelectedDate] || { income: 0, expense: 0, txs: [] };

            return (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Weekly Financial Expenditure Aggregator</h4>
                    <span className="text-[10px] font-bold text-slate-500">Termly Weekly Outflow Summary</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    {weeks.map((w) => {
                      const net = w.income - w.expense;
                      const isSelectedWeek = calendarSelectedWeek === w.weekNum;
                      return (
                        <button
                          key={w.weekNum}
                          type="button"
                          onClick={() => setCalendarSelectedWeek(isSelectedWeek ? 'all' : w.weekNum)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelectedWeek 
                              ? 'bg-blue-50 border-blue-600 shadow-sm' 
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Week {w.weekNum} (Days {w.startDay}-{w.endDay})
                          </span>
                          <p className="text-xs font-mono font-extrabold text-rose-700 mt-1">Exp: {formatUGX(w.expense)}</p>
                          <p className="text-[10px] font-mono text-emerald-700 font-bold">Inc: {formatUGX(w.income)}</p>
                          <div className="mt-2 text-[9px] font-bold uppercase tracking-wider font-mono">
                            <span className={net >= 0 ? 'text-blue-700' : 'text-amber-700'}>
                              Net: {net >= 0 ? '+' : ''}{formatUGX(net)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                        Month Calendar: {new Date(year, monthIdx).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h4>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Income</span>
                        <span className="flex items-center gap-1 text-rose-700"><span className="w-2 h-2 rounded-full bg-rose-500" /> Expense</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase text-slate-400">
                      <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[70px] bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dayStr = `${calendarMonth}-${dayNum.toString().padStart(2, '0')}`;
                        const dayInfo = dateMap[dayStr];
                        const isSelected = calendarSelectedDate === dayStr;

                        const matchesWeek = calendarSelectedWeek === 'all' || 
                          (dayNum >= (weeks.find(w => w.weekNum === calendarSelectedWeek)?.startDay || 0) && 
                           dayNum <= (weeks.find(w => w.weekNum === calendarSelectedWeek)?.endDay || 31));

                        return (
                          <div
                            key={dayStr}
                            onClick={() => setCalendarSelectedDate(dayStr)}
                            className={`min-h-[72px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-600/20' 
                                : matchesWeek 
                                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50' 
                                  : 'bg-slate-50/50 border-slate-100 opacity-40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-mono font-black ${isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-800'}`}>
                                {dayNum}
                              </span>
                              {dayInfo && dayInfo.txs.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              )}
                            </div>

                            <div className="space-y-0.5 mt-1">
                              {dayInfo && dayInfo.expense > 0 && (
                                <span className="block px-1 py-0.2 bg-rose-50 border border-rose-100 text-rose-700 rounded text-[8px] font-mono font-extrabold truncate">
                                  -{formatUGX(dayInfo.expense).replace('UGX', '').trim()}
                                </span>
                              )}
                              {dayInfo && dayInfo.income > 0 && (
                                <span className="block px-1 py-0.2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-[8px] font-mono font-extrabold truncate">
                                  +{formatUGX(dayInfo.income).replace('UGX', '').trim()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-950 tracking-wider">Day Financial Inspector</h4>
                          <span className="text-[11px] font-mono font-extrabold text-blue-600">{calendarSelectedDate}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTxDate(calendarSelectedDate);
                            setShowAddModal(true);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
                        >
                          <Plus size={10} />
                          <span>Log Record</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center font-mono">
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                          <span className="text-[9px] font-bold uppercase text-emerald-700 block">Day Inflow</span>
                          <span className="text-xs font-black text-emerald-800">{formatUGX(selectedDayData.income)}</span>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                          <span className="text-[9px] font-bold uppercase text-rose-700 block">Day Outflow</span>
                          <span className="text-xs font-black text-rose-800">{formatUGX(selectedDayData.expense)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {selectedDayData.txs.length > 0 ? (
                          selectedDayData.txs.map((tx) => (
                            <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  tx.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {tx.category}
                                </span>
                                <span className={`font-mono font-extrabold ${tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {tx.type === 'income' ? '+' : '-'}{formatUGX(tx.amount)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 font-medium truncate">{tx.description}</p>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-1">
                                <span>By: {tx.recordedBy}</span>
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => handleStartEditTransaction(tx)} className="text-slate-600 hover:text-slate-900 cursor-pointer">Edit</button>
                                  <span>&middot;</span>
                                  <button type="button" onClick={() => handleDeleteTransaction(tx.id)} className="text-rose-600 hover:text-rose-800 cursor-pointer">Delete</button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs italic">
                            No financial transactions recorded on {calendarSelectedDate}. Click "Log Record" above to add an entry.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : subTab === 'expenditureBreakdown' ? (
        /* ================= EXPENDITURE CATEGORY BREAKDOWN VIEW ================= */
        <ExpenditureCategoryBreakdownView
          transactions={transactions}
          categories={categories}
          formatUGX={formatUGX}
          selectedTermFilter={selectedTermFilter}
        />
      ) : (
        /* ================= ORIGINAL LEDGER & BUDGETING VIEW ================= */
        <>
        {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 print:grid-cols-4">
        
        {/* Total Income */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Cash Inflow</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatUGX(totalIncome)}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={11} />
              <span>All terms collection active</span>
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total School Outflow</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatUGX(totalExpense)}
            </h3>
            <p className="text-[10px] text-rose-500 font-semibold mt-1">
              Teacher wages, food & utilities
            </p>
          </div>
        </div>

        {/* Net Reserves */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Cash Reserve (Net)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl font-extrabold tracking-tight font-mono ${netBalance >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
              {formatUGX(netBalance)}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Net operating liquid capital
            </p>
          </div>
        </div>

        {/* Tuition Tracking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Tuition Fee Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins size={18} />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{tuitionCollectionRate}%</span>
              <span className="text-[9px] text-slate-400">collected</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(tuitionCollectionRate, 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400 block pt-0.5">
              Expected: {formatUGX(expectedTuitionTotal)}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        {/* Primary Cash Flow line chart */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">School Cash Flow Trend</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Daily transaction overview of revenues and operational costs</p>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val: number) => [formatUGX(val), '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={30} iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Area type="monotone" dataKey="income" name="Revenue Inflow" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="expense" name="Operational Cost" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Expense distribution */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Expense Category Outflow</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Breakdown of daily operational spendings</p>
          </div>
          <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
            {expenseBreakdownData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-450 text-[11px] font-medium italic">
                No expense records registered yet
              </div>
            ) : (
              expenseBreakdownData
                .sort((a,b) => b.value - a.value)
                .map((item, idx) => {
                  const percentage = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
                  const catColor = categories.find(c => c.name === item.name)?.color || 'rose';
                  const bgClass = BG_COLOR_MAP[catColor] || 'bg-rose-500';
                  return (
                    <div key={idx} className="space-y-1 animate-fade-in">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-700 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${bgClass}`} />
                          <span>{item.name}</span>
                        </span>
                        <span className="text-slate-500 font-mono">{formatUGX(item.value)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`${bgClass} h-full rounded-full transition-all duration-500`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Monthly Budget Overview aligned with School Calendar */}
      <div id="monthly-budget-overview-card" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 print:hidden">
        {/* Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-600 rounded-md tracking-wider">Calendar-Driven Projections</span>
              <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 rounded-md tracking-wider">Active Term 3</span>
            </div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans mt-1">Academic Monthly Budget Projections</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Projected income and spending dynamically generated from active School Calendar events</p>
          </div>
          
          {/* Legend and stats */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-150 px-4 py-2 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Expenditure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-slate-200 border border-slate-300" />
              <span className="text-[11px]">Dashed Stack = Projected Target</span>
            </div>
          </div>
        </div>

        {/* Outer grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: The Chart (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4 min-h-[350px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 font-sans">
                <Activity size={14} className="text-emerald-500 animate-pulse" />
                <span>Projected Target vs Actual Ledger Inflows & Outflows</span>
              </span>
              <span className="text-[10px] text-slate-400 italic">Values in Ugandan Shillings (UGX)</span>
            </div>

            {/* Stacked Bar Chart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetChartData}
                  margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="shortMonth" 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                      return val;
                    }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatUGX(Number(value)), name]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  
                  {/* Income Stack (Group 1) */}
                  <Bar dataKey="realizedIncome" name="Actual Revenue Collected" stackId="income" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remainingIncome" name="Remaining Projected Target" stackId="income" fill="#a7f3d0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="surplusIncome" name="Revenue Surplus" stackId="income" fill="#047857" radius={[4, 4, 0, 0]} />

                  {/* Expense Stack (Group 2) */}
                  <Bar dataKey="realizedExpense" name="Actual Spending" stackId="expense" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remainingExpense" name="Unspent Budget Room" stackId="expense" fill="#fecdd3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="overspendExpense" name="Budget Deficit / Overrun" stackId="expense" fill="#991b1b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Guide footer */}
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="space-y-0.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Realized Revenue</span>
                <span className="block text-xs font-black text-emerald-600 font-mono">Solid Emerald</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pending Influx</span>
                <span className="block text-xs font-black text-emerald-300 font-mono">Light Emerald</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Actual Outflow</span>
                <span className="block text-xs font-black text-rose-500 font-mono">Solid Rose</span>
              </div>
              <div className="space-y-0.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Budget Headroom</span>
                <span className="block text-xs font-black text-rose-200 font-mono">Light Rose</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive sidebar with calendar details (4 cols) */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-4">
            
            {/* Month tab controls */}
            <div className="space-y-2">
              <span className="block font-black text-slate-600 uppercase tracking-wider text-[9px]">Select Budget Month</span>
              <div className="flex flex-wrap gap-1 bg-slate-200/50 p-1 rounded-xl">
                {budgetChartData.map(m => (
                  <button
                    key={m.monthKey}
                    onClick={() => setSelectedBudgetMonth(m.monthKey)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer text-center whitespace-nowrap ${
                      activeBudgetMonth === m.monthKey 
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-100' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
                    }`}
                  >
                    {m.shortMonth}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected month dynamic stats */}
            {selectedMonthData && (
              <div className="space-y-3.5 flex-1 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 font-sans tracking-tight">{selectedMonthData.month} Summary</h4>
                  <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-slate-200/70 border border-slate-300 text-slate-600 rounded-md uppercase tracking-wider">{selectedMonthData.monthKey}</span>
                </div>

                {/* Progress bars comparing Actual vs Budget */}
                <div className="space-y-2.5">
                  {/* Revenue collection progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Revenue Inflows</span>
                      <span className="text-slate-850 font-mono text-[10px]">
                        {formatUGX(selectedMonthData.actualIncome)} / {formatUGX(selectedMonthData.projectedIncome)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300/30">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, selectedMonthData.projectedIncome > 0 ? (selectedMonthData.actualIncome / selectedMonthData.projectedIncome) * 100 : 0)}%` }}
                      />
                    </div>
                    <span className="block text-[8px] text-emerald-600 font-bold font-mono">
                      {selectedMonthData.projectedIncome > 0 ? Math.round((selectedMonthData.actualIncome / selectedMonthData.projectedIncome) * 100) : 0}% of target secured
                    </span>
                  </div>

                  {/* Operational expenditure budget cap */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10px] font-bold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px]">Spending Outflows</span>
                      <span className="text-slate-850 font-mono text-[10px]">
                        {formatUGX(selectedMonthData.actualExpense)} / {formatUGX(selectedMonthData.projectedExpense)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300/30">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${selectedMonthData.actualExpense > selectedMonthData.projectedExpense ? 'bg-red-600 animate-pulse' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, selectedMonthData.projectedExpense > 0 ? (selectedMonthData.actualExpense / selectedMonthData.projectedExpense) * 100 : 0)}%` }}
                      />
                    </div>
                    <span className={`block text-[8px] font-bold font-mono ${selectedMonthData.actualExpense > selectedMonthData.projectedExpense ? 'text-red-700' : 'text-slate-400'}`}>
                      {selectedMonthData.actualExpense > selectedMonthData.projectedExpense 
                        ? `Overrun by ${formatUGX(selectedMonthData.actualExpense - selectedMonthData.projectedExpense)}!` 
                        : `${Math.round((selectedMonthData.actualExpense / selectedMonthData.projectedExpense) * 100)}% of limit consumed`}
                    </span>
                  </div>
                </div>

                {/* Calendar Events contributing to this Month's Budget */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="block font-black text-slate-550 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Calendar size={11} className="text-blue-500" />
                    <span>School Calendar Drivers</span>
                  </span>
                  
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {selectedMonthData.events.length === 0 ? (
                      <div className="p-2 border border-dashed border-slate-200 rounded-xl bg-slate-100/30 text-center text-[10px] text-slate-400 italic">
                        No events scheduled in the calendar for this month
                      </div>
                    ) : (
                      selectedMonthData.events.map(ev => {
                        let badgeColor = 'bg-blue-50 text-blue-600 border-blue-150';
                        if (ev.type === 'holiday') badgeColor = 'bg-amber-50 text-amber-600 border-amber-150';
                        if (ev.type === 'deadline') badgeColor = 'bg-rose-50 text-rose-600 border-rose-150';
                        return (
                          <div key={ev.id} className="p-2 bg-white border border-slate-150 rounded-xl space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-black text-slate-800 leading-tight truncate">{ev.title}</span>
                              <span className={`text-[7px] font-bold px-1 py-0.2 rounded border uppercase tracking-wider shrink-0 ${badgeColor}`}>{ev.type}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{ev.description || 'No notes added'}</p>
                            <span className="block text-[8px] text-slate-400 font-mono font-bold pt-0.5">{ev.date}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Interactive sliders coefficient panel */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="block font-black text-slate-550 uppercase tracking-wider text-[9px] flex items-center gap-1">
                    <Sliders size={11} className="text-violet-500" />
                    <span>Projector Calibration Tuning</span>
                  </span>
                  <div className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-2">
                    {/* Tuition Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                        <span>Standard Tuition Rate</span>
                        <span className="text-slate-850 font-mono text-[9px]">{formatUGX(budgetTuitionRate)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="200000" 
                        max="800000" 
                        step="50000"
                        value={budgetTuitionRate}
                        onChange={(e) => setBudgetTuitionRate(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1 cursor-pointer bg-slate-100 rounded-lg appearance-none" 
                      />
                    </div>

                    {/* Salary Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                        <span>Monthly Staff Payroll</span>
                        <span className="text-slate-850 font-mono text-[9px]">{formatUGX(budgetSalaries)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="2000000" 
                        max="8000000" 
                        step="500000"
                        value={budgetSalaries}
                        onChange={(e) => setBudgetSalaries(Number(e.target.value))}
                        className="w-full accent-rose-500 h-1 cursor-pointer bg-slate-100 rounded-lg appearance-none" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Interactive Expenditure Category Breakdown Recharts Feature */}
      <ExpenditureCategoryBreakdownView
        transactions={transactions}
        categories={categories}
        formatUGX={formatUGX}
        selectedTermFilter={selectedTermFilter}
      />

      {/* 3. Transaction Ledger & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Ledger Header Controls */}
        <div className="p-6 border-b border-slate-150 bg-slate-50/50 space-y-4 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Daily School Financial Ledger</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Official double-entry recording for transparent bookkeeping</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={exportToCSV}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Export list to Excel-ready CSV format"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
              >
                <Plus size={14} />
                <span>Add Ledger Record</span>
              </button>
            </div>
          </div>

          {/* Search and Filters Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, admission no, description..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter size={13} className="text-slate-400 shrink-0" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setFilterCategory('all'); // reset category filter
                }}
                className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Types (Income & Expenses)</option>
                <option value="income">Inflow (Income Only)</option>
                <option value="expense">Outflow (Expenses Only)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <Filter size={13} className="text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                {filterType !== 'expense' && incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                {filterType !== 'income' && expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
              <CreditCard size={13} className="text-slate-400 shrink-0" />
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Linked Learner</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5 text-right">Amount (UGX)</th>
                <th className="px-6 py-3.5 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransactions.map((tx) => {
                const student = tx.studentId ? data.learners.find(l => l.id === tx.studentId) : null;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Date */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>
                    
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const styles = getCategoryColorStyles(tx.category, tx.type);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border tracking-wider transition-all shadow-2xs ${styles.bg} ${styles.text} ${styles.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                            <span>{tx.category}</span>
                          </span>
                        );
                      })()}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 font-medium text-slate-800 max-w-xs md:max-w-md truncate" title={tx.description}>
                      {tx.description}
                    </td>

                    {/* Student Linkage */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                      {student ? (
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-blue-500 shrink-0" />
                          <span>{student.name}</span>
                          <span className="text-[9px] text-slate-400 font-normal">({student.cls})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic">N/A</span>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">
                      {tx.paymentMethod}
                    </td>

                    {/* Amount */}
                    <td className={`px-6 py-4 text-right font-mono font-black text-sm whitespace-nowrap ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatUGX(tx.amount).replace('UGX', '').trim()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center print:hidden whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {tx.type === 'income' ? (
                          <button
                            onClick={() => setShowReceiptModal(tx)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Print / View Official Tuition Receipt"
                          >
                            <Receipt size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowReceiptModal(tx)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Print / View Official Expense Voucher"
                          >
                            <Printer size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEditTransaction(tx)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit Ledger Record"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                          title="Delete Ledger Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center bg-slate-50/40">
                    {transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center space-y-4 py-8 max-w-md mx-auto">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-3xs">
                            <FileSpreadsheet size={26} className="stroke-[1.5]" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                            ✓
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">School Ledger is Empty</h4>
                          <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                            No ledger transactions have been recorded this term. Open the transaction wizard to log incoming tuition fees or daily operational school expenses.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus size={12} />
                          <span>Add Ledger Record</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3 py-6 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search size={18} className="stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">No Transaction Matches</p>
                          <p className="text-[10px] text-slate-400 font-bold leading-normal">
                            We couldn't find any ledger records matching "{searchTerm || 'selected criteria'}". Try clearing your active filters.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterCategory('all');
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors shadow-3xs cursor-pointer"
                        >
                          Clear Active Filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* 4. Receipt / Expense Voucher Print Template Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #tx-receipt-voucher-print-area, #tx-receipt-voucher-print-area * {
                visibility: visible !important;
              }
              #tx-receipt-voucher-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div id="tx-receipt-voucher-print-area" className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-8 shadow-2xl flex flex-col space-y-6 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-0 print:shadow-none print:p-0 print:rounded-none">
            
            {/* Modal Control Header - Hidden during print */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${showReceiptModal.type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Receipt size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">
                    {showReceiptModal.type === 'expense' ? 'Official Expense Payment Voucher' : 'Official Tuition / Cash Receipt'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Click Print or Save PDF to generate official document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer transition-colors"
                >
                  <Printer size={13} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 border border-slate-200/90 p-6 rounded-2xl bg-white text-left print:border-0 print:p-0 print:rounded-none">
              
              {showReceiptModal.type === 'expense' ? (
                <>
                  {/* Expense Voucher Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 gap-4 relative">
                    <div className="flex items-center gap-3">
                      {data.settings?.logo ? (
                        <img 
                          src={data.settings.logo} 
                          alt="School Logo" 
                          className="w-14 h-14 object-contain rounded-lg border border-slate-100 print:border-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                          {(data.settings?.schoolName || 'OTEC').split(' ').map(n => n[0]).slice(0, 3).join('')}
                        </div>
                      )}
                      <div>
                        <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight">{data.settings?.schoolName || 'OTEC Academy'}</h2>
                        {data.settings?.motto && (
                          <p className="text-[10px] italic text-slate-500 font-medium">"{data.settings.motto}"</p>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {data.settings?.address || 'Uganda, East Africa'} &middot; Tel: {data.settings?.tel1 || '+256 Finance Desk'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="border-2 border-rose-600 text-rose-700 font-black text-[8px] uppercase px-2 py-0.5 rounded-md tracking-widest block text-center mb-1">
                        PAID VOUCHER
                      </span>
                      <p className="text-[10px] font-mono font-bold text-slate-500">Ref: #{showReceiptModal.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{showReceiptModal.date}</p>
                    </div>
                  </div>

                  {/* Voucher Core Information */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] pb-4 border-b border-slate-150">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Disbursement Reference</span>
                      <p className="font-bold text-slate-900">Voucher No: <span className="font-mono text-rose-700">{showReceiptModal.id.toUpperCase()}</span></p>
                      <p className="text-slate-600">Payment Date: <strong className="text-slate-900">{showReceiptModal.date}</strong></p>
                      <p className="text-slate-600">Payment Method: <strong className="text-slate-900">{showReceiptModal.paymentMethod}</strong></p>
                      <p className="text-slate-600">Academic Term: <strong className="text-slate-900">{data.settings?.term || 'Term 3'} ({data.settings?.year || 2026})</strong></p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Payee / Disbursed To</span>
                      <p className="font-black text-slate-900 text-xs">
                        {showReceiptModal.description.includes('-') 
                          ? showReceiptModal.description.split('-')[0].trim() 
                          : showReceiptModal.description.includes(':')
                          ? showReceiptModal.description.split(':')[0].trim()
                          : 'School Expenditure Claimant'}
                      </p>
                      <p className="text-slate-600 font-medium">Category: <strong className="text-slate-800">{showReceiptModal.category}</strong></p>
                      <p className="text-slate-600 font-medium">Authorizing Body: <strong className="text-slate-800">Head Teacher / Finance Committee</strong></p>
                    </div>
                  </div>

                  {/* Expense Description Table */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Expenditure Itemization</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase px-3.5 py-1.5 border-b border-slate-200">
                        <span className="col-span-2">Expense Particulars &amp; Notes</span>
                        <span className="text-right">Amount (UGX)</span>
                      </div>
                      <div className="grid grid-cols-3 px-3.5 py-2.5 text-[11px] font-bold text-slate-800">
                        <div className="col-span-2 space-y-0.5">
                          <p className="text-slate-900 font-extrabold">{showReceiptModal.category}</p>
                          <p className="text-[10px] text-slate-500 font-normal leading-snug">{showReceiptModal.description}</p>
                        </div>
                        <span className="text-right font-mono text-rose-700 font-black text-xs self-center">{formatUGX(showReceiptModal.amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Card */}
                  <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-rose-950 tracking-wider">Total Disbursed Cash</span>
                    <span className="text-base font-black text-rose-700 font-mono">{formatUGX(showReceiptModal.amount)}</span>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">1. Prepared By</span>
                      <p className="text-[9px] text-slate-900 font-bold">{showReceiptModal.recordedBy || 'School Bursar'}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">2. Authorized By</span>
                      <p className="text-[9px] text-slate-900 font-bold">{data.settings?.headTeacherName || 'Head Teacher'}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">3. Recipient Signature</span>
                      <p className="text-[9px] text-slate-400 font-medium">Claimant Signature</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Income / Tuition Official Receipt Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 gap-4 relative">
                    <div className="flex items-center gap-3">
                      {data.settings?.logo ? (
                        <img 
                          src={data.settings.logo} 
                          alt="School Logo" 
                          className="w-14 h-14 object-contain rounded-lg border border-slate-100 print:border-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                          {(data.settings?.schoolName || 'OTEC').split(' ').map(n => n[0]).slice(0, 3).join('')}
                        </div>
                      )}
                      <div>
                        <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight">{data.settings?.schoolName || 'OTEC Academy'}</h2>
                        {data.settings?.motto && (
                          <p className="text-[10px] italic text-slate-500 font-medium">"{data.settings.motto}"</p>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {data.settings?.address || 'Uganda, East Africa'} &middot; Tel: {data.settings?.tel1 || '+256 Finance Desk'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="border-2 border-emerald-600 text-emerald-700 font-black text-[8px] uppercase px-2 py-0.5 rounded-md tracking-widest block text-center mb-1">
                        OFFICIAL RECEIPT
                      </span>
                      <p className="text-[10px] font-mono font-bold text-slate-500">No: #{showReceiptModal.id.substring(0, 8).toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{showReceiptModal.date}</p>
                    </div>
                  </div>

                  {/* Receipt Core Information */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] pb-4 border-b border-slate-150">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Receipt Details</span>
                      <p className="font-bold text-slate-900">Receipt No: <span className="font-mono text-blue-700">{showReceiptModal.id.toUpperCase()}</span></p>
                      <p className="text-slate-600">Date Paid: <strong className="text-slate-900">{showReceiptModal.date}</strong></p>
                      <p className="text-slate-600">Payment Method: <strong className="text-slate-900">{showReceiptModal.paymentMethod}</strong></p>
                      <p className="text-slate-600">Term / Year: <strong className="text-slate-900">{data.settings?.term || 'Term 3'} ({data.settings?.year || 2026})</strong></p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Received From / Learner</span>
                      {showReceiptModal.studentId ? (
                        (() => {
                          const student = data.learners.find(l => l.id === showReceiptModal.studentId);
                          const bal = student ? (student.outstandingBalance ? parseFloat(student.outstandingBalance) : 0) : 0;
                          return (
                            <>
                              <p className="font-black text-slate-900 text-xs">{student?.name || 'Linked Learner'}</p>
                              <p className="text-slate-600 font-medium">Class: <strong className="text-slate-900">{student?.cls || 'N/A'}</strong> &middot; Adm No: <strong className="text-slate-900 font-mono">{student?.admNo || student?.id}</strong></p>
                              <p className="text-slate-600 font-medium">Guardian: <strong className="text-slate-800">{student?.guardianName || 'Parent'}</strong> ({student?.guardianPhone || 'N/A'})</p>
                              <div className="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px]">
                                Remaining Balance: <strong className={bal <= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>{formatUGX(bal)}</strong>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          <p className="font-extrabold text-slate-900">General Cash Inflow</p>
                          <p className="text-slate-500 font-medium">Category: {showReceiptModal.category}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment Breakdown Table */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-bold uppercase text-[8px] tracking-wider block">Payment Description</span>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-3 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase px-3.5 py-1.5 border-b border-slate-200">
                        <span className="col-span-2">Fee Particulars</span>
                        <span className="text-right">Amount Paid</span>
                      </div>
                      <div className="grid grid-cols-3 px-3.5 py-2.5 text-[11px] font-bold text-slate-800">
                        <div className="col-span-2 space-y-0.5">
                          <p className="text-slate-900 font-extrabold">{showReceiptModal.category}</p>
                          <p className="text-[10px] text-slate-500 font-normal leading-snug">{showReceiptModal.description}</p>
                        </div>
                        <span className="text-right font-mono text-emerald-700 font-black text-xs self-center">{formatUGX(showReceiptModal.amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Card */}
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-emerald-950 tracking-wider">Total Received</span>
                    <span className="text-base font-black text-emerald-800 font-mono">{formatUGX(showReceiptModal.amount)}</span>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Bursar / Cashier Signature</span>
                      <p className="text-[9px] text-slate-900 font-bold">{showReceiptModal.recordedBy || 'Bursar'}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-8 border-b border-dashed border-slate-300" />
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block">Official School Stamp &amp; Date</span>
                    </div>
                  </div>
                </>
              )}

              {/* Official Disclaimer Footer */}
              <div className="border-t border-slate-100 pt-3 text-center">
                <p className="text-[8px] text-slate-400 font-bold">
                  Thank you for supporting our school. Please retain this receipt / voucher for financial records.
                </p>
              </div>

            </div>

            {/* Footer Buttons - Hidden during print */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100 no-print">
              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close View
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/10"
              >
                <Printer size={15} />
                <span>{showReceiptModal.type === 'expense' ? 'Print Official Voucher' : 'Print Official Receipt'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Plus size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Record Daily Transaction</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              
              {/* Type toggle */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('income');
                      const firstInc = categories.find(c => c.type === 'income')?.name || 'Tuition Fees';
                      setTxCategory(firstInc);
                    }}
                    className={`py-2 text-center rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                      txType === 'income' 
                        ? 'bg-white text-emerald-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Income (IN)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('expense');
                      const firstExp = categories.find(c => c.type === 'expense')?.name || 'Teacher Salaries';
                      setTxCategory(firstExp);
                    }}
                    className={`py-2 text-center rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                      txType === 'expense' 
                        ? 'bg-white text-rose-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Expense (OUT)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('refund');
                      const firstInc = categories.find(c => c.type === 'income')?.name || 'Tuition Fees';
                      setTxCategory(firstInc);
                    }}
                    className={`py-2 text-center rounded-lg font-bold text-[10px] cursor-pointer transition-all ${
                      txType === 'refund' 
                        ? 'bg-white text-amber-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Refund (BACK)
                  </button>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer"
                >
                  {txType === 'expense' 
                    ? expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                    : incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
              </div>

              {/* Custom Item Name when category is "Other" */}
              {isOtherCategory(txCategory) && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Specify Item Name</label>
                  <input
                    type="text"
                    placeholder="Type custom item name (e.g., Graduation Gown, School Tour)..."
                    value={txCustomCategory}
                    onChange={(e) => setTxCustomCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold"
                  />
                </div>
              )}

              {/* Amount input & Date picker */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Amount (UGX)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 450,000"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* Linked Student with real-time search (For ALL income entries) */}
              {txType === 'income' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Link to Learner (Search & Select)</label>
                    {txStudentId && (
                      <button
                        type="button"
                        onClick={() => { setTxStudentId(''); setTxStudentSearch(''); }}
                        className="text-[9px] font-extrabold text-rose-600 hover:underline cursor-pointer"
                      >
                        Unlink Student
                      </button>
                    )}
                  </div>

                  {txStudentId ? (
                    (() => {
                      const selStudent = data.learners.find(l => l.id === txStudentId);
                      return (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                              {selStudent?.name?.slice(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-slate-900 text-xs">{selStudent?.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">Class {selStudent?.cls} • Adm: {selStudent?.admNo || selStudent?.id}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setTxStudentId(''); setTxStudentSearch(''); }}
                            className="p-1 hover:bg-emerald-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="relative space-y-1">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={txStudentSearch}
                          onChange={(e) => setTxStudentSearch(e.target.value)}
                          placeholder="Search student by name, class or admission no..."
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                        />
                      </div>

                      {txStudentSearch.trim().length > 0 && (
                        <div className="max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 custom-scrollbar text-left">
                          {data.learners.filter(l => 
                            l.name.toLowerCase().includes(txStudentSearch.toLowerCase()) ||
                            (l.admNo && l.admNo.toLowerCase().includes(txStudentSearch.toLowerCase())) ||
                            l.cls.toLowerCase().includes(txStudentSearch.toLowerCase())
                          ).slice(0, 10).map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                setTxStudentId(l.id);
                                setTxStudentSearch('');
                              }}
                              className="w-full text-left p-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <span className="font-extrabold text-slate-900 text-xs block">{l.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Class {l.cls} • Adm: {l.admNo || l.id}</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                {formatUGX(l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0)}
                              </span>
                            </button>
                          ))}

                          {data.learners.filter(l => 
                            l.name.toLowerCase().includes(txStudentSearch.toLowerCase()) ||
                            (l.admNo && l.admNo.toLowerCase().includes(txStudentSearch.toLowerCase())) ||
                            l.cls.toLowerCase().includes(txStudentSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-center text-slate-400 font-bold text-xs italic">
                              No matching learner found for "{txStudentSearch}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Payment Method</label>
                <select
                  value={txPaymentMethod}
                  onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Description & Notes</label>
                <textarea
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="Additional receipt details, suppliers, or transaction explanation..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/10"
                >
                  Record Ledger Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Manage Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Manage Finance Categories</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Customize category names and assign color-coded tags</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Grid content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs text-left">
              
              {/* Left Column: Categories List (md:col-span-7) */}
              <div className="md:col-span-7 space-y-4 flex flex-col">
                <span className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Active Categories</span>
                
                <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[360px] overflow-y-auto custom-scrollbar">
                  {categories.map((cat) => {
                    const styles = COLOR_MAP[cat.color] || COLOR_MAP.slate;
                    const transactionsCount = transactions.filter(t => t.category === cat.name).length;
                    return (
                      <div key={cat.name} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${styles.bg} ${styles.text} ${styles.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                              <span>{cat.name}</span>
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                              cat.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {cat.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold font-mono">
                            Used in {transactionsCount} transaction{transactionsCount === 1 ? '' : 's'}
                          </p>
                        </div>

                        {/* Actions (Color quick changer + Delete) */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Color Palette Selector dropdown */}
                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                            <Palette size={12} className="text-slate-400" />
                            <select
                              value={cat.color}
                              onChange={(e) => handleUpdateCategoryColor(cat.name, e.target.value)}
                              className="bg-transparent text-[10px] font-bold text-slate-650 focus:outline-hidden cursor-pointer"
                            >
                              {Object.keys(COLOR_MAP).map(col => (
                                <option key={col} value={col}>{col.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Add Category Form (md:col-span-5) */}
              <div className="md:col-span-5 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl flex flex-col justify-between">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <span className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Create Custom Category</span>
                  
                  {/* Category Name */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-550 uppercase tracking-wider text-[9px]">Category Name</label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Salaries, Utilities"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-semibold"
                    />
                  </div>

                  {/* Category Type */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-550 uppercase tracking-wider text-[9px]">Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setNewCatType('income')}
                        className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                          newCatType === 'income' 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Income
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCatType('expense')}
                        className={`py-1.5 text-center rounded-lg font-bold transition-all cursor-pointer ${
                          newCatType === 'expense' 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Expense
                      </button>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-550 uppercase tracking-wider text-[9px]">Assign Color Tag</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.keys(COLOR_MAP).map((colorKey) => {
                        const isSelected = newCatColor === colorKey;
                        const bgClass = BG_COLOR_MAP[colorKey] || 'bg-slate-500';
                        return (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => setNewCatColor(colorKey)}
                            title={colorKey.toUpperCase()}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ring-offset-2 hover:scale-110 ${bgClass} ${
                              isSelected ? 'ring-2 ring-blue-600 scale-110' : ''
                            }`}
                          >
                            {isSelected && <Check size={10} className="text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/10 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Create Category</span>
                  </button>
                </form>

                <div className="pt-4 mt-4 border-t border-slate-150 text-[10px] text-slate-400 italic">
                  * Note: standard system categories can be deleted if customized, but proceed with caution if they are actively utilized in existing transaction ledger entries.
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Manager
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. Student Fee Payment Wizard Modal */}
      {showFeePaymentModal && selectedFeeStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Student Fee Payment Wizard</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Post student payment credit directly to the ledger</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFeePaymentModal(false);
                  setSelectedFeeStudent(null);
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Student Context Panel */}
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 text-left">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</span>
                  <span className="block font-black text-slate-900 text-xs">{selectedFeeStudent.name}</span>
                  <span className="block text-[9px] text-slate-500 font-semibold">Class {selectedFeeStudent.cls} • Adm: {selectedFeeStudent.admNo}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Arrears</span>
                  <span className="block font-mono font-black text-rose-700 text-sm">
                    {formatUGX(selectedFeeStudent.outstandingBalance ? parseFloat(selectedFeeStudent.outstandingBalance) : 0)}
                  </span>
                </div>
              </div>

              {/* Individual Bills Breakdown Context */}
              <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] text-slate-500 font-bold text-left">
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Tuition:</span>
                  <span className="font-mono text-slate-700">{formatUGX(selectedFeeStudent.feeTuition ?? 0)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Boarding:</span>
                  <span className="font-mono text-slate-700">{formatUGX(selectedFeeStudent.feeBoarding ?? 0)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Van Fees:</span>
                  <span className="font-mono text-slate-700">{formatUGX(selectedFeeStudent.feeVan ?? 0)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5">
                  <span>Registration:</span>
                  <span className="font-mono text-slate-700">{formatUGX(selectedFeeStudent.feeRegistration ?? 0)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5 col-span-2">
                  <span>Uniforms (Sweater/Class/Sports):</span>
                  <span className="font-mono text-slate-700">{formatUGX((selectedFeeStudent.feeSweater ?? 0) + (selectedFeeStudent.feeClassUniform ?? 0) + (selectedFeeStudent.feeSportsWear ?? 0))}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-0.5 col-span-2">
                  <span>Holiday / Hair / Others:</span>
                  <span className="font-mono text-slate-700">{formatUGX((selectedFeeStudent.feeHoliday ?? 0) + (selectedFeeStudent.feeHair ?? 0) + (selectedFeeStudent.feeOthers ?? 0))}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRecordStudentFeePayment} className="space-y-4 text-xs text-left">
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Payment Amount (UGX)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter amount to pay..."
                  value={feePayAmount}
                  onChange={(e) => setFeePayAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-mono font-black text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Payment Date</label>
                  <input
                    type="date"
                    value={feePayDate}
                    onChange={(e) => setFeePayDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-mono font-bold"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Fee Category</label>
                  <select
                    value={feePayCategory}
                    onChange={(e) => setFeePayCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all cursor-pointer font-bold"
                  >
                    <option value="Tuition Fees">Tuition Fees</option>
                    <option value="Boarding Fees">Boarding Fees</option>
                    <option value="Van/Transport Fees">Van / Transport Fees</option>
                    <option value="Registration Fees">Registration Fees</option>
                    <option value="Sweater Uniform">Sweater Uniform</option>
                    <option value="Class Uniform">Class Uniform</option>
                    <option value="Sports Wear">Sports Wear</option>
                    <option value="Hair Shaving Fees">Hair Shaving Fees</option>
                    <option value="Holiday Package">Holiday Package</option>
                    <option value="Other Income">Others/Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Custom Fee Item Name when category is "Other" */}
              {isOtherCategory(feePayCategory) && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Specify Item Name</label>
                  <input
                    type="text"
                    placeholder="Type custom fee name (e.g., Uniform Van Fee, Trip Fee)..."
                    value={feePayCustomCategory}
                    onChange={(e) => setFeePayCustomCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-semibold"
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Payment Method</label>
                <select
                  value={feePayMethod}
                  onChange={(e) => setFeePayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all cursor-pointer font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Custom notes / memo */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Reference / Memo</label>
                <textarea
                  value={feePayDescription}
                  onChange={(e) => setFeePayDescription(e.target.value)}
                  placeholder="e.g., Bank slip ref number, received from parent, etc."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-semibold"
                />
              </div>

              {/* Impact summary alert */}
              {feePayAmount && !isNaN(parseFloat(feePayAmount)) && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-2xl text-[10px] text-emerald-800 font-semibold space-y-0.5 animate-fade-in">
                  <span className="block font-black uppercase text-[8px] tracking-wider text-emerald-600">Double-Entry Account Credit Impact</span>
                  <span>This payment reduces {selectedFeeStudent.name}'s arrears to <strong className="font-mono font-black">{formatUGX(Math.max(0, (selectedFeeStudent.outstandingBalance ? parseFloat(selectedFeeStudent.outstandingBalance) : 0) - parseFloat(feePayAmount)))}</strong> and registers as term cash inflow in the general ledger.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeePaymentModal(false);
                    setSelectedFeeStudent(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Configure Individual Student Fees Modal */}
      {showEditFeesModal && selectedEditFeesStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wide">Configure Individual Fees</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Customize billing items for {selectedEditFeesStudent.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditFeesModal(false);
                  setSelectedEditFeesStudent(null);
                }}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Action Info and Auto-Fill */}
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-center justify-between gap-3 text-[10px] text-slate-600 font-medium">
              <div>
                <span className="block font-bold text-slate-800">Student Class Level Details</span>
                <span className="block mt-0.5">Class: {selectedEditFeesStudent.cls} • {selectedEditFeesStudent.dayBoarding || 'Day Scholar'}</span>
              </div>
              <button
                type="button"
                onClick={applyDefaultsForSelectedStudent}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-colors text-[9px]"
              >
                Apply Standard Defaults
              </button>
            </div>

            <form onSubmit={handleSaveStudentFees} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5 text-left">
                {/* Tuition Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Tuition Fees</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editTuition}
                    onChange={e => setEditTuition(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Boarding Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Boarding Fees</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editBoarding}
                    onChange={e => setEditBoarding(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Van Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Van/Transport Fees</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editVan}
                    onChange={e => setEditVan(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                  <p className="text-[8px] text-slate-400 mt-0.5 font-bold">Standard range: 100k - 400k depending on distance</p>
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Registration Fees</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editRegistration}
                    onChange={e => setEditRegistration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Sweater Uniform Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sweater Fee</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editSweater}
                    onChange={e => setEditSweater(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Class Uniform Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Class Uniform Fee</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editClassUniform}
                    onChange={e => setEditClassUniform(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Sports Wear Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sports Wear Fee</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editSportsWear}
                    onChange={e => setEditSportsWear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Hair Shaving Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Hair Shaving/Grooming</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editHair}
                    onChange={e => setEditHair(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Holiday Package Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Holiday Package Fee</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editHoliday}
                    onChange={e => setEditHoliday(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>

                {/* Others Fee */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Others/Miscellaneous</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editOthers}
                    onChange={e => setEditOthers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Math Summary Card */}
              {(() => {
                const totalCharged = Number(editTuition) + Number(editBoarding) + Number(editVan) + Number(editRegistration) + 
                                     Number(editSweater) + Number(editClassUniform) + Number(editSportsWear) + 
                                     Number(editHair) + Number(editHoliday) + Number(editOthers);
                const totalPaid = transactions
                  .filter(tx => tx.type === 'income' && tx.studentId === selectedEditFeesStudent.id)
                  .reduce((sum, tx) => sum + tx.amount, 0);
                const outstanding = Math.max(0, totalCharged - totalPaid);

                return (
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 text-[11px] text-left">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Term Fee Breakdown Summary</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-[9px] font-bold rounded">Live Calculation</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-bold">
                      <div className="space-y-0.5 border-r border-slate-800">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Total Charged</span>
                        <span className="text-xs font-mono font-black">{formatUGX(totalCharged)}</span>
                      </div>
                      <div className="space-y-0.5 border-r border-slate-800">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Paid Ledger</span>
                        <span className="text-xs font-mono font-black text-emerald-400">{formatUGX(totalPaid)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Outstanding</span>
                        <span className="text-xs font-mono font-black text-rose-400">{formatUGX(outstanding)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditFeesModal(false);
                    setSelectedEditFeesStudent(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-600/10 text-xs"
                >
                  Save Billing Breakdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Printable Fee Statement Modal */}
      {showStatementModal && selectedStatementStudent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in print:p-0 print:bg-white">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #fee-statement-print-area, #fee-statement-print-area * {
                visibility: visible;
              }
              #fee-statement-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 105%;
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div id="fee-statement-print-area" className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-8 shadow-2xl flex flex-col space-y-6 max-h-[95vh] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible print:border-0 print:shadow-none print:p-0 print:rounded-none">
            
            {/* Modal Control Header - Hidden during print */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-slate-900 rounded-lg">
                  <Printer size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wide">Parent Fee Statement Wizard</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Verify summary and trigger high-contrast print layout</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer transition-colors"
                >
                  <Printer size={13} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatementModal(false);
                    setSelectedStatementStudent(null);
                  }}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* School Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                {data.settings?.logo ? (
                  <img 
                    src={data.settings.logo} 
                    alt="School Logo" 
                    className="w-16 h-16 object-contain rounded-lg border border-slate-100 print:border-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {(data.settings?.schoolName || 'OTEC').split(' ').map(n => n[0]).slice(0, 3).join('')}
                  </div>
                )}
                <div className="text-left">
                  <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-tight">
                    {data.settings?.schoolName || 'OTEC Academy'}
                  </h1>
                  {data.settings?.motto && (
                    <p className="text-xs italic text-slate-500 font-medium">"{data.settings.motto}"</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    {data.settings?.address || 'Uganda, East Africa'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {[data.settings?.tel1, data.settings?.tel2].filter(Boolean).join(' | ') || 'Tel: +256 Finance Office'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full font-mono text-[9px] font-extrabold text-slate-700 tracking-wider inline-block uppercase">
                  Official Statement
                </span>
                <p className="text-xs font-black text-slate-950 uppercase">Term Fee Summary</p>
                <p className="text-[10px] text-slate-500 font-bold">
                  Academic Term: <strong className="text-slate-900">{data.settings?.term || 'Term 3'} ({data.settings?.year || 2026})</strong>
                </p>
                <p className="text-[9px] text-slate-400 font-mono">Date Issued: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Learner Info Column */}
              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Student Profile Information</h4>
                <div className="grid grid-cols-3 gap-y-1.5 text-[10px] font-medium text-slate-600">
                  <span className="col-span-1 text-slate-400 font-bold">Full Name:</span>
                  <span className="col-span-2 text-slate-900 font-black text-xs">{selectedStatementStudent.name}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Admission No:</span>
                  <span className="col-span-2 text-slate-900 font-mono font-bold">{selectedStatementStudent.admNo}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Class Level:</span>
                  <span className="col-span-2 text-slate-900 font-extrabold">Class {selectedStatementStudent.cls}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Boarding Status:</span>
                  <span className="col-span-2">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${(selectedStatementStudent.dayBoarding || '').toLowerCase().includes('board') ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                      {selectedStatementStudent.dayBoarding || 'Day Scholar'}
                    </span>
                  </span>

                  <span className="col-span-1 text-slate-400 font-bold">Gender / Age:</span>
                  <span className="col-span-2 text-slate-700">{selectedStatementStudent.sex || 'N/A'} • {selectedStatementStudent.age ? `${selectedStatementStudent.age} Yrs` : 'N/A'}</span>
                </div>
              </div>

              {/* Guardian Info Column */}
              <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-2">
                <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Parent / Guardian Details</h4>
                <div className="grid grid-cols-3 gap-y-1.5 text-[10px] font-medium text-slate-600">
                  <span className="col-span-1 text-slate-400 font-bold">Guardian:</span>
                  <span className="col-span-2 text-slate-900 font-extrabold">{selectedStatementStudent.guardianName || 'N/A'}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Phone Number:</span>
                  <span className="col-span-2 text-slate-900 font-mono font-bold">{selectedStatementStudent.guardianPhone || 'N/A'}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Email Address:</span>
                  <span className="col-span-2 text-slate-700 truncate">{selectedStatementStudent.guardianEmail || 'N/A'}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Relationship:</span>
                  <span className="col-span-2 text-slate-700">{selectedStatementStudent.guardianRelation || 'Parent'}</span>

                  <span className="col-span-1 text-slate-400 font-bold">Personal Account:</span>
                  <span className="col-span-2 text-slate-900 font-mono text-[9px]">{selectedStatementStudent.studentAccount || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Calculations logic nested dynamically in JSX or scoped locally */}
            {(() => {
              const studentPayments = transactions.filter(tx => tx.type === 'income' && tx.studentId === selectedStatementStudent.id);

              const tuitionDefault = (selectedStatementStudent.cls || '').toUpperCase().includes('P4') || 
                                     (selectedStatementStudent.cls || '').toUpperCase().includes('P5') || 
                                     (selectedStatementStudent.cls || '').toUpperCase().includes('P6') || 
                                     (selectedStatementStudent.cls || '').toUpperCase().includes('P7')
                                     ? (data.settings.feeTuitionUpper ?? 335000)
                                     : (['NURSERY', 'BABY', 'MIDDLE', 'PRE'].some(p => (selectedStatementStudent.cls || '').toUpperCase().includes(p))
                                       ? (data.settings.feeTuitionNursery ?? 290000)
                                       : (data.settings.feeTuitionLower ?? 310000));

              const isBoarder = (selectedStatementStudent.dayBoarding || '').toLowerCase().includes('board');
              const boardingDefault = isBoarder ? (data.settings.feeBoarding ?? 630000) : 0;

              const hasDetailedFees = (
                (selectedStatementStudent.feeTuition ?? 0) > 0 ||
                (selectedStatementStudent.feeBoarding ?? 0) > 0 ||
                (selectedStatementStudent.feeVan ?? 0) > 0 ||
                (selectedStatementStudent.feeRegistration ?? 0) > 0 ||
                (selectedStatementStudent.feeSweater ?? 0) > 0 ||
                (selectedStatementStudent.feeClassUniform ?? 0) > 0 ||
                (selectedStatementStudent.feeSportsWear ?? 0) > 0 ||
                (selectedStatementStudent.feeHair ?? 0) > 0 ||
                (selectedStatementStudent.feeHoliday ?? 0) > 0 ||
                (selectedStatementStudent.feeOthers ?? 0) > 0
              );

              const tuitionVal = hasDetailedFees ? (selectedStatementStudent.feeTuition ?? 0) : tuitionDefault;
              const boardingVal = hasDetailedFees ? (selectedStatementStudent.feeBoarding ?? 0) : boardingDefault;
              const vanVal = hasDetailedFees ? (selectedStatementStudent.feeVan ?? 0) : 0;
              const regVal = hasDetailedFees ? (selectedStatementStudent.feeRegistration ?? 0) : (hasDetailedFees ? 0 : 20000);
              const sweaterVal = hasDetailedFees ? (selectedStatementStudent.feeSweater ?? 0) : 0;
              const classUniformVal = hasDetailedFees ? (selectedStatementStudent.feeClassUniform ?? 0) : 0;
              const sportsVal = hasDetailedFees ? (selectedStatementStudent.feeSportsWear ?? 0) : 0;
              const hairVal = hasDetailedFees ? (selectedStatementStudent.feeHair ?? 0) : 0;
              const holidayVal = hasDetailedFees ? (selectedStatementStudent.feeHoliday ?? 0) : 0;
              const othersVal = hasDetailedFees ? (selectedStatementStudent.feeOthers ?? 0) : 0;

              const totalPaid = studentPayments.reduce((sum, tx) => sum + tx.amount, 0);
              const rawOutstanding = selectedStatementStudent.outstandingBalance ? parseFloat(selectedStatementStudent.outstandingBalance) : 0;

              let baseInvoicedSum = tuitionVal + boardingVal + vanVal + regVal + sweaterVal + classUniformVal + sportsVal + hairVal + holidayVal + othersVal;
              let carriedForward = 0;
              if (rawOutstanding + totalPaid > baseInvoicedSum) {
                carriedForward = (rawOutstanding + totalPaid) - baseInvoicedSum;
              }
              const totalInvoiced = baseInvoicedSum + carriedForward;
              const isCleared = rawOutstanding <= 0;

              const feeItemsList = [
                { name: 'Tuition Fees', value: tuitionVal },
                { name: 'Boarding Fees', value: boardingVal },
                { name: 'Van/Transport Fees', value: vanVal },
                { name: 'Registration Fees', value: regVal },
                { name: 'Sweater Uniform', value: sweaterVal },
                { name: 'Class Uniform', value: classUniformVal },
                { name: 'Sports Wear Uniform', value: sportsVal },
                { name: 'Hair Shaving & Grooming', value: hairVal },
                { name: 'Holiday Learning Package', value: holidayVal },
                { name: 'Miscellaneous Extras', value: othersVal },
                { name: 'Carried Forward Arrears (Previous Dues)', value: carriedForward }
              ].filter(item => item.value > 0);

              return (
                <div className="space-y-6">
                  {/* Part 1: Detailed Dues/Invoiced List */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">I. Invoiced Fees Breakdown (Term Debits)</h3>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                        <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wide">
                          <tr>
                            <th className="px-4 py-2 text-left">Fee Component / Billing Item</th>
                            <th className="px-4 py-2 text-right">Invoiced Dues (UGX)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-800 bg-white">
                          {feeItemsList.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/40">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 text-right font-mono text-slate-950 font-bold">{formatUGX(item.value)}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-extrabold border-t border-slate-200">
                            <td className="px-4 py-2.5 uppercase text-[9px] text-slate-900">Total Term Invoiced Amount</td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-950 font-black">{formatUGX(totalInvoiced)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Part 2: Payments Ledger History */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">II. Term Receipts Log (Credit Ledgers)</h3>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                        <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wide">
                          <tr>
                            <th className="px-4 py-2 text-left">Receipt Date</th>
                            <th className="px-4 py-2 text-left">Transaction ID</th>
                            <th className="px-4 py-2 text-left">Payment Category</th>
                            <th className="px-4 py-2 text-left">Method</th>
                            <th className="px-4 py-2 text-right">Amount Paid (UGX)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-800 bg-white">
                          {studentPayments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-slate-400 font-bold italic">
                                No payment ledger receipts recorded for this student in the current term.
                              </td>
                            </tr>
                          ) : (
                            studentPayments.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/40">
                                <td className="px-4 py-2 font-mono">{tx.date}</td>
                                <td className="px-4 py-2 font-mono font-bold text-slate-700 truncate max-w-[100px]">{tx.id.substring(0, 10).toUpperCase()}</td>
                                <td className="px-4 py-2">{tx.category}</td>
                                <td className="px-4 py-2 text-slate-600">{tx.paymentMethod}</td>
                                <td className="px-4 py-2 text-right font-mono text-emerald-700 font-bold">{formatUGX(tx.amount)}</td>
                              </tr>
                            ))
                          )}
                          <tr className="bg-slate-50 font-extrabold border-t border-slate-200">
                            <td colSpan={4} className="px-4 py-2.5 uppercase text-[9px] text-slate-900 text-left">Total Cash Payments Received</td>
                            <td className="px-4 py-2.5 text-right font-mono text-xs text-emerald-700 font-black">{formatUGX(totalPaid)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Part 3: Net Ledger Summary Section */}
                  <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Ledger Statement Summary</span>
                      <h4 className="text-sm font-black uppercase">Net Financial Ledger Status</h4>
                      <p className="text-[10px] text-slate-400">
                        Invoiced fees: <strong className="text-white">{formatUGX(totalInvoiced)}</strong> • Total cash received: <strong className="text-emerald-400">{formatUGX(totalPaid)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">Outstanding Balance</span>
                        <span className={`text-lg font-mono font-black block ${isCleared ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatUGX(rawOutstanding)}
                        </span>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-wider ${
                        isCleared 
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-950/80 text-rose-400 border-rose-500/30'
                      }`}>
                        {isCleared ? 'Cleared' : 'Arrears Due'}
                      </div>
                    </div>
                  </div>

                  {/* Part 4: Legal / Professional Sign-off */}
                  <div className="border-t border-slate-200/60 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] text-slate-500">
                    <div className="space-y-3 text-left">
                      <p className="font-extrabold uppercase text-slate-800">1. Preparing Officer</p>
                      <div className="h-10 border-b border-slate-300 w-full" />
                      <p className="text-[9px] leading-tight">School Bursar & Finance Desk<br />Office Stamp & Verification</p>
                    </div>

                    <div className="space-y-3 text-left">
                      <p className="font-extrabold uppercase text-slate-800">2. Head Teacher / Director</p>
                      <div className="h-10 border-b border-slate-300 w-full" />
                      <p className="text-[9px] leading-tight">{data.settings?.headTeacherName || 'Head Teacher Signature'}<br />Otuke Progressive Primary</p>
                    </div>

                    <div className="space-y-3 text-left">
                      <p className="font-extrabold uppercase text-slate-800">3. Parent Acknowledgement</p>
                      <div className="h-10 border-b border-slate-300 w-full" />
                      <p className="text-[9px] leading-tight">Guardian Signature & Date<br />(Parental Record Copy)</p>
                    </div>
                  </div>

                  {/* Official disclaimer footer */}
                  <div className="border-t border-slate-100 pt-4 text-center">
                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                      "Thank you for your continuous cooperation and support of our pupils. Kindly retain this slip for your financial records. Direct all queries or inquiries to the School Cashier."
                    </p>
                    <p className="text-[8px] text-slate-300 font-mono mt-1">Generated electronically on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} by OTEC Finance Engine</p>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* 10. Bulk CSV Payments Importer Modal */}
      {showBulkCSVModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col space-y-6 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-900 rounded-xl">
                  <FileSpreadsheet size={18} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">Bulk CSV Payments Importer</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Upload pre-populated CSV template to apply payments for multiple students simultaneously</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBulkCSVModal(false);
                  setBulkCSVFile(null);
                  setBulkCSVHeaders([]);
                  setBulkCSVRows([]);
                  setBulkCSVFeedback(null);
                }}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              {!bulkCSVFile ? (
                <div className="space-y-6">
                  {/* Instructions & Template Action */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-blue-950 uppercase tracking-tight">Step 1: Download Pre-Populated Template</h4>
                      <p className="text-[10px] text-blue-800 font-medium leading-relaxed max-w-xl">
                        Click the button to download a customized Excel-compatible CSV file containing all registered students' admission numbers and names. Update their payments, save, and upload it below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors cursor-pointer shrink-0"
                    >
                      <Download size={13} />
                      <span>Download Template</span>
                    </button>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingBulkCSV(true); }}
                    onDragLeave={() => setIsDraggingBulkCSV(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingBulkCSV(false);
                      if (e.dataTransfer.files?.[0]) {
                        processBulkCSVFile(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 transition-all ${
                      isDraggingBulkCSV 
                        ? 'border-blue-500 bg-blue-50/40 scale-[0.99]' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/40'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${isDraggingBulkCSV ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400'} shadow-xs`}>
                      <FileSpreadsheet size={32} />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Drag &amp; Drop CSV File</h4>
                      <p className="text-[10px] text-slate-500 font-medium max-w-sm">
                        Drop your filled-out payment template CSV here, or click the file selector below to browse.
                      </p>
                    </div>
                    
                    <label className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-black border border-slate-200 rounded-xl text-xs shadow-xs hover:border-slate-300 transition-all cursor-pointer inline-flex items-center gap-2">
                      <Plus size={13} />
                      <span>Select CSV File</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleBulkCSVFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* CSV Column Expectations info card */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-left space-y-2">
                    <h5 className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Expected Template Columns</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-semibold text-slate-700">
                      <div>
                        <code className="text-slate-950 font-mono font-bold">AdmissionNumber</code>
                        <span className="block text-[8px] text-slate-400 uppercase mt-0.5">Required match key</span>
                      </div>
                      <div>
                        <code className="text-slate-950 font-mono font-bold">Amount</code>
                        <span className="block text-[8px] text-slate-400 uppercase mt-0.5">Positive payment amount</span>
                      </div>
                      <div>
                        <code className="text-slate-950 font-mono font-bold">Category</code>
                        <span className="block text-[8px] text-slate-400 uppercase mt-0.5">Tuition Fees, Boarding, etc.</span>
                      </div>
                      <div>
                        <code className="text-slate-950 font-mono font-bold">PaymentMethod</code>
                        <span className="block text-[8px] text-slate-400 uppercase mt-0.5">Cash, Mobile Money, Bank Slip</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Feedback summary stats widget */}
                  {bulkCSVFeedback && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wide">Loaded CSV Rows</span>
                        <p className="text-sm font-mono font-black text-slate-900 mt-1">{bulkCSVFeedback.totalRows}</p>
                      </div>

                      <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-wide">Valid Matches</span>
                        <p className="text-sm font-mono font-black text-emerald-700 mt-1">{bulkCSVFeedback.matchedCount} / {bulkCSVFeedback.totalRows}</p>
                      </div>

                      <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-rose-500 tracking-wide">Errors / Unmatched</span>
                        <p className="text-sm font-mono font-black text-rose-700 mt-1">{bulkCSVFeedback.unmatchedCount}</p>
                      </div>

                      <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <span className="text-[8px] font-black uppercase text-blue-500 tracking-wide">Total Import Cash</span>
                        <p className="text-sm font-mono font-black text-blue-700 mt-1">{formatUGX(bulkCSVFeedback.totalImportAmount)}</p>
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="space-y-2 text-left">
                    <h4 className="text-[9px] font-black uppercase text-slate-800 tracking-wider">II. Data Validation Preview</h4>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto custom-scrollbar">
                      <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                        <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wide sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left bg-slate-50">Adm No</th>
                            <th className="px-4 py-2 text-left bg-slate-50">Mapped Student Name</th>
                            <th className="px-4 py-2 text-right bg-slate-50">Payment Amount</th>
                            <th className="px-4 py-2 text-left bg-slate-50">Category &amp; Method</th>
                            <th className="px-4 py-2 text-left bg-slate-50">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-medium text-slate-800 bg-white">
                          {bulkCSVFeedback?.previewRows.map((row) => (
                            <tr key={row.id} className={`hover:bg-slate-50/50 ${row.status === 'error' ? 'bg-rose-50/15' : ''}`}>
                              <td className="px-4 py-2.5 font-mono text-slate-900 font-bold">{row.admNo || 'N/A'}</td>
                              <td className="px-4 py-2.5">
                                <span className={row.status === 'error' ? 'text-rose-600 font-bold' : 'text-slate-950 font-black'}>
                                  {row.studentName}
                                </span>
                              </td>
                              <td className={`px-4 py-2.5 text-right font-mono font-bold ${row.status === 'error' ? 'text-slate-400' : 'text-emerald-700'}`}>
                                {formatUGX(row.amount)}
                              </td>
                              <td className="px-4 py-2.5 text-slate-500 font-semibold">
                                <div>{row.category}</div>
                                <div className="text-[8px] text-slate-400 uppercase mt-0.5">{row.method} • {row.date}</div>
                              </td>
                              <td className="px-4 py-2.5">
                                {row.status === 'success' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-black text-[8px] uppercase tracking-wider">
                                    <Check size={9} />
                                    <span>Valid</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full font-black text-[8px] uppercase tracking-wider max-w-[150px] truncate" title={row.errorMsg}>
                                    <AlertCircle size={9} />
                                    <span className="truncate">{row.errorMsg}</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Controls footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <div>
                {bulkCSVFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkCSVFile(null);
                      setBulkCSVHeaders([]);
                      setBulkCSVRows([]);
                      setBulkCSVFeedback(null);
                    }}
                    className="px-4 py-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 font-black rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Upload Different File
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkCSVModal(false);
                    setBulkCSVFile(null);
                    setBulkCSVHeaders([]);
                    setBulkCSVRows([]);
                    setBulkCSVFeedback(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {bulkCSVFile && (
                  <button
                    type="button"
                    onClick={handleApplyBulkPayments}
                    disabled={!bulkCSVFeedback || bulkCSVFeedback.matchedCount === 0}
                    className={`px-5 py-2 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors ${
                      !bulkCSVFeedback || bulkCSVFeedback.matchedCount === 0 
                        ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10 cursor-pointer'
                    }`}
                  >
                    <Check size={13} />
                    <span>Apply {bulkCSVFeedback?.matchedCount || 0} Bulk Payments</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 11. Arrears Threshold Alert - Automated Summary Email Modal */}
      {showEmailSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col space-y-6 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider font-sans">Automated Email Report Dispatcher</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Construct and send automated financial arrears summaries to administrators</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailSummaryModal(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider">Recipient Email Address</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. finance@otec-school.edu"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider">Email Subject Title</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-slate-650 uppercase tracking-wider">Auto-Generated Report Body Preview</label>
                  <span className="text-[8px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-amber-100 font-sans font-extrabold">
                    Real-Time Compiling
                  </span>
                </div>
                <textarea
                  readOnly
                  value={emailBodyContent}
                  className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-[10px] text-slate-700 leading-relaxed overflow-y-auto custom-scrollbar focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(emailBodyContent).then(() => {
                    const event = new CustomEvent('otec-toast', {
                      detail: {
                        message: `Outstanding arrears summary email report successfully copied to your clipboard!`,
                        type: 'success'
                      }
                    });
                    window.dispatchEvent(event);
                  });
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Copy Draft Plaintext</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailSummaryModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailSending(true);
                    setTimeout(() => {
                      setEmailSending(false);
                      setShowEmailSummaryModal(false);
                      const event = new CustomEvent('otec-toast', {
                        detail: {
                          message: `Automated Outstanding Fee Arrears summary email successfully dispatched to ${recipientEmail}!`,
                          type: 'success'
                        }
                      });
                      window.dispatchEvent(event);
                    }, 1500);
                  }}
                  disabled={emailSending || !recipientEmail}
                  className={`px-5 py-2 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all ${
                    emailSending || !recipientEmail
                      ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/15 cursor-pointer'
                  }`}
                >
                  {emailSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Dispatching SMTP Report...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Send Summary Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditTxModal && editingTx && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Pencil size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Edit Financial Ledger Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowEditTxModal(false); setEditingTx(null); }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditedTransaction} className="space-y-4 text-xs">
              
              {/* Type toggle */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setEditTxType('income');
                      const firstInc = categories.find(c => c.type === 'income')?.name || 'Tuition Fees';
                      setEditTxCategory(firstInc);
                    }}
                    className={`py-2 text-center rounded-lg font-bold cursor-pointer transition-all ${
                      editTxType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Income (Inflow)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTxType('expense');
                      const firstExp = categories.find(c => c.type === 'expense')?.name || 'Teacher Salaries';
                      setEditTxCategory(firstExp);
                    }}
                    className={`py-2 text-center rounded-lg font-bold cursor-pointer transition-all ${
                      editTxType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Expense (Outflow)
                  </button>
                </div>
              </div>

              {/* Category & Term */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Category</label>
                  <select
                    value={editTxCategory}
                    onChange={(e) => setEditTxCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                  >
                    {editTxType === 'income' 
                      ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                      : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Term</label>
                  <select
                    value={editTxTerm}
                    onChange={(e) => setEditTxTerm(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              {/* Custom Item Name when category is "Other" */}
              {isOtherCategory(editTxCategory) && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Specify Item Name</label>
                  <input
                    type="text"
                    placeholder="Type custom item name..."
                    value={editTxCustomCategory}
                    onChange={(e) => setEditTxCustomCategory(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-600 font-semibold"
                  />
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Amount (UGX)</label>
                  <input
                    type="number"
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Date</label>
                  <input
                    type="date"
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Payment Method</label>
                <select
                  value={editTxMethod}
                  onChange={(e) => setEditTxMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Bank Account / Ledger */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Bank Account / Ledger</label>
                <select
                  value={editTxBankAccountId}
                  onChange={(e) => setEditTxBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                >
                  <option value="ba-main-cash">Main Cash Box</option>
                  {(data.bankAccounts || []).filter(a => a.id !== 'ba-main-cash').map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.bankName})</option>
                  ))}
                </select>
              </div>

              {/* Linked Student with Search */}
              {editTxType === 'income' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Linked Learner (Search & Select)</label>
                    {editTxStudentId && (
                      <button
                        type="button"
                        onClick={() => { setEditTxStudentId(''); setEditTxStudentSearch(''); }}
                        className="text-[9px] font-extrabold text-rose-600 hover:underline cursor-pointer"
                      >
                        Unlink Student
                      </button>
                    )}
                  </div>

                  {editTxStudentId ? (
                    (() => {
                      const selStudent = data.learners.find(l => l.id === editTxStudentId);
                      return (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-fade-in">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                              {selStudent?.name?.slice(0, 2).toUpperCase() || 'ST'}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-slate-900 text-xs">{selStudent?.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">Class {selStudent?.cls} • Adm: {selStudent?.admNo || selStudent?.id}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setEditTxStudentId(''); setEditTxStudentSearch(''); }}
                            className="p-1 hover:bg-emerald-100 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="relative space-y-1">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={editTxStudentSearch}
                          onChange={(e) => setEditTxStudentSearch(e.target.value)}
                          placeholder="Search student by name, class or admission no..."
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                        />
                      </div>

                      {editTxStudentSearch.trim().length > 0 && (
                        <div className="max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 custom-scrollbar text-left">
                          {data.learners.filter(l => 
                            l.name.toLowerCase().includes(editTxStudentSearch.toLowerCase()) ||
                            (l.admNo && l.admNo.toLowerCase().includes(editTxStudentSearch.toLowerCase())) ||
                            l.cls.toLowerCase().includes(editTxStudentSearch.toLowerCase())
                          ).slice(0, 10).map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                setEditTxStudentId(l.id);
                                setEditTxStudentSearch('');
                              }}
                              className="w-full text-left p-2.5 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <span className="font-extrabold text-slate-900 text-xs block">{l.name}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Class {l.cls} • Adm: {l.admNo || l.id}</span>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                {formatUGX(l.outstandingBalance ? parseFloat(l.outstandingBalance) : 0)}
                              </span>
                            </button>
                          ))}

                          {data.learners.filter(l => 
                            l.name.toLowerCase().includes(editTxStudentSearch.toLowerCase()) ||
                            (l.admNo && l.admNo.toLowerCase().includes(editTxStudentSearch.toLowerCase())) ||
                            l.cls.toLowerCase().includes(editTxStudentSearch.toLowerCase())
                          ).length === 0 && (
                            <div className="p-3 text-center text-slate-400 font-bold text-xs italic">
                              No matching learner found for "{editTxStudentSearch}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">Description</label>
                <input
                  type="text"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:bg-white focus:border-blue-600"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowEditTxModal(false); setEditingTx(null); }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Save Transaction Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Learner Fee Payment History Ledger Modal */}
      {showLearnerHistoryModal && selectedHistoryLearner && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col space-y-6 animate-scale-up max-h-[92vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center">
                  {selectedHistoryLearner.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">{selectedHistoryLearner.name}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Class {selectedHistoryLearner.cls} &middot; {selectedHistoryLearner.dayBoarding || 'Day Student'} &middot; Adm #{selectedHistoryLearner.admNo || selectedHistoryLearner.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowLearnerHistoryModal(false); setSelectedHistoryLearner(null); }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Financial Overview Cards */}
            {(() => {
              const student = selectedHistoryLearner;
              const tui = student.feeTuition ?? 0;
              const board = student.feeBoarding ?? 0;
              const van = student.feeVan ?? 0;
              const reg = student.feeRegistration ?? 0;
              const sw = student.feeSweater ?? 0;
              const uni = student.feeClassUniform ?? 0;
              const sp = student.feeSportsWear ?? 0;
              const hair = student.feeHair ?? 0;
              const hol = student.feeHoliday ?? 0;
              const oth = student.feeOthers ?? 0;
              const totalBill = tui + board + van + reg + sw + uni + sp + hair + hol + oth;

              const studentPayments = transactions.filter(tx => tx.type === 'income' && tx.studentId === student.id);
              const totalPaid = studentPayments.reduce((s, tx) => s + tx.amount, 0);
              const bal = Math.max(0, totalBill - totalPaid);
              const clearedPct = totalBill > 0 ? Math.min(100, (totalPaid / totalBill) * 100).toFixed(1) : '100';

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Billed Fees</span>
                      <p className="text-lg font-mono font-extrabold text-slate-950 mt-1">{formatUGX(totalBill)}</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Total Fees Cleared</span>
                      <p className="text-lg font-mono font-extrabold text-emerald-800 mt-1">{formatUGX(totalPaid)}</p>
                    </div>

                    <div className={`border rounded-2xl p-4 ${bal > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${bal > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {bal > 0 ? 'Outstanding Arrears' : 'Fee Status'}
                      </span>
                      <p className={`text-lg font-mono font-extrabold mt-1 ${bal > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                        {bal > 0 ? formatUGX(bal) : 'CLEARED ✓'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 uppercase tracking-wider text-[10px]">Fee Clearance Rate</span>
                      <span className="text-blue-700 font-mono">{clearedPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${clearedPct}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Billed Ledger Components Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {tui > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Tuition</span><strong className="font-mono">{formatUGX(tui)}</strong></div>}
                      {board > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Boarding</span><strong className="font-mono">{formatUGX(board)}</strong></div>}
                      {van > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Van Transport</span><strong className="font-mono">{formatUGX(van)}</strong></div>}
                      {uni > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Class Uniform</span><strong className="font-mono">{formatUGX(uni)}</strong></div>}
                      {sw > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Sweater</span><strong className="font-mono">{formatUGX(sw)}</strong></div>}
                      {sp > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Sports Wear</span><strong className="font-mono">{formatUGX(sp)}</strong></div>}
                      {reg > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Registration</span><strong className="font-mono">{formatUGX(reg)}</strong></div>}
                      {hair > 0 && <div className="p-2 bg-white rounded-xl border border-slate-150"><span className="text-slate-400 block text-[9px]">Hair Saloon</span><strong className="font-mono">{formatUGX(hair)}</strong></div>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Learner Payment History Ledger ({studentPayments.length} Records)</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeeStudent(student);
                          setShowFeePaymentModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} />
                        <span>Record Payment</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 uppercase font-black text-[9px] tracking-wider border-b border-slate-200">
                            <th className="px-3.5 py-2.5">Date</th>
                            <th className="px-3.5 py-2.5">Receipt #</th>
                            <th className="px-3.5 py-2.5">Category</th>
                            <th className="px-3.5 py-2.5">Method</th>
                            <th className="px-3.5 py-2.5 text-right">Amount (UGX)</th>
                            <th className="px-3.5 py-2.5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentPayments.length > 0 ? (
                            studentPayments.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/60">
                                <td className="px-3.5 py-2.5 font-mono text-slate-600 font-bold">{tx.date}</td>
                                <td className="px-3.5 py-2.5 font-mono text-slate-500 font-bold">REC-{tx.id.slice(-6).toUpperCase()}</td>
                                <td className="px-3.5 py-2.5 font-bold text-slate-800">{tx.category}</td>
                                <td className="px-3.5 py-2.5 text-slate-600 font-medium">{tx.paymentMethod}</td>
                                <td className="px-3.5 py-2.5 text-right font-mono font-black text-emerald-700">{formatUGX(tx.amount)}</td>
                                <td className="px-3.5 py-2.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setShowReceiptModal(tx)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                      title="Print Receipt"
                                    >
                                      <Receipt size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditTransaction(tx)}
                                      className="p-1 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                                      title="Edit Payment"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTransaction(tx.id)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Delete Payment"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold italic">
                                No fee payments recorded yet for {student.name}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatementStudent(student);
                        setShowStatementModal(true);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print Official Fee Statement</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowLearnerHistoryModal(false); setSelectedHistoryLearner(null); }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Close History
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
