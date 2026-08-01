import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  CreditCard,
  BookOpen,
  Calendar,
  AlertTriangle,
  Award,
  Info,
  ChevronRight
} from 'lucide-react';

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'fee' | 'assignment' | 'attendance' | 'exam' | 'general';
  isRead: boolean;
  linkTab?: 'overview' | 'attendance' | 'fees' | 'notes' | 'password';
}

interface StudentNotificationBellProps {
  onNavigateTab?: (tab: 'overview' | 'attendance' | 'fees' | 'notes' | 'password') => void;
}

export const StudentNotificationBell: React.FC<StudentNotificationBellProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'fee'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample student notifications list
  const [notifications, setNotifications] = useState<StudentNotification[]>([
    {
      id: 'notif-1',
      title: 'Fee Installment Due Date',
      message: 'August term fee installment of ₹2,000 is due on 10th August 2026.',
      timestamp: '10 mins ago',
      type: 'fee',
      isRead: false,
      linkTab: 'fees'
    },
    {
      id: 'notif-2',
      title: 'Assignment Submitted & Verified',
      message: 'Python OOP & Classes Lab assignment marked as Completed by Faculty.',
      timestamp: '1 hour ago',
      type: 'assignment',
      isRead: false,
      linkTab: 'overview'
    },
    {
      id: 'notif-3',
      title: 'Lab Attendance Logged',
      message: 'Saturday morning practical lab check-in recorded successfully.',
      timestamp: '3 hours ago',
      type: 'attendance',
      isRead: false,
      linkTab: 'attendance'
    },
    {
      id: 'notif-4',
      title: 'Mid-Term Exam Schedule',
      message: 'ADCA semester mid-term practical evaluation scheduled for 18th August.',
      timestamp: '1 day ago',
      type: 'exam',
      isRead: true,
      linkTab: 'overview'
    },
    {
      id: 'notif-5',
      title: 'New Study Notes Uploaded',
      message: 'MS Excel Advanced Formulas & Tally Prime GST guides added to downloads.',
      timestamp: '2 days ago',
      type: 'general',
      isRead: true,
      linkTab: 'notes'
    }
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (n: StudentNotification) => {
    markAsRead(n.id);
    if (n.linkTab && onNavigateTab) {
      onNavigateTab(n.linkTab);
      setIsOpen(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'fee') return n.type === 'fee';
    return true;
  });

  const getIconForType = (type: StudentNotification['type']) => {
    switch (type) {
      case 'fee':
        return <CreditCard className="w-4 h-4 text-orange-500" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'attendance':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'exam':
        return <Award className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-blue-900/80 hover:bg-blue-800 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-md focus:outline-none"
        title="Student Notifications & Updates"
      >
        <Bell className="w-5 h-5 text-white" />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-blue-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Notifications & Updates
              </h4>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-blue-950 dark:text-blue-300">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('fee')}
              className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'fee'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Fee Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications found in this view.
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer relative group ${
                    !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0 mt-0.5">
                    {getIconForType(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-6 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <h5 className={`text-xs font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h5>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400">
                      <span>{n.timestamp}</span>
                      {n.linkTab && (
                        <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Individual Delete Button on Hover */}
                  <button
                    onClick={(e) => deleteNotification(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity absolute right-2 top-3"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center text-[11px]">
            <span className="text-slate-500 font-medium">
              Connected to Institute Live Notice Board
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
