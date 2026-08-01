import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Video,
  Download,
  ArrowRight,
  User,
  Sparkles,
  Tag,
  Search,
  Filter,
  Info,
  X
} from 'lucide-react';
import { Course } from '../types';
import { sampleCourses } from '../data/mockData';

interface PopularCoursesProps {
  onOpenAdmissionModal: (courseTitle?: string) => void;
  selectedCourseFilter?: string;
}

export const PopularCourses: React.FC<PopularCoursesProps> = ({
  onOpenAdmissionModal,
  selectedCourseFilter
}) => {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(selectedCourseFilter || '');
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
        }
      })
      .catch(() => {
        // Fallback to sampleCourses
      });
  }, []);

  const categories = [
    'All',
    'Diploma',
    'Accounting',
    'Programming',
    'Design & Marketing',
    'AI & Analytics',
    'Basic Computer',
    'Competitive Exams',
    'Language & Typing'
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.syllabus && course.syllabus.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-full">
            Job-Oriented Curriculum
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-3">
            Our Certified Courses & Batches
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
            Comprehensive skill development programs in Computer Applications, IT Software, Financial Accounting, and Competitive Civil Services Coaching.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search course name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Badge */}
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="text-blue-600 dark:text-blue-400 font-bold">{filteredCourses.length}</span> of {sampleCourses.length} Courses
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No courses match your query</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing the search filter or choosing another category.</p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header Badge */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-slate-800/80">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-md">
                        {course.category}
                      </span>
                      {course.popular && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                          <Sparkles className="w-3 h-3" /> Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Details Body */}
                  <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> Duration
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{course.duration}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <User className="w-3.5 h-3.5 text-blue-500" /> Faculty
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                        {course.trainer}
                      </span>
                    </div>

                    {/* Syllabus Highlights */}
                    <div className="pt-2">
                      <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Syllabus Covers:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.syllabus.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded"
                          >
                            • {item}
                          </span>
                        ))}
                        {course.syllabus.length > 3 && (
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                            +{course.syllabus.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing & CTA */}
                <div className="p-5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/80">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                        ₹{(course.discountFees || course.fees).toLocaleString()}
                      </span>
                      {course.discountFees && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          ₹{course.fees.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Installments Available
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedCourseModal(course)}
                      className="w-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Full Details
                    </button>
                    <button
                      onClick={() => onOpenAdmissionModal(course.title)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Course Modal */}
        {selectedCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded">
                    {selectedCourseModal.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Code: {selectedCourseModal.code}</span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedCourseModal.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedCourseModal.description}
                </p>

                <div className="grid grid-cols-2 gap-4 py-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-400 block">Course Duration</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedCourseModal.duration}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Course Fee</span>
                    <strong className="text-blue-600 dark:text-blue-400 text-base">
                      ₹{(selectedCourseModal.discountFees || selectedCourseModal.fees).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lead Instructor</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedCourseModal.trainer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Certification</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{selectedCourseModal.certificateProvided}</strong>
                  </div>
                </div>

                {/* Full Syllabus Breakdown */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Complete Syllabus Modules:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedCourseModal.syllabus.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => {
                      const title = selectedCourseModal.title;
                      setSelectedCourseModal(null);
                      onOpenAdmissionModal(title);
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs text-center cursor-pointer transition-colors shadow-lg"
                  >
                    Proceed to Online Admission Form
                  </button>

                  <button
                    onClick={() => {
                      alert(`Downloading Syllabus Brochure for ${selectedCourseModal.title}...`);
                    }}
                    className="border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Syllabus PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
