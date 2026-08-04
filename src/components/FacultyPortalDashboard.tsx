import React, { useState } from 'react';
import {
  User,
  BookOpen,
  CheckCircle2,
  Upload,
  FileText,
  Video,
  Award,
  LogOut,
  Plus,
  Clock,
  Calendar,
  Key,
  Shield,
  FileCheck,
  Bell,
  Send,
  Users,
  Eye,
  Check,
  AlertCircle
} from 'lucide-react';
import { UserSession } from '../types';
import { sampleStudents } from '../data/mockData';
import { FacultyAttendanceModule } from './FacultyAttendanceModule';

interface FacultyPortalDashboardProps {
  currentUser: UserSession;
  onLogout: () => void;
}

export const FacultyPortalDashboard: React.FC<FacultyPortalDashboardProps> = ({
  currentUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'attendance' | 'marks' | 'assignments' | 'notes' | 'videos' | 'students' | 'notices' | 'leave' | 'profile' | 'security'
  >('overview');

  // Attendance State
  const [attendanceList, setAttendanceList] = useState(
    sampleStudents.map(s => ({ ...s, present: true }))
  );
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // Notes & Material State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCourse, setNoteCourse] = useState('DCA (Diploma in Computer Applications)');
  const [uploadedNotes, setUploadedNotes] = useState([
    { id: '1', title: 'Python OOP & Inheritance Guide.pdf', course: 'Python Programming', date: '2026-07-28' },
    { id: '2', title: 'Tally Prime GST Return Filing Notes.pdf', course: 'Tally Prime with GST', date: '2026-07-25' }
  ]);
  const [uploadMsg, setUploadMsg] = useState('');

  // Video / Live Class State
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoList, setVideoList] = useState([
    { id: 'v1', title: 'Python Control Flow & Loops Live Lecture', url: 'https://youtube.com/watch?v=sample', date: '2026-07-30' }
  ]);

  // Leave Request State
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'l1', dates: '2026-07-10 to 2026-07-12', reason: 'Medical Checkup', status: 'Approved' }
  ]);
  const [leaveMsg, setLeaveMsg] = useState('');

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Validate 2026 Password Rules
  const validatePasswordRules = (pass: string) => {
    const minLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    const hasSpec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    return { minLen, hasUpper, hasLower, hasNum, hasSpec, isValid: minLen && hasUpper && hasLower && hasNum && hasSpec };
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New Password and Confirm Password do not match.' });
      return;
    }

    const rules = validatePasswordRules(newPass);
    if (!rules.isValid) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters long with uppercase, lowercase, number, and special character.' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id || currentUser.employeeId,
          role: 'faculty',
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      const data = await res.json();
      if (data.success) {
        setPassMsg({ type: 'success', text: 'Password updated successfully! Next logins will require your new secure password.' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: 'Server connection error.' });
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const newNote = {
      id: `n-${Date.now()}`,
      title: `${noteTitle}.pdf`,
      course: noteCourse,
      date: new Date().toISOString().split('T')[0]
    };
    setUploadedNotes([newNote, ...uploadedNotes]);
    setUploadMsg(`Study Note "${noteTitle}" published successfully!`);
    setNoteTitle('');
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;
    setVideoList([{ id: `v-${Date.now()}`, title: videoTitle, url: videoUrl || 'https://meet.google.com/sample', date: new Date().toISOString().split('T')[0] }, ...videoList]);
    setVideoTitle('');
    setVideoUrl('');
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    const newLeave = {
      id: `l-${Date.now()}`,
      dates: `${leaveStartDate} to ${leaveEndDate}`,
      reason: leaveReason,
      status: 'Pending Admin Review'
    };
    setLeaveRequests([newLeave, ...leaveRequests]);
    setLeaveMsg('Leave application submitted to Institute Admin successfully.');
    setLeaveReason('');
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Faculty Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-blue-800/40">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Authorized Faculty
                </span>
                <span className="text-xs text-blue-200 font-mono font-bold">
                  EMP: {currentUser.employeeId || 'EMP-FAC-01'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{currentUser.name}</h1>
              <p className="text-xs text-blue-200 mt-0.5">
                Senior Technical Instructor • {currentUser.branch || 'Main Branch - Tower Square'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('security')}
              className="bg-blue-800/60 hover:bg-blue-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-blue-600/50"
            >
              <Key className="w-4 h-4 text-orange-400" /> Security & Password
            </button>
            <button
              onClick={onLogout}
              className="bg-red-600/80 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto flex gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'courses' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Assigned Courses
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'attendance' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'marks' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Marks & Exam Results
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'notes' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Study Notes & Material
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'videos' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Video Lectures & Live
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'students' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Assigned Students
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'leave' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Apply Leave
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'security' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-sm">
                <span className="text-slate-500 font-bold">Assigned Courses</span>
                <div className="text-2xl font-extrabold text-blue-600">
                  {currentUser.coursesAssigned ? currentUser.coursesAssigned.length : 2} Courses
                </div>
                <div className="text-[11px] text-slate-400">DCA, ADCA, Python & AI</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-sm">
                <span className="text-slate-500 font-bold">Enrolled Students</span>
                <div className="text-2xl font-extrabold text-orange-500">50 Students</div>
                <div className="text-[11px] text-slate-400">Morning & Evening Batches</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-sm">
                <span className="text-slate-500 font-bold">Attendance Rate</span>
                <div className="text-2xl font-extrabold text-emerald-600">94.2%</div>
                <div className="text-[11px] text-slate-400">This Month Average</div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-sm">
                <span className="text-slate-500 font-bold">Notes & Materials Uploaded</span>
                <div className="text-2xl font-extrabold text-indigo-600">{uploadedNotes.length} Materials</div>
                <div className="text-[11px] text-slate-400">Accessible by Students</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Today's Scheduled Classes & Batches
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">DCA Batch A (Fundamentals & MS Office)</div>
                      <div className="text-slate-500">08:00 AM - 09:30 AM • Lab Room 1</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Take Attendance
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Python Programming & AI Basics</div>
                      <div className="text-slate-500">05:00 PM - 06:30 PM • Software Lab</div>
                    </div>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Upload Notes
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" /> Departmental Bulletins & Notices
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/80 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="font-bold text-blue-900 dark:text-blue-100">Monthly Syllabus Review Meeting</div>
                    <p className="text-slate-600 dark:text-blue-200 text-[11px]">All faculty members are requested to attend tomorrow's syllabus audit at 04:00 PM in Conference Room B.</p>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-950/80 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <div className="font-bold text-orange-900 dark:text-orange-100">Midterm Examination Schedule Upload</div>
                    <p className="text-slate-600 dark:text-orange-200 text-[11px]">Kindly submit DCA and Tally midterm question papers by Friday.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED COURSES */}
        {activeTab === 'courses' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Assigned Courses & Syllabus Tracking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">DCA-MODULE-1</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Diploma in Computer Applications (DCA)</h4>
                    <p className="text-slate-500">6 Months Course • Morning Batch (08:00 AM)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Active</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Syllabus Completion</span>
                    <span className="text-blue-600">65% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[65%]" />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Modules:</strong> Computer Fundamentals, MS Word/Excel/PowerPoint, Internet & Cyber Security.
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-orange-600">PYTHON-AI-01</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Python Programming & AI/ML Basics</h4>
                    <p className="text-slate-500">3 Months Certificate • Evening Batch (05:00 PM)</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">Active</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span>Syllabus Completion</span>
                    <span className="text-orange-500">40% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full w-[40%]" />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Modules:</strong> Control Structures, OOPs Concepts, Pandas, NumPy, Machine Learning Intro.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <FacultyAttendanceModule facultyName={currentUser?.name} facultyId={currentUser?.employeeId} />
        )}

        {/* TAB 4: MARKS & EXAM RESULTS */}
        {activeTab === 'marks' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Student Exam & Test Marks Entry</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Student ID</th>
                    <th className="p-3">Practical (Out of 50)</th>
                    <th className="p-3">Theory (Out of 50)</th>
                    <th className="p-3">Total Marks</th>
                    <th className="p-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sampleStudents.map((st) => (
                    <tr key={st.id}>
                      <td className="p-3 font-bold text-slate-800 dark:text-white">{st.name}</td>
                      <td className="p-3 font-mono text-blue-600">{st.studentId}</td>
                      <td className="p-3"><input type="number" defaultValue={42} className="w-16 px-2 py-1 bg-slate-50 border rounded-lg font-bold" /></td>
                      <td className="p-3"><input type="number" defaultValue={45} className="w-16 px-2 py-1 bg-slate-50 border rounded-lg font-bold" /></td>
                      <td className="p-3 font-extrabold text-emerald-600">87 / 100</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">A+</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => alert('Marks saved successfully.')}
              className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md"
            >
              Save Test Marks & Issue Performance Reports
            </button>
          </div>
        )}

        {/* TAB 5: STUDY NOTES & MATERIAL */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Upload Handwritten Study Material / PDFs</h3>

              {uploadMsg && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs">{uploadMsg}</div>}

              <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Title of Study Material</label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Python Exception Handling Practice Sheet"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Assigned Course</label>
                  <select
                    value={noteCourse}
                    onChange={(e) => setNoteCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  >
                    <option value="DCA (Diploma in Computer Applications)">DCA</option>
                    <option value="ADCA (Advanced Diploma in Computer Applications)">ADCA</option>
                    <option value="Tally Prime with GST & Payroll">Tally Prime with GST</option>
                    <option value="Python Programming & AI/ML Basics">Python Programming</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Upload & Distribute to Students
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Published Study Materials</h3>
              <div className="space-y-2 text-xs">
                {uploadedNotes.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                      <div className="text-slate-500">{n.course} • {n.date}</div>
                    </div>
                    <span className="text-emerald-600 font-bold text-[10px]">Published</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: VIDEO LECTURES & LIVE */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Video Lecture or Live Class Link</h3>

              <form onSubmit={handleVideoSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Lecture Topic / Title</label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Python Functions & Lambda Live Lecture"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Video / Google Meet / Zoom Link</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Post Video / Schedule Live Class
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Video & Live Class Feeds</h3>
              <div className="space-y-2 text-xs">
                {videoList.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{v.title}</div>
                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-mono text-[10px]">
                        {v.url}
                      </a>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ASSIGNED STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Assigned Enrolled Students Directory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {sampleStudents.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600">{s.studentId}</span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</h4>
                      <p className="text-slate-500">{s.course}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Active</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <div><strong>Father:</strong> {s.fatherName || 'Rajesh Vishwakarma'}</div>
                    <div><strong>Mobile:</strong> {s.mobile}</div>
                    <div><strong>Batch:</strong> {s.batch || 'Morning 08:00 AM'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: LEAVE APPLICATION */}
        {activeTab === 'leave' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Apply for Faculty Leave</h3>

              {leaveMsg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">{leaveMsg}</div>}

              <form onSubmit={handleLeaveSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Reason for Leave</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Provide details for leave request..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Submit Leave Request
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">My Leave Application History</h3>

              <div className="space-y-2 text-xs">
                {leaveRequests.map((lr) => (
                  <div key={lr.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{lr.dates}</div>
                      <div className="text-slate-500">{lr.reason}</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-[10px]">
                      {lr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SECURITY & PASSWORD CHANGE */}
        {activeTab === 'security' && (
          <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
            <div className="border-b pb-3 flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Faculty Password & Security Management</h3>
                <p className="text-xs text-slate-500">Update account password using 2026 security rules</p>
              </div>
            </div>

            {passMsg && (
              <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">New Secure Password *</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 8 chars (1 Upper, 1 Lower, 1 Num, 1 Spec)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />

                {/* Live Password Rules Meter */}
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-1 text-[11px]">
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Password Strength Checklist:</div>
                  <div className={newPass.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {newPass.length >= 8 ? '✓' : '•'} At least 8 characters long
                  </div>
                  <div className={/[A-Z]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {/[A-Z]/.test(newPass) ? '✓' : '•'} At least 1 uppercase letter (A-Z)
                  </div>
                  <div className={/[a-z]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {/[a-z]/.test(newPass) ? '✓' : '•'} At least 1 lowercase letter (a-z)
                  </div>
                  <div className={/[0-9]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {/[0-9]/.test(newPass) ? '✓' : '•'} At least 1 number (0-9)
                  </div>
                  <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPass) ? '✓' : '•'} At least 1 special character (!@#$%^&*)
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl cursor-pointer shadow-md transition-colors"
              >
                Update Password & Encrypt Credentials
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
