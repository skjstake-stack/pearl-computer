import React, { useState, useEffect } from 'react';
import {
  Quote,
  Target,
  Compass,
  Award,
  Mail,
  Phone,
  FileText,
  Download,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { DirectorDeskData } from '../types';

interface DirectorsDeskSectionProps {
  isPreview?: boolean;
  previewData?: DirectorDeskData;
}

export const DirectorsDeskSection: React.FC<DirectorsDeskSectionProps> = ({
  isPreview = false,
  previewData
}) => {
  const [data, setData] = useState<DirectorDeskData | null>(previewData || null);
  const [isLoading, setIsLoading] = useState(!previewData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (previewData) {
      setData(previewData);
      setIsLoading(false);
      return;
    }

    const fetchDirectorsDesk = async () => {
      try {
        const res = await fetch('/api/directors-desk');
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
        } else if (result.isPublished === false) {
          setError('The Director\'s Desk section is currently unpublished by administration.');
        } else {
          setError('Failed to load Director\'s Desk information.');
        }
      } catch (err) {
        console.error('Error fetching Director\'s Desk:', err);
        setError('Network error while loading Director\'s Desk.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectorsDesk();
  }, [previewData]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Director's Desk...</span>
      </div>
    );
  }

  if (error || !data) {
    if (isPreview) return null;
    return (
      <div className="py-12 bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Director's Desk</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'Information unavailable at the moment.'}</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-orange-500" /> Leadership & Vision
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Director's Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Message, Vision & Strategic Leadership from the desk of Pearl Computer & Target Academy Management.
          </p>
        </div>

        {/* Main Leadership Card (Photo Left, Details Right) */}
        <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-700/80 shadow-xl overflow-hidden transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
            {/* Left Column: Photo & Profile Highlights */}
            <div className="lg:col-span-5 space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Profile Image with Ring Badge */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <img
                  src={data.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800'}
                  alt={data.seo?.altText || data.name}
                  loading="lazy"
                  className="relative w-64 h-80 sm:w-72 sm:h-96 object-cover rounded-2xl shadow-lg border-2 border-white dark:border-slate-700"
                />
                {data.isPublished && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Official Profile
                  </span>
                )}
              </div>

              {/* Name, Designation & Qualification */}
              <div className="space-y-1.5 w-full">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.name}
                </h3>
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  {data.designation}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700/60 px-3 py-1 rounded-xl">
                  <Award className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{data.qualification}</span>
                </div>
              </div>

              {/* Digital Signature & PDF Download */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 w-full flex flex-col items-center lg:items-start gap-4">
                {data.signatureUrl && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Digital Signature</span>
                    <img
                      src={data.signatureUrl}
                      alt="Director Signature"
                      className="h-12 object-contain filter dark:invert"
                    />
                  </div>
                )}

                {data.pdfMessageUrl && (
                  <a
                    href={data.pdfMessageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Director's Message (PDF)</span>
                  </a>
                )}
              </div>

              {/* Contact Information & Social Links */}
              <div className="w-full space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                  {data.email && (
                    <a
                      href={`mailto:${data.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{data.email}</span>
                    </a>
                  )}

                  {data.phone && (
                    <a
                      href={`tel:${data.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{data.phone}</span>
                    </a>
                  )}
                </div>

                {/* Social Media Links */}
                {data.socialLinks && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-slate-500 pt-1">
                    {data.socialLinks.linkedin && (
                      <a href={data.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="LinkedIn">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {data.socialLinks.twitter && (
                      <a href={data.socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:text-blue-400 hover:bg-blue-50 transition-colors" title="Twitter">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {data.socialLinks.facebook && (
                      <a href={data.socialLinks.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:text-blue-700 hover:bg-blue-50 transition-colors" title="Facebook">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {data.socialLinks.instagram && (
                      <a href={data.socialLinks.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:text-pink-600 hover:bg-pink-50 transition-colors" title="Instagram">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Welcome Message, Quote, Vision & Mission */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              {/* Inspirational Quote Callout */}
              {data.inspirationalQuote && (
                <div className="relative p-5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-950 dark:text-orange-200">
                  <Quote className="w-8 h-8 text-orange-400/40 absolute top-3 right-4 pointer-events-none" />
                  <p className="text-xs sm:text-sm font-semibold italic leading-relaxed pr-6">
                    {data.inspirationalQuote}
                  </p>
                </div>
              )}

              {/* Welcome Message formatted HTML */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Welcome Address
                </h4>
                <div
                  dangerouslySetInnerHTML={{ __html: data.welcomeMessage }}
                  className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3"
                />
              </div>

              {/* Vision & Mission Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
                {/* Director's Vision */}
                <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <span>Director's Vision</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {data.vision}
                  </p>
                </div>

                {/* Director's Mission */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>Director's Mission</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {data.mission}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
