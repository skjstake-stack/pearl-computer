import React, { useState } from 'react';
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
import { Calendar, CheckCircle2, XCircle, TrendingUp, Clock, Filter, Award } from 'lucide-react';
import { StudentAccount } from '../types';

interface AttendanceTrackerProps {
  student: StudentAccount;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ student }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '3months' | 'month'>('6months');

  // Overall attendance percentage from student object
  const attendancePct = student.attendancePercentage || 92;

  // Working days breakdown (e.g. current term of 120 total working days)
  const totalDays = 120;
  const presentDays = Math.round((attendancePct / 100) * totalDays);
  const absentDays = totalDays - presentDays;
  const leaveDays = 3;

  // Monthly trend data for Line/Area chart
  const monthlyTrendData = [
    { month: 'Mar', percentage: 88, present: 18, absent: 2, total: 20 },
    { month: 'Apr', percentage: 90, present: 19, absent: 2, total: 21 },
    { month: 'May', percentage: 95, present: 21, absent: 1, total: 22 },
    { month: 'Jun', percentage: 91, present: 19, absent: 2, total: 21 },
    { month: 'Jul', percentage: 96, present: 22, absent: 1, total: 23 },
    { month: 'Aug', percentage: Math.min(100, Math.max(70, attendancePct)), present: Math.round((attendancePct / 100) * 22), absent: 22 - Math.round((attendancePct / 100) * 22), total: 22 }
  ];

  const filteredTrend = selectedPeriod === '3months'
    ? monthlyTrendData.slice(-3)
    : selectedPeriod === 'month'
    ? monthlyTrendData.slice(-1)
    : monthlyTrendData;

  // Donut chart data for Present vs Absent
  const donutData = [
    { name: 'Present Days', value: presentDays, color: '#10b981' }, // Emerald-500
    { name: 'Absent Days', value: absentDays, color: '#f43f5e' },  // Rose-500
    { name: 'Approved Leave', value: leaveDays, color: '#f59e0b' } // Amber-500
  ];

  // Recent daily log entries
  const recentLogs = [
    { date: '2026-08-01', day: 'Saturday', status: 'Present', subject: 'Python OOP & Classes Lab', time: '08:05 AM' },
    { date: '2026-07-31', day: 'Friday', status: 'Present', subject: 'Data Structures & Arrays', time: '08:02 AM' },
    { date: '2026-07-30', day: 'Thursday', status: 'Present', subject: 'Tally Prime GST Entry', time: '08:10 AM' },
    { date: '2026-07-29', day: 'Wednesday', status: 'Absent', subject: 'Database SQL Queries', time: 'Not Logged' },
    { date: '2026-07-28', day: 'Tuesday', status: 'Present', subject: 'MS Excel Advanced Formulas', time: '08:00 AM' },
    { date: '2026-07-27', day: 'Monday', status: 'Present', subject: 'Computer Fundamentals', time: '08:04 AM' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 dark:border-slate-700">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Interactive Visual Attendance Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time attendance ratio, monthly progression trend & lab check-in history
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedPeriod('6months')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedPeriod === '6months'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setSelectedPeriod('3months')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedPeriod === '3months'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              selectedPeriod === 'month'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Current Month
          </button>
        </div>
      </div>

      {/* Summary Stat Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300 font-bold">
            <span>Overall Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{attendancePct}%</div>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">Target 75% Requirement Met</span>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1">
          <div className="flex justify-between items-center text-blue-700 dark:text-blue-300 font-bold">
            <span>Present Days</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{presentDays} Days</div>
          <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80">Out of {totalDays} total sessions</span>
        </div>

        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 space-y-1">
          <div className="flex justify-between items-center text-rose-700 dark:text-rose-300 font-bold">
            <span>Absent Days</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentDays} Days</div>
          <span className="text-[10px] text-rose-700/80 dark:text-rose-300/80">Unexcused absences</span>
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

      {/* Recharts Grid (Line Chart & Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monthly Trend Line / Area Chart */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Monthly Attendance Percentage Trend
            </h4>
            <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full">
              Avg: {attendancePct}%
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
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value}% Attendance`, 'Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceGradient)"
                  activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Present vs Absent Donut Chart */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Present vs Absent Days
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">Total: {totalDays}</span>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Donut Badge Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{attendancePct}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ratio</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">{presentDays}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">{absentDays}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Leave
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">{leaveDays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Attendance Log Table */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-500" /> Recent Lab Check-In Register
          </h4>
          <span className="text-[11px] text-slate-500">Auto-logged via QR Code Scan</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b dark:border-slate-700">
              <tr>
                <th className="p-3">Date & Day</th>
                <th className="p-3">Course / Lab Module</th>
                <th className="p-3">Check-In Time</th>
                <th className="p-3">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
              {recentLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-3">
                    <strong className="block text-slate-900 dark:text-white">{log.date}</strong>
                    <span className="text-[10px] text-slate-400">{log.day}</span>
                  </td>
                  <td className="p-3 font-medium">{log.subject}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{log.time}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                      log.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {log.status === 'Present' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                      {log.status}
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
