import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Search,
  Filter,
  Layers,
  FolderPlus,
  Maximize2,
  X,
  Check,
  Tag,
  Calendar,
  HardDrive,
  FileText,
  Lock,
  Crop,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { GalleryPhoto, GalleryAlbum, DirectorDeskData } from '../types';

interface AdminMediaManagementModuleProps {
  userRole?: string;
  userName?: string;
}

export const AdminMediaManagementModule: React.FC<AdminMediaManagementModuleProps> = ({
  userRole = 'admin',
  userName = 'Institute Admin'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'gallery' | 'director' | 'albums'>('gallery');

  // Stores
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [directorData, setDirectorData] = useState<DirectorDeskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Toast / Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox Preview Modal
  const [lightboxImage, setLightboxImage] = useState<{ title: string; url: string; details?: string } | null>(null);

  // Gallery Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Campus');
  const [uploadAlbumId, setUploadAlbumId] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFilePreview, setUploadFilePreview] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileSizeMb, setUploadFileSizeMb] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Edit / Replace Photo Modal State
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAlbumId, setEditAlbumId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReplacePreview, setEditReplacePreview] = useState<string>('');

  // Delete Confirmation Modal
  const [deletingPhoto, setDeletingPhoto] = useState<GalleryPhoto | null>(null);

  // Managing Director Upload / Crop State
  const [directorPreview, setDirectorPreview] = useState<string>('');
  const [directorFileName, setDirectorFileName] = useState<string>('');
  const [directorFileSizeMb, setDirectorFileSizeMb] = useState<number>(0);
  const [isDirectorUploading, setIsDirectorUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:3' | 'original'>('1:1');

  // Album Modal State
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumCategory, setAlbumCategory] = useState('Annual Function');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCoverImage, setAlbumCoverImage] = useState('');

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const directorFileInputRef = useRef<HTMLInputElement>(null);

  // Load All Media Data from API
  const fetchAllMediaData = async () => {
    setIsLoading(true);
    try {
      const [photosRes, albumsRes, directorRes] = await Promise.all([
        fetch('/api/gallery/photos?limit=200'),
        fetch('/api/gallery/albums'),
        fetch('/api/admin/managing-director', {
          headers: { 'x-user-role': userRole, 'x-user-name': userName }
        })
      ]);

      if (photosRes.ok) {
        const data = await photosRes.json();
        if (data.success && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        }
      }

      if (albumsRes.ok) {
        const data = await albumsRes.json();
        if (data.success && Array.isArray(data.albums)) {
          setAlbums(data.albums);
        }
      }

      if (directorRes.ok) {
        const data = await directorRes.json();
        if (data.success && data.data) {
          setDirectorData(data.data);
          setDirectorPreview(data.data.photoUrl || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch media data:', err);
      setErrorMsg('Failed to load media assets from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMediaData();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Drag & Drop File Select Handler
  const processFile = (file: File, callback: (base64: string, name: string, sizeMb: number) => void) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file format! Only JPG, JPEG, PNG, and WebP images are supported.');
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 10) {
      setErrorMsg(`File size (${sizeMb.toFixed(2)} MB) exceeds maximum allowed limit of 10 MB.`);
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result, file.name, sizeMb);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, (base64, name, sizeMb) => {
        setUploadFilePreview(base64);
        setUploadFileName(name);
        setUploadFileSizeMb(sizeMb);
        if (!uploadTitle) {
          setUploadTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      });
    }
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, (base64, name, sizeMb) => {
        setUploadFilePreview(base64);
        setUploadFileName(name);
        setUploadFileSizeMb(sizeMb);
        if (!uploadTitle) {
          setUploadTitle(name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      });
    }
  };

  // Gallery Upload Submit with Smooth Progress Simulation
  const handleUploadGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFilePreview) {
      setErrorMsg('Please select or drop an image file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setErrorMsg('');

    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 150);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          imageBase64: uploadFilePreview,
          fileName: uploadFileName,
          title: uploadTitle.trim() || uploadFileName,
          category: uploadCategory,
          albumId: uploadAlbumId,
          description: uploadDescription.trim(),
          tags: uploadTags.trim(),
          target: 'gallery'
        })
      });

      clearInterval(timer);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        showToast('Gallery image uploaded and saved permanently to disk storage!');
        setIsUploadModalOpen(false);
        setUploadFilePreview('');
        setUploadTitle('');
        setUploadDescription('');
        setUploadTags('');
        fetchAllMediaData();
      } else {
        setErrorMsg(data.message || 'Failed to upload gallery image.');
      }
    } catch (err) {
      clearInterval(timer);
      console.error('Error uploading image:', err);
      setErrorMsg('Network error while saving uploaded image.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Edit / Replace Gallery Photo
  const handleOpenEditPhoto = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setEditTitle(photo.title);
    setEditCategory(photo.category);
    setEditAlbumId(photo.albumId || '');
    setEditDescription(photo.description || '');
    setEditReplacePreview('');
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, (base64) => {
        setEditReplacePreview(base64);
      });
    }
  };

  const handleUpdatePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
      const payload: any = {
        title: editTitle.trim(),
        category: editCategory,
        albumId: editAlbumId,
        description: editDescription.trim()
      };

      if (editReplacePreview) {
        payload.url = editReplacePreview;
        payload.thumbnailUrl = editReplacePreview;
      }

      const res = await fetch(`/api/gallery/photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast('Gallery photo updated permanently!');
        setEditingPhoto(null);
        fetchAllMediaData();
      } else {
        setErrorMsg(data.message || 'Failed to update photo.');
      }
    } catch (err) {
      setErrorMsg('Error updating gallery photo.');
    }
  };

  // Delete Gallery Photo
  const handleDeletePhotoConfirm = async () => {
    if (!deletingPhoto) return;
    try {
      const res = await fetch(`/api/gallery/photos/${deletingPhoto.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': userRole, 'x-user-name': userName }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Photo permanently deleted from gallery storage.');
        setDeletingPhoto(null);
        fetchAllMediaData();
      } else {
        setErrorMsg(data.message || 'Failed to delete photo.');
      }
    } catch (err) {
      setErrorMsg('Error deleting photo.');
    }
  };

  // Director Photo Handling
  const handleDirectorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, (base64, name, sizeMb) => {
        setDirectorPreview(base64);
        setDirectorFileName(name);
        setDirectorFileSizeMb(sizeMb);
      });
    }
  };

  const handleDirectorUploadSubmit = async () => {
    if (!directorPreview) {
      setErrorMsg('Please select an image file first.');
      return;
    }

    setIsDirectorUploading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/managing-director/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          imageBase64: directorPreview,
          fileName: directorFileName || 'director_photo.webp',
          action: 'replace'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Managing Director official photo saved permanently to disk storage!');
        fetchAllMediaData();
      } else {
        setErrorMsg(data.message || 'Failed to upload Director photo.');
      }
    } catch (err) {
      console.error('Director photo upload failed:', err);
      setErrorMsg('Error saving Director photo.');
    } finally {
      setIsDirectorUploading(false);
    }
  };

  const handleDeleteDirectorPhoto = async () => {
    if (!confirm('Are you sure you want to delete the current Managing Director official photo?')) return;
    try {
      const res = await fetch('/api/admin/managing-director/photo', {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole,
          'x-user-name': userName
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Director photo deleted.');
        setDirectorPreview('');
        fetchAllMediaData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete Director photo.');
    }
  };

  // Create Album Handler
  const handleCreateAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumName.trim()) {
      setErrorMsg('Album name is required.');
      return;
    }

    try {
      const res = await fetch('/api/gallery/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
          'x-user-name': userName
        },
        body: JSON.stringify({
          name: albumName.trim(),
          category: albumCategory,
          description: albumDescription.trim(),
          coverImage: albumCoverImage.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
          year: new Date().getFullYear(),
          isPublished: true
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('New Album created and saved permanently!');
        setIsAlbumModalOpen(false);
        setAlbumName('');
        setAlbumDescription('');
        setAlbumCoverImage('');
        fetchAllMediaData();
      } else {
        setErrorMsg(data.message || 'Failed to create album.');
      }
    } catch (err) {
      setErrorMsg('Error creating album.');
    }
  };

  // Filter Photos List
  const filteredPhotos = photos.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesAlbum = selectedAlbum === 'all' || p.albumId === selectedAlbum;
    return matchesSearch && matchesCategory && matchesAlbum;
  });

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage) || 1;
  const paginatedPhotos = filteredPhotos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Media Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Persistent Storage: ACTIVE
              </span>
              <span className="text-xs text-slate-400">Disk JSON Store & Binary Files</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">Media Management & Image Storage</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAllMediaData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-semibold border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Media
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" /> Upload Gallery Image
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

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Media Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('gallery')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'gallery'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Gallery Media Library ({photos.length})
          </button>

          <button
            onClick={() => setActiveSubTab('director')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'director'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" /> Managing Director Photo
          </button>

          <button
            onClick={() => setActiveSubTab('albums')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'albums'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <FolderOpen className="w-4 h-4" /> Albums & Categories ({albums.length})
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SUBTAB 1: GALLERY MEDIA LIBRARY */}
      {/* ========================================== */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-4">
          {/* Search, Filter & Bulk Toolbar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search images by title, category, tags..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Campus">Campus</option>
                <option value="Computer Lab">Computer Lab</option>
                <option value="Annual Function">Annual Function</option>
                <option value="Workshops">Workshops</option>
                <option value="Certificate Distribution">Certificate Distribution</option>
                <option value="Placement Drive">Placement Drive</option>
                <option value="Independence Day">Independence Day</option>
              </select>

              <select
                value={selectedAlbum}
                onChange={(e) => {
                  setSelectedAlbum(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
              >
                <option value="all">All Albums</option>
                {albums.map((alb) => (
                  <option key={alb.id} value={alb.id}>
                    {alb.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos Grid Display */}
          {isLoading ? (
            <div className="p-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-slate-500 text-xs font-semibold animate-pulse">
              Loading persistent gallery image store...
            </div>
          ) : paginatedPhotos.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No media assets found</p>
              <p className="text-xs text-slate-500">Upload a new photo to save it permanently in disk storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container with Zoom & Hover Actions */}
                  <div className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setLightboxImage({
                            title: photo.title,
                            url: photo.url,
                            details: `${photo.category} • Uploaded: ${photo.uploadedAt}`
                          })
                        }
                        className="p-2.5 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full transition-transform hover:scale-110 cursor-pointer"
                        title="View Full Size"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditPhoto(photo)}
                        className="p-2.5 bg-blue-600/80 hover:bg-blue-600 text-white backdrop-blur-md rounded-full transition-transform hover:scale-110 cursor-pointer"
                        title="Edit / Replace Image"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingPhoto(photo)}
                        className="p-2.5 bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md rounded-full transition-transform hover:scale-110 cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                      {photo.category}
                    </span>
                  </div>

                  {/* Photo Info */}
                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1" title={photo.title}>
                        {photo.title}
                      </h3>
                      {photo.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {photo.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{photo.uploadedAt || 'Permanent Store'}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Saved on Disk
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>
                Page {currentPage} of {totalPages} ({filteredPhotos.length} photos)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* SUBTAB 2: MANAGING DIRECTOR PHOTO STORAGE */}
      {/* ========================================== */}
      {activeSubTab === 'director' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" /> Managing Director Official Photo (Mr. Bisan Kanarzee)
              </h2>
              <p className="text-xs text-slate-500">
                Upload or replace the director profile photo. Saved permanently to disk and rendered live on website.
              </p>
            </div>

            <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-extrabold px-3 py-1 rounded-full">
              Full Resolution & Responsive
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Current Active Photo Display */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Website Director Image:</p>

              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 max-w-sm bg-slate-950 shadow-xl group">
                {directorPreview ? (
                  <img
                    src={directorPreview}
                    alt="Managing Director"
                    className="w-full h-80 object-cover object-top"
                  />
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <User className="w-16 h-16 text-slate-600" />
                    <p className="text-xs font-bold">No Official Photo Set</p>
                  </div>
                )}

                {directorPreview && (
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() =>
                        setLightboxImage({
                          title: 'Mr. Bisan Kanarzee - Managing Director',
                          url: directorPreview
                        })
                      }
                      className="p-3 bg-white text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Enlarge Image"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleDeleteDirectorPhoto}
                      className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">Mr. Bisan Kanarzee</p>
                <p>Managing Director & Founder | Pearl Computer & Target Academy</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Synchronized with Director's Desk Section
                </p>
              </div>
            </div>

            {/* Right: Upload / Replace Control Box */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload / Replace Official Image:</p>

              <div className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 space-y-4 text-center">
                <Upload className="w-10 h-10 text-purple-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select new profile photo file (JPG, PNG, WEBP)
                  </p>
                  <p className="text-[11px] text-slate-500">Maximum file size: 10 MB. High resolution recommended.</p>
                </div>

                <input
                  ref={directorFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleDirectorFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => directorFileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                  >
                    Choose Image File
                  </button>

                  {directorFileName && (
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 truncate max-w-xs">
                      {directorFileName} ({directorFileSizeMb.toFixed(2)} MB)
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                  <button
                    onClick={handleDirectorUploadSubmit}
                    disabled={isDirectorUploading || !directorPreview}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDirectorUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving permanently...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Save Director Photo Permanently
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUBTAB 3: ALBUMS & CATEGORIES ORGANIZER */}
      {/* ========================================== */}
      {activeSubTab === 'albums' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Gallery Photo Albums</h2>
              <p className="text-xs text-slate-500">Organize photos into structured albums and categories.</p>
            </div>

            <button
              onClick={() => setIsAlbumModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" /> Create New Album
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((alb) => (
              <div
                key={alb.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-36 rounded-2xl overflow-hidden bg-slate-950 relative">
                    <img src={alb.coverImage} alt={alb.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                      {alb.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{alb.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{alb.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {alb.photoCount || 0} Photos
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Album #{alb.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: UPLOAD GALLERY PHOTO */}
      {/* ========================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500 text-white rounded-xl">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Upload Gallery Image to Permanent Storage
                  </h3>
                  <p className="text-xs text-slate-500">Supported formats: JPG, JPEG, PNG, WebP (Max 10 MB)</p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadGallerySubmit} className="space-y-4 text-xs">
              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleGalleryDrop}
                className={`p-6 border-2 border-dashed rounded-3xl text-center space-y-3 transition-colors ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
              >
                {uploadFilePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-950 flex items-center justify-center">
                    <img src={uploadFilePreview} alt="Upload preview" className="max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadFilePreview('');
                        setUploadFileName('');
                        setUploadFileSizeMb(0);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      Drag & Drop your image file here, or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleGalleryFileChange}
                  className="hidden"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Select File
                  </button>

                  {uploadFileSizeMb > 0 && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Size: {uploadFileSizeMb.toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar during submit */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Uploading & Saving to Permanent Disk...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Image Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Advanced Practical Computer Lab Session"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Campus">Campus</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Annual Function">Annual Function</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Certificate Distribution">Certificate Distribution</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Independence Day">Independence Day</option>
                  </select>
                </div>
              </div>

              {/* Album & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign to Album
                  </label>
                  <select
                    value={uploadAlbumId}
                    onChange={(e) => setUploadAlbumId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- No Specific Album --</option>
                    {albums.map((alb) => (
                      <option key={alb.id} value={alb.id}>
                        {alb.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Search Tags / Keywords
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="e.g. computer lab, practical, DCA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Optional brief description of the photo..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUploading || !uploadFilePreview}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Image Permanently
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: EDIT / REPLACE PHOTO */}
      {/* ========================================== */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit / Replace Gallery Photo</h3>
              <button onClick={() => setEditingPhoto(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePhotoSubmit} className="space-y-3 text-xs">
              <div className="h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
                <img
                  src={editReplacePreview || editingPhoto.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Replace Image File</label>
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleReplaceFileChange}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Campus">Campus</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Annual Function">Annual Function</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Certificate Distribution">Certificate Distribution</option>
                  <option value="Placement Drive">Placement Drive</option>
                  <option value="Independence Day">Independence Day</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  Update Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: CREATE ALBUM */}
      {/* ========================================== */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Photo Album</h3>
              <button onClick={() => setIsAlbumModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbumSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Album Name *</label>
                <input
                  type="text"
                  required
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g. Annual Sports & Tech Meet 2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={albumCategory}
                  onChange={(e) => setAlbumCategory(e.target.value)}
                  placeholder="e.g. Events, Convocation"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="Brief description of album..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={albumCoverImage}
                  onChange={(e) => setAlbumCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow"
                >
                  Create Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: LIGHTBOX ENLARGE PREVIEW */}
      {/* ========================================== */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white truncate">{lightboxImage.title}</h3>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col items-center justify-center overflow-auto bg-slate-950">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />
              {lightboxImage.details && (
                <p className="mt-3 text-xs text-slate-400 font-medium">{lightboxImage.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 dark:bg-red-950 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Delete Image</h3>
                <p className="text-xs text-slate-500">Remove permanently from gallery disk storage.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <span className="font-bold">"{deletingPhoto.title}"</span>?
            </p>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingPhoto(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePhotoConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
