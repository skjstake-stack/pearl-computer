import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Compass,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { QuickNavItem } from '../types';

interface QuickNavigationSectionProps {
  onNavigateTab: (tab: string) => void;
  onOpenAdmissionModal: () => void;
  activeTab?: string;
}

// Fallback items in case server is booting or empty
const DEFAULT_QUICK_NAV: QuickNavItem[] = [
  {
    id: 'home',
    title: 'Home',
    badge: 'Main Hub',
    description: 'Explore main institute portal, features, latest announcements, and campus highlights.',
    icon: 'Home',
    color: 'from-blue-600 to-indigo-600',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/60',
    targetTab: 'home',
    displayOrder: 1,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  },
  {
    id: 'courses',
    title: 'Course Catalog',
    badge: 'Job-Oriented',
    description: 'Browse DCA, ADCA, Tally Prime with GST, Python, Web Development, & MPPSC courses.',
    icon: 'GraduationCap',
    color: 'from-purple-600 to-indigo-600',
    textColor: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/60',
    targetTab: 'courses',
    displayOrder: 2,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  },
  {
    id: 'admission',
    title: 'Online Admission Form',
    badge: 'Direct Enroll',
    description: 'Fill multi-step online student admission form to secure instant program seat.',
    icon: 'FileEdit',
    color: 'from-orange-500 to-amber-600',
    textColor: 'text-orange-500 dark:text-orange-400',
    bgLight: 'bg-orange-50 dark:bg-orange-950/60',
    targetTab: 'admission',
    displayOrder: 3,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  },
  {
    id: 'verification',
    title: 'Verify Certificate',
    badge: 'ISO Certified',
    description: 'Verify ISO 9001:2015 student diplomas and govt. recognized training certificates online.',
    icon: 'ShieldCheck',
    color: 'from-emerald-600 to-teal-600',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/60',
    targetTab: 'verification',
    displayOrder: 4,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  },
  {
    id: 'results',
    title: 'Exam Results Lookup',
    badge: 'Instant Marks',
    description: 'Lookup official institute exam results, roll number marksheets, and grades.',
    icon: 'Search',
    color: 'from-cyan-600 to-blue-600',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/60',
    targetTab: 'results',
    displayOrder: 5,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  },
  {
    id: 'mocktest',
    title: 'Online Practice Tests',
    badge: 'MCQ Prep',
    description: 'Take timed interactive online mock tests, practice quizzes, and instant score review.',
    icon: 'CheckSquare',
    color: 'from-pink-600 to-rose-600',
    textColor: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-pink-50 dark:bg-pink-950/60',
    targetTab: 'mocktest',
    displayOrder: 6,
    status: 'Published',
    showDesktop: true,
    showMobile: true
  }
];

export const QuickNavigationSection: React.FC<QuickNavigationSectionProps> = ({
  onNavigateTab,
  onOpenAdmissionModal,
  activeTab = 'home'
}) => {
  const [items, setItems] = useState<QuickNavItem[]>(DEFAULT_QUICK_NAV);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to render lucide icon dynamically
  const renderIcon = (iconName: string, className = 'w-6 h-6') => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Compass;
    return <IconComponent className={className} />;
  };

  // Fetch published items from API
  const fetchQuickNav = async () => {
    try {
      const res = await fetch('/api/quick-nav');
      const data = await res.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        setItems(data.items);
      }
    } catch (err) {
      console.warn('Using default Quick Nav fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickNav();
  }, []);

  const handleItemClick = (item: QuickNavItem) => {
    if (item.isExternal && item.externalUrl) {
      window.open(item.externalUrl, '_blank');
      return;
    }

    if (item.targetTab === 'admission') {
      onOpenAdmissionModal();
    } else {
      onNavigateTab(item.targetTab);
    }
  };

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-blue-600" /> Quick Access Services
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quick Navigation Menu
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Instant access to core student portals, courses, admissions, official certificate verification, exam results, and online practice tests.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Fast Loading • Mobile & Desktop Ready</span>
          </div>
        </div>

        {/* Quick Nav Cards Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> Loading Quick Navigation...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const isActive = activeTab === item.targetTab;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-600 ring-2 ring-blue-500/20 dark:border-blue-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${item.bgLight || 'bg-blue-50 dark:bg-blue-950/60'} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <span className={item.textColor || 'text-blue-600 dark:text-blue-400'}>
                          {renderIcon(item.icon, 'w-6 h-6')}
                        </span>
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${item.bgLight || 'bg-blue-50 dark:bg-blue-950/60'} ${item.textColor || 'text-blue-600 dark:text-blue-400'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                        <span>{item.title}</span>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Open Page</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
