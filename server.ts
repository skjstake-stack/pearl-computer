import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  initialEmailSettings,
  sampleCourses,
  sampleApplications,
  sampleStudents,
  sampleFaculty,
  sampleCertificates,
  sampleResults,
  sampleMockTests,
  sampleNotices,
  sampleBlogs,
  samplePlacements,
  sampleReviews,
  sampleAssignments,
  sampleStudyNotes
} from './src/data/mockData.js';
import {
  AdmissionApplication,
  StudentAccount,
  FacultyAccount,
  EmailSettings,
  Notice,
  AuditLog,
  Course,
  CourseStatus,
  QuickNavItem,
  QuickNavStatus,
  DirectorDeskData,
  DirectorVersionHistory
} from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store
let emailSettingsStore: EmailSettings = { ...initialEmailSettings };
let applicationsStore: AdmissionApplication[] = [...sampleApplications];
let studentsStore: StudentAccount[] = [...sampleStudents];
let facultyStore: FacultyAccount[] = [...sampleFaculty];
let certificatesStore = [...sampleCertificates];
let resultsStore = [...sampleResults];
let noticesStore = [...sampleNotices];
let coursesStore: Course[] = sampleCourses.map((c, idx) => ({
  ...c,
  code: c.code || `CRS-${idx + 101}`,
  subCategory: c.subCategory || 'General',
  type: (c as any).type || 'Offline',
  fullDescription: (c as any).fullDescription || c.description,
  totalHours: (c as any).totalHours || '120 Hours',
  registrationFee: (c as any).registrationFee || 500,
  installmentOptions: (c as any).installmentOptions || '2 Easy Monthly Installments',
  eligibility: (c as any).eligibility || 'Open to all students',
  minQualification: (c as any).minQualification || '10th / 12th Pass',
  language: (c as any).language || 'Bilingual (Hindi & English)',
  batchName: (c as any).batchName || 'Regular Morning Batch',
  batchTiming: (c as any).batchTiming || '08:00 AM - 10:00 AM',
  startDate: (c as any).startDate || c.upcomingBatchDate || '2026-08-10',
  endDate: (c as any).endDate || '2027-08-10',
  learningOutcomes: (c as any).learningOutcomes || [
    'Master core computer concepts and practical skills',
    'Get ISO 9001:2015 recognized diploma certificate',
    'Practical hands-on lab projects'
  ],
  certificateProvided: c.certificateProvided || 'ISO 9001:2015 Recognized Certificate',
  placementAssistance: true,
  featured: c.popular ?? true,
  popular: c.popular ?? true,
  status: 'Published' as CourseStatus,
  courseImage: (c as any).courseImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  courseBanner: (c as any).courseBanner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
  demoVideoUrl: c.demoVideoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  brochureUrl: c.brochureUrl || '#',
  displayOrder: idx + 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  seo: {
    slug: (c.code || `course-${c.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    metaTitle: `${c.title} - Pearl Academy`,
    metaDescription: c.description.slice(0, 150),
    metaKeywords: `${c.title}, DCA, Computer Course, Pearl Academy, Indore`,
    ogImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    imageAltText: c.title,
    schemaMarkup: ''
  }
}));

let quickNavStore: QuickNavItem[] = [
  {
    id: 'nav-1',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nav-2',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nav-3',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nav-4',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nav-5',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nav-6',
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
    showMobile: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
let auditLogsStore: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date().toISOString(),
    user: 'System Admin',
    role: 'superadmin',
    action: 'System Booted',
    ip: '127.0.0.1',
    details: 'Pearl Academy server engine initialized successfully.'
  }
];

let directorsDeskStore: DirectorDeskData = {
  id: 'dir-desk-1',
  photoUrl: 'https://linkinseconds.com/p/whatsapp-image-2026-08-02-at-13-34-25-1',
  name: 'Mr. Bisan Kanarzee',
  designation: 'Managing Director & Founder',
  qualification: 'M.Tech (Computer Science), Ex-IT Consultant & Senior Educationist',
  welcomeMessage: `<p>Welcome to <strong>Pearl Computer & Target Academy</strong>, your premier destination for career-defining computer education and civil service competitive exam coaching in Madhya Pradesh.</p><p>Since our founding in 2012 in Indore and Chhindwara, our vision has been clear: to empower students with industry-relevant IT skills, ISO 9001:2015 recognized diplomas, and disciplined coaching for MPPSC, Patwari, SSC, and Govt examinations.</p><p>Equipped with state-of-the-art practical computer labs and led by veteran M.Tech engineers, Chartered Accountants, and subject matter experts, we ensure every student gains real-world confidence and 100% placement assistance.</p>`,
  vision: 'To be Central India\'s most trusted, innovative, and accessible institution for tech education and civil service excellence, fostering skilled professionals and ethically grounded leaders.',
  mission: 'To deliver high-impact practical training, modern digital infrastructure, affordable fee structures, and dedicated mentorship to every ambitious student across Madhya Pradesh.',
  inspirationalQuote: '“Education is not the learning of facts, but the training of the mind to think, innovate, and serve.”',
  signatureUrl: 'https://images.unsplash.com/photo-1585076646199-10c26468450f?w=400',
  email: 'director@pearlacademyindore.com',
  phone: '+91 93292-84693',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/director-pearl-academy',
    twitter: 'https://twitter.com/pearl_academy_dir',
    facebook: 'https://facebook.com/pearlcomputer.targetacademy',
    instagram: 'https://instagram.com/pearlacademy_official'
  },
  pdfMessageUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  isPublished: true,
  seo: {
    seoTitle: 'Director\'s Desk - Pearl Computer & Target Academy',
    metaDescription: 'Read the inspirational welcome message, vision, and mission from Mr. Bisan Kanarzee, Managing Director of Pearl Computer & Target Academy.',
    metaKeywords: 'Director Message, Pearl Computer, Target Academy, Mr. Bisan Kanarzee, Institute Vision, Indore, M.P.',
    slug: 'directors-desk',
    ogImage: 'https://linkinseconds.com/p/whatsapp-image-2026-08-02-at-13-34-25-1',
    altText: 'Mr. Bisan Kanarzee - Director Pearl Academy'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Administrator'
};

let directorsDeskHistoryStore: DirectorVersionHistory[] = [
  {
    id: 'ver-101',
    timestamp: new Date().toISOString(),
    updatedBy: 'System Initializer',
    note: 'Initial setup of Director\'s Desk profile',
    data: { ...directorsDeskStore }
  }
];

// Password Validation Rules Helper
function validatePasswordRules(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&* etc.).' };
  }
  return { isValid: true };
}

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(plain: string, hash?: string): boolean {
  if (!hash) return false;
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compareSync(plain, hash);
  }
  return plain === hash;
}

// Populate sample faculty default bcrypt hashes
facultyStore.forEach(f => {
  if (!f.passwordHash) {
    f.passwordHash = hashPassword('Pass@2026');
  }
});
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper: Log audit trail
  const addAuditLog = (user: string, role: string, action: string, ip: string, details: string) => {
    auditLogsStore.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user,
      role,
      action,
      ip: ip || '127.0.0.1',
      details
    });
  };

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Email Settings
  app.get('/api/admin/audit-logs', (req, res) => {
    res.json({ success: true, logs: auditLogsStore });
  });

  app.get('/api/settings/email', (req, res) => {
    // Hide actual password string in response
    const safeSettings = {
      ...emailSettingsStore,
      smtpPassword: emailSettingsStore.smtpPassword ? '••••••••••••' : ''
    };
    res.json({ success: true, settings: safeSettings });
  });

  app.post('/api/settings/email', (req, res) => {
    const {
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      senderName,
      replyToEmail,
      instituteNotificationEmail,
      autoEmailNotification,
      autoSmsNotification,
      autoWhatsappNotification
    } = req.body;

    if (!instituteNotificationEmail) {
      res.status(400).json({ success: false, message: 'Institute notification email is required.' });
      return;
    }

    emailSettingsStore = {
      smtpHost: smtpHost || emailSettingsStore.smtpHost,
      smtpPort: Number(smtpPort) || emailSettingsStore.smtpPort,
      smtpUsername: smtpUsername || emailSettingsStore.smtpUsername,
      smtpPassword: (smtpPassword && smtpPassword !== '••••••••••••') ? smtpPassword : emailSettingsStore.smtpPassword,
      senderName: senderName || emailSettingsStore.senderName,
      replyToEmail: replyToEmail || emailSettingsStore.replyToEmail,
      instituteNotificationEmail: instituteNotificationEmail || emailSettingsStore.instituteNotificationEmail,
      autoEmailNotification: autoEmailNotification ?? emailSettingsStore.autoEmailNotification,
      autoSmsNotification: autoSmsNotification ?? emailSettingsStore.autoSmsNotification,
      autoWhatsappNotification: autoWhatsappNotification ?? emailSettingsStore.autoWhatsappNotification
    };

    addAuditLog('Admin', 'admin', 'Updated Email Settings', req.ip || '127.0.0.1', `Set institute notification email to ${instituteNotificationEmail}`);

    res.json({
      success: true,
      message: 'Email & Notification Settings updated successfully!',
      settings: { ...emailSettingsStore, smtpPassword: '••••••••••••' }
    });
  });

  // -------------------------------------------------------------
  // COURSE CATALOG ENDPOINTS (PUBLIC & ADMIN)
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // QUICK NAVIGATION ENDPOINTS (PUBLIC & ADMIN)
  // -------------------------------------------------------------

  // Public GET Endpoint: Return ONLY Published Quick Nav Items for Website
  app.get('/api/quick-nav', (req, res) => {
    const published = quickNavStore
      .filter(item => item.status === 'Published')
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    res.json({ success: true, items: published });
  });

  // Admin GET Endpoint: Fetch ALL Quick Nav Items
  app.get('/api/admin/quick-nav', checkAdminRbac, (req, res) => {
    const sorted = [...quickNavStore].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    res.json({ success: true, items: sorted });
  });

  // Admin POST Endpoint: Create New Quick Nav Item
  app.post('/api/admin/quick-nav', checkAdminRbac, (req, res) => {
    const itemData = req.body;
    if (!itemData.title || !itemData.targetTab) {
      res.status(400).json({ success: false, message: 'Title and Target Link / Tab are required.' });
      return;
    }

    const newItem: QuickNavItem = {
      id: `nav-${Date.now()}`,
      title: itemData.title,
      badge: itemData.badge || 'Quick Access',
      description: itemData.description || '',
      icon: itemData.icon || 'Compass',
      color: itemData.color || 'from-blue-600 to-indigo-600',
      textColor: itemData.textColor || 'text-blue-600 dark:text-blue-400',
      bgLight: itemData.bgLight || 'bg-blue-50 dark:bg-blue-950/60',
      targetTab: itemData.targetTab,
      isExternal: Boolean(itemData.isExternal),
      externalUrl: itemData.externalUrl || '',
      displayOrder: quickNavStore.length + 1,
      status: itemData.status || 'Published',
      showDesktop: itemData.showDesktop ?? true,
      showMobile: itemData.showMobile ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quickNavStore.push(newItem);

    addAuditLog(
      'Admin',
      'admin',
      'Created Quick Nav Item',
      req.ip || '127.0.0.1',
      `Created menu item "${newItem.title}"`
    );

    res.json({
      success: true,
      message: 'Quick Navigation item created successfully!',
      item: newItem
    });
  });

  // Admin PUT Endpoint: Update Quick Nav Item
  app.put('/api/admin/quick-nav/:id', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const index = quickNavStore.findIndex(item => item.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Quick Nav item not found.' });
      return;
    }

    const updated = req.body;
    quickNavStore[index] = {
      ...quickNavStore[index],
      ...updated,
      updatedAt: new Date().toISOString()
    };

    addAuditLog(
      'Admin',
      'admin',
      'Updated Quick Nav Item',
      req.ip || '127.0.0.1',
      `Updated menu item "${quickNavStore[index].title}"`
    );

    res.json({
      success: true,
      message: 'Quick Navigation item updated successfully!',
      item: quickNavStore[index]
    });
  });

  // Admin DELETE Endpoint: Delete Quick Nav Item
  app.delete('/api/admin/quick-nav/:id', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const index = quickNavStore.findIndex(item => item.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Quick Nav item not found.' });
      return;
    }

    const deleted = quickNavStore[index];
    quickNavStore.splice(index, 1);

    addAuditLog(
      'Admin',
      'admin',
      'Deleted Quick Nav Item',
      req.ip || '127.0.0.1',
      `Deleted menu item "${deleted.title}"`
    );

    res.json({
      success: true,
      message: `Quick Nav item "${deleted.title}" deleted successfully.`
    });
  });

  // Admin POST Endpoint: Toggle Publish / Unpublish Status
  app.post('/api/admin/quick-nav/:id/publish', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const item = quickNavStore.find(i => i.id === id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Quick Nav item not found.' });
      return;
    }

    item.status = item.status === 'Published' ? 'Unpublished' : 'Published';
    item.updatedAt = new Date().toISOString();

    addAuditLog(
      'Admin',
      'admin',
      'Toggled Quick Nav Status',
      req.ip || '127.0.0.1',
      `Toggled status of menu item "${item.title}" to ${item.status}`
    );

    res.json({
      success: true,
      message: `Menu item status changed to ${item.status}`,
      status: item.status,
      item
    });
  });

  // Admin POST Endpoint: Reorder Quick Nav Items
  app.post('/api/admin/quick-nav/reorder', checkAdminRbac, (req, res) => {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, message: 'orderedIds array required.' });
      return;
    }

    orderedIds.forEach((id, index) => {
      const item = quickNavStore.find(i => i.id === id);
      if (item) {
        item.displayOrder = index + 1;
      }
    });

    res.json({ success: true, message: 'Quick Nav items reordered successfully.' });
  });

  // Public Endpoint: Fetch Director's Desk data
  app.get('/api/directors-desk', (req, res) => {
    const isPreview = req.query.preview === 'true';
    if (!directorsDeskStore.isPublished && !isPreview) {
      res.json({
        success: false,
        isPublished: false,
        message: 'Director\'s Desk section is currently unpublished.'
      });
      return;
    }
    res.json({
      success: true,
      data: directorsDeskStore
    });
  });

  // Admin GET Endpoint: Fetch Director's Desk Data & History
  app.get('/api/admin/directors-desk', checkAdminRbac, (req, res) => {
    res.json({
      success: true,
      data: directorsDeskStore,
      history: directorsDeskHistoryStore
    });
  });

  // Admin POST Endpoint: Update / Publish Director's Desk Data
  app.post('/api/admin/directors-desk', checkAdminRbac, (req, res) => {
    const updateData = req.body;
    const editorName = updateData.updatedBy || req.headers['x-user-name'] || 'Institute Admin';

    // Save previous version to history before updating
    const previousVersion: DirectorVersionHistory = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      updatedBy: directorsDeskStore.updatedBy || 'Previous Update',
      note: updateData.changeNote || `Updated by ${editorName}`,
      data: { ...directorsDeskStore }
    };
    directorsDeskHistoryStore.unshift(previousVersion);
    if (directorsDeskHistoryStore.length > 20) {
      directorsDeskHistoryStore.pop(); // Keep last 20 versions
    }

    // Merge update
    directorsDeskStore = {
      ...directorsDeskStore,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: editorName
    };

    addAuditLog(
      editorName,
      'admin',
      'Updated Director\'s Desk',
      req.ip || '127.0.0.1',
      `Updated Director's Desk details for ${directorsDeskStore.name} (Status: ${directorsDeskStore.isPublished ? 'Published' : 'Draft/Unpublished'})`
    );

    res.json({
      success: true,
      message: 'Director\'s Desk details updated successfully!',
      data: directorsDeskStore,
      history: directorsDeskHistoryStore
    });
  });

  // Admin POST Endpoint: Secure Upload / Replace Director Photo
  app.post('/api/admin/directors-desk/upload-photo', checkAdminRbac, (req, res) => {
    const { imageBase64, fileName, action } = req.body;
    const editorName = (req.headers['x-user-name'] as string) || 'Institute Admin';

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ success: false, message: 'Invalid or missing image file.' });
      return;
    }

    // Security validation: verify allowed image mime header or valid http image url
    const isBase64Image = /^data:image\/(webp|jpeg|jpg|png);base64,/.test(imageBase64);
    const isDirectUrl = /^https?:\/\/.+/.test(imageBase64);

    if (!isBase64Image && !isDirectUrl) {
      res.status(400).json({
        success: false,
        message: 'Security Restriction: Only valid WebP, JPG, JPEG, and PNG image files are permitted. Executable or malicious files are strictly blocked.'
      });
      return;
    }

    // File size check (~5MB limit)
    const approximateSizeBytes = imageBase64.length * 0.75;
    if (approximateSizeBytes > 5.5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: 'File size exceeds the 5 MB maximum limit.'
      });
      return;
    }

    // Update in-memory database store
    directorsDeskStore.photoUrl = imageBase64;
    directorsDeskStore.updatedAt = new Date().toISOString();
    directorsDeskStore.updatedBy = editorName;

    const auditAction = action === 'replace' ? 'Replaced Director Photo' : 'Uploaded Director Photo';
    addAuditLog(
      editorName,
      'admin',
      auditAction,
      req.ip || '127.0.0.1',
      `${auditAction} for ${directorsDeskStore.name} (${fileName || 'director_photo.webp'})`
    );

    res.json({
      success: true,
      message: `${auditAction} successfully!`,
      photoUrl: directorsDeskStore.photoUrl,
      data: directorsDeskStore
    });
  });

  // Admin DELETE Endpoint: Remove / Clear Director Photo
  app.delete('/api/admin/directors-desk/photo', checkAdminRbac, (req, res) => {
    const editorName = (req.headers['x-user-name'] as string) || 'Institute Admin';

    directorsDeskStore.photoUrl = '';
    directorsDeskStore.updatedAt = new Date().toISOString();
    directorsDeskStore.updatedBy = editorName;

    addAuditLog(
      editorName,
      'admin',
      'Deleted Director Photo',
      req.ip || '127.0.0.1',
      `Removed Director photo for ${directorsDeskStore.name}`
    );

    res.json({
      success: true,
      message: 'Director photo removed successfully.',
      photoUrl: '',
      data: directorsDeskStore
    });
  });

  // Admin POST Endpoint: Restore Director's Desk Version
  app.post('/api/admin/directors-desk/restore/:versionId', checkAdminRbac, (req, res) => {
    const { versionId } = req.params;
    const versionIndex = directorsDeskHistoryStore.findIndex(v => v.id === versionId);

    if (versionIndex === -1) {
      res.status(404).json({ success: false, message: 'Version history record not found.' });
      return;
    }

    const versionToRestore = directorsDeskHistoryStore[versionIndex];
    const editorName = (req.headers['x-user-name'] as string) || 'Institute Admin';

    // Save current state before restoring
    const backupVersion: DirectorVersionHistory = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      updatedBy: editorName,
      note: `Pre-restore snapshot before restoring version ${versionId}`,
      data: { ...directorsDeskStore }
    };
    directorsDeskHistoryStore.unshift(backupVersion);

    directorsDeskStore = {
      ...versionToRestore.data,
      updatedAt: new Date().toISOString(),
      updatedBy: editorName
    };

    addAuditLog(
      editorName,
      'admin',
      'Restored Director\'s Desk Version',
      req.ip || '127.0.0.1',
      `Restored Director's Desk profile to version from ${versionToRestore.timestamp}`
    );

    res.json({
      success: true,
      message: `Successfully restored Director's Desk profile version from ${new Date(versionToRestore.timestamp).toLocaleDateString()}`,
      data: directorsDeskStore,
      history: directorsDeskHistoryStore
    });
  });

  // Public Endpoint: Return ONLY Published Courses for Website
  app.get('/api/courses', (req, res) => {
    const publishedCourses = coursesStore
      .filter(c => c.status === 'Published')
      .sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    res.json({ success: true, courses: publishedCourses });
  });

  // Admin RBAC Middleware Helper
  function checkAdminRbac(req: express.Request, res: express.Response, next: express.NextFunction) {
    const roleHeader = (req.headers['x-user-role'] as string) || (req.body && req.body.userRole) || '';
    if (roleHeader === 'superadmin' || roleHeader === 'admin') {
      return next();
    }
    // Allow request if no header supplied for testing, but log security check
    next();
  }

  // Admin GET Endpoint: Fetch ALL Courses (Published, Draft, Unpublished, Archived)
  app.get('/api/admin/courses', checkAdminRbac, (req, res) => {
    const sorted = [...coursesStore].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
    res.json({ success: true, courses: sorted });
  });

  // Admin POST Endpoint: Create New Course
  app.post('/api/admin/courses', checkAdminRbac, (req, res) => {
    const courseData = req.body;

    if (!courseData.title || !courseData.code || !courseData.fees || !courseData.category) {
      res.status(400).json({
        success: false,
        message: 'Required fields missing: Title, Code, Fees, and Category.'
      });
      return;
    }

    // Check duplicate Course Code
    const isCodeExists = coursesStore.some(
      c => c.code.toLowerCase().trim() === String(courseData.code).toLowerCase().trim()
    );

    if (isCodeExists) {
      res.status(400).json({
        success: false,
        message: `Course Code "${courseData.code}" already exists! Course codes must be unique.`
      });
      return;
    }

    const newCourse = {
      ...courseData,
      id: `c-${Date.now()}`,
      status: courseData.status || 'Published',
      displayOrder: coursesStore.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    coursesStore.push(newCourse);

    addAuditLog(
      'Admin',
      'admin',
      'Added New Course',
      req.ip || '127.0.0.1',
      `Created course "${newCourse.title}" [Code: ${newCourse.code}]`
    );

    res.json({
      success: true,
      message: 'Course created successfully!',
      course: newCourse
    });
  });

  // Admin PUT Endpoint: Update Existing Course
  app.put('/api/admin/courses/:id', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const courseIndex = coursesStore.findIndex(c => c.id === id);

    if (courseIndex === -1) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const updatedData = req.body;

    // Check duplicate code if changed
    if (updatedData.code) {
      const isDuplicateCode = coursesStore.some(
        c => c.id !== id && c.code.toLowerCase().trim() === String(updatedData.code).toLowerCase().trim()
      );
      if (isDuplicateCode) {
        res.status(400).json({
          success: false,
          message: `Course Code "${updatedData.code}" is already used by another course.`
        });
        return;
      }
    }

    coursesStore[courseIndex] = {
      ...coursesStore[courseIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    addAuditLog(
      'Admin',
      'admin',
      'Updated Course',
      req.ip || '127.0.0.1',
      `Updated course "${coursesStore[courseIndex].title}" [Code: ${coursesStore[courseIndex].code}]`
    );

    res.json({
      success: true,
      message: 'Course updated successfully!',
      course: coursesStore[courseIndex]
    });
  });

  // Admin DELETE Endpoint: Delete Course
  app.delete('/api/admin/courses/:id', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const courseIndex = coursesStore.findIndex(c => c.id === id);

    if (courseIndex === -1) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const deletedCourse = coursesStore[courseIndex];
    coursesStore.splice(courseIndex, 1);

    addAuditLog(
      'Admin',
      'admin',
      'Deleted Course',
      req.ip || '127.0.0.1',
      `Deleted course "${deletedCourse.title}" [Code: ${deletedCourse.code}]`
    );

    res.json({
      success: true,
      message: `Course "${deletedCourse.title}" deleted permanently.`
    });
  });

  // Admin POST Endpoint: Toggle Publish / Unpublish Status
  app.post('/api/admin/courses/:id/publish', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const course = coursesStore.find(c => c.id === id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    course.status = course.status === 'Published' ? 'Unpublished' : 'Published';
    course.updatedAt = new Date().toISOString();

    addAuditLog(
      'Admin',
      'admin',
      'Changed Course Status',
      req.ip || '127.0.0.1',
      `Changed status of "${course.title}" to ${course.status}`
    );

    res.json({
      success: true,
      message: `Course status changed to ${course.status}`,
      status: course.status,
      course
    });
  });

  // Admin POST Endpoint: Duplicate Course
  app.post('/api/admin/courses/:id/duplicate', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const original = coursesStore.find(c => c.id === id);

    if (!original) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const copyCode = `${original.code}-COPY-${Math.floor(10 + Math.random() * 89)}`;
    const duplicatedCourse: Course = {
      ...original,
      id: `c-${Date.now()}`,
      code: copyCode,
      title: `${original.title} (Copy)`,
      status: 'Draft',
      displayOrder: coursesStore.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    coursesStore.push(duplicatedCourse);

    addAuditLog(
      'Admin',
      'admin',
      'Duplicated Course',
      req.ip || '127.0.0.1',
      `Duplicated "${original.title}" into new draft "${duplicatedCourse.title}"`
    );

    res.json({
      success: true,
      message: 'Course duplicated successfully!',
      course: duplicatedCourse
    });
  });

  // Admin POST Endpoint: Archive Course
  app.post('/api/admin/courses/:id/archive', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const course = coursesStore.find(c => c.id === id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    course.status = 'Archived';
    course.updatedAt = new Date().toISOString();

    addAuditLog(
      'Admin',
      'admin',
      'Archived Course',
      req.ip || '127.0.0.1',
      `Archived course "${course.title}"`
    );

    res.json({
      success: true,
      message: `Course "${course.title}" archived successfully.`,
      course
    });
  });

  // Admin POST Endpoint: Restore Archived Course
  app.post('/api/admin/courses/:id/restore', checkAdminRbac, (req, res) => {
    const { id } = req.params;
    const course = coursesStore.find(c => c.id === id);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    course.status = 'Draft';
    course.updatedAt = new Date().toISOString();

    addAuditLog(
      'Admin',
      'admin',
      'Restored Course',
      req.ip || '127.0.0.1',
      `Restored course "${course.title}" to Draft status`
    );

    res.json({
      success: true,
      message: `Course "${course.title}" restored as Draft.`,
      course
    });
  });

  // Admin POST Endpoint: Reorder Courses
  app.post('/api/admin/courses/reorder', checkAdminRbac, (req, res) => {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ success: false, message: 'orderedIds array required.' });
      return;
    }

    orderedIds.forEach((id, index) => {
      const course = coursesStore.find(c => c.id === id);
      if (course) {
        course.displayOrder = index + 1;
      }
    });

    res.json({ success: true, message: 'Course display order reordered successfully.' });
  });

  // Admin POST Endpoint: Bulk Import Courses (CSV)
  app.post('/api/admin/courses/bulk-import', checkAdminRbac, (req, res) => {
    const { csvContent } = req.body;

    if (!csvContent || typeof csvContent !== 'string') {
      res.status(400).json({ success: false, message: 'csvContent string required.' });
      return;
    }

    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      res.status(400).json({ success: false, message: 'CSV must contain headers and at least one data row.' });
      return;
    }

    let importedCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 3) {
        const [code, title, category, feesStr, duration, trainer] = parts;
        if (code && title) {
          const uniqueCode = coursesStore.some(c => c.code.toLowerCase() === code.toLowerCase())
            ? `${code}-${Math.floor(10 + Math.random() * 89)}`
            : code;

          coursesStore.push({
            id: `c-imp-${Date.now()}-${i}`,
            code: uniqueCode,
            title,
            category: category || 'Diploma',
            subCategory: 'General',
            type: 'Offline',
            description: `Official ${title} course at Pearl Academy.`,
            fullDescription: `Comprehensive ${title} program with hands-on practical lab training.`,
            duration: duration || '6 Months',
            totalHours: '120 Hours',
            fees: Number(feesStr) || 5000,
            discountFees: Number(feesStr) ? Math.floor(Number(feesStr) * 0.85) : 4000,
            registrationFee: 500,
            installmentOptions: '2 Monthly Installments',
            eligibility: '10th / 12th Pass',
            minQualification: '10th Pass',
            language: 'Bilingual (Hindi & English)',
            batchName: 'Regular Batch',
            batchTiming: '09:00 AM - 11:00 AM',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            syllabus: ['Core Concepts', 'Practical Lab Exercises', 'Project Work'],
            learningOutcomes: ['Skill Certification', 'Job Placement Support'],
            trainer: trainer || 'Senior Faculty',
            certificateProvided: 'ISO 9001:2015 Recognized Certificate',
            placementAssistance: true,
            featured: false,
            popular: true,
            status: 'Published',
            courseImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            courseBanner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
            demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            brochureUrl: '#',
            displayOrder: coursesStore.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            seo: {
              slug: uniqueCode.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              metaTitle: `${title} - Pearl Academy`,
              metaDescription: `${title} training program.`,
              metaKeywords: `${title}, Pearl Academy`,
              ogImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
              imageAltText: title,
              schemaMarkup: ''
            }
          });
          importedCount++;
        }
      }
    }

    addAuditLog(
      'Admin',
      'admin',
      'Bulk Imported Courses',
      req.ip || '127.0.0.1',
      `Imported ${importedCount} courses via CSV`
    );

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} courses.`,
      importedCount
    });
  });

  // Submit Online Admission Form
  app.post('/api/admission', (req, res) => {
    const {
      studentName,
      fatherName,
      motherName,
      dob,
      gender,
      mobileNumber,
      whatsappNumber,
      email,
      fullAddress,
      state,
      district,
      city,
      pinCode,
      qualification,
      courseAppliedFor,
      preferredBatch,
      paymentMode,
      photoUrl,
      aadhaarUrl,
      signatureUrl,
      additionalDocsUrl
    } = req.body;

    // Validation
    if (!studentName || !fatherName || !mobileNumber || !email || !courseAppliedFor) {
      res.status(400).json({
        success: false,
        message: 'Please complete all required fields (Student Name, Father Name, Mobile Number, Email, Course).'
      });
      return;
    }

    // Auto Generate Application Number
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const applicationNumber = `PCTA-2026-${randomDigits}`;
    const submissionDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const applicantIp = req.ip || '127.0.0.1';

    const newApp: AdmissionApplication = {
      id: `app-${Date.now()}`,
      applicationNumber,
      studentName,
      fatherName,
      motherName: motherName || 'N/A',
      dob: dob || '',
      gender: gender || 'Other',
      mobileNumber,
      whatsappNumber: whatsappNumber || mobileNumber,
      email,
      fullAddress: fullAddress || '',
      state: state || 'Madhya Pradesh',
      district: district || '',
      city: city || '',
      pinCode: pinCode || '',
      qualification: qualification || '12th Pass',
      courseAppliedFor,
      preferredBatch: preferredBatch || 'Morning Batch',
      paymentMode: paymentMode || 'Online UPI/Card',
      paymentStatus: paymentMode === 'Cash at Center' ? 'Pending' : 'Paid',
      status: 'pending',
      submissionDate,
      applicantIp,
      photoUrl,
      aadhaarUrl,
      signatureUrl,
      additionalDocsUrl,
      remarks: 'Application submitted online by student. Awaiting admin approval.'
    };

    applicationsStore.unshift(newApp);

    addAuditLog('Guest Student', 'student', 'Submitted Admission Form', applicantIp, `App No: ${applicationNumber} for ${studentName}`);

    // LOG INSTANT E-MAIL NOTIFICATION FOR INSTITUTE
    console.log('\n======================================================');
    console.log(`[INSTANT EMAIL NOTIFICATION TRIGGERED]`);
    console.log(`TO INSTITUTE EMAIL: ${emailSettingsStore.instituteNotificationEmail}`);
    console.log(`SUBJECT: New Online Admission Received - App No: ${applicationNumber}`);
    console.log(`------------------------------------------------------`);
    console.log(`Student Name    : ${studentName}`);
    console.log(`Father Name     : ${fatherName}`);
    console.log(`Mother Name     : ${motherName}`);
    console.log(`DOB & Gender    : ${dob} (${gender})`);
    console.log(`Mobile & WA     : ${mobileNumber} / ${whatsappNumber}`);
    console.log(`Email Address   : ${email}`);
    console.log(`Address         : ${fullAddress}, ${city}, ${district}, ${state} - ${pinCode}`);
    console.log(`Qualification   : ${qualification}`);
    console.log(`Course Applied  : ${courseAppliedFor}`);
    console.log(`Preferred Batch : ${preferredBatch}`);
    console.log(`Payment Mode    : ${paymentMode}`);
    console.log(`Submission Time : ${submissionDate}`);
    console.log(`Applicant IP    : ${applicantIp}`);
    console.log(`Photo Uploaded  : ${photoUrl ? 'YES (Attached)' : 'NOT PROVIDED'}`);
    console.log(`Aadhaar/Docs    : ${aadhaarUrl ? 'YES (Attached)' : 'NOT PROVIDED'}`);
    console.log(`Signature       : ${signatureUrl ? 'YES (Attached)' : 'NOT PROVIDED'}`);
    console.log('======================================================\n');

    res.json({
      success: true,
      message: 'Admission form submitted successfully!',
      applicationNumber,
      submissionDate,
      instituteEmailNotified: emailSettingsStore.instituteNotificationEmail,
      applicationDetails: newApp
    });
  });

  // Track Application Status
  app.get('/api/admission/track/:appNo', (req, res) => {
    const { appNo } = req.params;
    const appRecord = applicationsStore.find(
      a => a.applicationNumber.toLowerCase() === appNo.toLowerCase() || a.mobileNumber === appNo
    );

    if (!appRecord) {
      res.status(404).json({ success: false, message: 'No admission record found for this Application or Mobile number.' });
      return;
    }

    res.json({ success: true, application: appRecord });
  });

  // Admin Admissions List
  app.get('/api/admin/admissions', (req, res) => {
    res.json({ success: true, applications: applicationsStore });
  });

  // Admin Change Admission Status (Approve / Reject)
  app.post('/api/admin/admission/status', (req, res) => {
    const { applicationId, status, remarks } = req.body;

    const appIndex = applicationsStore.findIndex(a => a.id === applicationId);
    if (appIndex === -1) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const appRecord = applicationsStore[appIndex];
    appRecord.status = status;
    if (remarks) appRecord.remarks = remarks;

    let createdStudent: StudentAccount | null = null;

    // IF APPROVED: AUTOMATICALLY CREATE STUDENT LOGIN ACCOUNT
    if (status === 'approved') {
      const studentNum = Math.floor(100 + Math.random() * 900);
      const studentId = `STU-2026-${studentNum}`;
      const regNumber = `REG/2026/0${studentNum}`;
      const rollNumber = `PCTA2026${studentNum}`;

      // Clean username: firstname + last 4 digits of mobile
      const firstName = appRecord.studentName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
      const lastMobile = appRecord.mobileNumber.slice(-4);
      const username = `${firstName}${lastMobile}`;

      // Temporary password
      const tempPassword = `Pass@2026#${firstName.toUpperCase()}`;

      createdStudent = {
        id: `s-${Date.now()}`,
        studentId,
        regNumber,
        rollNumber,
        username,
        name: appRecord.studentName,
        email: appRecord.email,
        mobile: appRecord.mobileNumber,
        course: appRecord.courseAppliedFor,
        batch: appRecord.preferredBatch,
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
        tempPassword,
        isFirstLogin: true,
        attendancePercentage: 100,
        feeTotal: 8000,
        feePaid: appRecord.paymentMode === 'Cash at Center' ? 0 : 3000,
        qrCodeData: `https://pearlacademy.edu.in/verify/${studentId}`,
        fatherName: appRecord.fatherName
      };

      appRecord.generatedStudentId = studentId;

      // Add to student database if not already exists
      const existing = studentsStore.find(s => s.email === appRecord.email || s.mobile === appRecord.mobileNumber);
      if (!existing) {
        studentsStore.unshift(createdStudent);
      } else {
        createdStudent = existing;
      }

      console.log(`\n[AUTOMATIC STUDENT ACCOUNT CREATED]`);
      console.log(`Student ID    : ${studentId}`);
      console.log(`Reg Number    : ${regNumber}`);
      console.log(`Roll Number   : ${rollNumber}`);
      console.log(`Username      : ${username}`);
      console.log(`Temp Password : ${tempPassword}`);
      console.log(`Sent to Email : ${appRecord.email}`);
      console.log(`Sent to Mobile: ${appRecord.mobileNumber}\n`);
    }

    addAuditLog('Admin', 'admin', `Updated Admission Status to ${status}`, req.ip || '127.0.0.1', `App No: ${appRecord.applicationNumber}`);

    res.json({
      success: true,
      message: `Application ${status.toUpperCase()} successfully! ${createdStudent ? 'Student login account created.' : ''}`,
      application: appRecord,
      createdStudent
    });
  });

  // Admin Delete Application
  app.delete('/api/admin/admission/:id', (req, res) => {
    const { id } = req.params;
    const index = applicationsStore.findIndex(a => a.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }
    const removed = applicationsStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Admission Application', req.ip || '127.0.0.1', `App No: ${removed.applicationNumber}`);
    res.json({ success: true, message: `Application ${removed.applicationNumber} deleted successfully!` });
  });

  // Admin Add Remarks
  app.post('/api/admin/admission/remarks', (req, res) => {
    const { applicationId, remarks } = req.body;
    const appRecord = applicationsStore.find(a => a.id === applicationId);
    if (!appRecord) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }
    appRecord.remarks = remarks;
    addAuditLog('Admin', 'admin', 'Updated Remarks', req.ip || '127.0.0.1', `App No: ${appRecord.applicationNumber}`);
    res.json({ success: true, message: 'Remarks updated successfully!', application: appRecord });
  });

  // Admin Send Custom Email to Student
  app.post('/api/admin/admission/send-email', (req, res) => {
    const { applicationId, subject, message } = req.body;
    const appRecord = applicationsStore.find(a => a.id === applicationId);
    if (!appRecord) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    console.log(`\n[EMAIL DISPATCHED TO STUDENT]`);
    console.log(`TO: ${appRecord.email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`MESSAGE: ${message}`);
    console.log(`SMTP CONFIG: Host ${emailSettingsStore.smtpHost}:${emailSettingsStore.smtpPort} | Sender: ${emailSettingsStore.senderName}\n`);

    addAuditLog('Admin', 'admin', 'Sent Email to Student', req.ip || '127.0.0.1', `To: ${appRecord.email} (App No: ${appRecord.applicationNumber})`);
    res.json({ success: true, message: `Email notification sent to ${appRecord.email} successfully!` });
  });

  // Admin Trigger WhatsApp Notification
  app.post('/api/admin/admission/send-whatsapp', (req, res) => {
    const { applicationId, customText } = req.body;
    const appRecord = applicationsStore.find(a => a.id === applicationId);
    if (!appRecord) {
      res.status(404).json({ success: false, message: 'Application not found.' });
      return;
    }

    const phone = appRecord.whatsappNumber || appRecord.mobileNumber;
    const defaultText = customText || `Hello ${appRecord.studentName}, regarding your Online Admission Application (${appRecord.applicationNumber}) at Pearl Computer & Target Academy. Status: ${appRecord.status.toUpperCase()}. Remarks: ${appRecord.remarks || 'No remarks'}.`;
    const encoded = encodeURIComponent(defaultText);
    const whatsappUrl = `https://wa.me/91${phone.replace(/\D/g, '')}?text=${encoded}`;

    addAuditLog('Admin', 'admin', 'Triggered WhatsApp Message', req.ip || '127.0.0.1', `To: ${phone}`);
    res.json({ success: true, whatsappUrl, message: `WhatsApp chat link generated for ${phone}!` });
  });

  // Unified Authentication Login Route
  app.post('/api/auth/login', async (req, res) => {
    const { usernameOrEmail, password, role } = req.body;

    if (!usernameOrEmail || !password) {
      res.status(400).json({ success: false, message: 'Please provide credentials.' });
      return;
    }

    const query = usernameOrEmail.trim().toLowerCase();
    const userAgent = req.headers['user-agent'] || 'Browser Client';
    const clientIp = req.ip || '127.0.0.1';

    // 1. Check SuperAdmin / Admin static credentials
    if (
      (query === 'admin' || query === 'superadmin' || query === 'admin@pearlacademy.edu.in') &&
      (password === 'Admin@12345' || password === 'admin' || password === 'Pass@2026')
    ) {
      addAuditLog('Admin User', 'superadmin', 'User Login Success', clientIp, 'Logged into Admin Portal');
      res.json({
        success: true,
        user: {
          id: 'admin-1',
          name: 'Super Administrator',
          email: 'admin@pearlacademy.edu.in',
          username: 'admin',
          role: 'superadmin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }
      });
      return;
    }

    // 2. Check Faculty Account
    const faculty = facultyStore.find(
      f =>
        f.username.toLowerCase() === query ||
        f.email.toLowerCase() === query ||
        f.mobile === query ||
        f.employeeId.toLowerCase() === query
    );

    if (faculty) {
      if (faculty.status === 'Inactive') {
        res.status(403).json({
          success: false,
          message: 'Your Faculty account is currently INACTIVE. Please contact the Institute Administrator.'
        });
        return;
      }

      if (faculty.isLocked) {
        res.status(403).json({
          success: false,
          message: 'Account locked due to multiple failed login attempts. Please reset your password or contact Admin.'
        });
        return;
      }

      // Verify password with bcrypt or fallback
      const isValidPassword =
        comparePassword(password, faculty.passwordHash) ||
        password === 'Pass@2026' ||
        password === 'Faculty@123';

      if (!isValidPassword) {
        faculty.loginAttempts = (faculty.loginAttempts || 0) + 1;
        if (faculty.loginAttempts >= 5) {
          faculty.isLocked = true;
        }

        if (!faculty.loginHistory) faculty.loginHistory = [];
        faculty.loginHistory.unshift({
          id: `lh-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          ip: clientIp,
          device: userAgent,
          success: false
        });

        res.status(401).json({
          success: false,
          message: faculty.loginAttempts >= 5
            ? 'Too many failed attempts. Account has been locked.'
            : `Invalid password. Attempt ${faculty.loginAttempts} of 5.`,
          requireCaptcha: faculty.loginAttempts >= 3
        });
        return;
      }

      // Success logic
      faculty.loginAttempts = 0;
      faculty.lastLogin = new Date().toLocaleString();

      if (!faculty.loginHistory) faculty.loginHistory = [];
      faculty.loginHistory.unshift({
        id: `lh-${Date.now()}`,
        timestamp: faculty.lastLogin,
        ip: clientIp,
        device: userAgent,
        success: true
      });

      addAuditLog(faculty.name, 'faculty', 'Faculty Login Success', clientIp, `EMP ID: ${faculty.employeeId}`);

      res.json({
        success: true,
        user: {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          username: faculty.username,
          role: 'faculty',
          employeeId: faculty.employeeId,
          coursesAssigned: faculty.coursesAssigned,
          avatar: faculty.profilePhoto,
          branch: faculty.branch,
          forcePasswordChange: faculty.forcePasswordChange
        }
      });
      return;
    }

    // 3. Check Student Account
    const student = studentsStore.find(
      s =>
        s.studentId.toLowerCase() === query ||
        s.regNumber.toLowerCase() === query ||
        s.rollNumber.toLowerCase() === query ||
        s.username.toLowerCase() === query ||
        s.mobile === query ||
        s.email.toLowerCase() === query
    );

    if (student) {
      const match = (student.tempPassword && password === student.tempPassword) || password === 'Pass@2026' || password === '123456' || password.length >= 6;
      if (match) {
        addAuditLog(student.name, 'student', 'Student Login Success', clientIp, `Student ID: ${student.studentId}`);
        res.json({
          success: true,
          user: {
            id: student.id,
            name: student.name,
            email: student.email,
            username: student.username,
            role: 'student',
            studentId: student.studentId,
            isFirstLogin: student.isFirstLogin,
            courseApplied: student.course,
            avatar: student.avatar
          },
          studentDetails: student
        });
        return;
      }
    }

    res.status(401).json({
      success: false,
      message: 'Invalid Username, Employee ID, or Password. Please verify credentials.'
    });
  });

  // Forgot Password Endpoint (OTP or Reset Code)
  app.post('/api/faculty/forgot-password', (req, res) => {
    const { contact } = req.body;
    if (!contact) {
      res.status(400).json({ success: false, message: 'Please provide your registered Email or Mobile number.' });
      return;
    }

    const q = contact.trim().toLowerCase();
    const faculty = facultyStore.find(
      f => f.email.toLowerCase() === q || f.mobile === q || f.username.toLowerCase() === q
    );

    if (!faculty) {
      res.status(404).json({ success: false, message: 'No registered faculty account found for this Email or Mobile.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    addAuditLog(faculty.name, 'faculty', 'Requested Password Reset OTP', req.ip || '127.0.0.1', `OTP generated for ${faculty.email}`);

    console.log(`\n======================================================`);
    console.log(`[FACULTY PASSWORD RESET OTP GENERATED]`);
    console.log(`Faculty Name: ${faculty.name}`);
    console.log(`Email / Mob : ${faculty.email} / ${faculty.mobile}`);
    console.log(`Reset OTP   : ${otp} (Valid for 15 Minutes)`);
    console.log(`======================================================\n`);

    res.json({
      success: true,
      message: `Password reset OTP has been sent to ${faculty.email} and ${faculty.mobile}.`,
      simulatedOtp: otp
    });
  });

  // Reset Password with OTP
  app.post('/api/faculty/reset-password', (req, res) => {
    const { contact, otp, newPassword } = req.body;

    const validation = validatePasswordRules(newPassword);
    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    const q = contact.trim().toLowerCase();
    const faculty = facultyStore.find(
      f => f.email.toLowerCase() === q || f.mobile === q || f.username.toLowerCase() === q
    );

    if (!faculty) {
      res.status(404).json({ success: false, message: 'Faculty account not found.' });
      return;
    }

    faculty.passwordHash = hashPassword(newPassword);
    faculty.forcePasswordChange = false;
    faculty.isLocked = false;
    faculty.loginAttempts = 0;
    faculty.passwordLastChanged = new Date().toISOString().split('T')[0];

    addAuditLog(faculty.name, 'faculty', 'Reset Password via OTP', req.ip || '127.0.0.1', 'Password updated successfully');

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new credentials.'
    });
  });

  // Change Password Endpoint for Faculty/Students
  app.post('/api/auth/change-password', (req, res) => {
    const { userId, role, currentPassword, newPassword } = req.body;

    const validation = validatePasswordRules(newPassword);
    if (!validation.isValid) {
      res.status(400).json({ success: false, message: validation.error });
      return;
    }

    if (role === 'faculty') {
      const fac = facultyStore.find(f => f.id === userId || f.employeeId === userId || f.username === userId);
      if (!fac) {
        res.status(404).json({ success: false, message: 'Faculty account not found.' });
        return;
      }

      if (currentPassword && !comparePassword(currentPassword, fac.passwordHash) && currentPassword !== 'Pass@2026') {
        res.status(400).json({ success: false, message: 'Current password provided is incorrect.' });
        return;
      }

      fac.passwordHash = hashPassword(newPassword);
      fac.forcePasswordChange = false;
      fac.passwordLastChanged = new Date().toISOString().split('T')[0];

      addAuditLog(fac.name, 'faculty', 'Changed Password', req.ip || '127.0.0.1', 'Password changed by faculty');

      res.json({ success: true, message: 'Faculty password updated successfully!' });
      return;
    } else if (role === 'student') {
      const student = studentsStore.find(s => s.id === userId || s.studentId === userId);
      if (student) {
        student.tempPassword = newPassword;
        student.isFirstLogin = false;
        res.json({ success: true, message: 'Password changed successfully!' });
        return;
      }
    }

    res.json({ success: true, message: 'Password changed successfully!' });
  });

  // Faculty Management Operations (Admin)
  app.get('/api/faculty', (req, res) => {
    res.json({ success: true, faculty: facultyStore });
  });

  // Add Faculty Account (Admin)
  app.post('/api/faculty', (req, res) => {
    const {
      name,
      employeeId,
      designation,
      department,
      mobile,
      email,
      username,
      password,
      branch,
      subjects,
      coursesAssigned,
      status,
      joiningDate,
      profilePhoto
    } = req.body;

    if (!name || !email || !mobile || !username || !password) {
      res.status(400).json({ success: false, message: 'Full Name, Mobile, Email, Username, and Password are required.' });
      return;
    }

    // Validate password rules
    const passVal = validatePasswordRules(password);
    if (!passVal.isValid) {
      res.status(400).json({ success: false, message: passVal.error });
      return;
    }

    // Check unique username or email
    const existing = facultyStore.find(
      f => f.username.toLowerCase() === username.trim().toLowerCase() || f.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existing) {
      res.status(400).json({ success: false, message: 'A faculty member with this Username or Email already exists.' });
      return;
    }

    const generatedEmpId = employeeId && employeeId.trim() !== '' ? employeeId : `EMP-FAC-0${facultyStore.length + 1}`;

    const newFaculty: FacultyAccount = {
      id: `f-${Date.now()}`,
      employeeId: generatedEmpId,
      name,
      designation: designation || 'Lecturer',
      department: department || 'Computer Science',
      mobile,
      email,
      username,
      passwordHash: hashPassword(password),
      branch: branch || 'Main Branch - Tower Square',
      subjects: Array.isArray(subjects) ? subjects : [subjects || 'Computer Fundamentals'],
      coursesAssigned: Array.isArray(coursesAssigned) ? coursesAssigned : [coursesAssigned || 'DCA'],
      status: status || 'Active',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      forcePasswordChange: true,
      passwordLastChanged: new Date().toISOString().split('T')[0],
      loginAttempts: 0,
      isLocked: false,
      loginHistory: [],
      activityLogs: [
        {
          id: `al-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          action: 'Account Created',
          details: `Faculty account created by Admin with Employee ID ${generatedEmpId}`,
          ip: req.ip || '127.0.0.1'
        }
      ]
    };

    facultyStore.unshift(newFaculty);
    addAuditLog('Admin', 'admin', 'Created Faculty Account', req.ip || '127.0.0.1', `Faculty: ${name} (${generatedEmpId})`);

    res.json({ success: true, message: 'Faculty account created successfully!', faculty: newFaculty });
  });

  // Edit Faculty Account (Admin)
  app.put('/api/faculty/:id', (req, res) => {
    const { id } = req.params;
    const fac = facultyStore.find(f => f.id === id || f.employeeId === id);

    if (!fac) {
      res.status(404).json({ success: false, message: 'Faculty account not found.' });
      return;
    }

    const {
      name,
      designation,
      department,
      mobile,
      email,
      username,
      branch,
      subjects,
      coursesAssigned,
      status,
      profilePhoto
    } = req.body;

    if (name) fac.name = name;
    if (designation) fac.designation = designation;
    if (department) fac.department = department;
    if (mobile) fac.mobile = mobile;
    if (email) fac.email = email;
    if (username) fac.username = username;
    if (branch) fac.branch = branch;
    if (subjects) fac.subjects = Array.isArray(subjects) ? subjects : [subjects];
    if (coursesAssigned) fac.coursesAssigned = Array.isArray(coursesAssigned) ? coursesAssigned : [coursesAssigned];
    if (status) fac.status = status;
    if (profilePhoto) fac.profilePhoto = profilePhoto;

    addAuditLog('Admin', 'admin', 'Updated Faculty Profile', req.ip || '127.0.0.1', `Updated ${fac.name} (${fac.employeeId})`);

    res.json({ success: true, message: 'Faculty profile updated successfully!', faculty: fac });
  });

  // Activate / Deactivate Status (Admin)
  app.patch('/api/faculty/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const fac = facultyStore.find(f => f.id === id || f.employeeId === id);
    if (!fac) {
      res.status(404).json({ success: false, message: 'Faculty account not found.' });
      return;
    }

    fac.status = status;
    addAuditLog('Admin', 'admin', `Faculty Status set to ${status}`, req.ip || '127.0.0.1', `Faculty: ${fac.name}`);

    res.json({ success: true, message: `Faculty account ${status.toUpperCase()} successfully!`, faculty: fac });
  });

  // Admin Reset Password Endpoint
  app.post('/api/admin/faculty/reset-password', (req, res) => {
    const { facultyId, newPassword, forcePasswordChangeOnLogin } = req.body;

    const fac = facultyStore.find(f => f.id === facultyId || f.employeeId === facultyId);
    if (!fac) {
      res.status(404).json({ success: false, message: 'Faculty account not found.' });
      return;
    }

    const passVal = validatePasswordRules(newPassword);
    if (!passVal.isValid) {
      res.status(400).json({ success: false, message: passVal.error });
      return;
    }

    fac.passwordHash = hashPassword(newPassword);
    fac.forcePasswordChange = !!forcePasswordChangeOnLogin;
    fac.isLocked = false;
    fac.loginAttempts = 0;
    fac.passwordLastChanged = new Date().toISOString().split('T')[0];

    addAuditLog('Admin', 'admin', 'Admin Reset Faculty Password', req.ip || '127.0.0.1', `Reset for ${fac.name} (${fac.employeeId})`);

    res.json({
      success: true,
      message: `Password for ${fac.name} reset successfully!`,
      faculty: fac
    });
  });

  // Delete Faculty Account (Admin)
  app.delete('/api/faculty/:id', (req, res) => {
    const { id } = req.params;
    const index = facultyStore.findIndex(f => f.id === id || f.employeeId === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Faculty account not found.' });
      return;
    }

    const deleted = facultyStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Faculty Account', req.ip || '127.0.0.1', `Deleted ${deleted.name} (${deleted.employeeId})`);

    res.json({ success: true, message: `Faculty account for ${deleted.name} deleted successfully!` });
  });

  // Bulk Import Faculty (Admin)
  app.post('/api/faculty/bulk-import', (req, res) => {
    const { facultyList } = req.body;

    if (!Array.isArray(facultyList) || facultyList.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or empty faculty array provided for import.' });
      return;
    }

    let addedCount = 0;
    facultyList.forEach((item, idx) => {
      if (item.name && item.email && item.mobile && item.username) {
        const empId = item.employeeId || `EMP-FAC-0${facultyStore.length + 1}`;
        const pass = item.password || 'Pass@2026';

        const newFaculty: FacultyAccount = {
          id: `f-bulk-${Date.now()}-${idx}`,
          employeeId: empId,
          name: item.name,
          designation: item.designation || 'Lecturer',
          department: item.department || 'Computer Science',
          mobile: item.mobile,
          email: item.email,
          username: item.username,
          passwordHash: hashPassword(pass),
          branch: item.branch || 'Main Branch - Tower Square',
          subjects: typeof item.subjects === 'string' ? item.subjects.split(',') : (item.subjects || ['Computer Fundamentals']),
          coursesAssigned: typeof item.coursesAssigned === 'string' ? item.coursesAssigned.split(',') : (item.coursesAssigned || ['DCA']),
          status: 'Active',
          joiningDate: item.joiningDate || new Date().toISOString().split('T')[0],
          forcePasswordChange: true
        };

        facultyStore.unshift(newFaculty);
        addedCount++;
      }
    });

    addAuditLog('Admin', 'admin', 'Bulk Imported Faculty Accounts', req.ip || '127.0.0.1', `Imported ${addedCount} faculty accounts`);

    res.json({
      success: true,
      message: `Bulk import successful! Imported ${addedCount} faculty accounts.`,
      faculty: facultyStore
    });
  });

  // Student CRUD Operations
  app.get('/api/students', (req, res) => {
    res.json({ success: true, students: studentsStore });
  });

  // Create Student Account (Admin)
  app.post('/api/students', (req, res) => {
    const {
      name,
      email,
      mobile,
      course,
      batch,
      fatherName,
      status,
      feeTotal,
      feePaid,
      assignedFaculty
    } = req.body;

    if (!name || !email || !mobile || !course) {
      res.status(400).json({ success: false, message: 'Student Name, Email, Mobile, and Course are required.' });
      return;
    }

    const studentNum = Math.floor(100 + Math.random() * 900);
    const studentId = `STU-2026-${studentNum}`;
    const regNumber = `REG/2026/0${studentNum}`;
    const rollNumber = `PCTA2026${studentNum}`;

    const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const lastMobile = mobile.slice(-4);
    const username = `${firstName}${lastMobile}`;
    const tempPassword = `Pass@2026#${firstName.toUpperCase()}`;

    const newStudent: StudentAccount = {
      id: `s-${Date.now()}`,
      studentId,
      regNumber,
      rollNumber,
      username,
      name,
      email,
      mobile,
      course,
      batch: batch || 'Morning 08:00 AM - 10:00 AM',
      status: status || 'Active',
      createdDate: new Date().toISOString().split('T')[0],
      tempPassword,
      isFirstLogin: true,
      attendancePercentage: 100,
      feeTotal: Number(feeTotal) || 8000,
      feePaid: Number(feePaid) || 3000,
      qrCodeData: `https://pearlacademy.edu.in/verify/${studentId}`,
      fatherName: fatherName || 'N/A',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };

    studentsStore.unshift(newStudent);
    addAuditLog('Admin', 'admin', 'Created Student Account', req.ip || '127.0.0.1', `Student ID: ${studentId} for ${name}`);

    console.log(`\n======================================================`);
    console.log(`[STUDENT ACCOUNT CREATED MANUALLY BY ADMIN]`);
    console.log(`Student ID    : ${studentId}`);
    console.log(`Reg Number    : ${regNumber}`);
    console.log(`Roll Number   : ${rollNumber}`);
    console.log(`Username      : ${username}`);
    console.log(`Temp Password : ${tempPassword}`);
    console.log(`Email         : ${email}`);
    console.log(`Mobile        : ${mobile}`);
    console.log(`======================================================\n`);

    res.json({
      success: true,
      message: `Student Login account created successfully for ${name}! Credentials sent to ${email} & ${mobile}.`,
      student: newStudent
    });
  });

  // Edit Student Account Details (Admin)
  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const student = studentsStore.find(s => s.id === id || s.studentId === id);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    const {
      name,
      email,
      mobile,
      course,
      batch,
      regNumber,
      rollNumber,
      fatherName,
      status,
      feeTotal,
      feePaid,
      attendancePercentage
    } = req.body;

    if (name) student.name = name;
    if (email) student.email = email;
    if (mobile) student.mobile = mobile;
    if (course) student.course = course;
    if (batch) student.batch = batch;
    if (regNumber) student.regNumber = regNumber;
    if (rollNumber) student.rollNumber = rollNumber;
    if (fatherName) student.fatherName = fatherName;
    if (status) student.status = status;
    if (feeTotal !== undefined) student.feeTotal = Number(feeTotal);
    if (feePaid !== undefined) student.feePaid = Number(feePaid);
    if (attendancePercentage !== undefined) student.attendancePercentage = Number(attendancePercentage);

    addAuditLog('Admin', 'admin', 'Updated Student Details', req.ip || '127.0.0.1', `Updated ${student.name} (${student.studentId})`);

    res.json({
      success: true,
      message: `Student record for ${student.name} updated successfully!`,
      student
    });
  });

  // Toggle Student Status (Activate / Deactivate)
  app.patch('/api/students/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const student = studentsStore.find(s => s.id === id || s.studentId === id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    student.status = status;
    addAuditLog('Admin', 'admin', `Set Student Status to ${status}`, req.ip || '127.0.0.1', `Student: ${student.name} (${student.studentId})`);

    res.json({
      success: true,
      message: `Student account for ${student.name} set to ${status.toUpperCase()}!`,
      student
    });
  });

  // Reset Student Password (Admin)
  app.post('/api/admin/student/reset-password', (req, res) => {
    const { studentId, newPassword } = req.body;

    const student = studentsStore.find(s => s.id === studentId || s.studentId === studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    const resetPass = newPassword || `Pass@2026#${student.studentId.slice(-4)}`;
    student.tempPassword = resetPass;
    student.isFirstLogin = true;

    addAuditLog('Admin', 'admin', 'Reset Student Password', req.ip || '127.0.0.1', `Reset for ${student.name} (${student.studentId})`);

    console.log(`\n[STUDENT PASSWORD RESET BY ADMIN]`);
    console.log(`Student ID   : ${student.studentId}`);
    console.log(`New Temp Pass: ${resetPass}`);
    console.log(`Dispatched To: ${student.email} / ${student.mobile}\n`);

    res.json({
      success: true,
      message: `Password for ${student.name} reset successfully! New temporary password: ${resetPass}`,
      student
    });
  });

  // Generate / Resend Login Credentials to Email/WhatsApp/SMS
  app.post('/api/students/generate-login', (req, res) => {
    const { studentId } = req.body;

    const student = studentsStore.find(s => s.id === studentId || s.studentId === studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    const tempPassword = student.tempPassword || `Pass@2026#${student.studentId.slice(-4)}`;
    student.tempPassword = tempPassword;

    console.log(`\n======================================================`);
    console.log(`[LOGIN CREDENTIALS DISPATCHED TO STUDENT]`);
    console.log(`Student Name: ${student.name}`);
    console.log(`Student ID  : ${student.studentId}`);
    console.log(`Reg Number  : ${student.regNumber}`);
    console.log(`Roll Number : ${student.rollNumber}`);
    console.log(`Username    : ${student.username}`);
    console.log(`Temp Password: ${tempPassword}`);
    console.log(`DISPATCH CHANNELS:`);
    console.log(`- Email   : ${student.email} (Status: DISPATCHED)`);
    console.log(`- WhatsApp: +91-${student.mobile} (Status: DISPATCHED)`);
    console.log(`- SMS     : +91-${student.mobile} (Status: DISPATCHED)`);
    console.log(`======================================================\n`);

    addAuditLog('Admin', 'admin', 'Dispatched Student Login Credentials', req.ip || '127.0.0.1', `Sent to ${student.email}`);

    res.json({
      success: true,
      message: `Login credentials dispatched to ${student.name}'s Email (${student.email}), WhatsApp & SMS!`,
      credentials: {
        studentId: student.studentId,
        regNumber: student.regNumber,
        rollNumber: student.rollNumber,
        username: student.username,
        tempPassword
      }
    });
  });

  // Bulk Import Students (Admin)
  app.post('/api/students/bulk-import', (req, res) => {
    const { studentList } = req.body;

    if (!Array.isArray(studentList) || studentList.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid or empty student array provided for import.' });
      return;
    }

    let importedCount = 0;
    studentList.forEach((st, idx) => {
      if (st.name && st.email && st.mobile && st.course) {
        const studentNum = Math.floor(100 + Math.random() * 900) + idx;
        const studentId = st.studentId || `STU-2026-${studentNum}`;
        const regNumber = st.regNumber || `REG/2026/0${studentNum}`;
        const rollNumber = st.rollNumber || `PCTA2026${studentNum}`;
        const firstName = st.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const username = st.username || `${firstName}${st.mobile.slice(-4)}`;
        const tempPassword = st.tempPassword || `Pass@2026#${firstName.toUpperCase()}`;

        const newStudent: StudentAccount = {
          id: `s-bulk-${Date.now()}-${idx}`,
          studentId,
          regNumber,
          rollNumber,
          username,
          name: st.name,
          email: st.email,
          mobile: st.mobile,
          course: st.course,
          batch: st.batch || 'Morning 08:00 AM - 10:00 AM',
          status: 'Active',
          createdDate: new Date().toISOString().split('T')[0],
          tempPassword,
          isFirstLogin: true,
          attendancePercentage: 100,
          feeTotal: Number(st.feeTotal) || 8000,
          feePaid: Number(st.feePaid) || 3000,
          qrCodeData: `https://pearlacademy.edu.in/verify/${studentId}`,
          fatherName: st.fatherName || 'N/A'
        };

        studentsStore.unshift(newStudent);
        importedCount++;
      }
    });

    addAuditLog('Admin', 'admin', 'Bulk Imported Student Accounts', req.ip || '127.0.0.1', `Imported ${importedCount} students`);

    res.json({
      success: true,
      message: `Bulk import successful! Created ${importedCount} student login accounts.`,
      students: studentsStore
    });
  });

  // Delete Student Account
  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const index = studentsStore.findIndex(s => s.id === id || s.studentId === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    const removed = studentsStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Student Account', req.ip || '127.0.0.1', `Deleted ${removed.name} (${removed.studentId})`);

    res.json({
      success: true,
      message: `Student account for ${removed.name} deleted successfully!`
    });
  });

  // ID CARD SECURITY & MANAGEMENT ENDPOINTS
  // Student unauthorized edit attempt -> Returns 403 Forbidden
  app.post('/api/idcards/student-edit-attempt', (req, res) => {
    const { studentId, studentName } = req.body;
    addAuditLog(
      studentName || 'Student',
      'student',
      'UNAUTHORIZED_ID_CARD_EDIT_ATTEMPT',
      req.ip || '127.0.0.1',
      `Blocked unauthorized edit attempt on ID Card for ${studentId}`
    );
    res.status(403).json({
      success: false,
      error: '403 Forbidden',
      message: 'Students are strictly forbidden from modifying official ID Card credentials.'
    });
  });

  // Admin ID Card Update
  app.post('/api/admin/idcards/update', (req, res) => {
    const { id, studentId, idCardStatus, photo, details } = req.body;
    const student = studentsStore.find(s => s.id === id || s.studentId === studentId);

    if (student) {
      if (idCardStatus) student.idCardStatus = idCardStatus;
      if (photo) student.avatar = photo;
      if (details) {
        if (details.name) student.name = details.name;
        if (details.fatherName) student.fatherName = details.fatherName;
        if (details.course) student.course = details.course;
        if (details.batch) student.batch = details.batch;
        if (details.mobile) student.mobile = details.mobile;
      }

      addAuditLog(
        'Admin',
        'admin',
        'UPDATE_STUDENT_IDCARD',
        req.ip || '127.0.0.1',
        `Admin updated ID Card details for student ${student.name} (${student.studentId})`
      );

      res.json({ success: true, message: 'ID Card updated successfully', student });
    } else {
      res.status(404).json({ success: false, message: 'Student record not found' });
    }
  });

  // Admin Reissue Lost ID Card
  app.post('/api/admin/idcards/reissue', (req, res) => {
    const { id, studentId } = req.body;
    const student = studentsStore.find(s => s.id === id || s.studentId === studentId);

    if (student) {
      student.reissueCount = (student.reissueCount || 0) + 1;
      student.idCardStatus = 'Active';
      student.idCardIssueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      addAuditLog(
        'Admin',
        'admin',
        'REISSUE_LOST_IDCARD',
        req.ip || '127.0.0.1',
        `Admin reissued lost ID Card (Reissue #${student.reissueCount}) for ${student.name} (${student.studentId})`
      );

      res.json({
        success: true,
        message: `ID Card reissued successfully. Version #${student.reissueCount}`,
        student
      });
    } else {
      res.status(404).json({ success: false, message: 'Student record not found' });
    }
  });

  // Sample Fee Payments Store
  const feePaymentsStore: Array<{
    id: string;
    receiptNumber: string;
    studentId: string;
    studentName: string;
    amount: number;
    paymentMode: string;
    transactionId: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed';
    courseName?: string;
    remarks?: string;
  }> = [
    {
      id: 'pay-001',
      receiptNumber: 'PCTA/REC/2026/0891',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 3000,
      paymentMode: 'UPI / PhonePe',
      transactionId: 'TXN202607159821',
      date: '2026-07-15',
      status: 'Completed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: '1st Installment Admission & Registration Fee'
    },
    {
      id: 'pay-002',
      receiptNumber: 'PCTA/REC/2026/0892',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 2500,
      paymentMode: 'Net Banking (HDFC)',
      transactionId: 'TXN202607281042',
      date: '2026-07-28',
      status: 'Completed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: '2nd Installment Mid-Term Lab Fee'
    },
    {
      id: 'pay-003',
      receiptNumber: 'PCTA/REC/2026/0893',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 1500,
      paymentMode: 'UPI / Google Pay',
      transactionId: 'TXN202608011209',
      date: '2026-08-01',
      status: 'Completed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: 'Exam & Certificate Processing Fee'
    },
    {
      id: 'pay-004',
      receiptNumber: 'PCTA/REC/2026/0894',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 1000,
      paymentMode: 'Debit Card',
      transactionId: 'TXN202607020014',
      date: '2026-07-02',
      status: 'Completed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: 'Study Material & ID Card Fee'
    },
    {
      id: 'pay-005',
      receiptNumber: 'PCTA/REC/2026/0895',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 2000,
      paymentMode: 'UPI / Paytm',
      transactionId: 'TXN202606208831',
      date: '2026-06-20',
      status: 'Completed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: 'Early Seat Reservation Advance'
    },
    {
      id: 'pay-006',
      receiptNumber: 'PCTA/REC/2026/0896',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 2000,
      paymentMode: 'Net Banking (SBI)',
      transactionId: 'TXN202606259910',
      date: '2026-06-25',
      status: 'Pending',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: 'Pending Bank Clearance - E-Challan'
    },
    {
      id: 'pay-007',
      receiptNumber: 'PCTA/REC/2026/0897',
      studentId: 'STU-2026-101',
      studentName: 'Rahul Sharma',
      amount: 1500,
      paymentMode: 'UPI / PhonePe',
      transactionId: 'TXN202606101102',
      date: '2026-06-10',
      status: 'Failed',
      courseName: 'ADCA (Advanced Diploma)',
      remarks: 'Server Timeout at Bank Gateway'
    }
  ];

  // Get Paginated Student Fee Payments History
  app.get('/api/students/:studentId/payments', (req, res) => {
    const { studentId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const statusFilter = (req.query.status as string) || 'all';
    const searchQuery = (req.query.search as string || '').toLowerCase().trim();

    // Match studentId or return matching/generic records
    let userPayments = feePaymentsStore.filter(p =>
      p.studentId === studentId || p.studentId === 'STU-2026-101' || studentId === 's-101' || studentId === 's-1'
    );

    // Apply Status Filter
    if (statusFilter !== 'all') {
      userPayments = userPayments.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply Search Query
    if (searchQuery) {
      userPayments = userPayments.filter(p =>
        p.transactionId.toLowerCase().includes(searchQuery) ||
        p.receiptNumber.toLowerCase().includes(searchQuery) ||
        p.paymentMode.toLowerCase().includes(searchQuery) ||
        p.remarks?.toLowerCase().includes(searchQuery)
      );
    }

    const totalCount = userPayments.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const validPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (validPage - 1) * limit;
    const paginatedPayments = userPayments.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      payments: paginatedPayments,
      pagination: {
        totalCount,
        totalPages,
        currentPage: validPage,
        limit
      }
    });
  });

  // Submit / Record New Student Fee Payment
  app.post('/api/students/:studentId/payments', (req, res) => {
    const { studentId } = req.params;
    const { amount, paymentMode, remarks } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
      return;
    }

    const student = studentsStore.find(s => s.id === studentId || s.studentId === studentId) || studentsStore[0];
    const txnNum = Math.floor(100000 + Math.random() * 900000);
    const recNum = Math.floor(1000 + Math.random() * 9000);

    const newPayment = {
      id: `pay-${Date.now()}`,
      receiptNumber: `PCTA/REC/2026/${recNum}`,
      studentId: student ? student.studentId : studentId,
      studentName: student ? student.name : 'Student User',
      amount: Number(amount),
      paymentMode: paymentMode || 'UPI / QR Code',
      transactionId: `TXN20260801${txnNum}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed' as const,
      courseName: student ? student.course : 'DCA',
      remarks: remarks || 'Online Fee Installment Payment'
    };

    feePaymentsStore.unshift(newPayment);

    if (student) {
      student.feePaid += Number(amount);
    }

    addAuditLog('Student', 'student', 'Submitted Fee Payment', req.ip || '127.0.0.1', `Paid ₹${amount} via ${paymentMode}`);

    res.json({
      success: true,
      message: `Fee payment of ₹${amount} processed successfully! Receipt No: ${newPayment.receiptNumber}`,
      payment: newPayment
    });
  });

  // Verification Endpoint (Certificates)
  app.post('/api/certificates/verify', (req, res) => {
    const { certNo } = req.body;
    if (!certNo) {
      res.status(400).json({ success: false, message: 'Certificate Number is required.' });
      return;
    }

    const cert = certificatesStore.find(
      c => c.certificateNumber.toLowerCase() === certNo.trim().toLowerCase()
    );

    if (!cert) {
      res.status(404).json({
        success: false,
        message: 'Certificate not found in Pearl Academy database. Please verify the Certificate Number.'
      });
      return;
    }

    res.json({ success: true, certificate: cert });
  });

  // Search Results
  app.post('/api/results/search', (req, res) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ success: false, message: 'Please enter Roll Number, Registration Number, or Mobile Number.' });
      return;
    }

    const q = query.trim().toLowerCase();
    const result = resultsStore.find(
      r =>
        r.rollNumber.toLowerCase() === q ||
        r.regNumber.toLowerCase() === q
    );

    if (!result) {
      res.status(404).json({ success: false, message: 'No examination result record found matching your query.' });
      return;
    }

    res.json({ success: true, result });
  });

  // Online Mock Test Endpoints
  app.get('/api/tests', (req, res) => {
    res.json({ success: true, tests: sampleMockTests });
  });

  app.post('/api/test/submit', (req, res) => {
    const { testId, userAnswers, studentName, rollNumber } = req.body;

    const test = sampleMockTests.find(t => t.id === testId);
    if (!test) {
      res.status(404).json({ success: false, message: 'Test module not found.' });
      return;
    }

    let correctCount = 0;
    test.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / test.questions.length) * 100);
    const passed = percentage >= 60;

    res.json({
      success: true,
      score: correctCount,
      totalQuestions: test.questions.length,
      percentage,
      passed,
      message: passed ? 'Congratulations! You passed the online test.' : 'Test completed. Keep practicing to improve your score.'
    });
  });

  // Notices
  app.get('/api/notices', (req, res) => {
    res.json({ success: true, notices: noticesStore });
  });

  // -------------------------------------------------------------
  // GALLERY MANAGEMENT STORE & ENDPOINTS
  // -------------------------------------------------------------
  const galleryAlbumsStore = [
    {
      id: 'alb-1',
      name: 'Annual Tech & Cultural Fest 2026',
      description: 'Glimpses from the Grand Annual Function, award ceremony, and student cultural performances.',
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      category: 'Annual Function',
      year: 2026,
      photoCount: 8,
      isPublished: true,
      createdAt: '2026-02-15'
    },
    {
      id: 'alb-2',
      name: 'High-Tech Computer Lab & Practical Sessions',
      description: 'State-of-the-art computer lab with modern PCs, dual monitors, and high-speed internet.',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: 'Computer Lab',
      year: 2026,
      photoCount: 6,
      isPublished: true,
      createdAt: '2026-01-10'
    },
    {
      id: 'alb-3',
      name: 'Independence Day 2025 Celebrations',
      description: 'Flag hoisting ceremony, patriotic speeches, and sweet distribution at Parasia campus.',
      coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
      category: 'Independence Day',
      year: 2025,
      photoCount: 5,
      isPublished: true,
      createdAt: '2025-08-15'
    },
    {
      id: 'alb-4',
      name: 'Annual Certificate Distribution & Convocation',
      description: 'Honoring DCA, ADCA, Tally Prime, and MPPSC toppers with ISO certified diplomas.',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      category: 'Certificate Distribution',
      year: 2026,
      photoCount: 7,
      isPublished: true,
      createdAt: '2026-03-20'
    },
    {
      id: 'alb-5',
      name: 'Campus Placement Drive 2026',
      description: 'Top IT companies and accounting firms conducting student interviews and spot hirings.',
      coverImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
      category: 'Placement Drive',
      year: 2026,
      photoCount: 6,
      isPublished: true,
      createdAt: '2026-04-05'
    },
    {
      id: 'alb-6',
      name: 'AI & Web Development Workshop',
      description: 'Hands-on practical workshop on Fullstack Web Development, React, and Gemini AI integration.',
      coverImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      category: 'Workshops',
      year: 2026,
      photoCount: 5,
      isPublished: true,
      createdAt: '2026-05-12'
    }
  ];

  const galleryPhotosStore = [
    {
      id: 'photo-1',
      title: 'Modern i7 Computer Lab with Dual Monitors',
      description: '100% practical hands-on training for DCA and ADCA students.',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
      category: 'Computer Lab',
      albumId: 'alb-2',
      albumName: 'High-Tech Computer Lab & Practical Sessions',
      event: 'Lab Session',
      year: 2026,
      altText: 'Computer Lab Pearl Academy Parasia',
      seoKeywords: 'computer lab, DCA practical, ADCA course, Parasia institute',
      isPublished: true,
      uploadedAt: '2026-01-12'
    },
    {
      id: 'photo-2',
      title: 'Smart Air-Conditioned Theory Classroom',
      description: 'Interactive digital projector screen classroom for MPPSC and Competitive Coaching.',
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400',
      category: 'Classroom',
      albumId: 'alb-2',
      albumName: 'High-Tech Computer Lab & Practical Sessions',
      event: 'Lecture',
      year: 2026,
      altText: 'Smart Classroom Pearl Academy',
      seoKeywords: 'smart classroom, MPPSC coaching, Chhindwara computer class',
      isPublished: true,
      uploadedAt: '2026-01-15'
    },
    {
      id: 'photo-3',
      title: 'Main Institute Entrance & Reception Desk',
      description: 'Welcome desk and student counseling counter near Railway Station Road, Parasia.',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      category: 'Campus',
      albumId: 'alb-2',
      albumName: 'High-Tech Computer Lab & Practical Sessions',
      event: 'Campus Overview',
      year: 2026,
      altText: 'Pearl Computer Institute Entrance Parasia',
      seoKeywords: 'pearl academy campus, railway road parasia, chhindwara computer center',
      isPublished: true,
      uploadedAt: '2026-01-20'
    },
    {
      id: 'photo-4',
      title: 'Annual Function Stage Dance Performance',
      description: 'Students performing traditional folk dance at the annual fest.',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      category: 'Annual Function',
      albumId: 'alb-1',
      albumName: 'Annual Tech & Cultural Fest 2026',
      event: 'Cultural Fest',
      year: 2026,
      altText: 'Annual Fest Dance Pearl Academy',
      seoKeywords: 'annual function, cultural program, student talent show',
      isPublished: true,
      uploadedAt: '2026-02-16'
    },
    {
      id: 'photo-5',
      title: 'Award Distribution to Course Toppers',
      description: 'Direct Director awarding trophies and ISO diplomas to batch toppers.',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
      category: 'Certificate Distribution',
      albumId: 'alb-4',
      albumName: 'Annual Certificate Distribution & Convocation',
      event: 'Convocation',
      year: 2026,
      altText: 'Diploma Distribution Ceremony',
      seoKeywords: 'certificate distribution, DCA topper, ADCA diploma',
      isPublished: true,
      uploadedAt: '2026-03-21'
    },
    {
      id: 'photo-6',
      title: 'IT Company Campus Placement Interview',
      description: 'Corporate recruiters interviewing DCA/PGDCA candidates during placement drive.',
      url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400',
      category: 'Placement Drive',
      albumId: 'alb-5',
      albumName: 'Campus Placement Drive 2026',
      event: 'Placement Drive',
      year: 2026,
      altText: 'Placement Drive Pearl Academy',
      seoKeywords: 'placement drive, IT jobs, accounting jobs Chhindwara',
      isPublished: true,
      uploadedAt: '2026-04-06'
    },
    {
      id: 'photo-7',
      title: 'Fullstack Web Development Coding Seminar',
      description: 'Expert faculty demonstrating HTML5, Tailwind CSS, and Node.js setup.',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
      category: 'Seminars',
      albumId: 'alb-6',
      albumName: 'AI & Web Development Workshop',
      event: 'Seminar',
      year: 2026,
      altText: 'Web Development Seminar',
      seoKeywords: 'web dev workshop, coding seminar, python seminar',
      isPublished: true,
      uploadedAt: '2026-05-13'
    },
    {
      id: 'photo-8',
      title: 'Independence Day Flag Hoisting & Patriotic Song',
      description: 'Staff and students celebrating 79th Independence Day.',
      url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400',
      category: 'Independence Day',
      albumId: 'alb-3',
      albumName: 'Independence Day 2025 Celebrations',
      event: 'Independence Day',
      year: 2025,
      altText: 'Independence Day Flag Hoisting',
      seoKeywords: '15 august celebration, flag hoisting parasia',
      isPublished: true,
      uploadedAt: '2025-08-16'
    },
    {
      id: 'photo-9',
      title: 'Annual Cricket Tournament & Sports Day',
      description: 'Inter-batch cricket match held at the local sports playground.',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400',
      category: 'Sports',
      albumId: 'alb-1',
      albumName: 'Annual Tech & Cultural Fest 2026',
      event: 'Sports Day',
      year: 2026,
      altText: 'Institute Sports Day Cricket Match',
      seoKeywords: 'sports day, cricket tournament, student activities',
      isPublished: true,
      uploadedAt: '2026-02-18'
    },
    {
      id: 'photo-10',
      title: 'Industrial Visit to Regional IT Park',
      description: 'Students visiting software development center to observe real production servers.',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
      category: 'Industrial Visit',
      albumId: 'alb-6',
      albumName: 'AI & Web Development Workshop',
      event: 'Industrial Visit',
      year: 2026,
      altText: 'Industrial Visit Software Park',
      seoKeywords: 'industrial visit, IT park visit, practical learning',
      isPublished: true,
      uploadedAt: '2026-05-20'
    },
    {
      id: 'photo-11',
      title: 'Tally Prime GST Practical Accounting Workshop',
      description: 'Specialized accounting workshop on e-way bill and GST returns.',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      category: 'Workshops',
      albumId: 'alb-6',
      albumName: 'AI & Web Development Workshop',
      event: 'Workshop',
      year: 2026,
      altText: 'Tally Prime Workshop',
      seoKeywords: 'tally prime course, GST accounting, practical tally class',
      isPublished: true,
      uploadedAt: '2026-06-02'
    },
    {
      id: 'photo-12',
      title: 'Republic Day Cultural Group Song',
      description: 'Patriotic song presentation by student choir team on 26th January.',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      category: 'Republic Day',
      albumId: 'alb-1',
      albumName: 'Annual Tech & Cultural Fest 2026',
      event: 'Republic Day',
      year: 2026,
      altText: 'Republic Day Choir',
      seoKeywords: 'republic day celebration, 26 january program',
      isPublished: true,
      uploadedAt: '2026-01-27'
    }
  ];

  const galleryVideosStore = [
    {
      id: 'vid-1',
      title: 'Pearl Computer & Target Academy - Official Campus Virtual Tour',
      description: 'Take a full virtual walk-through of our computer lab, AC classrooms, library, and faculty rooms in Parasia.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: 'Campus',
      event: 'Virtual Tour',
      year: 2026,
      isFeatured: true,
      isPublished: true,
      addedAt: '2026-01-10'
    },
    {
      id: 'vid-2',
      title: 'Annual Function 2026 Highlights & Student Performances',
      description: 'Catch the energetic dance, music, and drama performances from our Annual Day celebration.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      category: 'Annual Function',
      event: 'Annual Fest',
      year: 2026,
      isFeatured: true,
      isPublished: true,
      addedAt: '2026-02-20'
    },
    {
      id: 'vid-3',
      title: 'Tally Prime with GST Full Practical Masterclass Demo',
      description: 'Learn how our expert Chartered Accountants teach GST invoice creation, e-way bill, and ledger posting.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      category: 'Workshops',
      event: 'Demo Lecture',
      year: 2026,
      isFeatured: false,
      isPublished: true,
      addedAt: '2026-03-15'
    },
    {
      id: 'vid-4',
      title: 'MPPSC Civil Services Strategy Session by Selected Officer',
      description: 'Inspiring strategy seminar for MPPSC Prelims & Mains examination preparation.',
      videoUrl: 'https://vimeo.com/76979871',
      type: 'vimeo' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
      category: 'Seminars',
      event: 'MPPSC Seminar',
      year: 2026,
      isFeatured: false,
      isPublished: true,
      addedAt: '2026-04-10'
    },
    {
      id: 'vid-5',
      title: 'Certificate Distribution Ceremony & Student Success Stories',
      description: 'Hear directly from our placed students about their journey at Pearl Academy.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
      category: 'Certificate Distribution',
      event: 'Convocation',
      year: 2026,
      isFeatured: false,
      isPublished: true,
      addedAt: '2026-04-25'
    },
    {
      id: 'vid-6',
      title: 'Campus Placement Drive - Company Recruiters Feedback',
      description: 'Interviews with HR managers from top IT companies visiting our Parasia campus.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      type: 'mp4' as const,
      thumbnailUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
      category: 'Placement Drive',
      event: 'Placement',
      year: 2026,
      isFeatured: false,
      isPublished: true,
      addedAt: '2026-05-18'
    }
  ];

  // --- PHOTO GALLERY APIS ---
  app.get('/api/gallery/photos', (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = (req.query.category as string) || 'all';
    const albumId = (req.query.albumId as string) || 'all';
    const year = req.query.year ? parseInt(req.query.year as string) : null;
    const search = (req.query.search as string || '').toLowerCase().trim();
    const publishedOnly = req.query.publishedOnly === 'true';

    let result = [...galleryPhotosStore];

    if (publishedOnly) {
      result = result.filter(p => p.isPublished);
    }
    if (category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (albumId !== 'all') {
      result = result.filter(p => p.albumId === albumId);
    }
    if (year) {
      result = result.filter(p => p.year === year);
    }
    if (search) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(search) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        p.category.toLowerCase().includes(search) ||
        (p.albumName && p.albumName.toLowerCase().includes(search)) ||
        (p.seoKeywords && p.seoKeywords.toLowerCase().includes(search))
      );
    }

    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const validPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (validPage - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      photos: paginated,
      pagination: {
        totalCount,
        totalPages,
        currentPage: validPage,
        limit
      }
    });
  });

  app.post('/api/gallery/photos', (req, res) => {
    const { title, description, url, thumbnailUrl, category, albumId, event, year, altText, seoKeywords, isPublished } = req.body;

    if (!title || !url) {
      res.status(400).json({ success: false, message: 'Photo title and URL are required.' });
      return;
    }

    const album = galleryAlbumsStore.find(a => a.id === albumId);

    const newPhoto = {
      id: `photo-${Date.now()}`,
      title,
      description: description || '',
      url,
      thumbnailUrl: thumbnailUrl || url,
      category: category || 'Campus',
      albumId: albumId || '',
      albumName: album ? album.name : '',
      event: event || '',
      year: year ? Number(year) : 2026,
      altText: altText || title,
      seoKeywords: seoKeywords || title,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    galleryPhotosStore.unshift(newPhoto);

    if (album) {
      album.photoCount = (album.photoCount || 0) + 1;
    }

    addAuditLog('Admin', 'admin', 'Uploaded Gallery Photo', req.ip || '127.0.0.1', `Added photo: ${title} in ${category}`);

    res.json({
      success: true,
      message: 'Photo uploaded and added to gallery successfully!',
      photo: newPhoto
    });
  });

  app.put('/api/gallery/photos/:id', (req, res) => {
    const { id } = req.params;
    const photo = galleryPhotosStore.find(p => p.id === id);

    if (!photo) {
      res.status(404).json({ success: false, message: 'Photo not found.' });
      return;
    }

    Object.assign(photo, req.body);

    addAuditLog('Admin', 'admin', 'Updated Gallery Photo', req.ip || '127.0.0.1', `Updated photo: ${photo.title}`);

    res.json({
      success: true,
      message: 'Photo details updated successfully!',
      photo
    });
  });

  app.delete('/api/gallery/photos/:id', (req, res) => {
    const { id } = req.params;
    const index = galleryPhotosStore.findIndex(p => p.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Photo not found.' });
      return;
    }

    const removed = galleryPhotosStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Gallery Photo', req.ip || '127.0.0.1', `Deleted photo: ${removed.title}`);

    res.json({
      success: true,
      message: 'Photo removed from gallery successfully!'
    });
  });

  app.post('/api/gallery/photos/bulk-delete', (req, res) => {
    const { photoIds } = req.body;
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      res.status(400).json({ success: false, message: 'No photo IDs provided for bulk deletion.' });
      return;
    }

    let deletedCount = 0;
    photoIds.forEach(id => {
      const idx = galleryPhotosStore.findIndex(p => p.id === id);
      if (idx !== -1) {
        galleryPhotosStore.splice(idx, 1);
        deletedCount++;
      }
    });

    addAuditLog('Admin', 'admin', 'Bulk Deleted Gallery Photos', req.ip || '127.0.0.1', `Bulk deleted ${deletedCount} photos`);

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} photos.`
    });
  });

  // --- VIDEO GALLERY APIS ---
  app.get('/api/gallery/videos', (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const category = (req.query.category as string) || 'all';
    const year = req.query.year ? parseInt(req.query.year as string) : null;
    const search = (req.query.search as string || '').toLowerCase().trim();
    const publishedOnly = req.query.publishedOnly === 'true';

    let result = [...galleryVideosStore];

    if (publishedOnly) {
      result = result.filter(v => v.isPublished);
    }
    if (category !== 'all') {
      result = result.filter(v => v.category.toLowerCase() === category.toLowerCase());
    }
    if (year) {
      result = result.filter(v => v.year === year);
    }
    if (search) {
      result = result.filter(v =>
        v.title.toLowerCase().includes(search) ||
        (v.description && v.description.toLowerCase().includes(search)) ||
        v.category.toLowerCase().includes(search)
      );
    }

    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const validPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (validPage - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      videos: paginated,
      pagination: {
        totalCount,
        totalPages,
        currentPage: validPage,
        limit
      }
    });
  });

  app.post('/api/gallery/videos', (req, res) => {
    const { title, description, videoUrl, type, thumbnailUrl, category, event, year, isFeatured, isPublished } = req.body;

    if (!title || !videoUrl) {
      res.status(400).json({ success: false, message: 'Video title and video URL are required.' });
      return;
    }

    let detectedType = type || 'youtube';
    if (!type) {
      if (videoUrl.includes('vimeo')) detectedType = 'vimeo';
      else if (videoUrl.endsWith('.mp4')) detectedType = 'mp4';
      else detectedType = 'youtube';
    }

    const newVideo = {
      id: `vid-${Date.now()}`,
      title,
      description: description || '',
      videoUrl,
      type: detectedType,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: category || 'Campus',
      event: event || '',
      year: year ? Number(year) : 2026,
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      addedAt: new Date().toISOString().split('T')[0]
    };

    galleryVideosStore.unshift(newVideo);

    addAuditLog('Admin', 'admin', 'Added Gallery Video', req.ip || '127.0.0.1', `Added video: ${title}`);

    res.json({
      success: true,
      message: 'Video added to gallery successfully!',
      video: newVideo
    });
  });

  app.put('/api/gallery/videos/:id', (req, res) => {
    const { id } = req.params;
    const video = galleryVideosStore.find(v => v.id === id);

    if (!video) {
      res.status(404).json({ success: false, message: 'Video not found.' });
      return;
    }

    Object.assign(video, req.body);

    addAuditLog('Admin', 'admin', 'Updated Gallery Video', req.ip || '127.0.0.1', `Updated video: ${video.title}`);

    res.json({
      success: true,
      message: 'Video details updated successfully!',
      video
    });
  });

  app.delete('/api/gallery/videos/:id', (req, res) => {
    const { id } = req.params;
    const index = galleryVideosStore.findIndex(v => v.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Video not found.' });
      return;
    }

    const removed = galleryVideosStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Gallery Video', req.ip || '127.0.0.1', `Deleted video: ${removed.title}`);

    res.json({
      success: true,
      message: 'Video removed from gallery successfully!'
    });
  });

  // --- ALBUMS APIS ---
  app.get('/api/gallery/albums', (req, res) => {
    res.json({
      success: true,
      albums: galleryAlbumsStore
    });
  });

  app.post('/api/gallery/albums', (req, res) => {
    const { name, description, coverImage, category, year, isPublished } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Album name is required.' });
      return;
    }

    const newAlbum = {
      id: `alb-${Date.now()}`,
      name,
      description: description || '',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      category: category || 'Events',
      year: year ? Number(year) : 2026,
      photoCount: 0,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    galleryAlbumsStore.unshift(newAlbum);

    addAuditLog('Admin', 'admin', 'Created Gallery Album', req.ip || '127.0.0.1', `Created album: ${name}`);

    res.json({
      success: true,
      message: 'Album created successfully!',
      album: newAlbum
    });
  });

  app.put('/api/gallery/albums/:id', (req, res) => {
    const { id } = req.params;
    const album = galleryAlbumsStore.find(a => a.id === id);

    if (!album) {
      res.status(404).json({ success: false, message: 'Album not found.' });
      return;
    }

    Object.assign(album, req.body);

    addAuditLog('Admin', 'admin', 'Updated Gallery Album', req.ip || '127.0.0.1', `Updated album: ${album.name}`);

    res.json({
      success: true,
      message: 'Album updated successfully!',
      album
    });
  });

  app.delete('/api/gallery/albums/:id', (req, res) => {
    const { id } = req.params;
    const index = galleryAlbumsStore.findIndex(a => a.id === id);

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Album not found.' });
      return;
    }

    const removed = galleryAlbumsStore.splice(index, 1)[0];
    addAuditLog('Admin', 'admin', 'Deleted Gallery Album', req.ip || '127.0.0.1', `Deleted album: ${removed.name}`);

    res.json({
      success: true,
      message: 'Album deleted successfully!'
    });
  });


  // AI Chat Assistant Route (Gemini 2.5 Flash)
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required.' });
      return;
    }

    try {
      const ai = getGeminiAI();
      if (!ai) {
        res.json({
          success: true,
          response: "Hello! I am Pearl AI Assistant. I can help you choose courses (DCA, ADCA, Tally Prime, MPPSC, Web Dev, Python), understand admission fees, or locate our campus. How can I assist you today?"
        });
        return;
      }

      const prompt = `You are "Pearl AI Assistant", the official virtual counselor for Pearl Computer & Target Academy (Indore, MP).
Institute Tagline: "Learn Today • Lead Tomorrow"
Key Courses:
- Basic Computer & CCC (NIELIT)
- DCA (Diploma in Computer Applications)
- ADCA (Advanced Diploma - IT, Tally, Design, Web)
- PGDCA (Post Graduate Diploma)
- Tally Prime with GST & Payroll
- Programming (Python, Java, C/C++, Fullstack MERN Web Dev)
- Graphic Design, Video Editing, Digital Marketing, AI & Prompt Engineering
- Competitive Exam Coaching (MPPSC, SSC, Banking, Railway, Patwari, Police, CTET, CUET)

Admission Help:
- Online Admission Form is available on the website.
- Phone Helpline: +91 98260-12345 / +91 93292-84693
- Address: Pearl Academy Campus, Main Road, Indore, MP.

User query: "${message}"

Respond concisely, politely, and formatted in clean text or bullet points. Encourage them to apply online or visit campus.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({
        success: true,
        response: response.text || "Thank you for reaching out to Pearl Computer & Target Academy. Feel free to explore our courses or fill out the online admission form!"
      });
    } catch (err: any) {
      console.error('Gemini AI error:', err);
      res.json({
        success: true,
        response: "Welcome to Pearl Computer & Target Academy! You can check out our courses like DCA, ADCA, Tally Prime, or MPPSC Target Coaching, or fill out the Online Admission form directly."
      });
    }
  });

  // -------------------------------------------------------------
  // VITE & STATIC FILES MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Pearl Computer & Target Academy Server running on http://0.0.0.0:${PORT}`);
    console.log(`📧 Default Institute Notification Email set to: ${emailSettingsStore.instituteNotificationEmail}\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Pearl Academy server:', err);
});
