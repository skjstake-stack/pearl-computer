import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Save,
  Eye,
  History,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Upload,
  Globe,
  FileText,
  Search,
  Check,
  X,
  UserCheck,
  RefreshCw,
  Clock,
  Send,
  Layers,
  Trash2,
  Image as ImageIcon,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileImage,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { DirectorsDeskSection } from './DirectorsDeskSection';
import { DirectorDeskData, DirectorVersionHistory, DirectorSEO, DirectorSocialLinks, UserRole } from '../types';

interface AdminDirectorsDeskModuleProps {
  userRole: UserRole;
  userName?: string;
}

export const AdminDirectorsDeskModule: React.FC<AdminDirectorsDeskModuleProps> = ({
  userRole,
  userName = 'Institute Admin'
}) => {
  // Access control check
  const hasAccess = userRole === 'superadmin' || userRole === 'admin';

  const [formData, setFormData] = useState<DirectorDeskData | null>(null);
  const [history, setHistory] = useState<DirectorVersionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'content' | 'seo' | 'history'>('details');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Photo Upload & Crop Modal States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState<string>('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [enlargedPhotoOpen, setEnlargedPhotoOpen] = useState(false);

  // Canvas ref for image crop processing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/directors-desk', {
        headers: { 'x-user-role': userRole, 'x-user-name': userName }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setFormData(result.data);
        if (result.history) setHistory(result.history);
      }
    } catch (err) {
      console.error('Failed to load Director\'s Desk admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/40 rounded-3xl border border-red-200 dark:border-red-800 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-red-800 dark:text-red-200">Access Restricted</h3>
        <p className="text-xs text-red-600 dark:text-red-300">
          Only Super Admin and Institute Admin roles are authorized to manage the Director's Desk section.
        </p>
      </div>
    );
  }

  if (isLoading || !formData) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Director's Desk Management Panel...</span>
      </div>
    );
  }

  // Input change handlers
  const handleInputChange = (field: keyof DirectorDeskData, val: any) => {
    setFormData(prev => prev ? ({ ...prev, [field]: val }) : null);
  };

  const handleSocialChange = (field: keyof DirectorSocialLinks, val: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [field]: val
      }
    }) : null);
  };

  const handleSEOChange = (field: keyof DirectorSEO, val: string) => {
    setFormData(prev => prev ? ({
      ...prev,
      seo: {
        ...(prev.seo || {
          seoTitle: '',
          metaDescription: '',
          metaKeywords: '',
          slug: 'directors-desk'
        }),
        [field]: val
      }
    }) : null);
  };

  // --- File Selection & Validation Logic ---
  const handleFileSelect = (file: File) => {
    setUploadError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please select a smaller photo.`);
      return;
    }

    // Validate type (WebP, JPG, JPEG, PNG)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid image format! Only WebP, JPG, JPEG, and PNG images are supported.');
      return;
    }

    // Read image for Cropper Modal
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageSrc(reader.result);
        setRawFileName(file.name);
        setCropZoom(1);
        setCropRotation(0);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // --- Crop, Resize (600x600 px) & Compress Processing ---
  const applyCropAndProcess = async () => {
    if (!rawImageSrc) return;

    setIsUploadingPhoto(true);
    try {
      const img = new Image();
      img.src = rawImageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Recommended fixed dimensions: 600 x 600 px
      const targetWidth = 600;
      const targetHeight = 600;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill clear background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      ctx.scale(cropZoom, cropZoom);

      // Center crop positioning
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.drawImage(
        img,
        sx,
        sy,
        minDim,
        minDim,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight
      );

      ctx.restore();

      // Compress to WebP (fallback to JPEG if webp unsupported)
      let compressedBase64 = canvas.toDataURL('image/webp', 0.88);
      if (!compressedBase64.startsWith('data:image/webp')) {
        compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
      }

      // Server Upload Request
      const action = formData?.photoUrl ? 'replace' : 'upload';
      const uploadRes = await fetch('/api/admin/directors-desk/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          fileName: rawFileName,
          action
        })
      });

      const uploadResult = await uploadRes.json();
      if (uploadResult.success) {
        setFormData(prev => prev ? ({ ...prev, photoUrl: uploadResult.photoUrl }) : null);
        setStatusMessage({
          type: 'success',
          text: `Director Photo ${action === 'replace' ? 'replaced' : 'uploaded'} and compressed to 600×600 px successfully!`
        });
        setCropModalOpen(false);
      } else {
        setUploadError(uploadResult.message || 'Failed to save uploaded photo to server.');
      }
    } catch (err) {
      console.error('Photo crop processing error:', err);
      setUploadError('An error occurred while cropping and compressing the image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // --- Remove Director Photo Handler ---
  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove the Director\'s photo?')) return;

    setIsUploadingPhoto(true);
    try {
      const res = await fetch('/api/admin/directors-desk/photo', {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const result = await res.json();
      if (result.success) {
        setFormData(prev => prev ? ({ ...prev, photoUrl: '' }) : null);
        setStatusMessage({ type: 'success', text: 'Director photo removed successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Failed to remove photo.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Server error while removing photo.' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // --- Save / Publish Form Submit ---
  const handleSubmit = async (publishState?: boolean) => {
    setIsSaving(true);
    setStatusMessage(null);

    const payload = {
      ...formData,
      isPublished: publishState !== undefined ? publishState : formData.isPublished,
      updatedBy: userName
    };

    try {
      const res = await fetch('/api/admin/directors-desk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success && result.data) {
        setFormData(result.data);
        if (result.history) setHistory(result.history);
        setStatusMessage({
          type: 'success',
          text: publishState !== undefined
            ? `Director's Desk ${publishState ? 'Published Live' : 'Saved as Draft'} successfully!`
            : 'Director\'s Desk details updated successfully!'
        });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Failed to save changes.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error saving changes to server.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Restore version handler
  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this previous version of Director\'s Desk?')) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/directors-desk/restore/${versionId}`, {
        method: 'POST',
        headers: {
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const result = await res.json();

      if (result.success && result.data) {
        setFormData(result.data);
        if (result.history) setHistory(result.history);
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Failed to restore version.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Server error during version restore.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full">
              Content Management
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              formData.isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {formData.isPublished ? 'Published Live' : 'Draft / Unpublished'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Director's Desk Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage Director profile, welcome address, vision, mission, signature, PDF messages, and SEO settings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-600" /> Preview Live
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Publish to Live Website
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Module Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'details' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Profile Details & Contacts
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'content' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Address, Vision & Mission
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'seo' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> SEO Settings
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-purple-500" /> Version History ({history.length})
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Director Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Director Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Mr. Bisan Kanarzee"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Designation *
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    placeholder="e.g. Managing Director & Founder"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Educational Qualifications & Experience
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="e.g. M.Tech (Computer Science), Ex-IT Consultant"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* DIRECTOR PHOTO MANAGEMENT MODULE */}
                <div className="md:col-span-2 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-800/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full">
                          Official Director Photo
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Auto 600×600 px • WebP/JPG/PNG • Max 5 MB
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                        Director Official Portrait Management
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload, crop, replace, or remove the Managing Director's official executive portrait.
                      </p>
                    </div>

                    {formData.photoUrl && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEnlargedPhotoOpen(true)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-blue-600" /> Full Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Current Photo Preview Card */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="relative group w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md transition-all">
                        {formData.photoUrl ? (
                          <>
                            <img
                              src={formData.photoUrl}
                              alt="Director Portrait"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                              <button
                                type="button"
                                onClick={() => setEnlargedPhotoOpen(true)}
                                className="px-3.5 py-1.5 bg-white text-slate-900 text-xs font-extrabold rounded-xl shadow flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" /> View Large
                              </button>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl shadow flex items-center gap-1 hover:bg-blue-700 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" /> Replace Photo
                              </button>
                            </div>
                            <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Photo Active
                            </span>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                            <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full">
                              <Camera className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Photo Uploaded</p>
                            <p className="text-[10px] text-slate-400">Click Browse or Drop file on the right to add image</p>
                          </div>
                        )}
                      </div>
                      {formData.photoUrl && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-2">
                          Current Image Loaded & Synchronized
                        </span>
                      )}
                    </div>

                    {/* Drag & Drop Upload Zone */}
                    <div className="md:col-span-7 space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleFileSelect(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />

                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                          isDragOver
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.01]'
                            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Upload className="w-6 h-6 animate-pulse" />
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {formData.photoUrl ? 'Drag & Drop New Photo to Replace' : 'Drag & Drop Director Photo Here'}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            or click to <span className="text-blue-600 dark:text-blue-400 font-bold underline">browse files</span> from your device
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded-md">WebP, JPG, JPEG, PNG</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded-md">Max Size: 5 MB</span>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 rounded-md">Auto Resize: 600×600 px</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow transition flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{formData.photoUrl ? 'Replace Photo' : 'Upload Director Photo'}</span>
                        </button>

                        {formData.photoUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            disabled={isUploadingPhoto}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Delete Photo</span>
                          </button>
                        )}
                      </div>

                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Access restricted to Super Admin and Institute Admin roles.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Automatic image compression & format check ensures fast page loading speed.
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Every photo upload, replacement, and deletion is recorded in audit logs.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Digital Signature URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Digital Signature Image URL (Optional)</span>
                    <span className="text-[10px] text-slate-400">Transparent PNG recommended</span>
                  </label>
                  <input
                    type="text"
                    value={formData.signatureUrl || ''}
                    onChange={(e) => handleInputChange('signatureUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {formData.signatureUrl && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <img src={formData.signatureUrl} alt="Signature Preview" className="h-8 object-contain filter dark:invert" />
                      <span className="text-[10px] text-slate-500">Signature Active</span>
                    </div>
                  )}
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="director@pearlacademy.com"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Contact Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 93292-84693"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Download PDF URL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Director's Message PDF Attachment URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.pdfMessageUrl || ''}
                    onChange={(e) => handleInputChange('pdfMessageUrl', e.target.value)}
                    placeholder="https://pearlacademy.com/downloads/director-message.pdf"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Social Links Sub-Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Social Media Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    placeholder="LinkedIn Profile URL"
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    placeholder="Twitter / X Profile URL"
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    placeholder="Facebook Profile URL"
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                  <input
                    type="text"
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="Instagram Profile URL"
                    className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RICH TEXT CONTENT, VISION & MISSION */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Inspirational Quote */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Inspirational Quote / Motto
                </label>
                <textarea
                  rows={2}
                  value={formData.inspirationalQuote}
                  onChange={(e) => handleInputChange('inspirationalQuote', e.target.value)}
                  placeholder="e.g. Education is not the learning of facts..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Rich Text Welcome Message */}
              <div className="space-y-1.5">
                <RichTextEditor
                  label="Welcome Address & Detailed Director Message *"
                  value={formData.welcomeMessage}
                  onChange={(val) => handleInputChange('welcomeMessage', val)}
                  minHeight="min-h-[220px]"
                />
              </div>

              {/* Vision & Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Director's Vision Statement
                  </label>
                  <textarea
                    rows={4}
                    value={formData.vision}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    placeholder="State the strategic vision..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Director's Mission Statement
                  </label>
                  <textarea
                    rows={4}
                    value={formData.mission}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    placeholder="State the core mission..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Configure search engine indexing metadata and social share preview tags for the Director's Desk section.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formData.seo?.seoTitle || ''}
                    onChange={(e) => handleSEOChange('seoTitle', e.target.value)}
                    placeholder="Director's Desk - Pearl Computer & Target Academy"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Slug</label>
                  <input
                    type="text"
                    value={formData.seo?.slug || 'directors-desk'}
                    onChange={(e) => handleSEOChange('slug', e.target.value)}
                    placeholder="directors-desk"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.seo?.metaDescription || ''}
                    onChange={(e) => handleSEOChange('metaDescription', e.target.value)}
                    placeholder="Brief description for Google search results..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.seo?.metaKeywords || ''}
                    onChange={(e) => handleSEOChange('metaKeywords', e.target.value)}
                    placeholder="Director, Pearl Academy, Mr. Bisan Kanarzee..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Image Alt Text</label>
                  <input
                    type="text"
                    value={formData.seo?.altText || ''}
                    onChange={(e) => handleSEOChange('altText', e.target.value)}
                    placeholder="Mr. Bisan Kanarzee - Director"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERSION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audit Log & Restore History
                  </h3>
                  <p className="text-xs text-slate-500">
                    All previous edits are saved automatically. You can restore any past version with a single click.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {history.map((ver, idx) => (
                  <div
                    key={ver.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>Version #{history.length - idx}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({new Date(ver.timestamp).toLocaleString()})</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        Updated by <strong>{ver.updatedBy}</strong> • {ver.note || 'Regular Update'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore Version
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Live Preview Mode
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Director's Desk Website Preview
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DirectorsDeskSection isPreview={true} previewData={formData} />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  handleSubmit(true);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg hover:bg-blue-700"
              >
                Looks Good! Publish to Live Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE CROP & OPTIMIZE MODAL */}
      {cropModalOpen && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Crop & Prepare Director Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-resizes to recommended 600 × 600 px with WebP compression.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Preview Canvas / Container */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-xl bg-slate-900 flex items-center justify-center">
                <img
                  src={rawImageSrc}
                  alt="Raw Preview"
                  style={{
                    transform: `scale(${cropZoom}) rotate(${cropRotation}deg)`,
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-w-none max-h-none object-cover"
                />
                {/* Square Crop Overlay Lines */}
                <div className="absolute inset-0 border-2 border-dashed border-white/60 pointer-events-none rounded-2xl"></div>
                <span className="absolute bottom-2 right-2 bg-slate-950/80 text-white text-[9px] font-mono px-2 py-0.5 rounded-full">
                  600 × 600 px Target
                </span>
              </div>

              {/* Cropping Adjustment Controls */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-4 h-4 text-blue-600" /> Zoom Level ({cropZoom.toFixed(1)}x)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCropZoom(prev => Math.max(0.5, prev - 0.1))}
                      className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 shadow-sm"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropZoom(prev => Math.min(2.5, prev + 0.1))}
                      className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 shadow-sm"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropRotation(prev => (prev + 90) % 360)}
                      className="p-1.5 bg-white dark:bg-slate-700 rounded-lg hover:bg-slate-100 shadow-sm flex items-center gap-1 text-[11px]"
                      title="Rotate 90 deg"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Rotate
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyCropAndProcess}
                disabled={isUploadingPhoto}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg transition flex items-center gap-2"
              >
                {isUploadingPhoto ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compressing & Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Crop & Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-RES ENLARGED PHOTO PREVIEW MODAL */}
      {enlargedPhotoOpen && formData.photoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Official Profile Image
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                  {formData.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnlargedPhotoOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center shadow-inner">
              <img
                src={formData.photoUrl}
                alt={formData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800';
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {formData.designation}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEnlargedPhotoOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Replace Photo
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargedPhotoOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
