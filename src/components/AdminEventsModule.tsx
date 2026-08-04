import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Sparkles,
  Calendar,
  ExternalLink,
  Flame,
  Star,
  RefreshCw,
  Search,
  AlertCircle,
  FileText,
  X,
  Layers,
  Check
} from 'lucide-react';
import { EventItem } from '../types';

interface AdminEventsModuleProps {
  userRole?: string;
  userName?: string;
}

export const AdminEventsModule: React.FC<AdminEventsModuleProps> = ({ userRole = 'admin', userName = 'Institute Admin' }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for Add / Edit Event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Announcement');
  const [formEventDate, setFormEventDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formLinkText, setFormLinkText] = useState('View Details');
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [formIsFirst, setFormIsFirst] = useState(false);

  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSizeMb, setImageFileSizeMb] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch All Events from Express API
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setErrorMsg('Failed to load events list from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('Announcement');
    setFormEventDate('');
    setFormDescription('');
    setFormLinkUrl('');
    setFormLinkText('View Details');
    setFormIsEnabled(true);
    setFormIsFirst(false);
    setImagePreview('');
    setImageFileName('');
    setImageFileSizeMb(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: EventItem) => {
    resetForm();
    setEditingEvent(evt);
    setFormTitle(evt.title);
    setFormCategory(evt.category || 'Announcement');
    setFormEventDate(evt.eventDate);
    setFormDescription(evt.description);
    setFormLinkUrl(evt.linkUrl || '');
    setFormLinkText(evt.linkText || 'View Details');
    setFormIsEnabled(evt.isEnabled);
    setImagePreview(evt.imageUrl);
    setIsModalOpen(true);
  };

  // Image File Handling with 10MB validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file type! Only JPG, PNG, and WEBP image formats are supported.');
      return;
    }

    // Validate max size 10 MB
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > 10) {
      setErrorMsg(`File size (${sizeInMb.toFixed(2)} MB) exceeds the maximum allowed limit of 10 MB.`);
      return;
    }

    setErrorMsg('');
    setImageFileName(file.name);
    setImageFileSizeMb(sizeInMb);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form Submit (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg('Event title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: any = {
        title: formTitle.trim(),
        category: formCategory.trim(),
        eventDate: formEventDate.trim(),
        description: formDescription.trim(),
        linkUrl: formLinkUrl.trim(),
        linkText: formLinkText.trim(),
        isEnabled: formIsEnabled,
        isFirst: formIsFirst
      };

      // Pass imageBase64 if new upload exists
      if (imagePreview.startsWith('data:image/')) {
        payload.imageBase64 = imagePreview;
      } else if (imagePreview) {
        payload.imageUrl = imagePreview;
      }

      const url = editingEvent
        ? `/api/admin/events/${editingEvent.id}`
        : '/api/admin/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': userName
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Event saved successfully!');
        setIsModalOpen(false);
        resetForm();
        fetchEvents();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.message || 'Error saving event.');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setErrorMsg('Network error while saving event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Enable/Disable Status
  const handleToggleStatus = async (evt: EventItem) => {
    try {
      const res = await fetch(`/api/admin/events/${evt.id}/toggle`, {
        method: 'POST',
        headers: { 'x-user-name': userName }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchEvents();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to toggle event status.');
    }
  };

  // Delete Event
  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      const res = await fetch(`/api/admin/events/${deletingEvent.id}`, {
        method: 'DELETE',
        headers: { 'x-user-name': userName }
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Event deleted successfully!');
        setDeletingEvent(null);
        fetchEvents();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  // Reorder Event (Up / Down / Top)
  const handleReorder = async (eventId: string, direction: 'up' | 'down' | 'top') => {
    try {
      const res = await fetch('/api/admin/events/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-name': userName
        },
        body: JSON.stringify({ eventId, direction })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to reorder event:', err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.category && evt.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const enabledCount = events.filter((e) => e.isEnabled).length;
  const disabledCount = events.length - enabledCount;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30">
                Slider & Events Manager
              </span>
              <span className="text-xs text-slate-400">Public Homepage Announcements Carousel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">Events & Announcements Slider</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchEvents}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-semibold border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Event / Poster
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Events</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{events.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active on Homepage</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{enabledCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Disabled / Hidden</p>
            <p className="text-2xl font-extrabold text-slate-400">{disabledCount}</p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700/50 text-slate-500 rounded-2xl">
            <EyeOff className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Note: Use ↑ ↓ controls to reorder sequence. Top active event appears first in slider.
        </p>
      </div>

      {/* Events Table / Card List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading events and poster slide configuration...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No events found</p>
            <p className="text-xs text-slate-500">Click "Add New Event / Poster" above to create your first announcement slide.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredEvents.map((evt, index) => (
              <div
                key={evt.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30 ${
                  !evt.isEnabled ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                }`}
              >
                {/* Left: Poster Image + Event Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Sequence Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-8">
                    <span className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center shadow">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Thumbnail Poster */}
                  <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900 relative">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    {!evt.isEnabled && (
                      <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-[10px] text-white font-bold">
                        DISABLED
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                        {evt.category || 'Announcement'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {evt.eventDate}
                      </span>
                      {evt.isEnabled ? (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> Enabled
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Disabled
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {evt.description}
                    </p>

                    {evt.linkUrl && (
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 truncate">
                        <ExternalLink className="w-3 h-3" /> Link: {evt.linkUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Controls & Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleReorder(evt.id, 'top')}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-600 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Set as #1 First Priority"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    </button>
                    <button
                      onClick={() => handleReorder(evt.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleReorder(evt.id, 'down')}
                      disabled={index === filteredEvents.length - 1}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(evt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      evt.isEnabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {evt.isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {evt.isEnabled ? 'Disable' : 'Enable'}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 rounded-xl transition-colors cursor-pointer"
                    title="Edit Event Details or Image"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingEvent(evt)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 rounded-xl transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingEvent ? 'Edit Event / Announcement' : 'Add New Event Slide'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure public slider poster, title, and link</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Event Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event / Announcement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Admissions Open 2026-27 | ISO Certified Diploma Courses"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Badge
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Admissions Open, Tech Fest, Workshop"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    placeholder="e.g. 25th August 2026 or August 2026 Batch"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Announcement Details
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter detailed description of the event, syllabus highlights, or instructions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Link URL & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    placeholder="e.g. #admissions or https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formLinkText}
                    onChange={(e) => setFormLinkText(e.target.value)}
                    placeholder="e.g. Apply Online Now, Register"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Poster Image Upload */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Poster Image (Max 10 MB - JPG, PNG, WEBP)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="max-h-48 object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageFileName('');
                          setImageFileSizeMb(0);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Click below or choose a high resolution poster image file
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-white hover:file:bg-amber-600 cursor-pointer"
                    />

                    {imageFileSizeMb > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        Size: {imageFileSizeMb.toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsEnabled}
                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                  />
                  <span>Publish on Homepage Slider</span>
                </label>

                {!editingEvent && (
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                    <input
                      type="checkbox"
                      checked={formIsFirst}
                      onChange={(e) => setFormIsFirst(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <span>Set as #1 First Priority Slide</span>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Save Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 dark:bg-red-950 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Delete Event</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deletingEvent.title}"</span> from the homepage slider?
            </p>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
              >
                Yes, Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
