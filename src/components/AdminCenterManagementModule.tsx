import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  ShieldAlert,
  BarChart3,
  Users,
  HardDrive,
  RefreshCw,
  Clock,
  Send,
  Lock,
  Unlock,
  ToggleLeft,
  ToggleRight,
  FileSpreadsheet,
  AlertCircle,
  X,
  Check,
  Building,
  UserCheck,
  FileText,
  DollarSign,
  Smartphone,
  Mail,
  MapPin,
  ShieldCheck,
  Award
} from 'lucide-react';
import { CenterAccount, CenterPermissions, UserSession } from '../types';

interface AdminCenterManagementModuleProps {
  currentUser?: UserSession | null;
}

const defaultPermissions: CenterPermissions = {
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

export const AdminCenterManagementModule: React.FC<AdminCenterManagementModuleProps> = ({ currentUser }) => {
  const [centers, setCenters] = useState<CenterAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<CenterAccount | null>(null);
  
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [centerLogs, setCenterLogs] = useState<any[]>([]);

  const [showResetPassModal, setShowResetPassModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Form State for Add/Edit
  const [formData, setFormData] = useState({
    centerCode: '',
    centerName: '',
    username: '',
    password: '',
    email: '',
    mobile: '',
    headPersonName: '',
    address: '',
    city: 'Parasia',
    state: 'Madhya Pradesh',
    pincode: '480441',
    admissionLimit: 500,
    storageLimitGb: 10,
    assignedCourses: [
      'DCA (Diploma in Computer Applications)',
      'ADCA (Advance Diploma in Computer Applications)',
      'Tally Prime with GST',
      'CPCT Preparation Batch'
    ],
    assignedBatches: [
      'Morning 08:00 AM - 10:00 AM',
      'Afternoon 01:00 PM - 03:00 PM',
      'Evening 05:00 PM - 07:00 PM'
    ],
    permissions: { ...defaultPermissions }
  });

  const availableCoursesList = [
    'DCA (Diploma in Computer Applications)',
    'ADCA (Advance Diploma in Computer Applications)',
    'PGDCA (Post Graduate Diploma)',
    'Tally Prime with GST',
    'CPCT Preparation Batch',
    'Fullstack Web Development',
    'Python Programming & Data Science',
    'MPPSC Civil Services Foundation',
    'SSC, Banking & Railway Integrated'
  ];

  const availableBatchesList = [
    'Morning 07:30 AM - 09:30 AM',
    'Morning 08:00 AM - 10:00 AM',
    'Afternoon 12:00 PM - 02:00 PM',
    'Afternoon 01:00 PM - 03:00 PM',
    'Evening 04:00 PM - 06:00 PM',
    'Evening 05:00 PM - 07:00 PM',
    'Weekend Special Batch'
  ];

  // Fetch all centers from server
  const fetchCenters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/centers', {
        headers: {
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCenters(data.centers || []);
      }
    } catch (err) {
      console.error('Error fetching centers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  // Filter centers
  const filteredCenters = centers.filter(c => {
    const matchesSearch =
      c.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.centerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headPersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextNum = centers.length + 101;
    setFormData({
      centerCode: `CTR-${nextNum}`,
      centerName: '',
      username: `center_user_${nextNum}`,
      password: 'CenterPass@2026',
      email: '',
      mobile: '',
      headPersonName: '',
      address: '',
      city: 'Parasia',
      state: 'Madhya Pradesh',
      pincode: '480441',
      admissionLimit: 500,
      storageLimitGb: 10,
      assignedCourses: [
        'DCA (Diploma in Computer Applications)',
        'Tally Prime with GST'
      ],
      assignedBatches: [
        'Morning 08:00 AM - 10:00 AM',
        'Evening 05:00 PM - 07:00 PM'
      ],
      permissions: { ...defaultPermissions }
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (center: CenterAccount) => {
    setSelectedCenter(center);
    setFormData({
      centerCode: center.centerCode,
      centerName: center.centerName,
      username: center.username,
      password: '',
      email: center.email,
      mobile: center.mobile,
      headPersonName: center.headPersonName,
      address: center.address,
      city: center.city,
      state: center.state,
      pincode: center.pincode,
      admissionLimit: center.admissionLimit,
      storageLimitGb: center.storageLimitGb,
      assignedCourses: [...center.assignedCourses],
      assignedBatches: [...center.assignedBatches],
      permissions: { ...center.permissions }
    });
    setShowEditModal(true);
  };

  // Submit New Center
  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.centerName.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in all required fields (Center Name, Email, Mobile).' });
      return;
    }

    try {
      const res = await fetch('/api/admin/centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'New Center created successfully!' });
        setShowAddModal(false);
        fetchCenters();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to create center.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server connection error while creating center.' });
    }
  };

  // Submit Update Center
  const handleUpdateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;

    try {
      const res = await fetch(`/api/admin/centers/${selectedCenter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Center ${selectedCenter.centerCode} updated successfully!` });
        setShowEditModal(false);
        fetchCenters();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to update center.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server connection error while updating center.' });
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (center: CenterAccount) => {
    const newStatus = center.status === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Are you sure you want to change status of ${center.centerName} to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/centers/${center.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Center status changed to ${newStatus}.` });
        fetchCenters();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error toggling status.' });
    }
  };

  // Reset Center Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !newPasswordInput.trim()) return;

    try {
      const res = await fetch(`/api/admin/centers/${selectedCenter.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        },
        body: JSON.stringify({ newPassword: newPasswordInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: `Password reset successfully for ${selectedCenter.centerName}!` });
        setShowResetPassModal(false);
        setNewPasswordInput('');
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Password reset failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Server error while resetting password.' });
    }
  };

  // View Logs
  const handleViewLogs = async (center: CenterAccount) => {
    setSelectedCenter(center);
    try {
      const res = await fetch(`/api/admin/centers/${center.id}/logs`, {
        headers: {
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        }
      });
      const data = await res.json();
      if (data.success) {
        setCenterLogs(data.logs || []);
        setShowLogsModal(true);
      }
    } catch (err) {
      alert('Error fetching center audit logs.');
    }
  };

  // Delete Center
  const handleDeleteCenter = async (center: CenterAccount) => {
    if (!confirm(`CRITICAL WARNING: Are you sure you want to permanently delete Center ${center.centerName} (${center.centerCode})? All assigned data and access will be removed.`)) return;

    try {
      const res = await fetch(`/api/admin/centers/${center.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || 'admin',
          'x-user-name': currentUser?.name || 'Administrator'
        }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Center deleted successfully.' });
        fetchCenters();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error deleting center.' });
    }
  };

  const handleTogglePermission = (permKey: keyof CenterPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  const totalAdmissionsAllocated = centers.reduce((acc, c) => acc + c.admissionLimit, 0);
  const totalAdmissionsUsed = centers.reduce((acc, c) => acc + c.usedAdmissionsCount, 0);
  const totalStorageAllocated = centers.reduce((acc, c) => acc + c.storageLimitGb, 0);

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/30">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Super Admin Access Control
              </span>
              <span className="text-[10px] font-semibold text-slate-300">
                Multi-Center RBAC Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1">Center Login & Branch Management</h2>
            <p className="text-xs text-slate-300">
              Provision centers, manage credentials, set student limits, assign courses & configure granular permissions.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-lg transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Center</span>
        </button>
      </div>

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

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Authorized Centers</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{centers.length}</span>
            <span className="text-xs text-emerald-600 font-bold">
              {centers.filter(c => c.status === 'Active').length} Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Student Quota</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalAdmissionsUsed}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {totalAdmissionsAllocated} Limit</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (totalAdmissionsUsed / Math.max(1, totalAdmissionsAllocated)) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Cloud Storage</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalStorageAllocated} GB</span>
            <span className="text-xs text-emerald-600 font-semibold">Allocated</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">RBAC Security Status</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-emerald-600">Strict Isolation</span>
          </div>
          <p className="text-[10px] text-slate-400">Centers isolated to own data</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Center Code, Name, Head, City..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Centers ({centers.length})</option>
            <option value="Active">Active Only ({centers.filter(c => c.status === 'Active').length})</option>
            <option value="Inactive">Inactive Only ({centers.filter(c => c.status === 'Inactive').length})</option>
            <option value="Suspended">Suspended Only ({centers.filter(c => c.status === 'Suspended').length})</option>
          </select>

          <button
            onClick={fetchCenters}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Center Table / Cards Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Center ID & Name</th>
                <th className="py-3.5 px-4">Login Credentials</th>
                <th className="py-3.5 px-4">Head & Location</th>
                <th className="py-3.5 px-4">Admission Usage</th>
                <th className="py-3.5 px-4">Storage</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No center records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredCenters.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded text-[10px]">
                            {c.centerCode}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{c.centerName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Created: {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          @{c.username}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> +91 {c.mobile}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{c.headPersonName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-500" /> {c.city}, {c.state}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{c.usedAdmissionsCount} used</span>
                          <span className="text-slate-400">/ {c.admissionLimit}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              c.usedAdmissionsCount >= c.admissionLimit ? 'bg-red-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, (c.usedAdmissionsCount / c.admissionLimit) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {c.storageLimitGb} GB
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          c.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'Inactive'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {c.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {c.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg transition"
                          title="Edit Center & Permissions"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCenter(c);
                            setNewPasswordInput('');
                            setShowResetPassModal(true);
                          }}
                          className="p-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-lg transition"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 rounded-lg transition ${
                            c.status === 'Active'
                              ? 'bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-600'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600'
                          }`}
                          title={c.status === 'Active' ? 'Deactivate Center' : 'Activate Center'}
                        >
                          {c.status === 'Active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleViewLogs(c)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition"
                          title="View Activity Logs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCenter(c)}
                          className="p-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition"
                          title="Delete Center"
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
      </div>

      {/* ADD NEW CENTER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Provision New Authorized Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create login credentials, assign quotas & configure feature permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="space-y-6 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Center ID / Code *</label>
                  <input
                    type="text"
                    value={formData.centerCode}
                    onChange={(e) => setFormData({ ...formData, centerCode: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Center Name *</label>
                  <input
                    type="text"
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    placeholder="e.g. Pearl Academy - Parasia Branch"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Login Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Login Password *</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Registered Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. parasia@pearlacademy.edu.in"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Registered Mobile Number *</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 7999829231"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Head / Director Person Name *</label>
                  <input
                    type="text"
                    value={formData.headPersonName}
                    onChange={(e) => setFormData({ ...formData, headPersonName: e.target.value })}
                    placeholder="e.g. Er. Sandeep Bisan"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Student Admission Limit</label>
                  <input
                    type="number"
                    value={formData.admissionLimit}
                    onChange={(e) => setFormData({ ...formData, admissionLimit: parseInt(e.target.value) || 100 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cloud Storage Limit (GB)</label>
                  <input
                    type="number"
                    value={formData.storageLimitGb}
                    onChange={(e) => setFormData({ ...formData, storageLimitGb: parseInt(e.target.value) || 5 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Station Road, Parasia"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              {/* Feature Permissions Toggles */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Granular Center Permission Controls (RBAC)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                  {Object.entries(formData.permissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => handleTogglePermission(key as keyof CenterPermissions)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {key.replace(/^can/, '').replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl cursor-pointer shadow-md"
                >
                  Create Authorized Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CENTER MODAL */}
      {showEditModal && selectedCenter && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                  <Edit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Edit Center: {selectedCenter.centerCode}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCenter.centerName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCenter} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Center Name *</label>
                  <input
                    type="text"
                    value={formData.centerName}
                    onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Registered Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Registered Mobile *</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Head Person Name *</label>
                  <input
                    type="text"
                    value={formData.headPersonName}
                    onChange={(e) => setFormData({ ...formData, headPersonName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Student Quota Limit</label>
                  <input
                    type="number"
                    value={formData.admissionLimit}
                    onChange={(e) => setFormData({ ...formData, admissionLimit: parseInt(e.target.value) || 100 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Cloud Storage Limit (GB)</label>
                  <input
                    type="number"
                    value={formData.storageLimitGb}
                    onChange={(e) => setFormData({ ...formData, storageLimitGb: parseInt(e.target.value) || 5 })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Feature Permissions Toggles */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Update Granular Feature Permissions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
                  {Object.entries(formData.permissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => handleTogglePermission(key as keyof CenterPermissions)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {key.replace(/^can/, '').replace(/([A-Z])/g, ' $1')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetPassModal && selectedCenter && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reset Password: {selectedCenter.centerCode}
                </h3>
              </div>
              <button onClick={() => setShowResetPassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <p className="text-slate-500">
                Enter a new password for <strong>{selectedCenter.centerName}</strong> (username: @{selectedCenter.username}).
              </p>
              <div>
                <label className="font-bold block mb-1">New Password *</label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. NewPass@2026"
                  required
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetPassModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY LOGS MODAL */}
      {showLogsModal && selectedCenter && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Audit Logs: {selectedCenter.centerName}
                </h3>
                <p className="text-xs text-slate-500">Center Code: {selectedCenter.centerCode}</p>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1 text-xs">
              {centerLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No audit log entries recorded for this center yet.</p>
              ) : (
                centerLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{log.timestamp}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                    <p className="text-slate-500 text-[11px]">{log.details}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
