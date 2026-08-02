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
  Lock,
  Eye,
  FileBadge,
  AlertOctagon,
  ShieldAlert
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StudentAccount } from '../types';
import { sampleStudents } from '../data/mockData';

interface DigitalIdCardGeneratorProps {
  initialStudent?: StudentAccount | null;
  readOnly?: boolean;
  onSaveToSystem?: (studentData: StudentAccount) => void;
}

export const DigitalIdCardGenerator: React.FC<DigitalIdCardGeneratorProps> = ({
  initialStudent,
  readOnly = true, // Default to student read-only view for safety
  onSaveToSystem
}) => {
  const baseStudent = initialStudent || sampleStudents[0];

  // Student Data (Read-only or admin editable)
  const [studentData, setStudentData] = useState({
    name: baseStudent.name || 'Rahul Sharma',
    regNumber: baseStudent.regNumber || 'REG/2026/0101',
    studentId: baseStudent.studentId || 'STU-2026-101',
    rollNumber: baseStudent.rollNumber || 'PCTA2026101',
    course: baseStudent.course || 'ADCA (Advanced Diploma in Computer Applications)',
    fatherName: baseStudent.fatherName || 'Manoj Sharma',
    dob: baseStudent.dob || '14-May-2004',
    bloodGroup: baseStudent.bloodGroup || 'O+',
    mobile: baseStudent.mobile || '9826012345',
    emergencyContact: baseStudent.emergencyContact || '9329284693',
    batch: baseStudent.batch || 'Morning 08:00 AM - 10:00 AM',
    center: 'Near Railway Station Road, Parasia, Chhindwara',
    issueDate: baseStudent.idCardIssueDate || '01 Aug 2026',
    validTill: baseStudent.idCardValidTill || '31 Jul 2027',
    avatar: baseStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    verificationUrl: `https://pearlacademy.edu.in/verify?reg=${encodeURIComponent(baseStudent.regNumber || 'REG/2026/0101')}`,
    idCardStatus: baseStudent.idCardStatus || 'Active'
  });

  // Card orientation & view side
  const [cardOrientation, setCardOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);

  // Trigger 403 Forbidden alert if unauthorized edit attempted
  const handleUnauthorizedEditAttempt = () => {
    setShowAccessDeniedModal(true);
    // Log security event to backend
    fetch('/api/idcards/student-edit-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: studentData.studentId,
        studentName: studentData.name,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  };

  // Trigger Print Mode
  const handlePrintCard = () => {
    window.print();
  };

  // Generate PDF for Student ID Card
  const handleDownloadPdf = () => {
    const isPortrait = cardOrientation === 'portrait';
    const width = isPortrait ? 53.98 : 85.6;
    const height = isPortrait ? 85.6 : 53.98;

    const doc = new jsPDF({
      orientation: isPortrait ? 'portrait' : 'landscape',
      unit: 'mm',
      format: [width, height]
    });

    const primaryRgb = [30, 58, 138];
    const accentRgb = [249, 115, 22];

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
    doc.text('STUDENT DIGITAL ID CARD', width / 2, isPortrait ? 15.5 : 12.5, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(studentData.name, width / 2, isPortrait ? 24 : 18, { align: 'center' });

    doc.setFontSize(5);
    doc.setTextColor(239, 68, 68);
    doc.text(`REG NO: ${studentData.regNumber}`, width / 2, isPortrait ? 27.5 : 21, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');

    const startY = isPortrait ? 33 : 25;
    const lineGap = 3.5;

    doc.text(`Student ID:`, 4, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.studentId, 22, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(`Father Name:`, 4, startY + lineGap);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.fatherName.substring(0, 20), 22, startY + lineGap);

    doc.setFont('helvetica', 'bold');
    doc.text(`Course:`, 4, startY + lineGap * 2);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.course.substring(0, 24), 22, startY + lineGap * 2);

    doc.setFont('helvetica', 'bold');
    doc.text(`Batch:`, 4, startY + lineGap * 3);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.batch.substring(0, 24), 22, startY + lineGap * 3);

    doc.setFont('helvetica', 'bold');
    doc.text(`Mobile:`, 4, startY + lineGap * 4);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.mobile, 22, startY + lineGap * 4);

    doc.setFont('helvetica', 'bold');
    doc.text(`Validity:`, 4, startY + lineGap * 5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${studentData.issueDate} - ${studentData.validTill}`, 22, startY + lineGap * 5);

    // Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(0, height - 12, width, 12, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL VERIFIED BADGE — PEARL ACADEMY', width / 2, height - 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('pearlacademy.edu.in/verify', width / 2, height - 4, { align: 'center' });

    // BACK SIDE
    doc.addPage([width, height], isPortrait ? 'portrait' : 'landscape');
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, width, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTITUTE RULES & GUIDELINES', width / 2, 6, { align: 'center' });

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(4);
    doc.setFont('helvetica', 'normal');

    const rules = [
      '1. This ID card is non-transferable and must be carried at all times on campus.',
      '2. Loss of ID card must be reported immediately to administrative office.',
      '3. Scanning the QR code validates official enrollment in Pearl Academy.',
      '4. Unauthorized duplication or alteration is strictly prohibited.'
    ];

    let ruleY = 15;
    rules.forEach((rule) => {
      doc.text(rule, 3, ruleY, { maxWidth: width - 6 });
      ruleY += 4.5;
    });

    doc.text('RETURN ADDRESS IF FOUND:', 3, ruleY + 2);
    doc.text('Pearl Computer & Target Academy, Near Railway Station Road, Parasia, Chhindwara (M.P.) - 480441', 3, ruleY + 6, { maxWidth: width - 6 });

    doc.save(`Student_ID_${studentData.studentId}_${studentData.regNumber.replace(/\//g, '_')}.pdf`);
  };

  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `https://pearlacademy.edu.in/verify?reg=${studentData.regNumber}&id=${studentData.studentId}`
  )}`;

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Printable Area CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #student-idcard-printable-area, #student-idcard-printable-area * {
            visibility: visible !important;
          }
          #student-idcard-printable-area {
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

      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* Security / Permissions Notice Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Official Student Document
              </span>
              <span className="text-xs text-blue-200 font-mono">Reg: {studentData.regNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">Digital Student ID Card</h1>
            <p className="text-xs text-blue-200 max-w-xl">
              Students have permission to <strong>view, print, and download</strong> their official ID Card. Details can only be modified by Institute Administrators.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handlePrintCard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" /> Print ID Card
            </button>

            <button
              onClick={handleDownloadPdf}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* View Controls (Side Switch & Orientation) */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap justify-between items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">View Card Side:</span>
            <button
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSide === 'both' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              Front & Back
            </button>
            <button
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSide === 'front' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              Front Only
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                activeSide === 'back' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              Back Only
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Orientation:</span>
            <button
              onClick={() => setCardOrientation('portrait')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 ${
                cardOrientation === 'portrait' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" /> Portrait
            </button>
            <button
              onClick={() => setCardOrientation('landscape')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 ${
                cardOrientation === 'landscape' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 rotate-90" /> Landscape
            </button>
          </div>
        </div>

        {/* PRINTABLE ID CARD CANVAS */}
        <div id="student-idcard-printable-area" className="flex flex-col md:flex-row justify-center items-center gap-8 py-6">
          {/* FRONT SIDE CARD */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div
              className={`rounded-3xl shadow-xl overflow-hidden border border-slate-300 bg-white relative transition-all ${
                cardOrientation === 'portrait' ? 'w-[320px] h-[500px]' : 'w-[450px] h-[280px]'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-4 text-center text-white">
                <div className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-black tracking-wide">PEARL COMPUTER & TARGET</span>
                </div>
                <p className="text-[9px] text-blue-200 tracking-wider uppercase font-semibold mt-0.5">
                  ISO 9001:2015 & Govt. Recognized Institute
                </p>
              </div>

              {/* Accent Banner */}
              <div className="bg-orange-500 text-slate-950 py-1 text-[10px] font-black uppercase text-center tracking-wider">
                STUDENT DIGITAL ID CARD
              </div>

              {/* Student Details Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-md shrink-0">
                    <img src={studentData.avatar} alt={studentData.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1 text-slate-800">
                    <h3 className="text-base font-black leading-tight text-slate-900">{studentData.name}</h3>
                    <p className="text-xs text-orange-600 font-black font-mono">REG: {studentData.regNumber}</p>
                    <p className="text-xs font-bold text-slate-700">ID: {studentData.studentId}</p>
                    <p className="text-xs text-slate-500">Father: {studentData.fatherName}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div><strong className="text-slate-900">Course:</strong> {studentData.course}</div>
                  <div><strong className="text-slate-900">Batch:</strong> {studentData.batch}</div>
                  <div><strong className="text-slate-900">Blood Group:</strong> {studentData.bloodGroup} | <strong className="text-slate-900">DOB:</strong> {studentData.dob}</div>
                  <div><strong className="text-slate-900">Mobile:</strong> +91 {studentData.mobile}</div>
                  <div><strong className="text-slate-900">Validity:</strong> {studentData.issueDate} to {studentData.validTill}</div>
                </div>

                {/* QR Code Verification */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <img src={qrCodeImageUrl} alt="QR Code" className="w-12 h-12 border border-slate-300 rounded p-0.5" />
                    <div className="text-[9px] text-slate-500 font-mono">
                      <div>Official QR Code</div>
                      <div className="font-bold text-blue-600">pearlacademy.edu.in</div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-600 font-serif border-t border-slate-300 pt-1">
                    <div className="italic font-bold">Er. R. K. Sharma</div>
                    <div className="text-[8px] text-slate-400">Director / Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BACK SIDE CARD */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div
              className={`rounded-3xl shadow-xl overflow-hidden border border-slate-300 bg-white relative transition-all ${
                cardOrientation === 'portrait' ? 'w-[320px] h-[500px]' : 'w-[450px] h-[280px]'
              }`}
            >
              <div className="bg-slate-900 p-3 text-center text-white font-bold text-xs">
                INSTITUTE RULES & GUIDELINES
              </div>

              <div className="p-5 space-y-3 text-xs text-slate-700">
                <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-600">
                  <li>This ID card is non-transferable and must be presented on campus.</li>
                  <li>In case of loss, report immediately to the Institute Administrative office.</li>
                  <li>Scanning the QR code verifies official student enrollment status online.</li>
                  <li>Tampering, altering, or editing this card is strictly prohibited and subject to disciplinary action.</li>
                </ol>

                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 text-[11px]">Institute Contact & Return Address:</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pearl Computer & Target Academy<br />
                    Near Railway Station Road, Parasia, Chhindwara (M.P.) - 480441<br />
                    Helpline: +91 79998-29231 / +91 93292-84693
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACCESS DENIED 403 MODAL IF STUDENT ATTEMPTS EDITING */}
      {showAccessDeniedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-red-200 text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs bg-red-100 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full">
                403 Forbidden
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                Access Denied: Edit Permission Restricted
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Students do not have permission to modify, upload, or replace information on official ID Cards. Please contact Institute Administration for any updates.
              </p>
            </div>

            <button
              onClick={() => setShowAccessDeniedModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
