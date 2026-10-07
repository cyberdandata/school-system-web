export type Sex = 'Male' | 'Female' | 'Unknown';

export interface Learner {
  id: string;
  name: string;
  admNo: string;
  sex: Sex;
  age: string;
  cls: string;
  paycode?: string;
  lin?: string;
  unebUln?: string;
  photo?: string;
  archived?: boolean;
  // Additional Excel Fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  studentAccount?: string;
  studentPhone?: string;
  active?: string;
  studentEmail?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  pickupPhone?: string;
  pickupVehiclePlate?: string;
  outstandingBalance?: string;
  dayBoarding?: string;
  suiteCode?: string;
  unebNo?: string;
  // Individual learner fee components
  feeTuition?: number;
  feeBoarding?: number;
  feeVan?: number;
  feeRegistration?: number;
  feeSweater?: number;
  feeClassUniform?: number;
  feeSportsWear?: number;
  feeHair?: number;
  feeHoliday?: number;
  feeOthers?: number;
}

export interface Subject {
  name: string;
  max: number;
}

export interface GradingBand {
  min: number;
  max: number;
  grade: string;
  remark: string;
  classComments: string[];
  headComments: string[];
}

export interface SectionConfig {
  subjects: Subject[];
  grading: GradingBand[];
}

export interface ExamSet {
  id: string;
  label: string;
  term: string; // 'Term 1' | 'Term 2' | 'Term 3'
  period: 'BOT' | 'MOT' | 'EOT';
  setNo: number;
  classes: string[];
}

export interface ClassTeacher {
  name: string;
  initials: string;
}

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  phone?: string;
  email?: string;
  specialization?: string;
  // HR Fields
  dateOfBirth?: string;
  dateOfJoining?: string;
  contractEndDate?: string;
  baseSalary?: number;
  tinNumber?: string;
  nssfNumber?: string;
  status?: 'Active' | 'On Leave' | 'Terminated';
  // Additional Staff Details
  sex?: 'Male' | 'Female';
  nin?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  residence?: string;
  assignedVehicle?: string;
}

export interface NonTeachingStaff {
  id: string;
  name: string;
  department: string;
  role?: string;
  phone?: string;
  photo?: string;
  // HR Fields
  dateOfBirth?: string;
  dateOfJoining?: string;
  contractEndDate?: string;
  baseSalary?: number;
  tinNumber?: string;
  nssfNumber?: string;
  status?: 'Active' | 'On Leave' | 'Terminated';
  // Additional Staff Details
  sex?: 'Male' | 'Female';
  nin?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  residence?: string;
  assignedVehicle?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffType: 'teacher' | 'non-teaching';
  month: string; // 'YYYY-MM'
  baseSalary: number;
  allowances: number;
  grossPay: number;
  paye: number;
  nssfEmployee: number;
  nssfEmployer: number;
  netPay: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
  financeTransactionId?: string; // Links this payslip to a Finance Ledger entry
}

export interface TeacherAppraisalMetrics {
  classroomEnvironment: number;
  learnersBook: number;
  useOfBlackboard: number;
  handwriting: number;
  classroomControl: number;
  rules: number;
  recordOfWork: number;
  schemeOfWork: number;
  attendanceRecord: number;
}

export interface AppraisalRecord {
  id: string;
  staffId: string;
  staffType: 'teacher' | 'non-teaching';
  date: string;
  evaluator: string;
  score: number; // e.g. out of 100
  comments: string;
  recommendations?: string;
  department?: string;
  metrics?: TeacherAppraisalMetrics;
  pendingAIGeneration?: boolean;
}

export interface HRData {
  payroll: PayrollRecord[];
  appraisals: AppraisalRecord[];
}

export interface PLEOverrideConfig {
  enabled: boolean;
  englishMinGradeForDiv1: number; // e.g. 6 (C6) - index-based where D1=1, D2=2, C3=3, C4=4, C5=5, C6=6, P7=7, P8=8, F9=9
  mathMinGradeForDiv1: number;    // e.g. 6 (C6)
  englishMinGradeForDiv2: number; // e.g. 8 (P8)
  mathMinGradeForDiv2: number;    // e.g. 8 (P8)
  requireAllCoreSubjects: boolean; // Must have all 4 core subjects to get any division
}

export interface ReportCardVisibility {
  showTeacherComments: boolean;
  showPsychomotor: boolean;
  showRankingTable: boolean;
  showDivision: boolean;
  showStudentPhoto?: boolean;
  showGradingScale?: boolean;
  showSchoolLogo?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  type: 'event' | 'deadline' | 'holiday';
  description?: string;
}

export type SystemRole = 'superuser' | 'accountant' | 'security' | 'teacher';

export interface SystemUserAccount {
  id: string;
  username: string; // 'admin', 'accountant', 'security', 'teacher' or custom
  name: string;
  role: SystemRole;
  pinOrPassword: string;
  active: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginTime?: string;
  assignedTeacherName?: string;
}

export interface AuthAccessConfig {
  requireLoginOnStartup: boolean;
  users: SystemUserAccount[];
}

export interface SchoolSettings {
  schoolName: string;
  shortName: string;
  motto: string;
  address: string;
  tel1: string;
  tel2: string;
  logo: string; // base64
  term: string; // 'Term 1' | 'Term 2' | 'Term 3'
  year: number;
  termStartDate?: string;
  termEndDate?: string;
  nextTermBegins?: string;
  headTeacherName: string;
  headTeacherInitials: string;
  nurseryReportTemplate?: number;
  primaryReportTemplate?: number;
  psychomotor: string[];
  libraryBooks?: string[];
  dormitoryRooms?: string[];
  sections: {
    preprimary: SectionConfig;
    lower: SectionConfig;
    upper: SectionConfig;
  };
  examSets: ExamSet[];
  classTeachers: { [className: string]: ClassTeacher };
  pleOverride: PLEOverrideConfig;
  teachersList?: Teacher[];
  nonTeachingStaffList?: NonTeachingStaff[];
  reportCardVisibility?: ReportCardVisibility;
  calendarEvents?: CalendarEvent[];
  ledgerDayFees?: number;
  ledgerBoardingFees?: number;
  ledgerAutoDeduct?: boolean;
  ledgerCurrency?: string;
  // School-level default fees configurations
  feeTuitionLower?: number;
  feeTuitionNursery?: number;
  feeTuitionUpper?: number;
  feeBoarding?: number;
  feeVanMin?: number;
  feeVanMax?: number;
  feeRegistration?: number;
  feeSweater?: number;
  feeClassUniform?: number;
  feeSportsWear?: number;
  feeHair?: number;
  feeHoliday?: number;
  feeOthers?: number;
  // User Access & Auth Configuration
  authConfig?: AuthAccessConfig;
  // Shared Module Resources
  financeCategories?: { id: string; name: string; type: 'income' | 'expense'; color: string }[];
  hrDepartments?: string[];
  transportRoutes?: { id: string; name: string; distance?: string; standardCost?: number }[];
  hostelBlocks?: { id: string; name: string; capacity?: number }[];
  libraryCategories?: string[];
  disciplineOffenses?: { id: string; name: string; type: 'Merit' | 'Demerit'; defaultPoints?: number }[];
  assetLocations?: string[];
  clinicMedicines?: string[];
  geminiApiKey?: string;
}

export interface ScoreRecord {
  [subjectName: string]: number | string; // subject name -> mark out of max OR AI comment for preprimary
}

export interface PsychomotorRecord {
  [skillName: string]: number; // skill -> rating (1-5)
}

export interface CommentRecord {
  teacher: string;
  head: string;
  teacherInitials: string;
  headInitials: string;
  nextTermBegins?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'report_printed' | 'data_imported' | 'settings_modified' | 'scores_recorded' | 'student_created' | 'reset_defaults' | 'finance_modified' | 'gate_accessed' | 'visitor_registered' | 'security_alarm';
  details: string;
  operator: string;
}

export type SecurityPersonType = 'Student' | 'Teacher' | 'Non-Teaching Staff' | 'Visitor' | 'Unknown' | 'Parent/Guardian';
export type SecurityGateStatus = 'Locked' | 'Unlocked' | 'Emergency_Open' | 'Emergency_Lock';

export interface GateLogEntry {
  id: string;
  timestamp: string; // ISO string
  personType: SecurityPersonType;
  personName: string;
  personId?: string; // Student ID, Teacher ID, or Visitor ID
  classOrDepartment?: string;
  photoUrl?: string;
  verificationMethod: 'Face Recognition' | 'Fingerprint (ZKTeco)' | 'RFID Card' | 'QR Code' | 'Manual Guard Approval' | 'Unrecognized' | 'WhatsApp OTP';
  gateUsed: string; // e.g. "Main Gate - Gate A"
  direction: 'Entry' | 'Exit' | 'Pickup';
  status: 'Present' | 'Late' | 'Left' | 'Approved' | 'Overdue' | 'Alarm_Triggered' | 'Picked_Up';
  notes?: string;
  parentNotified?: boolean;
  workHoursLogged?: number;
  temperatureCelsius?: number;
  livenessConfidence?: number; // e.g. 98.5
  pickedUpStudentId?: string; // Link to the student being picked up
  pickedUpStudentName?: string;
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  phone: string;
  whatsappVerified?: boolean;
  nationalId: string;
  company?: string;
  purpose: string;
  reasonForVisit?: string;
  hostTeacherName: string;
  hostId?: string;
  vehicleNumber?: string;
  vehicleNumberPlate?: string; // Explicitly tracking number plates
  badgeNumber: string;
  qrCode: string;
  photoUrl?: string;
  arrivalTime: string;
  expectedDepartureTime: string; // ISO or HH:MM
  actualDepartureTime?: string;
  status: 'Inside School' | 'Exited' | 'Overdue';
  durationMinutes?: number;
  approvedByGuard: string;
}

export interface UnknownPersonAlert {
  id: string;
  timestamp: string;
  gateUsed: string;
  snapshotUrl?: string;
  alarmActive: boolean;
  reason: 'Unrecognized Face & Fingerprint' | 'Anti-Spoofing Failure' | 'Tailgating Detected' | 'Forced Entry Attempt';
  status: 'Active Alarm' | 'Resolved' | 'Investigating';
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  loggedBy: string;
  notes?: string;
}

export interface SecurityGateSystemConfig {
  gateState: SecurityGateStatus;
  autoOpenForStudents: boolean;
  autoOpenForTeachers: boolean;
  notifyParentsOnEntry: boolean;
  notifyParentsOnExit: boolean;
  livenessDetectionEnabled: boolean;
  antiSpoofingEnabled: boolean;
  tailgatingAlarmEnabled: boolean;
  hikvisionCamConnected: boolean;
  zktecoScannerConnected: boolean;
  relayControllerOnline: boolean;
  activeGateName: string;
  anranCameraIp?: string;
  fingerprintScannerIp?: string;
  anranNvrConfig?: {
    ip: string;
    cloudId?: string;
    webPort: string;
    rtspPort: string;
    username: string;
    password?: string;
    channels: number;
  };
}

export interface SecurityData {
  gateLogs: GateLogEntry[];
  visitors: VisitorRecord[];
  unknownAlerts: UnknownPersonAlert[];
  config: SecurityGateSystemConfig;
}

export interface BankAccount {
  id: string;
  name: string; // e.g., "Centenary Bank - Main", "School Cash Box"
  accountNumber: string;
  bankName: string;
  initialBalance: number;
}

export interface BankTransfer {
  id: string;
  date: string; // 'YYYY-MM-DD'
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reference: string;
  recordedBy: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string; // e.g., 'Food Supplies', 'Stationery', 'Maintenance'
  balanceOwed: number; // Positive means we owe them
  status?: 'Active' | 'Inactive';
}

export interface VendorInvoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  date: string; // 'YYYY-MM-DD'
  dueDate: string; // 'YYYY-MM-DD'
  amount: number;
  amountPaid: number;
  status: 'Unpaid' | 'Partial' | 'Paid';
  description: string;
}

export interface PettyCashRequisition {
  id: string;
  staffId: string;
  staffName: string;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  category: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  financeTransactionId?: string; // Linked when approved
}

export interface FinanceTransaction {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: 'income' | 'expense' | 'refund';
  category: string; // 'Tuition Fees', 'Boarding Fees', 'Uniforms', 'Stationery', 'Teacher Salaries', 'Food & Meals', 'Maintenance', 'Utilities', 'Other'
  amount: number;
  studentId?: string; // Optional linked student for fee payments
  description: string;
  recordedBy: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  paymentMode?: string;
  receiptNo?: string;
  title?: string;
  payerOrPayee?: string;
  term?: string; // 'Term 1' | 'Term 2' | 'Term 3'
  bankAccountId?: string; // Links transaction to a specific bank account or cash box
}

export interface TransportVan {
  id: string;
  plateNumber: string;
  capacity: number;
  assignedDriverId?: string; // Links to NonTeachingStaff
  status: 'Active' | 'In Maintenance' | 'Out of Service';
  makeAndModel?: string;
}

export interface FuelLog {
  id: string;
  date: string; // ISO
  vanId: string;
  liters: number;
  cost: number;
  currentMileage: number;
  receiptUrl?: string;
  recordedBy: string;
}

export interface MaintenanceLog {
  id: string;
  date: string; // ISO
  vanId: string;
  serviceType: 'Routine' | 'Repair' | 'Inspection' | 'Tires' | 'Other';
  description: string;
  cost: number;
  nextServiceDate?: string;
  recordedBy: string;
}

export interface TransportData {
  routes: any[];
  allocations: any[];
  vans: TransportVan[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
}
export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  addedBy: string;
}

export interface LibraryIssue {
  id: string;
  bookId: string;
  borrowerId: string; // ID of learner or teacher
  borrowerType: 'Learner' | 'Teacher' | 'Non-Teaching Staff';
  borrowerName: string; // snapshot for easy display
  issueDate: string; // ISO
  dueDate: string; // ISO
  returnDate?: string; // ISO, if returned
  status: 'Issued' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

export interface LibraryData {
  books: LibraryBook[];
  issues: LibraryIssue[];
}

export interface InventoryAsset {
  id: string;
  name: string;
  category: 'Furniture' | 'Electronics' | 'Lab Equipment' | 'Stationery' | 'Sports' | 'Other';
  quantity: number;
  condition: 'New' | 'Good' | 'Fair' | 'Poor' | 'Broken';
  location: string; // e.g., 'Main Lab', 'Store Room B'
  assignedTo?: string; // ID of staff member, if applicable
  purchaseDate?: string;
  cost?: number;
  lastUpdated: string;
}

export interface InventoryData {
  assets: InventoryAsset[];
}
export interface HostelRoom {
  id: string;
  name: string; // e.g., 'Room 1', 'Room 2'
  capacity: number;
}

export interface HostelDormitory {
  id: string;
  name: string; // e.g., 'Mandela House'
  gender: 'Boys' | 'Girls' | 'Mixed';
  rooms: HostelRoom[];
  wardenId?: string; // Links to staff
}

export interface HostelAllocation {
  id: string;
  dormitoryId: string;
  bedNumber?: string;
  roomId: string;
  learnerId: string;
  allocatedDate: string;
}

export interface HostelData {
  dormitories: HostelDormitory[];
  allocations: HostelAllocation[];
}

export interface TimetableSlot {
  id: string;
  classId: string;
  stream?: string;
  gender?: string; // the specific class, e.g. 'P1', 'Senior 1'
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectId: string;
  teacherId: string;
  roomId?: string; // Optional physical room
}

export interface TimetableData {
  slots: TimetableSlot[];
}
export interface ClinicRecord {
  learnerId: string;
  bloodGroup?: string;
  allergies: string;
  chronicConditions: string;
  emergencyContact: string;
}

export interface ClinicVisit {
  id: string;
  learnerId: string;
  date: string; // ISO
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medicinePrescribed?: string;
  nurseName: string;
}

export interface ClinicData {
  records: { [learnerId: string]: ClinicRecord };
  visits: ClinicVisit[];
}

export interface DisciplineIncident {
  id: string;
  learnerId: string;
  date: string; // ISO
  type: 'Merit' | 'Demerit';
  points: number;
  description: string;
  actionTaken: string;
  reportedBy: string; // Staff ID
}

export interface DisciplineData {
  incidents: DisciplineIncident[];
}

export interface Club {
  id: string;
  name: string;
  description: string;
  patronId: string; // Staff ID
  meetingDay: string;
  meetingTime: string;
}

export interface ClubMembership {
  id: string;
  clubId: string;
  learnerId: string;
  role: 'Member' | 'President' | 'Secretary' | 'Treasurer' | 'Captain';
  joinedDate: string;
}

export interface ExtracurricularData {
  clubs: Club[];
  memberships: ClubMembership[];
}

export interface AdmissionRecord {
  id: string;
  applicantName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'Male' | 'Female';
  targetClass: string;
  previousSchool?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  applicationDate: string; // ISO
  entranceExamScore?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Enrolled';
  notes?: string;
}

export interface AdmissionsData {
  applicants: AdmissionRecord[];
}

export interface ProcurementRequest {
  id: string;
  itemName: string;
  quantity: number;
  estimatedCost: number;
  requestedBy: string; // Staff name or ID
  department: string;
  role?: string;
  requestDate: string; // ISO
  status: 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';
  approvedBy?: string;
  notes?: string;
  fulfilledDate?: string;
}

export interface ProcurementData {
  requests: ProcurementRequest[];
}

export interface CommunicationMessage {
  id: string;
  type: 'SMS' | 'Email';
  recipientId: string; // Learner ID, Staff ID, or Group (e.g., 'ALL_PARENTS')
  recipientName: string;
  recipientContact: string; // Phone or Email address
  body: string;
  sentAt: string; // ISO date
  status: 'Sent' | 'Delivered' | 'Failed';
  sentBy: string; // Admin name
}

export interface CommunicationsData {
  messages: CommunicationMessage[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: 'Finance' | 'Academics' | 'HR' | 'Security' | 'System' | 'Hostel' | 'Transport' | 'Library' | 'Inventory' | 'Admissions' | 'Communications' | 'Procurement';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  recordId: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffType: 'teacher' | 'non-teaching';
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Late' | 'Absent';
  timeRecorded?: string; // HH:mm AM/PM
  notes?: string;
}

export interface AppData {
  learners: Learner[];
  scores: { [compositeKey: string]: ScoreRecord }; // "learnerId|examSetId" -> ScoreRecord
  psychomotor: { [compositeKey: string]: PsychomotorRecord }; // "learnerId|examSetId" -> PsychomotorRecord
  comments: { [compositeKey: string]: CommentRecord }; // "learnerId|examSetId" -> CommentRecord
  settings: SchoolSettings;
  activityLog?: ActivityLog[];
  auditLogs?: AuditLog[];
  finances?: FinanceTransaction[];
  security?: SecurityData;
  transport?: TransportData;
  library?: LibraryData;
  inventory?: InventoryData;
  hostel?: HostelData;
  timetable?: TimetableData;
  clinic?: ClinicData;
  discipline?: DisciplineData;
  extracurricular?: ExtracurricularData;
  hr?: HRData;
  admissions?: AdmissionsData;
  procurement?: ProcurementData;
  communications?: CommunicationsData;
  bankAccounts?: BankAccount[];
  bankTransfers?: BankTransfer[];
  vendors?: Vendor[];
  vendorInvoices?: VendorInvoice[];
  requisitions?: PettyCashRequisition[];
  staffAttendance?: StaffAttendanceRecord[];
}
