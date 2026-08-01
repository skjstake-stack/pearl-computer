import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Users,
  Search,
  FileCheck,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Building2,
  Download
} from 'lucide-react';

interface HeroSectionProps {
  onOpenAdmissionModal: () => void;
  onNavigateTab: (tab: string) => void;
  onSearchCourse: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAdmissionModal,
  onNavigateTab,
  onSearchCourse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackAppNo, setTrackAppNo] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');
  const [isTracking, setIsTracking] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchCourse(searchQuery);
      onNavigateTab('courses');
    }
  };

  const handleTrackApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackAppNo.trim()) return;

    setIsTracking(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const res = await fetch(`/api/admission/track/${encodeURIComponent(trackAppNo.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTrackingResult(data.application);
      } else {
        setTrackingError(data.message || 'No record found.');
      }
    } catch (err) {
      setTrackingError('Failed to connect to tracking server.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-700/60 backdrop-blur-md border border-blue-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-200">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Admissions Open for Session 2026-27</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Pearl Computer & <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
                Target Academy
              </span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100 max-w-2xl font-light leading-relaxed mx-auto lg:mx-0">
              ISO 9001:2015 Certified Premier EdTech Institute. Elevating technical & competitive excellence with job-oriented programs in <strong className="text-orange-300">DCA, ADCA, Tally Prime GST, Python, Web Dev, MPPSC, SSC & Banking</strong>.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search DCA, Tally GST, Python, MPPSC, Web Dev..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-3.5 bg-slate-900/80 backdrop-blur-md border border-blue-400/30 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Find Course
                </button>
              </div>
            </form>

            {/* Primary Action CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenAdmissionModal}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2 text-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Online Admission Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('courses')}
                className="bg-blue-800/80 hover:bg-blue-700/80 text-blue-100 border border-blue-400/30 font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-orange-400" />
                <span>Browse All Courses</span>
              </button>

              <button
                onClick={() => onNavigateTab('verification')}
                className="bg-slate-800/80 hover:bg-slate-700/80 text-blue-200 border border-slate-600/40 font-medium px-4 py-3.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Certificate</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-3 flex flex-wrap justify-center lg:justify-start gap-6 text-xs text-blue-200 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Govt. Recognized Certification
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Practical Computer Labs
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Placement & Resume Cell
              </span>
            </div>
          </div>

          {/* Right Card: Quick Admission Status Tracker & Upcoming Batches */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Status Tracker Card */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Track Admission Application</h3>
                    <p className="text-[11px] text-slate-400">Check your online application status</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  24x7 Live
                </span>
              </div>

              <form onSubmit={handleTrackApplication} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Application Number or Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PCTA-2026-8491 or 9826012345"
                    value={trackAppNo}
                    onChange={(e) => setTrackAppNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTracking}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isTracking ? 'Searching...' : 'Check Status Now'}
                </button>
              </form>

              {/* Status Output */}
              {trackingError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-lg">
                  {trackingError}
                </div>
              )}

              {trackingResult && (
                <div className="p-3.5 bg-slate-800/90 border border-blue-500/40 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-300">{trackingResult.studentName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        trackingResult.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : trackingResult.status === 'rejected'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {trackingResult.status}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    <strong>Course:</strong> {trackingResult.courseAppliedFor}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Submitted on: {trackingResult.submissionDate}
                  </p>
                  {trackingResult.generatedStudentId && (
                    <div className="p-2 bg-emerald-950/50 border border-emerald-800/60 rounded text-emerald-300 text-[11px] font-medium">
                      Student ID Created: <strong>{trackingResult.generatedStudentId}</strong>
                      <br />
                      <span className="text-[10px] text-emerald-400">
                        Login credentials sent to registered email & WhatsApp.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Batches Banner */}
            <div className="bg-gradient-to-r from-blue-800/90 to-indigo-900/90 border border-blue-400/30 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500 text-white font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-300 tracking-wider">
                    New Batches Alert
                  </span>
                  <h4 className="text-sm font-bold text-white">DCA, Tally Prime & MPPSC Foundation</h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Morning 08:00 AM & Evening 05:00 PM batches starting August 10th.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-t border-blue-700/50 pt-10">
          <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-2xl sm:text-3xl font-extrabold text-white">10,000+</div>
            <div className="text-xs text-blue-200 font-medium mt-1">Students Trained</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-2xl sm:text-3xl font-extrabold text-white">35+</div>
            <div className="text-xs text-blue-200 font-medium mt-1">Certified Courses</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 text-center">
            <Building2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs text-blue-200 font-medium mt-1">Practical Lab Sessions</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 text-center">
            <ShieldCheck className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl sm:text-3xl font-extrabold text-white">98%</div>
            <div className="text-xs text-blue-200 font-medium mt-1">Exam Qualification Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
