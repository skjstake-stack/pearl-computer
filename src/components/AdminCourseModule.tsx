import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Archive,
  RotateCcw,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Globe,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  UserCheck,
  Video,
  FileText,
  Award,
  ShieldCheck,
  Code,
  Share2,
  Info,
  Check,
  ChevronRight,
  X,
  Lock,
  Zap,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { Course, CourseSEO, CourseStatus, CourseType, UserSession } from '../types';
import jsPDF from 'jspdf';

interface AdminCourseModuleProps {
  currentUser: UserSession | null;
  onCoursesUpdated?: () => void;
}

export const AdminCourseModule: React.FC<AdminCourseModuleProps> = ({
  currentUser,
  onCoursesUpdated
}) => {
  // Check RBAC permission (Only Super Admin and Institute Admin)
  const isAuthorized =
    currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin');

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('order'); // order, title-asc, title-desc, fee-asc, fee-desc, newest
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'fees' | 'curriculum' | 'media' | 'seo'>('basic');

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importCsvText, setImportCsvText] = useState<string>('');

  const [autoSaveNotice, setAutoSaveNotice] = useState<string>('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Course>>({
    code: '',
    title: '',
    category: 'Diploma',
    subCategory: 'Computer Applications',
    type: 'Offline',
    description: '',
    fullDescription: '',
    duration: '1 Year',
    totalHours: '120 Hours',
    fees: 5000,
    discountFees: 3999,
    registrationFee: 500,
    installmentOptions: '2 Easy Monthly Installments',
    eligibility: 'Open to all students',
    minQualification: '10th / 12th Pass',
    language: 'Bilingual (Hindi & English)',
    batchName: 'Regular Morning Batch',
    batchTiming: '08:00 AM - 10:00 AM',
    startDate: '',
    endDate: '',
    syllabus: ['Fundamentals of Computer', 'MS Office Suite', 'Internet & Cyber Security'],
    learningOutcomes: ['Master core IT and office automation tools', 'Earn ISO 9001:2015 recognized certification'],
    trainer: 'Er. R. K. Sharma',
    certificateProvided: 'ISO 9001:2015 & Govt. Recognized Certificate',
    placementAssistance: true,
    featured: true,
    popular: true,
    status: 'Published',
    courseImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    courseBanner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    brochureUrl: '#',
    seo: {
      slug: '',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      ogImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      imageAltText: '',
      schemaMarkup: ''
    }
  });

  // Syllabus helper inputs
  const [newSyllabusItem, setNewSyllabusItem] = useState<string>('');
  const [newOutcomeItem, setNewOutcomeItem] = useState<string>('');

  // Fetch courses from server
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/courses', {
        headers: {
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else if (data.message) {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server for course catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Show status notification toast briefly
  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Draft Auto-Save to localStorage
  useEffect(() => {
    if (isEditModalOpen && formData.title) {
      const timer = setTimeout(() => {
        localStorage.setItem('pcta_course_form_draft', JSON.stringify(formData));
        setAutoSaveNotice(`Draft auto-saved at ${new Date().toLocaleTimeString()}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formData, isEditModalOpen]);

  // Open Add New Course Modal
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    const newCode = `CRS-${Math.floor(100 + Math.random() * 900)}`;
    const initialForm: Partial<Course> = {
      code: newCode,
      title: '',
      category: 'Diploma',
      subCategory: 'Computer Science',
      type: 'Offline',
      description: '',
      fullDescription: '',
      duration: '1 Year',
      totalHours: '120 Hours',
      fees: 6000,
      discountFees: 4999,
      registrationFee: 500,
      installmentOptions: '2 Monthly Installments',
      eligibility: 'Pass 10th or 12th Examination',
      minQualification: '10th / 12th Pass',
      language: 'Bilingual (Hindi & English)',
      batchName: 'Morning Batch A1',
      batchTiming: '08:00 AM - 10:00 AM',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      syllabus: [
        'Computer Fundamentals & Operating Systems',
        'Office Automation (Word, Excel, PowerPoint)',
        'Internet & Digital Payments'
      ],
      learningOutcomes: [
        'Hands-on computer operation proficiency',
        'ISO Govt Recognized Diploma Certificate'
      ],
      trainer: 'Er. R. K. Sharma',
      certificateProvided: 'ISO 9001:2015 & Govt Recognized Certificate',
      placementAssistance: true,
      featured: false,
      popular: true,
      status: 'Published',
      courseImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      courseBanner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
      demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      brochureUrl: '#',
      seo: {
        slug: `course-${newCode.toLowerCase()}`,
        metaTitle: 'New Course - Pearl Academy',
        metaDescription: 'Official course certification program at Pearl Academy Indore.',
        metaKeywords: 'Computer Course, DCA, Pearl Academy, Indore',
        ogImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        imageAltText: 'Course Cover Image',
        schemaMarkup: ''
      }
    };
    setFormData(initialForm);
    setActiveTab('basic');
    setIsEditModalOpen(true);
    setAutoSaveNotice('');
  };

  // Open Edit Course Modal
  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      ...course,
      seo: course.seo || {
        slug: course.code ? course.code.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `course-${course.id}`,
        metaTitle: `${course.title} - Pearl Academy`,
        metaDescription: course.description || '',
        metaKeywords: `${course.title}, Pearl Academy, Computer Diploma`,
        ogImage: course.courseImage || '',
        imageAltText: course.title,
        schemaMarkup: ''
      }
    });
    setActiveTab('basic');
    setIsEditModalOpen(true);
    setAutoSaveNotice('');
  };

  // Auto-generate SEO Slug from Title
  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo!,
        slug: slug,
        metaTitle: `${formData.title} | Pearl Academy Indore`,
        metaDescription: formData.description || `Enroll in ${formData.title} at Pearl Computer & Target Academy Indore.`,
        metaKeywords: `${formData.title}, ${formData.category}, Pearl Academy, Computer Institute Indore`,
        imageAltText: formData.title
      }
    }));
    triggerToast('SEO Meta & Slug generated successfully!');
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.title || !formData.code || !formData.category || !formData.fees) {
      setErrorMsg('Please fill in mandatory fields: Course Title, Course Code, Category, and Fee.');
      return;
    }

    // Check duplicate code
    const isCodeDuplicate = courses.some(
      c => c.code.toLowerCase() === formData.code?.toLowerCase() && c.id !== editingCourse?.id
    );
    if (isCodeDuplicate) {
      setErrorMsg(`Course Code "${formData.code}" is already in use by another course! Please enter a unique code.`);
      return;
    }

    try {
      if (editingCourse) {
        // Update
        const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'admin'
          },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          triggerToast(`Course "${formData.title}" updated successfully!`);
          setIsEditModalOpen(false);
          fetchCourses();
          if (onCoursesUpdated) onCoursesUpdated();
        } else {
          setErrorMsg(data.message || 'Failed to update course.');
        }
      } else {
        // Create
        const res = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser?.role || 'admin'
          },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
          triggerToast(`New Course "${formData.title}" created successfully!`);
          setIsEditModalOpen(false);
          fetchCourses();
          if (onCoursesUpdated) onCoursesUpdated();
        } else {
          setErrorMsg(data.message || 'Failed to create course.');
        }
      }
    } catch (err) {
      setErrorMsg('Error connecting to backend server.');
    }
  };

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Course "${course.title}" status changed to ${data.status}`);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      }
    } catch (err) {
      setErrorMsg('Failed to toggle status.');
    }
  };

  // Duplicate Course
  const handleDuplicateCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Course "${course.title}" duplicated successfully as Draft.`);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      }
    } catch (err) {
      setErrorMsg('Failed to duplicate course.');
    }
  };

  // Archive Course
  const handleArchiveCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Course "${course.title}" moved to Archived.`);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      }
    } catch (err) {
      setErrorMsg('Failed to archive course.');
    }
  };

  // Restore Course
  const handleRestoreCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Course "${course.title}" restored as Draft.`);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      }
    } catch (err) {
      setErrorMsg('Failed to restore course.');
    }
  };

  // Delete Course
  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      const res = await fetch(`/api/admin/courses/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser?.role || 'admin'
        }
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Course "${deletingCourse.title}" deleted permanently.`);
        setIsDeleteConfirmOpen(false);
        setDeletingCourse(null);
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      } else {
        setErrorMsg(data.message || 'Failed to delete course.');
      }
    } catch (err) {
      setErrorMsg('Error deleting course.');
    }
  };

  // Reorder Order Shift
  const handleShiftOrder = async (index: number, direction: 'up' | 'down') => {
    const newCourses = [...courses];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCourses.length) return;

    // Swap
    const temp = newCourses[index];
    newCourses[index] = newCourses[targetIdx];
    newCourses[targetIdx] = temp;

    // Assign displayOrder
    const reorderedIds = newCourses.map(c => c.id);

    try {
      const res = await fetch('/api/admin/courses/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        },
        body: JSON.stringify({ orderedIds: reorderedIds })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast('Course display order updated!');
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      }
    } catch (err) {
      setErrorMsg('Failed to reorder courses.');
    }
  };

  // Bulk Import
  const handleBulkImport = async () => {
    if (!importCsvText.trim()) {
      setErrorMsg('Please paste or upload CSV text data first.');
      return;
    }
    try {
      const res = await fetch('/api/admin/courses/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'admin'
        },
        body: JSON.stringify({ csvContent: importCsvText })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Successfully imported ${data.importedCount} courses!`);
        setIsImportModalOpen(false);
        setImportCsvText('');
        fetchCourses();
        if (onCoursesUpdated) onCoursesUpdated();
      } else {
        setErrorMsg(data.message || 'Bulk import failed.');
      }
    } catch (err) {
      setErrorMsg('Error importing courses.');
    }
  };

  // Export PDF Catalog
  const handleExportPdfCatalog = () => {
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PEARL COMPUTER & TARGET ACADEMY', 105, 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL COURSE CATALOG & SYLLABUS DIRECTORY 2026', 105, 20, { align: 'center' });

    let y = 40;
    doc.setTextColor(30, 41, 59);

    courses.forEach((c, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. [${c.code}] ${c.title} (${c.category})`, 15, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Duration: ${c.duration} | Fee: ₹${c.fees} (Offer: ₹${c.discountFees || c.fees}) | Trainer: ${c.trainer}`, 15, y);
      y += 5;
      doc.text(`Status: ${c.status.toUpperCase()} | Type: ${c.type || 'Offline'} | Certificate: ${c.certificateProvided}`, 15, y);
      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y - 3, 195, y - 3);
    });

    doc.save(`Pearl_Academy_Course_Catalog_${new Date().toISOString().split('T')[0]}.pdf`);
    triggerToast('PDF Course Catalog downloaded successfully!');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Course ID',
      'Course Code',
      'Course Title',
      'Category',
      'Sub Category',
      'Type',
      'Duration',
      'Fee (INR)',
      'Discount Fee (INR)',
      'Trainer',
      'Status',
      'Certificate Provided'
    ];

    const rows = courses.map(c => [
      `"${c.id}"`,
      `"${c.code}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.subCategory || ''}"`,
      `"${c.type || 'Offline'}"`,
      `"${c.duration}"`,
      c.fees,
      c.discountFees || c.fees,
      `"${c.trainer.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.certificateProvided.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pearl_Academy_Courses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('CSV Export generated!');
  };

  // Filtered & Sorted Courses List
  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.trainer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || course.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory =
      categoryFilter === 'all' || course.category === categoryFilter;
    const matchesType =
      typeFilter === 'all' || (course.type || 'Offline').toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    if (sortBy === 'fee-asc') return a.fees - b.fees;
    if (sortBy === 'fee-desc') return b.fees - a.fees;
    if (sortBy === 'order') return (a.displayOrder || 99) - (b.displayOrder || 99);
    return 0;
  });

  // Unique Categories list for filter
  const uniqueCategories = Array.from(new Set(courses.map(c => c.category)));

  // If user is not Super Admin or Institute Admin, show Unauthorized Screen
  if (!isAuthorized) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center max-w-2xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Course Catalog Management is strictly restricted to <span className="font-bold text-red-600">Super Admin</span> and <span className="font-bold text-blue-600">Institute Admin</span> credentials. Please switch account or request permission.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500 text-white font-bold text-xs shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Analytics Stats */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Admin RBAC Module
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Course Catalog Management
              </h2>
              <p className="text-slate-300 text-xs mt-1 max-w-2xl">
                Full CRUD control over institute courses, fee structures, faculty assignment, syllabi, SEO metadata, drag-and-drop display order, and live website updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-orange-500/30 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Course
              </button>
            </div>
          </div>

          {/* Metric Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-[10px] uppercase font-bold text-slate-300">Total Courses</div>
              <div className="text-xl font-extrabold text-white mt-1">{courses.length}</div>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Published (Live)</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {courses.filter(c => c.status === 'Published').length}
              </div>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30">
              <div className="text-[10px] uppercase font-bold text-amber-300">Draft / Unpublished</div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {courses.filter(c => c.status === 'Draft' || c.status === 'Unpublished').length}
              </div>
            </div>

            <div className="bg-purple-500/20 backdrop-blur-md rounded-2xl p-3 border border-purple-400/30">
              <div className="text-[10px] uppercase font-bold text-purple-300">Archived</div>
              <div className="text-xl font-extrabold text-purple-300 mt-1">
                {courses.filter(c => c.status === 'Archived').length}
              </div>
            </div>

            <div className="bg-cyan-500/20 backdrop-blur-md rounded-2xl p-3 border border-cyan-400/30 col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-cyan-300">Featured & Popular</div>
              <div className="text-xl font-extrabold text-cyan-300 mt-1">
                {courses.filter(c => c.popular || c.featured).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search, Filters, Sort & Actions */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, code, trainer..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Status: All</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="unpublished">Unpublished</option>
              <option value="archived">Archived</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Category: All</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Mode: All</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="order">Order: Display Rank</option>
              <option value="title-asc">Name: A to Z</option>
              <option value="title-desc">Name: Z to A</option>
              <option value="fee-asc">Fee: Low to High</option>
              <option value="fee-desc">Fee: High to Low</option>
            </select>
          </div>

          {/* Action Buttons: Import, Export, Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>

            <button
              onClick={handleExportPdfCatalog}
              className="px-3 py-2 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> PDF Catalog
            </button>

            <button
              onClick={fetchCourses}
              className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer"
              title="Refresh Courses"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Course List View */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading course catalog from server...</p>
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Courses Found</h3>
          <p className="text-xs text-slate-500">
            No courses match the active search or status filters. Try clearing your search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setTypeFilter('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Course Info</th>
                  <th className="py-3.5 px-4">Code & Category</th>
                  <th className="py-3.5 px-4">Fees & Discount</th>
                  <th className="py-3.5 px-4">Faculty & Batch</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {sortedCourses.map((course, index) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    {/* Display Order Shift Controls */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleShiftOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleShiftOrder(index, 'down')}
                            disabled={index === sortedCourses.length - 1}
                            className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Course Title & Thumb */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.courseImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <span>{course.title}</span>
                            {course.popular && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {course.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Code & Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold rounded-md text-[11px] border border-blue-200 dark:border-blue-800">
                          {course.code}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {course.category} • {course.type || 'Offline'}
                        </div>
                      </div>
                    </td>

                    {/* Fees */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <div className="text-slate-900 dark:text-white font-extrabold">
                          ₹{(course.discountFees || course.fees).toLocaleString('en-IN')}
                        </div>
                        {course.discountFees && course.discountFees < course.fees && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{course.fees.toLocaleString('en-IN')}
                          </div>
                        )}
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {course.duration}
                        </div>
                      </div>
                    </td>

                    {/* Faculty & Timing */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <div className="text-slate-800 dark:text-slate-200 font-bold">
                          {course.trainer}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {course.batchTiming || 'Regular Schedule'}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer border transition-all ${
                          course.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                            : course.status === 'Draft'
                            ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                            : course.status === 'Archived'
                            ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            course.status === 'Published'
                              ? 'bg-emerald-500'
                              : course.status === 'Draft'
                              ? 'bg-amber-500'
                              : 'bg-purple-500'
                          }`}
                        ></span>
                        <span>{course.status}</span>
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setPreviewCourse(course);
                            setIsPreviewModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Preview Course Page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400 cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicateCourse(course)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Duplicate Course"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {course.status === 'Archived' ? (
                          <button
                            onClick={() => handleRestoreCourse(course)}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            title="Restore Course"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchiveCourse(course)}
                            className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg text-purple-600 dark:text-purple-400 cursor-pointer"
                            title="Archive Course"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setDeletingCourse(course);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg text-red-600 dark:text-red-400 cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ADD / EDIT COURSE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {editingCourse ? `Edit Course: ${editingCourse.title}` : 'Add New Course'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in complete course details, batch schedules, fees, syllabus, and SEO settings.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Draft Auto-Save Notification */}
            {autoSaveNotice && (
              <div className="bg-blue-50 dark:bg-blue-950/60 px-6 py-2 border-b border-blue-200 dark:border-blue-800 text-[11px] text-blue-600 dark:text-blue-300 font-bold flex items-center justify-between">
                <span>{autoSaveNotice}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Auto-Save Enabled</span>
              </div>
            )}

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 px-6 pt-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={() => setActiveTab('basic')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" /> 1. Basic Info
              </button>

              <button
                onClick={() => setActiveTab('fees')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fees'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <DollarSign className="w-4 h-4" /> 2. Fees & Batches
              </button>

              <button
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'curriculum'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" /> 3. Syllabus & Requirements
              </button>

              <button
                onClick={() => setActiveTab('media')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Video className="w-4 h-4" /> 4. Media & Brochure
              </button>

              <button
                onClick={() => setActiveTab('seo')}
                className={`pb-3 px-4 text-xs font-bold border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'seo'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Globe className="w-4 h-4" /> 5. SEO Settings
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Course Name / Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DCA (Diploma in Computer Applications)"
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Course Code (Unique) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DCA-01"
                        value={formData.code || ''}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white uppercase font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category || 'Diploma'}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                      >
                        <option value="Diploma">Diploma</option>
                        <option value="Basic Computer">Basic Computer</option>
                        <option value="Accounting">Accounting & Finance</option>
                        <option value="Programming">Programming & Software</option>
                        <option value="Design & Marketing">Design & Marketing</option>
                        <option value="AI & Analytics">AI & Analytics</option>
                        <option value="Language & Typing">Language & Typing</option>
                        <option value="Competitive Exams">Competitive Exams (MPPSC / SSC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sub Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={formData.subCategory || ''}
                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Course Type / Mode
                      </label>
                      <select
                        value={formData.type || 'Offline'}
                        onChange={e => setFormData({ ...formData, type: e.target.value as CourseType })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
                      >
                        <option value="Offline">Offline Campus Classroom</option>
                        <option value="Online">Online Live / Recorded</option>
                        <option value="Hybrid">Hybrid (Online + Offline)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Faculty / Instructor Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Er. R. K. Sharma (M.Tech, 12+ Yrs Exp)"
                        value={formData.trainer || ''}
                        onChange={e => setFormData({ ...formData, trainer: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Medium of Instruction
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bilingual (Hindi & English)"
                        value={formData.language || 'Bilingual (Hindi & English)'}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Short Overview Summary (Displayed on Cards)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief 1-2 line highlight of the course..."
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Detailed Description (Course Overview Modal)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Comprehensive course description including modules, lab practicals, industry scope..."
                      value={formData.fullDescription || ''}
                      onChange={e => setFormData({ ...formData, fullDescription: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FEES, BATCHES & SCHEDULE */}
              {activeTab === 'fees' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Standard Course Fee (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder="7500"
                        value={formData.fees || ''}
                        onChange={e => setFormData({ ...formData, fees: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Discounted Offer Fee (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="5999"
                        value={formData.discountFees || ''}
                        onChange={e => setFormData({ ...formData, discountFees: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        One-Time Registration Fee (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="500"
                        value={formData.registrationFee || 500}
                        onChange={e => setFormData({ ...formData, registrationFee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Installment Payment Plan
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Monthly Installments of ₹3,000"
                        value={formData.installmentOptions || ''}
                        onChange={e => setFormData({ ...formData, installmentOptions: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Course Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Year (6 Months Fast-track)"
                        value={formData.duration || ''}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Total Practical Hours
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 120 Hours"
                        value={formData.totalHours || ''}
                        onChange={e => setFormData({ ...formData, totalHours: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Batch Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Morning Batch A1"
                        value={formData.batchName || ''}
                        onChange={e => setFormData({ ...formData, batchName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Batch Timings
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 08:00 AM - 10:00 AM"
                        value={formData.batchTiming || ''}
                        onChange={e => setFormData({ ...formData, batchTiming: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Upcoming Batch Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Target Batch End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYLLABUS & REQUIREMENTS */}
              {activeTab === 'curriculum' && (
                <div className="space-y-5">
                  {/* Syllabus Bullet Points List Manager */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Syllabus Topics (Interactive List)
                    </label>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add new syllabus module topic..."
                        value={newSyllabusItem}
                        onChange={e => setNewSyllabusItem(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSyllabusItem.trim()) {
                            setFormData({
                              ...formData,
                              syllabus: [...(formData.syllabus || []), newSyllabusItem.trim()]
                            });
                            setNewSyllabusItem('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                      >
                        + Add Topic
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                      {formData.syllabus && formData.syllabus.length > 0 ? (
                        formData.syllabus.map((syl, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                          >
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              {i + 1}. {syl}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.syllabus?.filter((_, idx) => idx !== i);
                                setFormData({ ...formData, syllabus: updated });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400">No syllabus topics added yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Learning Outcomes List */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Key Learning Outcomes & Career Scope
                    </label>

                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add new learning outcome..."
                        value={newOutcomeItem}
                        onChange={e => setNewOutcomeItem(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newOutcomeItem.trim()) {
                            setFormData({
                              ...formData,
                              learningOutcomes: [...(formData.learningOutcomes || []), newOutcomeItem.trim()]
                            });
                            setNewOutcomeItem('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                      >
                        + Add Outcome
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                      {formData.learningOutcomes && formData.learningOutcomes.length > 0 ? (
                        formData.learningOutcomes.map((out, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                          >
                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                              ✓ {out}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.learningOutcomes?.filter((_, idx) => idx !== i);
                                setFormData({ ...formData, learningOutcomes: updated });
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400">No learning outcomes added yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Minimum Qualification Required
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10th Pass / 12th Pass / Graduate"
                        value={formData.minQualification || ''}
                        onChange={e => setFormData({ ...formData, minQualification: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Certification Provided Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ISO 9001:2015 & Govt. Recognized Certificate"
                        value={formData.certificateProvided || ''}
                        onChange={e => setFormData({ ...formData, certificateProvided: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Feature Checkboxes */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.placementAssistance ?? true}
                        onChange={e => setFormData({ ...formData, placementAssistance: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Placement Support</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.featured ?? false}
                        onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Featured Course</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={formData.popular ?? true}
                        onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Popular Badge</span>
                    </label>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={formData.status || 'Published'}
                        onChange={e => setFormData({ ...formData, status: e.target.value as CourseStatus })}
                        className="w-full p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold"
                      >
                        <option value="Published">Published (Live)</option>
                        <option value="Draft">Draft</option>
                        <option value="Unpublished">Unpublished</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & DOCUMENTS */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Image Cover URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.courseImage || ''}
                      onChange={e => setFormData({ ...formData, courseImage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    {formData.courseImage && (
                      <img
                        src={formData.courseImage}
                        alt="Preview"
                        className="mt-2 w-32 h-20 rounded-xl object-cover border border-slate-200"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Course Banner Header URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.courseBanner || ''}
                      onChange={e => setFormData({ ...formData, courseBanner: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Demo Video URL (YouTube Embed Link)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      value={formData.demoVideoUrl || ''}
                      onChange={e => setFormData({ ...formData, demoVideoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      PDF Brochure Download Link / URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://pearlacademy.edu.in/brochures/dca.pdf"
                      value={formData.brochureUrl || ''}
                      onChange={e => setFormData({ ...formData, brochureUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SEO SETTINGS */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        Search Engine Optimization (SEO & Meta Tags)
                      </h4>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        Configure custom slug, Open Graph image, title tags, and JSON-LD schema markup.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Generate SEO
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        SEO URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="dca-diploma-computer-applications"
                        value={formData.seo?.slug || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo!, slug: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder="DCA Course in Indore | Pearl Computer Academy"
                        value={formData.seo?.metaTitle || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            seo: { ...formData.seo!, metaTitle: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Meta Description (Search Engine Snippet)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Comprehensive DCA Diploma course at Pearl Computer Academy Indore. ISO certified, hands-on lab training..."
                      value={formData.seo?.metaDescription || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo!, metaDescription: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Meta Keywords (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="DCA, Computer Diploma, Pearl Academy, Indore, Tally, NIELIT"
                      value={formData.seo?.metaKeywords || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo!, metaKeywords: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Open Graph Social Preview Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.seo?.ogImage || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo!, ogImage: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Form Footer Action Bar */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingCourse ? 'Update Course' : 'Save & Publish Course'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PREVIEW COURSE MODAL */}
      {/* ------------------------------------------------------------- */}
      {isPreviewModalOpen && previewCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="relative">
              <img
                src={previewCourse.courseBanner || previewCourse.courseImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'}
                alt={previewCourse.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md rounded-full text-xs font-bold uppercase">
                  {previewCourse.category}
                </span>
                <span className="px-3 py-1 bg-emerald-600/90 backdrop-blur-md rounded-full text-xs font-extrabold">
                  {previewCourse.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  CODE: {previewCourse.code}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {previewCourse.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {previewCourse.fullDescription || previewCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Fees</div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    ₹{(previewCourse.discountFees || previewCourse.fees).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Duration</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{previewCourse.duration}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Faculty</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{previewCourse.trainer}</div>
                </div>
              </div>

              {previewCourse.syllabus && previewCourse.syllabus.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Syllabus Highlights</h4>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {previewCourse.syllabus.map((s, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-right">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {isDeleteConfirmOpen && deletingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Confirm Course Deletion
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-slate-900 dark:text-white">"{deletingCourse.title}"</span> ({deletingCourse.code})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-lg cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. BULK IMPORT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Bulk Import Courses
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste CSV records with headers: <code className="font-mono bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">code,title,category,fees,duration,trainer</code>
            </p>

            <textarea
              rows={8}
              placeholder={`code,title,category,fees,duration,trainer
PYTHON-01,Python for Data Science,Programming,8000,4 Months,S. P. Verma
CYBER-01,Cyber Security & Ethical Hacking,Diploma,12000,6 Months,Er. R. K. Sharma`}
              value={importCsvText}
              onChange={e => setImportCsvText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setImportCsvText(`code,title,category,fees,duration,trainer
JAVA-PRO,Java Fullstack Master,Programming,9500,5 Months,Dr. Amit Trivedi
GRAPHIC-01,Graphic Design & UI/UX,Design & Marketing,6500,3 Months,Neeta Chouhan`);
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Load Sample Template
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Start Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
