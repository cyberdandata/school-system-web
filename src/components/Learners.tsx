import React, { useState, useEffect } from 'react';
import { AppData, Learner, Sex } from '../types';
import { ALL_CLASSES } from '../lib/defaults';
import dataManager from '../lib/db';
import { Search, UserPlus, Trash2, Edit2, Filter, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Camera, Video, X, Check, Printer, IdCard, Users, FileSpreadsheet, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import GlobalFilterBar from './ui/GlobalFilterBar';
import { useAppStore } from "../store/useAppStore";

interface LearnersProps {
  onUpdateLearners: (learners: Learner[]) => void;
}

export default function Learners({ onUpdateLearners }: LearnersProps) {
  const data = useAppStore(state => state.data)!;
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSex, setSelectedSex] = useState('All');
  const [selectedBoarding, setSelectedBoarding] = useState('All');

  // Expanded student detail state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New learner form states
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [admNo, setAdmNo] = useState('');
  const [sex, setSex] = useState<Sex>('Male');
  const [age, setAge] = useState('');
  const [cls, setCls] = useState('P7');
  const [paycode, setPaycode] = useState('');
  const [lin, setLin] = useState('');
  const [photo, setPhoto] = useState('');
  const [studentAccount, setStudentAccount] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [active, setActive] = useState('Yes');
  const [studentEmail, setStudentEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupVehiclePlate, setPickupVehiclePlate] = useState('');
  const [outstandingBalance, setOutstandingBalance] = useState('0');
  const [dayBoarding, setDayBoarding] = useState('Day');
  const [suiteCode, setSuiteCode] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editMiddleName, setEditMiddleName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editAdmNo, setEditAdmNo] = useState('');
  const [editSex, setEditSex] = useState<Sex>('Male');
  const [editAge, setEditAge] = useState('');
  const [editCls, setEditCls] = useState('P7');
  const [editPaycode, setEditPaycode] = useState('');
  const [editLin, setEditLin] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editStudentAccount, setEditStudentAccount] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editActive, setEditActive] = useState('Yes');
  const [editStudentEmail, setEditStudentEmail] = useState('');
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianEmail, setEditGuardianEmail] = useState('');
  const [editGuardianPhone, setEditGuardianPhone] = useState('');
  const [editGuardianRelation, setEditGuardianRelation] = useState('');
  const [editPickupPhone, setEditPickupPhone] = useState('');
  const [editPickupVehiclePlate, setEditPickupVehiclePlate] = useState('');
  const [editOutstandingBalance, setEditOutstandingBalance] = useState('0');
  const [editDayBoarding, setEditDayBoarding] = useState('Day');
  const [editSuiteCode, setEditSuiteCode] = useState('');

  // Camera capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCaptureTarget, setActiveCaptureTarget] = useState<'new' | { studentId: string } | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Bind camera stream robustly
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.error("Video play error:", e));
    }
  }, [isCameraOpen, cameraStream]);

  // ID Card Generation States
  const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
  const [idCardTarget, setIdCardTarget] = useState<Learner | 'filtered' | null>(null);
  const [idCardTheme, setIdCardTheme] = useState<'blue' | 'emerald' | 'burgundy' | 'slate'>('blue');
  const [showCardBack, setShowCardBack] = useState(false);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showSignature, setShowSignature] = useState(true);

  // Data integrity & Promotions states
  const [showArchived, setShowArchived] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDupsModal, setShowDupsModal] = useState(false);

  const openCapture = async (target: 'new' | { studentId: string }) => {
    setActiveCaptureTarget(target);
    setIsCameraOpen(true);
    setCapturedImage(null);
    setCameraError(null);
    
    // Request permission and start camera stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      


      // Enumerate available video inputs
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Could not access device camera. Please check permissions.");
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } catch (err: any) {
      console.error("Switch camera error:", err);
      setCameraError(err.message || "Failed to switch camera device.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror front camera (standard webcam display expectation)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        const size = Math.min(video.videoWidth, video.videoHeight);
        const x = (video.videoWidth - size) / 2;
        const y = (video.videoHeight - size) / 2;
        ctx.drawImage(video, x, y, size, size, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleUsePhoto = () => {
    if (!capturedImage || !activeCaptureTarget) return;

    if (activeCaptureTarget === 'new') {
      setPhoto(capturedImage);
    } else {
      const { studentId } = activeCaptureTarget;
      if (editingId === studentId) {
        setEditPhoto(capturedImage);
      } else {
        const updated = data.learners.map(l => {
          if (l.id === studentId) {
            return { ...l, photo: capturedImage };
          }
          return l;
        });
        onUpdateLearners(updated);

        window.dispatchEvent(new CustomEvent('otec-modal-notify', {
          detail: {
            title: 'Student Photo Updated',
            message: `Webcam photo successfully saved and applied to student profile.`,
            type: 'success',
            timestamp: new Date().toLocaleString()
          }
        }));
      }
    }

    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setActiveCaptureTarget(null);
    setCapturedImage(null);
  };

  const handleAddLearner = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let trimmedName = name.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedMiddleName = middleName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedName && (trimmedFirstName || trimmedLastName)) {
      trimmedName = [trimmedFirstName, trimmedMiddleName, trimmedLastName].filter(Boolean).join(' ');
    }

    const trimmedAdm = admNo.trim();

    if (!trimmedName) {
      setError('Please provide the learner’s full name or First & Last name.');
      return;
    }

    // Check if admission number is duplicate
    if (trimmedAdm && data.learners.some(l => l.admNo.toLowerCase() === trimmedAdm.toLowerCase())) {
      setError('A student with this Admission Number is already registered.');
      return;
    }

    // Check if student with the same name in the same class already exists to prevent duplicates
    if (data.learners.some(l => l.name.toLowerCase().trim() === trimmedName.toLowerCase().trim() && l.cls === cls && !l.archived)) {
      setError('A student with this name is already registered in this class stream.');
      return;
    }

    const nextSeq = data.learners.length + 1001;
    const generatedAdm = trimmedAdm || `OTEC/${data.settings?.year || 2026}/${nextSeq}`;
    const generatedLin = lin.trim() || `LIN-${data.settings?.year || 2026}-${nextSeq}`;
    const generatedPhoto = photo.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmedName)}`;

    const newLearner: Learner = {
      id: 'L' + Date.now().toString(36),
      name: trimmedName,
      firstName: trimmedFirstName || undefined,
      middleName: trimmedMiddleName || undefined,
      lastName: trimmedLastName || undefined,
      admNo: generatedAdm,
      sex,
      age: age || '-',
      cls,
      paycode: paycode.trim() || undefined,
      lin: generatedLin,
      photo: generatedPhoto,
      studentAccount: studentAccount.trim() || undefined,
      studentPhone: studentPhone.trim() || undefined,
      active: active || undefined,
      studentEmail: studentEmail.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      guardianEmail: guardianEmail.trim() || undefined,
      guardianPhone: guardianPhone.trim() || undefined,
      guardianRelation: guardianRelation.trim() || undefined,
      pickupPhone: pickupPhone.trim() || undefined,
      pickupVehiclePlate: pickupVehiclePlate.trim() || undefined,
      outstandingBalance: outstandingBalance.trim() || undefined,
      dayBoarding: dayBoarding || undefined,
      suiteCode: suiteCode.trim() || undefined
    };

    onUpdateLearners([...data.learners, newLearner]);
    
    // Dispatch custom event for update log modal!
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'New Student Enrolled',
        message: `Registered student "${trimmedName}" in stream "${cls}" successfully. Account and guardian contacts recorded securely.`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));

    // Clear inputs
    setName('');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setAdmNo('');
    setAge('');
    setPaycode('');
    setLin('');
    setPhoto('');
    setStudentAccount('');
    setStudentPhone('');
    setActive('Yes');
    setStudentEmail('');
    setGuardianName('');
    setGuardianEmail('');
    setGuardianPhone('');
    setGuardianRelation('');
    setPickupPhone('');
    setPickupVehiclePlate('');
    setOutstandingBalance('0');
    setDayBoarding('Day');
    setSuiteCode('');
    setError('');
  };

  const handleDeleteLearner = (id: string) => {
    if (confirm('Delete this learner? All their scores and comments across all terms and exam sets will be permanently removed.')) {
      const updated = data.learners.filter(l => l.id !== id);
      onUpdateLearners(updated);
      
      window.dispatchEvent(new CustomEvent('otec-modal-notify', {
        detail: {
          title: 'Student De-registered',
          message: 'Student profile, scoresheet history, and behavior ratings have been completely purged from the registry.',
          type: 'warning',
          timestamp: new Date().toLocaleString()
        }
      }));
    }
  };

  const handleStartEdit = (learner: Learner) => {
    setEditingId(learner.id);
    setEditName(learner.name);
    setEditFirstName(learner.firstName || '');
    setEditMiddleName(learner.middleName || '');
    setEditLastName(learner.lastName || '');
    setEditAdmNo(learner.admNo);
    setEditSex(learner.sex);
    setEditAge(learner.age);
    setEditCls(learner.cls);
    setEditPaycode(learner.paycode || '');
    setEditLin(learner.lin || '');
    setEditPhoto(learner.photo || '');
    setEditStudentAccount(learner.studentAccount || '');
    setEditStudentPhone(learner.studentPhone || '');
    setEditActive(learner.active || 'Yes');
    setEditStudentEmail(learner.studentEmail || '');
    setEditGuardianName(learner.guardianName || '');
    setEditGuardianEmail(learner.guardianEmail || '');
    setEditGuardianPhone(learner.guardianPhone || '');
    setEditGuardianRelation(learner.guardianRelation || '');
    setEditPickupPhone(learner.pickupPhone || '');
    setEditPickupVehiclePlate(learner.pickupVehiclePlate || '');
    setEditOutstandingBalance(learner.outstandingBalance || '0');
    setEditDayBoarding(learner.dayBoarding || 'Day');
    setEditSuiteCode(learner.suiteCode || '');
  };

  const handleSaveEdit = (id: string) => {
    let trimmedName = editName.trim();
    if (!trimmedName && (editFirstName.trim() || editLastName.trim())) {
      trimmedName = [editFirstName.trim(), editMiddleName.trim(), editLastName.trim()].filter(Boolean).join(' ');
    }
    if (!trimmedName) return;

    // Check duplicate admission numbers
    const duplicate = data.learners.some(
      l => l.id !== id && editAdmNo.trim() && l.admNo.toLowerCase() === editAdmNo.trim().toLowerCase()
    );
    if (duplicate) {
      alert('Admission Number is already used by another student.');
      return;
    }

    // Check duplicate names in same class level to prevent duplicate entries on edit
    const duplicateNameClass = data.learners.some(
      l => l.id !== id && l.name.toLowerCase().trim() === trimmedName.toLowerCase().trim() && l.cls === editCls && !l.archived
    );
    if (duplicateNameClass) {
      alert('A student with this name is already registered in this class stream.');
      return;
    }

    const updated = data.learners.map(l => {
      if (l.id === id) {
        return {
          ...l,
          name: trimmedName,
          firstName: editFirstName.trim() || undefined,
          middleName: editMiddleName.trim() || undefined,
          lastName: editLastName.trim() || undefined,
          admNo: editAdmNo.trim(),
          sex: editSex,
          age: editAge || '-',
          cls: editCls,
          paycode: editPaycode.trim() || undefined,
          lin: editLin.trim() || undefined,
          photo: editPhoto.trim() || undefined,
          studentAccount: editStudentAccount.trim() || undefined,
          studentPhone: editStudentPhone.trim() || undefined,
          active: editActive || undefined,
          studentEmail: editStudentEmail.trim() || undefined,
          guardianName: editGuardianName.trim() || undefined,
          guardianEmail: editGuardianEmail.trim() || undefined,
          guardianPhone: editGuardianPhone.trim() || undefined,
          guardianRelation: editGuardianRelation.trim() || undefined,
          pickupPhone: editPickupPhone.trim() || undefined,
          pickupVehiclePlate: editPickupVehiclePlate.trim() || undefined,
          outstandingBalance: editOutstandingBalance.trim() || undefined,
          dayBoarding: editDayBoarding || undefined,
          suiteCode: editSuiteCode.trim() || undefined
        };
      }
      return l;
    });

    onUpdateLearners(updated);
    
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'Student Directory Updated',
        message: `Student file for "${trimmedName}" updated and auto-synchronized in school ledger.`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));

    setEditingId(null);
  };

  // Function to compare student fee balances with SchoolPay transactions
  const getSchoolPayComparison = (learner: Learner) => {
    if (!learner) {
      return {
        hasOutstanding: false,
        balance: 0,
        latestTx: null,
        totalPaidViaSchoolPay: 0,
        allTxCount: 0,
        allTransactions: []
      };
    }
    const rawBalance = learner.outstandingBalance;
    const balanceStr = typeof rawBalance === 'number' ? String(rawBalance) : (rawBalance || '0');
    const balance = Number(balanceStr.replace(/[^0-9.-]+/g, "")) || 0;
    
    // Find SchoolPay transactions for this student
    const studentTx = (data.finances || []).filter(tx => 
      tx && 
      tx.studentId === learner.id && 
      ((tx.id && typeof tx.id === 'string' && tx.id.startsWith('sp-')) || 
       (tx.recordedBy && typeof tx.recordedBy === 'string' && tx.recordedBy.toLowerCase().includes('school pay')))
    );
    
    // Sort transactions by date descending to get the latest safely
    const sortedTx = [...studentTx].sort((a, b) => {
      const dateA = a && a.date ? new Date(a.date).getTime() : 0;
      const dateB = b && b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    const latestTx = sortedTx[0] || null;
    const totalPaidViaSchoolPay = studentTx.reduce((sum, tx) => sum + (tx && typeof tx.amount === 'number' ? tx.amount : 0), 0);
    
    return {
      hasOutstanding: balance > 0,
      balance,
      latestTx,
      totalPaidViaSchoolPay,
      allTxCount: studentTx.length,
      allTransactions: sortedTx
    };
  };

  // Filter learners safely
  const filteredLearners = (data.learners || []).filter(l => {
    if (!l) return false;
    
    // Support archive toggle
    const isArchived = !!l.archived;
    if (showArchived !== isArchived) return false;

    const nameStr = l.name || '';
    const admNoStr = l.admNo || '';
    const matchesSearch = 
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admNoStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.paycode && String(l.paycode).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.lin && String(l.lin).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = selectedClass === 'All' || l.cls === selectedClass;
    const matchesSex = selectedSex === 'All' || l.sex === selectedSex;
    const matchesBoarding = 
      selectedBoarding === 'All' || 
      (selectedBoarding === 'Boarding' && l.dayBoarding === 'Boarding') ||
      (selectedBoarding === 'Day' && l.dayBoarding === 'Day');
    return matchesSearch && matchesClass && matchesSex && matchesBoarding;
  });

  const handleExportRosterToExcel = () => {
    if (filteredLearners.length === 0) {
      alert("No student records match the active filter criteria.");
      return;
    }

    const exportRows = filteredLearners.map((l, index) => ({
      'Sl No.': index + 1,
      'Admission Number': l.admNo || '',
      'Full Name': l.name || '',
      'First Name': l.firstName || '',
      'Middle Name': l.middleName || '',
      'Last Name': l.lastName || '',
      'Class': l.cls || '',
      'Gender': l.sex || '',
      'Age': l.age || '',
      'Day/Boarding': l.dayBoarding || 'Day',
      'Paycode': l.paycode || '',
      'LIN / UNEB No': l.lin || l.unebNo || '',
      'Guardian Name': l.guardianName || '',
      'Guardian Phone': l.guardianPhone || '',
      'Guardian Relation': l.guardianRelation || '',
      'Outstanding Balance (UGX)': l.outstandingBalance || '0'
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Roster');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `OTEC_Student_Roster_${selectedClass === 'All' ? 'All_Classes' : selectedClass.replace(/\s+/g, '_')}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, filename);

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Successfully exported ${filteredLearners.length} student records to Excel spreadsheet!`,
        type: 'success'
      }
    }));
  };

  // Find duplicate student groups
  const duplicateGroups = React.useMemo(() => {
    const activeLearners = (data.learners || []).filter(l => !l.archived);
    
    // Group by Admission Number
    const byAdm: Record<string, Learner[]> = {};
    activeLearners.forEach(l => {
      if (l.admNo) {
        const key = l.admNo.toLowerCase().trim();
        if (!byAdm[key]) byAdm[key] = [];
        byAdm[key].push(l);
      }
    });
    
    // Group by Name and Class
    const byNameCls: Record<string, Learner[]> = {};
    activeLearners.forEach(l => {
      if (l.name && l.cls) {
        const key = `${l.name.toLowerCase().trim()}|${l.cls.toLowerCase().trim()}`;
        if (!byNameCls[key]) byNameCls[key] = [];
        byNameCls[key].push(l);
      }
    });
    
    const groups: { type: 'admNo' | 'nameCls'; key: string; students: Learner[] }[] = [];
    
    // Collect admission number duplicates
    Object.entries(byAdm).forEach(([key, list]) => {
      if (list.length > 1) {
        groups.push({
          type: 'admNo',
          key: `Admission No: ${list[0].admNo}`,
          students: list
        });
      }
    });
    
    // Collect name + class duplicates (excluding those already in admission number duplicates)
    Object.entries(byNameCls).forEach(([key, list]) => {
      if (list.length > 1) {
        const firstStudentIds = list.map(s => s.id);
        const alreadyCovered = groups.some(g => g.students.some(s => firstStudentIds.includes(s.id)));
        if (!alreadyCovered) {
          groups.push({
            type: 'nameCls',
            key: `Name & Class: ${list[0].name} inside ${list[0].cls}`,
            students: list
          });
        }
      }
    });
    
    return groups;
  }, [data.learners]);

  // Execute auto de-duplication
  const handleAutoResolveDuplicates = () => {
    if (duplicateGroups.length === 0) return;
    
    const idsToArchive = new Set<string>();
    
    duplicateGroups.forEach(group => {
      // Keep the first student as active, archive the others
      group.students.slice(1).forEach(student => {
        idsToArchive.add(student.id);
      });
    });
    
    const updated = data.learners.map(l => {
      if (idsToArchive.has(l.id)) {
        return { ...l, archived: true };
      }
      return l;
    });
    
    onUpdateLearners(updated);
    
    // Log the data de-duplication action
    dataManager.addActivityLog(
      'data_imported',
      `De-duplication run: Automatically identified and archived ${idsToArchive.size} duplicate student accounts.`
    );
    
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'Duplicates Resolved',
        message: `Successfully identified and resolved redundant student entries. ${idsToArchive.size} profiles have been archived to restore absolute database integrity.`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));
    
    setShowDupsModal(false);
  };

  // Class progression flow mapping
  const CLASS_PROGRESSION: Record<string, string> = {
    'ZEBRA': 'LION',
    'LION': 'ELEPHANT',
    'ELEPHANT': 'P1',
    'P1': 'P2',
    'P2': 'P3',
    'P3': 'P4',
    'P4': 'P5',
    'P5': 'P6',
    'P6': 'P7'
  };

  const handlePromoteStudents = () => {
    let promotedCount = 0;
    let archivedGraduatesCount = 0;
    
    const updated = data.learners.map(l => {
      if (l.archived) return l; // ignore already archived
      
      const upperCls = l.cls.toUpperCase().trim();
      if (upperCls === 'P7' || upperCls === 'PRIMARY 7') {
        archivedGraduatesCount++;
        return { ...l, archived: true };
      }
      
      const nextCls = CLASS_PROGRESSION[upperCls];
      if (nextCls) {
        promotedCount++;
        // Increment age if it's a valid integer
        let newAge = l.age;
        const currentAgeInt = parseInt(l.age, 10);
        if (!isNaN(currentAgeInt)) {
          newAge = String(currentAgeInt + 1);
        }
        return { ...l, cls: nextCls, age: newAge };
      }
      
      return l;
    });
    
    onUpdateLearners(updated);
    
    dataManager.addActivityLog(
      'settings_modified',
      `Executed Promotional Progression Cycle: Promoted ${promotedCount} pupils, and archived/graduated ${archivedGraduatesCount} Primary 7 students.`
    );
    
    window.dispatchEvent(new CustomEvent('otec-modal-notify', {
      detail: {
        title: 'Promotional Progression Completed',
        message: `Successfully executed promotion cycle: ${promotedCount} students promoted to their next respective class levels, and ${archivedGraduatesCount} P7 candidates moved to archived alumni directories.`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      }
    }));
    
    setShowPromoteModal(false);
  };

  // Helper to generate a unique, sequential, alphabetical UNEB-compliant index number for any student
  const getStudentIndexNumber = (student: Learner) => {
    if (student.unebNo) return student.unebNo;
    
    const classStudents = (data.learners || [])
      .filter(x => x && x.cls === student.cls)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    const indexInClass = classStudents.findIndex(x => x.id === student.id) + 1;
    const paddedIndex = String(indexInClass > 0 ? indexInClass : 1).padStart(3, '0');
    
    const classShort = (student.cls || 'ST')
      .replace('Primary ', 'P')
      .replace('Primary', 'P')
      .replace('Baby Class', 'BC')
      .replace('Middle Class', 'MC')
      .replace('Top Class', 'TC')
      .replace(/\s+/g, '')
      .substring(0, 3)
      .toUpperCase();
      
    return `300538/${classShort}/${paddedIndex}`;
  };

  // Determine which students to generate ID cards for
  const getStudentsToPrint = () => {
    if (!idCardTarget) return [];
    if (idCardTarget === 'filtered') return filteredLearners;
    return [idCardTarget];
  };

  const studentsToPrint = getStudentsToPrint();

  // Render a beautifully formatted ID Card
  const renderSingleCard = (student: Learner, index: number) => {
    const indexNo = getStudentIndexNumber(student);
    
    // Custom theme colors
    const themeColors = {
      blue: {
        bg: 'bg-blue-900',
        text: 'text-blue-900',
        border: 'border-blue-900/20',
        accent: 'bg-amber-500 text-white',
        accentText: 'text-amber-500',
        lightBg: 'bg-blue-50/50',
        bannerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950',
      },
      emerald: {
        bg: 'bg-emerald-900',
        text: 'text-emerald-950',
        border: 'border-emerald-900/20',
        accent: 'bg-amber-500 text-white',
        accentText: 'text-amber-500',
        lightBg: 'bg-emerald-50/50',
        bannerBg: 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950',
      },
      burgundy: {
        bg: 'bg-rose-950',
        text: 'text-rose-950',
        border: 'border-rose-950/20',
        accent: 'bg-amber-500 text-white',
        accentText: 'text-amber-500',
        lightBg: 'bg-rose-50/50',
        bannerBg: 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950',
      },
      slate: {
        bg: 'bg-slate-900',
        text: 'text-slate-900',
        border: 'border-slate-900/20',
        accent: 'bg-blue-600 text-white',
        accentText: 'text-blue-600',
        lightBg: 'bg-slate-50/50',
        bannerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950',
      }
    };

    const colors = themeColors[idCardTheme] || themeColors.blue;

    return (
      <div key={student.id} className="print-card flex flex-col sm:flex-row gap-4 items-center justify-center break-inside-avoid page-break-inside-avoid">
        {/* FRONT OF CARD */}
        <div className="w-[250px] h-[375px] border border-slate-300 rounded-2xl overflow-hidden relative bg-white flex flex-col justify-between shadow-xs select-none shrink-0 print:border-slate-400 print:shadow-none">
          {/* Top Header Banner */}
          <div className={`${colors.bannerBg} text-white px-3 py-2.5 flex flex-col items-center justify-center text-center relative border-b border-amber-400/30`}>
            {/* Small decorative emblem */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-amber-300 border border-white/5">
              <IdCard size={14} />
            </div>
            <div className="pl-6">
              <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">{data.settings.schoolName || 'Uganda National School'}</h4>
              <span className="text-[7.5px] font-extrabold text-amber-300 tracking-widest uppercase mt-0.5 block">STUDENT ID CARD</span>
            </div>
          </div>

          {/* Card Content Body */}
          <div className="p-3 flex-1 flex flex-col items-center justify-start text-center space-y-2">
            {/* Photo Frame */}
            <div className={`w-24 h-28 border-2 ${colors.border} rounded-xl overflow-hidden bg-slate-50 relative shrink-0 mt-1 shadow-xs`}>
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-300 bg-slate-100">
                  {/* Visual Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-1 text-slate-400">
                    <Camera size={14} />
                  </div>
                  <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider text-center leading-tight">No Photo Captured</span>
                </div>
              )}
            </div>

            {/* Student Profile Info */}
            <div className="space-y-1 w-full">
              <h3 className="text-xs font-black text-slate-900 tracking-tight leading-tight line-clamp-2 uppercase">
                {student.name}
              </h3>
              
              {/* Custom styled list for particulars */}
              <div className={`rounded-xl p-2 ${colors.lightBg} border ${colors.border} text-left text-[10px] space-y-1.5 font-medium`}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[8px]">Class / Stream</span>
                  <span className="font-extrabold text-slate-800">{student.cls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[8px]">Admission No</span>
                  <span className="font-mono font-bold text-slate-800">{student.admNo || '—'}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/40">
                  <span className="text-slate-400 font-bold uppercase text-[8px]">Index Number</span>
                  <span className="font-mono font-extrabold text-blue-700">{indexNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Area with Barcode and Signature */}
          <div className="px-3 pb-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2.5 bg-slate-50/50">
            {/* Signature Block */}
            {showSignature ? (
              <div className="text-left">
                <span className="text-[7px] font-semibold text-slate-400 uppercase tracking-wider block">Authorized By</span>
                <div className="h-5 flex items-center pl-1">
                  {/* Decorative handwritten headteacher signature */}
                  <span className="font-serif italic text-blue-800 font-black text-xs opacity-75 select-none" style={{ fontFamily: 'Georgia, serif' }}>
                    {data.settings.schoolName?.substring(0, 3) || 'Ssek'}
                  </span>
                </div>
                <span className="text-[6.5px] font-bold text-slate-500 uppercase tracking-widest block">Principal</span>
              </div>
            ) : (
              <div className="text-left text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                ID Card Property
              </div>
            )}

            {/* Styled Barcode Block */}
            {showBarcode && (
              <div className="flex flex-col items-center">
                <div className="flex gap-[1.5px] items-stretch h-5 mt-0.5 select-none" title="Scan Barcode">
                  {[1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 3].map((w, idx) => (
                    <div key={idx} className={`bg-slate-800 ${
                      w === 1 ? 'w-[1px]' : w === 2 ? 'w-[2px]' : 'w-[3px]'
                    }`} />
                  ))}
                </div>
                <span className="text-[6px] font-mono font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                  {student.admNo || '300538'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BACK OF CARD (Optional) */}
        {showCardBack && (
          <div className="w-[250px] h-[375px] border border-slate-300 rounded-2xl overflow-hidden relative bg-white flex flex-col justify-between shadow-xs select-none shrink-0 print:border-slate-400 print:shadow-none">
            {/* Top colored stripe */}
            <div className={`h-2.5 ${colors.bannerBg}`} />

            {/* Guidelines Body */}
            <div className="p-4 flex-1 flex flex-col justify-between text-slate-700">
              <div className="space-y-3">
                <div className="text-center border-b border-slate-100 pb-2">
                  <h5 className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Terms &amp; Conditions</h5>
                  <span className="text-[7px] text-slate-400 uppercase font-semibold">Rules of Identification</span>
                </div>
                
                <ul className="space-y-2 text-[8px] text-slate-500 leading-relaxed font-semibold">
                  <li className="flex items-start gap-1.5">
                    <span className={`${colors.accentText}`}>•</span>
                    <span>This identification card remains the legal property of <b>{data.settings.schoolName || 'the School'}</b>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className={`${colors.accentText}`}>•</span>
                    <span>The cardholder must carry this card at all times while on school premises or during official events.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className={`${colors.accentText}`}>•</span>
                    <span>Any alteration or unauthorized transfer of this ID card is strictly forbidden.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className={`${colors.accentText}`}>•</span>
                    <span>If found, please return this card to the administration office or mail to the contact details below.</span>
                  </li>
                </ul>
              </div>

              {/* School Contact Block */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-center space-y-1">
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">School Address &amp; Contact</span>
                <p className="text-[8px] font-black text-slate-700 leading-none">{data.settings.schoolName}</p>
                <p className="text-[7.5px] font-mono text-slate-500">{data.settings.year || '2026'} Academic Session</p>
              </div>
            </div>

            {/* Bottom colored bar */}
            <div className={`px-3 py-1 text-center ${colors.bannerBg} text-white`}>
              <span className="text-[6.5px] font-extrabold uppercase tracking-widest">Education is Light</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-200 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Student Enrollment Directory</h2>
          <p className="text-slate-500 text-xs mt-1">
            Register new students and manage student records across Baby Class up to Primary 7 candidate streams.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            Active: {(data.learners || []).filter(l => !l.archived).length}
          </span>
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            Archived: {(data.learners || []).filter(l => l.archived).length}
          </span>
        </div>
      </div>

      {/* DATA INTEGRITY & PROMOTIONS CONTROL BOARD */}
      <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <Check size={16} />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">Academic Promotion & Data Integrity Terminal</h3>
          </div>
          <p className="text-slate-400 text-xs max-w-2xl">
            Cleanse registration records from redundant duplicates, or execute automated class promotions & graduates archiving after Term 3.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setShowDupsModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <AlertCircle size={14} className="text-amber-400" />
            <span>Scan Duplicates ({duplicateGroups.length})</span>
          </button>

          <button
            onClick={() => setShowPromoteModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/10"
          >
            <UserPlus size={14} />
            <span>Class Promotions</span>
          </button>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              showArchived 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/15' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {showArchived ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{showArchived ? 'View Active Directory' : `View Archived/Graduates (${(data.learners || []).filter(l => l.archived).length})`}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Register Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs xl:sticky xl:top-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <UserPlus size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Register Student</h3>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAddLearner} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Student Name *</label>
              <input
                type="text"
                placeholder="e.g. Ssekandi Emmanuel"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Split Name (Optional)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">First Name</label>
                  <input
                    type="text"
                    placeholder="First"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Middle Name</label>
                  <input
                    type="text"
                    placeholder="Middle"
                    value={middleName}
                    onChange={e => setMiddleName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Admission No / Reg No</label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  value={admNo}
                  onChange={e => setAdmNo(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  placeholder="e.g. 12"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender *</label>
                <select
                  value={sex}
                  onChange={e => setSex(e.target.value as Sex)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                >
                  <option value="Male">Boy (Male)</option>
                  <option value="Female">Girl (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Class stream *</label>
                <select
                  value={cls}
                  onChange={e => setCls(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                >
                  {ALL_CLASSES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {cls === 'P7' && (
                  <p className="mt-1.5 text-[10px] text-amber-600 font-semibold leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                    ✨ UNEB Candidate: Unique compliant index number (300538/001 - 300538/500) auto-assigned alphabetically by local name (surname) first and christian (given) second.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Learner ID (LIN)</label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate"
                  value={lin}
                  onChange={e => setLin(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Code (Paycode)</label>
                <input
                  type="text"
                  placeholder="e.g. 1004824716"
                  value={paycode}
                  onChange={e => setPaycode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 px-3 border border-slate-200 bg-slate-50 text-slate-700 rounded-xl text-[11px] font-bold hover:bg-slate-100 flex items-center justify-between transition-all"
              >
                <span>Extended Account &amp; Guardian Info</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-3.5 p-4 border border-slate-200/80 bg-slate-50/40 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Account</label>
                    <input
                      type="text"
                      placeholder="e.g. ACC-088"
                      value={studentAccount}
                      onChange={e => setStudentAccount(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Suite Code</label>
                    <input
                      type="text"
                      placeholder="e.g. S-12"
                      value={suiteCode}
                      onChange={e => setSuiteCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Outstanding Bal (UGX)</label>
                    <input
                      type="text"
                      placeholder="e.g. 50000"
                      value={outstandingBalance}
                      onChange={e => setOutstandingBalance(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Day/Boarding</label>
                    <select
                      value={dayBoarding}
                      onChange={e => setDayBoarding(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    >
                      <option value="Day">Day scholar</option>
                      <option value="Boarding">Boarding student</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 0706948165"
                      value={studentPhone}
                      onChange={e => setStudentPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Active</label>
                    <select
                      value={active}
                      onChange={e => setActive(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                    >
                      <option value="Yes">Yes (Active)</option>
                      <option value="No">No (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Email</label>
                  <input
                    type="email"
                    placeholder="student@school.ug"
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="border-t border-slate-200/60 pt-3 mt-1 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Guardian Information</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Nakalimbe Eva"
                        value={guardianName}
                        onChange={e => setGuardianName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Relation</label>
                      <input
                        type="text"
                        placeholder="e.g. Mother / Uncle"
                        value={guardianRelation}
                        onChange={e => setGuardianRelation(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. 0705362439"
                        value={guardianPhone}
                        onChange={e => setGuardianPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Email</label>
                      <input
                        type="email"
                        placeholder="guardian@gmail.com"
                        value={guardianEmail}
                        onChange={e => setGuardianEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Profile Photo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL or camera-captured base64 image"
                  value={photo}
                  onChange={e => setPhoto(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => openCapture('new')}
                  className="px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-150 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Capture via Device Camera"
                >
                  <Camera size={14} />
                  <span>Take Photo</span>
                </button>
              </div>
              {photo && photo.startsWith('data:image/') && (
                <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                  <img src={photo} alt="Captured preview" className="w-8 h-8 rounded-full border border-emerald-200 object-cover shrink-0" referrerPolicy="no-referrer" />
                  <span className="text-[10px] text-emerald-800 font-bold">Photo captured via camera</span>
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="ml-auto text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-600/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Register Student</span>
            </button>
          </form>
        </div>

        {/* Right Column: List & Filter Directory */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs xl:col-span-2 space-y-6">
          {(data.learners || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                  <Users size={32} className="stroke-[1.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-black">
                  ✓
                </div>
              </div>
              <div className="max-w-md space-y-1.5">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Student Directory is Empty</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  There are no registered students at OTEC Academy yet. To enter scores, view academic reports, or manage school ledger transactions, you must first build your learner database.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const nameInput = document.querySelector('input[placeholder="e.g. Ssekandi Emmanuel"]') as HTMLInputElement;
                    if (nameInput) {
                      nameInput.focus();
                      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus size={12} />
                  <span>Register Student Manually</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('otec-route-change', { detail: 'data' }))}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-3xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={12} className="text-emerald-600" />
                  <span>Import Excel Roster</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h3 className="text-sm font-bold text-slate-950">Student Register ({filteredLearners.length})</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportRosterToExcel}
                disabled={filteredLearners.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 disabled:opacity-50 text-emerald-700 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                title="Export currently filtered student roster to Excel spreadsheet"
              >
                <FileSpreadsheet size={12} className="text-emerald-600" />
                <span>Export Roster (Excel)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdCardTarget('filtered');
                  setIsIDCardModalOpen(true);
                }}
                disabled={filteredLearners.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 disabled:opacity-50 text-blue-700 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                title="Generate printable ID cards for currently filtered list"
              >
                <IdCard size={12} />
                <span>Print Filtered ID Cards ({filteredLearners.length})</span>
              </button>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1.5 rounded-md uppercase">PLE COMPLIANT</span>
            </div>
          </div>

          {/* Directory Filters */}
          <GlobalFilterBar
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by name, ID, or Paycode..."
            showClassFilter={true}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            showSexFilter={true}
            selectedSex={selectedSex}
            onSexChange={setSelectedSex}
            showStatusFilter={true}
            selectedStatus={selectedBoarding}
            onStatusChange={setSelectedBoarding}
            statusOptions={[
              { label: 'All Status (Day & Boarder)', value: 'All' },
              { label: 'Boarders Only', value: 'Boarding' },
              { label: 'Day Scholars Only', value: 'Day' }
            ]}
          />

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">Adm Number</th>
                  <th className="py-3 px-4 font-semibold">Student Name &amp; IDs</th>
                  <th className="py-3 px-4 font-semibold text-center">Sex</th>
                  <th className="py-3 px-4 font-semibold text-center">Age</th>
                  <th className="py-3 px-4 font-semibold">Class Stream</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {filteredLearners.map(l => {
                    const isEditing = editingId === l.id;
                    const isExpanded = expandedId === l.id;

                    return (
                      <React.Fragment key={l.id}>
                        <motion.tr
                          layout="position"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className={`border-b border-slate-100 transition-colors ${isEditing ? 'bg-blue-50/10' : isExpanded ? 'bg-slate-50/80 font-semibold' : 'hover:bg-slate-50/30'}`}
                        >
                        {isEditing ? (
                          <td className="py-4 px-4" colSpan={6}>
                            <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100 space-y-4">
                              <div className="flex justify-between items-center border-b border-blue-100/60 pb-2">
                                <span className="text-xs font-bold text-blue-900">Editing Student File: {l.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">ID: {l.id}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Full Student Name *</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">First Name</label>
                                  <input
                                    type="text"
                                    value={editFirstName}
                                    onChange={e => setEditFirstName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Last Name</label>
                                  <input
                                    type="text"
                                    value={editLastName}
                                    onChange={e => setEditLastName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Reg/Adm Number</label>
                                  <input
                                    type="text"
                                    value={editAdmNo}
                                    onChange={e => setEditAdmNo(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Gender</label>
                                  <select
                                    value={editSex}
                                    onChange={e => setEditSex(e.target.value as Sex)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  >
                                    <option value="Male">Boy (Male)</option>
                                    <option value="Female">Girl (Female)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Age</label>
                                  <input
                                    type="number"
                                    value={editAge}
                                    onChange={e => setEditAge(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Class stream</label>
                                  <select
                                    value={editCls}
                                    onChange={e => setEditCls(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  >
                                    {ALL_CLASSES.map(c => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                  {editCls === 'P7' && (
                                    <p className="mt-1 text-[9px] text-amber-600 font-semibold leading-tight">
                                      ✨ UNEB Candidate index will be auto-generated (300538/001 - 300538/500).
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">LIN (Learner ID)</label>
                                  <input
                                    type="text"
                                    value={editLin}
                                    onChange={e => setEditLin(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Payment Code</label>
                                  <input
                                    type="text"
                                    value={editPaycode}
                                    onChange={e => setEditPaycode(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Account</label>
                                  <input
                                    type="text"
                                    value={editStudentAccount}
                                    onChange={e => setEditStudentAccount(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Suite Code</label>
                                  <input
                                    type="text"
                                    value={editSuiteCode}
                                    onChange={e => setEditSuiteCode(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Day/Boarding</label>
                                  <select
                                    value={editDayBoarding}
                                    onChange={e => setEditDayBoarding(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  >
                                    <option value="Day">Day scholar</option>
                                    <option value="Boarding">Boarding student</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Outstanding Bal</label>
                                  <input
                                    type="text"
                                    value={editOutstandingBalance}
                                    onChange={e => setEditOutstandingBalance(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Active status</label>
                                  <select
                                    value={editActive}
                                    onChange={e => setEditActive(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                  >
                                    <option value="Yes">Yes (Active)</option>
                                    <option value="No">No (Inactive)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Student Phone</label>
                                  <input
                                    type="text"
                                    value={editStudentPhone}
                                    onChange={e => setEditStudentPhone(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs border-t border-slate-200/50 pt-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Profile Photo</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editPhoto}
                                      onChange={e => setEditPhoto(e.target.value)}
                                      className="flex-1 px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 text-xs focus:outline-hidden"
                                      placeholder="Photo URL or camera-captured base64 image"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => openCapture({ studentId: l.id })}
                                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-150 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                                      title="Capture photo using webcam"
                                    >
                                      <Camera size={11} />
                                      <span>Take Photo</span>
                                    </button>
                                  </div>
                                </div>
                                {editPhoto && editPhoto.startsWith('data:image/') && (
                                  <div className="flex items-center gap-2 bg-emerald-50/60 border border-emerald-100 px-3 py-1 rounded-lg">
                                    <img src={editPhoto} alt="Edit capture preview" className="w-8 h-8 rounded-full border border-emerald-200 object-cover shrink-0" referrerPolicy="no-referrer" />
                                    <span className="text-[10px] text-emerald-800 font-bold">Webcam photo captured</span>
                                    <button
                                      type="button"
                                      onClick={() => setEditPhoto('')}
                                      className="ml-auto text-rose-500 hover:text-rose-700 font-bold text-[10px] cursor-pointer"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-blue-100 pt-3 space-y-2">
                                <span className="text-[10px] font-bold text-blue-900/60 uppercase tracking-wider block">Guardian Information</span>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Name</label>
                                    <input
                                      type="text"
                                      value={editGuardianName}
                                      onChange={e => setEditGuardianName(e.target.value)}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Relation</label>
                                    <input
                                      type="text"
                                      value={editGuardianRelation}
                                      onChange={e => setEditGuardianRelation(e.target.value)}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Phone</label>
                                    <input
                                      type="text"
                                      value={editGuardianPhone}
                                      onChange={e => setEditGuardianPhone(e.target.value)}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800 font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Guardian Email</label>
                                    <input
                                      type="email"
                                      value={editGuardianEmail}
                                      onChange={e => setEditGuardianEmail(e.target.value)}
                                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-800"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 border-t border-blue-100/60 pt-3">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(l.id)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                                >
                                  Save Profile
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td 
                              className="py-3 px-4 font-mono text-slate-500 font-semibold cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                              {l.admNo || '-'}
                            </td>
                            <td 
                              className="py-3 px-4 cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                              <div className="flex items-center gap-3">
                                <img 
                                  src={l.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(l.name)}`} 
                                  alt={l.name} 
                                  className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 object-cover shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                    <span>{l.name}</span>
                                    {l.active === 'No' && (
                                      <span className="px-1.5 py-0.2 bg-rose-50 border border-rose-100 text-[8px] font-extrabold rounded-md text-rose-600 uppercase">Inactive</span>
                                    )}
                                    {(() => {
                                      const comp = getSchoolPayComparison(l);
                                      if (comp.hasOutstanding) {
                                        return (
                                          <span 
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-[8px] font-extrabold rounded-md uppercase tracking-wide transition-colors cursor-help shrink-0"
                                            title={`Outstanding fees balance: UGX ${comp.balance.toLocaleString()}${
                                              comp.latestTx 
                                                ? ` (Latest SchoolPay Payment: UGX ${comp.latestTx.amount.toLocaleString()} on ${comp.latestTx.date})`
                                                : ' (No SchoolPay payments synced yet)'
                                            }`}
                                          >
                                            <AlertCircle size={10} className="text-amber-500 animate-pulse shrink-0" />
                                            <span>Fees Due</span>
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                                    {l.lin && (
                                      <span>LIN: <span className="font-mono text-slate-500 font-semibold">{l.lin}</span></span>
                                    )}
                                    {l.lin && l.paycode && <span className="text-slate-300">|</span>}
                                    {l.paycode && (
                                      <span>Paycode: <span className="font-mono text-slate-500 font-semibold">{l.paycode}</span></span>
                                    )}
                                    {l.unebNo && (
                                      <>
                                        {(l.lin || l.paycode) && <span className="text-slate-300">|</span>}
                                        <span className="inline-flex items-center gap-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-[9px] font-extrabold rounded-md px-1 transition-colors">
                                          UNEB: <span className="font-mono font-black">{l.unebNo}</span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td 
                              className="py-3 px-4 text-center cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                l.sex === 'Male' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {l.sex === 'Male' ? 'Boy' : 'Girl'}
                              </span>
                            </td>
                            <td 
                              className="py-3 px-4 text-center text-slate-600 font-medium cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                              {l.age || '-'}
                            </td>
                            <td 
                              className="py-3 px-4 cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : l.id)}
                            >
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200/50">
                                {l.cls}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setExpandedId(isExpanded ? null : l.id)}
                                  className={`p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors text-[10px] font-bold`}
                                  title="View extra details"
                                >
                                  {isExpanded ? 'Collapse' : 'Details'}
                                </button>
                                {l.archived ? (
                                  <button
                                    onClick={() => {
                                      const updated = data.learners.map(student => {
                                        if (student.id === l.id) {
                                          return { ...student, archived: false };
                                        }
                                        return student;
                                      });
                                      onUpdateLearners(updated);
                                      window.dispatchEvent(new CustomEvent('otec-modal-notify', {
                                        detail: {
                                          title: 'Student Restored',
                                          message: `Student "${l.name}" has been restored to the active roster.`,
                                          type: 'success',
                                          timestamp: new Date().toLocaleString()
                                        }
                                      }));
                                    }}
                                    className="px-2 py-0.5 text-[9px] font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors cursor-pointer shrink-0"
                                    title="Restore student to active registry"
                                  >
                                    ACTIVATE
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const updated = data.learners.map(student => {
                                        if (student.id === l.id) {
                                          return { ...student, archived: true };
                                        }
                                        return student;
                                      });
                                      onUpdateLearners(updated);
                                      window.dispatchEvent(new CustomEvent('otec-modal-notify', {
                                        detail: {
                                          title: 'Student Archived',
                                          message: `Student "${l.name}" has been moved to the archived/graduates register.`,
                                          type: 'success',
                                          timestamp: new Date().toLocaleString()
                                        }
                                      }));
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-slate-50 transition-colors"
                                    title="Archive student"
                                  >
                                    <AlertCircle size={13} className="text-amber-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleStartEdit(l)}
                                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                                  title="Edit learner details"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLearner(l.id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                                  title="Delete student profile"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </motion.tr>

                      {isExpanded && !isEditing && (
                        <motion.tr
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="bg-slate-50/40"
                        >
                          <td colSpan={6} className="p-5 border-y border-slate-200/80">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-1 duration-150 text-slate-700">
                              
                              {/* Student Account Details */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Student Account &amp; Status</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${l.active !== 'No' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {l.active !== 'No' ? 'Active Account' : 'Inactive Account'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Account Number</span>
                                    <span className="font-bold text-slate-800">{l.studentAccount || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Suite Code</span>
                                    <span className="font-bold text-slate-800 font-mono">{l.suiteCode || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Accommodation</span>
                                    <span className="font-bold text-slate-800">{l.dayBoarding || 'Day Scholar'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Outstanding Balance</span>
                                    <span className={`font-bold ${l.outstandingBalance && Number(l.outstandingBalance) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                      {l.outstandingBalance ? `${Number(l.outstandingBalance).toLocaleString()} UGX` : '0 UGX'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs pt-2 border-t border-slate-100">
                                  <span className="text-slate-400 block font-semibold uppercase text-[9px] mb-1">Student Direct Contact</span>
                                  <div className="space-y-0.5">
                                    <div className="font-mono text-slate-700 text-xs font-semibold">{l.studentPhone || 'No direct phone line'}</div>
                                    <div className="text-slate-500 text-xs font-medium truncate">{l.studentEmail || 'No student email address'}</div>
                                  </div>
                                </div>
                                {/* SchoolPay Sync Comparison Block */}
                                {(() => {
                                  const comp = getSchoolPayComparison(l);
                                  return (
                                    <div className="text-xs pt-2 border-t border-slate-100 space-y-1.5">
                                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">SchoolPay Direct Ledger Comparison</span>
                                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-150 space-y-1 text-[11px] font-medium text-slate-700">
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">SchoolPay Paid Total:</span>
                                          <span className="font-bold text-slate-800">{comp.totalPaidViaSchoolPay.toLocaleString()} UGX</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Active Outstanding:</span>
                                          <span className={`font-bold ${comp.hasOutstanding ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {comp.balance.toLocaleString()} UGX
                                          </span>
                                        </div>
                                        {comp.latestTx ? (
                                          <div className="pt-1.5 border-t border-dashed border-slate-200 mt-1.5">
                                            <span className="text-[9px] text-slate-400 block font-extrabold uppercase">Latest SchoolPay Sync Payment</span>
                                            <div className="flex justify-between items-center mt-0.5 font-medium text-slate-600 text-[10px]">
                                              <span>{comp.latestTx.date}</span>
                                              <span className="font-bold text-emerald-600">+{comp.latestTx.amount.toLocaleString()} UGX</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="text-[10px] text-slate-400 font-medium italic mt-1.5 pt-1.5 border-t border-dashed border-slate-200">
                                            No SchoolPay transactions logged yet.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Parent / Guardian Particulars */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block border-b border-slate-100 pb-1.5">Primary Parent / Guardian</span>
                                <div className="text-xs space-y-2.5">
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Guardian Name</span>
                                    <span className="font-bold text-slate-800">{l.guardianName || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block font-semibold uppercase text-[9px]">Relationship</span>
                                    <span className="font-semibold text-slate-700">{l.guardianRelation || '—'}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Phone Number</span>
                                      <span className="font-mono font-bold text-slate-800">{l.guardianPhone || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Email Address</span>
                                      <span className="font-medium text-slate-600 truncate block">{l.guardianEmail || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Names Split Detail & Control Panel */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5">Name Decomposition</span>
                                  <div className="mt-2 space-y-2 text-xs">
                                    {l.unebNo && (
                                      <div className="flex justify-between items-center bg-amber-50/50 border border-amber-200/50 px-2.5 py-1.5 rounded-lg">
                                        <span className="font-semibold text-amber-700">UNEB Index Number:</span>
                                        <span className="font-mono font-black text-amber-800">{l.unebNo}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center bg-slate-50/80 px-2.5 py-1.5 rounded-lg">
                                      <span className="font-semibold text-slate-500">First Name:</span>
                                      <span className="font-bold text-slate-800">{l.firstName || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50/80 px-2.5 py-1.5 rounded-lg">
                                      <span className="font-semibold text-slate-500">Middle Name:</span>
                                      <span className="font-bold text-slate-800">{l.middleName || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50/80 px-2.5 py-1.5 rounded-lg">
                                      <span className="font-semibold text-slate-500">Last Name:</span>
                                      <span className="font-bold text-slate-800">{l.lastName || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                                  <button
                                    onClick={() => {
                                      handleStartEdit(l);
                                    }}
                                    className="flex-1 py-2 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Edit2 size={11} />
                                    <span>Edit Profile</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openCapture({ studentId: l.id })}
                                    className="px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    title="Capture photo using webcam"
                                  >
                                    <Camera size={11} />
                                    <span>Take Photo</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIdCardTarget(l);
                                      setIsIDCardModalOpen(true);
                                    }}
                                    className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-extrabold text-[10px] rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                    title="Generate printable student ID Card"
                                  >
                                    <IdCard size={11} />
                                    <span>Print ID</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>

                {filteredLearners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center bg-slate-50/40">
                      <div className="flex flex-col items-center justify-center space-y-3 py-6">
                        <div className="w-12 h-12 rounded-full bg-slate-150/50 flex items-center justify-center text-slate-400">
                          <Search size={18} className="stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">No Search Matches Found</p>
                          <p className="text-[10px] text-slate-400 font-bold max-w-sm mx-auto leading-normal">
                            We couldn't find any students matching "{searchTerm || 'selected filters'}". Try adjusting your class filters or search terms.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedClass('All');
                            setSelectedSex('All');
                            setSelectedBoarding('All');
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors shadow-3xs cursor-pointer"
                        >
                          Clear Active Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
      </div>

      {/* Device Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">Webcam Photo Booth</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Capture Student Profile Image</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={stopCamera}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Area */}
            <div className="p-6 flex flex-col items-center justify-center bg-slate-50 flex-1 overflow-y-auto space-y-4">
              
              {/* Camera Device Selector (if multiple exist) */}
              {devices.length > 1 && !capturedImage && (
                <div className="w-full max-w-sm">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 text-center">Select Video Source</label>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden"
                  >
                    {devices.map((device, idx) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Viewport Card */}
              <div className="relative w-72 h-72 rounded-2xl overflow-hidden bg-slate-950 border-4 border-slate-200 shadow-lg flex items-center justify-center">
                {cameraError ? (
                  <div className="p-4 text-center space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Camera Error</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {cameraError}
                      </p>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured student preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Passport framing guideline overlay */}
                    <div className="absolute inset-0 border-2 border-dashed border-blue-500/40 rounded-full m-8 pointer-events-none flex items-center justify-center">
                      <span className="text-[8px] font-bold uppercase text-blue-500 bg-slate-950/80 px-2 py-0.5 rounded-md tracking-widest">Center Face Here</span>
                    </div>
                  </>
                )}
              </div>

              {/* Status indicator */}
              <div className="text-center">
                {capturedImage ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Photo Captured Successfully
                  </span>
                ) : !cameraError ? (
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                    <span>Live Web Feed</span>
                  </div>
                ) : (
                  <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleUsePhoto}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check size={14} />
                    <span>Apply to Student</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!!cameraError}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/15"
                  >
                    <Video size={14} />
                    <span>Capture Photo</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

      {/* ID CARD GENERATOR & PRINT PREVIEW MODAL */}
      {isIDCardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-xl animate-pulse">
                  <IdCard size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider font-sans">
                    {idCardTarget === 'filtered' ? 'Batch ID Cards Generator' : 'Student ID Card Generator'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {idCardTarget === 'filtered' 
                      ? `Configure and print cards for ${filteredLearners.length} selected students` 
                      : `Configure and print card for ${idCardTarget?.name}`}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsIDCardModalOpen(false);
                  setIdCardTarget(null);
                }}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content - Split layout */}
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-8 bg-slate-50/20">
              
              {/* Left Settings Sidebar (col-span-5) */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">Customization Options</span>
                  
                  {/* Theme Select */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">ID Card Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'blue', label: 'Royal', color: 'bg-blue-900 border-blue-400' },
                        { id: 'emerald', label: 'Forest', color: 'bg-emerald-950 border-emerald-400' },
                        { id: 'burgundy', label: 'Burgundy', color: 'bg-rose-950 border-rose-400' },
                        { id: 'slate', label: 'Charcoal', color: 'bg-slate-900 border-slate-400' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setIdCardTheme(t.id as any)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            idCardTheme === t.id 
                              ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500/20' 
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${t.color} border shadow-xs`} />
                          <span className="text-[9px] font-bold text-slate-600">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle controls */}
                  <div className="space-y-3.5 pt-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Layout Toggles</label>
                    
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900">
                      <input 
                        type="checkbox" 
                        checked={showCardBack} 
                        onChange={e => setShowCardBack(e.target.checked)} 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Print Double-Sided (Back of Card)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900">
                      <input 
                        type="checkbox" 
                        checked={showBarcode} 
                        onChange={e => setShowBarcode(e.target.checked)} 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Include Barcode Placeholder</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900">
                      <input 
                        type="checkbox" 
                        checked={showSignature} 
                        onChange={e => setShowSignature(e.target.checked)} 
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Include Principal Signature</span>
                    </label>
                  </div>
                </div>

                {/* Print Guide Notice */}
                <div className="bg-blue-50/50 border border-blue-200/60 rounded-2xl p-4 space-y-2 text-xs text-blue-700 leading-relaxed font-semibold">
                  <span className="font-extrabold uppercase text-[9px] tracking-wider block font-sans">Print Setup Guide</span>
                  <p>1. Set your browser print margins to <b>None</b> or <b>Minimum</b>.</p>
                  <p>2. Ensure <b>Background graphics</b> is enabled in your print dialog so colors and headers render correctly.</p>
                  <p>3. If double-sided is enabled, make sure your printer is set to duplex.</p>
                </div>
              </div>

              {/* Right Live Preview Panel (col-span-7) */}
              <div className="md:col-span-7 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Interactive Card Canvas Preview
                </span>

                <div className="p-6 bg-slate-150/70 rounded-3xl border border-slate-200/60 min-h-[410px] flex flex-wrap items-center justify-center gap-6 overflow-x-auto max-h-[50vh] overflow-y-auto">
                  {studentsToPrint.slice(0, idCardTarget === 'filtered' ? 4 : 1).map((student, idx) => (
                    renderSingleCard(student, idx)
                  ))}
                  {idCardTarget === 'filtered' && filteredLearners.length > 4 && (
                    <div className="w-full text-center py-3 bg-white/60 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                        ✨ Plus {filteredLearners.length - 4} more student cards ready in the print job queue
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsIDCardModalOpen(false);
                  setIdCardTarget(null);
                }}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/15"
              >
                <Printer size={14} />
                <span>Execute Print Job ({studentsToPrint.length} {studentsToPrint.length === 1 ? 'Card' : 'Cards'})</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRINT-ONLY AREA */}
      <div id="id-cards-print-area" className="hidden print:block print:p-0">
        <style>{`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            #id-cards-print-area {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-card {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 2rem !important;
            }
          }
        `}</style>
        <div className="print:grid print:grid-cols-2 print:gap-x-8 print:gap-y-12 print:justify-items-center">
          {studentsToPrint.map((student, idx) => (
            renderSingleCard(student, idx)
          ))}
        </div>
      </div>

      {/* CLASS PROMOTION MODAL */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-lg w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400" />
                <span className="text-sm font-black uppercase tracking-wider text-slate-100">Annual Student Class Promotions</span>
              </div>
              <button 
                onClick={() => setShowPromoteModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 text-xs text-blue-800 leading-relaxed font-semibold">
                This workflow automatically advances all active students to the next academic level for the new year. Ensure you have printed and exported all reports before running promotions.
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Progression Map</span>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 font-mono text-[11px] text-slate-600 space-y-1.5 max-h-[160px] overflow-y-auto">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-200/60 font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                    <span>Current Class</span>
                    <span>Promoted Destination</span>
                  </div>
                  <div className="flex justify-between"><span>Baby Class (ZEBRA)</span> <span className="text-blue-600 font-bold">→ LION Stream</span></div>
                  <div className="flex justify-between"><span>Middle Class (LION)</span> <span className="text-blue-600 font-bold">→ ELEPHANT Stream</span></div>
                  <div className="flex justify-between"><span>Top Class (ELEPHANT)</span> <span className="text-blue-600 font-bold">→ Primary 1 (P1)</span></div>
                  <div className="flex justify-between"><span>Primary 1 (P1)</span> <span className="text-blue-600 font-bold">→ Primary 2 (P2)</span></div>
                  <div className="flex justify-between"><span>Primary 2 (P2)</span> <span className="text-blue-600 font-bold">→ Primary 3 (P3)</span></div>
                  <div className="flex justify-between"><span>Primary 3 (P3)</span> <span className="text-blue-600 font-bold">→ Primary 4 (P4)</span></div>
                  <div className="flex justify-between"><span>Primary 4 (P4)</span> <span className="text-blue-600 font-bold">→ Primary 5 (P5)</span></div>
                  <div className="flex justify-between"><span>Primary 5 (P5)</span> <span className="text-blue-600 font-bold">→ Primary 6 (P6)</span></div>
                  <div className="flex justify-between"><span>Primary 6 (P6)</span> <span className="text-blue-600 font-bold">→ Primary 7 (P7)</span></div>
                  <div className="flex justify-between text-amber-700 font-bold"><span>Primary 7 (P7 Candidates)</span> <span className="text-amber-600 font-bold">→ Graduate Archive 🎓</span></div>
                </div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-500 font-medium">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Automatic Calculations</span>
                <p>• Ages of all promoted students will automatically increment by <b>+1 year</b>.</p>
                <p>• Primary 7 candidates will be set as <b>Archived Graduates</b> to clear candidate list space.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteStudents}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Execute Promotions Cycle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DUPLICATES SCANNER MODAL */}
      {showDupsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-400 animate-pulse" />
                <span className="text-sm font-black uppercase tracking-wider text-slate-100">Duplicate Record Analysis</span>
              </div>
              <button 
                onClick={() => setShowDupsModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {duplicateGroups.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                    <Check size={28} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Absolute Database Integrity Clean!</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">No duplicate student registration codes or same name/class streams discovered in the system.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed font-semibold">
                    The scanner identified <b>{duplicateGroups.length} duplicate groups</b>. Running resolution will archive the redundant profiles while keeping the first entry active to retain payment history.
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detected Duplicates ({duplicateGroups.length})</span>
                    <div className="space-y-3">
                      {duplicateGroups.map((group, gIdx) => (
                        <div key={gIdx} className="border border-slate-200/80 rounded-2xl overflow-hidden text-xs bg-slate-50">
                          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200/80 font-bold text-slate-700 font-mono text-[10px] uppercase flex justify-between">
                            <span>{group.key}</span>
                            <span className="text-rose-600">({group.students.length} Entries Found)</span>
                          </div>
                          <div className="divide-y divide-slate-150">
                            {group.students.map((student, sIdx) => (
                              <div key={student.id} className="p-3 bg-white flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={student.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`} 
                                    alt={student.name} 
                                    className="w-7 h-7 rounded-full bg-slate-100 border object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-800">{student.name}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold font-mono">ID: {student.id} | Adm: {student.admNo}</div>
                                  </div>
                                </div>
                                <div>
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                    sIdx === 0 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80' 
                                      : 'bg-rose-50 text-rose-700 border border-rose-150'
                                  }`}>
                                    {sIdx === 0 ? 'KEEP ACTIVE' : 'WILL ARCHIVE'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDupsModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Scanner
              </button>
              {duplicateGroups.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoResolveDuplicates}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Archive All Redundant Duplicates
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
