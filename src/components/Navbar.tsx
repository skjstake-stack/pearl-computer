import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Moon,
  Sun,
  User,
  Menu,
  X,
  Bot,
  FileCheck,
  Award,
  BookOpen,
  ChevronDown,
  ShieldAlert,
  Search,
  CheckCircle2,
  Home,
  FileEdit,
  ShieldCheck,
  CheckSquare,
  Compass
} from 'lucide-react';
import { UserSession, QuickNavItem } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentUser: UserSession | null;
  onLogout: () => void;
  onOpenAiAssistant: () => void;
  onOpenLoginModal: (portal: 'student' | 'faculty' | 'admin') => void;
  onOpenAdmissionModal: () => void;
}

const DEFAULT_NAV_ITEMS: QuickNavItem[] = [
  { id: '1', title: 'Home', badge: 'Main Hub', description: 'Main Institute Portal', icon: 'Home', targetTab: 'home', displayOrder: 1, status: 'Published', showDesktop: true, showMobile: true },
  { id: '2', title: 'Course Catalog', badge: 'Job-Oriented', description: 'DCA, ADCA, Tally, Python', icon: 'GraduationCap', targetTab: 'courses', displayOrder: 2, status: 'Published', showDesktop: true, showMobile: true },
  { id: '3', title: 'Online Admission Form', badge: 'Direct Enroll', description: 'Direct Online Registration', icon: 'FileEdit', targetTab: 'admission', displayOrder: 3, status: 'Published', showDesktop: true, showMobile: true },
  { id: '4', title: 'Verify Certificate', badge: 'ISO Certified', description: 'ISO 9001:2015 Verification', icon: 'ShieldCheck', targetTab: 'verification', displayOrder: 4, status: 'Published', showDesktop: true, showMobile: true },
  { id: '5', title: 'Exam Results Lookup', badge: 'Instant Marks', description: 'Check Scores & Marksheets', icon: 'Search', targetTab: 'results', displayOrder: 5, status: 'Published', showDesktop: true, showMobile: true },
  { id: '6', title: 'Online Practice Tests', badge: 'MCQ Prep', description: 'Interactive MCQ Quizzes', icon: 'CheckSquare', targetTab: 'mocktest', displayOrder: 6, status: 'Published', showDesktop: true, showMobile: true }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  onOpenAiAssistant,
  onOpenLoginModal,
  onOpenAdmissionModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const [quickNavDropdownOpen, setQuickNavDropdownOpen] = useState(false);
  const [quickNavItems, setQuickNavItems] = useState<QuickNavItem[]>(DEFAULT_NAV_ITEMS);

  useEffect(() => {
    fetch('/api/quick-nav')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setQuickNavItems(data.items);
        }
      })
      .catch(err => console.warn('Navbar QuickNav fetch error:', err));
  }, []);

  const renderNavIcon = (iconName: string, className = 'w-4 h-4') => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Compass;
    return <IconComponent className={className} />;
  };

  const handleNavClick = (item: QuickNavItem) => {
    setQuickNavDropdownOpen(false);
    setMobileMenuOpen(false);
    if (item.isExternal && item.externalUrl) {
      window.open(item.externalUrl, '_blank');
      return;
    }
    if (item.targetTab === 'admission') {
      onOpenAdmissionModal();
    } else {
      setActiveTab(item.targetTab);
    }
  };

  const mainNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'courses', label: 'Courses' },
    { id: 'verification', label: 'Verify Certificate' },
    { id: 'results', label: 'Exam Results' },
    { id: 'mocktest', label: 'Practice Tests' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Top Emergency & Contact Bar */}
      <div className="bg-blue-900 text-slate-100 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              Helpline: +91 79998-29231 / +91 93292-84693
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              bisan9329284693@gmail.com
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Main Branch: Near Railway Station, Parasia, Chhindwara (M.P.) - 480441
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 bg-blue-800 text-orange-300 px-2 py-0.5 rounded text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-orange-400" />
              ISO 9001:2015 & Govt. Recognized Institute
            </span>
            <button
              onClick={() => {
                setActiveTab('verification');
              }}
              className="hover:text-orange-300 transition-colors cursor-pointer font-medium"
            >
              Verify Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-blue-800 to-orange-600 dark:from-blue-400 dark:to-orange-400 bg-clip-text text-transparent">
                  Pearl Computer
                </span>
                <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300 font-extrabold px-1.5 py-0.5 rounded">
                  & TARGET ACADEMY
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Learn Today • Lead Tomorrow
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Quick Navigation Dropdown */}
            <div className="relative">
              <button
                onClick={() => setQuickNavDropdownOpen(!quickNavDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-orange-500" />
                <span>Quick Nav</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${quickNavDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {quickNavDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Quick Navigation Menu
                    </span>
                  </div>
                  {quickNavItems
                    .filter(i => i.showDesktop !== false)
                    .map((item) => {
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors flex items-start gap-3 group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {renderNavIcon(item.icon, "w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-white")}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {item.title}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-snug">
                              {item.description || item.badge || 'Quick Access Link'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>AI Advisory</span>
            </button>

            {/* User Logged In vs Log In Menu */}
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'student') setActiveTab('student-portal');
                    else if (currentUser.role === 'faculty') setActiveTab('faculty-portal');
                    else setActiveTab('admin-panel');
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm hover:bg-blue-700 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>
                    {currentUser.role === 'student'
                      ? 'Student Zone'
                      : currentUser.role === 'faculty'
                      ? 'Faculty Portal'
                      : 'Admin Panel'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline px-2 cursor-pointer font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                  className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Portal Login</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {portalDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLoginModal('student');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Student Login
                    </button>
                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLoginModal('faculty');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-2"
                    >
                      <Award className="w-4 h-4 text-orange-500" />
                      Faculty Login
                    </button>
                    <button
                      onClick={() => {
                        setPortalDropdownOpen(false);
                        onOpenLoginModal('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
                    >
                      <ShieldAlert className="w-4 h-4 text-emerald-600" />
                      Admin Panel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Online Admission Button */}
            <button
              onClick={onOpenAdmissionModal}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              Apply Online
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-2">
              Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickNavItems
                .filter(i => i.showMobile !== false)
                .map((item) => {
                  const isActive = activeTab === item.targetTab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {renderNavIcon(item.icon, "w-4 h-4 shrink-0")}
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Other Pages
            </span>
            <div className="grid grid-cols-2 gap-2">
              {mainNavItems
                .filter((m) => !['home', 'courses', 'verification', 'results', 'mocktest'].includes(m.id))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-left ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmissionModal();
              }}
              className="bg-orange-500 text-white py-2.5 rounded-lg text-xs font-bold text-center col-span-2"
            >
              Online Admission Form
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLoginModal('student');
              }}
              className="border border-blue-600 text-blue-600 py-2 rounded-lg text-xs font-semibold"
            >
              Student Login
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLoginModal('faculty');
              }}
              className="border border-slate-300 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-xs font-semibold"
            >
              Faculty Login
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-600 dark:text-slate-300 flex flex-col gap-1 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Phone className="w-3.5 h-3.5 text-orange-500" /> Helpline: +91 79998-29231 / +91 93292-84693
            </span>
            <span className="text-[10px] text-slate-500">
              Near Railway Station, Railway Road, Parasia, District - Chhindwara (M.P.) - 480441
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
