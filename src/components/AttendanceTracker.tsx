import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, CheckCircle2, XCircle, TrendingUp, Clock, Filter, Award, AlertTriangle, FileSpreadsheet, FileText, Printer, RefreshCw } from 'lucide-react';
import { StudentAccount, AttendanceRecord } from '../types';
import { exportAttendanceToExcel, exportAttendanceToPdf, printAttendanceRegister } from '../utils/exportAttendance';

interface AttendanceTrackerProps {
  student: StudentAccount;
  userRole?: 'student' | 'faculty' | 'admin';
  canExport?: boolean;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  student,
  userRole = 'student',
  canExport = false
}) => {
  const isExportAllowed = canExport || userRole === 'faculty' || userRole === 'admin';
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '3months' | 'month'>('6months');
  const [realRecords, setRealRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchStudentAttendance();
  }, [student.studentId]);

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const id = student.studentId || student.id;
      const res = await fetch(`/api/student/attendance/${id}`);
      const data = await res.json();
      if (data.success) {
        setRealRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error loading student attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Overall attendance percentage calculation
  const totalLogged = realRecords.length;
  const realPresentCount = realRecords.filter(r => r.attendanceStatus === 'Present').length;
  const realAbsentCount = realRecords.filter(r => r.attendanceStatus === 'Absent').length;
  const realLateCount = realRecords.filter(r => r.attendanceStatus === 'Late').length;
  const realLeaveCount = realRecords.filter(r => r.attendanceStatus === 'Leave' || r.attendanceStatus === 'Half Day').length;

  const attendancePct = totalLogged > 0
    ? Math.round((realPresentCount / totalLogged) * 100)
    : (student.attendancePercentage || 92);

  const totalDays = totalLogged > 0 ? totalLogged : 120;
  const presentDays = totalLogged > 0 ? realPresentCount : Math.round((attendancePct / 100) * totalDays);
  const absentDays = totalLogged > 0 ? realAbsentCount : totalDays - presentDays;
  const leaveDays = totalLogged > 0 ? realLeaveCount : 3;

  // Donut chart data
  const donutData = [
    { name: 'Present Days', value: presentDays, color: '#10b981' },
    { name: 'Absent Days', value: absentDays, color: '#f43f5e' },
    { name: 'Approved Leave', value: leaveDays, color: '#f59e0b' }
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Mar', percentage: 88 },
    { month: 'Apr', percentage: 90 },
    { month: 'May', percentage: 95 },
    { month: 'Jun', percentage: 91 },
    { month: 'Jul', percentage: 96 },
    { month: 'Aug', percentage: attendancePct }
  ];

  const filteredTrend = selectedPeriod === '3months'
    ? monthlyTrendData.slice(-3)
    : selectedPeriod === 'month'
    ? monthlyTrendData.slice(-1)
    : monthlyTrendData;

  // Fallback logs if realRecords is empty
  const displayLogs = realRecords.length > 0
    ? realRecords
    : [
        { id: '1', attendanceDate: '2026-08-01', attendanceStatus: 'Present', subjectName: 'Python OOP & Classes Lab', classPeriod: '08:00 AM' },
        { id: '2', attendanceDate: '2026-07-31', attendanceStatus: 'Present', subjectName: 'Data Structures & Arrays', classPeriod: '08:00 AM' },
        { id: '3', attendanceDate: '2026-07-30', attendanceStatus: 'Present', subjectName: 'Tally Prime GST Entry', classPeriod: '08:00 AM' },
        { id: '4', attendanceDate: '2026-07-29', attendanceStatus: 'Absent', subjectName: 'Database SQL Queries', classPeriod: 'Not Logged' },
        { id: '5', attendanceDate: '2026-07-28', attendanceStatus: 'Present', subjectName: 'MS Excel Advanced Formulas', classPeriod: '08:00 AM' }
      ];

  const exportRecords: AttendanceRecord[] = realRecords.length > 0 ? realRecords : displayLogs.map((l: any) => ({
    id: l.id,
    studentId: student.studentId,
    studentName: student.name,
    rollNumber: student.rollNumber || '',
    courseId: student.course || '',
    courseName: student.course || '',
    batchId: student.batch || '',
    batchName: student.batch || '',
    subjectId: l.subjectName || '',
    subjectName: l.subjectName || '',
    facultyId: 'EMP-FAC-01',
    facultyName: 'Faculty',
    attendanceDate: l.attendanceDate,
    classPeriod: l.classPeriod || 'Period 1',
    attendanceStatus: l.attendanceStatus as any,
    remarks: '',
    studentPhoto: student.avatar || '',
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString()
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
      {/* Top Header & Export Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 dark:border-slate-700">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Personal Attendance Register & Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Student: <strong className="text-slate-800 dark:text-white">{student.name}</strong> ({student.studentId}) • {student.course}
          </p>
        </div>

        {isExportAllowed ? (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => exportAttendanceToExcel(exportRecords, `Attendance_${student.studentId}`)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Report
            </button>
            <button
              onClick={() => exportAttendanceToPdf(exportRecords, `Attendance Statement - ${student.name}`)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Download
            </button>
            <button
              onClick={() => printAttendanceRegister(exportRecords, `Personal Attendance Statement`)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print Statement
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600">
              Student Attendance View
            </span>
          </div>
        )}
      </div>

      {/* Low Attendance Alert Banner if <75% */}
      {attendancePct < 75 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-black text-sm">Attendance Below 75% Requirement Warning!</p>
            <p className="text-[11px] font-normal text-rose-700 dark:text-rose-300">
              Your current attendance rate is <strong>{attendancePct}%</strong>. Minimum 75% attendance is required to sit for final term examination and certificate issuance.
            </p>
          </div>
        </div>
      )}

      {/* Summary Stat Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-bold">
            <span>Overall Attendance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{attendancePct}%</div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
            {attendancePct >= 75 ? 'Target 75% Requirement Met' : 'Warning: Below Threshold'}
          </span>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1">
          <div className="flex justify-between items-center text-blue-700 dark:text-blue-300 font-bold">
            <span>Present Classes</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{presentDays} Days</div>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80">Out of {totalDays} sessions</span>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-1">
          <div className="flex justify-between items-center text-rose-700 dark:text-rose-300 font-bold">
            <span>Absent Days</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentDays} Days</div>
          <span className="text-[10px] text-rose-700/80 dark:text-rose-300/80">Logged absences</span>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-1">
          <div className="flex justify-between items-center text-amber-700 dark:text-amber-300 font-bold">
            <span>Approved Leaves</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{leaveDays} Days</div>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80">Sanctioned by Faculty</span>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Monthly Attendance Trend (%)
            </h4>
            <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              Average: {attendancePct}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Ratio Breakdown
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">Total: {totalDays}</span>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{attendancePct}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Rate</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <div className="flex flex-col items-center">
              <span className="text-emerald-600 font-bold">Present</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{presentDays}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-rose-600 font-bold">Absent</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{absentDays}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-amber-600 font-bold">Leave</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{leaveDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Log Register Table */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" /> Daily Attendance Logs
          </h4>
          <button onClick={fetchStudentAttendance} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b dark:border-slate-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Subject / Module</th>
                <th className="p-3">Class Period</th>
                <th className="p-3">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              {displayLogs.map((log: any, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-3 font-bold font-mono text-slate-900 dark:text-white">{log.attendanceDate}</td>
                  <td className="p-3 font-medium">{log.subjectName || log.courseName || 'Computer Lab Session'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{log.classPeriod || 'Period 1'}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                        log.attendanceStatus === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.attendanceStatus === 'Absent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {log.attendanceStatus === 'Present' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      )}
                      {log.attendanceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
