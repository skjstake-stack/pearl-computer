import React from 'react';
import {
  ShieldCheck,
  Cpu,
  UserCheck,
  BookOpenCheck,
  Briefcase,
  Wallet,
  Download,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface WhyChooseUsProps {
  onOpenAdmissionModal: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenAdmissionModal }) => {
  const highlights = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: 'Govt. Recognized & ISO 9001:2015',
      desc: 'Certificates valid for all Central & MP Govt jobs, Patwari, CPCT, Banking, SSC, Railway and private MNC IT firms.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-orange-500" />,
      title: '100% Practical Computer Labs',
      desc: 'High-speed modern computers with individual student terminals, high-speed optic fiber Wi-Fi, and software suites.'
    },
    {
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Certified Expert Trainers',
      desc: 'Learn directly from M.Tech engineers, Chartered Accountants (for Tally GST), and selected competitive exam mentors.'
    },
    {
      icon: <BookOpenCheck className="w-6 h-6 text-amber-500" />,
      title: 'Free Study Material & Notes',
      desc: 'Comprehensive printed & handwritten PDF study modules, shortcut key reference books, and practice test papers.'
    },
    {
      icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
      title: 'Placement & Resume Support',
      desc: 'Dedicated career guidance cell with 200+ hiring partners in Indore, Bhopal and national IT hubs.'
    },
    {
      icon: <Wallet className="w-6 h-6 text-teal-600" />,
      title: 'Affordable Fees & Installments',
      desc: 'Flexible monthly installment payment options and special early-bird scholarship discounts.'
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/80 px-3 py-1 rounded-full">
            Institute Distinction
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
            Why Choose Pearl Computer & Target Academy?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Empowering over 10,000+ students with industry-relevant computer education and competitive civil service foundation coaching.
          </p>
        </div>

        {/* 6 Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg group"
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Download Prospectus Banner */}
        <div className="mt-12 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Official Session Brochure 2026-27
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Download Complete Course Prospectus & Fee Structure
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
              Get detailed syllabus breakdown, batch timings, scholarship eligibility, and placement statistics in a single PDF.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                alert('Downloading Pearl Computer & Target Academy Official Prospectus 2026 PDF...');
              }}
              className="bg-white text-blue-900 hover:bg-slate-100 font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>Download Prospectus PDF</span>
            </button>

            <button
              onClick={onOpenAdmissionModal}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl text-xs text-center cursor-pointer transition-colors"
            >
              Apply Online Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
