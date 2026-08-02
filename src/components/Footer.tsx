import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Send,
  Heart,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { QuickNavItem } from '../types';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenAdmissionModal: () => void;
}

const DEFAULT_FOOTER_NAV: QuickNavItem[] = [
  { id: '1', title: 'Home', badge: '', description: '', icon: 'Home', targetTab: 'home', displayOrder: 1, status: 'Published', showDesktop: true, showMobile: true },
  { id: '2', title: 'Course Catalog', badge: '', description: '', icon: 'GraduationCap', targetTab: 'courses', displayOrder: 2, status: 'Published', showDesktop: true, showMobile: true },
  { id: '3', title: 'Online Admission Form', badge: '', description: '', icon: 'FileEdit', targetTab: 'admission', displayOrder: 3, status: 'Published', showDesktop: true, showMobile: true },
  { id: '4', title: 'Verify Certificate', badge: '', description: '', icon: 'ShieldCheck', targetTab: 'verification', displayOrder: 4, status: 'Published', showDesktop: true, showMobile: true },
  { id: '5', title: 'Exam Results Lookup', badge: '', description: '', icon: 'Search', targetTab: 'results', displayOrder: 5, status: 'Published', showDesktop: true, showMobile: true },
  { id: '6', title: 'Online Practice Tests', badge: '', description: '', icon: 'CheckSquare', targetTab: 'mocktest', displayOrder: 6, status: 'Published', showDesktop: true, showMobile: true }
];

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onOpenAdmissionModal }) => {
  const [navItems, setNavItems] = useState<QuickNavItem[]>(DEFAULT_FOOTER_NAV);

  useEffect(() => {
    fetch('/api/quick-nav')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.items) && d.items.length > 0) {
          setNavItems(d.items);
        }
      })
      .catch(err => console.warn('Footer QuickNav fetch error:', err));
  }, []);
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Pearl Computer & Target Academy</span>
                <p className="text-[11px] text-orange-400 font-medium">Learn Today • Lead Tomorrow</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              ISO 9001:2015 Certified Premier Educational Institution. Provider of industry-standard job oriented programs in Computer Applications, Financial Accounting, Software Development, and Competitive Exam Foundation Coaching.
            </p>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Helpline: +91 79998-29231 / +91 93292-84693</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>bisan9329284693@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Main Branch: Near Railway Station Road, Parasia, Tehsil - Parasia, District - Chhindwara, Madhya Pradesh 480441</span>
              </div>
            </div>

            {/* Social Media Links under Brand */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Follow Us On Social Media</span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com/pearlcomputeracademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram - Pearl Computer & Target Academy"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:border-rose-400 transition-all flex items-center justify-center cursor-pointer shadow-sm group"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://facebook.com/pearlcomputeracademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook - Pearl Computer & Target Academy"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all flex items-center justify-center cursor-pointer shadow-sm group"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://linkedin.com/company/pearlcomputeracademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn - Pearl Computer & Target Academy"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-sky-600 hover:border-sky-500 transition-all flex items-center justify-center cursor-pointer shadow-sm group"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://youtube.com/@pearlcomputeracademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube - Pearl Computer & Target Academy"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-red-600 hover:border-red-500 transition-all flex items-center justify-center cursor-pointer shadow-sm group"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://twitter.com/pearlacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter - Pearl Computer & Target Academy"
                  className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-500 transition-all flex items-center justify-center cursor-pointer shadow-sm group"
                  title="Twitter (X)"
                >
                  <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.isExternal && item.externalUrl) {
                        window.open(item.externalUrl, '_blank');
                      } else if (item.targetTab === 'admission') {
                        onOpenAdmissionModal();
                      } else {
                        onNavigateTab(item.targetTab);
                      }
                    }}
                    className={`hover:text-orange-400 cursor-pointer flex items-center gap-2 transition-colors group text-left ${
                      item.targetTab === 'admission' ? 'text-orange-400 font-bold hover:text-orange-300' : ''
                    }`}
                  >
                    <span className="text-slate-500 group-hover:text-orange-400 transition-colors">›</span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Courses */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Popular Programs</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• DCA & ADCA Diploma</li>
              <li>• Tally Prime with GST</li>
              <li>• CCC NIELIT Course</li>
              <li>• Python & AI Basics</li>
              <li>• Fullstack Web Development</li>
              <li>• MPPSC Target Coaching</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Updated</h4>
            <p className="text-xs text-slate-400">
              Subscribe to get instant alerts regarding upcoming batches, job vacancies & scholarship tests.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to Pearl Academy updates!');
              }}
              className="space-y-2"
            >
              <input
                type="email"
                required
                placeholder="Enter email address..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social Media Highlight Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">Connect With Pearl Academy</h5>
              <p className="text-[11px] text-slate-400">Join our official social channels for daily batch updates, study tips & notifications</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://instagram.com/pearlcomputeracademy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-950 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 border border-slate-800 hover:border-pink-500 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Instagram</span>
            </a>

            <a
              href="https://facebook.com/pearlcomputeracademy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-950 hover:bg-blue-600 border border-slate-800 hover:border-blue-500 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Facebook className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Facebook</span>
            </a>

            <a
              href="https://linkedin.com/company/pearlcomputeracademy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-950 hover:bg-sky-600 border border-slate-800 hover:border-sky-500 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Linkedin className="w-4 h-4 text-sky-400 shrink-0" />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://youtube.com/@pearlcomputeracademy"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-950 hover:bg-red-600 border border-slate-800 hover:border-red-500 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              <span>YouTube</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>
            © 2026 Pearl Computer & Target Academy. All Rights Reserved.
          </div>

          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms & Conditions</a>
            <a href="#" className="hover:text-slate-300">Refund Policy</a>
            <a href="#" className="hover:text-slate-300">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
