import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { PopularCourses } from './components/PopularCourses';
import { VerificationZone } from './components/VerificationZone';
import { OnlineAdmissionModal } from './components/OnlineAdmissionModal';
import { LoginModal } from './components/LoginModal';
import { StudentPortalDashboard } from './components/StudentPortalDashboard';
import { FacultyPortalDashboard } from './components/FacultyPortalDashboard';
import { CenterPortalDashboard } from './components/CenterPortalDashboard';
import { AdminPanelDashboard } from './components/AdminPanelDashboard';
import { AIChatAssistant } from './components/AIChatAssistant';
import { DigitalIdCardGenerator } from './components/DigitalIdCardGenerator';
import { GalleryPage } from './components/GalleryPage';
import { HomeGallerySection } from './components/HomeGallerySection';
import { DirectorsDeskSection } from './components/DirectorsDeskSection';
import { Footer } from './components/Footer';
import { UserSession, StudentAccount } from './types';
import { sampleNotices, sampleBlogs } from './data/mockData';
import {
  Phone,
  Mail,
  MapPin,
  Bot,
  ChevronDown,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // User session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [currentStudentDetails, setCurrentStudentDetails] = useState<StudentAccount | null>(null);

  // Modals state
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState<boolean>(false);
  const [admissionDefaultCourse, setAdmissionDefaultCourse] = useState<string>('');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginPortalType, setLoginPortalType] = useState<'student' | 'faculty' | 'admin' | 'center'>('student');

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Course search filter passing
  const [selectedCourseQuery, setSelectedCourseQuery] = useState<string>('');

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleOpenAdmission = (courseTitle?: string) => {
    if (courseTitle) setAdmissionDefaultCourse(courseTitle);
    setIsAdmissionModalOpen(true);
  };

  const handleOpenLogin = (portal: 'student' | 'faculty' | 'admin' | 'center') => {
    setLoginPortalType(portal);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (user: UserSession, studentDetails?: any) => {
    setCurrentUser(user);
    if (studentDetails) setCurrentStudentDetails(studentDetails);

    if (user.role === 'student') setActiveTab('student-portal');
    else if (user.role === 'faculty') setActiveTab('faculty-portal');
    else if (user.role === 'center') setActiveTab('center-portal');
    else setActiveTab('admin-panel');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentStudentDetails(null);
    setActiveTab('home');
  };

  const faqs = [
    {
      q: 'Are Pearl Computer & Target Academy certificates valid for MP Govt Jobs?',
      a: 'Yes, 100%! All DCA, ADCA, PGDCA, Tally Prime, and CCC certificates issued by Pearl Academy are ISO 9001:2015 certified and fully recognized for all Central & MP State Govt jobs, Patwari, CPCT, Police, Banking, and SSC exams.'
    },
    {
      q: 'What is the procedure for Online Admission?',
      a: 'Click on the "Online Admission Form" button, fill in your personal details, choose your course and preferred batch, upload sample documents, and submit. An instant notification will be sent to the institute email (bisan9329284693@gmail.com). Upon admin approval, your Student Login ID & password will be created automatically.'
    },
    {
      q: 'Can I pay my course fees in monthly installments?',
      a: 'Yes, we offer easy 0% interest monthly installment options for all long-term courses like ADCA, PGDCA, Fullstack Web Dev, and MPPSC Civil Services Foundation Coaching.'
    },
    {
      q: 'How can I verify my certificate authenticity?',
      a: 'You can visit the "Verification & Results" page on our website and enter your Certificate Number or scan the QR code printed on your certificate for instant 24x7 online verification.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Main Header Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenLoginModal={handleOpenLogin}
          onOpenAdmissionModal={() => handleOpenAdmission()}
        />

        {/* Dynamic Page Views */}

        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <main>
            {/* Hero Section */}
            <HeroSection
              onOpenAdmissionModal={() => handleOpenAdmission()}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSearchCourse={(query) => setSelectedCourseQuery(query)}
            />

            {/* Why Choose Us */}
            <WhyChooseUs onOpenAdmissionModal={() => handleOpenAdmission()} />

            {/* Popular Courses Section */}
            <PopularCourses
              onOpenAdmissionModal={handleOpenAdmission}
              selectedCourseFilter={selectedCourseQuery}
            />

            {/* Latest Notices & News Highlights */}
            <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full">
                      Campus Updates
                    </span>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                      Latest Notices & Announcements
                    </h2>
                  </div>

                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    View All Notices →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sampleNotices.map((n) => (
                    <div
                      key={n.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                          {n.category}
                        </span>
                        <span className="text-slate-400">{n.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Home Gallery Preview Section */}
            <HomeGallerySection onViewAllGallery={() => setActiveTab('gallery')} />

            {/* FAQ Accordion Section */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
              <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Get answers regarding admissions, certifications, and course validity.</p>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                        className="w-full text-left p-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex justify-between items-center cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/60 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        )}

        {/* 2. COURSES VIEW */}
        {activeTab === 'courses' && (
          <PopularCourses
            onOpenAdmissionModal={handleOpenAdmission}
            selectedCourseFilter={selectedCourseQuery}
          />
        )}

        {/* GALLERY VIEW */}
        {activeTab === 'gallery' && <GalleryPage />}

        {/* RESTRICTED PUBLIC ID CARD VIEW (403 FORBIDDEN) */}
        {activeTab === 'idcard' && (
          <div className="py-20 bg-slate-50 dark:bg-slate-900 min-h-[60vh] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-lg w-full rounded-3xl p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-3 py-1 rounded-full">
                  403 Forbidden Access
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
                  Public ID Card Access Restricted
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  The public ID Card Generator is disabled. Official Student ID Cards are strictly issued and managed by Institute Administration. Enrolled students can view and download their ID Card inside the <strong>Student Portal</strong> after logging in.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all"
                >
                  Return to Home Page
                </button>
                <button
                  onClick={() => handleOpenLogin('student')}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Student Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADMISSION TRIGGER VIEW */}
        {activeTab === 'admission' && (
          <div className="py-16 bg-slate-50 dark:bg-slate-900 text-center space-y-4">
            <h2 className="text-2xl font-bold">Online Student Admission Portal</h2>
            <p className="text-xs text-slate-500">Click below to open the multi-step online admission form.</p>
            <button
              onClick={() => handleOpenAdmission()}
              className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-xs"
            >
              Open Admission Form Modal
            </button>
          </div>
        )}

        {/* 4. VERIFICATION, RESULTS & MOCK TESTS VIEWS */}
        {activeTab === 'verification' && <VerificationZone initialSubTab="certificate" />}
        {activeTab === 'results' && <VerificationZone initialSubTab="result" />}
        {activeTab === 'mocktest' && <VerificationZone initialSubTab="mocktest" />}

        {/* 5. ABOUT US VIEW */}
        {activeTab === 'about' && (
          <div className="py-12 max-w-7xl mx-auto px-4 space-y-12">
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase text-orange-600 bg-orange-50 dark:bg-orange-950/80 dark:text-orange-300 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                Our Legacy & History
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                About Pearl Computer & Target Academy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Established in 2012 in Indore, M.P. • Empowering 10,000+ Students across Central India</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              <p>
                <strong>Pearl Computer & Target Academy</strong> is a premier ISO 9001:2015 certified educational institution based in Indore, Madhya Pradesh. Our dual focus combines cutting-edge IT computer education (DCA, ADCA, Tally Prime with GST, Python, Web Development, Graphic Design) with high-yield competitive civil service coaching for MPPSC, SSC, Banking, Railway, Patwari, and CTET exams.
              </p>
              <p>
                Equipped with 100% practical computer labs, air-conditioned smart classrooms, and led by veteran M.Tech engineers & Chartered Accountants, we ensure every student gains real-world practical skills and official Govt recognized certifications.
              </p>
            </div>

            {/* Director's Desk Section */}
            <DirectorsDeskSection />
          </div>
        )}

        {/* 6. NOTICES & BLOGS VIEW */}
        {activeTab === 'notices' && (
          <div className="py-12 max-w-5xl mx-auto px-4 space-y-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notices & Career Articles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sampleBlogs.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">{b.category}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-slate-500">{b.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CONTACT VIEW */}
        {activeTab === 'contact' && (
          <div className="py-12 max-w-5xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact Us</h1>
              <p className="text-xs text-slate-500">Pearl Computer & Target Academy Main Campus</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Main Branch Address</h3>
                <p>Near Railway Station Road, Parasia, Tehsil - Parasia, District - Chhindwara, Madhya Pradesh 480441</p>
                <p><strong>Phone:</strong> +91 79998-29231 / +91 93292-84693</p>
                <p><strong>Email:</strong> bisan9329284693@gmail.com</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Send Quick Message</h3>
                <input type="text" placeholder="Your Name" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                <input type="email" placeholder="Your Email" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                <textarea placeholder="Message..." rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl" />
                <button
                  onClick={() => alert('Thank you! Message sent to Pearl Academy inbox.')}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. STUDENT PORTAL DASHBOARD */}
        {activeTab === 'student-portal' && currentUser && currentUser.role === 'student' && (
          <StudentPortalDashboard
            currentUser={currentUser}
            studentDetails={currentStudentDetails}
            onLogout={handleLogout}
          />
        )}

        {/* 9. FACULTY PORTAL DASHBOARD */}
        {activeTab === 'faculty-portal' && currentUser && currentUser.role === 'faculty' && (
          <FacultyPortalDashboard currentUser={currentUser} onLogout={handleLogout} />
        )}

        {/* 10. CENTER PORTAL DASHBOARD */}
        {activeTab === 'center-portal' && currentUser && currentUser.role === 'center' && (
          <CenterPortalDashboard currentUser={currentUser} onLogout={handleLogout} />
        )}

        {/* 11. ADMIN PANEL DASHBOARD */}
        {activeTab === 'admin-panel' && currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
          <AdminPanelDashboard currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>

      {/* Global Modals */}
      <OnlineAdmissionModal
        isOpen={isAdmissionModalOpen}
        onClose={() => setIsAdmissionModalOpen(false)}
        defaultCourseTitle={admissionDefaultCourse}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        portalType={loginPortalType}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating AI Widget Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-pointer border border-blue-400/40"
        >
          <Bot className="w-5 h-5 text-orange-400 animate-pulse" />
          <span>AI Course Advisory</span>
        </button>
      </div>

      {/* Floating WhatsApp Quick Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={`https://wa.me/919329284693?text=${encodeURIComponent('Hello Pearl Computer & Target Academy, I have an inquiry regarding courses and admission.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-emerald-600 hover:bg-emerald-700 text-white px-4.5 py-3 rounded-full font-bold text-xs flex items-center gap-2.5 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40 group"
          title="Chat with Pearl Academy on WhatsApp"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100"></span>
          </span>
          <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
          <span className="hidden sm:inline font-bold tracking-wide">WhatsApp Quick Chat</span>
          <span className="sm:hidden font-bold">WhatsApp</span>
        </a>
      </div>

      <AIChatAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      {/* Footer */}
      <Footer
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenAdmissionModal={() => handleOpenAdmission()}
      />
    </div>
  );
}
