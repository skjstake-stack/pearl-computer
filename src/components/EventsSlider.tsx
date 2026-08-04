import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  ExternalLink,
  Maximize2,
  X,
  Pause,
  Play,
  Flame,
  ArrowRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { EventItem } from '../types';

interface EventsSliderProps {
  onOpenAdmissionModal?: () => void;
}

export const EventsSlider: React.FC<EventsSliderProps> = ({ onOpenAdmissionModal }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxEvent, setLightboxEvent] = useState<EventItem | null>(null);

  // Swipe gesture refs
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Fetch Active Events from Server API
  const fetchActiveEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events for slider:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  // Auto-Slide Timer (every 4.5 seconds when not paused and more than 1 item)
  useEffect(() => {
    if (isPaused || events.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, events.length]);

  // Touch handlers for mobile swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 40;

      if (distance > minSwipeDistance) {
        // Swiped Left -> Next slide
        handleNext();
      } else if (distance < -minSwipeDistance) {
        // Swiped Right -> Previous slide
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    // Resume auto-slide after 3s
    setTimeout(() => setIsPaused(false), 3000);
  };

  const handlePrev = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const handleNext = () => {
    if (events.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  if (isLoading) {
    return (
      <div className="w-full py-4 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 sm:h-80 md:h-[380px] bg-slate-800/60 rounded-3xl animate-pulse flex items-center justify-center text-slate-500 text-xs font-semibold">
            Loading Latest Announcements & Events...
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex] || events[0];

  return (
    <section className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800/80 shadow-2xl relative overflow-hidden">
      {/* Top Ticker Header Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-blue-600 py-1.5 px-4 text-xs font-bold flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 font-extrabold">
            <Flame className="w-3 h-3 text-yellow-300 animate-bounce" /> Live Announcements
          </span>
          <span className="truncate text-[11px] sm:text-xs text-amber-100 font-medium">
            {currentEvent.title}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] shrink-0 font-semibold text-white/90">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {currentEvent.eventDate}
          </span>
          <span className="bg-slate-900/40 px-2 py-0.5 rounded text-[10px] border border-white/20">
            {currentIndex + 1} of {events.length}
          </span>
        </div>
      </div>

      {/* Main Slider Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl group transition-all duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Visual Display */}
          <div className="relative h-[380px] sm:h-[420px] md:h-[460px] w-full flex flex-col md:flex-row items-stretch">
            {/* Left: Content Block */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between z-10 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentEvent.category || 'Event'}
                  </span>
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentEvent.eventDate}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                  {currentEvent.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                  {currentEvent.description}
                </p>
              </div>

              {/* CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                {currentEvent.linkUrl ? (
                  currentEvent.linkUrl.startsWith('#') ? (
                    <button
                      onClick={() => {
                        if (currentEvent.linkUrl === '#admissions' && onOpenAdmissionModal) {
                          onOpenAdmissionModal();
                        } else {
                          const elem = document.querySelector(currentEvent.linkUrl);
                          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      {currentEvent.linkText || 'Register / Learn More'} <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <a
                      href={currentEvent.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      {currentEvent.linkText || 'Visit Event Link'} <ExternalLink className="w-4 h-4" />
                    </a>
                  )
                ) : (
                  <button
                    onClick={() => onOpenAdmissionModal && onOpenAdmissionModal()}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    Online Admission Form <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setLightboxEvent(currentEvent)}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 backdrop-blur-md"
                >
                  <Maximize2 className="w-4 h-4 text-amber-400" /> Enlarge Poster
                </button>
              </div>
            </div>

            {/* Right: Event Poster Image */}
            <div
              className="w-full md:w-1/2 h-48 md:h-full relative overflow-hidden bg-slate-950 cursor-pointer group/poster"
              onClick={() => setLightboxEvent(currentEvent)}
            >
              <img
                src={currentEvent.imageUrl}
                alt={currentEvent.title}
                loading="lazy"
                className="w-full h-full object-cover object-center transform group-hover/poster:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent md:bg-gradient-to-r md:from-slate-950 md:via-transparent md:to-transparent" />

              {/* Hover Badge */}
              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 opacity-90 group-hover/poster:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Click to view full image
              </div>
            </div>
          </div>

          {/* Previous / Next Arrow Controls */}
          {events.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-white/20 flex items-center justify-center backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Bar: Dots Nav + Pause Control */}
          <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-3">
            <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              {events.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-7 bg-gradient-to-r from-orange-500 to-amber-400'
                      : 'w-2 bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}

              <div className="h-3 w-px bg-slate-700 mx-1" />

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isPaused ? 'Resume Auto-slide' : 'Pause Auto-slide'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Poster Modal */}
      {lightboxEvent && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {lightboxEvent.category || 'Event Poster'}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {lightboxEvent.title}
                </h3>
              </div>

              <button
                onClick={() => setLightboxEvent(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster Image View */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/50">
              <img
                src={lightboxEvent.imageUrl}
                alt={lightboxEvent.title}
                className="max-h-[60vh] w-auto object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />

              <div className="w-full mt-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date: {lightboxEvent.eventDate}
                  </span>
                  {lightboxEvent.createdAt && (
                    <span className="text-slate-400 font-normal text-[11px]">
                      Published: {new Date(lightboxEvent.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">{lightboxEvent.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {lightboxEvent.description}
                </p>

                {lightboxEvent.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={lightboxEvent.linkUrl}
                      target={lightboxEvent.linkUrl.startsWith('#') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {lightboxEvent.linkText || 'Open Link'} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
