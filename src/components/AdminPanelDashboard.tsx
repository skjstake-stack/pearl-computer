import React, { useState, useEffect } from 'react';
import { FacultyManagementModule } from './FacultyManagementModule';
import { StudentManagementModule } from './StudentManagementModule';
import { AdminGalleryModule } from './AdminGalleryModule';
import { AdminCourseModule } from './AdminCourseModule';
import { AdminCenterManagementModule } from './AdminCenterManagementModule';
import { AdminManagingDirectorModule } from './AdminManagingDirectorModule';
import { AdminEventsModule } from './AdminEventsModule';
import {
  ShieldAlert,
  Building2,
  Users,
  UserCheck,
  FileText,
  Mail,
  Settings,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Plus,
  KeyRound,
  Search,
  Filter,
  BarChart3,
  LogOut,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
  QrCode,
  Trash2,
  Send,
  MessageSquare,
  FileSpreadsheet,
  Eye,
  Share2,
  ImageIcon,
  BookOpen,
  Compass,
  Flame
} from 'lucide-react';
import jsPDF from 'jspdf';
import { AdmissionApplication, StudentAccount, FacultyAccount, EmailSettings, AuditLog, UserSession } from '../types';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';
import { AdminIdCardModule } from './AdminIdCardModule';

interface AdminPanelDashboardProps {
  currentUser?: UserSession | null;
  onLogout: () => void;
}

export const AdminPanelDashboard: React.FC<AdminPanelDashboardProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'courses' | 'admissions' | 'students' | 'faculty' | 'centers' | 'idcard' | 'emailSettings' | 'auditLogs' | 'gallery' | 'managingDirector' | 'events'>('courses');

  // Server Data Stores
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [faculty, setFaculty] = useState<FacultyAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'admissions@pearlacademy.edu.in',
    senderName: 'Pearl Computer & Target Academy',
    replyToEmail: 'info@pearlacademy.edu.in',
    instituteNotificationEmail: 'bisan9329284693@gmail.com',
    autoEmailNotification: true,
    autoSmsNotification: true,
    autoWhatsappNotification: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Modals for Admission Management
  const [selectedAppModal, setSelectedAppModal] = useState<AdmissionApplication | null>(null);
  const [emailModalApp, setEmailModalApp] = useState<AdmissionApplication | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const [whatsAppModalApp, setWhatsAppModalApp] = useState<AdmissionApplication | null>(null);
  const [whatsAppText, setWhatsAppText] = useState('');

  const [remarksModalApp, setRemarksModalApp] = useState<AdmissionApplication | null>(null);
  const [remarksText, setRemarksText] = useState('');

  // New Faculty Modal Form State
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [newFacData, setNewFacData] = useState({
    name: '',
    designation: 'Assistant Professor',
    department: 'Computer Applications',
    mobile: '',
    email: '',
    username: '',
    branch: 'Main Branch - Tower Square',
    subjects: 'DCA, Tally Prime',
    coursesAssigned: 'DCA (Diploma in Computer Applications)'
  });

  // Safe helper to fetch and parse JSON without crashing on non-JSON/HTML responses
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return { success: false };
      const ct = res.headers.get('content-type');
      if (ct && ct.includes('application/json')) {
        return await res.json();
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  };

  // Fetch Admin Data from Express Server API
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [appRes, stuRes, facRes, emailRes, logRes] = await Promise.all([
        safeFetchJson('/api/admin/admissions'),
        safeFetchJson('/api/students'),
        safeFetchJson('/api/faculty'),
        safeFetchJson('/api/settings/email'),
        safeFetchJson('/api/admin/audit-logs')
      ]);

      if (appRes && appRes.success) setApplications(appRes.applications);
      if (stuRes && stuRes.success) setStudents(stuRes.students);
      if (facRes && facRes.success) setFaculty(facRes.faculty);
      if (emailRes && emailRes.success) setEmailSettings(emailRes.settings);
      if (logRes && logRes.success) setAuditLogs(logRes.logs);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle Admission Status Change (Approve/Reject)
  const handleUpdateAdmissionStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/admission/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status,
          remarks: `Status updated by Admin to ${status.toUpperCase()}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.message);
        fetchAdminData(); // Refresh list
        setTimeout(() => setActionSuccessMsg(''), 5000);
      }
    } catch (err) {
      alert('Error updating admission status.');
    }
  };

  // Delete Admission Application
  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to permanently delete this admission application?')) return;
    try {
      const res = await fetch(`/api/admin/admission/${applicationId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.message);
        fetchAdminData();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to delete application.');
    }
  };

  // Export Filtered Applications to CSV / Excel
  const handleExportExcel = () => {
    if (filteredApps.length === 0) {
      alert('No application records to export.');
      return;
    }

    const headers = [
      'Application Number', 'Student Name', 'Father Name', 'Mother Name', 'DOB',
      'Gender', 'Mobile', 'WhatsApp', 'Email', 'Full Address', 'State', 'District',
      'City', 'PIN Code', 'Qualification', 'Course', 'Preferred Batch', 'Status', 'Submission Date', 'Remarks'
    ];

    const rows = filteredApps.map(app => [
      `"${app.applicationNumber}"`,
      `"${app.studentName}"`,
      `"${app.fatherName}"`,
      `"${app.motherName || ''}"`,
      `"${app.dob}"`,
      `"${app.gender}"`,
      `"${app.mobileNumber}"`,
      `"${app.whatsappNumber || app.mobileNumber}"`,
      `"${app.email}"`,
      `"${(app.fullAddress || '').replace(/"/g, '""')}"`,
      `"${app.state || ''}"`,
      `"${app.district || ''}"`,
      `"${app.city || ''}"`,
      `"${app.pinCode || ''}"`,
      `"${app.qualification || ''}"`,
      `"${app.courseAppliedFor}"`,
      `"${app.preferredBatch}"`,
      `"${app.status.toUpperCase()}"`,
      `"${app.submissionDate}"`,
      `"${(app.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pearl_Academy_Admissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF Receipt for Admission Application
  const handleDownloadPdf = (app: AdmissionApplication) => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEARL COMPUTER & TARGET ACADEMY', 105, 12, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL ADMISSION APPLICATION ACKNOWLEDGMENT RECEIPT', 105, 20, { align: 'center' });
    doc.text('Main Campus, Tower Square, Indore (M.P.) | Help: +91 98260-12345', 105, 26, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`APPLICATION NO: ${app.applicationNumber}`, 15, 42);
    doc.text(`DATE: ${app.submissionDate}`, 140, 42);

    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, 45, 195, 45);

    let y = 55;
    const addRow = (label: string, val: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(val || 'N/A', 75, y);
      y += 8;
    };

    addRow('Student Name:', app.studentName);
    addRow('Father Name:', app.fatherName);
    addRow('Mother Name:', app.motherName || 'N/A');
    addRow('Date of Birth:', app.dob);
    addRow('Gender:', app.gender);
    addRow('Mobile Number:', app.mobileNumber);
    addRow('WhatsApp Number:', app.whatsappNumber || app.mobileNumber);
    addRow('Email Address:', app.email);
    addRow('Full Address:', `${app.fullAddress || ''}, ${app.city || ''}, ${app.state || ''} - ${app.pinCode || ''}`);
    addRow('Qualification:', app.qualification || 'N/A');
    addRow('Course Applied:', app.courseAppliedFor);
    addRow('Preferred Batch:', app.preferredBatch);
    addRow('Application Status:', app.status.toUpperCase());
    addRow('Remarks:', app.remarks || 'No remarks recorded');

    y += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Note: Keep this receipt safe for verification at the time of fee submission & class allotment.', 15, y);

    doc.save(`Admission_Receipt_${app.applicationNumber}.pdf`);
  };

  // Print Application
  const handlePrintApp = (app: AdmissionApplication) => {
    setSelectedAppModal(app);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Submit Send Email
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalApp) return;
    try {
      const res = await fetch('/api/admin/admission/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: emailModalApp.id,
          subject: emailSubject,
          message: emailMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.message);
        setEmailModalApp(null);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Error sending email notification.');
    }
  };

  // Submit Send WhatsApp Message
  const handleSendWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppModalApp) return;
    try {
      const res = await fetch('/api/admin/admission/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: whatsAppModalApp.id,
          customText: whatsAppText
        })
      });
      const data = await res.json();
      if (data.success && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
        setActionSuccessMsg('WhatsApp chat link launched!');
        setWhatsAppModalApp(null);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Error triggering WhatsApp notification.');
    }
  };

  // Save Remarks
  const handleSaveRemarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarksModalApp) return;
    try {
      const res = await fetch('/api/admin/admission/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: remarksModalApp.id,
          remarks: remarksText
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(data.message);
        setRemarksModalApp(null);
        fetchAdminData();
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Error saving remarks.');
    }
  };

  // Save Email Settings
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings)
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg('Email & Notification Settings saved successfully!');
        setEmailSettings(data.settings);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Error saving email settings.');
    }
  };

  // Add Faculty
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacData)
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg('Faculty account created successfully!');
        setShowAddFacultyModal(false);
        fetchAdminData();
      }
    } catch (err) {
      alert('Error creating faculty account.');
    }
  };

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mobileNumber.includes(searchQuery) ||
      app.courseAppliedFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  Super Admin Panel
                </span>
                <span className="text-xs text-slate-400">Pearl Academy Control Engine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mt-1">Master Institute Management Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sync Data
            </button>

            <button
              onClick={onLogout}
              className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/60 text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Admin
            </button>
          </div>
        </div>

        {/* Global Action Success Toast */}
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'courses' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 text-orange-500" /> Course Catalog Manager
          </button>

          <button
            onClick={() => setActiveTab('admissions')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'admissions' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <FileText className="w-4 h-4" /> Admission Manager ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'students' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4" /> Student Manager ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('faculty')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faculty' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Faculty Manager ({faculty.length})
          </button>

          <button
            onClick={() => setActiveTab('centers')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'centers' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-500" /> Center Management (RBAC)
          </button>

          <button
            onClick={() => setActiveTab('managingDirector')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'managingDirector' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-500" /> Managing Director & Founder
          </button>

          <button
            onClick={() => setActiveTab('idcard')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'idcard' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-4 h-4 text-orange-500" /> ID Card Management
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'events' ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" /> Event & Slider Manager
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'gallery' ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-500" /> Gallery Manager
          </button>

          <button
            onClick={() => setActiveTab('emailSettings')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'emailSettings' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <Mail className="w-4 h-4" /> Email & Notification Settings
          </button>

          <button
            onClick={() => setActiveTab('auditLogs')}
            className={`pb-3 border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'auditLogs' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500'
            }`}
          >
            <Clock className="w-4 h-4" /> Security Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* EVENTS & ANNOUNCEMENTS SLIDER TAB */}
        {activeTab === 'events' && (
          <AdminEventsModule
            userRole={currentUser?.role || 'admin'}
            userName={currentUser?.name || 'Institute Admin'}
          />
        )}

        {/* CENTER MANAGEMENT TAB */}
        {activeTab === 'centers' && (
          <AdminCenterManagementModule />
        )}

        {/* MANAGING DIRECTOR & FOUNDER TAB */}
        {activeTab === 'managingDirector' && (
          <AdminManagingDirectorModule
            userRole={currentUser?.role || 'admin'}
            userName={currentUser?.name || 'Institute Admin'}
          />
        )}

        {/* 1. COURSE CATALOG MANAGER TAB */}
        {activeTab === 'courses' && (
          <AdminCourseModule currentUser={currentUser || null} />
        )}

        {/* 1. ADMISSION MANAGER TAB */}
        {activeTab === 'admissions' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, app no, mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-xs w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Export Applications to CSV / Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">App Number</th>
                      <th className="p-3.5">Student Details</th>
                      <th className="p-3.5">Course & Batch</th>
                      <th className="p-3.5">Submission Date</th>
                      <th className="p-3.5">Status & Remarks</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {app.applicationNumber}
                        </td>

                        <td className="p-3.5">
                          <strong className="text-slate-900 dark:text-white block">{app.studentName}</strong>
                          <span className="text-[11px] text-slate-400">Father: {app.fatherName} • Mobile: {app.mobileNumber}</span>
                          <span className="text-[10px] text-slate-400 block">{app.email}</span>
                        </td>

                        <td className="p-3.5">
                          <strong className="text-slate-800 dark:text-slate-200 block">{app.courseAppliedFor}</strong>
                          <span className="text-[10px] text-slate-400">{app.preferredBatch}</span>
                        </td>

                        <td className="p-3.5 text-[11px] text-slate-500">
                          {app.submissionDate}
                          <span className="block text-[10px] text-slate-400">IP: {app.applicantIp}</span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            app.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.status}
                          </span>
                          {app.remarks && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-xs truncate" title={app.remarks}>
                              Remark: {app.remarks}
                            </p>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          {/* View Application Details */}
                          <button
                            onClick={() => setSelectedAppModal(app)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
                            title="View Full Application Details & Documents"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(app)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 rounded-lg cursor-pointer"
                            title="Download PDF Acknowledgment Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Application */}
                          <button
                            onClick={() => handlePrintApp(app)}
                            className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 rounded-lg cursor-pointer"
                            title="Print Application Form"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Send Email */}
                          <button
                            onClick={() => {
                              setEmailModalApp(app);
                              setEmailSubject(`Pearl Academy Admission Update - Application ${app.applicationNumber}`);
                              setEmailMessage(`Dear ${app.studentName},\n\nYour online admission application (${app.applicationNumber}) for course ${app.courseAppliedFor} status is currently ${app.status.toUpperCase()}.\n\nFor any queries, please visit campus or contact helpline.`);
                            }}
                            className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 rounded-lg cursor-pointer"
                            title="Send Direct Email Notification"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Send WhatsApp */}
                          <button
                            onClick={() => {
                              setWhatsAppModalApp(app);
                              setWhatsAppText(`Hello ${app.studentName}, greeting from Pearl Computer & Target Academy! Regarding your admission application (${app.applicationNumber}) for ${app.courseAppliedFor}. Status: ${app.status.toUpperCase()}.`);
                            }}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-lg cursor-pointer"
                            title="Send WhatsApp Notification"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Add Remarks */}
                          <button
                            onClick={() => {
                              setRemarksModalApp(app);
                              setRemarksText(app.remarks || '');
                            }}
                            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 rounded-lg cursor-pointer"
                            title="Add/Edit Remarks"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve */}
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateAdmissionStatus(app.id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                              title="Approve Application & Generate Student Account"
                            >
                              Approve
                            </button>
                          )}

                          {/* Reject */}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateAdmissionStatus(app.id, 'rejected')}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-lg text-[11px] cursor-pointer"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          )}

                          {/* Delete Application */}
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. STUDENT MANAGER TAB */}
        {activeTab === 'students' && (
          <StudentManagementModule
            studentsList={students}
            onRefreshStudents={fetchAdminData}
          />
        )}

        {/* 3. FACULTY MANAGER TAB */}
        {activeTab === 'faculty' && (
          <FacultyManagementModule
            facultyList={faculty}
            onRefreshFaculty={fetchAdminData}
          />
        )}

        {/* ID CARD MANAGEMENT MODULE TAB */}
        {activeTab === 'idcard' && (
          <AdminIdCardModule
            students={students}
            onUpdateStudent={() => fetchAdminData()}
            onAuditLogAdded={() => fetchAdminData()}
          />
        )}

        {/* 4. EMAIL & NOTIFICATION SETTINGS TAB */}
        {activeTab === 'emailSettings' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="border-b pb-3 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" /> Configure Institute Email & Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All online admission form submissions & attachments notifications are sent to the Institute Notification Email configured below.
              </p>
            </div>

            <form onSubmit={handleSaveEmailSettings} className="space-y-4 text-xs">
              {/* CRITICAL DEFAULT NOTIFICATION EMAIL */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-800 rounded-2xl space-y-1.5">
                <label className="block text-slate-900 dark:text-slate-100 font-extrabold text-xs">
                  Institute Notification Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={emailSettings.instituteNotificationEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, instituteNotificationEmail: e.target.value })}
                  placeholder="bisan9329284693@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[11px] text-orange-800 dark:text-orange-300">
                  Default set to: <strong>bisan9329284693@gmail.com</strong>. You can update this email address anytime without modifying source code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">SMTP Username</label>
                  <input
                    type="text"
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl cursor-pointer shadow-md"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* 5. AUDIT LOGS */}
        {activeTab === 'auditLogs' && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Security Audit Logs</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-800 dark:text-white">{log.action}</strong>
                    <span className="text-slate-400 block text-[11px]">{log.user} ({log.role}) • {log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{log.timestamp} (IP: {log.ip})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <AdminGalleryModule />
        )}

        {/* Modal: Add Faculty */}
        {showAddFacultyModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Faculty Account</h3>
              <form onSubmit={handleCreateFaculty} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newFacData.name}
                    onChange={(e) => setNewFacData({ ...newFacData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newFacData.email}
                      onChange={(e) => setNewFacData({ ...newFacData, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Mobile</label>
                    <input
                      type="tel"
                      required
                      value={newFacData.mobile}
                      onChange={(e) => setNewFacData({ ...newFacData, mobile: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Unique Username</label>
                  <input
                    type="text"
                    required
                    value={newFacData.username}
                    onChange={(e) => setNewFacData({ ...newFacData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl"
                  >
                    Create Faculty Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddFacultyModal(false)}
                    className="px-4 py-2.5 border rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODAL 1: VIEW FULL APPLICATION DETAILS */}
        {selectedAppModal && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/60 px-2.5 py-1 rounded-full">
                    {selectedAppModal.applicationNumber}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    Student Admission Form
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAppModal(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              {/* Student Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Personal Details</span>
                  <div><strong>Student Name:</strong> {selectedAppModal.studentName}</div>
                  <div><strong>Father Name:</strong> {selectedAppModal.fatherName}</div>
                  <div><strong>Mother Name:</strong> {selectedAppModal.motherName || 'N/A'}</div>
                  <div><strong>Date of Birth:</strong> {selectedAppModal.dob}</div>
                  <div><strong>Gender:</strong> {selectedAppModal.gender}</div>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Contact Info</span>
                  <div><strong>Mobile Number:</strong> {selectedAppModal.mobileNumber}</div>
                  <div><strong>WhatsApp Number:</strong> {selectedAppModal.whatsappNumber || selectedAppModal.mobileNumber}</div>
                  <div><strong>Email Address:</strong> {selectedAppModal.email}</div>
                  <div><strong>Qualification:</strong> {selectedAppModal.qualification || 'N/A'}</div>
                </div>
              </div>

              {/* Address & Course Applied */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Address Info</span>
                  <div><strong>Full Address:</strong> {selectedAppModal.fullAddress}</div>
                  <div><strong>City / District:</strong> {selectedAppModal.city} / {selectedAppModal.district}</div>
                  <div><strong>State & PIN:</strong> {selectedAppModal.state} - {selectedAppModal.pinCode}</div>
                </div>

                <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Course & Batch</span>
                  <div><strong>Course Applied:</strong> {selectedAppModal.courseAppliedFor}</div>
                  <div><strong>Preferred Batch:</strong> {selectedAppModal.preferredBatch}</div>
                  <div><strong>Submission Date:</strong> {selectedAppModal.submissionDate}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                      {selectedAppModal.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Thumbnails */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Attached Documents</span>
                <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
                  <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                    <span className="font-bold block">Passport Photo</span>
                    {selectedAppModal.photoUrl ? (
                      <img src={selectedAppModal.photoUrl} alt="Photo" className="w-16 h-16 object-cover rounded mx-auto border" />
                    ) : (
                      <span className="text-slate-400">Attached</span>
                    )}
                  </div>

                  <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                    <span className="font-bold block">Aadhaar / ID Card</span>
                    {selectedAppModal.aadhaarUrl ? (
                      <img src={selectedAppModal.aadhaarUrl} alt="Aadhaar" className="w-16 h-12 object-cover rounded mx-auto border" />
                    ) : (
                      <span className="text-slate-400">Attached</span>
                    )}
                  </div>

                  <div className="p-2 border rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1">
                    <span className="font-bold block">Signature</span>
                    {selectedAppModal.signatureUrl ? (
                      <img src={selectedAppModal.signatureUrl} alt="Signature" className="w-16 h-8 object-contain rounded mx-auto border" />
                    ) : (
                      <span className="text-slate-400">Attached</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-700">
                <button
                  onClick={() => handleDownloadPdf(selectedAppModal)}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download PDF Receipt
                </button>
                <button
                  onClick={() => setSelectedAppModal(null)}
                  className="px-4 py-2 border rounded-xl text-xs text-slate-600 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: SEND DIRECT EMAIL */}
        {emailModalApp && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" /> Send Email to {emailModalApp.studentName}
                </h3>
                <button onClick={() => setEmailModalApp(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleSendEmailSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">To Email Address</label>
                  <input type="text" readOnly value={emailModalApp.email} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border rounded-xl" />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Message Body</label>
                  <textarea
                    required
                    rows={4}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1">
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </button>
                  <button type="button" onClick={() => setEmailModalApp(null)} className="px-4 py-2 border rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: SEND WHATSAPP MESSAGE */}
        {whatsAppModalApp && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" /> Send WhatsApp Message
                </h3>
                <button onClick={() => setWhatsAppModalApp(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleSendWhatsAppSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">WhatsApp Mobile Number</label>
                  <input type="text" readOnly value={whatsAppModalApp.whatsappNumber || whatsAppModalApp.mobileNumber} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border rounded-xl" />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Custom Message Text</label>
                  <textarea
                    required
                    rows={4}
                    value={whatsAppText}
                    onChange={(e) => setWhatsAppText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Open WhatsApp Chat
                  </button>
                  <button type="button" onClick={() => setWhatsAppModalApp(null)} className="px-4 py-2 border rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ADD / EDIT REMARKS */}
        {remarksModalApp && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" /> Add Admin Remarks
                </h3>
                <button onClick={() => setRemarksModalApp(null)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveRemarksSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Application No: {remarksModalApp.applicationNumber}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter official remarks, fee status, interview date, or rejection reasons..."
                    value={remarksText}
                    onChange={(e) => setRemarksText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl dark:bg-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl">
                    Save Remarks
                  </button>
                  <button type="button" onClick={() => setRemarksModalApp(null)} className="px-4 py-2 border rounded-xl">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
