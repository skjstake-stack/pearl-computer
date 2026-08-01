import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  Search,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Calendar,
  Tag,
  FolderOpen,
  Eye,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { GalleryPhoto, GalleryVideo, GalleryAlbum } from '../types';

interface GalleryPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigateTab }) => {
  // Main Active Tab
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  // Photo Gallery State
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [photosLoading, setPhotosLoading] = useState<boolean>(true);
  const [photoSearch, setPhotoSearch] = useState<string>('');
  const [photoCategory, setPhotoCategory] = useState<string>('all');
  const [photoAlbum, setPhotoAlbum] = useState<string>('all');
  const [photoYear, setPhotoYear] = useState<string>('all');
  const [photoPage, setPhotoPage] = useState<number>(1);
  const [photoTotalPages, setPhotoTotalPages] = useState<number>(1);
  const [photoTotalCount, setPhotoTotalCount] = useState<number>(0);
  const [photoPageSize] = useState<number>(12);

  // Video Gallery State
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);
  const [videoSearch, setVideoSearch] = useState<string>('');
  const [videoCategory, setVideoCategory] = useState<string>('all');
  const [videoYear, setVideoYear] = useState<string>('all');
  const [videoPage, setVideoPage] = useState<number>(1);
  const [videoTotalPages, setVideoTotalPages] = useState<number>(1);
  const [videoTotalCount, setVideoTotalCount] = useState<number>(0);
  const [videoPageSize] = useState<number>(9);

  // Lightbox Modal State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);

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

  // Fetch Albums
  useEffect(() => {
    fetch('/api/gallery/albums')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAlbums(data.albums || []);
      })
      .catch(() => {});
  }, []);

  // Fetch Photos
  const fetchPhotos = async () => {
    setPhotosLoading(true);
    try {
      const params = new URLSearchParams({
        page: photoPage.toString(),
        limit: photoPageSize.toString(),
        category: photoCategory,
        albumId: photoAlbum,
        search: photoSearch,
        publishedOnly: 'true'
      });
      if (photoYear !== 'all') params.append('year', photoYear);

      const res = await fetch(`/api/gallery/photos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos || []);
        if (data.pagination) {
          setPhotoTotalPages(data.pagination.totalPages || 1);
          setPhotoTotalCount(data.pagination.totalCount || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setPhotosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'photos') fetchPhotos();
  }, [activeTab, photoPage, photoCategory, photoAlbum, photoYear, photoSearch]);

  // Fetch Videos
  const fetchVideos = async () => {
    setVideosLoading(true);
    try {
      const params = new URLSearchParams({
        page: videoPage.toString(),
        limit: videoPageSize.toString(),
        category: videoCategory,
        search: videoSearch,
        publishedOnly: 'true'
      });
      if (videoYear !== 'all') params.append('year', videoYear);

      const res = await fetch(`/api/gallery/videos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
        if (data.pagination) {
          setVideoTotalPages(data.pagination.totalPages || 1);
          setVideoTotalCount(data.pagination.totalCount || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'videos') fetchVideos();
  }, [activeTab, videoPage, videoCategory, videoYear, videoSearch]);

  // Lightbox Handlers
  const currentLightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  const handlePrevPhoto = () => {
    if (lightboxIndex === null) return;
    setZoomLevel(1);
    setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    if (lightboxIndex === null) return;
    setZoomLevel(1);
    setLightboxIndex(prev => (prev! < photos.length - 1 ? prev! + 1 : 0));
  };

  const handleSharePhoto = (url: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Pearl Computer Academy Gallery',
        text: 'Check out this campus photo from Pearl Computer & Target Academy!',
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Helper to parse Video Embed URL
  const getEmbedUrl = (v: GalleryVideo) => {
    if (v.type === 'youtube') {
      let videoId = 'dQw4w9WgXcQ';
      if (v.videoUrl.includes('v=')) {
        videoId = v.videoUrl.split('v=')[1]?.split('&')[0] || videoId;
      } else if (v.videoUrl.includes('youtu.be/')) {
        videoId = v.videoUrl.split('youtu.be/')[1]?.split('?')[0] || videoId;
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (v.type === 'vimeo') {
      const vimeoId = v.videoUrl.split('/').pop() || '76979871';
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
    return v.videoUrl;
  };

  const featuredVideo = videos.find(v => v.isFeatured) || videos[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero Section */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Institute Media Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Pearl Academy Photo & Video Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Explore our state-of-the-art computer labs, smart classrooms, annual cultural fests, convocation ceremonies, workshops, and sports activities at Parasia campus.
          </p>
        </div>

        {/* Navigation Tabs (Photo Gallery vs Video Gallery) */}
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800">
          <div className="flex space-x-2 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Photo Gallery
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" /> Video Gallery
            </button>
          </div>
        </div>

        {/* TAB 1: PHOTO GALLERY */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 text-xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={photoSearch}
                    onChange={(e) => {
                      setPhotoSearch(e.target.value);
                      setPhotoPage(1);
                    }}
                    placeholder="Search gallery photos, topics, events, keywords..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-bold">Category:</span>
                    <select
                      value={photoCategory}
                      onChange={(e) => {
                        setPhotoCategory(e.target.value);
                        setPhotoPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-bold">Album:</span>
                    <select
                      value={photoAlbum}
                      onChange={(e) => {
                        setPhotoAlbum(e.target.value);
                        setPhotoPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white cursor-pointer max-w-[160px] truncate"
                    >
                      <option value="all">All Albums</option>
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>{alb.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-bold">Year:</span>
                    <select
                      value={photoYear}
                      onChange={(e) => {
                        setPhotoYear(e.target.value);
                        setPhotoPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="all">All Years</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Category Chips Scrollable */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-[11px] font-bold">
                <button
                  onClick={() => { setPhotoCategory('all'); setPhotoPage(1); }}
                  className={`px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    photoCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All ({photoTotalCount})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setPhotoCategory(cat); setPhotoPage(1); }}
                    className={`px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                      photoCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos Grid */}
            {photosLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs text-slate-500 font-medium">Loading institute gallery photos...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-700">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No photos found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No images match your selected category or search filter. Try resetting filters or choosing another category.
                </p>
                <button
                  onClick={() => { setPhotoCategory('all'); setPhotoAlbum('all'); setPhotoYear('all'); setPhotoSearch(''); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setLightboxIndex(idx);
                      setZoomLevel(1);
                    }}
                    className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer relative flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.altText || photo.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <span className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                          <Maximize2 className="w-5 h-5" />
                        </span>
                      </div>

                      <span className="absolute top-3 left-3 bg-blue-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                        {photo.category}
                      </span>
                      <span className="absolute top-3 right-3 bg-orange-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {photo.year}
                      </span>
                    </div>

                    <div className="p-4 space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {photo.title}
                      </h4>
                      {photo.albumName && (
                        <p className="text-[10px] text-slate-400 line-clamp-1 flex items-center gap-1">
                          <FolderOpen className="w-3 h-3 text-slate-400 shrink-0" />
                          {photo.albumName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {photoTotalPages > 1 && (
              <div className="flex justify-between items-center text-xs pt-4 border-t dark:border-slate-800">
                <span className="text-slate-500 font-medium">
                  Showing Page <strong className="text-slate-900 dark:text-white">{photoPage}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white">{photoTotalPages}</strong> ({photoTotalCount} total photos)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={photoPage <= 1}
                    onClick={() => setPhotoPage(prev => Math.max(1, prev - 1))}
                    className="p-2 border rounded-xl disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: photoTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPhotoPage(p)}
                        className={`w-8 h-8 rounded-xl font-bold transition-colors cursor-pointer ${
                          photoPage === p ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={photoPage >= photoTotalPages}
                    onClick={() => setPhotoPage(prev => Math.min(photoTotalPages, prev + 1))}
                    className="p-2 border rounded-xl disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1 font-bold"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIDEO GALLERY */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            
            {/* Featured Video Spotlight Banner */}
            {featuredVideo && (
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden relative border border-blue-700/40">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  <div className="lg:col-span-7 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                      ★ Featured Video
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                      {featuredVideo.title}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {featuredVideo.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                      <span className="bg-blue-800/80 px-3 py-1 rounded-lg font-bold border border-blue-600/50">
                        Category: {featuredVideo.category}
                      </span>
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" /> {featuredVideo.year}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedVideo(featuredVideo)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all mt-2"
                    >
                      <Play className="w-4 h-4 fill-white" /> Watch Featured Tour Now
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => setSelectedVideo(featuredVideo)}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                      <img
                        src={featuredVideo.thumbnailUrl}
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Filters Bar */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={videoSearch}
                    onChange={(e) => {
                      setVideoSearch(e.target.value);
                      setVideoPage(1);
                    }}
                    placeholder="Search video titles, topics, seminars..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">Category:</span>
                    <select
                      value={videoCategory}
                      onChange={(e) => {
                        setVideoCategory(e.target.value);
                        setVideoPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold">Year:</span>
                    <select
                      value={videoYear}
                      onChange={(e) => {
                        setVideoYear(e.target.value);
                        setVideoPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="all">All Years</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Cards Grid */}
            {videosLoading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs text-slate-500 font-medium">Loading institute video gallery...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center space-y-3 border border-slate-200 dark:border-slate-700">
                <Video className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No videos found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No video records match your current filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setSelectedVideo(vid)}
                    className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>

                      <span className="absolute top-3 left-3 bg-blue-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow">
                        {vid.category}
                      </span>

                      <span className="absolute bottom-3 right-3 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {vid.type}
                      </span>
                    </div>

                    <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {vid.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <span>Event: {vid.event || 'Campus Event'}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{vid.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL 1: FULL LIGHTBOX PHOTO PREVIEW */}
      {currentLightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex justify-between items-center z-10">
            <div className="space-y-0.5">
              <span className="text-[10px] bg-blue-600 px-2.5 py-0.5 rounded-full font-bold">
                {currentLightboxPhoto.category} • {currentLightboxPhoto.year}
              </span>
              <h3 className="text-sm font-bold text-slate-200 line-clamp-1">
                {currentLightboxPhoto.title}
              </h3>
            </div>

            {/* Lightbox Toolbar Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <a
                href={currentLightboxPhoto.url}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer text-white"
                title="Download High Res Image"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleSharePhoto(currentLightboxPhoto.url)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Share Image"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Photo Viewing Canvas with Nav Arrows */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer shadow-xl transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-w-full max-h-full transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}>
              <img
                src={currentLightboxPhoto.url}
                alt={currentLightboxPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
            </div>

            <button
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer shadow-xl transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Details Footer */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-xs space-y-1 max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-center text-[11px] text-slate-300">
              <span>Photo {lightboxIndex! + 1} of {photos.length}</span>
              {currentLightboxPhoto.albumName && <span>Album: {currentLightboxPhoto.albumName}</span>}
            </div>
            {currentLightboxPhoto.description && (
              <p className="text-slate-200 text-xs">{currentLightboxPhoto.description}</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: RESPONSIVE VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden border border-slate-700 shadow-2xl text-white space-y-4">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base line-clamp-1">{selectedVideo.title}</h3>
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Embedded Video Area */}
            <div className="relative aspect-video bg-black w-full">
              {selectedVideo.type === 'mp4' ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={getEmbedUrl(selectedVideo)}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Video Details & Meta */}
            <div className="p-6 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full font-bold">
                  {selectedVideo.category}
                </span>
                <span>Year: {selectedVideo.year}</span>
              </div>
              <p className="text-slate-300 leading-relaxed pt-1">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
