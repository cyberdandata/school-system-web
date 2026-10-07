import React from "react";
import { Search, X } from "lucide-react";
import { ALL_CLASSES } from "../../lib/defaults";

export interface GlobalFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showClassFilter?: boolean;
  selectedClass?: string;
  onClassChange?: (value: string) => void;
  showSexFilter?: boolean;
  selectedSex?: string;
  onSexChange?: (value: string) => void;
  showDepartmentFilter?: boolean;
  selectedDepartment?: string;
  onDepartmentChange?: (value: string) => void;
  departmentOptions?: { label: string; value: string }[];
  showTypeFilter?: boolean;
  selectedType?: string;
  onTypeChange?: (value: string) => void;
  typeOptions?: { label: string; value: string }[];
  typeLabel?: string;
  showStatusFilter?: boolean;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { label: string; value: string }[];
  showDateFilter?: boolean;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  children?: React.ReactNode;
  onReset?: () => void;
}

export default function GlobalFilterBar({
  searchQuery, onSearchChange, searchPlaceholder = "Search...",
  showClassFilter = false, selectedClass = "All", onClassChange,
  showSexFilter = false, selectedSex = "All", onSexChange,
  showDepartmentFilter = false, selectedDepartment = "All", onDepartmentChange, departmentOptions = [],
  showTypeFilter = false, selectedType = "All", onTypeChange, typeOptions = [], typeLabel = "Type",
  showStatusFilter = false, selectedStatus = "All", onStatusChange, statusOptions = [],
  showDateFilter = false, dateFrom = "", dateTo = "", onDateFromChange, onDateToChange,
  children, onReset,
}: GlobalFilterBarProps) {

  const hasActiveFilter =
    searchQuery !== "" ||
    (showClassFilter && selectedClass !== "All") ||
    (showSexFilter && selectedSex !== "All") ||
    (showDepartmentFilter && selectedDepartment !== "All") ||
    (showTypeFilter && selectedType !== "All") ||
    (showStatusFilter && selectedStatus !== "All") ||
    (showDateFilter && (dateFrom !== "" || dateTo !== ""));

  const sel = "w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer";

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl shadow-sm p-3 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" placeholder={searchPlaceholder} value={searchQuery} onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" />
        </div>
        {showClassFilter && onClassChange && (
          <div className="min-w-[120px]">
            <select value={selectedClass} onChange={e => onClassChange(e.target.value)} className={sel}>
              <option value="All">All Classes</option>
              {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        {showSexFilter && onSexChange && (
          <div className="min-w-[110px]">
            <select value={selectedSex} onChange={e => onSexChange(e.target.value)} className={sel}>
              <option value="All">All Genders</option>
              <option value="Male">Boys / Male</option>
              <option value="Female">Girls / Female</option>
            </select>
          </div>
        )}
        {showDepartmentFilter && onDepartmentChange && (
          <div className="min-w-[140px]">
            <select value={selectedDepartment} onChange={e => onDepartmentChange(e.target.value)} className={sel}>
              <option value="All">All Departments</option>
              {departmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}
        {showTypeFilter && onTypeChange && (
          <div className="min-w-[120px]">
            <select value={selectedType} onChange={e => onTypeChange(e.target.value)} className={sel}>
              <option value="All">All {typeLabel}s</option>
              {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}
        {showStatusFilter && onStatusChange && (
          <div className="min-w-[130px]">
            <select value={selectedStatus} onChange={e => onStatusChange(e.target.value)} className={sel}>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}
        {showDateFilter && onDateFromChange && (
          <div className="min-w-[120px]">
            <input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} className={sel + " cursor-text"} title="From date" />
          </div>
        )}
        {showDateFilter && onDateToChange && (
          <div className="min-w-[120px]">
            <input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} className={sel + " cursor-text"} title="To date" />
          </div>
        )}
        {children}
        {hasActiveFilter && onReset && (
          <button onClick={onReset} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap">
            <X size={12} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
