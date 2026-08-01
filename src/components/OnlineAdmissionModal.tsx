import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Upload,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { sampleCourses } from '../data/mockData';

interface OnlineAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseTitle?: string;
}

export const OnlineAdmissionModal: React.FC<OnlineAdmissionModalProps> = ({
  isOpen,
  onClose,
  defaultCourseTitle = ''
}) => {
  const [courses, setCourses] = useState<any[]>(sampleCourses);
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
        }
      })
      .catch(() => {});
  }, []);

  // Form Fields
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    fullAddress: '',
    state: 'Madhya Pradesh',
    district: 'Indore',
    city: 'Indore',
    pinCode: '452001',
    qualification: '12th Pass',
    courseAppliedFor: defaultCourseTitle || 'DCA (Diploma in Computer Applications)',
    preferredBatch: 'Morning 08:00 AM - 10:00 AM',
    paymentMode: 'Online UPI/Card' as 'Online UPI/Card' | 'Cash at Center' | 'Installment Plan',
    captchaAnswer: '',
    photoUploaded: true,
    aadhaarUploaded: true,
    signatureUploaded: true,
    additionalDocsUploaded: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    aadhaarUrl: 'https://via.placeholder.com/400x250.png?text=Aadhaar+Card+Doc',
    signatureUrl: 'https://via.placeholder.com/300x100.png?text=Student+Signature',
    additionalDocsUrl: 'https://via.placeholder.com/400x250.png?text=Qualification+Certificate'
  });

  const handleFileUpload = (field: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [`${field}Url`]: reader.result as string,
        [`${field}Uploaded`]: true,
        [`${field}FileName`]: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.studentName.trim() || !formData.fatherName.trim() || !formData.mobileNumber.trim() || !formData.email.trim()) {
        setErrorMessage('Please fill in Student Name, Father Name, Mobile Number, and Email.');
        return;
      }
    } else if (step === 2) {
      if (!formData.fullAddress.trim() || !formData.city.trim() || !formData.pinCode.trim()) {
        setErrorMessage('Please complete Address, City and PIN Code.');
        return;
      }
    } else if (step === 3) {
      if (formData.captchaAnswer.trim() !== '12') {
        setErrorMessage('Incorrect CAPTCHA answer. What is 7 + 5? Enter 12.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult(data);
        setStep(5); // Success step
      } else {
        setErrorMessage(data.message || 'Failed to submit admission form.');
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate PDF Receipt
  const generatePdfReceipt = () => {
    if (!submissionResult) return;
    const doc = new jsPDF();
    const app = submissionResult.applicationDetails;

    // Header Title
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEARL COMPUTER & TARGET ACADEMY', 105, 14, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Online Admission Acknowledgment Slip 2026-27', 105, 22, { align: 'center' });

    // Details Grid
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Application Number: ${submissionResult.applicationNumber}`, 14, 42);
    doc.text(`Submission Date: ${submissionResult.submissionDate}`, 14, 48);

    doc.line(14, 52, 196, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let y = 60;
    const items = [
      ['Student Name', app.studentName],
      ['Father Name', app.fatherName],
      ['Mother Name', app.motherName],
      ['DOB & Gender', `${app.dob} (${app.gender})`],
      ['Mobile & WhatsApp', `${app.mobileNumber} / ${app.whatsappNumber}`],
      ['Email Address', app.email],
      ['Address', `${app.fullAddress}, ${app.city}, ${app.state} - ${app.pinCode}`],
      ['Qualification', app.qualification],
      ['Course Applied', app.courseAppliedFor],
      ['Preferred Batch', app.preferredBatch],
      ['Payment Mode', app.paymentMode],
      ['Status', app.status.toUpperCase()],
      ['Notification Dispatched', `Institute Email (${submissionResult.instituteEmailNotified})`]
    ];

    items.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 70, y);
      y += 8;
    });

    // Notice Footer
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y + 10, 182, 30, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: This is a system-generated acknowledgment receipt. Keep this Application Number safe.', 18, y + 18);
    doc.text('Your Student Login Account will be generated automatically upon Admin Approval.', 18, y + 24);
    doc.text('Institute Helpline: +91 79998-29231 / +91 93292-84693 | Email: bisan9329284693@gmail.com', 18, y + 30);

    doc.save(`Admission_Receipt_${submissionResult.applicationNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-orange-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Online Student Admission Form</h2>
              <p className="text-xs text-blue-200">Session 2026-27 • Pearl Computer & Target Academy</p>
            </div>
          </div>

          {/* Stepper Bar */}
          {step <= 4 && (
            <div className="mt-5 grid grid-cols-4 gap-2 text-[11px] font-semibold text-center">
              <div className={`py-1.5 rounded-lg border ${step >= 1 ? 'bg-orange-500 text-white border-orange-400' : 'bg-blue-900/50 text-blue-300 border-blue-700'}`}>
                1. Personal
              </div>
              <div className={`py-1.5 rounded-lg border ${step >= 2 ? 'bg-orange-500 text-white border-orange-400' : 'bg-blue-900/50 text-blue-300 border-blue-700'}`}>
                2. Address
              </div>
              <div className={`py-1.5 rounded-lg border ${step >= 3 ? 'bg-orange-500 text-white border-orange-400' : 'bg-blue-900/50 text-blue-300 border-blue-700'}`}>
                3. Course
              </div>
              <div className={`py-1.5 rounded-lg border ${step >= 4 ? 'bg-orange-500 text-white border-orange-400' : 'bg-blue-900/50 text-blue-300 border-blue-700'}`}>
                4. Uploads
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <User className="w-4 h-4 text-blue-600" /> Step 1: Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Father's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="e.g. Manoj Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="e.g. Sunita Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9826012345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="e.g. 9826012345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address & Qualification */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <MapPin className="w-4 h-4 text-blue-600" /> Step 2: Address & Educational Qualification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Full Permanent Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="House No., Street Name, Colony / Landmark"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Highest Educational Qualification
                  </label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass (PCM / Commerce / Arts)</option>
                    <option value="Graduation (B.A/B.Com/B.Sc)">Graduation (B.A / B.Com / B.Sc / BCA)</option>
                    <option value="Post Graduation">Post Graduation (M.Com / M.Sc / MCA)</option>
                    <option value="Diploma Holder">Diploma Holder</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Course Selection & Payment */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Step 3: Course Selection & Batch Preference
              </h3>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Course Applied For <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courseAppliedFor"
                    value={formData.courseAppliedFor}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.title}>
                        {course.title} (₹{(course.discountFees || course.fees).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Preferred Batch Timing
                  </label>
                  <select
                    name="preferredBatch"
                    value={formData.preferredBatch}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Morning 08:00 AM - 10:00 AM">Morning 08:00 AM - 10:00 AM</option>
                    <option value="Morning 10:30 AM - 12:30 PM">Morning 10:30 AM - 12:30 PM</option>
                    <option value="Afternoon 02:00 PM - 04:00 PM">Afternoon 02:00 PM - 04:00 PM</option>
                    <option value="Evening 05:00 PM - 07:00 PM">Evening 05:00 PM - 07:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Payment Preference
                  </label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Online UPI/Card">Online Payment (UPI / PhonePe / GPay / NetBanking)</option>
                    <option value="Cash at Center">Cash / Offline Entry at Center</option>
                    <option value="Installment Plan">Monthly Installment Plan</option>
                  </select>
                </div>

                {/* Security CAPTCHA */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security CAPTCHA Verification: What is 7 + 5?
                  </label>
                  <input
                    type="text"
                    name="captchaAnswer"
                    value={formData.captchaAnswer}
                    onChange={handleChange}
                    placeholder="Enter answer (e.g. 12)"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Document Uploads */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b pb-2 dark:border-slate-800">
                <Upload className="w-4 h-4 text-blue-600" /> Step 4: Photo, ID, Signature & Additional Documents Upload
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Passport Photo */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Passport Photo <span className="text-red-500">*</span></h4>
                      <p className="text-[10px] text-slate-400">JPG/PNG up to 2MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('photo', e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached / Default Active
                  </div>
                </div>

                {/* 2. Aadhaar / ID Proof */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Aadhaar / ID Card <span className="text-red-500">*</span></h4>
                      <p className="text-[10px] text-slate-400">PDF/JPG up to 5MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload('aadhaar', e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ID Attached / Default Active
                  </div>
                </div>

                {/* 3. Student Signature */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Student Signature <span className="text-red-500">*</span></h4>
                      <p className="text-[10px] text-slate-400">PNG/JPG up to 2MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('signature', e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Signature Attached / Default Active
                  </div>
                </div>

                {/* 4. Additional Documents */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">Additional Documents</h4>
                      <p className="text-[10px] text-slate-400">10th/12th Marksheet, Transfer Cert</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileUpload('additionalDocs', e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Qualification Certificates Upload
                  </div>
                </div>
              </div>

              {/* Notification Notice Alert */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs space-y-1.5 text-blue-900 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" /> Instant Notification Alert:
                </div>
                <p className="text-[11px] leading-relaxed">
                  Submitting this form will automatically send an instant complete admission summary & document attachments notification to the Institute Email (<strong className="text-blue-700 dark:text-blue-300">bisan9329284693@gmail.com</strong>) and student confirmation email.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Success Confirmation Page */}
          {step === 5 && submissionResult && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                  Admission Submitted Successfully
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Application Number: {submissionResult.applicationNumber}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submission Date: {submissionResult.submissionDate}
                </p>
              </div>

              {/* Institute Email Dispatched Banner */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                  <span>Institute Email Notification Dispatched:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">Sent ✔</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  All submitted form details, applicant photo, Aadhaar documents & IP logs were emailed to <strong className="text-blue-600 dark:text-blue-400">{submissionResult.instituteEmailNotified}</strong>.
                </p>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/80 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                  ⚡ <strong>Automatic Student Login Account:</strong> Upon Admin review & approval, your unique Student ID, Registration Number & Password will be generated automatically and sent to your email & WhatsApp.
                </div>
              </div>

              {/* PDF & Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={generatePdfReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> Download Application PDF Receipt
                </button>

                <button
                  onClick={onClose}
                  className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-6 py-3 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}

          {/* Stepper Nav Controls */}
          {step <= 4 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Continue Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-orange-500/20"
                >
                  {isSubmitting ? 'Submitting Form...' : 'Submit & Notify Institute'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
