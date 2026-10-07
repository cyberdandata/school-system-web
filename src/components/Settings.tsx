import { useAppStore } from "../store/useAppStore";
import React, { useState } from 'react';
import { AppData, SchoolSettings, ExamSet, ClassTeacher, GradingBand, Subject, PLEOverrideConfig, Teacher, NonTeachingStaff } from '../types';
import { ALL_CLASSES, TERMS, PERIODS, defaultGradingBands, getGradeRank } from '../lib/defaults';
import dataManager from '../lib/db';
import { fixLearnerGenders } from '../lib/fixGenders';
import { 
  Building, 
  Settings as SlidersIcon, 
  GraduationCap, 
  Calendar, 
  Sliders, 
  Heart,
  Plus,
  Trash2,
  Check,
  Home,
  ShieldAlert,
  Search,
  Edit2,
  Edit3,
  X,
  UserPlus,
  Award,
  User,
  BookOpen,
  Image,
  Coins,
  Package,
  Monitor,
  Smartphone,
  Loader2,
  Database
} from 'lucide-react';

interface SettingsProps {
  onUpdateSettings: (settings: SchoolSettings) => void;
}

export default function Settings({ onUpdateSettings }: SettingsProps) {
  const data = useAppStore(state => state.data)!;
  const [activeTab, setActiveTab] = useState<'school' | 'ple' | 'visibility' | 'preprimary' | 'lower' | 'upper' | 'examsets' | 'teachers' | 'psycho' | 'calendar' | 'finance' | 'packager' | 'access' | 'moduleConfigs' | 'helpers'>('school');

  // Shared Module Configurations State
  const [newFCName, setNewFCName] = useState('');
  const [newFCType, setNewFCType] = useState<'income' | 'expense'>('income');
  const [newLibraryBook, setNewLibraryBook] = useState('');
  const [newDormRoom, setNewDormRoom] = useState('');
  const [newFCColor, setNewFCColor] = useState('blue');
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [newHRDept, setNewHRDept] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteCost, setNewRouteCost] = useState('');
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockCap, setNewBlockCap] = useState('');
  const [newLibCat, setNewLibCat] = useState('');
  const [newOffenseName, setNewOffenseName] = useState('');
  const [newOffenseType, setNewOffenseType] = useState<'Merit' | 'Demerit'>('Demerit');
  const [newAssetLoc, setNewAssetLoc] = useState('');
  const [newClinicMed, setNewClinicMed] = useState('');

  // Financial Ledger Settings states
  const [ledgerDayFees, setLedgerDayFees] = useState(data.settings.ledgerDayFees ?? 500000);
  const [ledgerBoardingFees, setLedgerBoardingFees] = useState(data.settings.ledgerBoardingFees ?? 1200000);
  const [ledgerAutoDeduct, setLedgerAutoDeduct] = useState(data.settings.ledgerAutoDeduct ?? false);
  const [ledgerCurrency, setLedgerCurrency] = useState(data.settings.ledgerCurrency ?? 'UGX');

  // Specific Fee Component Default states
  const [feeTuitionLower, setFeeTuitionLower] = useState(data.settings.feeTuitionLower ?? 310000);
  const [feeTuitionNursery, setFeeTuitionNursery] = useState(data.settings.feeTuitionNursery ?? 290000);
  const [feeTuitionUpper, setFeeTuitionUpper] = useState(data.settings.feeTuitionUpper ?? 335000);
  const [feeBoarding, setFeeBoarding] = useState(data.settings.feeBoarding ?? 630000);
  const [feeVanMin, setFeeVanMin] = useState(data.settings.feeVanMin ?? 100000);
  const [feeVanMax, setFeeVanMax] = useState(data.settings.feeVanMax ?? 400000);
  const [feeRegistration, setFeeRegistration] = useState(data.settings.feeRegistration ?? 20000);
  const [feeSweater, setFeeSweater] = useState(data.settings.feeSweater ?? 50000);
  const [feeClassUniform, setFeeClassUniform] = useState(data.settings.feeClassUniform ?? 50000);
  const [feeSportsWear, setFeeSportsWear] = useState(data.settings.feeSportsWear ?? 70000);
  const [feeHair, setFeeHair] = useState(data.settings.feeHair ?? 5000);
  const [feeHoliday, setFeeHoliday] = useState(data.settings.feeHoliday ?? 5000);
  const [feeOthers, setFeeOthers] = useState(data.settings.feeOthers ?? 0);

  // Calendar events setup states
  const [newEvTitle, setNewEvTitle] = useState('');
  const [newEvDate, setNewEvDate] = useState('');
  const [newEvType, setNewEvType] = useState<'event' | 'deadline' | 'holiday'>('event');
  const [newEvDesc, setNewEvDesc] = useState('');

  // School general states
  const [schoolName, setSchoolName] = useState(data.settings.schoolName);
  const [shortName, setShortName] = useState(data.settings.shortName);
  const [motto, setMotto] = useState(data.settings.motto);
  const [address, setAddress] = useState(data.settings.address);
  const [tel1, setTel1] = useState(data.settings.tel1);
  const [tel2, setTel2] = useState(data.settings.tel2);
  const [term, setTerm] = useState(data.settings.term);
  const [termStartDate, setTermStartDate] = useState(data.settings.termStartDate || '');
  const [termEndDate, setTermEndDate] = useState(data.settings.termEndDate || '');
  const [nextTermBegins, setNextTermBegins] = useState(data.settings.nextTermBegins || '');
  const [year, setYear] = useState(data.settings.year);
  const [headTeacherName, setHeadTeacherName] = useState(data.settings.headTeacherName);
  const [headTeacherInitials, setHeadTeacherInitials] = useState(data.settings.headTeacherInitials);
  const [nurseryReportTemplate, setNurseryReportTemplate] = useState(data.settings.nurseryReportTemplate || 1);
  const [primaryReportTemplate, setPrimaryReportTemplate] = useState(data.settings.primaryReportTemplate || 1);
  const [logo, setLogo] = useState(data.settings.logo);
  const [geminiApiKey, setGeminiApiKey] = useState(data.settings.geminiApiKey || '');

  // New Exam set states
  const [newTerm, setNewTerm] = useState('Term 1');
  const [newPeriod, setNewPeriod] = useState<'BOT' | 'MOT' | 'EOT'>('BOT');
  const [newSetNo, setNewSetNo] = useState(1);
  const [newLabel, setNewLabel] = useState('');

  // New subject states
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjMax, setNewSubjMax] = useState(100);

  // New psychomotor skill state
  const [newSkill, setNewSkill] = useState('');

  // PLE override state
  const [pleEnabled, setPleEnabled] = useState(data.settings.pleOverride?.enabled ?? true);
  const [engD1, setEngD1] = useState(data.settings.pleOverride?.englishMinGradeForDiv1 ?? 6);
  const [mathD1, setMathD1] = useState(data.settings.pleOverride?.mathMinGradeForDiv1 ?? 6);
  const [engD2, setEngD2] = useState(data.settings.pleOverride?.englishMinGradeForDiv2 ?? 8);
  const [mathD2, setMathD2] = useState(data.settings.pleOverride?.mathMinGradeForDiv2 ?? 8);
  const [requireAll, setRequireAll] = useState(data.settings.pleOverride?.requireAllCoreSubjects ?? true);

  // PLE interactive calculator states
  const [calcEng, setCalcEng] = useState<number | ''>(85);
  const [calcMath, setCalcMath] = useState<number | ''>(90);
  const [calcSci, setCalcSci] = useState<number | ''>(78);
  const [calcSst, setCalcSst] = useState<number | ''>(82);

  // Report card visibility toggles
  const [showTeacherComments, setShowTeacherComments] = useState(data.settings.reportCardVisibility?.showTeacherComments ?? true);
  const [showPsychomotor, setShowPsychomotor] = useState(data.settings.reportCardVisibility?.showPsychomotor ?? true);
  const [showRankingTable, setShowRankingTable] = useState(data.settings.reportCardVisibility?.showRankingTable ?? true);
  const [showDivision, setShowDivision] = useState(data.settings.reportCardVisibility?.showDivision ?? true);
  const [showStudentPhoto, setShowStudentPhoto] = useState(data.settings.reportCardVisibility?.showStudentPhoto ?? true);
  const [showGradingScale, setShowGradingScale] = useState(data.settings.reportCardVisibility?.showGradingScale ?? true);
  const [showSchoolLogo, setShowSchoolLogo] = useState(data.settings.reportCardVisibility?.showSchoolLogo ?? true);

  // Teacher Registry states
  const [newTName, setNewTName] = useState('');
  const [newTInitials, setNewTInitials] = useState('');
  const [newTPhone, setNewTPhone] = useState('');
  const [newTEmail, setNewTEmail] = useState('');
  const [newTSpecialization, setNewTSpecialization] = useState('');

  const [editingTId, setEditingTId] = useState<string | null>(null);
  const [editTName, setEditTName] = useState('');
  const [editTInitials, setEditTInitials] = useState('');
  const [editTPhone, setEditTPhone] = useState('');
  const [editTEmail, setEditTEmail] = useState('');
  const [editTSpecialization, setEditTSpecialization] = useState('');

  const [teacherSearch, setTeacherSearch] = useState('');

  // Non-Teaching Staff Registry states
  const [newNtsName, setNewNtsName] = useState('');
  const [newNtsDepartment, setNewNtsDepartment] = useState('');
  const [newNtsPhone, setNewNtsPhone] = useState('');
  
  const [editingNtsId, setEditingNtsId] = useState<string | null>(null);
  const [editNtsName, setEditNtsName] = useState('');
  const [editNtsDepartment, setEditNtsDepartment] = useState('');
  const [editNtsPhone, setEditNtsPhone] = useState('');
  const [ntsSearch, setNtsSearch] = useState('');  // Auth User states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authRole, setAuthRole] = useState<'superuser' | 'accountant' | 'security' | 'teacher'>('teacher');
  const [authPassword, setAuthPassword] = useState('');
  const [authActive, setAuthActive] = useState(true);

  // Packager states
  const [isBuildingApp, setIsBuildingApp] = useState<'mac' | 'win' | 'android' | null>(null);

  const handleBuildApp = (platform: 'mac' | 'win' | 'android') => {
    const isElectron = window && (window as any).process && (window as any).process.type;
    if (!isElectron) {
      alert('Generating applications is only supported within the Desktop App.');
      return;
    }

    if (platform === 'android') {
      if (!confirm('Generating an Android APK requires Android Studio and Gradle to be installed on your Mac. Proceed?')) return;
    } else if (platform === 'win') {
      if (!confirm('Generating a Windows .exe from a Mac requires Homebrew and Wine installed. Proceed?')) return;
    }

    setIsBuildingApp(platform);
    
    try {
      const { exec } = (window as any).require('child_process');
      const cwd = (window as any).process.cwd();
      
      let cmd = '';
      if (platform === 'mac') cmd = 'npm run desktop:build:mac';
      if (platform === 'win') cmd = 'npm run desktop:build:win';
      if (platform === 'android') cmd = 'npm run mobile:build:android';

      exec(cmd, { cwd }, (error: any, stdout: any, stderr: any) => {
        setIsBuildingApp(null);
        if (error) {
          console.error('Build Error:', error, stderr);
          alert(`Build failed for ${platform}. Check console for details. Ensure you have the required build tools installed.`);
        } else {
          console.log('Build Output:', stdout);
          alert(`Success! The ${platform} package has been generated in the /release (or /android) directory.`);
        }
      });
    } catch (e) {
      setIsBuildingApp(null);
      console.error(e);
      alert('An error occurred attempting to start the build process.');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();

    // Sync with calendar events
    let updatedEvents = [...(data.settings.calendarEvents || [])];
    
    // Check/update term start event
    if (termStartDate) {
      const startTitle = `${term} Start`;
      const existingStartIndex = updatedEvents.findIndex(ev => ev.title === startTitle || ev.title === `${term} Commencement`);
      if (existingStartIndex > -1) {
        updatedEvents[existingStartIndex] = {
          ...updatedEvents[existingStartIndex],
          date: termStartDate,
        };
      } else {
        updatedEvents.push({
          id: 'EV_START_' + Date.now().toString(36) + '_1',
          title: startTitle,
          date: termStartDate,
          type: 'event',
          description: `Official commencement of ${term} for academic year ${year}`
        });
      }
    }
    
    // Check/update term end event
    if (termEndDate) {
      const endTitle = `${term} End`;
      const existingEndIndex = updatedEvents.findIndex(ev => ev.title === endTitle || ev.title === `${term} Closing`);
      if (existingEndIndex > -1) {
        updatedEvents[existingEndIndex] = {
          ...updatedEvents[existingEndIndex],
          date: termEndDate,
        };
      } else {
        updatedEvents.push({
          id: 'EV_END_' + Date.now().toString(36) + '_2',
          title: endTitle,
          date: termEndDate,
          type: 'event',
          description: `Official closing and reports release of ${term} for academic year ${year}`
        });
      }
    }

    const updated: SchoolSettings = {
      ...data.settings,
      schoolName,
      shortName,
      motto,
      address,
      tel1,
      tel2,
      term,
      year: Number(year),
      headTeacherName,
      headTeacherInitials,
      nurseryReportTemplate,
      primaryReportTemplate,
      logo,
      geminiApiKey,
      termStartDate,
      termEndDate,
      nextTermBegins,
      calendarEvents: updatedEvents
    };
    onUpdateSettings(updated);
    alert('General school information saved successfully, and term calendar dates have been updated/created in the school calendar!');
  };

  const handleSavePLEOverrides = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolSettings = {
      ...data.settings,
      pleOverride: {
        enabled: pleEnabled,
        englishMinGradeForDiv1: Number(engD1),
        mathMinGradeForDiv1: Number(mathD1),
        englishMinGradeForDiv2: Number(engD2),
        mathMinGradeForDiv2: Number(mathD2),
        requireAllCoreSubjects: requireAll
      }
    };
    onUpdateSettings(updated);
    alert('PLE compulsory-subject override parameters updated!');
  };

  const handleSaveVisibility = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolSettings = {
      ...data.settings,
      reportCardVisibility: {
        showTeacherComments,
        showPsychomotor,
        showRankingTable,
        showDivision,
        showStudentPhoto,
        showGradingScale,
        showSchoolLogo
      }
    };
    onUpdateSettings(updated);
    alert('Report card print visibility options updated successfully!');
  };

  const handleSaveFinance = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolSettings = {
      ...data.settings,
      ledgerDayFees: Number(ledgerDayFees),
      ledgerBoardingFees: Number(ledgerBoardingFees),
      ledgerAutoDeduct,
      ledgerCurrency,
      feeTuitionLower: Number(feeTuitionLower),
      feeTuitionNursery: Number(feeTuitionNursery),
      feeTuitionUpper: Number(feeTuitionUpper),
      feeBoarding: Number(feeBoarding),
      feeVanMin: Number(feeVanMin),
      feeVanMax: Number(feeVanMax),
      feeRegistration: Number(feeRegistration),
      feeSweater: Number(feeSweater),
      feeClassUniform: Number(feeClassUniform),
      feeSportsWear: Number(feeSportsWear),
      feeHair: Number(feeHair),
      feeHoliday: Number(feeHoliday),
      feeOthers: Number(feeOthers)
    };
    onUpdateSettings(updated);
    alert('Financial ledger configurations updated successfully!');
  };

  // Section specific methods
  const handleAddSubject = (section: 'preprimary' | 'lower' | 'upper') => {
    if (!newSubjName.trim()) return;
    
    const currentSubjects = data.settings.sections[section].subjects;
    if (currentSubjects.some(s => s.name.toLowerCase() === newSubjName.trim().toLowerCase())) {
      alert('This subject name is already defined.');
      return;
    }

    const updatedSubjects: Subject[] = [
      ...currentSubjects,
      { name: newSubjName.trim(), max: Number(newSubjMax) || 100 }
    ];

    const updated: SchoolSettings = {
      ...data.settings,
      sections: {
        ...data.settings.sections,
        [section]: {
          ...data.settings.sections[section],
          subjects: updatedSubjects
        }
      }
    };

    onUpdateSettings(updated);
    setNewSubjName('');
    alert('Subject added!');
  };

  const handleRemoveSubject = (section: 'preprimary' | 'lower' | 'upper', index: number) => {
    if (!confirm('Remove this subject? All grades associated with this subject will become unreachable.')) return;
    const updatedSubjects = data.settings.sections[section].subjects.filter((_, i) => i !== index);
    const updated: SchoolSettings = {
      ...data.settings,
      sections: {
        ...data.settings.sections,
        [section]: {
          ...data.settings.sections[section],
          subjects: updatedSubjects
        }
      }
    };
    onUpdateSettings(updated);
  };

  const handleGradeBandChange = (
    section: 'preprimary' | 'lower' | 'upper', 
    index: number, 
    field: keyof GradingBand, 
    value: any
  ) => {
    const updatedGrading = data.settings.sections[section].grading.map((g, i) => {
      if (i === index) {
        if (field === 'classComments' || field === 'headComments') {
          return { ...g, [field]: value.split('\n').filter(Boolean) };
        }
        return { ...g, [field]: (field === 'min' || field === 'max') ? Number(value) : value };
      }
      return g;
    });

    const updated: SchoolSettings = {
      ...data.settings,
      sections: {
        ...data.settings.sections,
        [section]: {
          ...data.settings.sections[section],
          grading: updatedGrading
        }
      }
    };
    onUpdateSettings(updated);
  };

  const handleAddGradeBand = (section: 'preprimary' | 'lower' | 'upper') => {
    const updatedGrading = [
      ...data.settings.sections[section].grading,
      { min: 0, max: 0, grade: 'F9', remark: 'Fail', classComments: [], headComments: [] }
    ];
    const updated: SchoolSettings = {
      ...data.settings,
      sections: {
        ...data.settings.sections,
        [section]: {
          ...data.settings.sections[section],
          grading: updatedGrading
        }
      }
    };
    onUpdateSettings(updated);
  };

  const handleRemoveGradeBand = (section: 'preprimary' | 'lower' | 'upper', index: number) => {
    const updatedGrading = data.settings.sections[section].grading.filter((_, i) => i !== index);
    const updated: SchoolSettings = {
      ...data.settings,
      sections: {
        ...data.settings.sections,
        [section]: {
          ...data.settings.sections[section],
          grading: updatedGrading
        }
      }
    };
    onUpdateSettings(updated);
  };

  // Exam set methods
  const handleAddExamSet = () => {
    const label = newLabel.trim() || `Set ${newSetNo} ${newPeriod}`;
    const id = 'ES' + Date.now().toString(36);

    const newSet: ExamSet = {
      id,
      label,
      term: newTerm,
      period: newPeriod,
      setNo: Number(newSetNo),
      classes: [...ALL_CLASSES] // default to all classes sat
    };

    const updated: SchoolSettings = {
      ...data.settings,
      examSets: [...data.settings.examSets, newSet]
    };
    onUpdateSettings(updated);
    setNewLabel('');
    alert('New Exam paper set recorded and active for all class streams.');
  };

  const handleAutoAddExamSets = (targetTerm: string) => {
    const defaultPeriods: Array<'BOT' | 'MOT' | 'EOT'> = ['BOT', 'MOT', 'EOT'];
    const currentSets = [...data.settings.examSets];
    let addedCount = 0;

    defaultPeriods.forEach(period => {
      const label = period === 'BOT' ? 'Beginning of Term' : period === 'MOT' ? 'Mid Term' : 'End of Term';
      // Check if this exam set already exists for this term and period
      const exists = currentSets.some(s => s.term === targetTerm && s.period === period);
      if (!exists) {
        const id = 'ES_' + period + '_' + Math.random().toString(36).slice(2, 7);
        currentSets.push({
          id,
          label,
          term: targetTerm,
          period,
          setNo: period === 'BOT' ? 1 : period === 'MOT' ? 2 : 3,
          classes: [...ALL_CLASSES] // default select all classes
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      const updated: SchoolSettings = {
        ...data.settings,
        examSets: currentSets
      };
      onUpdateSettings(updated);
      alert(`Successfully auto-added ${addedCount} standard exam sets (BOT, MOT, and EOT) for ${targetTerm} with all class streams selected by default!`);
    } else {
      alert(`Standard exam sets (Beginning of Term, Mid Term, and End of Term) are already registered for ${targetTerm}.`);
    }
  };

  const handleRemoveExamSet = (id: string) => {
    if (!confirm('Remove this exam set? Saved student grades for this specific paper will remain in memory but hidden from interface dashboards.')) return;
    const updatedSets = data.settings.examSets.filter(s => s.id !== id);
    const updated: SchoolSettings = {
      ...data.settings,
      examSets: updatedSets
    };
    onUpdateSettings(updated);
  };

  const handleToggleExamSetClass = (setId: string, className: string) => {
    const updatedSets = data.settings.examSets.map(s => {
      if (s.id === setId) {
        const classes = s.classes.includes(className)
          ? s.classes.filter(c => c !== className)
          : [...s.classes, className];
        return { ...s, classes };
      }
      return s;
    });

    const updated: SchoolSettings = {
      ...data.settings,
      examSets: updatedSets
    };
    onUpdateSettings(updated);
  };

  // Class Teachers methods
  const handleTeacherChange = (className: string, field: 'name' | 'initials', value: string) => {
    const currentClassTeachers = { ...data.settings.classTeachers };
    if (!currentClassTeachers[className]) {
      currentClassTeachers[className] = { name: '', initials: '' };
    }
    currentClassTeachers[className][field] = value;

    const updated: SchoolSettings = {
      ...data.settings,
      classTeachers: currentClassTeachers
    };
    onUpdateSettings(updated);
  };

  // Teacher Registry methods
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTName.trim() || !newTInitials.trim()) {
      alert('Please provide at least a Teacher Name and Initials.');
      return;
    }

    const newTeacher: Teacher = {
      id: 'T' + Date.now().toString(36),
      name: newTName.trim(),
      initials: newTInitials.trim().toUpperCase(),
      phone: newTPhone.trim() || undefined,
      email: newTEmail.trim() || undefined,
      specialization: newTSpecialization.trim() || undefined
    };

    const currentList = data.settings.teachersList || [];
    const updated: SchoolSettings = {
      ...data.settings,
      teachersList: [...currentList, newTeacher]
    };

    onUpdateSettings(updated);

    // Clear inputs
    setNewTName('');
    setNewTInitials('');
    setNewTPhone('');
    setNewTEmail('');
    setNewTSpecialization('');
    alert('Teacher registered successfully!');
  };

  const handleStartEditTeacher = (teacher: Teacher) => {
    setEditingTId(teacher.id);
    setEditTName(teacher.name);
    setEditTInitials(teacher.initials);
    setEditTPhone(teacher.phone || '');
    setEditTEmail(teacher.email || '');
    setEditTSpecialization(teacher.specialization || '');
  };

  const handleSaveEditTeacher = (id: string) => {
    if (!editTName.trim() || !editTInitials.trim()) {
      alert('Please provide at least a Teacher Name and Initials.');
      return;
    }

    const currentList = data.settings.teachersList || [];
    const updatedList = currentList.map(t => {
      if (t.id === id) {
        return {
          ...t,
          name: editTName.trim(),
          initials: editTInitials.trim().toUpperCase(),
          phone: editTPhone.trim() || undefined,
          email: editTEmail.trim() || undefined,
          specialization: editTSpecialization.trim() || undefined
        };
      }
      return t;
    });

    const updated: SchoolSettings = {
      ...data.settings,
      teachersList: updatedList
    };

    onUpdateSettings(updated);
    setEditingTId(null);
  };

  const handleDeleteTeacher = (id: string) => {
    if (!confirm('Are you sure you want to remove this teacher from the staff directory?')) return;

    const currentList = data.settings.teachersList || [];
    const updatedList = currentList.filter(t => t.id !== id);

    const updated: SchoolSettings = {
      ...data.settings,
      teachersList: updatedList
    };

    onUpdateSettings(updated);
  };

  // Non-Teaching Staff Registry methods
  const handleAddNts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNtsName.trim() || !newNtsDepartment.trim()) {
      alert('Please provide Name and Department.');
      return;
    }
    const newNts: NonTeachingStaff = {
      id: 'NTS' + Date.now().toString(36),
      name: newNtsName.trim(),
      department: newNtsDepartment.trim(),
      phone: newNtsPhone.trim() || undefined
    };
    const updated: SchoolSettings = {
      ...data.settings,
      nonTeachingStaffList: [...(data.settings.nonTeachingStaffList || []), newNts]
    };
    onUpdateSettings(updated);
    setNewNtsName('');
    setNewNtsDepartment('');
    setNewNtsPhone('');
    alert('Non-Teaching Staff registered!');
  };

  const handleStartEditNts = (staff: NonTeachingStaff) => {
    setEditingNtsId(staff.id);
    setEditNtsName(staff.name);
    setEditNtsDepartment(staff.department);
    setEditNtsPhone(staff.phone || '');
  };

  const handleSaveEditNts = (id: string) => {
    if (!editNtsName.trim() || !editNtsDepartment.trim()) return;
    const current = data.settings.nonTeachingStaffList || [];
    const updated: SchoolSettings = {
      ...data.settings,
      nonTeachingStaffList: current.map(s => s.id === id ? { ...s, name: editNtsName.trim(), department: editNtsDepartment.trim(), phone: editNtsPhone.trim() || undefined } : s)
    };
    onUpdateSettings(updated);
    setEditingNtsId(null);
  };

  const handleDeleteNts = (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    const current = data.settings.nonTeachingStaffList || [];
    const updated: SchoolSettings = {
      ...data.settings,
      nonTeachingStaffList: current.filter(s => s.id !== id)
    };
    onUpdateSettings(updated);
  };

  // Psychomotor skills methods
  const handleAddSkill = () => {
    if (!newSkill.trim() || data.settings.psychomotor.includes(newSkill.trim())) return;
    const updated: SchoolSettings = {
      ...data.settings,
      psychomotor: [...data.settings.psychomotor, newSkill.trim()]
    };
    onUpdateSettings(updated);
    setNewSkill('');
    alert('Psychomotor skill indicator added!');
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = data.settings.psychomotor.filter((_, i) => i !== index);
    const updated: SchoolSettings = {
      ...data.settings,
      psychomotor: updatedSkills
    };
    onUpdateSettings(updated);
  };

  const handleAddLibraryBook = () => {
    if (!newLibraryBook.trim()) return;
    const newBooks = [...(data.settings.libraryBooks || []), newLibraryBook.trim()];
    onUpdateSettings({ ...data.settings, libraryBooks: newBooks });
    setNewLibraryBook('');
  };

  const handleRemoveLibraryBook = (idx: number) => {
    if (!confirm('Remove this book from catalog?')) return;
    const newBooks = [...(data.settings.libraryBooks || [])];
    newBooks.splice(idx, 1);
    onUpdateSettings({ ...data.settings, libraryBooks: newBooks });
  };

  const handleAddDormRoom = () => {
    if (!newDormRoom.trim()) return;
    const newRooms = [...(data.settings.dormitoryRooms || []), newDormRoom.trim()];
    onUpdateSettings({ ...data.settings, dormitoryRooms: newRooms });
    setNewDormRoom('');
  };

  const handleRemoveDormRoom = (idx: number) => {
    if (!confirm('Remove this room from definitions?')) return;
    const newRooms = [...(data.settings.dormitoryRooms || [])];
    newRooms.splice(idx, 1);
    onUpdateSettings({ ...data.settings, dormitoryRooms: newRooms });
  };

  const handleAddCalendarEvent = () => {
    if (!newEvTitle.trim() || !newEvDate) {
      alert('Please provide at least an event title and a date.');
      return;
    }
    const newEvent = {
      id: 'CE' + Date.now().toString(36),
      title: newEvTitle.trim(),
      date: newEvDate,
      type: newEvType,
      description: newEvDesc.trim() || undefined
    };
    const updated: SchoolSettings = {
      ...data.settings,
      calendarEvents: [...(data.settings.calendarEvents || []), newEvent]
    };
    onUpdateSettings(updated);
    setNewEvTitle('');
    setNewEvDate('');
    setNewEvDesc('');
    alert('Calendar event added successfully!');
  };

  const handleRemoveCalendarEvent = (id: string) => {
    const updatedEvents = (data.settings.calendarEvents || []).filter(ev => ev.id !== id);
    onUpdateSettings({ ...data.settings, calendarEvents: updatedEvents });
  };

  const handleSaveAuthUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authUsername.trim()) return;

    let users = data.settings.authConfig?.users || [];
    
    if (editingUserId) {
      users = users.map(u => u.id === editingUserId ? {
        ...u,
        name: authName.trim(),
        username: authUsername.trim(),
        role: authRole,
        active: authActive,
        ...(authPassword.trim() ? { pinOrPassword: authPassword.trim() } : {})
      } : u);
    } else {
      if (!authPassword.trim()) {
        alert("Password is required for new users.");
        return;
      }
      users = [...users, {
        id: `user-${Date.now()}`,
        name: authName.trim(),
        username: authUsername.trim(),
        role: authRole,
        pinOrPassword: authPassword.trim(),
        active: authActive,
        createdAt: new Date().toISOString()
      }];
    }

    onUpdateSettings({
      ...data.settings,
      authConfig: {
        requireLoginOnStartup: data.settings.authConfig?.requireLoginOnStartup ?? true,
        users
      }
    });

    setShowUserForm(false);
    setEditingUserId(null);
    setAuthName('');
    setAuthUsername('');
    setAuthPassword('');
    setAuthRole('teacher');
    setAuthActive(true);
  };

  const handleEditAuthUser = (user: any) => {
    setEditingUserId(user.id);
    setAuthName(user.name);
    setAuthUsername(user.username);
    setAuthRole(user.role);
    setAuthActive(user.active);
    setAuthPassword(''); // Don't show existing password
    setShowUserForm(true);
  };

  const handleDeleteAuthUser = (id: string) => {
    if (confirm("Are you sure you want to completely remove this user account?")) {
      const users = (data.settings.authConfig?.users || []).filter(u => u.id !== id);
      onUpdateSettings({
        ...data.settings,
        authConfig: {
          requireLoginOnStartup: data.settings.authConfig?.requireLoginOnStartup ?? true,
          users
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">System Configuration</h2>
          <p className="text-slate-500 text-xs mt-1">
            Tune UNEB PLE parameters, custom school branding profiles, subject definitions, grading bands, and exam paper sets.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-700 border border-blue-500/15 text-[10px] font-bold rounded-lg uppercase tracking-wider">System Config</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-1">
        {[
          { id: 'school', label: 'School Headers', icon: Building },
          { id: 'ple', label: 'PLE Compulsory Override', icon: ShieldAlert },
          { id: 'visibility', label: 'Report Card Sections', icon: Sliders },
          { id: 'finance', label: 'Financial Ledger', icon: Coins },
          { id: 'preprimary', label: 'Pre-Primary', icon: Calendar },
          { id: 'lower', label: 'Lower Primary', icon: Calendar },
          { id: 'upper', label: 'Upper Primary', icon: Calendar },
          { id: 'examsets', label: 'Exam Papers', icon: SlidersIcon },
          { id: 'teachers', label: 'Class Teachers', icon: GraduationCap },
          { id: 'psycho', label: 'Psychomotor Criteria', icon: Heart },
          { id: 'calendar', label: 'School Calendar', icon: Calendar },
          { id: 'packager', label: 'App Packager', icon: Package },
          { id: 'access', label: 'Access Control', icon: User },
          { id: 'moduleConfigs', label: 'Module Resources', icon: Database },
          { id: 'helpers', label: 'System Helpers', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {/* TAB 1: School Header Info */}
        {activeTab === 'school' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleSaveGeneral} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">School Profile Headers</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Official School Name</label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Short Code Name (Sidebar Display)</label>
                  <input
                    type="text"
                    required
                    value={shortName}
                    onChange={e => setShortName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">School Motto Slogan</label>
                  <input
                    type="text"
                    value={motto}
                    onChange={e => setMotto(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Postal / Physical Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Primary Telephone Line</label>
                  <input
                    type="text"
                    value={tel1}
                    onChange={e => setTel1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Secondary Telephone Line</label>
                  <input
                    type="text"
                    value={tel2}
                    onChange={e => setTel2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                 <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Active Term Context</label>
                  <select
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  >
                    {TERMS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Active Calendar Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Term Configuration & Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Term Start Date</label>
                      <input
                        type="date"
                        value={termStartDate}
                        onChange={e => setTermStartDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Term End Date</label>
                      <input
                        type="date"
                        value={termEndDate}
                        onChange={e => setTermEndDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Next Term Begins</label>
                      <input
                        type="text"
                        value={nextTermBegins}
                        onChange={e => setNextTermBegins(e.target.value)}
                        placeholder="e.g. 13 September 2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-slate-950">Auto-register Standard Examination Papers</h5>
                      <p className="text-[10px] text-slate-500 font-medium">Quickly register BOT, MOT, and EOT exam papers with all class streams auto-selected for {term}.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoAddExamSets(term)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      Auto-Add & Select All Exams
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Head Teacher's Name</label>
                  <input
                    type="text"
                    value={headTeacherName}
                    onChange={e => setHeadTeacherName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nursery Report Template</label>
                  <select
                    value={nurseryReportTemplate}
                    onChange={e => setNurseryReportTemplate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  >
                    <option value={1}>Template 1 (Playful & Visual)</option>
                    <option value={2}>Template 2 (Minimalist)</option>
                    <option value={3}>Template 3 (Card Layout)</option>
                    <option value={4}>Template 4 (Bright Grid)</option>
                    <option value={5}>Template 5 (Storybook Minimal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Primary Report Template</label>
                  <select
                    value={primaryReportTemplate}
                    onChange={e => setPrimaryReportTemplate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  >
                    <option value={1}>Template 1 (Classic Elegant)</option>
                    <option value={2}>Template 2 (Modern Corporate)</option>
                    <option value={3}>Template 3 (Compact Academic)</option>
                    <option value={4}>Template 4 (Modern Two-Column)</option>
                    <option value={5}>Template 5 (Premium Certificate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Head Teacher's Initials</label>
                  <input
                    type="text"
                    value={headTeacherInitials}
                    onChange={e => setHeadTeacherInitials(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Official School Logo Badge</label>
                <div className="flex items-center gap-4">
                  {logo && (
                    <div className="w-16 h-16 border border-slate-200 rounded-xl overflow-hidden p-1 shrink-0 bg-white shadow-xs">
                      <img src={logo} alt="School logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10"
              >
                Save School General Details
              </button>
            </form>

            <form onSubmit={handleSaveGeneral} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">AI Configuration (Gemini API)</h3>
                <p className="text-sm text-slate-500 mt-1">Provide your own Google Gemini API key to enable local AI generation without requiring a backend server. Your key is stored securely in your local browser database.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Gemini API Key</label>
                <input 
                  type="password"
                  value={geminiApiKey} 
                  onChange={e => setGeminiApiKey(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  placeholder="AIzaSy..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                Save AI Configuration
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: UNEB PLE Compulsory Override parameters */}
        {activeTab === 'ple' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <form onSubmit={handleSavePLEOverrides} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start gap-4 p-4 border border-blue-100 bg-blue-50/50 rounded-2xl text-blue-900">
                <ShieldAlert size={20} className="shrink-0 text-blue-600 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1">
                  <b className="font-bold text-blue-950">Uganda National Exam Board (UNEB) Rules Engine:</b>
                  <p>
                    To receive Division 1 or Division 2, candidate students must achieve a minimum proficiency grade in the compulsory topics: <b>English</b> and <b>Mathematics</b>. Failing to pass these subjects automatically caps their maximum eligible Division.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={pleEnabled}
                    onChange={e => setPleEnabled(e.target.checked)}
                    className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span>Enable Compulsory-Subject Division Override Checks</span>
                </label>

                {pleEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-200/50 rounded-2xl p-5 mt-4">
                    <div className="space-y-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Division 1 Criteria Caps</span>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Max English Grade Allowed for Div 1</label>
                        <select
                          value={engD1}
                          onChange={e => setEngD1(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={4}>Credit 4 (C4) or better</option>
                          <option value={5}>Credit 5 (C5) or better</option>
                          <option value={6}>Credit 6 (C6) or better (Standard)</option>
                          <option value={7}>Pass 7 (P7) or better</option>
                          <option value={8}>Pass 8 (P8) or better</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Max Mathematics Grade Allowed for Div 1</label>
                        <select
                          value={mathD1}
                          onChange={e => setMathD1(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={4}>Credit 4 (C4) or better</option>
                          <option value={5}>Credit 5 (C5) or better</option>
                          <option value={6}>Credit 6 (C6) or better (Standard)</option>
                          <option value={7}>Pass 7 (P7) or better</option>
                          <option value={8}>Pass 8 (P8) or better</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Division 2 Criteria Caps</span>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Max English Grade Allowed for Div 2</label>
                        <select
                          value={engD2}
                          onChange={e => setEngD2(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={6}>Credit 6 (C6) or better</option>
                          <option value={7}>Pass 7 (P7) or better</option>
                          <option value={8}>Pass 8 (P8) or better (Standard)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Max Mathematics Grade Allowed for Div 2</label>
                        <select
                          value={mathD2}
                          onChange={e => setMathD2(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={6}>Credit 6 (C6) or better</option>
                          <option value={7}>Pass 7 (P7) or better</option>
                          <option value={8}>Pass 8 (P8) or better (Standard)</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-2 border-t border-slate-200/60">
                      <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={requireAll}
                          onChange={e => setRequireAll(e.target.checked)}
                          className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-600"
                        />
                        <span>Strictly require all 4 Core UNEB subjects sat to compute any Division at all</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Save UNEB Rules Settings
              </button>
            </form>

            {/* Live PLE Automated Grading & Aggregate Calculator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">PLE Automated Grading &amp; Aggregate Calculator</h3>
                  <p className="text-[11px] text-slate-500">Simulate and test PLE aggregate scores (4 - 36) and division outcomes based on the active Upper Primary grading scale.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Raw Mark Entries (0 - 100)</span>
                  
                  <div className="space-y-3.5">
                    {[
                      { key: 'eng', name: 'English', val: calcEng, set: setCalcEng, bg: 'bg-blue-50 text-blue-700 border-blue-200/50' },
                      { key: 'math', name: 'Mathematics', val: calcMath, set: setCalcMath, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
                      { key: 'sci', name: 'Science', val: calcSci, set: setCalcSci, bg: 'bg-purple-50 text-purple-700 border-purple-200/50' },
                      { key: 'sst', name: 'Social Studies', val: calcSst, set: setCalcSst, bg: 'bg-amber-50 text-amber-700 border-amber-200/50' }
                    ].map((subj) => {
                      const mark = subj.val === '' ? 0 : subj.val;
                      const grading = data.settings.sections.upper.grading;
                      const match = grading.find(g => mark >= g.min && mark <= g.max);
                      const grade = match ? match.grade : 'F9';
                      const points = getGradeRank(grade);

                      return (
                        <div key={subj.key} className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-700">{subj.name}</label>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${subj.bg}`}>
                              {grade} (Point {points})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={subj.val === '' ? 0 : subj.val}
                              onChange={e => subj.set(Number(e.target.value))}
                              className="flex-1 h-1.5 bg-slate-200/60 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={subj.val}
                              onChange={e => {
                                const v = e.target.value;
                                if (v === '') subj.set('');
                                else {
                                  const num = Math.min(100, Math.max(0, Number(v)));
                                  subj.set(num);
                                }
                              }}
                              className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-200 rounded-lg text-xs"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Certificate / Slip */}
                <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Candidate Statement of Results</span>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-0.5">{data.settings.schoolName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-slate-500">YEAR: {data.settings.year}</span>
                      </div>
                    </div>

                    {/* Performance breakdown */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 text-center text-[10px] font-bold text-slate-400 bg-slate-100/50 py-1.5 rounded-lg border border-slate-200/50">
                        <span>Subject</span>
                        <span>Raw Mark</span>
                        <span>Grade</span>
                        <span>PLE Point</span>
                      </div>

                      {[
                        { name: 'English', val: calcEng },
                        { name: 'Mathematics', val: calcMath },
                        { name: 'Science', val: calcSci },
                        { name: 'Social Studies', val: calcSst }
                      ].map((subj) => {
                        const mark = subj.val === '' ? 0 : subj.val;
                        const grading = data.settings.sections.upper.grading;
                        const match = grading.find(g => mark >= g.min && mark <= g.max);
                        const grade = match ? match.grade : 'F9';
                        const points = getGradeRank(grade);

                        return (
                          <div key={subj.name} className="grid grid-cols-4 text-center text-xs py-2 hover:bg-slate-50/50 rounded-lg transition-colors items-center">
                            <span className="font-semibold text-slate-700 text-left pl-3">{subj.name}</span>
                            <span className="font-mono font-bold text-slate-600">{subj.val === '' ? '—' : `${subj.val}%`}</span>
                            <span className="font-mono font-black text-slate-800">{grade}</span>
                            <span className="font-mono font-black text-blue-600">{points} Pt</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary / Division block */}
                  {(() => {
                    const grading = data.settings.sections.upper.grading;
                    const engVal = calcEng === '' ? 0 : calcEng;
                    const mathVal = calcMath === '' ? 0 : calcMath;
                    const sciVal = calcSci === '' ? 0 : calcSci;
                    const sstVal = calcSst === '' ? 0 : calcSst;

                    const engG = grading.find(g => engVal >= g.min && engVal <= g.max)?.grade || 'F9';
                    const mathG = grading.find(g => mathVal >= g.min && mathVal <= g.max)?.grade || 'F9';
                    const sciG = grading.find(g => sciVal >= g.min && sciVal <= g.max)?.grade || 'F9';
                    const sstG = grading.find(g => sstVal >= g.min && sstVal <= g.max)?.grade || 'F9';

                    const engPoints = getGradeRank(engG);
                    const mathPoints = getGradeRank(mathG);
                    const sciPoints = getGradeRank(sciG);
                    const sstPoints = getGradeRank(sstG);

                    const totalAggregate = engPoints + mathPoints + sciPoints + sstPoints;

                    // Apply division criteria
                    const rules = data.settings.pleOverride;
                    let div = 'Division U';
                    let messages: string[] = [];
                    let isDemoted = false;

                    if (pleEnabled) {
                      if (totalAggregate <= 12) {
                        if (engPoints > engD1 || mathPoints > mathD1) {
                          div = 'Division 2';
                          isDemoted = true;
                          if (engPoints > engD1) {
                            messages.push(`English points (${engPoints}) exceed Division 1 cap limit (${engD1})`);
                          }
                          if (mathPoints > mathD1) {
                            messages.push(`Mathematics points (${mathPoints}) exceed Division 1 cap limit (${mathD1})`);
                          }
                        } else {
                          div = 'Division 1';
                          messages.push('Qualifies for Division 1 with excellent compulsory parameters.');
                        }
                      } else if (totalAggregate <= 24) {
                        if (engPoints > engD2 || mathPoints > mathD2) {
                          div = 'Division 3';
                          isDemoted = true;
                          if (engPoints > engD2) {
                            messages.push(`English points (${engPoints}) exceed Division 2 cap limit (${engD2})`);
                          }
                          if (mathPoints > mathD2) {
                            messages.push(`Mathematics points (${mathPoints}) exceed Division 2 cap limit (${mathD2})`);
                          }
                        } else {
                          div = 'Division 2';
                          messages.push('Qualifies for Division 2 on aggregate and core subjects.');
                        }
                      } else if (totalAggregate <= 28) {
                        div = 'Division 3';
                        messages.push('Aggregate qualifies for Division 3.');
                      } else if (totalAggregate <= 32) {
                        div = 'Division 4';
                        messages.push('Aggregate qualifies for Division 4.');
                      } else {
                        div = 'Division U';
                        messages.push('Ungraded performance (exceeds Division 4 boundary).');
                      }
                    } else {
                      if (totalAggregate <= 12) {
                        div = 'Division 1';
                        messages.push('Simple aggregate qualifies for Division 1.');
                      } else if (totalAggregate <= 24) {
                        div = 'Division 2';
                        messages.push('Simple aggregate qualifies for Division 2.');
                      } else if (totalAggregate <= 28) {
                        div = 'Division 3';
                        messages.push('Simple aggregate qualifies for Division 3.');
                      } else if (totalAggregate <= 32) {
                        div = 'Division 4';
                        messages.push('Simple aggregate qualifies for Division 4.');
                      } else {
                        div = 'Division U';
                        messages.push('Ungraded performance (exceeds Division 4 boundary).');
                      }
                    }

                    const divColors = 
                      div === 'Division 1' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      div === 'Division 2' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      div === 'Division 3' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      div === 'Division 4' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-rose-50 text-rose-700 border-rose-200';

                    return (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Computed Aggregates</span>
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <span className="text-xl font-black text-slate-900 font-mono">{totalAggregate}</span>
                            <span className="text-xs text-slate-500 font-bold">Points</span>
                          </div>
                          <div className="space-y-0.5 max-w-xs">
                            {messages.map((msg, idx) => (
                              <p key={idx} className={`text-[10px] font-semibold leading-tight ${isDemoted ? 'text-amber-600' : 'text-slate-500'}`}>
                                {isDemoted ? '⚠️' : '✓'} {msg}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className={`px-4 py-2.5 rounded-xl border text-center shrink-0 w-full sm:w-auto ${divColors}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest block opacity-75">Simulated PLE Rank</span>
                          <span className="text-sm font-black font-mono block tracking-tight">{div}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2.5: Report Card Section Visibility */}
        {activeTab === 'visibility' && (
          <form onSubmit={handleSaveVisibility} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950">Report Card Layout & Section Visibility</h3>
              <p className="text-slate-500 text-xs mt-0.5">Toggle specific sections on or off to dynamically customize report cards before bulk printing or PDF exporting.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Card 1: Teacher Comments */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Building size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Comments Section</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the Class Teacher's remarks, Head Teacher's remarks, next term start date, and signature initials block.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTeacherComments}
                      onChange={e => setShowTeacherComments(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 2: Psychomotor Records */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                      <Heart size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Psychomotor Records</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the developmental rating indicators (games, handwriting, verbal fluency, paint skills, etc.) and grading key.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPsychomotor}
                      onChange={e => setShowPsychomotor(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 3: Class Ranking & Subject Position */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <GraduationCap size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Class Ranking &amp; Subject Position</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the student's class-wide sorting rank, subject position among peers (e.g. 1/15), and overall position text.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRankingTable}
                      onChange={e => setShowRankingTable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 4: Division & Aggregate Badges */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Award size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">PLE Division &amp; Aggregates</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the computed UNEB division badge, core aggregate points (e.g. 12 Points), and predictive divisional estimate info.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDivision}
                      onChange={e => setShowDivision(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 5: Student Photo */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                      <User size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Student Photo ID</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the student's profile picture or placeholder avatar on the upper right side of their report sheet header.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showStudentPhoto}
                      onChange={e => setShowStudentPhoto(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 6: Grading Scale Key */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-violet-50 text-violet-600 rounded-lg">
                      <BookOpen size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">Grading System Key</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the full grading scale dictionary block detailing min/max percentages and remarks at the bottom.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGradingScale}
                      onChange={e => setShowGradingScale(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Card 7: School Logo */}
              <div className="p-5 border border-slate-200/80 rounded-2xl hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
                      <Image size={16} />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">School logo &amp; Crest</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Show or hide the official uploaded school banner emblem or crest situated at the top center header of report sheets.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSchoolLogo}
                      onChange={e => setShowSchoolLogo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400 font-semibold italic">These settings apply to both single student view prints and bulk/batch printing processes.</span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                Save Layout Preferences
              </button>
            </div>
          </form>
        )}

        {/* TAB 3-5: Section Configurations */}
        {['preprimary', 'lower', 'upper'].includes(activeTab) && (
          <div className="space-y-6">
            {/* Subjects configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100 capitalize">
                {activeTab} Curriculum Subjects
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                      <th className="py-2.5 px-4 font-semibold">Subject Name</th>
                      <th className="py-2.5 px-4 font-semibold text-center w-28">Max Marks Possible</th>
                      <th className="py-2.5 px-4 text-right font-semibold w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.settings.sections[activeTab as 'preprimary'|'lower'|'upper'].subjects.map((s, idx) => (
                      <tr key={s.name} className="hover:bg-slate-50/20">
                        <td className="py-3 px-4 font-bold text-slate-700">{s.name}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{s.max}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(activeTab as any, idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add subject form */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="e.g. Kiswahili"
                  value={newSubjName}
                  onChange={e => setNewSubjName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="number"
                  placeholder="Max: 100"
                  value={newSubjMax}
                  onChange={e => setNewSubjMax(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubject(activeTab as any)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/10"
                >
                  <Plus size={13} />
                  <span>Add Subject</span>
                </button>
              </div>
            </div>

            {/* Grading scale configuration */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100 capitalize">
                {activeTab} Grading Scale Tiers
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                      <th className="py-2.5 px-3 font-semibold text-center w-16">Min %</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-16">Max %</th>
                      <th className="py-2.5 px-3 font-semibold text-center w-14">Grade</th>
                      <th className="py-2.5 px-3 font-semibold w-20">Remark</th>
                      <th className="py-2.5 px-3 font-semibold">Class Teacher Templates</th>
                      <th className="py-2.5 px-3 font-semibold">Head Teacher Templates</th>
                      <th className="py-2.5 px-3 text-right font-semibold w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.settings.sections[activeTab as 'preprimary'|'lower'|'upper'].grading.map((band, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="py-2.5 px-1.5">
                          <input
                            type="number"
                            value={band.min}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'min', e.target.value)}
                            className="w-14 px-1 py-1 text-center bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2.5 px-1.5">
                          <input
                            type="number"
                            value={band.max}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'max', e.target.value)}
                            className="w-14 px-1 py-1 text-center bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2.5 px-1.5">
                          <input
                            type="text"
                            value={band.grade}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'grade', e.target.value)}
                            className="w-12 px-1 py-1 text-center bg-slate-50 border border-slate-200 rounded-md text-xs font-mono font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-1.5">
                          <input
                            type="text"
                            value={band.remark}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'remark', e.target.value)}
                            className="w-20 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold"
                          />
                        </td>
                        <td className="py-2.5 px-1.5">
                          <textarea
                            rows={2}
                            value={(band.classComments || []).join('\n')}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'classComments', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] placeholder:text-slate-400"
                            placeholder="Class teacher remarks per line..."
                          />
                        </td>
                        <td className="py-2.5 px-1.5">
                          <textarea
                            rows={2}
                            value={(band.headComments || []).join('\n')}
                            onChange={e => handleGradeBandChange(activeTab as any, idx, 'headComments', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] placeholder:text-slate-400"
                            placeholder="Head teacher remarks per line..."
                          />
                        </td>
                        <td className="py-2.5 px-1.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveGradeBand(activeTab as any, idx)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAddGradeBand(activeTab as any)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border border-slate-200/50"
                >
                  <Plus size={13} />
                  <span>Add Grade Band</span>
                </button>
              </div>
            </div>

            {/* Save Button for Section Configurations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Save {activeTab.toUpperCase()} Section Configurations</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Commit subject roster and grading band tier changes across all connected browsers &amp; cloud storage.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(data.settings);
                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: {
                      message: `Successfully saved ${activeTab.toUpperCase()} section curriculum and grading scale to cloud!`,
                      type: 'success'
                    }
                  }));
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Check size={15} />
                <span>Save {activeTab.toUpperCase()} Section Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: Exam Sets Settings */}
        {activeTab === 'examsets' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">Existing Exam Papers</h3>
              <p className="text-xs text-slate-500">Enable/disable which student class streams sit which examination paper sets.</p>

              <div className="space-y-4">
                {data.settings.examSets.map(set => (
                  <div key={set.id} className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{set.term} &middot; {set.label}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Assigned period: {set.period}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExamSet(set.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Class Streams Sitting</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-medium text-slate-600">
                        {ALL_CLASSES.map(cls => (
                          <label key={cls} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={set.classes.includes(cls)}
                              onChange={() => handleToggleExamSetClass(set.id, cls)}
                              className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span>{cls}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Ensure examination paper configurations and class sitting rules are synchronized.</p>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(data.settings);
                    window.dispatchEvent(new CustomEvent('otec-toast', {
                      detail: {
                        message: 'Exam paper configurations & class stream sitting assignments saved and synced to cloud!',
                        type: 'success'
                      }
                    }));
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Exam Paper Configurations</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">Register New Exam Paper</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Term</label>
                  <select
                    value={newTerm}
                    onChange={e => setNewTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {TERMS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Period Period</label>
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                  >
                    {PERIODS.map(p => (
                      <option key={p.code} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Set Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newSetNo}
                    onChange={e => setNewSetNo(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Override Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BOT (Set 1)"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddExamSet}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Register Exam Paper</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: Staff & Class Teachers Registry */}
        {activeTab === 'teachers' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Part 1: Staff Directory Registry */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Staff Directory Registry</h3>
                  <p className="text-xs text-slate-500 mt-1">Register, edit, and maintain all primary and nursery section teachers.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff members..."
                    value={teacherSearch}
                    onChange={e => setTeacherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Add Teacher Form */}
                <form onSubmit={handleAddTeacher} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
                    <UserPlus size={16} className="text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Register Staff Teacher</h4>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sserwadda David"
                      value={newTName}
                      onChange={e => setNewTName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Initials *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. S.D."
                        value={newTInitials}
                        onChange={e => setNewTInitials(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase placeholder:text-slate-400 text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Specialization</label>
                      <input
                        type="text"
                        placeholder="e.g. Math, Science"
                        value={newTSpecialization}
                        onChange={e => setNewTSpecialization(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +256 701 000000"
                      value={newTPhone}
                      onChange={e => setNewTPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. david@school.ug"
                      value={newTEmail}
                      onChange={e => setNewTEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Register Teacher</span>
                  </button>
                </form>

                {/* Teacher Directory List */}
                <div className="lg:col-span-2 overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                        <th className="py-2.5 px-4 font-semibold">Teacher Info</th>
                        <th className="py-2.5 px-4 font-semibold">Specialization</th>
                        <th className="py-2.5 px-4 font-semibold">Contacts</th>
                        <th className="py-2.5 px-4 text-right font-semibold w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.settings.teachersList || []).filter(t => 
                        t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                        t.initials.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                        (t.specialization && t.specialization.toLowerCase().includes(teacherSearch.toLowerCase()))
                      ).map(t => {
                        const isEditing = editingTId === t.id;
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/20">
                            {isEditing ? (
                              <>
                                <td className="py-2 px-3" colSpan={3}>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Name</span>
                                      <input
                                        type="text"
                                        value={editTName}
                                        onChange={e => setEditTName(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Initials</span>
                                      <input
                                        type="text"
                                        value={editTInitials}
                                        onChange={e => setEditTInitials(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs uppercase text-center font-bold"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Specialization</span>
                                      <input
                                        type="text"
                                        value={editTSpecialization}
                                        onChange={e => setEditTSpecialization(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Phone</span>
                                      <input
                                        type="text"
                                        value={editTPhone}
                                        onChange={e => setEditTPhone(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                      />
                                    </div>
                                    <div className="sm:col-span-2">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Email</span>
                                      <input
                                        type="email"
                                        value={editTEmail}
                                        onChange={e => setEditTEmail(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="flex flex-col gap-1 items-end">
                                    <button
                                      onClick={() => handleSaveEditTeacher(t.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingTId(null)}
                                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                                      {t.initials}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-800">{t.name}</div>
                                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{t.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-600">
                                  {t.specialization || 'General Studies'}
                                </td>
                                <td className="py-3 px-4 text-slate-500 font-medium space-y-0.5">
                                  {t.phone && <div className="font-mono text-[10px]">📞 {t.phone}</div>}
                                  {t.email && <div className="text-[10px]">✉️ {t.email}</div>}
                                  {!t.phone && !t.email && <span className="text-slate-300 italic">No contacts</span>}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleStartEditTeacher(t)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                                      title="Edit teacher info"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTeacher(t.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50"
                                      title="Delete staff record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}

                      {(!data.settings.teachersList || data.settings.teachersList.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 bg-slate-50/50 italic">
                            No teachers currently registered in the staff directory.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Part 2: Non-Teaching Staff Registry */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 mt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Non-Teaching Staff Directory</h3>
                  <p className="text-xs text-slate-500 mt-1">Register and manage support staff, guards, cleaners, and administrators.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search support staff..."
                    value={ntsSearch}
                    onChange={e => setNtsSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <form onSubmit={handleAddNts} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
                    <UserPlus size={16} className="text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Register Support Staff</h4>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kato Moses"
                      value={newNtsName}
                      onChange={e => setNewNtsName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Department *</label>
                    <select
                      required
                      value={newNtsDepartment}
                      onChange={e => setNewNtsDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="">Select Department...</option>
                      {(data.settings.hrDepartments || []).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {(!data.settings.hrDepartments || data.settings.hrDepartments.length === 0) && (
                      <p className="text-[10px] text-rose-500 mt-1">Please add departments in Module Resources first.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. 077..."
                      value={newNtsPhone}
                      onChange={e => setNewNtsPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Add Staff Member</span>
                  </button>
                </form>

                <div className="lg:col-span-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                        <th className="py-2.5 px-4 font-semibold">Staff Info</th>
                        <th className="py-2.5 px-4 font-semibold">Department</th>
                        <th className="py-2.5 px-4 text-right font-semibold w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.settings.nonTeachingStaffList || []).filter(s => 
                        s.name.toLowerCase().includes(ntsSearch.toLowerCase()) ||
                        s.department.toLowerCase().includes(ntsSearch.toLowerCase())
                      ).map(s => {
                        const isEditing = editingNtsId === s.id;
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/20">
                            {isEditing ? (
                              <>
                                <td className="py-2 px-3" colSpan={2}>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Name</span>
                                      <input
                                        type="text"
                                        value={editNtsName}
                                        onChange={e => setEditNtsName(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                                      <select
                                        value={editNtsDepartment}
                                        onChange={e => setEditNtsDepartment(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs"
                                      >
                                        <option value="">Select Department...</option>
                                        {(data.settings.hrDepartments || []).map(dept => (
                                          <option key={`edit-${dept}`} value={dept}>{dept}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Phone</span>
                                      <input
                                        type="text"
                                        value={editNtsPhone}
                                        onChange={e => setEditNtsPhone(e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 px-4 text-right align-top">
                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <button onClick={() => handleSaveEditNts(s.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100"><Check size={14} /></button>
                                    <button onClick={() => setEditingNtsId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200"><X size={14} /></button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-2 px-4">
                                  <div className="font-bold text-slate-800">{s.name}</div>
                                  {s.phone && <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.phone}</div>}
                                </td>
                                <td className="py-2 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                    {s.department}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => handleStartEditNts(s)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit3 size={14} /></button>
                                    <button onClick={() => handleDeleteNts(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                      {(!data.settings.nonTeachingStaffList || data.settings.nonTeachingStaffList.length === 0) && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400 bg-slate-50/50 italic">
                            No non-teaching staff currently registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Part 3: Class Stream Assignments */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">Class Stream Assignments</h3>
              <p className="text-xs text-slate-500">Assign a registered teacher or configure custom class stream teachers to manage report card signing.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50">
                      <th className="py-2.5 px-4 font-semibold w-40">Class Stream</th>
                      <th className="py-2.5 px-4 font-semibold">Assign Staff Member</th>
                      <th className="py-2.5 px-4 font-semibold">Teacher Custom Full Name</th>
                      <th className="py-2.5 px-4 font-semibold w-44">Autosave Initials</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_CLASSES.map(cls => {
                      const t = data.settings.classTeachers[cls] || { name: '', initials: '' };
                      const registeredTeachers = data.settings.teachersList || [];

                      return (
                        <tr key={cls} className="hover:bg-slate-50/20">
                          <td className="py-3 px-4 font-bold text-slate-700">{cls}</td>
                          <td className="py-2.5 px-4">
                            <select
                              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white"
                              onChange={e => {
                                const selectedId = e.target.value;
                                if (!selectedId) return;
                                if (selectedId === 'custom') return;
                                const selectedTeacher = registeredTeachers.find(tch => tch.id === selectedId);
                                if (selectedTeacher) {
                                  handleTeacherChange(cls, 'name', selectedTeacher.name);
                                  handleTeacherChange(cls, 'initials', selectedTeacher.initials);
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>-- Select Registered Staff --</option>
                              {registeredTeachers.map(tch => (
                                <option key={tch.id} value={tch.id}>
                                  {tch.name} ({tch.initials})
                                </option>
                              ))}
                              <option value="custom">✍️ Manual Custom Entry</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              placeholder="e.g. Sserwadda David"
                              value={t.name}
                              onChange={e => handleTeacherChange(cls, 'name', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                            />
                          </td>
                          <td className="py-2.5 px-4">
                            <input
                              type="text"
                              placeholder="e.g. S.D."
                              value={t.initials}
                              onChange={e => handleTeacherChange(cls, 'initials', e.target.value)}
                              className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center uppercase"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500">Commit class teacher assignments and initials for report card signing.</p>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(data.settings);
                    window.dispatchEvent(new CustomEvent('otec-toast', {
                      detail: {
                        message: 'Class stream teacher assignments and initials saved to cloud across all browsers!',
                        type: 'success'
                      }
                    }));
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Class Teacher Assignments</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: Psychomotor Criteria */}
        {activeTab === 'psycho' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100">Psychomotor Assessment Checklist</h3>
            <p className="text-xs text-slate-500">Customize the physical, mechanical, and behavioral attributes that class teachers will rate.</p>

            <div className="space-y-2 max-w-lg">
              {data.settings.psychomotor.map((skill, idx) => (
                <div key={skill} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50/40 rounded-xl">
                  <span className="text-xs font-bold text-slate-700">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 max-w-lg pt-3 border-t border-slate-100">
              <input
                type="text"
                placeholder="e.g. Class Discipline"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm shadow-blue-600/10 animate-fade-in"
              >
                <Plus size={13} />
                <span>Add Attribute</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-lg">
              <p className="text-xs text-slate-500">Save psychomotor and behavioral attributes checklist.</p>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(data.settings);
                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: {
                      message: 'Psychomotor assessment checklist saved and synchronized to cloud!',
                      type: 'success'
                    }
                  }));
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Check size={14} />
                <span>Save Psychomotor Criteria</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: School Calendar */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950">School Calendar Manager</h3>
              <p className="text-xs text-slate-500 mt-1">
                Define the key term events, assessment deadlines, and national or school holidays. These events are highlighted dynamically on the dashboard.
              </p>
            </div>

            {/* List of existing events */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Events &amp; Milestones</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(!data.settings.calendarEvents || data.settings.calendarEvents.length === 0) ? (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No school calendar events defined yet. Add some below!
                  </div>
                ) : (
                  [...data.settings.calendarEvents]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev) => (
                      <div key={ev.id} className="flex gap-4 p-4 border border-slate-100 bg-slate-50/40 rounded-2xl hover:border-slate-200 transition-all group relative">
                        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                            {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-lg font-black text-slate-800 leading-none">
                            {new Date(ev.date).getDate() || ev.date.split('-')[2]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{ev.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              ev.type === 'holiday' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/15' :
                              ev.type === 'deadline' ? 'bg-rose-500/10 text-rose-700 border border-rose-500/15' :
                              'bg-blue-500/10 text-blue-700 border border-blue-500/15'
                            }`}>
                              {ev.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {ev.description || 'No description provided.'}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-1.5">{ev.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCalendarEvent(ev.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Create form */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule New Event or Holiday</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g. End of Term Thanksgiving Party"
                    value={newEvTitle}
                    onChange={e => setNewEvTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Calendar Date</label>
                  <input
                    type="date"
                    value={newEvDate}
                    onChange={e => setNewEvDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Event Category</label>
                  <select
                    value={newEvType}
                    onChange={e => setNewEvType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                  >
                    <option value="event">School Activity / Event</option>
                    <option value="deadline">Academic Deadline / Exam Set</option>
                    <option value="holiday">School / Public Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="Provide supplementary details about time, expectations, dress code, etc."
                  value={newEvDesc}
                  onChange={e => setNewEvDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddCalendarEvent}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Scheduled Event</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Commit school term calendar events and holidays schedule.</p>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings(data.settings);
                  window.dispatchEvent(new CustomEvent('otec-toast', {
                    detail: {
                      message: 'School term calendar events and holiday schedule saved and synced across browsers!',
                      type: 'success'
                    }
                  }));
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Check size={14} />
                <span>Save School Calendar</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 10: Financial Ledger Settings */}
        {activeTab === 'finance' && (
          <form onSubmit={handleSaveFinance} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-950">Financial Ledger Settings</h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure default tuition fees structure, default accounting currency, and enable automatic financial deductions or receipts generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Default Day Scholar Tuition Fees (Per Term)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={ledgerDayFees}
                    onChange={e => setLedgerDayFees(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Applied automatically to new student accounts of type "Day".</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Default Boarder Tuition Fees (Per Term)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={ledgerBoardingFees}
                    onChange={e => setLedgerBoardingFees(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Applied automatically to new student accounts of type "Boarding".</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Accounting Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={ledgerCurrency}
                  onChange={e => setLedgerCurrency(e.target.value.trim().toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Common choices include UGX, USD, KES, RWF, EUR.</p>
              </div>

              <div className="flex flex-col justify-center bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ledgerAutoDeduct}
                    onChange={e => setLedgerAutoDeduct(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">Auto-Apply Tuition on Term Commencement</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Automatically debit students with arrears when a new school term begins.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Detailed Default Fee Structures */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">Default Fee Items Template</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Define standard charges for specific requirements. These serve as defaults when configuring individual student billing.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Tuition Nursery */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nursery Tuition Fees</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeTuitionNursery}
                      onChange={e => setFeeTuitionNursery(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Tuition Lower */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Lower Primary Tuition (P1-P3)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeTuitionLower}
                      onChange={e => setFeeTuitionLower(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Tuition Upper */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Upper Primary Tuition (P4-P7)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeTuitionUpper}
                      onChange={e => setFeeTuitionUpper(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Boarding Section */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Boarding Section Fees</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeBoarding}
                      onChange={e => setFeeBoarding(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Van Min */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Min Van/Transport Fees</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeVanMin}
                      onChange={e => setFeeVanMin(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Van Max */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Max Van/Transport Fees</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeVanMax}
                      onChange={e => setFeeVanMax(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Registration Fees */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Registration Fees (New)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeRegistration}
                      onChange={e => setFeeRegistration(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Sweater */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sweater Uniform Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeSweater}
                      onChange={e => setFeeSweater(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Class Uniform */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Class Uniform Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeClassUniform}
                      onChange={e => setFeeClassUniform(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Sports Wear */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Sports Wear Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeSportsWear}
                      onChange={e => setFeeSportsWear(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Hair Shaving */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Hair Shaving/Grooming</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeHair}
                      onChange={e => setFeeHair(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Holiday Package */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Holiday Package Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeHoliday}
                      onChange={e => setFeeHoliday(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Others */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Others/Miscellaneous Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono">{ledgerCurrency}</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={feeOthers}
                      onChange={e => setFeeOthers(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors cursor-pointer"
              >
                <Check size={14} />
                <span>Save Financial Config</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: Packager */}
        {activeTab === 'packager' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-sm font-bold text-slate-950 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Package size={16} className="text-indigo-600" />
              Generate Standalone Installers
            </h3>
            
            <p className="text-xs text-slate-500 font-medium">
              Click the buttons below to compile and generate downloadable installers for different platforms. Note that generating Windows or Android files from a Mac requires specific developer tools (Wine, Android Studio) to be installed on your machine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                type="button"
                onClick={() => handleBuildApp('mac')}
                disabled={isBuildingApp !== null}
                className="flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                <Monitor size={32} className="text-slate-700" />
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm">macOS (.dmg)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Apple Silicon & Intel</div>
                </div>
                {isBuildingApp === 'mac' && <Loader2 size={16} className="animate-spin text-slate-400 mt-2" />}
              </button>

              <button
                type="button"
                onClick={() => handleBuildApp('win')}
                disabled={isBuildingApp !== null}
                className="flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md hover:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                <Monitor size={32} className="text-blue-600" />
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm">Windows (.exe)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Windows 10 / 11</div>
                </div>
                {isBuildingApp === 'win' && <Loader2 size={16} className="animate-spin text-blue-400 mt-2" />}
              </button>

              <button
                type="button"
                onClick={() => handleBuildApp('android')}
                disabled={isBuildingApp !== null}
                className="flex flex-col items-center justify-center gap-3 p-5 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100/50 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer disabled:opacity-50"
              >
                <Smartphone size={32} className="text-emerald-600" />
                <div className="text-center">
                  <div className="font-bold text-slate-800 text-sm">Android (.apk)</div>
                  <div className="text-[10px] text-emerald-600/80 font-medium">Mobile Installer</div>
                </div>
                {isBuildingApp === 'android' && <Loader2 size={16} className="animate-spin text-emerald-500 mt-2" />}
              </button>
            </div>
          </div>
        )}

        {/* TAB: Access Control */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">User Access Control</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Manage system logins and Role Based Access Control (RBAC).</p>
                  </div>
                </div>
                {!showUserForm && (
                  <button 
                    onClick={() => {
                      setEditingUserId(null);
                      setAuthName('');
                      setAuthUsername('');
                      setAuthPassword('');
                      setAuthRole('teacher');
                      setAuthActive(true);
                      setShowUserForm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <UserPlus size={14} /> Add User
                  </button>
                )}
              </div>

              {showUserForm ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">{editingUserId ? 'Edit User Account' : 'Register New User'}</h4>
                  <form onSubmit={handleSaveAuthUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Jane Doe" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username</label>
                        <input type="text" required value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono" placeholder="e.g. janedoe1" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">System Role</label>
                        <select value={authRole} onChange={e => setAuthRole(e.target.value as any)} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer">
                          <option value="superuser">Superuser (Full Admin)</option>
                          <option value="accountant">Accountant (Bursar)</option>
                          <option value="security">Security Guard (Gate)</option>
                          <option value="teacher">Teacher (Academics)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Password {editingUserId && <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}
                        </label>
                        <input type="password" required={!editingUserId} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="authActive" checked={authActive} onChange={e => setAuthActive(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <label htmlFor="authActive" className="text-xs font-semibold text-slate-700 cursor-pointer">Account is Active (Can Login)</label>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                        Save User
                      </button>
                      <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                        <th className="px-4 py-3 border-b border-slate-200">Name</th>
                        <th className="px-4 py-3 border-b border-slate-200">Username</th>
                        <th className="px-4 py-3 border-b border-slate-200">Role</th>
                        <th className="px-4 py-3 border-b border-slate-200">Status</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {data.settings.authConfig?.users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold">{u.name}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block">{u.username}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'superuser' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'accountant' ? 'bg-emerald-100 text-emerald-700' :
                              u.role === 'security' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${u.active ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                              {u.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => handleEditAuthUser(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer" title="Edit User">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDeleteAuthUser(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer" title="Delete User">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!data.settings.authConfig?.users || data.settings.authConfig.users.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                            No users registered. Add a superuser to secure the system.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'moduleConfigs' && (
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-8 animate-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Shared Module Resources</h3>
              <p className="text-xs text-slate-500 mt-1">Configure global dropdowns and parameters used across the various app modules.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Finance Categories */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Coins size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Finance Categories</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Category Name" value={newFCName} onChange={e => setNewFCName(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <select value={newFCType} onChange={e => setNewFCType(e.target.value as any)} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <button onClick={() => {
                    if(!newFCName) return;
                    const cats = data.settings.financeCategories || [];
                    onUpdateSettings({...data.settings, financeCategories: [...cats, { id: 'fc-'+Date.now(), name: newFCName, type: newFCType, color: 'blue' }]});
                    setNewFCName('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {(data.settings.financeCategories || []).map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <button onClick={() => {
                        const cats = data.settings.financeCategories!.filter(c => c.id !== cat.id);
                        onUpdateSettings({...data.settings, financeCategories: cats});
                      }} className="text-rose-500 hover:text-rose-700"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {(!data.settings.financeCategories || data.settings.financeCategories.length === 0) && <p className="text-xs text-slate-500 italic">No categories defined.</p>}
                </div>
              </div>

              {/* HR Departments */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <User size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">HR Departments</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Department Name" value={newHRDept} onChange={e => setNewHRDept(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={() => {
                    if(!newHRDept) return;
                    const depts = data.settings.hrDepartments || [];
                    if(!depts.includes(newHRDept)) {
                      onUpdateSettings({...data.settings, hrDepartments: [...depts, newHRDept]});
                    }
                    setNewHRDept('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(data.settings.hrDepartments || []).map(dept => (
                    <div key={dept} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                      <span className="text-xs font-medium text-slate-700">{dept}</span>
                      <button onClick={() => {
                        const depts = data.settings.hrDepartments!.filter(d => d !== dept);
                        onUpdateSettings({...data.settings, hrDepartments: depts});
                      }} className="text-rose-400 hover:text-rose-600 ml-1"><X size={12}/></button>
                    </div>
                  ))}
                  {(!data.settings.hrDepartments || data.settings.hrDepartments.length === 0) && <p className="text-xs text-slate-500 italic">No departments defined.</p>}
                </div>
              </div>

              {/* Transport Routes */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Building size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Transport Routes</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Route Name" value={newRouteName} onChange={e => setNewRouteName(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <input type="number" placeholder="Cost" value={newRouteCost} onChange={e => setNewRouteCost(e.target.value)} className="w-20 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={() => {
                    if(!newRouteName) return;
                    const routes = data.settings.transportRoutes || [];
                    onUpdateSettings({...data.settings, transportRoutes: [...routes, { id: 'rt-'+Date.now(), name: newRouteName, standardCost: Number(newRouteCost) || 0 }]});
                    setNewRouteName('');
                    setNewRouteCost('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {(data.settings.transportRoutes || []).map(route => (
                    <div key={route.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-700">{route.name} (UGX {route.standardCost?.toLocaleString()})</span>
                      <button onClick={() => {
                        const routes = data.settings.transportRoutes!.filter(r => r.id !== route.id);
                        onUpdateSettings({...data.settings, transportRoutes: routes});
                      }} className="text-rose-500 hover:text-rose-700"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {(!data.settings.transportRoutes || data.settings.transportRoutes.length === 0) && <p className="text-xs text-slate-500 italic">No routes defined.</p>}
                </div>
              </div>

              {/* Asset Locations */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Package size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Asset Locations</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Location Name" value={newAssetLoc} onChange={e => setNewAssetLoc(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={() => {
                    if(!newAssetLoc) return;
                    const locs = data.settings.assetLocations || [];
                    if(!locs.includes(newAssetLoc)) {
                      onUpdateSettings({...data.settings, assetLocations: [...locs, newAssetLoc]});
                    }
                    setNewAssetLoc('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {(data.settings.assetLocations || []).map(loc => (
                    <div key={loc} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                      <span className="text-xs font-medium text-slate-700">{loc}</span>
                      <button onClick={() => {
                        const locs = data.settings.assetLocations!.filter(l => l !== loc);
                        onUpdateSettings({...data.settings, assetLocations: locs});
                      }} className="text-rose-400 hover:text-rose-600 ml-1"><X size={12}/></button>
                    </div>
                  ))}
                  {(!data.settings.assetLocations || data.settings.assetLocations.length === 0) && <p className="text-xs text-slate-500 italic">No locations defined.</p>}
                </div>
              </div>
              
              {/* Hostel Blocks */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Building size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Hostel Dormitories</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Block Name" value={newBlockName} onChange={e => setNewBlockName(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <input type="number" placeholder="Capacity" value={newBlockCap} onChange={e => setNewBlockCap(e.target.value)} className="w-20 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={() => {
                    if(!newBlockName) return;
                    const blocks = data.settings.hostelBlocks || [];
                    onUpdateSettings({...data.settings, hostelBlocks: [...blocks, { id: 'blk-'+Date.now(), name: newBlockName, capacity: Number(newBlockCap) || 0 }]});
                    setNewBlockName('');
                    setNewBlockCap('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {(data.settings.hostelBlocks || []).map(block => (
                    <div key={block.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                      <span className="text-xs font-medium text-slate-700">{block.name} ({block.capacity} beds)</span>
                      <button onClick={() => {
                        const blocks = data.settings.hostelBlocks!.filter(b => b.id !== block.id);
                        onUpdateSettings({...data.settings, hostelBlocks: blocks});
                      }} className="text-rose-500 hover:text-rose-700"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {(!data.settings.hostelBlocks || data.settings.hostelBlocks.length === 0) && <p className="text-xs text-slate-500 italic">No blocks defined.</p>}
                </div>
              </div>

              {/* Discipline Offenses */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <ShieldAlert size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Discipline Offenses</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Offense Name" value={newOffenseName} onChange={e => setNewOffenseName(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <select value={newOffenseType} onChange={e => setNewOffenseType(e.target.value as any)} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white">
                    <option value="Demerit">Demerit</option>
                    <option value="Merit">Merit</option>
                  </select>
                  <button onClick={() => {
                    if(!newOffenseName) return;
                    const offenses = data.settings.disciplineOffenses || [];
                    onUpdateSettings({...data.settings, disciplineOffenses: [...offenses, { id: 'off-'+Date.now(), name: newOffenseName, type: newOffenseType }]});
                    setNewOffenseName('');
                  }} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {(data.settings.disciplineOffenses || []).map(offense => (
                    <div key={offense.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${offense.type === 'Merit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{offense.type}</span>
                        <span className="text-xs font-medium text-slate-700">{offense.name}</span>
                      </div>
                      <button onClick={() => {
                        const offenses = data.settings.disciplineOffenses!.filter(o => o.id !== offense.id);
                        onUpdateSettings({...data.settings, disciplineOffenses: offenses});
                      }} className="text-rose-500 hover:text-rose-700"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {(!data.settings.disciplineOffenses || data.settings.disciplineOffenses.length === 0) && <p className="text-xs text-slate-500 italic">No offenses defined.</p>}
                </div>
              </div>

              {/* Library Books */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Library Books Catalog</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="e.g. Primary English Book 1" value={newLibraryBook} onChange={e => setNewLibraryBook(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={handleAddLibraryBook} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {(data.settings.libraryBooks || []).map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-slate-700">{b}</span>
                      <button onClick={() => handleRemoveLibraryBook(idx)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {!(data.settings.libraryBooks?.length) && <p className="text-xs text-slate-400 text-center py-2">No standard library books defined.</p>}
                </div>
              </div>

              {/* Dormitory Rooms */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <Home size={16} className="text-blue-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Dormitory Rooms</h4>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="e.g. Room 101" value={newDormRoom} onChange={e => setNewDormRoom(e.target.value)} className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200" />
                  <button onClick={handleAddDormRoom} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Add</button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {(data.settings.dormitoryRooms || []).map((r, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg shadow-xs">
                      <span className="text-xs font-medium text-slate-700">{r}</span>
                      <button onClick={() => handleRemoveDormRoom(idx)} className="p-1 hover:bg-rose-50 text-rose-500 rounded"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {!(data.settings.dormitoryRooms?.length) && <p className="text-xs text-slate-400 text-center py-2">No standard dorm rooms defined.</p>}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'helpers' && (
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-8 animate-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">System Helpers & Guides</h3>
              <p className="text-xs text-slate-500 mt-1">Configure user onboarding and system-wide hotkeys.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keyboard Shortcuts */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                    <Monitor size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Keyboard Shortcuts</h4>
                </div>
                <p className="text-xs text-slate-500">View all available hotkeys to navigate the application faster.</p>
                
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('otec-show-shortcuts'));
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm"
                  >
                    View Shortcuts List
                  </button>
                </div>
              </div>

              {/* Onboarding Wizard */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <BookOpen size={16} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">System Onboarding</h4>
                </div>
                <p className="text-xs text-slate-500">Trigger the onboarding wizard to guide new users through the platform features.</p>
                
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('otec-start-onboarding'));
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm"
                  >
                    Start Onboarding Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
