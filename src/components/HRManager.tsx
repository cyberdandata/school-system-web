import React, { useState, useMemo } from 'react';
import HRDocuments from './HRDocuments';
import { AppData, Teacher, NonTeachingStaff, PayrollRecord, AppraisalRecord, TeacherAppraisalMetrics } from '../types';
import { calculatePayroll, calculateGrossFromNet } from '../lib/payroll';
import { 
  Users, Briefcase, Cake, CalendarClock, DollarSign, Award, CheckCircle, 
  Search, Filter, Plus, FileText, ChevronDown, Download, X, Sparkles, Printer
} from 'lucide-react';
import app from '../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import DataTable, { ColumnDef } from './ui/DataTable';
import GlobalFilterBar from './ui/GlobalFilterBar';
import dataManager from '../lib/db';
import { useAppStore } from "../store/useAppStore";

interface HRManagerProps {
  onUpdateHR: (payroll: PayrollRecord[], appraisals: AppraisalRecord[]) => void;
  onUpdateStaff: (teachers: Teacher[], nonTeaching: NonTeachingStaff[]) => void;
}

type HRTab = 'directory' | 'payroll' | 'appraisals' | 'documents';

export default function HRManager({ onUpdateHR, onUpdateStaff }: HRManagerProps) {
  const data = useAppStore(state => state.data)!;
  const [activeTab, setActiveTab] = useState<HRTab>('directory');

  // === Directory Filters ===
  const [hrSearch, setHrSearch] = useState('');
  const [hrDept, setHrDept] = useState('All');
  const [hrSex, setHrSex] = useState('All');
  const [hrType, setHrType] = useState('All'); // 'All' | 'teacher' | 'non-teaching'
  const resetHrFilters = () => { setHrSearch(''); setHrDept('All'); setHrSex('All'); setHrType('All'); };
  
  // HR Edit Modal State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [appraisalStaffId, setAppraisalStaffId] = useState('');
  const [appraisalScore, setAppraisalScore] = useState('');
  const [appraisalComments, setAppraisalComments] = useState('');
  const [appraisalEvaluator, setAppraisalEvaluator] = useState('');
  const [appraisalDate, setAppraisalDate] = useState(new Date().toISOString().split('T')[0]);
  const [appraisalRecommendations, setAppraisalRecommendations] = useState('');
  
  const initialMetrics: TeacherAppraisalMetrics = {
    classroomEnvironment: 0, learnersBook: 0, useOfBlackboard: 0, handwriting: 0,
    classroomControl: 0, rules: 0, recordOfWork: 0, schemeOfWork: 0, attendanceRecord: 0
  };
  const [appraisalMetrics, setAppraisalMetrics] = useState<TeacherAppraisalMetrics>(initialMetrics);
  
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [viewAppraisal, setViewAppraisal] = useState<AppraisalRecord | null>(null);


  const [editDOB, setEditDOB] = useState('');
  const [editSex, setEditSex] = useState<'Male' | 'Female'>('Male');
  const [editNIN, setEditNIN] = useState('');
  const [editNextOfKinName, setEditNextOfKinName] = useState('');
  const [editNextOfKinPhone, setEditNextOfKinPhone] = useState('');
  const [editResidence, setEditResidence] = useState('');
  const [editAssignedVehicle, setEditAssignedVehicle] = useState('');

  const [editContractEnd, setEditContractEnd] = useState('');
  const [editBaseSalary, setEditBaseSalary] = useState('');
  const [editNetSalary, setEditNetSalary] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editTIN, setEditTIN] = useState('');
  const [editNSSF, setEditNSSF] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');
  
  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'teacher' | 'non-teaching'>('teacher');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffDeptSpec, setNewStaffDeptSpec] = useState(''); // Department or Specialization

  const [newStaffDOB, setNewStaffDOB] = useState('');
  const [newStaffSex, setNewStaffSex] = useState<'Male' | 'Female'>('Male');
  const [newStaffNIN, setNewStaffNIN] = useState('');
  const [newStaffNextOfKinName, setNewStaffNextOfKinName] = useState('');
  const [newStaffNextOfKinPhone, setNewStaffNextOfKinPhone] = useState('');
  const [newStaffResidence, setNewStaffResidence] = useState('');
  const [newStaffAssignedVehicle, setNewStaffAssignedVehicle] = useState('');

  const [newStaffContractEnd, setNewStaffContractEnd] = useState('');
  const [newStaffBaseSalary, setNewStaffBaseSalary] = useState('');
  const [newStaffNetSalary, setNewStaffNetSalary] = useState('');
  const [newStaffTIN, setNewStaffTIN] = useState('');
  const [newStaffNSSF, setNewStaffNSSF] = useState('');
  
  // Print States
  const [printingPayslipId, setPrintingPayslipId] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [printingContractId, setPrintingContractId] = useState<string | null>(null);
  
  // Combine all staff into a unified view
  const allStaff = useMemo(() => {
    const t = (data.settings?.teachersList || []).map(tch => ({ ...tch, staffType: 'teacher' as const }));
    const nt = (data.settings?.nonTeachingStaffList || []).map(nts => ({ ...nts, staffType: 'non-teaching' as const }));
    return [...t, ...nt];
  }, [data]);

  // Filtered staff for directory
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => {
      const matchSearch = hrSearch === '' ||
        (s.name || '').toLowerCase().includes(hrSearch.toLowerCase()) ||
        ((s as any).specialization || (s as any).department || '').toLowerCase().includes(hrSearch.toLowerCase());
      const matchDept = hrDept === 'All' ||
        ((s as any).specialization || (s as any).department || '').toLowerCase() === hrDept.toLowerCase();
      const matchSex = hrSex === 'All' || (s as any).sex === hrSex;
      const matchType = hrType === 'All' || s.staffType === hrType;
      return matchSearch && matchDept && matchSex && matchType;
    });
  }, [allStaff, hrSearch, hrDept, hrSex, hrType]);

  // Collect unique departments for the filter dropdown
  const allDepts = useMemo(() => {
    const depts = new Set<string>();
    allStaff.forEach(s => {
      const d = (s as any).specialization || (s as any).department;
      if (d) depts.add(d);
    });
    return Array.from(depts).sort();
  }, [allStaff]);


  // Reminders
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    return allStaff.filter(s => {
      if (!s.dateOfBirth) return false;
      const dob = new Date(s.dateOfBirth);
      return dob.getMonth() === currentMonth;
    });
  }, [allStaff]);

  const expiringContracts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return allStaff.filter(s => {
      if (!s.contractEndDate) return false;
      const end = new Date(s.contractEndDate);
      return end > today && end <= thirtyDaysFromNow;
    });
  }, [allStaff]);

  const handleMarkAsPaid = () => {
    if (!markingPaidId || !selectedBankAccountId) return;
    
    const pr = data.hr?.payroll.find(p => p.id === markingPaidId);
    const staff = [...(data.settings?.teachersList || []), ...(data.settings?.nonTeachingStaffList || [])].find(s => s.id === pr?.staffId);
    if (!pr || !staff) return;

    const txId = 'tx-' + Math.random().toString(36).slice(2, 9);
    
    // Create finance transaction
    const newTx = {
      id: txId,
      type: 'expense' as const,
      category: 'Salaries & Wages',
      amount: pr.netPay,
      date: new Date().toISOString().split('T')[0],
      term: data.settings?.term || 'Term 1 2026',
      description: `Payroll: ${staff.name} for ${pr.month}`,
      recordedBy: dataManager.getActiveUser()?.email?.split('@')[0] || 'System',
      paymentMethod: 'Bank Transfer' as const,
      bankAccountId: selectedBankAccountId
    };
    
    const currentFinances = data.finances || [];
    dataManager.updateFinances([newTx, ...currentFinances]);
    
    // Update payroll record
    const updatedPayroll = data.hr!.payroll.map(p => {
      if (p.id === markingPaidId) {
        return { ...p, status: 'Paid' as const, paymentDate: new Date().toISOString(), financeTransactionId: txId };
      }
      return p;
    });
    
    onUpdateHR(updatedPayroll, data.hr?.appraisals || []);
    
    dataManager.addActivityLog(
      'finance_modified',
      `Processed payroll for ${staff.name}, net pay ${newTx.amount.toLocaleString()} linked to ledger.`
    );
    
    setMarkingPaidId(null);
    setSelectedBankAccountId('');
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Payroll marked as paid and posted to ledger.', type: 'success' }}));
  };

  // Payroll generation
  const handleGeneratePayroll = () => {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentPayroll = data.hr?.payroll || [];
    
    // Check if payroll already exists for this month
    const existing = currentPayroll.filter(p => p.month === month);
    if (existing.length > 0) {
      if (!confirm(`Payroll for ${month} already exists. Are you sure you want to regenerate it? Existing drafts will be overwritten.`)) {
        return;
      }
    }

    const newPayrollRecords = allStaff.map(staff => {
      const base = staff.baseSalary || 0;
      const result = calculatePayroll(base, 0); // Assuming 0 allowances for default generation
      
      return {
        id: `PR-${Date.now()}-${staff.id}`,
        staffId: staff.id,
        staffType: staff.staffType,
        month,
        baseSalary: base,
        allowances: 0,
        ...result,
        status: 'Draft' as const
      };
    });
    
    // Filter out old records for this month, add new ones
    const updatedPayroll = currentPayroll.filter(p => p.month !== month).concat(newPayrollRecords);
    onUpdateHR(updatedPayroll, data.hr?.appraisals || []);
  };
  const processingAIRef = React.useRef(false);

  React.useEffect(() => {
    const processPendingAI = async () => {
      if (processingAIRef.current || !navigator.onLine) return;

      const pendingAppraisal = data.hr?.appraisals?.find(a => a.pendingAIGeneration);
      if (!pendingAppraisal) return;

      processingAIRef.current = true;
      setIsGeneratingAI(true);
      
      const isTeacher = data.settings?.teachersList?.some(t => t.id === pendingAppraisal.staffId);
      let staffName = '';
      let role = isTeacher ? 'Teacher' : 'Non-Teaching Staff';
      let department = pendingAppraisal.department || 'General';
      
      if (isTeacher) {
        staffName = data.settings?.teachersList?.find(t => t.id === pendingAppraisal.staffId)?.name || 'Unknown';
      } else {
        staffName = data.settings?.nonTeachingStaffList?.find(s => s.id === pendingAppraisal.staffId)?.name || 'Unknown';
      }

      try {
        const { getGeminiClient } = await import('../lib/gemini');
        const ai = getGeminiClient(data.settings?.geminiApiKey);
        
        const prompt = `You are a professional HR assistant. You need to write an appraisal feedback and recommendations for a school staff member.
Staff Name: ${staffName}
Role: ${role}
Department: ${department}
Score: ${pendingAppraisal.score}/100

Please provide:
1. "comments": Professional feedback based on the score (e.g. excellent if high, needs improvement if low).
2. "recommendations": Professional recommendations for their career growth or improvement.

Output valid JSON ONLY with the keys "comments" and "recommendations". No markdown formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        
        if (!response.text) throw new Error("No response from AI");
        const resData = JSON.parse(response.text);
        
        const updatedAppraisals = (data.hr?.appraisals || []).map(a => 
          a.id === pendingAppraisal.id 
            ? { ...a, comments: resData.comments || a.comments, recommendations: resData.recommendations || a.recommendations, pendingAIGeneration: false }
            : a
        );
        
        onUpdateHR(data.hr?.payroll || [], updatedAppraisals);
        window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: `AI Auto-Comment Generated for ${staffName}!`, type: 'success' }}));
      } catch (err: any) {
        console.error("Background AI generation failed (will retry when online):", err);
        if (err.message?.includes('API key')) {
          window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: err.message, type: 'error' }}));
        }
      } finally {
        setIsGeneratingAI(false);
        processingAIRef.current = false;
      }
    };

    processPendingAI();
    
    window.addEventListener('online', processPendingAI);
    return () => window.removeEventListener('online', processPendingAI);
  }, [data.hr?.appraisals, data.settings, onUpdateHR]);
  const handleAddAppraisal = () => {
    if (!appraisalStaffId || !appraisalScore) return;
    
    const isTeacher = data.settings?.teachersList?.some(t => t.id === appraisalStaffId);
    let department = 'General';
    if (isTeacher) {
      department = data.settings?.teachersList?.find(t => t.id === appraisalStaffId)?.specialization || 'Teaching';
    } else {
      department = data.settings?.nonTeachingStaffList?.find(t => t.id === appraisalStaffId)?.department || 'Support';
    }
    
    const newAppraisal: AppraisalRecord = {
      id: `AP-${Date.now()}`,
      staffId: appraisalStaffId,
      staffType: isTeacher ? 'teacher' : 'non-teaching',
      score: Number(appraisalScore),
      comments: appraisalComments || 'Pending AI Generation...',
      recommendations: appraisalRecommendations || 'Pending AI Generation...',
      evaluator: appraisalEvaluator,
      date: appraisalDate,
      department: department,
      pendingAIGeneration: true,
      ...(isTeacher ? { metrics: appraisalMetrics } : {})
    };
    
    const updatedAppraisals = [...(data.hr?.appraisals || []), newAppraisal];
    onUpdateHR(data.hr?.payroll || [], updatedAppraisals);
    
    setShowAppraisalModal(false);
    setAppraisalStaffId('');
    setAppraisalScore('');
    setAppraisalComments('');
    setAppraisalRecommendations('');
    setAppraisalMetrics(initialMetrics);
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Appraisal saved! AI is generating comments in the background.', type: 'info' } }));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `S-${Date.now()}`;
    const baseStaff = {
      id: newId,
      name: newStaffName,
      phone: newStaffPhone,
      email: newStaffEmail,
      dateOfBirth: newStaffDOB,
      contractEndDate: newStaffContractEnd,
      baseSalary: Number(newStaffBaseSalary) || 0,
      tinNumber: newStaffTIN,
      nssfNumber: newStaffNSSF,
      status: 'Active' as const
    };

    if (newStaffType === 'teacher') {
      const newTeacher: Teacher = {
        ...baseStaff,
        specialization: newStaffDeptSpec
      } as Teacher;
      onUpdateStaff([...(data.settings?.teachersList || []), newTeacher], data.settings?.nonTeachingStaffList || []);
    } else {
      const newNonTeaching: NonTeachingStaff = {
        ...baseStaff,
        role: newStaffDeptSpec || 'Staff',
        department: newStaffDeptSpec
      } as NonTeachingStaff;
      onUpdateStaff(data.settings?.teachersList || [], [...(data.settings?.nonTeachingStaffList || []), newNonTeaching]);
    }

    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setNewStaffDeptSpec('');
    setNewStaffDOB('');
    setNewStaffContractEnd('');
    setNewStaffBaseSalary('');
    setNewStaffNetSalary('');
    setNewStaffTIN('');
    setNewStaffNSSF('');
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Staff member registered successfully!', type: 'success' } }));
  };

  const handleSaveHREdits = () => {
    if (!editingStaffId) return;
    
    // Find if it's a teacher or non-teaching staff
    const staffMember = allStaff.find(s => s.id === editingStaffId);
    if (!staffMember) return;
    
    const updates: any = {
      dateOfBirth: editDOB,
      contractEndDate: editContractEnd,
      baseSalary: Number(editBaseSalary) || undefined,
      tinNumber: editTIN,
      nssfNumber: editNSSF,
      status: editStatus
    };

    if (staffMember.staffType === 'teacher') {
      updates.specialization = editDepartment;
      const updatedTeachers = (data.settings?.teachersList || []).map(t => 
        t.id === editingStaffId ? { ...t, ...updates } as any : t
      );
      onUpdateStaff(updatedTeachers, data.settings?.nonTeachingStaffList || []);
    } else {
      updates.department = editDepartment;
      updates.role = editDepartment || 'Staff';
      const updatedNonTeaching = (data.settings?.nonTeachingStaffList || []).map(t => 
        t.id === editingStaffId ? { ...t, ...updates } : t
      );
      onUpdateStaff(data.settings?.teachersList || [], updatedNonTeaching as any);
    }
    
    setEditingStaffId(null);
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'HR updates saved successfully!', type: 'success' } }));
  };

  const openEditModal = (staff: any) => {
    setEditingStaffId(staff.id);
    setEditDOB(staff.dateOfBirth || '');
    setEditContractEnd(staff.contractEndDate || '');
    setEditBaseSalary(staff.baseSalary ? String(staff.baseSalary) : '');
    setEditNetSalary(staff.baseSalary ? String(calculatePayroll(staff.baseSalary).netPay) : '');
    setEditDepartment(staff.specialization || staff.department || '');
    setEditTIN(staff.tinNumber || '');
    setEditNSSF(staff.nssfNumber || '');

    setEditStatus(staff.status || 'Active');
    setEditSex(staff.sex || 'Male');
    setEditNIN(staff.nin || '');
    setEditNextOfKinName(staff.nextOfKinName || '');
    setEditNextOfKinPhone(staff.nextOfKinPhone || '');
    setEditResidence(staff.residence || '');
    setEditAssignedVehicle(staff.assignedVehicle || '');

  };

  const staffColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: row => row.name,
      render: row => (
        <div className="font-bold text-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
            {row.name.charAt(0)}
          </div>
          {row.name}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      accessor: row => row.staffType === 'teacher' ? 'Teacher' : row.department || 'Staff',
      render: row => (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
          row.staffType === 'teacher' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {row.staffType === 'teacher' ? 'Teacher' : row.department || 'Staff'}
        </span>
      )
    },
    {
      key: 'sex',
      header: 'Sex',
      accessor: row => row.sex || '-',
      render: row => <span className="font-medium text-slate-600">{row.sex || '-'}</span>
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: row => row.phone || '-',
      render: row => <span className="font-medium text-slate-600">{row.phone || '-'}</span>
    },
    {
      key: 'nin',
      header: 'NIN',
      accessor: row => row.nin || '-',
      render: row => <span className="text-[10px] text-slate-500 font-mono">{row.nin || '-'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      accessor: row => row.status || 'Active',
      render: row => {
        const status = row.status || 'Active';
        let color = 'bg-slate-100 text-slate-800';
        if (status === 'Active') color = 'bg-emerald-100 text-emerald-800';
        if (status === 'On Leave') color = 'bg-amber-100 text-amber-800';
        return (
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${color}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'contract',
      header: 'Contract End',
      accessor: row => row.contractEndDate || '-',
      render: row => <span className="font-medium text-slate-600">{row.contractEndDate || '-'}</span>
    },
    {
      key: 'salary',
      header: 'Base Salary (UGX)',
      accessor: row => row.baseSalary || 0,
      render: row => (
        <span className="font-black text-slate-700">
          {row.baseSalary ? row.baseSalary.toLocaleString() : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: row => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            Edit Info
          </button>
          <button
            onClick={() => setPrintingContractId(row.id)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors"
          >
            Print Appt.
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={22} className="text-blue-600" />
            Human Resources & Payroll
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage staff, payroll (PAYE/NSSF), and performance appraisals</p>
        </div>
        <button 
          onClick={() => setShowAddStaffModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm shadow-sm shadow-blue-600/20 transition-all"
        >
          <Plus size={16} /> Register Staff
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-white border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> Staff Directory
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'payroll' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={16} /> Payroll & Taxes
        </button>
        <button
          onClick={() => setActiveTab('appraisals')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'appraisals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={16} /> Appraisals
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Documents & Templates
        </button>

      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'documents' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 h-full">
            <HRDocuments />
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-xs text-indigo-600">
                  <Cake size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Upcoming Birthdays</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {upcomingBirthdays.length > 0 
                      ? `${upcomingBirthdays.length} staff members have birthdays this month.`
                      : 'No birthdays this month.'}
                  </p>
                  {upcomingBirthdays.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {upcomingBirthdays.map(s => (
                        <span key={s.id} className="text-[10px] font-bold bg-white px-2 py-1 rounded-md text-indigo-700 shadow-xs">
                          {s.name} ({s.dateOfBirth?.substring(5)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-xs text-rose-600">
                  <CalendarClock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Contract Renewals</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {expiringContracts.length > 0 
                      ? `${expiringContracts.length} contracts expiring in the next 30 days.`
                      : 'No contracts expiring soon.'}
                  </p>
                  {expiringContracts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {expiringContracts.map(s => (
                        <span key={s.id} className="text-[10px] font-bold bg-white px-2 py-1 rounded-md text-rose-700 shadow-xs border border-rose-100">
                          {s.name} ({s.contractEndDate})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Directory Filters */}
            <GlobalFilterBar
              searchQuery={hrSearch}
              onSearchChange={setHrSearch}
              searchPlaceholder="Search staff by name, subject, or department..."
              showSexFilter
              selectedSex={hrSex}
              onSexChange={setHrSex}
              showDepartmentFilter
              selectedDepartment={hrDept}
              onDepartmentChange={setHrDept}
              departmentOptions={allDepts.map(d => ({ label: d, value: d }))}
              showTypeFilter
              selectedType={hrType}
              onTypeChange={setHrType}
              typeLabel="Staff Type"
              typeOptions={[
                { label: 'Teaching Staff', value: 'teacher' },
                { label: 'Non-Teaching Staff', value: 'non-teaching' },
              ]}
              onReset={resetHrFilters}
            />

            {/* Directory List using DataTable */}
            <DataTable 
              data={filteredStaff}
              columns={staffColumns}
              exportFilename="otec_staff_directory.csv"
              searchPlaceholder="Search staff by name or role..."
            />
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Payroll Processing (Uganda)</h3>
              <button
                onClick={handleGeneratePayroll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Plus size={14} /> Generate Payroll (Current Month)
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Gross Pay</th>
                    <th className="px-4 py-3 text-rose-600">PAYE</th>
                    <th className="px-4 py-3 text-rose-600">NSSF (5%)</th>
                    <th className="px-4 py-3 text-emerald-600">NSSF (10%)</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(!data.hr?.payroll || data.hr.payroll.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No payroll records found. Click "Generate Payroll" to calculate taxes.
                      </td>
                    </tr>
                  ) : (
                    data.hr.payroll.map(pr => {
                      const staff = allStaff.find(s => s.id === pr.staffId);
                      return (
                        <tr key={pr.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{staff?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 font-medium">{pr.grossPay.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-rose-600">{pr.paye.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-rose-600">{pr.nssfEmployee.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-emerald-600">{pr.nssfEmployer.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-800">{pr.netPay.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                              pr.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {pr.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {pr.status !== 'Paid' && (
                                <button
                                  onClick={() => setMarkingPaidId(pr.id)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors inline-flex items-center justify-center"
                                  title="Mark as Paid"
                                >
                                  <DollarSign size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => setPrintingPayslipId(pr.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Print Payslip"
                              >
                                <FileText size={14} />
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
        )}

        {activeTab === 'appraisals' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Performance Appraisals</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md">
                This module allows school administrators to log and track staff performance reviews, setting KPIs and monitoring development over time.
              </p>
              <button 
                onClick={() => setShowAppraisalModal(true)}
                className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                Start New Appraisal
              </button>
              
              <div className="mt-8 w-full max-w-4xl text-left">
                {data.hr?.appraisals?.length ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Evaluator</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 text-center">Score</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Comments</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...data.hr.appraisals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(app => {
                          const staff = [...(data.settings?.teachersList || []), ...(data.settings?.nonTeachingStaffList || [])].find(s => s.id === app.staffId);
                          return (
                            <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(app.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{staff ? staff.name : 'Unknown Staff'}</td>
                              <td className="px-4 py-3 text-slate-600">{app.evaluator}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${app.score >= 80 ? 'bg-emerald-100 text-emerald-700' : app.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {app.score}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate" title={app.comments}>
                                {app.pendingAIGeneration ? (
                                  <span className="text-indigo-500 italic flex items-center gap-1">
                                    <Sparkles size={12} className="animate-pulse" /> 
                                    AI is analyzing...
                                  </span>
                                ) : app.comments}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => setViewAppraisal(app)}
                                  className="px-3 py-1 bg-blue-50 text-blue-600 font-semibold rounded-md text-xs hover:bg-blue-100"
                                >
                                  View Report
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm italic">No appraisals recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {markingPaidId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Process Payroll Payment
              </h3>
              <button onClick={() => setMarkingPaidId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">Select the source bank account to fund this payroll expense. A corresponding ledger transaction will be auto-generated.</p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Bank Account</label>
                <select 
                  className="w-full border-slate-200 rounded-lg text-sm"
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                >
                  <option value="">-- Select Account --</option>
                  {data.bankAccounts?.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountName} ({acc.accountNumber})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={() => setMarkingPaidId(null)}
                className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleMarkAsPaid}
                disabled={!selectedBankAccountId}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} /> Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit HR Modal */}
      {editingStaffId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Update HR Details</h3>
              <button 
                onClick={() => setEditingStaffId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDOB}
                    onChange={e => setEditDOB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contract End Date</label>
                  <input
                    type="date"
                    value={editContractEnd}
                    onChange={e => setEditContractEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Department / Specialization</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  placeholder="e.g. Science / Administration"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 mb-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Base / Gross Salary (UGX)</label>
                  <input
                    type="number"
                    value={editBaseSalary}
                    onChange={e => {
                      setEditBaseSalary(e.target.value);
                      const net = (calculatePayroll(Number(e.target.value) || 0) as any).netPay; // @ts-ignore
                      setEditNetSalary(net > 0 ? String(net) : '');
                    }}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target Net Salary (UGX)</label>
                  <input
                    type="number"
                    value={editNetSalary}
                    onChange={e => {
                      setEditNetSalary(e.target.value);
                      const gross = calculateGrossFromNet(Number(e.target.value) || 0);
                      setEditBaseSalary(gross > 0 ? String(gross) : '');
                    }}
                    placeholder="Auto-calculates Gross"
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">TIN Number</label>
                  <input
                    type="text"
                    value={editTIN}
                    onChange={e => setEditTIN(e.target.value)}
                    placeholder="e.g. 100XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NSSF Number</label>
                  <input
                    type="text"
                    value={editNSSF}
                    onChange={e => setEditNSSF(e.target.value)}
                    placeholder="e.g. 000XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employment Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditingStaffId(null)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHREdits}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Appt Modal */}
      {printingContractId && (() => {
        const staff = allStaff.find(s => s.id === printingContractId);
        if (!staff) return null;
        
        const payroll = calculatePayroll(staff.baseSalary || 0);
        
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[95vh] print:h-auto print:shadow-none print:w-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
                <h3 className="font-bold text-slate-800">Print Employment Contract</h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                    Print Contract
                  </button>
                  <button onClick={() => setPrintingContractId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-10 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible text-sm text-slate-800 font-serif leading-relaxed">
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                  <h1 className="text-2xl font-black uppercase tracking-wider">{data.settings?.schoolName || 'Otec School'}</h1>
                  <p className="text-xs font-medium text-slate-600 mt-1">{data.settings?.address || 'Kampala, Uganda'} | EMPLOYMENT CONTRACT</p>
                </div>
                
                <h2 className="text-center text-lg font-bold uppercase underline mb-8">Contract of Employment</h2>

                <p className="mb-4 text-justify">
                  This Contract of Employment is made and entered into on this <strong>{new Date().toLocaleDateString()}</strong> in accordance with the Employment Act, 2006 of the Republic of Uganda.
                </p>
                
                <p className="mb-6 text-justify">
                  <strong>BETWEEN</strong> {data.settings?.schoolName || 'The School'} (hereinafter referred to as the "Employer") 
                  <strong> AND </strong> <strong>{staff.name}</strong> (hereinafter referred to as the "Employee").
                </p>

                <div className="space-y-4 text-justify">
                  <div>
                    <h3 className="font-bold">1. Position and Type of Contract</h3>
                    <p>The Employee is engaged in the position of <strong>{staff.staffType === 'teacher' ? 'Teacher' : (staff as any).department || 'Staff'}</strong>.</p>
                    <p>This is a <strong>Renewable Fixed-Term Contract</strong> valid for a period of <strong>1 Year</strong>, commencing on <strong>{staff.dateOfJoining || '________________'}</strong> and expiring on <strong>{staff.contractEndDate || '________________'}</strong>.</p>
                  </div>

                  <div>
                    <h3 className="font-bold">2. Probationary Period</h3>
                    <p>The Employee shall serve a probationary period of <strong>Three (3) to Six (6) months</strong>. During this period, either party may terminate the contract by giving a 14-day notice.</p>
                  </div>

                  <div>
                    <h3 className="font-bold">3. Remuneration and Statutory Deductions</h3>
                    <p>The Employer shall pay the Employee a monthly consolidated salary as follows:</p>
                    <table className="w-full mt-2 mb-2 border-collapse border border-slate-300 text-sm">
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 p-2 font-medium">Gross Monthly Salary</td>
                          <td className="border border-slate-300 p-2 text-right">UGX {payroll.grossPay.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 text-slate-600">Less: NSSF Employee Contribution (5%)</td>
                          <td className="border border-slate-300 p-2 text-right text-rose-600">- UGX {payroll.nssfEmployee.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 p-2 text-slate-600">Less: P.A.Y.E (Uganda Revenue Authority)</td>
                          <td className="border border-slate-300 p-2 text-right text-rose-600">- UGX {payroll.paye.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                          <td className="border border-slate-300 p-2">Net Take-Home Pay</td>
                          <td className="border border-slate-300 p-2 text-right">UGX {payroll.netPay.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-slate-500 italic mt-1">*Note: The Employer shall separately remit the mandatory 10% NSSF Employer contribution (UGX {payroll.nssfEmployer.toLocaleString()}) on behalf of the Employee.</p>
                  </div>

                  <div>
                    <h3 className="font-bold">4. Allowances & Benefits</h3>
                    <p>In addition to the basic salary, the Employee is entitled to the following benefits (to be filled by administration):</p>
                    <ul className="list-disc pl-8 mt-2 space-y-2">
                      <li>Meals during working hours: ____________________</li>
                      <li>Housing/Accommodation: ____________________</li>
                      <li>Medical/Health cover: ____________________</li>
                      <li>Other: _____________________________________</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold">5. Hours of Work & Leave</h3>
                    <p>Standard working hours are governed by the school timetable. The Employee is entitled to annual leave of 21 working days per calendar year (typically taken during school term holidays), as well as sick leave and maternity/paternity leave strictly in accordance with the Employment Act, 2006.</p>
                  </div>

                  <div>
                    <h3 className="font-bold">6. Termination</h3>
                    <p>Post-probation, either party may terminate this agreement by providing a written notice of at least One (1) month, or payment of one month's salary in lieu of notice. Summary dismissal may occur without notice in cases of gross misconduct.</p>
                  </div>

                  <div className="pt-8">
                    <p className="font-bold italic mb-6">By signing below, both parties agree to the terms and conditions set forth above.</p>
                    <div className="grid grid-cols-2 gap-12 mt-12">
                      <div className="text-center">
                        <div className="border-b border-slate-600 mb-2 h-8"></div>
                        <p className="font-bold text-xs uppercase">For the Employer</p>
                        <p className="text-xs text-slate-500 mt-1">Date: ________________</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-slate-600 mb-2 h-8"></div>
                        <p className="font-bold text-xs uppercase">The Employee ({staff.name})</p>
                        <p className="text-xs text-slate-500 mt-1">Date: ________________</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Print Payslip Modal */}
      {printingPayslipId && (() => {
        const pr = data.hr?.payroll.find(p => p.id === printingPayslipId);
        if (!pr) return null;
        const staff = allStaff.find(s => s.id === pr.staffId);
        
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col print:h-auto print:shadow-none print:w-full border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
                <h3 className="font-bold text-slate-800">Payslip Preview</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Print
                  </button>
                  <button 
                    onClick={() => setPrintingPayslipId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 bg-white print:overflow-visible text-sm text-slate-800">
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
                  <h1 className="text-xl font-black uppercase">{data.settings?.schoolName || 'Otec School'}</h1>
                  <p className="text-xs font-bold bg-slate-800 text-white inline-block px-3 py-1 mt-2 rounded-full uppercase tracking-wider">Official Payslip</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-bold mb-1">Employee Details</p>
                    <p className="font-black text-sm">{staff?.name || 'Unknown'}</p>
                    <p>Role: <span className="font-medium uppercase">{staff?.staffType === 'teacher' ? 'Teacher' : (staff as any)?.department || 'Staff'}</span></p>
                    <p>NSSF No: {staff?.nssfNumber || 'N/A'}</p>
                    <p>TIN: {staff?.tinNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-bold mb-1">Payslip Details</p>
                    <p>Month: <span className="font-black text-sm">{pr.month}</span></p>
                    <p>Status: <span className="font-bold">{pr.status}</span></p>
                    <p>Ref: {pr.id.split('-')[1]}</p>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50">Base Salary</td>
                        <td className="px-4 py-2 text-right font-medium">UGX {pr.baseSalary.toLocaleString()}</td>
                      </tr>
                      {pr.allowances > 0 && (
                        <tr>
                          <td className="px-4 py-2 font-bold bg-slate-50">Allowances</td>
                          <td className="px-4 py-2 text-right font-medium">UGX {pr.allowances.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100 border-y-2 border-slate-300">
                        <td className="px-4 py-2 font-black">Gross Earnings</td>
                        <td className="px-4 py-2 text-right font-black text-emerald-700">UGX {pr.grossPay.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50 text-rose-700">NSSF Deduction (5%)</td>
                        <td className="px-4 py-2 text-right font-medium text-rose-700">-UGX {pr.nssfEmployee.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50 text-rose-700">PAYE Tax</td>
                        <td className="px-4 py-2 text-right font-medium text-rose-700">-UGX {pr.paye.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-800 text-white">
                        <td className="px-4 py-3 font-black text-lg">NET PAY</td>
                        <td className="px-4 py-3 text-right font-black text-lg">UGX {pr.netPay.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <p className="font-bold text-slate-600 mb-1">Employer Contributions (Not deducted from pay):</p>
                  <p>NSSF (10%): <strong>UGX {pr.nssfEmployer.toLocaleString()}</strong></p>
                </div>
                
                <div className="mt-12 text-center text-[10px] text-slate-400 font-medium">
                  <p>This is a computer generated document. No signature is required.</p>
                  <p>Generated on {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Appraisal Modal */}
      {showAppraisalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">New Performance Appraisal</h3>
              <button 
                onClick={() => setShowAppraisalModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddAppraisal();
            }} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Staff Member</label>
                <select 
                  required
                  value={appraisalStaffId}
                  onChange={e => setAppraisalStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Staff --</option>
                  <optgroup label="Teaching Staff">
                    {data.settings?.teachersList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                  <optgroup label="Non-Teaching Staff">
                    {data.settings?.nonTeachingStaffList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                </select>
              </div>

              {appraisalStaffId && (
                (() => {
                  const isTeacher = data.settings?.teachersList.some(t => t.id === appraisalStaffId);
                  
                  // Helper to update metric
                  const updateMetric = (key: keyof TeacherAppraisalMetrics, val: string) => {
                    const num = Number(val) || 0;
                    const updated = { ...appraisalMetrics, [key]: num };
                    setAppraisalMetrics(updated);
                    // auto calculate overall score out of 100
                    const total = Object.values(updated).reduce((a, b) => (a as number) + (b as number), 0) as number;
                    // max possible is 90 (9 metrics * 10 max points)
                    setAppraisalScore(Math.round(((total as number) / 90) * 100).toString());
                  };
                  
                  return (
                    <div className="space-y-4">
                      {isTeacher ? (
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
                            <h4 className="text-xs font-bold text-slate-800">Teacher Metrics (Out of 10)</h4>
                            <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              Auto-Score: {appraisalScore || 0}%
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                            {[
                              { key: 'classroomEnvironment', label: 'Class Environment' },
                              { key: 'learnersBook', label: "Learners' Book" },
                              { key: 'useOfBlackboard', label: 'Use of Blackboard' },
                              { key: 'handwriting', label: 'Handwriting' },
                              { key: 'classroomControl', label: 'Class Control & Rules' },
                              { key: 'recordOfWork', label: 'Record of Work' },
                              { key: 'schemeOfWork', label: 'Scheme of Work' },
                              { key: 'attendanceRecord', label: 'Attendance Record' }
                            ].map(metric => (
                              <div key={metric.key} className="flex items-center justify-between bg-white px-2 py-1.5 border border-slate-200 rounded-lg">
                                <label className="text-[10px] font-bold text-slate-600 truncate mr-2 flex-1" title={metric.label}>
                                  {metric.label}
                                </label>
                                <input 
                                  type="number" min="0" max="10" required
                                  value={appraisalMetrics[metric.key as keyof TeacherAppraisalMetrics] || ''}
                                  onChange={e => updateMetric(metric.key as keyof TeacherAppraisalMetrics, e.target.value)}
                                  className="w-12 px-1 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Score (0-100)</label>
                            <input 
                              type="number" required min="0" max="100"
                              value={appraisalScore} onChange={e => setAppraisalScore(e.target.value)}
                              placeholder="e.g. 85"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                        <input 
                          type="date" required value={appraisalDate}
                          onChange={e => setAppraisalDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })()
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Evaluator Name</label>
                <input 
                  type="text"
                  required
                  value={appraisalEvaluator}
                  onChange={e => setAppraisalEvaluator(e.target.value)}
                  placeholder="e.g. Headteacher"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-600">Comments / Notes</label>
                </div>
                <textarea 
                  required
                  rows={3}
                  value={appraisalComments}
                  onChange={e => setAppraisalComments(e.target.value)}
                  placeholder="Enter evaluation notes, areas of improvement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Recommendations for Improvement</label>
                <textarea 
                  rows={2}
                  value={appraisalRecommendations}
                  onChange={e => setAppraisalRecommendations(e.target.value)}
                  placeholder="e.g. Needs to improve punctuality and student engagement."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAppraisalModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> Register New Staff
              </h3>
              <button 
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6 space-y-6">
              <div className="flex gap-4">
                <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${newStaffType === 'teacher' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="staffType" value="teacher" checked={newStaffType === 'teacher'} onChange={() => setNewStaffType('teacher')} className="hidden" />
                  <div className="font-bold text-slate-800 mb-1">Teaching Staff</div>
                  <div className="text-xs text-slate-500 font-medium">Teachers and instructors</div>
                </label>
                <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${newStaffType === 'non-teaching' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="staffType" value="non-teaching" checked={newStaffType === 'non-teaching'} onChange={() => setNewStaffType('non-teaching')} className="hidden" />
                  <div className="font-bold text-slate-800 mb-1">Support Staff</div>
                  <div className="text-xs text-slate-500 font-medium">Admin, guards, cleaners, etc.</div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                  <input required value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{newStaffType === 'teacher' ? 'Specialization' : 'Department'} *</label>
                  <input required value={newStaffDeptSpec} onChange={e => setNewStaffDeptSpec(e.target.value)} placeholder={newStaffType === 'teacher' ? 'e.g. Math/Science' : 'e.g. Administration'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                  <input required value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                  <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" value={newStaffDOB} onChange={e => setNewStaffDOB(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contract End Date</label>
                  <input type="date" value={newStaffContractEnd} onChange={e => setNewStaffContractEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Base Salary / Gross (UGX)</label>
                  <input type="number" value={newStaffBaseSalary} onChange={e => {
                    setNewStaffBaseSalary(e.target.value);
                    const net = (calculatePayroll(Number(e.target.value) || 0) as any).netPay; // @ts-ignore
                    setNewStaffNetSalary(net > 0 ? String(net) : '');
                  }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Net Salary (UGX)</label>
                  <input type="number" value={newStaffNetSalary} onChange={e => {
                    setNewStaffNetSalary(e.target.value);
                    const gross = calculateGrossFromNet(Number(e.target.value) || 0);
                    setNewStaffBaseSalary(gross > 0 ? String(gross) : '');
                  }} placeholder="Auto-calculates Gross" className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sex *</label>
                  <select value={newStaffSex} onChange={e => setNewStaffSex(e.target.value as 'Male' | 'Female')} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">National ID (NIN)</label>
                  <input value={newStaffNIN} onChange={e => setNewStaffNIN(e.target.value)} placeholder="e.g. CM..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Residence</label>
                  <input value={newStaffResidence} onChange={e => setNewStaffResidence(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Next of Kin Name</label>
                  <input value={newStaffNextOfKinName} onChange={e => setNewStaffNextOfKinName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Next of Kin Contact</label>
                  <input value={newStaffNextOfKinPhone} onChange={e => setNewStaffNextOfKinPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {newStaffType === 'non-teaching' && (newStaffDeptSpec.toLowerCase().includes('transport') || newStaffDeptSpec.toLowerCase().includes('driver')) && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Vehicle (Transport Dept)</label>
                    <input value={newStaffAssignedVehicle} onChange={e => setNewStaffAssignedVehicle(e.target.value)} placeholder="e.g. UBA 123A (School Van)" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">TIN Number</label>
                  <input value={newStaffTIN} onChange={e => setNewStaffTIN(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">NSSF Number</label>
                  <input value={newStaffNSSF} onChange={e => setNewStaffNSSF(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appraisal Modal & Printable Report */}
      {viewAppraisal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:backdrop-blur-none">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 print:shadow-none print:max-w-none print:w-full print:h-full print:max-h-none print:overflow-visible">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Award size={18} className="text-blue-600" />
                Performance Appraisal Report
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-sm flex items-center gap-1 transition-colors"
                >
                  <Printer size={16} /> Print
                </button>
                <button 
                  onClick={() => setViewAppraisal(null)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Printable Area */}
            <div className="p-8 print:p-0">
              {/* School Header for Print */}
              <div className="hidden print:flex flex-col items-center justify-center mb-8 pb-6 border-b-2 border-slate-800">
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider">{data.settings?.schoolName || 'School Name'}</h1>
                <h2 className="text-xl font-bold text-slate-700 mt-1">STAFF PERFORMANCE APPRAISAL REPORT</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Staff Member</h4>
                  <p className="text-lg font-bold text-slate-800">
                    {(() => {
                      const staff = [...(data.settings?.teachersList || []), ...(data.settings?.nonTeachingStaffList || [])].find(s => s.id === viewAppraisal.staffId);
                      return staff ? staff.name : 'Unknown';
                    })()}
                  </p>
                  <p className="text-sm text-slate-600">{viewAppraisal.department || (viewAppraisal.staffType === 'teacher' ? 'Teaching Staff' : 'Support Staff')}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Appraisal Details</h4>
                  <p className="text-slate-800 font-medium">Date: {new Date(viewAppraisal.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-slate-600 text-sm">Evaluator: {viewAppraisal.evaluator}</p>
                </div>
              </div>

              <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100 print:bg-transparent print:border-slate-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">Overall Score</h3>
                  <div className={`px-4 py-2 rounded-lg font-black text-xl print:border print:border-slate-300 ${
                    viewAppraisal.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                    viewAppraisal.score >= 50 ? 'bg-amber-100 text-amber-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {viewAppraisal.score}%
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 print:border print:border-slate-300">
                  <div 
                    className={`h-3 rounded-full print:bg-slate-500 ${
                      viewAppraisal.score >= 80 ? 'bg-emerald-500' : 
                      viewAppraisal.score >= 50 ? 'bg-amber-500' : 
                      'bg-rose-500'
                    }`} 
                    style={{ width: `${Math.min(100, Math.max(0, viewAppraisal.score))}%` }}
                  ></div>
                </div>
              </div>

              {viewAppraisal.metrics && (
                <div className="mb-8">
                  <h4 className="font-bold text-slate-800 text-base mb-3 border-b border-slate-100 pb-2 print:border-slate-300">Detailed Teacher Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'classroomEnvironment', label: 'Class Environment' },
                      { key: 'learnersBook', label: "Learners' Book" },
                      { key: 'useOfBlackboard', label: 'Use of Blackboard' },
                      { key: 'handwriting', label: 'Handwriting' },
                      { key: 'classroomControl', label: 'Class Control' },
                      { key: 'rules', label: 'Rules' },
                      { key: 'recordOfWork', label: 'Record of Work' },
                      { key: 'schemeOfWork', label: 'Scheme of Work' },
                      { key: 'attendanceRecord', label: 'Attendance Record' }
                    ].map(metric => {
                      const val = viewAppraisal.metrics![metric.key as keyof TeacherAppraisalMetrics] || 0;
                      return (
                        <div key={metric.key} className="bg-white border border-slate-200 p-3 rounded-lg print:border-slate-300">
                          <div className="text-xs text-slate-500 font-bold uppercase mb-1 truncate" title={metric.label}>{metric.label}</div>
                          <div className="flex items-end gap-1">
                            <span className="text-xl font-black text-slate-800">{val}</span>
                            <span className="text-xs font-bold text-slate-400 mb-1">/ 10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-2 border-b border-slate-100 pb-2 print:border-slate-300">Performance Summary & Comments</h4>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{viewAppraisal.comments}</p>
                </div>

                {viewAppraisal.recommendations && (
                  <div>
                    <h4 className="font-bold text-slate-800 text-base mb-2 border-b border-slate-100 pb-2 print:border-slate-300 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-500 print:hidden" />
                      AI Recommended Action Plan
                    </h4>
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 print:bg-transparent print:border-0 print:p-0">
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed italic">{viewAppraisal.recommendations}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-16 pt-8 grid grid-cols-2 gap-12 print:block">
                <div className="print:inline-block print:w-[45%]">
                  <div className="border-t border-slate-400 pt-2">
                    <p className="font-bold text-slate-800 text-center">{viewAppraisal.evaluator}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider text-center">Evaluator Signature</p>
                  </div>
                </div>
                <div className="print:inline-block print:w-[45%] print:float-right">
                  <div className="border-t border-slate-400 pt-2">
                    <p className="font-bold text-slate-800 text-center">
                      {(() => {
                        const staff = [...(data.settings?.teachersList || []), ...(data.settings?.nonTeachingStaffList || [])].find(s => s.id === viewAppraisal.staffId);
                        return staff ? staff.name : '______________________';
                      })()}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider text-center">Staff Signature</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
