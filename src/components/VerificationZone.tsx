import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Award,
  QrCode,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Clock,
  RotateCcw,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { sampleCertificates, sampleResults, sampleMockTests } from '../data/mockData';
import { CertificateRecord, ResultRecord, OnlineTest } from '../types';

interface VerificationZoneProps {
  initialSubTab?: 'certificate' | 'result' | 'mocktest';
}

export const VerificationZone: React.FC<VerificationZoneProps> = ({ initialSubTab = 'certificate' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'certificate' | 'result' | 'mocktest'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Certificate State
  const [certInput, setCertInput] = useState('PCTA-CERT-2026-0089');
  const [certResult, setCertResult] = useState<CertificateRecord | null>(sampleCertificates[0]);
  const [certError, setCertError] = useState('');
  const [isSearchingCert, setIsSearchingCert] = useState(false);

  // Result State
  const [rollInput, setRollInput] = useState('PCTA2026101');
  const [examResult, setExamResult] = useState<ResultRecord | null>(sampleResults[0]);
  const [rollError, setRollError] = useState('');

  // Mock Test State
  const [activeTest, setActiveTest] = useState<OnlineTest | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testTimeLeft, setTestTimeLeft] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScoreResult, setTestScoreResult] = useState<any>(null);

  // Search Certificate
  const handleVerifyCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;

    setIsSearchingCert(true);
    setCertError('');
    setCertResult(null);

    try {
      const res = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certNo: certInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCertResult(data.certificate);
      } else {
        setCertError(data.message || 'Certificate not found.');
      }
    } catch (err) {
      setCertError('Failed to verify certificate.');
    } finally {
      setIsSearchingCert(false);
    }
  };

  // Search Result
  const handleSearchResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollInput.trim()) return;

    setRollError('');
    setExamResult(null);

    try {
      const res = await fetch('/api/results/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: rollInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setExamResult(data.result);
      } else {
        setRollError(data.message || 'Result not found.');
      }
    } catch (err) {
      setRollError('Failed to fetch exam result.');
    }
  };

  // Start Test
  const handleStartTest = (test: OnlineTest) => {
    setActiveTest(test);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScoreResult(null);
  };

  // Submit Test
  const handleSubmitTest = async () => {
    if (!activeTest) return;

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: activeTest.id,
          userAnswers: testAnswers,
          studentName: 'Online Candidate',
          rollNumber: 'GUEST-TEST'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestScoreResult(data);
        setTestSubmitted(true);
      }
    } catch (err) {
      alert('Error submitting test.');
    }
  };

  // Print Certificate PDF
  const printCertificatePdf = () => {
    if (!certResult) return;
    const doc = new jsPDF('landscape');

    // Decorative Border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('PEARL COMPUTER & TARGET ACADEMY', 148, 35, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('ISO 9001:2015 Certified EdTech Institute • Govt. Recognized', 148, 43, { align: 'center' });

    doc.setFontSize(26);
    doc.setFont('times', 'bold');
    doc.setTextColor(249, 115, 22);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 148, 65, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('This is to certify that', 148, 80, { align: 'center' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(certResult.studentName.toUpperCase(), 148, 92, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Son/Daughter of Shri ${certResult.fatherName}`, 148, 102, { align: 'center' });

    doc.text('has successfully completed the prescribed course in', 148, 112, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(certResult.courseName, 148, 125, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Duration: ${certResult.duration}  |  Grade Obtained: ${certResult.grade}`, 148, 137, { align: 'center' });

    // Footer info
    doc.setFontSize(10);
    doc.text(`Certificate No: ${certResult.certificateNumber}`, 25, 175);
    doc.text(`Issue Date: ${certResult.issueDate}`, 25, 182);
    doc.text('Status: OFFICIAL VALID CERTIFICATE', 25, 189);

    doc.text('Authorized Signatory', 220, 180, { align: 'center' });
    doc.text('Academic Director', 220, 187, { align: 'center' });

    doc.save(`Certificate_${certResult.certificateNumber}.pdf`);
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subtab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex space-x-1">
            <button
              onClick={() => setActiveSubTab('certificate')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'certificate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Certificate Verification
            </button>

            <button
              onClick={() => setActiveSubTab('result')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'result'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" /> Exam Result Lookup
            </button>

            <button
              onClick={() => setActiveSubTab('mocktest')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'mocktest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-4 h-4" /> Online Mock Test
            </button>
          </div>
        </div>

        {/* 1. CERTIFICATE VERIFICATION TAB */}
        {activeSubTab === 'certificate' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Online Certificate Verification System
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your unique Pearl Computer & Target Academy Certificate Number to verify authenticity.
              </p>

              <form onSubmit={handleVerifyCert} className="flex gap-2 max-w-md mx-auto pt-2">
                <input
                  type="text"
                  placeholder="e.g. PCTA-CERT-2026-0089"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={isSearchingCert}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {isSearchingCert ? 'Verifying...' : 'Verify'}
                </button>
              </form>

              {certError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 text-red-600 text-xs rounded-xl">
                  {certError}
                </div>
              )}
            </div>

            {/* Certificate Display Card */}
            {certResult && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Official Valid Record
                </div>

                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Center Code: {certResult.centerCode}
                  </span>
                  <h3 className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
                    Pearl Computer & Target Academy
                  </h3>
                  <p className="text-xs text-slate-500">ISO 9001:2015 Certified Educational Institution</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Certificate Number</span>
                    <strong className="text-slate-800 dark:text-slate-100 font-mono text-sm">{certResult.certificateNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Candidate Full Name</span>
                    <strong className="text-slate-800 dark:text-slate-100 text-sm">{certResult.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Father's Name</span>
                    <strong className="text-slate-800 dark:text-slate-100">{certResult.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Course Completed</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-bold">{certResult.courseName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grade & Distinction</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{certResult.grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Issue Date & Duration</span>
                    <strong className="text-slate-800 dark:text-slate-100">{certResult.issueDate} ({certResult.duration})</strong>
                  </div>
                </div>

                {/* QR Code & Print Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={certResult.qrCodeUrl}
                      alt="Verification QR"
                      className="w-16 h-16 rounded-lg border border-slate-200 p-1 bg-white"
                    />
                    <div className="text-[11px] text-slate-500">
                      Scan QR Code with mobile camera to re-verify anytime on <br />
                      <strong className="text-slate-700 dark:text-slate-300">pearlacademy.edu.in</strong>
                    </div>
                  </div>

                  <button
                    onClick={printCertificatePdf}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print / Download Certificate PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. EXAM RESULT LOOKUP TAB */}
        {activeSubTab === 'result' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-300 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Student Examination Result Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search exam results using Roll Number (e.g. PCTA2026101) or Registration Number.
              </p>

              <form onSubmit={handleSearchResult} className="flex gap-2 max-w-md mx-auto pt-2">
                <input
                  type="text"
                  placeholder="e.g. PCTA2026101"
                  value={rollInput}
                  onChange={(e) => setRollInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>

              {rollError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl">{rollError}</div>
              )}
            </div>

            {/* Exam Result Display Card */}
            {examResult && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4 dark:border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{examResult.studentName}</h3>
                    <p className="text-xs text-slate-500 font-mono">Roll No: {examResult.rollNumber} | Reg: {examResult.regNumber}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    examResult.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {examResult.status} ({examResult.grade})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Exam Name</span>
                    <strong className="text-slate-800 dark:text-slate-200">{examResult.examName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Course</span>
                    <strong className="text-blue-600 dark:text-blue-400">{examResult.course}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Overall Percentage</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-base">{examResult.percentage}%</strong>
                  </div>
                </div>

                {/* Subject Wise Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Subject Wise Score Breakdown:</h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    {examResult.subjectMarks.map((sub, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{sub.subject}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {sub.marksObtained} / {sub.maxMarks}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ONLINE MOCK TEST TAB */}
        {activeSubTab === 'mocktest' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!activeTest ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sampleMockTests.map((test) => (
                  <div
                    key={test.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">
                        {test.courseCategory}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{test.title}</h3>
                      <div className="flex gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {test.durationMinutes} Mins</span>
                        <span>{test.questions.length} MCQ Questions</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTest(test)}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      Start Online Practice Test
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4 dark:border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeTest.title}</h3>
                    <p className="text-xs text-slate-500">Answer all questions and submit for instant analysis.</p>
                  </div>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Exit Test
                  </button>
                </div>

                {!testSubmitted ? (
                  <div className="space-y-6">
                    {activeTest.questions.map((q, idx) => (
                      <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Q{idx + 1}. {q.question}
                        </p>

                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                                testAnswers[idx] === optIdx
                                  ? 'bg-blue-100 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={testAnswers[idx] === optIdx}
                                onChange={() => setTestAnswers({ ...testAnswers, [idx]: optIdx })}
                                className="text-blue-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSubmitTest}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-lg"
                    >
                      Submit Test & View Result Analysis
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Score: {testScoreResult.score} / {testScoreResult.totalQuestions} ({testScoreResult.percentage}%)
                    </h3>

                    <p className={`text-xs font-bold ${testScoreResult.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {testScoreResult.message}
                    </p>

                    <button
                      onClick={() => setActiveTest(null)}
                      className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                    >
                      Back to Mock Tests
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
