import {
  Course,
  AdmissionApplication,
  StudentAccount,
  FacultyAccount,
  CertificateRecord,
  ResultRecord,
  OnlineTest,
  EmailSettings,
  Notice,
  BlogArticle,
  PlacementPartner,
  StudentReview,
  FeeReceipt,
  StudentAssignment,
  StudyNote
} from '../types';

export const initialEmailSettings: EmailSettings = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUsername: 'admissions@pearlacademy.edu.in',
  smtpPassword: '••••••••••••',
  senderName: 'Pearl Computer & Target Academy',
  replyToEmail: 'info@pearlacademy.edu.in',
  instituteNotificationEmail: 'bisan9329284693@gmail.com',
  autoEmailNotification: true,
  autoSmsNotification: true,
  autoWhatsappNotification: true,
};

export const sampleCourses: Course[] = [
  {
    id: 'c1',
    code: 'DCA-01',
    title: 'DCA (Diploma in Computer Applications)',
    category: 'Diploma',
    description: 'Complete 1-year basic to advanced diploma covering Windows, MS Office, Internet, Web Browsing, Multimedia & Financial Accounting.',
    duration: '1 Year (6 Months Fast-track)',
    fees: 7500,
    discountFees: 5999,
    syllabus: [
      'Fundamentals of Computer & Operating Systems',
      'MS Office Suite (Word, Excel, PowerPoint, Access)',
      'Internet, E-Governance & Cyber Security Basics',
      'Database Management Systems (DBMS)',
      'DTP & Image Editing Fundamentals',
      'Project Work & Practical Exam'
    ],
    trainer: 'Er. R. K. Sharma (M.Tech, 12+ Yrs Exp)',
    certificateProvided: 'ISO 9001:2015 & Govt. Recognized Certificate',
    popular: true,
    upcomingBatchDate: '2026-08-10',
    demoVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'c2',
    code: 'ADCA-02',
    title: 'ADCA (Advanced Diploma in Computer Applications)',
    category: 'Diploma',
    description: 'Comprehensive 1-Year Master Diploma including Office Automation, Graphic Design, Web Design, C/C++ Programming & Tally Prime.',
    duration: '1 Year',
    fees: 11500,
    discountFees: 8999,
    syllabus: [
      'Advanced MS Excel with VBA Macros',
      'Graphic Design (Photoshop & CorelDraw)',
      'Web Technologies (HTML, CSS, JavaScript Basics)',
      'Programming Essentials in C & C++',
      'Tally Prime with GST & e-Way Bill',
      'Live Capstone Project & Internship Prep'
    ],
    trainer: 'S. P. Verma (MCA, Senior Technical Lead)',
    certificateProvided: 'National Skill Development Govt. Certified',
    popular: true,
    upcomingBatchDate: '2026-08-12'
  },
  {
    id: 'c3',
    code: 'TALLY-GST',
    title: 'Tally Prime with GST & Payroll',
    category: 'Accounting',
    description: 'Become a Certified Industrial Accountant with hands-on practice in GST Returns, e-Invoicing, TDS, Payroll, and Balance Sheet Finalization.',
    duration: '3 Months',
    fees: 5500,
    discountFees: 4499,
    syllabus: [
      'Company Creation & Ledger Grouping',
      'Voucher Entry & Inventory Management',
      'GST Accounting (CGST, SGST, IGST Setup)',
      'GSTR-1, GSTR-3B & e-Way Bill Generation',
      'Payroll Management & Statutory Taxes (PF/ESI)',
      'Audit & Final Financial Statements'
    ],
    trainer: 'CA Priya Agrawal (Chartered Accountant)',
    certificateProvided: 'Tally Authorized Certification',
    popular: true,
    upcomingBatchDate: '2026-08-08'
  },
  {
    id: 'c4',
    code: 'PGDCA-03',
    title: 'PGDCA (Post Graduate Diploma in Computer Applications)',
    category: 'Diploma',
    description: 'Post-graduate level computer application program covering Software Engineering, Python, RDBMS, Networks, and System Analysis.',
    duration: '1 Year (University Recognized)',
    fees: 14000,
    discountFees: 11999,
    syllabus: [
      'Computer Fundamentals & Architecture',
      'Object Oriented Programming with C++ & Python',
      'Relational Database Management (SQL/Oracle)',
      'System Analysis & Software Engineering',
      'Data Communication & Computer Networks',
      'Major University Project Work'
    ],
    trainer: 'Dr. Amit Trivedi (Ph.D Computer Science)',
    certificateProvided: 'UGC Approved University Diploma',
    popular: false,
    upcomingBatchDate: '2026-08-15'
  },
  {
    id: 'c5',
    code: 'CCC-GOVT',
    title: 'CCC (Course on Computer Concepts) - NIELIT',
    category: 'Basic Computer',
    description: 'Govt mandatory computer course for MP Govt jobs, SSC, Railway, Patwari, and clerical exams.',
    duration: '2 Months',
    fees: 2500,
    discountFees: 1999,
    syllabus: [
      'GUI Operating System & Desktop Navigation',
      'LibreOffice Writer, Calc, & Impress',
      'Internet, WWW & Web Browsers',
      'Digital Financial Services & UPI Security',
      'Overview of Cyber Security & IT Act',
      'Online Mock Test Drills'
    ],
    trainer: 'Neeta Chouhan (Certified NIELIT Instructor)',
    certificateProvided: 'Direct NIELIT Govt Certificate',
    popular: true,
    upcomingBatchDate: '2026-08-05'
  },
  {
    id: 'c6',
    code: 'O-LEVEL',
    title: 'NIELIT O Level Diploma',
    category: 'Diploma',
    description: 'Equivalent to Diploma in CS/IT. Govt benchmark qualification for Assistant Programmer & Govt Computer Operator positions.',
    duration: '1 Year',
    fees: 15000,
    discountFees: 12500,
    syllabus: [
      'M1-R5: IT Tools & Network Basics',
      'M2-R5: Web Designing & Publishing',
      'M3-R5: Programming & Problem Solving Through Python',
      'M4-R5: Internet of Things (IoT) & Applications',
      'Practical Exams & Project Submission'
    ],
    trainer: 'Er. R. K. Sharma & Team',
    certificateProvided: 'NIELIT Govt. O Level Certificate',
    popular: true,
    upcomingBatchDate: '2026-08-15'
  },
  {
    id: 'c7',
    code: 'PYTHON-AI',
    title: 'Python Programming & AI/ML Basics',
    category: 'Programming',
    description: 'Master Python from syntax fundamentals to Data Structures, OOP, NumPy, Pandas, API Integration & Prompt Engineering.',
    duration: '4 Months',
    fees: 8500,
    discountFees: 6999,
    syllabus: [
      'Python Syntax, Control Flow & Data Types',
      'Functions, Modules & Object-Oriented Programming',
      'File Handling & Exception Management',
      'Data Analysis with NumPy & Pandas',
      'Intro to Machine Learning & Scikit-Learn',
      'Building AI Chatbots & Prompt Engineering'
    ],
    trainer: 'Vikram Rajput (Senior AI Architect)',
    certificateProvided: 'Global Industry Standard Certification',
    popular: true,
    upcomingBatchDate: '2026-08-12'
  },
  {
    id: 'c8',
    code: 'FULLSTACK-WEB',
    title: 'Full Stack Web Development (MERN / React & Node)',
    category: 'Programming',
    description: 'Build modern responsive web apps using HTML5, CSS3, Tailwind CSS, JavaScript ES6+, React, Node.js, Express & MongoDB/SQL.',
    duration: '6 Months',
    fees: 18000,
    discountFees: 13999,
    syllabus: [
      'HTML5, CSS3, Modern Flexbox & Grid',
      'Tailwind CSS & Responsive UI Systems',
      'JavaScript ES6+, Async/Await & APIs',
      'React.js, Hooks, State Management & Router',
      'Node.js, Express Server & REST APIs',
      'Database Integration (MongoDB & PostgreSQL)',
      'Git, GitHub & Cloud Deployment'
    ],
    trainer: 'Alok Saxena (Ex-MNC Senior Fullstack Engineer)',
    certificateProvided: 'Full Stack Web Developer Certificate',
    popular: true,
    upcomingBatchDate: '2026-08-10'
  },
  {
    id: 'c9',
    code: 'GRAPHIC-DESIGN',
    title: 'Graphic Design & Video Editing Masterclass',
    category: 'Design & Marketing',
    description: 'Learn Adobe Photoshop, Illustrator, CorelDraw, and Premiere Pro to create logos, social media posters, banners & video Reels.',
    duration: '4 Months',
    fees: 9500,
    discountFees: 7499,
    syllabus: [
      'Design Principles, Color Theory & Typography',
      'Adobe Photoshop (Photo Retouching & Banner Design)',
      'Adobe Illustrator (Vector Logo & Branding)',
      'CorelDraw (Print Media, Flex & Pamphlets)',
      'Premiere Pro Video Editing & Motion Graphics',
      'Portfolio Building & Freelancing Guide'
    ],
    trainer: 'Kavita Joshi (Creative Director)',
    certificateProvided: 'Professional Graphic Designer Certificate',
    popular: false,
    upcomingBatchDate: '2026-08-14'
  },
  {
    id: 'c10',
    code: 'DIGITAL-MKT',
    title: 'Digital Marketing, SEO & Social Media Ads',
    category: 'Design & Marketing',
    description: 'Comprehensive marketing course covering SEO, Google Ads, Meta Ads (FB/IG), Content Marketing, Email Marketing & AI Tools.',
    duration: '3 Months',
    fees: 8000,
    discountFees: 6499,
    syllabus: [
      'Search Engine Optimization (On-Page & Off-Page SEO)',
      'Google Pay-Per-Click (PPC) & Display Ads',
      'Social Media Marketing (Meta Ads & Instagram Reels)',
      'Content Marketing & ChatGPT Strategy',
      'Google Analytics 4 & Search Console',
      'Live Ad Campaign Budget Execution'
    ],
    trainer: 'Rishi Mehta (Digital Strategist)',
    certificateProvided: 'Certified Digital Marketing Specialist',
    popular: true,
    upcomingBatchDate: '2026-08-11'
  },
  {
    id: 'c11',
    code: 'AI-PROMPT',
    title: 'AI & Prompt Engineering Masterclass',
    category: 'AI & Analytics',
    description: 'Learn to leverage ChatGPT, Claude, Gemini, Midjourney & Automation Tools to boost productivity in coding, writing & business.',
    duration: '1.5 Months',
    fees: 4500,
    discountFees: 3499,
    syllabus: [
      'Foundations of LLMs & Generative AI',
      'Advanced Prompt Engineering Techniques',
      'AI for Content, Copywriting & Marketing',
      'AI for Developers & Code Generation',
      'Automating Workflows with Zapier & Make',
      'Ethical AI & Future Proofing Careers'
    ],
    trainer: 'Vikram Rajput & AI Lab Team',
    certificateProvided: 'AI Prompt Engineer Certificate',
    popular: true,
    upcomingBatchDate: '2026-08-08'
  },
  {
    id: 'c12',
    code: 'MPPSC-TARGET',
    title: 'MPPSC Pre + Mains Foundation Batch',
    category: 'Competitive Exams',
    description: 'Comprehensive civil services preparation for MPPSC including MP GK, History, Geography, Polity, Science, Ethics, Essay & Answer Writing.',
    duration: '1 Year',
    fees: 25000,
    discountFees: 19999,
    syllabus: [
      'MP Special Knowledge, History & Heritage',
      'Indian History, Geography & Economy',
      'Indian Constitution & Governance',
      'General Science, Technology & Environment',
      'Mains Answer Writing & Daily Test Drills',
      'Interview Preparation & Mock Panels'
    ],
    trainer: 'Target Academy Core Advisory Panel',
    certificateProvided: 'Target Academy Competitive Foundation Certification',
    popular: true,
    upcomingBatchDate: '2026-08-16'
  },
  {
    id: 'c13',
    code: 'SSC-BANK-RLY',
    title: 'SSC, Banking, Railway & Police Integrated Batch',
    category: 'Competitive Exams',
    description: 'All-in-one preparation for SSC CGL, CHSL, IBPS PO/Clerk, SBI, Railway NTPC, Patwari & State Police Constable/SI exams.',
    duration: '8 Months',
    fees: 16000,
    discountFees: 12999,
    syllabus: [
      'Quantitative Aptitude & Vedic Math Tricks',
      'Reasoning Ability & Analytical Thinking',
      'General English & Grammar Rules',
      'General Awareness & Current Affairs',
      'Computer Knowledge & Speed Typing',
      'Online Speed Tests & PYQ Solutions'
    ],
    trainer: 'S. K. Pandey (Maths & Aptitude Specialist)',
    certificateProvided: 'Course Completion & Speed Test Badge',
    popular: true,
    upcomingBatchDate: '2026-08-10'
  },
  {
    id: 'c14',
    code: 'ENGLISH-TYPING',
    title: 'Spoken English & Hindi/English Typing Speed',
    category: 'Language & Typing',
    description: 'Master fluent spoken English, personality development, and reach 40+ WPM in Hindi (Mangal/Kruti Dev) & English typing for CPCT/Patwari.',
    duration: '3 Months',
    fees: 3500,
    discountFees: 2499,
    syllabus: [
      'English Grammar, Vocabulary & Accent Training',
      'Group Discussions, Public Speaking & Interviews',
      'English Touch Typing Techniques (40+ WPM)',
      'Hindi Typing in Mangal Font & Kruti Dev',
      'CPCT Mock Typing Speed Diagnostics'
    ],
    trainer: 'Mrs. Anjali Rathore (Communication Expert)',
    certificateProvided: 'Certificate in Professional Communication & Typing',
    popular: false,
    upcomingBatchDate: '2026-08-07'
  }
];

export const sampleApplications: AdmissionApplication[] = [
  {
    id: 'app-001',
    applicationNumber: 'PCTA-2026-8491',
    studentName: 'Rahul Sharma',
    fatherName: 'Manoj Sharma',
    motherName: 'Sunita Sharma',
    dob: '2004-05-14',
    gender: 'Male',
    mobileNumber: '9826012345',
    whatsappNumber: '9826012345',
    email: 'rahul.sharma@example.com',
    fullAddress: '102, Scheme No 54, Near Vijay Nagar',
    state: 'Madhya Pradesh',
    district: 'Indore',
    city: 'Indore',
    pinCode: '452010',
    qualification: '12th Pass (PCM)',
    courseAppliedFor: 'ADCA (Advanced Diploma in Computer Applications)',
    preferredBatch: 'Morning 08:00 AM - 10:00 AM',
    paymentMode: 'Online UPI/Card',
    paymentStatus: 'Paid',
    status: 'approved',
    submissionDate: '2026-08-01 10:15 AM',
    applicantIp: '157.34.12.98',
    remarks: 'Approved by Admin. Auto-generated student account.',
    generatedStudentId: 'STU-2026-101'
  },
  {
    id: 'app-002',
    applicationNumber: 'PCTA-2026-8492',
    studentName: 'Priya Patel',
    fatherName: 'Ramesh Patel',
    motherName: 'Kamla Patel',
    dob: '2003-11-20',
    gender: 'Female',
    mobileNumber: '9425098765',
    whatsappNumber: '9425098765',
    email: 'priya.patel@example.com',
    fullAddress: '45, MG Road, Near Bus Stand',
    state: 'Madhya Pradesh',
    district: 'Ujjain',
    city: 'Ujjain',
    pinCode: '456001',
    qualification: 'Graduation (B.Com)',
    courseAppliedFor: 'Tally Prime with GST & Payroll',
    preferredBatch: 'Evening 04:00 PM - 06:00 PM',
    paymentMode: 'Cash at Center',
    paymentStatus: 'Pending',
    status: 'pending',
    submissionDate: '2026-08-01 11:30 AM',
    applicantIp: '103.21.126.4',
    remarks: 'Document verification pending at center.'
  }
];

export const sampleStudents: StudentAccount[] = [
  {
    id: 's-101',
    studentId: 'STU-2026-101',
    regNumber: 'REG/2026/0101',
    rollNumber: 'PCTA2026101',
    username: 'rahul9826',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '9826012345',
    course: 'ADCA (Advanced Diploma in Computer Applications)',
    batch: 'Morning 08:00 AM - 10:00 AM',
    status: 'Active',
    createdDate: '2026-08-01',
    tempPassword: 'Pass@2026#Rahul',
    isFirstLogin: false,
    attendancePercentage: 92,
    feeTotal: 8999,
    feePaid: 5000,
    qrCodeData: 'https://pearlacademy.edu.in/verify/STU-2026-101',
    fatherName: 'Manoj Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 's-102',
    studentId: 'STU-2026-102',
    regNumber: 'REG/2026/0102',
    rollNumber: 'PCTA2026102',
    username: 'pooja9111',
    name: 'Pooja Vishwakarma',
    email: 'pooja.v@example.com',
    mobile: '9111223344',
    course: 'Python Programming & AI/ML Basics',
    batch: 'Evening 05:00 PM - 07:00 PM',
    status: 'Active',
    createdDate: '2026-07-25',
    tempPassword: 'Pooja@1234#Pass',
    isFirstLogin: false,
    attendancePercentage: 96,
    feeTotal: 6999,
    feePaid: 6999,
    qrCodeData: 'https://pearlacademy.edu.in/verify/STU-2026-102',
    fatherName: 'Rajesh Vishwakarma'
  }
];

export const sampleFaculty: FacultyAccount[] = [
  {
    id: 'f-201',
    employeeId: 'EMP-FAC-01',
    name: 'Er. R. K. Sharma',
    designation: 'Senior Technical Director & HOD',
    department: 'Computer Applications & Programming',
    mobile: '9826123456',
    email: 'rk.sharma@pearlacademy.edu.in',
    username: 'rksharma',
    branch: 'Main Branch - Tower Square',
    subjects: ['Python Programming', 'C/C++', 'DCA Modules', 'O Level M1-R5'],
    coursesAssigned: ['DCA (Diploma in Computer Applications)', 'Python Programming & AI/ML Basics'],
    status: 'Active',
    joiningDate: '2018-04-10',
    profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    forcePasswordChange: false,
    passwordLastChanged: '2026-07-01',
    twoFactorEnabled: false,
    loginAttempts: 0,
    isLocked: false,
    loginHistory: [
      {
        id: 'lh-1',
        timestamp: '2026-08-01 09:10 AM',
        ip: '157.34.12.98',
        device: 'Chrome 127.0 (Windows 11)',
        success: true
      },
      {
        id: 'lh-2',
        timestamp: '2026-07-31 04:30 PM',
        ip: '157.34.12.98',
        device: 'Chrome 127.0 (Windows 11)',
        success: true
      }
    ],
    activityLogs: [
      {
        id: 'al-1',
        timestamp: '2026-08-01 09:12 AM',
        action: 'Attendance Recorded',
        details: 'Marked DCA Morning Batch attendance (28 students)',
        ip: '157.34.12.98'
      },
      {
        id: 'al-2',
        timestamp: '2026-07-30 02:15 PM',
        action: 'Study Note Uploaded',
        details: 'Uploaded "Python ООP & Exception Handling.pdf"',
        ip: '157.34.12.98'
      }
    ]
  },
  {
    id: 'f-202',
    employeeId: 'EMP-FAC-02',
    name: 'CA Priya Agrawal',
    designation: 'Lead Accounting Instructor',
    department: 'Financial Accounting & Tally',
    mobile: '9826234567',
    email: 'priya.ca@pearlacademy.edu.in',
    username: 'priya.ca',
    branch: 'Main Branch - Tower Square',
    subjects: ['Tally Prime', 'GST Returns', 'Payroll & e-Way Bill'],
    coursesAssigned: ['Tally Prime with GST & Payroll'],
    status: 'Active',
    joiningDate: '2020-01-15',
    forcePasswordChange: false,
    passwordLastChanged: '2026-06-15',
    twoFactorEnabled: false,
    loginAttempts: 0,
    isLocked: false,
    loginHistory: [
      {
        id: 'lh-3',
        timestamp: '2026-08-01 08:45 AM',
        ip: '103.21.126.8',
        device: 'Safari 17.5 (macOS)',
        success: true
      }
    ],
    activityLogs: [
      {
        id: 'al-3',
        timestamp: '2026-08-01 08:50 AM',
        action: 'Marks Entered',
        details: 'Entered Tally Prime GST Midterm Marks',
        ip: '103.21.126.8'
      }
    ]
  }
];

export const sampleCertificates: CertificateRecord[] = [
  {
    id: 'cert-1',
    certificateNumber: 'PCTA-CERT-2026-0089',
    studentName: 'Amitabh Sen',
    fatherName: 'Suresh Sen',
    courseName: 'ADCA (Advanced Diploma in Computer Applications)',
    issueDate: '2026-06-28',
    grade: 'A+ (Distinction)',
    duration: '1 Year (1200 Hours)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PCTA-CERT-2026-0089',
    centerCode: 'PCTA-IND-01',
    status: 'Valid'
  },
  {
    id: 'cert-2',
    certificateNumber: 'PCTA-CERT-2026-0090',
    studentName: 'Sneha Kulkarni',
    fatherName: 'Vijay Kulkarni',
    courseName: 'Tally Prime with GST & Payroll',
    issueDate: '2026-07-15',
    grade: 'A Grade',
    duration: '3 Months (180 Hours)',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PCTA-CERT-2026-0090',
    centerCode: 'PCTA-IND-01',
    status: 'Valid'
  }
];

export const sampleResults: ResultRecord[] = [
  {
    id: 'res-1',
    rollNumber: 'PCTA2026101',
    regNumber: 'REG/2026/0101',
    studentName: 'Rahul Sharma',
    course: 'ADCA (Advanced Diploma in Computer Applications)',
    examName: 'Mid-Term Semester Assessment 2026',
    examDate: '2026-07-20',
    totalMarks: 300,
    obtainedMarks: 268,
    percentage: 89.3,
    grade: 'A+',
    status: 'Pass',
    subjectMarks: [
      { subject: 'MS Office & Automation', maxMarks: 100, marksObtained: 92 },
      { subject: 'Graphic Design Basics', maxMarks: 100, marksObtained: 88 },
      { subject: 'Tally & Accounting', maxMarks: 100, marksObtained: 88 }
    ]
  },
  {
    id: 'res-2',
    rollNumber: 'PCTA2026102',
    regNumber: 'REG/2026/0102',
    studentName: 'Pooja Vishwakarma',
    course: 'Python Programming & AI/ML Basics',
    examName: 'Python Mastery & Logic Drill',
    examDate: '2026-07-25',
    totalMarks: 100,
    obtainedMarks: 95,
    percentage: 95.0,
    grade: 'O (Outstanding)',
    status: 'Pass',
    subjectMarks: [
      { subject: 'Python Core & Data Structures', maxMarks: 50, marksObtained: 48 },
      { subject: 'NumPy & Pandas Analytics', maxMarks: 50, marksObtained: 47 }
    ]
  }
];

export const sampleMockTests: OnlineTest[] = [
  {
    id: 'test-ccc-01',
    title: 'CCC NIELIT Practice Test - Computer Fundamentals',
    courseCategory: 'Basic Computer',
    durationMinutes: 15,
    totalMarks: 10,
    passingMarks: 6,
    questions: [
      {
        id: 'q1',
        question: 'What is the full form of CPU in computers?',
        options: ['Central Processing Unit', 'Central Performance Utility', 'Control Processing Unit', 'Central Power Unit'],
        correctAnswer: 0,
        explanation: 'CPU stands for Central Processing Unit, often called the brain of the computer.'
      },
      {
        id: 'q2',
        question: 'Which of the following is an open-source operating system?',
        options: ['Windows 11', 'macOS', 'Linux', 'MS-DOS'],
        correctAnswer: 2,
        explanation: 'Linux is a widely used free and open-source operating system.'
      },
      {
        id: 'q3',
        question: 'In LibreOffice Calc, what is the default file extension for spreadsheets?',
        options: ['.ods', '.xlsx', '.doc', '.pdf'],
        correctAnswer: 0,
        explanation: '.ods stands for OpenDocument Spreadsheet used natively in LibreOffice Calc.'
      },
      {
        id: 'q4',
        question: 'What does UPI stand for in digital payment services?',
        options: ['Unified Payments Interface', 'Universal Payment Integration', 'Unique Person Identifier', 'United Payment System'],
        correctAnswer: 0,
        explanation: 'UPI stands for Unified Payments Interface developed by NPCI.'
      },
      {
        id: 'q5',
        question: 'Which shortcut key is used to Undo an action in Windows?',
        options: ['Ctrl + C', 'Ctrl + Z', 'Ctrl + Y', 'Ctrl + X'],
        correctAnswer: 1,
        explanation: 'Ctrl + Z reverses the most recent action in Windows applications.'
      }
    ]
  },
  {
    id: 'test-tally-01',
    title: 'Tally Prime & GST Accounting Assessment',
    courseCategory: 'Accounting',
    durationMinutes: 10,
    totalMarks: 10,
    passingMarks: 6,
    questions: [
      {
        id: 'tq1',
        question: 'Which key is used to change Current Period in Tally Prime?',
        options: ['Alt + F2', 'F2', 'F11', 'F12'],
        correctAnswer: 0,
        explanation: 'Alt + F2 opens the Change Period dialog in Tally.'
      },
      {
        id: 'tq2',
        question: 'What voucher type is used for Cash Deposited into Bank?',
        options: ['Payment', 'Contra', 'Receipt', 'Journal'],
        correctAnswer: 1,
        explanation: 'Contra Voucher (F4) is used for cash-bank or bank-bank transfers.'
      },
      {
        id: 'tq3',
        question: 'Which tax is levied on Intra-State sale of goods under GST?',
        options: ['IGST only', 'CGST + SGST', 'Customs Duty', 'STT'],
        correctAnswer: 1,
        explanation: 'Intra-state sales are subject to Central GST (CGST) and State GST (SGST) equally.'
      }
    ]
  }
];

export const sampleNotices: Notice[] = [
  {
    id: 'n1',
    title: 'New Morning Batches Starting for DCA, ADCA & Tally Prime',
    date: '2026-08-01',
    category: 'Admission',
    content: 'Fresh morning batches commencing from August 10th. Register early to secure 20% early-bird fee waiver.',
    important: true
  },
  {
    id: 'n2',
    title: 'CCC NIELIT Online Exam Form Submission Extended',
    date: '2026-07-28',
    category: 'Exam',
    content: 'All enrolled CCC students must submit their online exam verification forms at the front desk before August 5th.',
    important: true
  },
  {
    id: 'n3',
    title: 'MPPSC Pre Strategy & Answer Writing Workshop this Sunday',
    date: '2026-07-25',
    category: 'General',
    content: 'Free seminar and mentorship session by selected MPPSC officers at Pearl Target Academy Main Auditorium.',
    important: false
  }
];

export const sampleBlogs: BlogArticle[] = [
  {
    id: 'b1',
    title: 'Top 5 Career Scope after DCA & ADCA in 2026',
    category: 'Career Guide',
    author: 'Pearl Technical Team',
    date: '2026-07-29',
    readTime: '4 min read',
    excerpt: 'Explore lucrative career options from Data Entry Specialist, Office Administrator, Graphic Designer to Junior Web Developer after completing ADCA.',
    content: 'Computers have become the backbone of modern industries. Having an ADCA or DCA diploma opens doors in government offices, private IT firms, banking centers, and digital agencies...',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'
  },
  {
    id: 'b2',
    title: 'Why Tally Prime with GST is Mandatory for Commerce Students',
    category: 'Accounting Trends',
    author: 'CA Priya Agrawal',
    date: '2026-07-22',
    readTime: '5 min read',
    excerpt: 'Discover why top companies in Indore and MP prefer candidates with practical GST filing and e-invoicing skills in Tally Prime.',
    content: 'GST regulations update constantly. Knowing standard book-keeping is no longer enough. Learning automated tax calculation, GSTR-1 preparation, and payroll in Tally Prime is crucial...',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
  }
];

export const samplePlacements: PlacementPartner[] = [
  { id: 'p1', companyName: 'TCS - Tata Consultancy Services', logo: 'TCS', packageRange: '3.5 - 6.0 LPA', placedCount: 142 },
  { id: 'p2', companyName: 'Infosys BPM', logo: 'INFOSYS', packageRange: '3.2 - 5.5 LPA', placedCount: 98 },
  { id: 'p3', companyName: 'HDFC Bank', logo: 'HDFC', packageRange: '3.0 - 4.8 LPA', placedCount: 215 },
  { id: 'p4', companyName: 'Wipro Technologies', logo: 'WIPRO', packageRange: '3.6 - 5.8 LPA', placedCount: 87 },
  { id: 'p5', companyName: 'Sutherland Global', logo: 'SUTHERLAND', packageRange: '2.8 - 4.2 LPA', placedCount: 176 },
  { id: 'p6', companyName: 'Dainik Bhaskar Digital', logo: 'BHASKAR', packageRange: '2.5 - 4.5 LPA', placedCount: 64 }
];

export const sampleReviews: StudentReview[] = [
  {
    id: 'r1',
    studentName: 'Shubham Tiwari',
    course: 'ADCA & Graphic Design',
    batchYear: '2025 Batch',
    placedAt: 'Design Studio Indore',
    package: '4.2 LPA',
    review: 'Pearl Computer Academy changed my career path! The faculty is super supportive, labs are high-tech, and the practical project experience helped me clear my interview on the first attempt.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120'
  },
  {
    id: 'r2',
    studentName: 'Anjali Sharma',
    course: 'Tally Prime with GST',
    batchYear: '2025 Batch',
    placedAt: 'National Tax Consultancy',
    package: '3.8 LPA',
    review: 'CA Priya maam taught us real industry GST return filing. I received my certificate and got placed within 15 days of course completion. Highly recommended!',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'
  },
  {
    id: 'r3',
    studentName: 'Vikrant Singh',
    course: 'MPPSC Target Batch',
    batchYear: '2025-2026',
    review: 'Target Academy mock test series and faculty guidance for MPPSC mains answer writing is top notch. Best coaching atmosphere in Madhya Pradesh!',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
  }
];

export const sampleAssignments: StudentAssignment[] = [
  {
    id: 'asg-1',
    title: 'VBA Macros & Advanced Pivot Table Challenge',
    course: 'ADCA (Advanced Diploma in Computer Applications)',
    dueDate: '2026-08-10',
    assignedBy: 'Er. R. K. Sharma',
    description: 'Create an automated sales reporting dashboard in Excel using Pivot Tables, Slicers and a 10-line VBA script.',
    status: 'Pending'
  },
  {
    id: 'asg-2',
    title: 'GSTR-3B Reconciliation Assignment',
    course: 'Tally Prime with GST & Payroll',
    dueDate: '2026-08-08',
    assignedBy: 'CA Priya Agrawal',
    description: 'Perform ITC matching between GSTR-2B purchase register and Tally ledgers for July 2026 transactions.',
    status: 'Submitted'
  }
];

export const sampleStudyNotes: StudyNote[] = [
  {
    id: 'sn-1',
    title: 'Python Complete Handwritten Notes (Core to OOP)',
    course: 'Python Programming & AI/ML Basics',
    subject: 'Python Core',
    fileSize: '4.2 MB PDF',
    uploadedDate: '2026-07-20',
    uploadedBy: 'Vikram Rajput',
    downloadUrl: '#'
  },
  {
    id: 'sn-2',
    title: 'Tally Prime Shortcut Keys & GST Journal Rules',
    course: 'Tally Prime with GST & Payroll',
    subject: 'Accounting Shortcuts',
    fileSize: '1.8 MB PDF',
    uploadedDate: '2026-07-22',
    uploadedBy: 'CA Priya Agrawal',
    downloadUrl: '#'
  },
  {
    id: 'sn-3',
    title: 'MP General Knowledge 1000 Most Expected MCQs',
    course: 'MPPSC Target Batch',
    subject: 'MP History & Culture',
    fileSize: '8.5 MB PDF',
    uploadedDate: '2026-07-28',
    uploadedBy: 'Target Academy Panel',
    downloadUrl: '#'
  }
];
