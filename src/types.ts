export type QuickNavStatus = 'Published' | 'Unpublished' | 'Draft';

export interface QuickNavItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: string;
  color?: string;
  textColor?: string;
  bgLight?: string;
  targetTab: string;
  isExternal?: boolean;
  externalUrl?: string;
  displayOrder: number;
  status: QuickNavStatus;
  showDesktop: boolean;
  showMobile: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'student' | 'faculty' | 'admin' | 'superadmin' | 'center';

export interface CenterPermissions {
  canStudentAdmissions: boolean;
  canStudentManagement: boolean;
  canStudentLoginCreation: boolean;
  canCourseEnrollment: boolean;
  canBatchAssignment: boolean;
  canAttendanceManagement: boolean;
  canFeeCollection: boolean;
  canFeeReceiptGeneration: boolean;
  canStudyMaterialUpload: boolean;
  canNotices: boolean;
  canGalleryView: boolean;
  canReportsView: boolean;
  canStudentResults: boolean;
  canCertificateVerification: boolean;
  canStudentIdCardGen: boolean;
}

export interface CenterAccount {
  id: string;
  centerCode: string;
  centerName: string;
  username: string;
  email: string;
  mobile: string;
  passwordHash?: string;
  headPersonName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  admissionLimit: number;
  usedAdmissionsCount: number;
  storageLimitGb: number;
  usedStorageMb: number;
  assignedCourses: string[];
  assignedBatches: string[];
  permissions: CenterPermissions;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  loginCount?: number;
  twoFactorEnabled?: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  studentId?: string;
  employeeId?: string;
  centerId?: string;
  centerCode?: string;
  centerName?: string;
  centerPermissions?: CenterPermissions;
  avatar?: string;
  isFirstLogin?: boolean;
  coursesAssigned?: string[];
  courseApplied?: string;
  branch?: string;
}

export type CourseStatus = 'Draft' | 'Published' | 'Unpublished' | 'Archived';
export type CourseType = 'Online' | 'Offline' | 'Hybrid';

export interface CourseSEO {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage?: string;
  imageAltText?: string;
  schemaMarkup?: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  subCategory?: string;
  type?: CourseType;
  description: string;
  fullDescription?: string;
  duration: string;
  totalHours?: string;
  fees: number;
  discountFees?: number;
  registrationFee?: number;
  installmentOptions?: string;
  eligibility?: string;
  minQualification?: string;
  language?: string;
  batchName?: string;
  batchTiming?: string;
  startDate?: string;
  endDate?: string;
  syllabus: string[];
  learningOutcomes?: string[];
  trainer: string;
  certificateProvided: string;
  placementAssistance?: boolean;
  featured?: boolean;
  popular?: boolean;
  status?: CourseStatus;
  courseImage?: string;
  courseBanner?: string;
  demoVideoUrl?: string;
  brochureUrl?: string;
  iconName?: string;
  upcomingBatchDate?: string;
  seo?: CourseSEO;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  fullAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  qualification: string;
  courseAppliedFor: string;
  preferredBatch: string;
  photoUrl?: string;
  aadhaarUrl?: string;
  signatureUrl?: string;
  additionalDocsUrl?: string;
  paymentMode: 'Online UPI/Card' | 'Cash at Center' | 'Installment Plan';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: string;
  applicantIp?: string;
  remarks?: string;
  generatedStudentId?: string;
}

export interface StudentAccount {
  id: string;
  studentId: string;
  regNumber: string;
  rollNumber: string;
  username: string;
  name: string;
  email: string;
  mobile: string;
  course: string;
  batch: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  createdDate: string;
  tempPassword?: string;
  isFirstLogin: boolean;
  attendancePercentage: number;
  feeTotal: number;
  feePaid: number;
  qrCodeData: string;
  avatar?: string;
  fatherName?: string;
  idCardStatus?: 'Active' | 'Deactivated' | 'Lost/Reissued' | 'Expired';
  idCardIssueDate?: string;
  idCardValidTill?: string;
  reissueCount?: number;
  emergencyContact?: string;
  bloodGroup?: string;
  dob?: string;
}

export interface FacultyAccount {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  mobile: string;
  email: string;
  username: string;
  passwordHash?: string;
  branch: string;
  subjects: string[];
  coursesAssigned: string[];
  status: 'Active' | 'Inactive';
  joiningDate: string;
  profilePhoto?: string;
  lastLogin?: string;
  forcePasswordChange?: boolean;
  passwordLastChanged?: string;
  twoFactorEnabled?: boolean;
  loginAttempts?: number;
  isLocked?: boolean;
  loginHistory?: {
    id: string;
    timestamp: string;
    ip: string;
    device: string;
    success: boolean;
  }[];
  activityLogs?: {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    ip: string;
  }[];
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentName: string;
  fatherName: string;
  courseName: string;
  issueDate: string;
  grade: string;
  duration: string;
  qrCodeUrl: string;
  centerCode: string;
  status: 'Valid' | 'Revoked';
}

export interface ResultRecord {
  id: string;
  rollNumber: string;
  regNumber: string;
  studentName: string;
  course: string;
  examName: string;
  examDate: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  status: 'Pass' | 'Fail';
  subjectMarks: { subject: string; maxMarks: number; marksObtained: number }[];
}

export interface OnlineTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface OnlineTest {
  id: string;
  title: string;
  courseCategory: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: OnlineTestQuestion[];
}

export interface TestAttemptResult {
  id: string;
  testId: string;
  testTitle: string;
  studentName: string;
  rollNumber: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'Pass' | 'Fail';
  date: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  senderName: string;
  replyToEmail: string;
  instituteNotificationEmail: string;
  autoEmailNotification: boolean;
  autoSmsNotification: boolean;
  autoWhatsappNotification: boolean;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  category: 'General' | 'Exam' | 'Holiday' | 'Placement' | 'Admission';
  content: string;
  important: boolean;
}

export interface BlogArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface PlacementPartner {
  id: string;
  companyName: string;
  logo: string;
  packageRange: string;
  placedCount: number;
}

export interface StudentReview {
  id: string;
  studentName: string;
  course: string;
  batchYear: string;
  placedAt?: string;
  package?: string;
  review: string;
  rating: number;
  photo: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  ip: string;
  details: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMode: string;
  transactionId: string;
  date: string;
  courseName: string;
  remarks: string;
  status?: 'Completed' | 'Pending' | 'Failed';
}

export interface FeePaymentRecord {
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
}

export interface StudentAssignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  assignedBy: string;
  description: string;
  status?: 'Pending' | 'Submitted' | 'Evaluated';
}

export interface StudyNote {
  id: string;
  title: string;
  course: string;
  subject: string;
  fileSize: string;
  uploadedDate: string;
  uploadedBy: string;
  downloadUrl: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category: string;
  albumId?: string;
  albumName?: string;
  event?: string;
  year: number;
  altText?: string;
  seoKeywords?: string;
  isPublished: boolean;
  uploadedAt: string;
}

export interface GalleryVideo {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  type: 'youtube' | 'vimeo' | 'mp4';
  thumbnailUrl: string;
  category: string;
  event?: string;
  year: number;
  isFeatured?: boolean;
  isPublished: boolean;
  addedAt: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  coverImage: string;
  category: string;
  year: number;
  photoCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface DirectorSEO {
  seoTitle: string;
  metaDescription: string;
  metaKeywords: string;
  slug: string;
  ogImage?: string;
  altText?: string;
}

export interface DirectorSocialLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface DirectorDeskData {
  id: string;
  photoUrl: string;
  name: string;
  designation: string;
  qualification: string;
  welcomeMessage: string;
  vision: string;
  mission: string;
  inspirationalQuote: string;
  signatureUrl?: string;
  email?: string;
  phone?: string;
  socialLinks?: DirectorSocialLinks;
  pdfMessageUrl?: string;
  isPublished: boolean;
  seo?: DirectorSEO;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DirectorVersionHistory {
  id: string;
  timestamp: string;
  updatedBy: string;
  note?: string;
  data: DirectorDeskData;
}

