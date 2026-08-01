import React, { useState, useEffect } from 'react';
import {
  ImageIcon,
  Video,
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Calendar,
  CheckSquare,
  Square,
  Play,
  X,
  Star,
  Globe,
  Tag,
  Check
} from 'lucide-react';
import { GalleryPhoto, GalleryVideo, GalleryAlbum } from '../types';

export const AdminGalleryModule: React.FC = () => {
  const [subTab, setSubTab] = useState<'photos' | 'videos' | 'albums'>('photos');

  // Stores
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');

  // Selection for bulk actions
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Photo Modal
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    category: 'Campus',
    albumId: '',
    event: '',
    year: 2026,
    altText: '',
    seoKeywords: '',
    isPublished: true
  });

  // Album Modal
  const [showAlbumModal, setShowAlbumModal] = useState<boolean>(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState({
    name: '',
    description: '',
    coverImage: '',
    category: 'Annual Function',
    year: 2026,
    isPublished: true
  });

  // Video Modal
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<GalleryVideo | null>(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    type: 'youtube' as 'youtube' | 'vimeo' | 'mp4',
    thumbnailUrl: '',
    category: 'Campus',
    event: '',
    year: 2026,
    isFeatured: false,
    isPublished: true
  });

  // Preview Modals
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [previewVideo, setPreviewVideo] = useState<GalleryVideo | null>(null);

  const categories = [
    'Campus',
    'Computer Lab',
    'Classroom',
    'Events',
    'Seminars',
    'Workshops',
    'Independence Day',
    'Republic Day',
    'Annual Function',
    'Sports',
    'Cultural Program',
    'Placement Drive',
    'Industrial Visit',
    'Certificate Distribution',
    'Student Activities'
  ];

  const fetchAllGalleryData = async () => {
    setLoading(true);
    try {
      const [photosRes, videosRes, albumsRes] = await Promise.all([
        fetch('/api/gallery/photos?limit=100').then(r => r.json()),
        fetch('/api/gallery/videos?limit=100').then(r => r.json()),
        fetch('/api/gallery/albums').then(r => r.json())
      ]);

      if (photosRes.success) setPhotos(photosRes.photos || []);
      if (videosRes.success) setVideos(videosRes.videos || []);
      if (albumsRes.success) setAlbums(albumsRes.albums || []);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGalleryData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  // PHOTO HANDLERS
  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingPhoto
        ? `/api/gallery/photos/${editingPhoto.id}`
        : '/api/gallery/photos';
      const method = editingPhoto ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoForm)
      });
      const data = await res.json();

      if (data.success) {
        showNotification(data.message || 'Photo saved successfully!');
        setShowPhotoModal(false);
        setEditingPhoto(null);
        fetchAllGalleryData();
      } else {
        alert(data.message || 'Failed to save photo.');
      }
    } catch (err) {
      console.error('Error saving photo:', err);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this photo from gallery?')) return;
    try {
      const res = await fetch(`/api/gallery/photos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('Photo deleted successfully!');
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const handleBulkDeletePhotos = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedPhotoIds.length} selected photos?`)) return;

    try {
      const res = await fetch('/api/gallery/photos/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoIds: selectedPhotoIds })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setSelectedPhotoIds([]);
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error bulk deleting photos:', err);
    }
  };

  const togglePhotoPublished = async (photo: GalleryPhoto) => {
    try {
      const res = await fetch(`/api/gallery/photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !photo.isPublished })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Photo ${!photo.isPublished ? 'Published' : 'Unpublished'}`);
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error toggling photo state:', err);
    }
  };

  // ALBUM HANDLERS
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingAlbum
        ? `/api/gallery/albums/${editingAlbum.id}`
        : '/api/gallery/albums';
      const method = editingAlbum ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumForm)
      });
      const data = await res.json();

      if (data.success) {
        showNotification(data.message || 'Album saved successfully!');
        setShowAlbumModal(false);
        setEditingAlbum(null);
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error saving album:', err);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this album?')) return;
    try {
      const res = await fetch(`/api/gallery/albums/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('Album deleted!');
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error deleting album:', err);
    }
  };

  // VIDEO HANDLERS
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = editingVideo
        ? `/api/gallery/videos/${editingVideo.id}`
        : '/api/gallery/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoForm)
      });
      const data = await res.json();

      if (data.success) {
        showNotification(data.message || 'Video saved successfully!');
        setShowVideoModal(false);
        setEditingVideo(null);
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error saving video:', err);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`/api/gallery/videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('Video deleted!');
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const toggleVideoFeatured = async (vid: GalleryVideo) => {
    try {
      const res = await fetch(`/api/gallery/videos/${vid.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !vid.isFeatured })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Video set to ${!vid.isFeatured ? 'Featured' : 'Standard'}`);
        fetchAllGalleryData();
      }
    } catch (err) {
      console.error('Error setting video featured:', err);
    }
  };

  // Filtering
  const filteredPhotos = photos.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchAlb = selectedAlbum === 'all' || p.albumId === selectedAlbum;
    const matchYear = selectedYear === 'all' || p.year.toString() === selectedYear;
    const matchSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchAlb && matchYear && matchSearch;
  });

  const filteredVideos = videos.filter(v => {
    const matchCat = selectedCategory === 'all' || v.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchYear = selectedYear === 'all' || v.year.toString() === selectedYear;
    const matchSearch = !searchTerm || v.title.toLowerCase().includes(searchTerm.toLowerCase()) || v.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchYear && matchSearch;
  });

  const handleSelectAllPhotos = () => {
    if (selectedPhotoIds.length === filteredPhotos.length) {
      setSelectedPhotoIds([]);
    } else {
      setSelectedPhotoIds(filteredPhotos.map(p => p.id));
    }
  };

  // Image Upload File Reader Simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'photo' | 'album' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === 'photo') {
        setPhotoForm(prev => ({ ...prev, url: result, thumbnailUrl: result }));
      } else if (target === 'album') {
        setAlbumForm(prev => ({ ...prev, coverImage: result }));
      } else if (target === 'video') {
        setVideoForm(prev => ({ ...prev, thumbnailUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-orange-500 text-white">
            <Sparkles className="w-3.5 h-3.5" /> Admin Media Control
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">
            Gallery Management System
          </h2>
          <p className="text-xs text-slate-300">
            Manage albums, high-res photos, YouTube/Vimeo/MP4 video links, category tags, SEO metadata, and publish state.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {subTab === 'photos' && (
            <>
              <button
                onClick={() => {
                  setEditingPhoto(null);
                  setPhotoForm({
                    title: '',
                    description: '',
                    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
                    category: 'Campus',
                    albumId: albums[0]?.id || '',
                    event: 'Campus Event',
                    year: 2026,
                    altText: '',
                    seoKeywords: '',
                    isPublished: true
                  });
                  setShowPhotoModal(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Add Photo
              </button>

              {selectedPhotoIds.length > 0 && (
                <button
                  onClick={handleBulkDeletePhotos}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow"
                >
                  <Trash2 className="w-4 h-4" /> Bulk Delete ({selectedPhotoIds.length})
                </button>
              )}
            </>
          )}

          {subTab === 'videos' && (
            <button
              onClick={() => {
                setEditingVideo(null);
                setVideoForm({
                  title: '',
                  description: '',
                  videoUrl: '',
                  type: 'youtube',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                  category: 'Campus',
                  event: 'Campus Seminar',
                  year: 2026,
                  isFeatured: false,
                  isPublished: true
                });
                setShowVideoModal(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> Add Video
            </button>
          )}

          {subTab === 'albums' && (
            <button
              onClick={() => {
                setEditingAlbum(null);
                setAlbumForm({
                  name: '',
                  description: '',
                  coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
                  category: 'Events',
                  year: 2026,
                  isPublished: true
                });
                setShowAlbumModal(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow"
            >
              <FolderPlus className="w-4 h-4" /> Create Album
            </button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {actionSuccess && (
        <div className="bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSubTab('photos')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            subTab === 'photos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Manage Photos ({photos.length})
        </button>
        <button
          onClick={() => setSubTab('videos')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            subTab === 'videos'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" /> Manage Videos ({videos.length})
        </button>
        <button
          onClick={() => setSubTab('albums')}
          className={`px-5 py-3 font-bold text-xs flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            subTab === 'albums'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Manage Albums ({albums.length})
        </button>
      </div>

      {/* Filter Toolbar for Admin */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, category..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {subTab === 'photos' && (
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold max-w-[150px] truncate"
            >
              <option value="all">All Albums</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* SUB TAB 1: MANAGE PHOTOS */}
      {subTab === 'photos' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={handleSelectAllPhotos}
              className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {selectedPhotoIds.length === filteredPhotos.length && filteredPhotos.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              Select All ({filteredPhotos.length})
            </button>
            <span className="text-slate-500 font-medium">Showing {filteredPhotos.length} photos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {filteredPhotos.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <div
                  key={photo.id}
                  className={`relative rounded-2xl border p-3 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between gap-3 transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                    
                    {/* Checkbox */}
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPhotoIds(prev => prev.filter(id => id !== photo.id));
                        } else {
                          setSelectedPhotoIds(prev => [...prev, photo.id]);
                        }
                      }}
                      className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-lg text-white cursor-pointer"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-white" />}
                    </button>

                    {/* Status Badge */}
                    <button
                      onClick={() => togglePhotoPublished(photo)}
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer text-white shadow ${
                        photo.isPublished ? 'bg-emerald-600' : 'bg-slate-600'
                      }`}
                    >
                      {photo.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{photo.title}</h4>
                    <p className="text-[10px] text-slate-500 flex justify-between">
                      <span>{photo.category}</span>
                      <span>Year: {photo.year}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingPhoto(photo);
                        setPhotoForm({
                          title: photo.title,
                          description: photo.description || '',
                          url: photo.url,
                          thumbnailUrl: photo.thumbnailUrl || photo.url,
                          category: photo.category,
                          albumId: photo.albumId || '',
                          event: photo.event || '',
                          year: photo.year,
                          altText: photo.altText || '',
                          seoKeywords: photo.seoKeywords || '',
                          isPublished: photo.isPublished
                        });
                        setShowPhotoModal(true);
                      }}
                      className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 2: MANAGE VIDEOS */}
      {subTab === 'videos' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredVideos.map((vid) => (
              <div
                key={vid.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-8 h-8 fill-white text-white" />
                  </div>

                  {vid.isFeatured && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Featured
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{vid.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{vid.description}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded font-bold">{vid.category}</span>
                  <span className="uppercase font-bold">{vid.type}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => toggleVideoFeatured(vid)}
                    className={`p-1.5 rounded-lg font-bold text-[10px] cursor-pointer flex items-center gap-1 ${
                      vid.isFeatured ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" /> {vid.isFeatured ? 'Featured' : 'Make Featured'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewVideo(vid)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingVideo(vid);
                        setVideoForm({
                          title: vid.title,
                          description: vid.description || '',
                          videoUrl: vid.videoUrl,
                          type: vid.type,
                          thumbnailUrl: vid.thumbnailUrl,
                          category: vid.category,
                          event: vid.event || '',
                          year: vid.year,
                          isFeatured: Boolean(vid.isFeatured),
                          isPublished: vid.isPublished
                        });
                        setShowVideoModal(true);
                      }}
                      className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteVideo(vid.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 3: MANAGE ALBUMS */}
      {subTab === 'albums' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {albums.map((alb) => (
            <div
              key={alb.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={alb.coverImage} alt={alb.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {alb.category}
                </span>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {alb.photoCount || 0} Photos
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{alb.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{alb.description}</p>
              </div>

              <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Year: {alb.year}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingAlbum(alb);
                      setAlbumForm({
                        name: alb.name,
                        description: alb.description || '',
                        coverImage: alb.coverImage,
                        category: alb.category,
                        year: alb.year,
                        isPublished: alb.isPublished
                      });
                      setShowAlbumModal(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer font-bold"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(alb.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PHOTO */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-100 dark:bg-slate-800 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                {editingPhoto ? 'Edit Photo Details' : 'Upload New Photo to Gallery'}
              </h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={photoForm.title}
                  onChange={e => setPhotoForm({ ...photoForm, title: e.target.value })}
                  placeholder="e.g. Modern Computer Lab Practical Session"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <select
                    value={photoForm.category}
                    onChange={e => setPhotoForm({ ...photoForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Assign to Album</label>
                  <select
                    value={photoForm.albumId}
                    onChange={e => setPhotoForm({ ...photoForm, albumId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    <option value="">-- Select Album (Optional) --</option>
                    {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Photo Image URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={photoForm.url}
                    onChange={e => setPhotoForm({ ...photoForm, url: e.target.value, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <label className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-3 py-2.5 rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" /> Browse
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'photo')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Event Name</label>
                  <input
                    type="text"
                    value={photoForm.event}
                    onChange={e => setPhotoForm({ ...photoForm, event: e.target.value })}
                    placeholder="e.g. Annual Fest 2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Year</label>
                  <input
                    type="number"
                    value={photoForm.year}
                    onChange={e => setPhotoForm({ ...photoForm, year: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">SEO Keywords & Alt Text</label>
                <input
                  type="text"
                  value={photoForm.seoKeywords}
                  onChange={e => setPhotoForm({ ...photoForm, seoKeywords: e.target.value, altText: e.target.value })}
                  placeholder="e.g. computer lab, DCA course, Parasia institute"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={photoForm.description}
                  onChange={e => setPhotoForm({ ...photoForm, description: e.target.value })}
                  placeholder="Short caption describing the event photo..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubPhoto"
                  checked={photoForm.isPublished}
                  onChange={e => setPhotoForm({ ...photoForm, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="pubPhoto" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Publish immediately on public website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT VIDEO */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-100 dark:bg-slate-800 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600" />
                {editingVideo ? 'Edit Video Link' : 'Add New Video Link'}
              </h3>
              <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Video Title *</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                  placeholder="e.g. Official Campus Virtual Tour"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Video Platform / Type</label>
                  <select
                    value={videoForm.type}
                    onChange={e => setVideoForm({ ...videoForm, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold uppercase"
                  >
                    <option value="youtube">YouTube Video</option>
                    <option value="vimeo">Vimeo Video</option>
                    <option value="mp4">Direct MP4 URL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <select
                    value={videoForm.category}
                    onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Video URL *</label>
                <input
                  type="url"
                  required
                  value={videoForm.videoUrl}
                  onChange={e => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Thumbnail Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoForm.thumbnailUrl}
                    onChange={e => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                  <label className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-3 py-2.5 rounded-xl font-bold cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-4 h-4" /> Browse
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'video')} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={videoForm.description}
                  onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                  placeholder="Video overview or highlight points..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featVid"
                    checked={videoForm.isFeatured}
                    onChange={e => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-orange-500 rounded"
                  />
                  <label htmlFor="featVid" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Highlight as Featured Video on Hero Banner
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pubVid"
                    checked={videoForm.isPublished}
                    onChange={e => setVideoForm({ ...videoForm, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <label htmlFor="pubVid" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Published
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white font-extrabold rounded-xl cursor-pointer"
                >
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT ALBUM */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="p-5 bg-slate-100 dark:bg-slate-800 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                {editingAlbum ? 'Edit Album' : 'Create New Album'}
              </h3>
              <button onClick={() => setShowAlbumModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Album Name *</label>
                <input
                  type="text"
                  required
                  value={albumForm.name}
                  onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })}
                  placeholder="e.g. Annual Tech & Cultural Fest 2026"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={albumForm.category}
                    onChange={e => setAlbumForm({ ...albumForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Year</label>
                  <input
                    type="number"
                    value={albumForm.year}
                    onChange={e => setAlbumForm({ ...albumForm, year: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Album Cover Image URL</label>
                <input
                  type="url"
                  value={albumForm.coverImage}
                  onChange={e => setAlbumForm({ ...albumForm, coverImage: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Album Description</label>
                <textarea
                  rows={2}
                  value={albumForm.description}
                  onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl cursor-pointer"
                >
                  Save Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PREVIEW PHOTO */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 text-white space-y-3">
            <button onClick={() => setPreviewPhoto(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <img src={previewPhoto.url} alt={previewPhoto.title} className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain" />
            <div className="space-y-1 text-xs">
              <h3 className="font-extrabold text-sm">{previewPhoto.title}</h3>
              <p className="text-slate-300">{previewPhoto.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PREVIEW VIDEO */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-4 text-white space-y-3">
            <button onClick={() => setPreviewVideo(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              {previewVideo.type === 'mp4' ? (
                <video src={previewVideo.videoUrl} controls autoPlay className="w-full h-full" />
              ) : (
                <iframe src={previewVideo.videoUrl} title={previewVideo.title} className="w-full h-full border-0" allowFullScreen />
              )}
            </div>
            <h3 className="font-extrabold text-sm">{previewVideo.title}</h3>
          </div>
        </div>
      )}

    </div>
  );
};
