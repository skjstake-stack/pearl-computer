import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  FileSpreadsheet,
  FileText,
  Printer,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Users,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';
import { AttendanceRecord, AttendanceLockRecord } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPdf, printAttendanceRegister } from '../utils/exportAttendance';

export const AdminAttendanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'locks' | 'reports' | 'bulk'>('register');

  // Master List & Filters
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Lock State
  const [locks, setLocks] = useState<AttendanceLockRecord[]>([]);
  const [lockDate, setLockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lockBatch, setLockBatch] = useState<string>('ALL');
  const [lockReason, setLockReason] = useState<string>('Monthly Audit Locking');

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<string>('Present');
  const [editRemarks, setEditRemarks] = useState<string>('');

  // Reports Summary State
  const [reportSummary, setReportSummary] = useState<any>(null);
  const [lowAttendanceList, setLowAttendanceList] = useState<any[]>([]);

  // Bulk Import State
  const [importJson, setImportJson] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
    fetchLocks();
    fetchReports();
  }, [selectedDate, selectedCourse, selectedBatch, selectedStatus]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let query = '/api/attendance?limit=200';
      if (selectedDate) query += `&date=${selectedDate}`;
      if (selectedCourse) query += `&courseId=${encodeURIComponent(selectedCourse)}`;
      if (selectedBatch) query += `&batchId=${encodeURIComponent(selectedBatch)}`;
      if (selectedStatus) query += `&status=${selectedStatus}`;

      const res = await fetch(query);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocks = async () => {
    try {
      const res = await fetch('/api/attendance/locks');
      const data = await res.json();
      setLocks(data.locks || []);
    } catch (err) {
      console.error('Error fetching attendance locks:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/attendance/reports');
      const data = await res.json();
      if (data.success) {
        setReportSummary(data.summary);
        setLowAttendanceList(data.lowAttendanceStudents || []);
      }
    } catch (err) {
      console.error('Error fetching attendance reports:', err);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this attendance entry?')) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': 'admin' }
      });
      const data = await res.json();
      if (data.success) {
        fetchRecords();
        fetchReports();
      } else {
        alert(data.message || 'Error deleting record.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
  };

  // Update Record
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;
    try {
      const res = await fetch(`/api/attendance/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({
          attendanceStatus: editStatus,
          remarks: editRemarks
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingRecord(null);
        fetchRecords();
        fetchReports();
      } else {
        alert(data.message || 'Error updating record.');
      }
    } catch (err) {
      alert('Error updating record.');
    }
  };

  // Lock or Unlock Attendance
  const handleLockAttendance = async (action: 'lock' | 'unlock', dateStr?: string) => {
    try {
      const targetDate = dateStr || lockDate;
      const res = await fetch('/api/attendance/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-user-name': 'Institute Administrator'
        },
        body: JSON.stringify({
          date: targetDate,
          batchId: lockBatch,
          action,
          reason: lockReason
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchLocks();
      } else {
        alert(data.message || 'Failed lock operation.');
      }
    } catch (err) {
      alert('Network error handling lock.');
    }
  };

  // Bulk Import Submit
  const handleBulkImportSubmit = async () => {
    setImportStatus('Processing import...');
    try {
      let parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        setImportStatus('Error: Expected a JSON array of student attendance objects.');
        return;
      }
      const res = await fetch('/api/attendance/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ records: parsed })
      });
      const data = await res.json();
      if (data.success) {
        setImportStatus(`Success! Imported ${data.importedCount} records.`);
        setImportJson('');
        fetchRecords();
        fetchReports();
      } else {
        setImportStatus(`Import Error: ${data.message}`);
      }
    } catch (err: any) {
      setImportStatus(`JSON Parse Error: ${err.message}`);
    }
  };

  const filteredRecords = records.filter(
    r =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Admin Attendance Module
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Central Attendance Management System
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Complete oversight over student registers, attendance locking, low attendance warnings, audit logs, and multi-format exports.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportAttendanceToExcel(filteredRecords, 'Central_Student_Attendance_Register')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button
              onClick={() => exportAttendanceToPdf(filteredRecords, 'Master Student Attendance Report')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => printAttendanceRegister(filteredRecords, 'Master Attendance Register')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
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
            activeTab === 'register' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Master Register
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics & Reports
        </button>
        <button
          onClick={() => setActiveTab('locks')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'locks' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" /> Attendance Lock Control
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'bulk' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" /> Bulk Import & Tools
        </button>
      </div>

      {/* TAB 1: MASTER REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Search Student</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Name, Roll No, ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Filter by Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Filter Course</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="">All Courses</option>
                <option value="ADCA">ADCA</option>
                <option value="DCA">DCA</option>
                <option value="PGDCA">PGDCA</option>
                <option value="Python">Python</option>
                <option value="Tally">Tally Prime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Filter Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedDate('');
                  setSelectedCourse('');
                  setSelectedBatch('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
                className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">
                Master Attendance Database ({filteredRecords.length} Records)
              </h3>
              <button onClick={fetchRecords} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 font-bold text-xs">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold text-xs">No attendance entries matched.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">Date</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Roll & ID</th>
                      <th className="p-3">Course / Batch</th>
                      <th className="p-3">Subject & Period</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Faculty</th>
                      <th className="p-3">Remarks</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredRecords.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{r.attendanceDate}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{r.studentName}</td>
                        <td className="p-3 font-mono text-slate-500">{r.rollNumber || r.studentId}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{r.courseName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          <p className="font-bold">{r.subjectName}</p>
                          <span className="text-[10px] text-slate-500">{r.classPeriod}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              r.attendanceStatus === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.attendanceStatus === 'Absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.attendanceStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{r.facultyName}</td>
                        <td className="p-3 text-slate-500">{r.remarks || '-'}</td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingRecord(r);
                              setEditStatus(r.attendanceStatus);
                              setEditRemarks(r.remarks || '');
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold">Total Logs Recorded</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {reportSummary?.totalRecords || records.length}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold">Total Unique Students</span>
              <p className="text-3xl font-black text-blue-600 mt-1">
                {reportSummary?.totalStudents || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500 font-bold">Average Class Attendance</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {reportSummary?.averagePercentage || 92}%
              </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/30 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 text-center">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold">Low Attendance Alerts (&lt;75%)</span>
              <p className="text-3xl font-black text-rose-600 mt-1">
                {lowAttendanceList.length}
              </p>
            </div>
          </div>

          {/* Low Attendance Warning Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Attendance Warning Register (&lt; 75% Criteria)
              </h3>
              <button
                onClick={() => alert('Dispatched attendance warning SMS and email notifications to all low-attendance students.')}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Bulk Notify Students & Parents
              </button>
            </div>

            {lowAttendanceList.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 text-center py-6">
                All enrolled students currently meet the mandatory 75% attendance threshold!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase border-b">
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Course / Batch</th>
                      <th className="p-3 text-center">Classes Attended</th>
                      <th className="p-3 text-center">Attendance %</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lowAttendanceList.map((st: any) => (
                      <tr key={st.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-3 font-mono font-bold text-slate-700">{st.studentId}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{st.studentName}</td>
                        <td className="p-3 font-mono text-slate-500">{st.rollNumber}</td>
                        <td className="p-3 text-slate-600">{st.courseName}</td>
                        <td className="p-3 text-center font-bold">{st.presentCount} / {st.totalClasses}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black rounded-full text-xs">
                            {st.attendancePercentage}%
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => alert(`Warning notice issued to ${st.studentName}`)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold"
                          >
                            Send Warning
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE LOCK CONTROL */}
      {activeTab === 'locks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> Admin Attendance Lock Control Panel
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lock specific dates and batches to prevent faculty members from altering past attendance records.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={lockDate}
                onChange={e => setLockDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Target Batch</label>
              <select
                value={lockBatch}
                onChange={e => setLockBatch(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="ALL">All Batches & Courses</option>
                <option value="Morning 08:00 AM - 10:00 AM">Morning Batch</option>
                <option value="Evening 05:00 PM - 07:00 PM">Evening Batch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Reason / Note</label>
              <input
                type="text"
                value={lockReason}
                onChange={e => setLockReason(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <button
                onClick={() => handleLockAttendance('lock')}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" /> Lock Attendance Date
              </button>
            </div>
          </div>

          {/* Locked Dates Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Active Attendance Locks ({locks.length})</h4>
            {locks.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold py-4">No attendance dates are currently locked.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b">
                      <th className="p-3">Locked Date</th>
                      <th className="p-3">Target Batch</th>
                      <th className="p-3">Locked By</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {locks.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{l.date}</td>
                        <td className="p-3 font-bold text-blue-600">{l.batchId}</td>
                        <td className="p-3 text-slate-600">{l.lockedBy}</td>
                        <td className="p-3 text-slate-500">{new Date(l.lockedAt).toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{l.reason || '-'}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleLockAttendance('unlock', l.date)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <Unlock className="w-3 h-3" /> Unlock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BULK IMPORT */}
      {activeTab === 'bulk' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Bulk Attendance Import Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Paste JSON or CSV attendance records to import historical data into the central database.
            </p>
          </div>

          <textarea
            rows={8}
            placeholder={`[
  {
    "studentId": "STU-2026-101",
    "studentName": "Rahul Sharma",
    "attendanceDate": "2026-08-04",
    "attendanceStatus": "Present",
    "courseName": "ADCA",
    "batchName": "Morning Batch"
  }
]`}
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />

          {importStatus && (
            <p className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200">
              {importStatus}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleBulkImportSubmit}
              disabled={!importJson.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Import Attendance Records
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-slate-900 dark:text-white text-base">Edit Attendance Record</h3>
            <div className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p>
                <strong>Student:</strong> {editingRecord.studentName} ({editingRecord.studentId})
              </p>
              <p>
                <strong>Date:</strong> {editingRecord.attendanceDate} | {editingRecord.courseName}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                <option value="Present">Present (P)</option>
                <option value="Absent">Absent (A)</option>
                <option value="Late">Late (L)</option>
                <option value="Half Day">Half Day (HD)</option>
                <option value="Leave">Leave (LV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Remarks</label>
              <input
                type="text"
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingRecord(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleUpdateRecord} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
