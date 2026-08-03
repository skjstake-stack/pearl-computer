import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Crop,
  Sparkles,
  User,
  Award,
  Save,
  Lock,
  FileCheck,
  Maximize2
} from 'lucide-react';
import { DirectorDeskData } from '../types';

interface AdminManagingDirectorModuleProps {
  userRole?: string;
  userName?: string;
}

export const AdminManagingDirectorModule: React.FC<AdminManagingDirectorModuleProps> = ({
  userRole = 'admin',
  userName = 'Institute Admin'
}) => {
  const [directorData, setDirectorData] = useState<DirectorDeskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Upload & Cropping State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  // Form Fields State (Editable details without any image URL)
  const [name, setName] = useState('Mr. Bisan Kanarzee');
  const [designation, setDesignation] = useState('Managing Director & Founder');
  const [qualification, setQualification] = useState('M.Tech (Computer Science), Ex-IT Consultant & Senior Educationist');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isAuthorized = userRole === 'superadmin' || userRole === 'admin';

  // Fetch current Managing Director data from server
  const fetchDirectorData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/managing-director', {
        headers: {
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setDirectorData(result.data);
        setName(result.data.name || 'Mr. Bisan Kanarzee');
        setDesignation(result.data.designation || 'Managing Director & Founder');
        setQualification(result.data.qualification || '');
        setWelcomeMessage(result.data.welcomeMessage || '');
        setVision(result.data.vision || '');
        setMission(result.data.mission || '');
        setEmail(result.data.email || '');
        setPhone(result.data.phone || '');
        setIsPublished(result.data.isPublished ?? true);
      }
    } catch (err) {
      console.error('Error fetching Managing Director data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectorData();
  }, []);

  // Image Compression & Auto-Resize (600 x 600 px) using Canvas
  const processAndResizeImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 600; // 600 x 600 px target
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Canvas context unavailable');
          return;
        }

        // Calculate center crop square
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
        if (img.width > img.height) {
          sWidth = img.height;
          sx = (img.width - img.height) / 2;
        } else {
          sHeight = img.width;
          sy = (img.height - img.width) / 2;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetSize, targetSize);

        // Compress image to WebP with 0.88 quality
        const compressedBase64 = canvas.toDataURL('image/webp', 0.88);
        resolve(compressedBase64);
      };
      img.onerror = () => reject('Failed to load image for compression');
      img.src = imageSrc;
    });
  };

  // Handle File Selection (Validate Format & Size <= 5MB)
  const handleFileSelect = async (file: File) => {
    setMessage(null);

    // Validate role security
    if (!isAuthorized) {
      setMessage({
        type: 'error',
        text: 'Security Restriction: Only Super Admin and Institute Admin have permissions to manage photos.'
      });
      return;
    }

    // Validate file type
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setMessage({
        type: 'error',
        text: 'Invalid File Format: Only JPG, JPEG, PNG, and WebP images are permitted. Executable or unapproved files are strictly blocked.'
      });
      return;
    }

    // Validate file size (Max 5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({
        type: 'error',
        text: `File Size Exceeded: Maximum allowed image size is 5.0 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`
      });
      return;
    }

    setSelectedFile(file);

    // Read image for preview and compression
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setRawPreview(src);
      try {
        const compressed = await processAndResizeImage(src);
        setProcessedPreview(compressed);
        setShowCropModal(true);
      } catch (err) {
        console.error('Compression error:', err);
        setProcessedPreview(src);
        setShowCropModal(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Confirm Upload To Server
  const handleUploadConfirm = async () => {
    if (!processedPreview) return;
    setIsUploading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/managing-director/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          imageBase64: processedPreview,
          fileName: selectedFile?.name || 'director_photo.webp',
          action: directorData?.photoUrl ? 'replace' : 'upload'
        })
      });

      const result = await res.json();
      if (result.success) {
        setDirectorData(result.data);
        setShowCropModal(false);
        setSelectedFile(null);
        setRawPreview(null);
        setProcessedPreview(null);
        setMessage({
          type: 'success',
          text: 'Official photo uploaded & published successfully! The Managing Director section on the website has been automatically updated.'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to upload photo.'
        });
      }
    } catch (err) {
      console.error('Upload request error:', err);
      setMessage({
        type: 'error',
        text: 'Server connection error during image upload.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Photo Deletion
  const handleDeletePhoto = async () => {
    if (!isAuthorized) {
      setMessage({
        type: 'error',
        text: 'Security Restriction: Only Super Admin and Institute Admin can delete the photo.'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete the official photo for Mr. Bisan Kanarzee?')) {
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/managing-director/photo', {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const result = await res.json();
      if (result.success) {
        setDirectorData(result.data);
        setMessage({
          type: 'success',
          text: 'Managing Director photo deleted successfully. Updated immediately on website.'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to delete photo.'
        });
      }
    } catch (err) {
      console.error('Delete photo error:', err);
      setMessage({
        type: 'error',
        text: 'Network error while deleting photo.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Save General Profile Details (Name, Designation, Message, etc. - NO Image URL field)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setMessage({
        type: 'error',
        text: 'Security Restriction: Only Super Admin and Institute Admin can edit details.'
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/managing-director', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          name,
          designation,
          qualification,
          welcomeMessage,
          vision,
          mission,
          email,
          phone,
          isPublished
        })
      });

      const result = await res.json();
      if (result.success) {
        setDirectorData(result.data);
        setMessage({
          type: 'success',
          text: 'Managing Director profile details updated successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to update profile.'
        });
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setMessage({
        type: 'error',
        text: 'Failed to update profile due to network error.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>Loading Managing Director & Founder profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Leadership Management
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mr. Bisan Kanarzee – Managing Director & Founder
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Manage official photo and section profile for Mr. Bisan Kanarzee. All updates reflect automatically on the live website.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>RBAC Protected (Super Admin & Admin Only)</span>
          </div>
        </div>
      </div>

      {/* Global Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 shadow-md ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-800 dark:text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{message.text}</span>
        </div>
      )}

      {/* Main Grid: Left = Secure Image Manager (No URL Input), Right = Profile Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: OFFICIAL PHOTO UPLOAD MODULE (NO URL INPUT AT ALL) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> Official Profile Photo
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload image file directly. External URL links are strictly disabled.
              </p>
            </div>
            {directorData?.photoUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Live Active
              </span>
            )}
          </div>

          {/* Current Live Image Display */}
          <div className="space-y-4">
            <div className="relative group mx-auto max-w-xs text-center">
              <div className="relative aspect-square w-full max-w-[260px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-lg">
                {directorData?.photoUrl ? (
                  <img
                    src={directorData.photoUrl}
                    alt={directorData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 text-slate-400">
                    <User className="w-16 h-16 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold">No Image Uploaded</p>
                    <p className="text-[10px] text-slate-400">Upload a photo below to display on website</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !isAuthorized}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{directorData?.photoUrl ? 'Change / Replace Image' : 'Upload Image'}</span>
              </button>

              {directorData?.photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isUploading || !isAuthorized}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Drag & Drop Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => isAuthorized && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag & Drop image file here
                </p>
                <p className="text-[11px] text-slate-500">or click to browse from device</p>
              </div>
              <div className="pt-2 text-[10px] text-slate-400 space-y-1">
                <p>Supported: <span className="font-bold text-slate-600 dark:text-slate-300">JPG, JPEG, PNG, WebP</span></p>
                <p>Maximum File Size: <span className="font-bold text-slate-600 dark:text-slate-300">5 MB</span></p>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">Recommended Resolution: 600 × 600 px</p>
              </div>
            </div>
          </div>

          {/* Security Notice Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" /> Security & Format Rules
            </div>
            <p>• External image URLs are permanently disabled to prevent dead links or unverified external assets.</p>
            <p>• Automatic canvas compression crops and optimizes files to 600x600 px WebP before saving.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: MANAGING DIRECTOR PROFILE DETAILS FORM (NO URL FIELD) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-md">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Managing Director Details
              </h3>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>Published on Website</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Qualifications & Honor
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Tech (Computer Science), Ex-IT Consultant"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Welcome Message & Strategic Vision
              </label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Vision Statement
                </label>
                <textarea
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mission Statement
                </label>
                <textarea
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving || !isAuthorized}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish & Update Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* LIVE CROP & IMAGE COMPRESSION PREVIEW MODAL */}
      {showCropModal && processedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Crop & Auto-Compress Image
                  </h4>
                  <p className="text-[11px] text-slate-500">Auto-cropped to 600 × 600 px for crisp loading</p>
                </div>
              </div>
            </div>

            {/* Live Cropped Canvas Preview */}
            <div className="space-y-3 text-center">
              <div className="relative aspect-square w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500 shadow-xl bg-slate-900 flex items-center justify-center">
                <img
                  src={processedPreview}
                  alt="Cropped Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[9px] font-mono px-2 py-0.5 rounded-md border border-slate-700">
                  600 x 600 px
                </span>
              </div>
              {selectedFile && (
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p><span className="font-bold text-slate-700 dark:text-slate-300">File:</span> {selectedFile.name}</p>
                  <p><span className="font-bold text-slate-700 dark:text-slate-300">Original Size:</span> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedFile(null);
                  setRawPreview(null);
                  setProcessedPreview(null);
                }}
                disabled={isUploading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUploadConfirm}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading Image...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirm & Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
