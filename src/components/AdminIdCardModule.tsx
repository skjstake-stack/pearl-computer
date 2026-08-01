import React, { useState, useRef } from 'react';
import {
  CreditCard,
  QrCode,
  Printer,
  Download,
  RotateCw,
  UserCheck,
  Building,
  Calendar,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Eye,
  RefreshCw,
  Upload,
  User,
  Users,
  Sliders,
  FileBadge,
  Search,
  Filter,
  CheckSquare,
  Square,
  Lock,
  AlertTriangle,
  History,
  FileText,
  BadgeAlert,
  Image as ImageIcon
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StudentAccount } from '../types';

interface AdminIdCardModuleProps {
  students: StudentAccount[];
  onUpdateStudent?: (updated: StudentAccount) => void;
  onAuditLogAdded?: (action: string, details: string) => void;
}

export const AdminIdCardModule: React.FC<AdminIdCardModuleProps> = ({
  students,
  onUpdateStudent,
  onAuditLogAdded
}) => {
  // Local editable student list initialized with props
  const [studentList, setStudentList] = useState<StudentAccount[]>(students);
  
  // Selected student for single editing & preview
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 's-101'
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Deactivated' | 'Lost/Reissued' | 'Expired'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Multi-select bulk state
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);

  // Current editing student record
  const currentStudent = studentList.find(s => s.id === selectedStudentId) || studentList[0] || {
    id: 's-101',
    studentId: 'STU-2026-101',
    regNumber: 'REG/2026/0101',
    rollNumber: 'PCTA2026101',
    username: 'rahul9826',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '9826012345',
    course: 'ADCA (Advanced Diploma in Computer Applications)',
    batch: 'Morning 08:00 AM - 10:00 AM',
    status: 'Active',
    createdDate: '2026-08-01',
    isFirstLogin: false,
    attendancePercentage: 92,
    feeTotal: 8999,
    feePaid: 5000,
    qrCodeData: 'https://pearlacademy.edu.in/verify/STU-2026-101',
    fatherName: 'Manoj Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    idCardStatus: 'Active',
    idCardIssueDate: '01 Aug 2026',
    idCardValidTill: '31 Jul 2027',
    reissueCount: 0,
    emergencyContact: '9329284693',
    bloodGroup: 'O+',
    dob: '14-May-2004'
  };

  // Form State for selected student card
  const [cardData, setCardData] = useState({
    name: currentStudent.name,
    regNumber: currentStudent.regNumber,
    studentId: currentStudent.studentId,
    rollNumber: currentStudent.rollNumber,
    course: currentStudent.course,
    fatherName: currentStudent.fatherName || 'Manoj Sharma',
    dob: currentStudent.dob || '14-May-2004',
    bloodGroup: currentStudent.bloodGroup || 'O+',
    mobile: currentStudent.mobile,
    emergencyContact: currentStudent.emergencyContact || '9329284693',
    batch: currentStudent.batch,
    issueDate: currentStudent.idCardIssueDate || '01 Aug 2026',
    validTill: currentStudent.idCardValidTill || '31 Jul 2027',
    avatar: currentStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    idCardStatus: currentStudent.idCardStatus || 'Active',
    reissueCount: currentStudent.reissueCount || 0
  });

  // Template Customization Settings
  const [templateConfig, setTemplateConfig] = useState({
    instituteLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100',
    principalName: 'Er. R. K. Sharma',
    principalTitle: 'Director / Authorized Signatory',
    showBarcode: true,
    showQrCode: true,
    orientation: 'portrait' as 'portrait' | 'landscape',
    theme: 'royal-blue' as 'royal-blue' | 'dark-emerald' | 'cyber-orange' | 'slate-minimal'
  });

  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Update cardData when student selection changes
  const handleSelectStudentForEdit = (stu: StudentAccount) => {
    setSelectedStudentId(stu.id);
    setCardData({
      name: stu.name,
      regNumber: stu.regNumber,
      studentId: stu.studentId,
      rollNumber: stu.rollNumber,
      course: stu.course,
      fatherName: stu.fatherName || 'Manoj Sharma',
      dob: stu.dob || '14-May-2004',
      bloodGroup: stu.bloodGroup || 'O+',
      mobile: stu.mobile,
      emergencyContact: stu.emergencyContact || '9329284693',
      batch: stu.batch,
      issueDate: stu.idCardIssueDate || '01 Aug 2026',
      validTill: stu.idCardValidTill || '31 Jul 2027',
      avatar: stu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      idCardStatus: stu.idCardStatus || 'Active',
      reissueCount: stu.reissueCount || 0
    });
  };

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
  ];

  // Helper log function
  const logAdminAction = async (action: string, details: string) => {
    if (onAuditLogAdded) onAuditLogAdded(action, details);
    try {
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: 'Admin',
          role: 'admin',
          action,
          details
        })
      });
    } catch (e) {
      // ignore
    }
  };

  // Save changes to current student ID card
  const handleSaveStudentCardDetails = () => {
    const updated: StudentAccount = {
      ...currentStudent,
      name: cardData.name,
      regNumber: cardData.regNumber,
      studentId: cardData.studentId,
      fatherName: cardData.fatherName,
      course: cardData.course,
      batch: cardData.batch,
      mobile: cardData.mobile,
      avatar: cardData.avatar,
      idCardStatus: cardData.idCardStatus as any,
      idCardIssueDate: cardData.issueDate,
      idCardValidTill: cardData.validTill,
      emergencyContact: cardData.emergencyContact,
      bloodGroup: cardData.bloodGroup,
      dob: cardData.dob,
      reissueCount: cardData.reissueCount
    };

    setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (onUpdateStudent) onUpdateStudent(updated);

    logAdminAction('Updated Student ID Card Details', `Updated ID Card for ${updated.name} (${updated.studentId})`);

    setActionSuccessMsg(`Successfully saved ID Card details for ${updated.name}!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Auto Generate Student ID Number
  const handleAutoGenerateIdNumber = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `STU-2026-${randomNum}`;
    setCardData(prev => ({ ...prev, studentId: newId }));
  };

  // Reissue Lost / Damaged ID Card
  const handleReissueCard = () => {
    if (!confirm(`Confirm Reissuing Lost/Damaged ID Card for ${cardData.name}? This will increment reissue count and log an official audit record.`)) {
      return;
    }

    const newReissueCount = (cardData.reissueCount || 0) + 1;
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const updatedCardData = {
      ...cardData,
      idCardStatus: 'Active' as const,
      issueDate: todayStr,
      reissueCount: newReissueCount
    };

    setCardData(updatedCardData);

    const updated: StudentAccount = {
      ...currentStudent,
      ...updatedCardData,
      idCardStatus: 'Active'
    };

    setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (onUpdateStudent) onUpdateStudent(updated);

    logAdminAction('Reissued Lost Student ID Card', `Reissued ID Card (Version #${newReissueCount}) for ${cardData.name} (${cardData.studentId})`);

    setActionSuccessMsg(`ID Card Reissued successfully for ${cardData.name}! Total Reissues: ${newReissueCount}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Toggle Activation / Deactivation
  const handleToggleCardStatus = (status: 'Active' | 'Deactivated' | 'Lost/Reissued' | 'Expired') => {
    setCardData(prev => ({ ...prev, idCardStatus: status }));

    const updated: StudentAccount = {
      ...currentStudent,
      idCardStatus: status
    };

    setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (onUpdateStudent) onUpdateStudent(updated);

    logAdminAction('Changed Student ID Card Status', `Set ID Card status to ${status.toUpperCase()} for ${cardData.name} (${cardData.studentId})`);

    setActionSuccessMsg(`ID Card status set to ${status} for ${cardData.name}`);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Handle Photo Upload simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Students List
  const filteredStudents = studentList.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.regNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || (st.idCardStatus || 'Active') === statusFilter;
    const matchesCourse = courseFilter === 'all' || st.course.toLowerCase().includes(courseFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Bulk Selection Handlers
  const handleToggleSelectAllBulk = () => {
    if (selectedBulkIds.length === filteredStudents.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(filteredStudents.map(s => s.id));
    }
  };

  const handleToggleSelectBulkOne = (id: string) => {
    setSelectedBulkIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk Status Update
  const handleBulkStatusUpdate = (newStatus: 'Active' | 'Deactivated' | 'Expired') => {
    if (selectedBulkIds.length === 0) return;
    setStudentList(prev =>
      prev.map(s => selectedBulkIds.includes(s.id) ? { ...s, idCardStatus: newStatus } : s)
    );
    logAdminAction('Bulk Updated ID Card Status', `Set ${selectedBulkIds.length} cards to ${newStatus.toUpperCase()}`);
    setActionSuccessMsg(`Updated ${selectedBulkIds.length} ID Cards to ${newStatus}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Download PDF Single ID Card
  const handleDownloadPdf = () => {
    const isPortrait = templateConfig.orientation === 'portrait';
    const width = isPortrait ? 53.98 : 85.6;
    const height = isPortrait ? 85.6 : 53.98;

    const doc = new jsPDF({
      orientation: isPortrait ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [width, height]
    });

    let primaryRgb = [30, 58, 138];
    let accentRgb = [249, 115, 22];

    if (templateConfig.theme === 'dark-emerald') {
      primaryRgb = [6, 78, 59];
      accentRgb = [16, 185, 129];
    } else if (templateConfig.theme === 'cyber-orange') {
      primaryRgb = [194, 65, 12];
      accentRgb = [245, 158, 11];
    } else if (templateConfig.theme === 'slate-minimal') {
      primaryRgb = [30, 41, 59];
      accentRgb = [99, 102, 241];
    }

    // FRONT
    doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.rect(0, 0, width, isPortrait ? 18 : 14, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isPortrait ? 6.5 : 7.5);
    doc.text('PEARL COMPUTER & TARGET ACADEMY', width / 2, isPortrait ? 6 : 5, { align: 'center' });

    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'normal');
    doc.text('ISO 9001:2015 & GOVT. RECOGNIZED INSTITUTE', width / 2, isPortrait ? 9.5 : 8, { align: 'center' });

    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.rect(0, isPortrait ? 13.5 : 10.5, width, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.5);
    doc.text('OFFICIAL STUDENT DIGITAL ID CARD', width / 2, isPortrait ? 15.5 : 12.5, { align: 'center' });

    if (cardData.idCardStatus === 'Deactivated') {
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DEACTIVATED', width / 2, height / 2, { align: 'center' });
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(cardData.name, width / 2, isPortrait ? 24 : 18, { align: 'center' });

    doc.setFontSize(5);
    doc.setTextColor(239, 68, 68);
    doc.text(`REG NO: ${cardData.regNumber}`, width / 2, isPortrait ? 27.5 : 21, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');

    const startY = isPortrait ? 33 : 25;
    const lineGap = 3.5;

    doc.text(`Student ID:`, 4, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(cardData.studentId, 22, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Father Name:`, 4, startY + lineGap);
    doc.setFont('helvetica', 'normal');
    doc.text(cardData.fatherName.substring(0, 20), 22, startY + lineGap);

    doc.setFont('helvetica', 'bold');
    doc.text(`Course:`, 4, startY + lineGap * 2);
    doc.setFont('helvetica', 'normal');
    doc.text(cardData.course.substring(0, 24), 22, startY + lineGap * 2);

    doc.setFont('helvetica', 'bold');
    doc.text(`Batch:`, 4, startY + lineGap * 3);
    doc.setFont('helvetica', 'normal');
    doc.text(cardData.batch.substring(0, 24), 22, startY + lineGap * 3);

    doc.setFont('helvetica', 'bold');
    doc.text(`Mobile:`, 4, startY + lineGap * 4);
    doc.setFont('helvetica', 'normal');
    doc.text(cardData.mobile, 22, startY + lineGap * 4);

    doc.setFont('helvetica', 'bold');
    doc.text(`Validity:`, 4, startY + lineGap * 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${cardData.issueDate} - ${cardData.validTill}`, 22, startY + lineGap * 5);

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(0, height - 12, width, 12, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL VERIFIED BADGE — PEARL ACADEMY', width / 2, height - 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('pearlacademy.edu.in/verify', width / 2, height - 4, { align: 'center' });

    doc.save(`Student_ID_${cardData.studentId}_${cardData.regNumber.replace(/\//g, '_')}.pdf`);
    logAdminAction('Downloaded ID Card PDF', `Generated PDF for ${cardData.name} (${cardData.studentId})`);
  };

  // QR Code URL generator
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `https://pearlacademy.edu.in/verify?reg=${cardData.regNumber}&id=${cardData.studentId}`
  )}`;

  return (
    <div className="space-y-8">
      {/* Printable Area CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #admin-idcard-printable-area, #admin-idcard-printable-area * {
            visibility: visible !important;
          }
          #admin-idcard-printable-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-orange-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5" /> Super Admin & Institute Admin Only
            </span>
            <span className="text-xs text-blue-200 font-mono">RBAC Security Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">ID Card Management Module</h1>
          <p className="text-xs text-blue-200 max-w-2xl">
            Generate, customize, edit, activate/deactivate, reissue lost ID cards, and bulk print official student credentials with automatic audit log tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
          >
            <Printer className="w-4 h-4" /> Print Selected ID Card
          </button>

          <button
            onClick={handleDownloadPdf}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Action Success Alert Message */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 1: SEARCH, FILTER & BULK ACTIONS TABLE */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Registered Students Directory ({filteredStudents.length})
            </h2>
            <p className="text-xs text-slate-500">Filter students to edit ID details, reissue lost cards, or perform bulk operations.</p>
          </div>

          {/* Search & Filter Inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, ID or Reg No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Cards</option>
              <option value="Deactivated">Deactivated</option>
              <option value="Lost/Reissued">Lost / Reissued</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls Bar (Visible when items selected) */}
        {selectedBulkIds.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-wrap justify-between items-center gap-3 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-200">
              {selectedBulkIds.length} Student Cards Selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkPrintModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Bulk Print Cards
              </button>

              <button
                onClick={() => handleBulkStatusUpdate('Active')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Set Active
              </button>

              <button
                onClick={() => handleBulkStatusUpdate('Deactivated')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleToggleSelectAllBulk} className="cursor-pointer">
                    {selectedBulkIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3">Student Info</th>
                <th className="p-3">ID & Reg No</th>
                <th className="p-3">Course & Batch</th>
                <th className="p-3">Validity</th>
                <th className="p-3">Card Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isSelectedForEdit = st.id === selectedStudentId;
                  const isChecked = selectedBulkIds.includes(st.id);
                  const status = st.idCardStatus || 'Active';

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                        isSelectedForEdit ? 'bg-blue-50/60 dark:bg-blue-950/40 font-medium' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button onClick={() => handleToggleSelectBulkOne(st.id)} className="cursor-pointer">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={st.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                            <div className="text-[10px] text-slate-400">Father: {st.fatherName || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="font-bold text-blue-600 dark:text-blue-400">{st.studentId}</div>
                        <div className="text-[10px] text-slate-400">{st.regNumber}</div>
                      </td>

                      <td className="p-3">
                        <div className="truncate max-w-xs">{st.course}</div>
                        <div className="text-[10px] text-slate-400">{st.batch}</div>
                      </td>

                      <td className="p-3 text-[11px] text-slate-500">
                        {st.idCardIssueDate || '01 Aug 2026'} - {st.idCardValidTill || '31 Jul 2027'}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : status === 'Deactivated'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {status}
                        </span>
                        {st.reissueCount ? (
                          <div className="text-[9px] text-orange-600 font-bold mt-0.5">
                            Reissued x{st.reissueCount}
                          </div>
                        ) : null}
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleSelectStudentForEdit(st)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-[11px] cursor-pointer"
                        >
                          Manage Card
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: EDIT STUDENT CARD DETAILS & LIVE PREVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT 6 COLS: EDIT FORM & CONTROLS */}
        <div className="lg:col-span-6 space-y-6">
          {/* Edit Student Profile & ID Card Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-orange-500" /> Edit Student ID Credentials
              </h3>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                ID: {cardData.studentId}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={cardData.regNumber}
                    onChange={(e) => setCardData({ ...cardData, regNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-blue-600 dark:text-blue-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Student ID Number</span>
                    <button
                      type="button"
                      onClick={handleAutoGenerateIdNumber}
                      className="text-[10px] text-orange-600 hover:underline cursor-pointer"
                    >
                      Auto-Gen
                    </button>
                  </label>
                  <input
                    type="text"
                    value={cardData.studentId}
                    onChange={(e) => setCardData({ ...cardData, studentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Father's / Guardian's Name
                </label>
                <input
                  type="text"
                  value={cardData.fatherName}
                  onChange={(e) => setCardData({ ...cardData, fatherName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Enrolled Course Title
                </label>
                <input
                  type="text"
                  value={cardData.course}
                  onChange={(e) => setCardData({ ...cardData, course: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Schedule
                  </label>
                  <input
                    type="text"
                    value={cardData.batch}
                    onChange={(e) => setCardData({ ...cardData, batch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={cardData.bloodGroup}
                    onChange={(e) => setCardData({ ...cardData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={cardData.issueDate}
                    onChange={(e) => setCardData({ ...cardData, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Validity Period (Valid Till)
                  </label>
                  <input
                    type="text"
                    value={cardData.validTill}
                    onChange={(e) => setCardData({ ...cardData, validTill: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Upload & Presets */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upload or Change Student Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Upload File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <div className="flex items-center gap-1.5">
                    {avatarPresets.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCardData({ ...cardData, avatar: pUrl })}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer ${
                          cardData.avatar === pUrl ? 'border-orange-500 scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={pUrl} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status & Reissue Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Card Status:</span>
                  <select
                    value={cardData.idCardStatus}
                    onChange={(e) => handleToggleCardStatus(e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border rounded-lg font-bold text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                    <option value="Lost/Reissued">Lost / Reissued</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleReissueCard}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reissue Lost Card
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveStudentCardDetails}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transition-all mt-3"
              >
                Save Official ID Card Changes
              </button>
            </div>
          </div>

          {/* Template Customization Box */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" /> ID Card Template Customization
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Card Orientation</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, orientation: 'portrait' })}
                    className={`flex-1 p-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      templateConfig.orientation === 'portrait' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateConfig({ ...templateConfig, orientation: 'landscape' })}
                    className={`flex-1 p-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      templateConfig.orientation === 'landscape' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Color Theme</label>
                <select
                  value={templateConfig.theme}
                  onChange={(e) => setTemplateConfig({ ...templateConfig, theme: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs font-medium"
                >
                  <option value="royal-blue">Royal Blue & Gold</option>
                  <option value="dark-emerald">Emerald Green</option>
                  <option value="cyber-orange">Cyber Orange</option>
                  <option value="slate-minimal">Slate Minimal</option>
                </select>
              </div>

              <div className="col-span-2 flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={templateConfig.showQrCode}
                    onChange={(e) => setTemplateConfig({ ...templateConfig, showQrCode: e.target.checked })}
                  />
                  <span>Show Encoded Verification QR Code</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={templateConfig.showBarcode}
                    onChange={(e) => setTemplateConfig({ ...templateConfig, showBarcode: e.target.checked })}
                  />
                  <span>Show Barcode</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: LIVE CARD PREVIEW & PRINTABLE DOM */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" /> Live Rendered ID Badge Preview
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                cardData.idCardStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                STATUS: {cardData.idCardStatus.toUpperCase()}
              </span>
            </div>

            {/* Printable ID Card Container */}
            <div id="admin-idcard-printable-area" className="flex flex-col items-center gap-6 py-4">
              {/* CARD FRONT SIDE */}
              <div
                className={`w-[320px] rounded-2xl shadow-xl overflow-hidden border border-slate-300 bg-white relative transition-all ${
                  templateConfig.orientation === 'portrait' ? 'h-[490px]' : 'w-[450px] h-[280px]'
                }`}
              >
                {/* Header Strip */}
                <div className={`p-4 text-center text-white ${
                  templateConfig.theme === 'dark-emerald'
                    ? 'bg-gradient-to-r from-emerald-900 to-teal-900'
                    : templateConfig.theme === 'cyber-orange'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600'
                    : templateConfig.theme === 'slate-minimal'
                    ? 'bg-gradient-to-r from-slate-800 to-zinc-900'
                    : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950'
                }`}>
                  <div className="flex items-center justify-center gap-2">
                    <Building className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-black tracking-wide">PEARL COMPUTER & TARGET</span>
                  </div>
                  <p className="text-[9px] text-blue-200 tracking-wider uppercase font-semibold mt-0.5">
                    ISO 9001:2015 & Govt. Recognized Institute
                  </p>
                </div>

                {/* Accent Badge Title */}
                <div className="bg-orange-500 text-slate-950 py-1 text-[10px] font-black uppercase text-center tracking-wider">
                  Official Student Digital ID Card
                </div>

                {/* Deactivated Watermark Overlay */}
                {cardData.idCardStatus === 'Deactivated' && (
                  <div className="absolute inset-0 bg-red-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                    <AlertTriangle className="w-12 h-12 text-amber-400 animate-bounce" />
                    <span className="text-xl font-black tracking-widest mt-2">DEACTIVATED</span>
                    <span className="text-xs text-red-200">Contact Institute Administration</span>
                  </div>
                )}

                {/* Card Body Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-orange-500 shadow-md shrink-0">
                      <img src={cardData.avatar} alt={cardData.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-1 text-slate-800">
                      <h4 className="text-sm font-black leading-tight text-slate-900">{cardData.name}</h4>
                      <p className="text-[10px] text-orange-600 font-extrabold font-mono">REG: {cardData.regNumber}</p>
                      <p className="text-[10px] font-bold text-slate-600">ID: {cardData.studentId}</p>
                      <p className="text-[10px] text-slate-500">Father: {cardData.fatherName}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-700">
                    <div><strong className="text-slate-900">Course:</strong> {cardData.course}</div>
                    <div><strong className="text-slate-900">Batch:</strong> {cardData.batch}</div>
                    <div><strong className="text-slate-900">Blood Group:</strong> {cardData.bloodGroup} | <strong className="text-slate-900">DOB:</strong> {cardData.dob}</div>
                    <div><strong className="text-slate-900">Mobile:</strong> +91 {cardData.mobile}</div>
                    <div><strong className="text-slate-900">Validity:</strong> {cardData.issueDate} to {cardData.validTill}</div>
                  </div>

                  {/* QR & Barcode Footer Area */}
                  <div className="flex items-center justify-between pt-1">
                    {templateConfig.showQrCode && (
                      <div className="flex items-center gap-2">
                        <img src={qrCodeImageUrl} alt="QR Verification" className="w-12 h-12 border border-slate-300 rounded p-0.5" />
                        <div className="text-[9px] text-slate-500 font-mono">
                          <div>Scan to verify</div>
                          <div className="font-bold text-blue-600">pearlacademy.edu.in</div>
                        </div>
                      </div>
                    )}

                    <div className="text-right text-[10px] text-slate-600 font-serif border-t border-slate-300 pt-1">
                      <div className="italic font-bold">{templateConfig.principalName}</div>
                      <div className="text-[8px] text-slate-400">{templateConfig.principalTitle}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BULK PRINT MODAL */}
      {showBulkPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" /> Bulk Print Student ID Badges ({selectedBulkIds.length})
              </h3>
              <button onClick={() => setShowBulkPrintModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Ready to print ID Badges for {selectedBulkIds.length} selected students. Use standard printer settings for CR-80 PVC Card printers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studentList.filter(s => selectedBulkIds.includes(s.id)).map(st => (
                <div key={st.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <img src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} className="w-10 h-10 rounded-full object-cover" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                    <div className="text-[10px] text-blue-600 font-mono">{st.studentId} • {st.regNumber}</div>
                    <div className="text-[10px] text-slate-400">{st.course.substring(0, 22)}...</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowBulkPrintModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.print();
                  logAdminAction('Bulk Printed Student ID Badges', `Printed ${selectedBulkIds.length} ID Badges`);
                  setShowBulkPrintModal(false);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Confirm & Launch Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
