import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  KeyRound,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Send,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  Shield,
  BookOpen,
  DollarSign,
  X,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StudentAccount } from '../types';

interface StudentManagementModuleProps {
  studentsList: StudentAccount[];
  onRefreshStudents: () => void;
}

export const StudentManagementModule: React.FC<StudentManagementModuleProps> = ({
  studentsList,
  onRefreshStudents
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Success / Info Alert Banner
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentAccount | null>(null);
  const [resetPassStudent, setResetPassStudent] = useState<StudentAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [idCardStudent, setIdCardStudent] = useState<StudentAccount | null>(null);

  // New Student Form State
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    fatherName: '',
    email: '',
    mobile: '',
    course: 'DCA (Diploma in Computer Applications)',
    batch: 'Morning 08:00 AM - 10:00 AM',
    feeTotal: 8000,
    feePaid: 3000,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Filtered Students
  const filteredStudents = studentsList.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.mobile.includes(searchQuery) ||
      st.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = courseFilter === 'all' || st.course.toLowerCase().includes(courseFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || st.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Handle Add Student Submit
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData)
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setShowAddModal(false);
        setNewStudentData({
          name: '',
          fatherName: '',
          email: '',
          mobile: '',
          course: 'DCA (Diploma in Computer Applications)',
          batch: 'Morning 08:00 AM - 10:00 AM',
          feeTotal: 8000,
          feePaid: 3000,
          status: 'Active'
        });
        onRefreshStudents();
      } else {
        setErrorMessage(data.message || 'Failed to create student account.');
      }
    } catch (err) {
      setErrorMessage('Server connection error.');
    }
  };

  // Handle Edit Student Submit
  const handleEditStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setActionMessage('');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudent)
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setEditingStudent(null);
        onRefreshStudents();
      } else {
        setErrorMessage(data.message || 'Failed to update student account.');
      }
    } catch (err) {
      setErrorMessage('Server error while saving student details.');
    }
  };

  // Toggle Account Active/Inactive
  const handleToggleStatus = async (student: StudentAccount) => {
    const nextStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/students/${student.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        onRefreshStudents();
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Reset Student Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassStudent) return;
    setActionMessage('');
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/student/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: resetPassStudent.id,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setResetPassStudent(null);
        setNewPassword('');
        onRefreshStudents();
      } else {
        setErrorMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setErrorMessage('Server connection error.');
    }
  };

  // Dispatch / Resend Login Credentials
  const handleDispatchCredentials = async (student: StudentAccount) => {
    try {
      const res = await fetch('/api/students/generate-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id })
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(`Login credentials dispatched for ${student.name}! Email: ${student.email} | WhatsApp: +91-${student.mobile}`);
        onRefreshStudents();
      }
    } catch (err) {
      alert('Failed to dispatch login credentials.');
    }
  };

  // Delete Student Account
  const handleDeleteStudent = async (student: StudentAccount) => {
    if (!confirm(`Are you sure you want to permanently delete student account for ${student.name} (${student.studentId})?`)) return;
    try {
      const res = await fetch(`/api/students/${student.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        onRefreshStudents();
      }
    } catch (err) {
      alert('Failed to delete student.');
    }
  };

  // Export Student Data to Excel / CSV
  const handleExportCsv = () => {
    if (filteredStudents.length === 0) {
      alert('No student records to export.');
      return;
    }

    const headers = [
      'Student ID', 'Registration Number', 'Roll Number', 'Username', 'Full Name', 'Father Name',
      'Email', 'Mobile', 'Course', 'Batch', 'Status', 'Fee Total', 'Fee Paid', 'Temp Password', 'Created Date'
    ];

    const rows = filteredStudents.map(st => [
      `"${st.studentId}"`,
      `"${st.regNumber}"`,
      `"${st.rollNumber}"`,
      `"${st.username}"`,
      `"${st.name}"`,
      `"${st.fatherName || ''}"`,
      `"${st.email}"`,
      `"${st.mobile}"`,
      `"${st.course}"`,
      `"${st.batch}"`,
      `"${st.status}"`,
      st.feeTotal,
      st.feePaid,
      `"${st.tempPassword || 'Pass@2026'}"`,
      `"${st.createdDate}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pearl_Academy_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Individual Student ID Card PDF
  const downloadStudentIdPdf = (st: StudentAccount) => {
    const doc = new jsPDF('portrait', 'mm', [85.6, 53.98]);

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 54, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PEARL COMPUTER & TARGET', 27, 6, { align: 'center' });
    doc.setFontSize(5);
    doc.text('OFFICIAL STUDENT DIGITAL ID', 27, 10, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(`ID: ${st.studentId}`, 4, 22);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${st.name}`, 4, 27);
    doc.text(`Father: ${st.fatherName || 'Manoj Sharma'}`, 4, 32);
    doc.text(`Course: ${st.course.substring(0, 22)}...`, 4, 37);
    doc.text(`Reg No: ${st.regNumber}`, 4, 42);
    doc.text(`Roll No: ${st.rollNumber}`, 4, 47);

    doc.setFillColor(241, 245, 249);
    doc.rect(4, 52, 46, 28, 'F');
    doc.setFontSize(5);
    doc.text('Online Verification QR Code', 27, 57, { align: 'center' });
    doc.text(`pearlacademy.edu.in/verify/${st.studentId}`, 27, 75, { align: 'center' });

    doc.save(`Student_ID_${st.studentId}.pdf`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
      {/* Top Header & Overview Counters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Student Account & Admission Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto Student Login Creation • Credentials Dispatch • Batch & Course Assignment • Digital ID Printing
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Student Account
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
          </button>

          <button
            onClick={onRefreshStudents}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Banners */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-2xl text-red-800 dark:text-red-200 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-600 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-1">
          <span className="text-slate-500 font-bold">Total Enrolled Students</span>
          <div className="text-2xl font-extrabold text-blue-600">{studentsList.length} Accounts</div>
          <span className="text-[10px] text-slate-400">All Batches Combined</span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-1">
          <span className="text-slate-500 font-bold">Active Student Logins</span>
          <div className="text-2xl font-extrabold text-emerald-600">
            {studentsList.filter(s => s.status === 'Active').length} Active
          </div>
          <span className="text-[10px] text-slate-400">Can access Student Portal</span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-1">
          <span className="text-slate-500 font-bold">First-Time Logins Pending</span>
          <div className="text-2xl font-extrabold text-orange-500">
            {studentsList.filter(s => s.isFirstLogin).length} Pending
          </div>
          <span className="text-[10px] text-slate-400">Using Temporary Password</span>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-1">
          <span className="text-slate-500 font-bold">Fee Collections Total</span>
          <div className="text-2xl font-extrabold text-indigo-600">
            ₹{studentsList.reduce((acc, curr) => acc + (curr.feePaid || 0), 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Total Dues Collected</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Student ID, Reg No, Roll No, Name, Mobile or Email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
        >
          <option value="all">All Courses</option>
          <option value="dca">DCA (Diploma in Computer Applications)</option>
          <option value="adca">ADCA (Advanced Diploma)</option>
          <option value="tally">Tally Prime with GST</option>
          <option value="python">Python & AI</option>
          <option value="mppsc">MPPSC Target</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Main Student Directory Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b dark:border-slate-700">
            <tr>
              <th className="p-3.5">Student ID & Reg/Roll</th>
              <th className="p-3.5">Student Name & Parent</th>
              <th className="p-3.5">Contact & Username</th>
              <th className="p-3.5">Course & Batch</th>
              <th className="p-3.5">Fee Dues</th>
              <th className="p-3.5">Temp Password</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No student accounts match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 space-y-0.5">
                    <span className="font-mono font-extrabold text-blue-600 block text-xs">{st.studentId}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Reg: {st.regNumber}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Roll: {st.rollNumber}</span>
                  </td>

                  <td className="p-3.5">
                    <strong className="block text-slate-900 dark:text-white text-sm">{st.name}</strong>
                    <span className="text-[11px] text-slate-500">Father: {st.fatherName || 'Manoj Sharma'}</span>
                  </td>

                  <td className="p-3.5 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Mob:</strong> {st.mobile}</div>
                    <div><strong>Email:</strong> {st.email}</div>
                    <div><strong>User:</strong> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-orange-600">{st.username}</code></div>
                  </td>

                  <td className="p-3.5 text-[11px]">
                    <div className="font-bold text-slate-800 dark:text-white">{st.course}</div>
                    <div className="text-slate-500 text-[10px]">{st.batch}</div>
                  </td>

                  <td className="p-3.5 text-[11px]">
                    <div className="font-bold text-emerald-600">₹{st.feePaid.toLocaleString()} Paid</div>
                    <div className="text-slate-400 text-[10px]">Total: ₹{st.feeTotal.toLocaleString()}</div>
                  </td>

                  <td className="p-3.5 font-mono text-[11px]">
                    <span className="bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-2 py-1 rounded font-bold">
                      {st.tempPassword || 'Pass@2026'}
                    </span>
                    {st.isFirstLogin && (
                      <span className="block text-[9px] text-orange-500 font-bold mt-1">First Login Pending</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleStatus(st)}
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer transition-colors ${
                        st.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {st.status}
                    </button>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Send Credentials */}
                      <button
                        onClick={() => handleDispatchCredentials(st)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg cursor-pointer"
                        title="Dispatch Login Credentials (Email/WhatsApp/SMS)"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => setEditingStudent({ ...st })}
                        className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg cursor-pointer"
                        title="Edit Student Details, Course, Roll No"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => setResetPassStudent(st)}
                        className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg cursor-pointer"
                        title="Reset Student Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      {/* Print Digital ID */}
                      <button
                        onClick={() => downloadStudentIdPdf(st)}
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg cursor-pointer"
                        title="Download Digital ID Card PDF"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Student */}
                      <button
                        onClick={() => handleDeleteStudent(st)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg cursor-pointer"
                        title="Delete Student Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD NEW STUDENT & AUTO LOGIN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" /> Create New Student Login Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Parmar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudentData.fatherName}
                    onChange={(e) => setNewStudentData({ ...newStudentData, fatherName: e.target.value })}
                    placeholder="e.g. Ramesh Parmar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newStudentData.mobile}
                    onChange={(e) => setNewStudentData({ ...newStudentData, mobile: e.target.value })}
                    placeholder="10 Digit Mobile"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Assigned Course *</label>
                <select
                  value={newStudentData.course}
                  onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  <option value="DCA (Diploma in Computer Applications)">DCA (Diploma in Computer Applications)</option>
                  <option value="ADCA (Advanced Diploma in Computer Applications)">ADCA (Advanced Diploma)</option>
                  <option value="Tally Prime with GST & Payroll">Tally Prime with GST & Payroll</option>
                  <option value="Python Programming & AI/ML Basics">Python Programming & AI/ML</option>
                  <option value="MPPSC Pre + Mains Foundation Batch">MPPSC Pre + Mains Foundation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Preferred Batch Time</label>
                <select
                  value={newStudentData.batch}
                  onChange={(e) => setNewStudentData({ ...newStudentData, batch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                >
                  <option value="Morning 08:00 AM - 10:00 AM">Morning 08:00 AM - 10:00 AM</option>
                  <option value="Morning 10:30 AM - 12:30 PM">Morning 10:30 AM - 12:30 PM</option>
                  <option value="Evening 05:00 PM - 07:00 PM">Evening 05:00 PM - 07:00 PM</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={newStudentData.feeTotal}
                    onChange={(e) => setNewStudentData({ ...newStudentData, feeTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Fee Paid (₹)</label>
                  <input
                    type="number"
                    value={newStudentData.feePaid}
                    onChange={(e) => setNewStudentData({ ...newStudentData, feePaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/80 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                ⚡ <strong>Automatic Generation:</strong> Student ID, Registration No, Roll No, Username & Temporary Password will be generated automatically and dispatched to student email & WhatsApp.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Create & Generate Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT DETAILS */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Edit Student Profile ({editingStudent.studentId})
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Student Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={editingStudent.regNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, regNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.rollNumber}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Mobile</label>
                  <input
                    type="tel"
                    value={editingStudent.mobile}
                    onChange={(e) => setEditingStudent({ ...editingStudent, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Assigned Course</label>
                <input
                  type="text"
                  value={editingStudent.course}
                  onChange={(e) => setEditingStudent({ ...editingStudent, course: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Batch Schedule</label>
                <input
                  type="text"
                  value={editingStudent.batch}
                  onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Fee Total (₹)</label>
                  <input
                    type="number"
                    value={editingStudent.feeTotal}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feeTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Fee Paid (₹)</label>
                  <input
                    type="number"
                    value={editingStudent.feePaid}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feePaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Save Profile Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resetPassStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3 dark:border-slate-700">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" /> Reset Password for {resetPassStudent.name}
              </h3>
              <button onClick={() => setResetPassStudent(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">New Temporary Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`Default: Pass@2026#${resetPassStudent.studentId.slice(-4)}`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/80 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                Resets student password and forces password change on next login.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Confirm Reset & Send Credentials
                </button>
                <button
                  type="button"
                  onClick={() => setResetPassStudent(null)}
                  className="px-4 py-2.5 border rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
