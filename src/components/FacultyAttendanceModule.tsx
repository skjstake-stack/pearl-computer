import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  FileSpreadsheet,
  FileText,
  Printer,
  Save,
  RefreshCw,
  Lock,
  UserCheck,
  UserX,
  Send,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, StudentAccount } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPdf, printAttendanceRegister } from '../utils/exportAttendance';

interface FacultyAttendanceModuleProps {
  facultyName?: string;
  facultyId?: string;
}

export const FacultyAttendanceModule: React.FC<FacultyAttendanceModuleProps> = ({
  facultyName = 'Er. R. K. Sharma',
  facultyId = 'EMP-FAC-01'
}) => {
  // Filters & Class Context
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedCourse, setSelectedCourse] = useState<string>('ADCA (Advanced Diploma in Computer Applications)');
  const [selectedBatch, setSelectedBatch] = useState<string>('Morning 08:00 AM - 10:00 AM');
  const [selectedSubject, setSelectedSubject] = useState<string>('MS Office & Advanced Excel');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Period 1 (08:00 AM - 09:30 AM)');

  // Student Roster & Marking State
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Status & Lock States
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockInfo, setLockInfo] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active History View
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'analytics'>('register');

  // Notification simulation modal
  const [showNotifyModal, setShowNotifyModal] = useState<boolean>(false);
  const [notifyingStudent, setNotifyingStudent] = useState<any | null>(null);
  const [notifySuccess, setNotifySuccess] = useState<boolean>(false);

  // Load Course Students
  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [selectedDate, selectedCourse, selectedBatch, selectedSubject, selectedPeriod]);

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    setSaveMessage(null);
    try {
      // 1. Fetch Students
      const stuRes = await fetch('/api/admin/students');
      const stuData = await stuRes.json();
      let allStudents: StudentAccount[] = stuData.students || [];

      // Filter students by course/batch if matched, else fallback
      let matchedStudents = allStudents.filter(
        s => s.course === selectedCourse || s.batch === selectedBatch
      );
      if (matchedStudents.length === 0) {
        matchedStudents = allStudents.length > 0 ? allStudents : [];
      }
      setStudents(matchedStudents);

      // 2. Fetch Lock status
      const lockRes = await fetch('/api/attendance/locks');
      const lockData = await lockRes.json();
      const locks = lockData.locks || [];
      const currentLock = locks.find(
        (l: any) => l.date === selectedDate && (l.batchId === selectedBatch || l.courseId === selectedCourse || l.batchId === 'ALL')
      );

      if (currentLock) {
        setIsLocked(true);
        setLockInfo(`Locked by ${currentLock.lockedBy} on ${new Date(currentLock.lockedAt).toLocaleDateString()}`);
      } else {
        setIsLocked(false);
        setLockInfo(null);
      }

      // 3. Fetch Existing Attendance for Date + Course + Batch + Subject
      const attRes = await fetch(
        `/api/attendance?date=${selectedDate}&courseId=${encodeURIComponent(selectedCourse)}&batchId=${encodeURIComponent(selectedBatch)}&subjectId=${encodeURIComponent(selectedSubject)}`
      );
      const attData = await attRes.json();
      const existingRecs: AttendanceRecord[] = attData.records || [];
      setHistoryRecords(existingRecs);

      // Initialize map
      const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      matchedStudents.forEach(st => {
        const found = existingRecs.find(r => r.studentId === st.studentId || r.studentId === st.id);
        if (found) {
          initialMap[st.studentId] = {
            status: found.attendanceStatus,
            remarks: found.remarks || ''
          };
        } else {
          // Default to Present
          initialMap[st.studentId] = {
            status: 'Present',
            remarks: ''
          };
        }
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handlers
  const handleMarkAll = (status: AttendanceStatus) => {
    if (isLocked) return;
    setAttendanceMap(prev => {
      const next = { ...prev };
      students.forEach(s => {
        next[s.studentId] = {
          ...next[s.studentId],
          status
        };
      });
      return next;
    });
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isLocked) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (isLocked) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  // Submit / Save Attendance
  const handleSaveAttendance = async () => {
    if (isLocked) {
      alert('Attendance for this date and batch is locked by Admin and cannot be modified.');
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    const recordsToSave = students.map(st => {
      const entry = attendanceMap[st.studentId] || { status: 'Present', remarks: '' };
      return {
        studentId: st.studentId,
        studentName: st.name,
        rollNumber: st.rollNumber || st.regNumber || '',
        attendanceStatus: entry.status,
        remarks: entry.remarks,
        studentPhoto: st.avatar || ''
      };
    });

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': facultyName
        },
        body: JSON.stringify({
          attendanceDate: selectedDate,
          courseId: selectedCourse,
          courseName: selectedCourse,
          batchId: selectedBatch,
          batchName: selectedBatch,
          subjectId: selectedSubject,
          subjectName: selectedSubject,
          classPeriod: selectedPeriod,
          facultyId,
          facultyName,
          records: recordsToSave
        })
      });

      const data = await res.json();
      if (data.success) {
        setSaveMessage({
          type: 'success',
          text: `Attendance Register Saved Successfully! (${data.savedCount} student records synced to central database)`
        });
        fetchStudentsAndAttendance();
      } else {
        setSaveMessage({
          type: 'error',
          text: data.message || 'Failed to save attendance.'
        });
      }
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: 'Network error saving attendance. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Calculated Stats
  const filteredStudents = students.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const currentStatus = attendanceMap[st.studentId]?.status || 'Present';
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = students.length;
  const attendanceValues = Object.values(attendanceMap) as { status: AttendanceStatus; remarks: string }[];
  const presentCount = attendanceValues.filter(v => v.status === 'Present').length;
  const absentCount = attendanceValues.filter(v => v.status === 'Absent').length;
  const lateCount = attendanceValues.filter(v => v.status === 'Late').length;
  const leaveCount = attendanceValues.filter(v => v.status === 'Leave' || v.status === 'Half Day').length;
  const presentRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Prepare full records list for export
  const currentAttendanceRecords: AttendanceRecord[] = students.map(st => {
    const entry = attendanceMap[st.studentId] || { status: 'Present', remarks: '' };
    return {
      id: `export-${st.studentId}`,
      studentId: st.studentId,
      studentName: st.name,
      rollNumber: st.rollNumber || '',
      courseId: selectedCourse,
      courseName: selectedCourse,
      batchId: selectedBatch,
      batchName: selectedBatch,
      subjectId: selectedSubject,
      subjectName: selectedSubject,
      facultyId,
      facultyName,
      attendanceDate: selectedDate,
      classPeriod: selectedPeriod,
      attendanceStatus: entry.status,
      remarks: entry.remarks,
      studentPhoto: st.avatar || '',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Calendar className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Faculty Attendance Portal
              </span>
              {isLocked && (
                <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-400" /> Attendance Locked
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Student Attendance Management System
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Mark, edit, lock, track daily batch presence, export Excel/PDF registers, and notify parents/students for low attendance.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportAttendanceToExcel(currentAttendanceRecords, `Attendance_${selectedCourse}_${selectedDate}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
            </button>
            <button
              onClick={() => exportAttendanceToPdf(currentAttendanceRecords, `Attendance Register (${selectedDate})`)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => printAttendanceRegister(currentAttendanceRecords, `Attendance Register - ${selectedCourse}`)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Register
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Previous Attendance Logs
        </button>
      </div>

      {activeTab === 'register' && (
        <>
          {/* Class Context Selector Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" /> Class Session & Course Context
              </h3>
              <button
                onClick={fetchStudentsAndAttendance}
                disabled={loading}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADCA (Advanced Diploma in Computer Applications)">ADCA (1 Year)</option>
                  <option value="DCA (Diploma in Computer Applications)">DCA (6 Months)</option>
                  <option value="PGDCA (Post Graduate Diploma)">PGDCA (1 Year)</option>
                  <option value="Python Programming & AI/ML Basics">Python Programming</option>
                  <option value="Tally Prime with GST & Payroll">Tally Prime GST</option>
                  <option value="Full Stack Web Development (MERN)">Full Stack Web Dev</option>
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Select Batch
                </label>
                <select
                  value={selectedBatch}
                  onChange={e => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Morning 08:00 AM - 10:00 AM">Morning (08:00 AM - 10:00 AM)</option>
                  <option value="Mid-Day 11:00 AM - 01:00 PM">Mid-Day (11:00 AM - 01:00 PM)</option>
                  <option value="Afternoon 02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                  <option value="Evening 05:00 PM - 07:00 PM">Evening (05:00 PM - 07:00 PM)</option>
                  <option value="Weekend Special Batch">Weekend Special</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MS Office & Advanced Excel">MS Office & Advanced Excel</option>
                  <option value="Tally Prime & GST Filing">Tally Prime & GST</option>
                  <option value="Python Fundamentals & Loops">Python Fundamentals</option>
                  <option value="Computer Fundamentals & OS">Computer Fundamentals</option>
                  <option value="HTML5, CSS3 & JavaScript">Web Designing</option>
                </select>
              </div>

              {/* Class Period */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Class Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Period 1 (08:00 AM - 09:30 AM)">Period 1 (08:00 AM - 09:30 AM)</option>
                  <option value="Period 2 (10:00 AM - 11:30 AM)">Period 2 (10:00 AM - 11:30 AM)</option>
                  <option value="Period 3 (05:00 PM - 06:30 PM)">Period 3 (05:00 PM - 06:30 PM)</option>
                  <option value="Practical Computer Lab Session">Practical Lab Session</option>
                </select>
              </div>
            </div>

            {isLocked && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  <strong>Attendance Locked:</strong> {lockInfo || 'This date and batch has been locked by Admin. Changes are prohibited.'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold">Total Students</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-center">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">Present (P)</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 text-center">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold">Absent (A)</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentCount}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 text-center">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">Late (L)</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{lateCount}</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-center col-span-2 sm:col-span-1">
              <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">Attendance Rate</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{presentRate}%</p>
            </div>
          </div>

          {/* Quick Marking Actions & Search Row */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Mark:</span>
              <button
                onClick={() => handleMarkAll('Present')}
                disabled={isLocked}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" /> Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('Absent')}
                disabled={isLocked}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <UserX className="w-3.5 h-3.5" /> Mark All Absent
              </button>
            </div>

            {/* Search & Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="Present">Present (P)</option>
                <option value="Absent">Absent (A)</option>
                <option value="Late">Late (L)</option>
                <option value="Leave">Leave (LV)</option>
                <option value="Half Day">Half Day (HD)</option>
              </select>
            </div>
          </div>

          {/* Save Status Notification Banner */}
          {saveMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm ${
                saveMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{saveMessage.text}</span>
              </div>
              <button onClick={() => setSaveMessage(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
          )}

          {/* Student Roster Register Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">
                Student Attendance Register ({filteredStudents.length} Students)
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                Date: {selectedDate} | {selectedSubject}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                Loading student roster and class records...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-xs">
                No students found matching current filters or course enrollment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">#</th>
                      <th className="p-3">Student Info</th>
                      <th className="p-3">Roll & Reg No.</th>
                      <th className="p-3">Course & Batch</th>
                      <th className="p-3 text-center">Attendance Status</th>
                      <th className="p-3">Remarks / Note</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredStudents.map((st, idx) => {
                      const entry = attendanceMap[st.studentId] || { status: 'Present', remarks: '' };

                      return (
                        <tr
                          key={st.studentId}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            entry.status === 'Absent' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-slate-400">{idx + 1}</td>

                          {/* Student Photo & Name */}
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {st.avatar ? (
                                <img
                                  src={st.avatar}
                                  alt={st.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-sm">
                                  {st.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">{st.name}</p>
                                <span className="text-[11px] text-slate-500 font-mono">{st.studentId}</span>
                              </div>
                            </div>
                          </td>

                          {/* Roll No */}
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                              {st.rollNumber || st.regNumber || 'PCTA2026101'}
                            </span>
                          </td>

                          {/* Course & Batch */}
                          <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{st.course}</p>
                            <span className="text-[10px] text-slate-500">{st.batch}</span>
                          </td>

                          {/* Status Buttons */}
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => handleStatusChange(st.studentId, 'Present')}
                                disabled={isLocked}
                                title="Present"
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                                  entry.status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.studentId, 'Absent')}
                                disabled={isLocked}
                                title="Absent"
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                                  entry.status === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.studentId, 'Late')}
                                disabled={isLocked}
                                title="Late Arrival"
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                                  entry.status === 'Late'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                                }`}
                              >
                                L
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.studentId, 'Half Day')}
                                disabled={isLocked}
                                title="Half Day"
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                                  entry.status === 'Half Day'
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                                }`}
                              >
                                HD
                              </button>
                              <button
                                onClick={() => handleStatusChange(st.studentId, 'Leave')}
                                disabled={isLocked}
                                title="Authorized Leave"
                                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                                  entry.status === 'Leave'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                                }`}
                              >
                                LV
                              </button>
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="p-3">
                            <input
                              type="text"
                              disabled={isLocked}
                              placeholder="Add optional remark..."
                              value={entry.remarks}
                              onChange={e => handleRemarksChange(st.studentId, e.target.value)}
                              className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                            />
                          </td>

                          {/* Notify Action */}
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setNotifyingStudent(st);
                                setNotifySuccess(false);
                                setShowNotifyModal(true);
                              }}
                              title="Notify Student / Parent"
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                            >
                              <Send className="w-3 h-3" /> Notify
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Save Action Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-bold">
                Logged in Faculty: <span className="text-slate-900 dark:text-white font-black">{facultyName}</span>
              </div>
              <button
                onClick={handleSaveAttendance}
                disabled={saving || isLocked || filteredStudents.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving Register...' : 'Save & Sync Attendance Register'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Recent Attendance Logs ({historyRecords.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                Viewing attendance records saved for {selectedCourse} ({selectedDate})
              </p>
            </div>
            <button
              onClick={() => printAttendanceRegister(historyRecords, `Attendance Log - ${selectedDate}`)}
              className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print History
            </button>
          </div>

          {historyRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold text-xs">
              No saved attendance logs found for this date & course filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3">Date</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Course / Batch</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Faculty</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {historyRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{r.attendanceDate}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{r.studentName}</td>
                      <td className="p-3 font-mono text-slate-500">{r.rollNumber || r.studentId}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{r.courseName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{r.subjectName}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            r.attendanceStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : r.attendanceStatus === 'Absent'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {r.attendanceStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{r.facultyName}</td>
                      <td className="p-3 text-slate-500">{r.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SIMULATED NOTIFY MODAL */}
      {showNotifyModal && notifyingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" /> Send Attendance Notification
              </h3>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs space-y-1">
              <p>
                <strong>Student:</strong> {notifyingStudent.name} ({notifyingStudent.studentId})
              </p>
              <p>
                <strong>Mobile:</strong> +91 {notifyingStudent.mobile || '9826012345'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className="font-black text-rose-600">
                  {attendanceMap[notifyingStudent.studentId]?.status || 'Absent'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Notification Channel</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <label className="p-2 border rounded-xl flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800">
                  <input type="checkbox" defaultChecked /> SMS
                </label>
                <label className="p-2 border rounded-xl flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800">
                  <input type="checkbox" defaultChecked /> WhatsApp
                </label>
                <label className="p-2 border rounded-xl flex items-center gap-1.5 cursor-pointer bg-slate-50 dark:bg-slate-800">
                  <input type="checkbox" defaultChecked /> Email
                </label>
              </div>
            </div>

            {notifySuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Notification dispatched to Student & Guardian!
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setNotifySuccess(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
                >
                  Send Alert
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
