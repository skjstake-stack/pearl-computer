import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserPlus,
  BookOpen,
  DollarSign,
  FileSpreadsheet,
  CalendarCheck,
  Upload,
  BellRing,
  Award,
  ShieldCheck,
  FileText,
  Lock,
  LogOut,
  QrCode,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Printer,
  Download,
  Clock,
  KeyRound,
  Eye,
  RefreshCw,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  MapPin,
  HardDrive,
  BarChart2,
  Share2,
  X,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import { UserSession, StudentAccount, Course, CenterPermissions } from '../types';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';

interface CenterPortalDashboardProps {
  currentUser: UserSession;
  onLogout: () => void;
}

export const CenterPortalDashboard: React.FC<CenterPortalDashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'admissions'
    | 'students'
    | 'login-creation'
    | 'enrollment'
    | 'attendance'
    | 'fees'
    | 'study-materials'
    | 'notices'
    | 'reports'
    | 'results'
    | 'certificates'
    | 'gallery'
    | 'settings'
  >('dashboard');

  const centerId = currentUser.centerId || currentUser.id || 'CTR-101';
  const centerCode = currentUser.centerCode || 'CTR-101';
  const centerName = currentUser.centerName || currentUser.name || 'Parasia Main Center';
  const permissions: CenterPermissions = currentUser.centerPermissions || {
    canStudentAdmissions: true,
    canStudentManagement: true,
    canStudentLoginCreation: true,
    canCourseEnrollment: true,
    canBatchAssignment: true,
    canAttendanceManagement: true,
    canFeeCollection: true,
    canFeeReceiptGeneration: true,
    canStudyMaterialUpload: true,
    canNotices: true,
    canGalleryView: true,
    canReportsView: true,
    canStudentResults: true,
    canCertificateVerification: true,
    canStudentIdCardGen: true,
  };

  // Center Data Stores
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [feeReceipts, setFeeReceipts] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [centerMetrics, setCenterMetrics] = useState<any>({
    admissionLimit: 500,
    usedAdmissionsCount: 142,
    storageLimitGb: 10,
    usedStorageMb: 1250,
    totalFeesCollected: 385000,
    pendingFeesTotal: 42000
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Student Admission Form Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    fatherName: '',
    mobile: '',
    email: '',
    course: 'DCA (Diploma in Computer Applications)',
    batch: 'Morning 08:00 AM - 10:00 AM',
    gender: 'Male',
    totalFees: 12000,
    paidFees: 4000
  });

  // Fee Collection Modal
  const [showFeeCollectModal, setShowFeeCollectModal] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState<StudentAccount | null>(null);
  const [feeCollectAmount, setFeeCollectAmount] = useState<number>(2000);
  const [paymentMode, setPaymentMode] = useState<string>('UPI / QR Code');
  const [receiptNote, setReceiptNote] = useState<string>('Installment Fee Payment');

  // Change Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ID Card Modal
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<StudentAccount | null>(null);

  // Print Receipt State
  const [printedReceiptData, setPrintedReceiptData] = useState<any | null>(null);

  // Fetch Center Data
  const fetchCenterData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, dashRes, crsRes, feeRes] = await Promise.all([
        fetch('/api/center/students', { headers: { 'x-center-id': centerId } }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/center/dashboard', { headers: { 'x-center-id': centerId } }).then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/courses').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/center/fees', { headers: { 'x-center-id': centerId } }).then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (stuRes && stuRes.success) setStudents(stuRes.students || []);
      if (dashRes && dashRes.success) {
        setCenterMetrics(dashRes.metrics || centerMetrics);
        setAdmissions(dashRes.admissions || []);
        setNotices(dashRes.notices || []);
      }
      if (crsRes && crsRes.success) setCourses(crsRes.courses || []);
      if (feeRes && feeRes.success) setFeeReceipts(feeRes.receipts || []);
    } catch (err) {
      console.error('Error loading center portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCenterData();
  }, [centerId]);

  // Handle Create Student Admission
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.name || !newStudentData.mobile) {
      setStatusMsg({ type: 'error', text: 'Please provide student name and mobile number.' });
      return;
    }

    try {
      const res = await fetch('/api/center/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-center-id': centerId
        },
        body: JSON.stringify(newStudentData)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Student ${data.student?.name} admitted successfully! Login credentials generated.` });
        setShowAddStudentModal(false);
        fetchCenterData();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to admit student.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error admitting student.' });
    }
  };

  // Handle Fee Payment Collection
  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForFee || feeCollectAmount <= 0) return;

    try {
      const res = await fetch('/api/center/fees/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-center-id': centerId
        },
        body: JSON.stringify({
          studentId: selectedStudentForFee.studentId,
          amount: feeCollectAmount,
          paymentMode,
          receiptNote
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Fee receipt #${data.receipt?.receiptNumber} generated successfully!` });
        setPrintedReceiptData(data.receipt);
        setShowFeeCollectModal(false);
        fetchCenterData();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Fee collection failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error processing fee payment.' });
    }
  };

  // Generate Receipt PDF
  const handleDownloadReceiptPdf = (receipt: any) => {
    const doc = new jsPDF();
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(10, 10, 190, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PEARL COMPUTER & TARGET ACADEMY', 15, 24);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`AUTHORIZED CENTER: ${centerName} (${centerCode})`, 15, 32);

    // Receipt details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL FEE PAYMENT RECEIPT', 15, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt No: ${receipt.receiptNumber}`, 15, 68);
    doc.text(`Date: ${receipt.date}`, 140, 68);

    doc.line(15, 72, 195, 72);

    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${receipt.studentName}`, 15, 82);
    doc.text(`Student ID: ${receipt.studentId}`, 15, 90);
    doc.text(`Course: ${receipt.course}`, 15, 98);
    doc.text(`Payment Mode: ${receipt.paymentMode}`, 15, 106);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Amount Paid: Rs. ${receipt.amountPaid}/-`, 15, 120);
    doc.text(`Remaining Pending Fee: Rs. ${receipt.remainingPending}/-`, 15, 128);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated fee receipt issued by Pearl Academy Authorized Center.', 15, 155);

    doc.save(`Fee_Receipt_${receipt.receiptNumber}.pdf`);
  };

  // Change Center Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await fetch('/api/center/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-center-id': centerId
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error updating password.' });
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md border border-blue-400/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded border border-blue-400/30">
                    {centerCode}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded border border-emerald-400/30">
                    Authorized Center Portal
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-white">{centerName}</h1>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={onLogout}
                className="p-2 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 text-xs font-bold flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quota Progress Indicators */}
          <div className="hidden lg:flex items-center gap-6 text-xs">
            {/* Student Quota */}
            <div className="space-y-1 w-44">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-300">Student Admission Quota</span>
                <span className="text-orange-400 font-mono">
                  {students.length} / {centerMetrics.admissionLimit}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (students.length / centerMetrics.admissionLimit) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Cloud Storage */}
            <div className="space-y-1 w-36">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-300">Cloud Storage</span>
                <span className="text-emerald-400 font-mono">{centerMetrics.storageLimitGb} GB</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (centerMetrics.usedStorageMb / (centerMetrics.storageLimitGb * 1024)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Security Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Center Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/80 dark:text-red-200 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{statusMsg.text}</span>
            </div>
            <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {permissions.canStudentAdmissions && (
            <button
              onClick={() => setActiveTab('admissions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'admissions'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Student Admissions</span>
            </button>
          )}

          {permissions.canStudentManagement && (
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Center Students ({students.length})</span>
            </button>
          )}

          {permissions.canStudentLoginCreation && (
            <button
              onClick={() => setActiveTab('login-creation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'login-creation'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Student Logins</span>
            </button>
          )}

          {permissions.canFeeCollection && (
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'fees'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Fee Receipts & Collections</span>
            </button>
          )}

          {permissions.canAttendanceManagement && (
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Daily Attendance</span>
            </button>
          )}

          {permissions.canStudyMaterialUpload && (
            <button
              onClick={() => setActiveTab('study-materials')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'study-materials'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Study Notes & PDFs</span>
            </button>
          )}

          {permissions.canNotices && (
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'notices'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Center Notices</span>
            </button>
          )}

          {permissions.canReportsView && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Center Reports</span>
            </button>
          )}

          {permissions.canStudentResults && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Results & Certs</span>
            </button>
          )}
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total Enrolled Students</span>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{students.length}</span>
                  <span className="text-xs text-emerald-600 font-bold">Center Enrolled</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">New Admissions</span>
                  <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
                    <UserPlus className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{admissions.length}</span>
                  <span className="text-xs text-purple-600 font-bold">Applications</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Fees Collected</span>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    Rs. {centerMetrics.totalFeesCollected?.toLocaleString() || '3,85,000'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Fee Installments</span>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">
                    Rs. {centerMetrics.pendingFeesTotal?.toLocaleString() || '42,000'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Quick Center Administrative Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="p-4 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-2xl border border-blue-200 dark:border-blue-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <UserPlus className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs font-bold">New Student Admission</span>
                </button>

                <button
                  onClick={() => setActiveTab('fees')}
                  className="p-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold">Collect Fee Payment</span>
                </button>

                <button
                  onClick={() => setActiveTab('attendance')}
                  className="p-4 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-2xl border border-purple-200 dark:border-purple-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs font-bold">Mark Attendance</span>
                </button>

                <button
                  onClick={() => setActiveTab('study-materials')}
                  className="p-4 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-xs font-bold">Upload Study PDF</span>
                </button>

                <button
                  onClick={() => setActiveTab('notices')}
                  className="p-4 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded-2xl border border-rose-200 dark:border-rose-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <BellRing className="w-5 h-5 text-rose-600 mb-1" />
                  <span className="text-xs font-bold">Publish Notice</span>
                </button>

                <button
                  onClick={() => setActiveTab('results')}
                  className="p-4 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-center space-y-1 transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <Award className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold">Verify Certificates</span>
                </button>
              </div>
            </div>

            {/* Recent Center Activity & Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Admissions */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    Recent Admissions at {centerName}
                  </h3>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2">
                  {students.slice(0, 5).map((stu) => (
                    <div
                      key={stu.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={stu.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{stu.studentId} • {stu.course}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedStudentForIdCard(stu)}
                        className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <QrCode className="w-3 h-3" /> ID Card
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Head Announcements */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-orange-500" />
                    Head Office Notices & Updates
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-amber-800 dark:text-amber-300 font-bold">
                      <span>DCA & ADCA Final Semester Exam Dates</span>
                      <span>2026-08-15</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200">
                      All center heads are requested to complete internal practical marks submission by 10th August.
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-blue-800 dark:text-blue-300 font-bold">
                      <span>New Course Launch: Fullstack Web Dev</span>
                      <span>2026-08-01</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200">
                      Center syllabus and promotional banners for Fullstack Web Dev are now available in study material section.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT ADMISSIONS */}
        {activeTab === 'admissions' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Student Admission Management - {centerName}
                </h2>
                <p className="text-xs text-slate-500">
                  Admit new students directly or process pending online admission requests.
                </p>
              </div>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Direct Admission Entry</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">
                Center Quota Usage: {students.length} / {centerMetrics.admissionLimit} Students
              </span>
              <span className="text-emerald-600">
                {centerMetrics.admissionLimit - students.length} Admissions Remaining
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pending Online Admission Applications</h3>
              {admissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No pending admission applications for this center.</p>
              ) : (
                admissions.map((app, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{app.studentName}</p>
                      <p className="text-[10px] text-slate-500">Course: {app.courseName} • Mobile: +91 {app.mobileNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                        {app.status || 'Pending Review'}
                      </span>
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]">
                        Approve Admission
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CENTER STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Enrolled Students ({students.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Data Isolated List: Displaying only students belonging to {centerName}.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name, ID, course..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Student ID & Name</th>
                    <th className="py-3 px-4">Course & Batch</th>
                    <th className="py-3 px-4">Mobile & Email</th>
                    <th className="py-3 px-4">Fee Summary</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold">
                        <div>
                          <span className="text-blue-600 font-mono text-[10px] block">{s.studentId}</span>
                          <span className="text-slate-900 dark:text-white">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span>{s.course}</span>
                          <span className="text-[10px] text-slate-400 block">{s.batch}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        +91 {s.mobile}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-emerald-600">Rs. {s.paidFees} Paid</span>
                        <span className="text-[10px] text-slate-400 block">Total: Rs. {s.totalFees}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudentForFee(s);
                              setShowFeeCollectModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-lg text-[10px]"
                          >
                            Collect Fee
                          </button>
                          <button
                            onClick={() => setSelectedStudentForIdCard(s)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-[10px]"
                          >
                            ID Card
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT LOGINS */}
        {activeTab === 'login-creation' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-purple-600" />
              Student Login Creation & Password Reset
            </h2>
            <p className="text-xs text-slate-500">
              Manage student portal login credentials for enrolled students at {centerName}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((stu) => (
                <div key={stu.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{stu.name}</span>
                    <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                      {stu.studentId}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Username: {stu.username || stu.studentId}</p>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => alert(`Temporary password for ${stu.name}: Pass@2026#${stu.name.split(' ')[0]}`)}
                      className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      Reset Student Password
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: FEE RECEIPTS */}
        {activeTab === 'fees' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Fee Collections & Receipts</h2>
                <p className="text-xs text-slate-500">Record payments & issue digital fee receipts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {feeReceipts.map((r, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-mono font-bold text-blue-600">{r.receiptNumber}</td>
                      <td className="p-3 font-bold">{r.studentName}</td>
                      <td className="p-3 text-slate-500">{r.date}</td>
                      <td className="p-3 font-bold text-emerald-600">Rs. {r.amountPaid}</td>
                      <td className="p-3">{r.paymentMode}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDownloadReceiptPdf(r)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-[10px] flex items-center gap-1 inline-flex"
                        >
                          <Download className="w-3 h-3" /> Receipt PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Batch Attendance Tracker</h2>
            <p className="text-xs text-slate-500">Mark student attendance for daily morning, afternoon & evening batches.</p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <select className="p-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold">
                  <option>Morning 08:00 AM - 10:00 AM</option>
                  <option>Evening 05:00 PM - 07:00 PM</option>
                </select>
                <input type="date" defaultValue="2026-08-02" className="p-2 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold" />
              </div>

              <div className="space-y-2 pt-2">
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold">
                    <span>{s.name} ({s.studentId})</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px]">Present</button>
                      <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px]">Absent</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: STUDY MATERIALS */}
        {activeTab === 'study-materials' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Study Notes & Syllabus Guides</h2>
                <p className="text-xs text-slate-500">Upload PDF materials for center students.</p>
              </div>

              <button
                onClick={() => alert('PDF upload simulation complete. Material uploaded to center storage.')}
                className="px-4 py-2 bg-amber-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" /> Upload Study PDF
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">DCA Semester-1 Operating Systems Notes.pdf</p>
                <p className="text-[10px] text-slate-500">Size: 4.2 MB • Updated: Aug 2026</p>
                <button className="text-blue-600 font-bold text-[10px]">Download Material ↓</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: NOTICES */}
        {activeTab === 'notices' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Center Student Notice Board</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-xs">
              <input type="text" placeholder="Notice Title" className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl" />
              <textarea placeholder="Notice Description..." rows={3} className="w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl" />
              <button
                onClick={() => setStatusMsg({ type: 'success', text: 'Notice published to center students successfully!' })}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
              >
                Publish Notice
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Center Financial & Academic Reports</h2>
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 text-xs font-bold">
              <p>Total Revenue Collected: Rs. {centerMetrics.totalFeesCollected?.toLocaleString()}</p>
              <p>Total Active Enrolled Students: {students.length}</p>
              <button
                onClick={() => alert('Generating Consolidated Center Report PDF...')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
              >
                Export Center Report PDF
              </button>
            </div>
          </div>
        )}

        {/* TAB 10: RESULTS */}
        {activeTab === 'results' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Student Exam Results & Certificate Verification</h2>
            <p className="text-xs text-slate-500">Verify DCA, ADCA & Tally Prime certificates issued at {centerName}.</p>
          </div>
        )}
      </div>

      {/* NEW STUDENT ADMISSION MODAL */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Direct Student Admission ({centerName})</h3>
              <button onClick={() => setShowAddStudentModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Father Name</label>
                <input
                  type="text"
                  value={newStudentData.fatherName}
                  onChange={(e) => setNewStudentData({ ...newStudentData, fatherName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  value={newStudentData.mobile}
                  onChange={(e) => setNewStudentData({ ...newStudentData, mobile: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Course</label>
                <select
                  value={newStudentData.course}
                  onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option>DCA (Diploma in Computer Applications)</option>
                  <option>ADCA (Advance Diploma in Computer Applications)</option>
                  <option>Tally Prime with GST</option>
                  <option>CPCT Preparation Batch</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl">
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEE COLLECT MODAL */}
      {showFeeCollectModal && selectedStudentForFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Collect Fee Payment</h3>
              <button onClick={() => setShowFeeCollectModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCollectFee} className="space-y-3">
              <p className="font-bold text-slate-900 dark:text-white">
                Student: {selectedStudentForFee.name} ({selectedStudentForFee.studentId})
              </p>

              <div>
                <label className="font-bold block mb-1">Payment Amount (Rs.) *</label>
                <input
                  type="number"
                  value={feeCollectAmount}
                  onChange={(e) => setFeeCollectAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  <option>UPI / QR Code</option>
                  <option>Cash at Counter</option>
                  <option>Net Banking</option>
                  <option>Cheque / DD</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFeeCollectModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl">
                  Collect Fee & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID CARD MODAL */}
      {selectedStudentForIdCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Student ID Card - {selectedStudentForIdCard.name}</h3>
              <button onClick={() => setSelectedStudentForIdCard(null)}><X className="w-5 h-5" /></button>
            </div>

            <DigitalIdCardGenerator student={selectedStudentForIdCard} />
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Change Center Account Password</h3>
              <button onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Current Password *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-extrabold rounded-xl">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
