import React, { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Filter,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  FileSpreadsheet,
  Printer,
  History,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  UserCheck,
  UserX,
  Building,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  Sparkles
} from 'lucide-react';
import { FacultyAccount } from '../types';

interface FacultyManagementModuleProps {
  facultyList: FacultyAccount[];
  onRefreshFaculty: () => void;
}

export const FacultyManagementModule: React.FC<FacultyManagementModuleProps> = ({
  facultyList,
  onRefreshFaculty
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyAccount | null>(null);
  const [resetPassFaculty, setResetPassFaculty] = useState<FacultyAccount | null>(null);
  const [logsFaculty, setLogsFaculty] = useState<FacultyAccount | null>(null);
  const [printFaculty, setPrintFaculty] = useState<FacultyAccount | null>(null);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);

  // Notifications
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Add / Edit Faculty Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    designation: 'Senior Lecturer',
    department: 'Computer Applications & Programming',
    mobile: '',
    email: '',
    username: '',
    password: '',
    branch: 'Main Branch - Tower Square',
    subjects: 'Python Programming, DCA Modules',
    coursesAssigned: 'DCA (Diploma in Computer Applications)',
    status: 'Active' as 'Active' | 'Inactive',
    joiningDate: new Date().toISOString().split('T')[0],
    profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  });

  // Admin Password Reset Form State
  const [resetPassData, setResetPassData] = useState({
    customPassword: '',
    forcePasswordChangeOnLogin: true
  });
  const [showResetPasswordText, setShowResetPasswordText] = useState(false);

  // Bulk Import Text/CSV State
  const [bulkCsvText, setBulkCsvText] = useState('');

  // Password Rules Validation check
  const validatePasswordRules = (pass: string) => {
    const minLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNum = /[0-9]/.test(pass);
    const hasSpec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    return { minLen, hasUpper, hasLower, hasNum, hasSpec, isValid: minLen && hasUpper && hasLower && hasNum && hasSpec };
  };

  // Filtered list
  const filteredFaculty = facultyList.filter(f => {
    const matchSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.mobile.includes(searchTerm);

    const matchDept = deptFilter === 'All' || f.department === deptFilter;
    const matchStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchBranch = branchFilter === 'All' || f.branch === branchFilter;

    return matchSearch && matchDept && matchStatus && matchBranch;
  });

  // Handle Add Faculty Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFaculty) {
      const passVal = validatePasswordRules(formData.password);
      if (!passVal.isValid) {
        showToast('error', 'Password does not meet 2026 security rules (8+ chars, Uppercase, Lowercase, Number, Special char).');
        return;
      }
    }

    try {
      const endpoint = editingFaculty ? `/api/faculty/${editingFaculty.id}` : '/api/faculty';
      const method = editingFaculty ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
        coursesAssigned: formData.coursesAssigned.split(',').map(c => c.trim()).filter(Boolean)
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', data.message || 'Faculty account saved successfully!');
        setShowAddModal(false);
        setEditingFaculty(null);
        onRefreshFaculty();
      } else {
        showToast('error', data.message || 'Failed to save faculty account.');
      }
    } catch (err) {
      showToast('error', 'Server error while saving faculty account.');
    }
  };

  // Toggle Status (Activate / Deactivate)
  const handleToggleStatus = async (fac: FacultyAccount) => {
    const newStatus = fac.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/faculty/${fac.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Faculty ${fac.name} set to ${newStatus}`);
        onRefreshFaculty();
      } else {
        showToast('error', data.message || 'Failed to update status.');
      }
    } catch (err) {
      showToast('error', 'Network error.');
    }
  };

  // Delete Faculty Account
  const handleDeleteFaculty = async (fac: FacultyAccount) => {
    if (!window.confirm(`Are you sure you want to permanently delete faculty account for ${fac.name} (${fac.employeeId})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/faculty/${fac.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        onRefreshFaculty();
      } else {
        showToast('error', data.message);
      }
    } catch (err) {
      showToast('error', 'Failed to delete faculty account.');
    }
  };

  // Admin Reset Password Submit
  const handleAdminResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassFaculty) return;

    const passVal = validatePasswordRules(resetPassData.customPassword);
    if (!passVal.isValid) {
      showToast('error', 'Password must meet all 2026 security requirements.');
      return;
    }

    try {
      const res = await fetch('/api/admin/faculty/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: resetPassFaculty.id,
          newPassword: resetPassData.customPassword,
          forcePasswordChangeOnLogin: resetPassData.forcePasswordChangeOnLogin
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `Password for ${resetPassFaculty.name} reset successfully!`);
        setResetPassFaculty(null);
        onRefreshFaculty();
      } else {
        showToast('error', data.message || 'Failed to reset password.');
      }
    } catch (err) {
      showToast('error', 'Server error during password reset.');
    }
  };

  // Generate Random Compliant Password
  const generateRandomSecurePassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%^&*';

    let pass = '';
    pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
    pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pass += specials.charAt(Math.floor(Math.random() * specials.length));

    const all = uppers + lowers + numbers + specials;
    for (let i = 0; i < 6; i++) {
      pass += all.charAt(Math.floor(Math.random() * all.length));
    }

    setResetPassData(prev => ({ ...prev, customPassword: pass }));
  };

  // Bulk Import Submit
  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    const lines = bulkCsvText.trim().split('\n');
    const parsed: any[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 4 && !parts[0].toLowerCase().includes('name')) {
        parsed.push({
          name: parts[0],
          email: parts[1],
          mobile: parts[2],
          username: parts[3],
          designation: parts[4] || 'Lecturer',
          department: parts[5] || 'Computer Applications',
          password: parts[6] || 'Pass@2026'
        });
      }
    });

    if (parsed.length === 0) {
      showToast('error', 'No valid rows found in CSV data. Ensure CSV follows standard columns.');
      return;
    }

    try {
      const res = await fetch('/api/faculty/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyList: parsed })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', data.message);
        setShowBulkImportModal(false);
        setBulkCsvText('');
        onRefreshFaculty();
      } else {
        showToast('error', data.message || 'Bulk import failed.');
      }
    } catch (err) {
      showToast('error', 'Bulk import failed.');
    }
  };

  // Export CSV File
  const handleExportCSV = () => {
    const headers = ['Employee ID,Name,Designation,Department,Username,Mobile,Email,Branch,Status,Joining Date'];
    const rows = filteredFaculty.map(f =>
      `"${f.employeeId}","${f.name}","${f.designation}","${f.department}","${f.username}","${f.mobile}","${f.email}","${f.branch}","${f.status}","${f.joiningDate}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pearl_Faculty_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`p-4 rounded-2xl border text-xs font-bold shadow-lg flex items-center justify-between ${
          toastMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-500 hover:text-black">✕</button>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Faculty Accounts & Access Control Manager
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Administer instructor profiles, credentials, role permissions, bcrypt security, and audit logs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingFaculty(null);
                setFormData({
                  name: '',
                  employeeId: `EMP-FAC-0${facultyList.length + 1}`,
                  designation: 'Senior Instructor',
                  department: 'Computer Applications & Programming',
                  mobile: '',
                  email: '',
                  username: '',
                  password: '',
                  branch: 'Main Branch - Tower Square',
                  subjects: 'Python Programming, DCA Modules',
                  coursesAssigned: 'DCA (Diploma in Computer Applications)',
                  status: 'Active',
                  joiningDate: new Date().toISOString().split('T')[0],
                  profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
                });
                setShowAddModal(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Faculty
            </button>

            <button
              onClick={() => setShowBulkImportModal(true)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-600" /> Bulk Import
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Employee ID, Username, Email, Mobile..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Computer Applications & Programming">Computer Applications</option>
              <option value="Financial Accounting & Tally">Financial Accounting</option>
              <option value="Digital Marketing & AI">Digital Marketing</option>
              <option value="Competitive Exam Preparation">Target Academy</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Accounts</option>
              <option value="Inactive">Inactive Accounts</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex-1 py-1.5 rounded-lg text-center font-bold cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content Table or Cards */}
      {filteredFaculty.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border p-12 text-center text-slate-500 space-y-2">
          <UserX className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Faculty Accounts Found</h3>
          <p className="text-xs">Try adjusting your search criteria or add a new faculty account.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b dark:border-slate-700 uppercase tracking-wider text-[10px]">
                  <th className="p-4">Faculty Member</th>
                  <th className="p-4">Employee ID & Username</th>
                  <th className="p-4">Department & Designation</th>
                  <th className="p-4">Assigned Courses</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Security & Password</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={fac.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                          alt={fac.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{fac.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span><Phone className="w-3 h-3 inline" /> {fac.mobile}</span>
                            <span><Mail className="w-3 h-3 inline" /> {fac.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{fac.employeeId}</div>
                      <div className="text-slate-500 font-medium">@{fac.username}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{fac.department}</div>
                      <div className="text-slate-500">{fac.designation}</div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {fac.coursesAssigned.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(fac)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                          fac.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {fac.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {fac.status}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setResetPassFaculty(fac);
                            setResetPassData({
                              customPassword: '',
                              forcePasswordChangeOnLogin: true
                            });
                          }}
                          className="text-[11px] text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" /> Reset Password
                        </button>
                        <div className="text-[10px] text-slate-400">
                          {fac.forcePasswordChange ? (
                            <span className="text-amber-600 font-semibold">• First Login Reset Pending</span>
                          ) : (
                            <span>Encrypted (bcrypt)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right space-x-1">
                      <button
                        title="View Login History & Audit Trail"
                        onClick={() => setLogsFaculty(fac)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      <button
                        title="Print Faculty Details / ID Card"
                        onClick={() => setPrintFaculty(fac)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-blue-600" />
                      </button>

                      <button
                        title="Edit Faculty Details"
                        onClick={() => {
                          setEditingFaculty(fac);
                          setFormData({
                            name: fac.name,
                            employeeId: fac.employeeId,
                            designation: fac.designation,
                            department: fac.department,
                            mobile: fac.mobile,
                            email: fac.email,
                            username: fac.username,
                            password: '',
                            branch: fac.branch,
                            subjects: fac.subjects.join(', '),
                            coursesAssigned: fac.coursesAssigned.join(', '),
                            status: fac.status,
                            joiningDate: fac.joiningDate,
                            profilePhoto: fac.profilePhoto || ''
                          });
                          setShowAddModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 hover:bg-blue-100 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete Account"
                        onClick={() => handleDeleteFaculty(fac)}
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {filteredFaculty.map((fac) => (
            <div key={fac.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={fac.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                    alt={fac.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{fac.employeeId}</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{fac.name}</h4>
                    <p className="text-slate-500">{fac.designation}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  fac.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {fac.status}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                <div><strong>Department:</strong> {fac.department}</div>
                <div><strong>Username:</strong> @{fac.username}</div>
                <div><strong>Mobile:</strong> {fac.mobile}</div>
                <div><strong>Email:</strong> {fac.email}</div>
                <div><strong>Branch:</strong> {fac.branch}</div>
                <div><strong>Joined:</strong> {fac.joiningDate}</div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t text-[11px]">
                <button
                  onClick={() => {
                    setResetPassFaculty(fac);
                    setResetPassData({ customPassword: '', forcePasswordChangeOnLogin: true });
                  }}
                  className="text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" /> Reset Pass
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setLogsFaculty(fac)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingFaculty(fac);
                      setFormData({
                        name: fac.name,
                        employeeId: fac.employeeId,
                        designation: fac.designation,
                        department: fac.department,
                        mobile: fac.mobile,
                        email: fac.email,
                        username: fac.username,
                        password: '',
                        branch: fac.branch,
                        subjects: fac.subjects.join(', '),
                        coursesAssigned: fac.coursesAssigned.join(', '),
                        status: fac.status,
                        joiningDate: fac.joiningDate,
                        profilePhoto: fac.profilePhoto || ''
                      });
                      setShowAddModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaculty(fac)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT FACULTY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <User className="w-6 h-6 text-orange-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingFaculty ? `Edit Faculty Account: ${editingFaculty.name}` : 'Create New Faculty Account'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Er. R. K. Sharma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Employee ID (Editable)</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g. EMP-FAC-01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Technical Instructor"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                  >
                    <option value="Computer Applications & Programming">Computer Applications & Programming</option>
                    <option value="Financial Accounting & Tally">Financial Accounting & Tally</option>
                    <option value="Digital Marketing & AI">Digital Marketing & AI</option>
                    <option value="Competitive Exam Preparation">Target Academy Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10-digit Mobile Number"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@pearlacademy.edu.in"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Unique Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. rksharma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>

                {!editingFaculty && (
                  <div>
                    <label className="block font-bold mb-1">Initial Secure Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 chars with Uppercase, Number & Symbol"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                    {/* Realtime strength meter */}
                    {formData.password && (
                      <div className="mt-1 text-[10px] space-y-0.5 text-slate-500">
                        <div className={formData.password.length >= 8 ? 'text-emerald-600 font-bold' : ''}>• Min 8 Characters</div>
                        <div className={/[A-Z]/.test(formData.password) ? 'text-emerald-600 font-bold' : ''}>• 1 Uppercase Letter</div>
                        <div className={/[a-z]/.test(formData.password) ? 'text-emerald-600 font-bold' : ''}>• 1 Lowercase Letter</div>
                        <div className={/[0-9]/.test(formData.password) ? 'text-emerald-600 font-bold' : ''}>• 1 Number</div>
                        <div className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-emerald-600 font-bold' : ''}>• 1 Special Symbol</div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block font-bold mb-1">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="Main Branch - Tower Square">Main Branch - Tower Square</option>
                    <option value="Vijay Nagar Branch">Vijay Nagar Branch</option>
                    <option value="Bhawarkua Branch">Bhawarkua Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Assigned Courses (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.coursesAssigned}
                    onChange={(e) => setFormData({ ...formData, coursesAssigned: e.target.value })}
                    placeholder="e.g. DCA, Tally Prime with GST, Python & AI/ML"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Subjects Taught (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="e.g. C/C++, Python OOP, GST Returns, Financial Auditing"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl cursor-pointer shadow-md"
                >
                  {editingFaculty ? 'Update Faculty Profile' : 'Create Account & Encrypt Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN RESET PASSWORD */}
      {resetPassFaculty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Admin Reset Password</h3>
              </div>
              <button onClick={() => setResetPassFaculty(null)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-100">{resetPassFaculty.name}</div>
              <div className="text-blue-700 dark:text-blue-300 font-mono">
                Employee ID: {resetPassFaculty.employeeId} | Username: @{resetPassFaculty.username}
              </div>
            </div>

            <form onSubmit={handleAdminResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold">Set Custom Password *</label>
                  <button
                    type="button"
                    onClick={generateRandomSecurePassword}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Auto Generate Secure
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    required
                    value={resetPassData.customPassword}
                    onChange={(e) => setResetPassData({ ...resetPassData, customPassword: e.target.value })}
                    placeholder="Enter new password..."
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                    className="absolute right-3 top-3 text-slate-400"
                  >
                    {showResetPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {resetPassData.customPassword && (
                  <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                    <span className={resetPassData.customPassword.length >= 8 ? 'text-emerald-600 font-bold' : ''}>• Min 8 Chars</span>
                    <span className={/[A-Z]/.test(resetPassData.customPassword) ? 'text-emerald-600 font-bold' : ''}>• 1 Uppercase</span>
                    <span className={/[a-z]/.test(resetPassData.customPassword) ? 'text-emerald-600 font-bold' : ''}>• 1 Lowercase</span>
                    <span className={/[0-9]/.test(resetPassData.customPassword) ? 'text-emerald-600 font-bold' : ''}>• 1 Number</span>
                    <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(resetPassData.customPassword) ? 'text-emerald-600 font-bold' : ''}>• 1 Symbol</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetPassData.forcePasswordChangeOnLogin}
                    onChange={(e) => setResetPassData({ ...resetPassData, forcePasswordChangeOnLogin: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-500"
                  />
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Force password change on first login
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Reset Password & Update Bcrypt Hash
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOGIN HISTORY & AUDIT TRAIL */}
      {logsFaculty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Faculty Activity & Login History</h3>
              </div>
              <button onClick={() => setLogsFaculty(null)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{logsFaculty.name}</div>
                  <div className="text-slate-500">Employee ID: {logsFaculty.employeeId}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Last Login:</div>
                  <div className="font-mono font-bold text-emerald-600">{logsFaculty.lastLogin || 'Never Logged In'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-500" /> Session Login Audit Log
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-slate-50 dark:bg-slate-900">
                  {logsFaculty.loginHistory && logsFaculty.loginHistory.length > 0 ? (
                    logsFaculty.loginHistory.map((lh) => (
                      <div key={lh.id} className="p-2 bg-white dark:bg-slate-800 rounded-lg border text-[11px] flex justify-between items-center">
                        <div>
                          <span className={`font-bold mr-2 ${lh.success ? 'text-emerald-600' : 'text-red-600'}`}>
                            {lh.success ? '✓ LOGIN SUCCESS' : '✕ FAILED ATTEMPT'}
                          </span>
                          <span className="text-slate-500">{lh.timestamp}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">IP: {lh.ip}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400">No login history recorded yet.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Academic Actions Log
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5 border rounded-xl p-2 bg-slate-50 dark:bg-slate-900">
                  {logsFaculty.activityLogs && logsFaculty.activityLogs.length > 0 ? (
                    logsFaculty.activityLogs.map((al) => (
                      <div key={al.id} className="p-2 bg-white dark:bg-slate-800 rounded-lg border text-[11px]">
                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span>{al.action}</span>
                          <span className="text-[10px] text-slate-400">{al.timestamp}</span>
                        </div>
                        <p className="text-slate-500">{al.details}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400">No academic activity logs recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: BULK IMPORT */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">Bulk Faculty CSV Import</h3>
              </div>
              <button onClick={() => setShowBulkImportModal(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500">
                Paste CSV data below (Format: <code>Name, Email, Mobile, Username, Designation, Department, Password</code>):
              </p>

              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder={`Name, Email, Mobile, Username, Designation, Department, Password
Rajesh Kumar, r.kumar@pearlacademy.edu.in, 9826112233, rkumar, Senior Faculty, Computer Applications, Pass@2026
Anjali Sharma, a.sharma@pearlacademy.edu.in, 9826223344, asharma, Tally Specialist, Accounting, Pass@2026`}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Execute Bulk Faculty Import
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINT FACULTY DOSSIER / ID */}
      {printFaculty && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-blue-900">Faculty Official Identification Dossier</h3>
              <button onClick={() => setPrintFaculty(null)} className="text-slate-400 hover:text-black">✕</button>
            </div>

            <div className="p-4 border-2 border-blue-900 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-center space-y-3">
              <div className="font-bold text-blue-900 uppercase text-xs tracking-wider">Pearl Computer & Target Academy</div>
              <img
                src={printFaculty.profilePhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                alt={printFaculty.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-orange-400"
              />
              <div>
                <h4 className="font-bold text-base text-slate-900">{printFaculty.name}</h4>
                <div className="text-xs font-mono font-bold text-blue-700">{printFaculty.employeeId}</div>
                <div className="text-xs text-slate-600 font-semibold">{printFaculty.designation}</div>
              </div>

              <div className="text-[11px] text-slate-700 text-left space-y-1 bg-white p-3 rounded-xl border">
                <div><strong>Department:</strong> {printFaculty.department}</div>
                <div><strong>Branch:</strong> {printFaculty.branch}</div>
                <div><strong>Mobile:</strong> {printFaculty.mobile}</div>
                <div><strong>Email:</strong> {printFaculty.email}</div>
                <div><strong>Joining Date:</strong> {printFaculty.joiningDate}</div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Print Faculty Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
