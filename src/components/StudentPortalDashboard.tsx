import React, { useState } from 'react';
import {
  User,
  QrCode,
  Download,
  BookOpen,
  CheckCircle2,
  Lock,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  Video,
  Award,
  Bell,
  LogOut,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { UserSession, StudentAccount } from '../types';
import { sampleStudents, sampleAssignments, sampleStudyNotes } from '../data/mockData';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';
import { AttendanceTracker } from './AttendanceTracker';
import { FeePaymentHistory } from './FeePaymentHistory';
import { StudentNotificationBell } from './StudentNotificationBell';

interface StudentPortalDashboardProps {
  currentUser: UserSession;
  studentDetails?: StudentAccount | null;
  onLogout: () => void;
}

export const StudentPortalDashboard: React.FC<StudentPortalDashboardProps> = ({
  currentUser,
  studentDetails,
  onLogout
}) => {
  const student = studentDetails || sampleStudents[0];
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'idcard' | 'fees' | 'notes' | 'password'>('overview');

  // Password reset state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState('');
  const [passError, setPassError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage('');
    setPassError('');

    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New Password and Confirm Password do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: student.id,
          role: 'student',
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await res.json();
      if (data.success) {
        setPassMessage('Password updated successfully! Temporary password resolved.');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Server connection error.');
    }
  };

  // Download Digital ID Card PDF
  const downloadIdCardPdf = () => {
    const doc = new jsPDF('portrait', 'mm', [85.6, 53.98]); // Standard ID card size

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 54, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('PEARL COMPUTER & TARGET', 27, 6, { align: 'center' });
    doc.setFontSize(5);
    doc.text('STUDENT DIGITAL ID CARD', 27, 10, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(`ID: ${student.studentId}`, 4, 22);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${student.name}`, 4, 27);
    doc.text(`Father: ${student.fatherName || 'Manoj Sharma'}`, 4, 32);
    doc.text(`Course: ${student.course.substring(0, 22)}...`, 4, 37);
    doc.text(`Reg No: ${student.regNumber}`, 4, 42);
    doc.text(`Batch: ${student.batch.substring(0, 22)}...`, 4, 47);

    doc.setFillColor(241, 245, 249);
    doc.rect(4, 52, 46, 28, 'F');
    doc.setFontSize(5);
    doc.text('Official Valid Verification QR', 27, 57, { align: 'center' });
    doc.text(`Verify online: pearlacademy.edu.in`, 27, 75, { align: 'center' });

    doc.save(`Student_ID_Card_${student.studentId}.pdf`);
  };

  return (
    <div className="py-10 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Student Banner Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-orange-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  Student Portal
                </span>
                <span className="text-xs text-blue-200 font-mono">Reg: {student.regNumber}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{student.name}</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                {student.course} • Batch: {student.batch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <StudentNotificationBell onNavigateTab={(tab) => setActiveTab(tab)} />

            <button
              onClick={downloadIdCardPdf}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
            >
              <QrCode className="w-4 h-4" /> Download Digital ID Card
            </button>

            <button
              onClick={onLogout}
              className="bg-blue-900/80 hover:bg-red-900/80 text-white font-medium px-3.5 py-2.5 rounded-xl text-xs cursor-pointer flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Temporary Password Prompt Alert if isFirstLogin */}
        {student.isFirstLogin && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>First Login Security Notice:</strong> You are using a temporary password. Please change your password for safety.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('password')}
              className="bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shrink-0"
            >
              Change Password Now
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard Overview
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Attendance Analytics
          </button>

          <button
            onClick={() => setActiveTab('idcard')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'idcard'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Digital ID Card
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'fees'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fee Ledger & Receipts
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Assignments & Study Notes
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Security & Password Change
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Metrics Cards */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Attendance Percentage
                  </h3>
                  <div className="text-3xl font-extrabold text-emerald-600">{student.attendancePercentage}%</div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${student.attendancePercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Regular attendance logged in practical lab system.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-orange-500" /> Course Fee Balance
                  </h3>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    ₹{student.feePaid.toLocaleString()} / <span className="text-slate-400 text-base">₹{student.feeTotal.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Remaining Dues: <strong className="text-orange-600">₹{(student.feeTotal - student.feePaid).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Right Assignments & Live Classes */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Active Course Assignments
                  </h3>

                  <div className="space-y-3 text-xs">
                    {sampleAssignments.map((asg) => (
                      <div key={asg.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white">{asg.title}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">{asg.description}</p>
                          <span className="text-[10px] text-blue-600 font-semibold mt-1 block">Due: {asg.dueDate} • By {asg.assignedBy}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asg.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {asg.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Attendance Tracker Recharts Module */}
            <AttendanceTracker student={student} />
          </div>
        )}

        {/* 2. ATTENDANCE ANALYTICS TAB */}
        {activeTab === 'attendance' && (
          <AttendanceTracker student={student} />
        )}

        {/* 2. DIGITAL ID CARD TAB */}
        {activeTab === 'idcard' && (
          <DigitalIdCardGenerator initialStudent={student} readOnly={true} />
        )}

        {/* 3. FEE PAYMENT HISTORY LEDGER */}
        {activeTab === 'fees' && (
          <FeePaymentHistory student={student} />
        )}

        {/* 3. STUDY NOTES & DOWNLOADS */}
        {activeTab === 'notes' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Download Handwritten Study Notes & PDF References</h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sampleStudyNotes.map((note) => (
                <div key={note.id} className="py-4 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{note.title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">{note.course} • {note.subject} ({note.fileSize})</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${note.title}...`)}
                    className="bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECURITY & PASSWORD CHANGE */}
        {activeTab === 'password' && (
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> Change Student Account Password
            </h3>

            {passMessage && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs">{passMessage}</div>}
            {passError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs">{passError}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current / Temporary Password</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password (Min 8 chars)</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
