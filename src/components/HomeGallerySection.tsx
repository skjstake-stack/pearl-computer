import React, { useState, useEffect } from 'react';
import { ImageIcon, Video, ArrowRight, Play, Sparkles } from 'lucide-react';
import { GalleryPhoto, GalleryVideo } from '../types';

interface HomeGallerySectionProps {
  onViewAllGallery: () => void;
}

export const HomeGallerySection: React.FC<HomeGallerySectionProps> = ({ onViewAllGallery }) => {
  const [latestPhotos, setLatestPhotos] = useState<GalleryPhoto[]>([]);
  const [latestVideos, setLatestVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePreview, setActivePreview] = useState<'photos' | 'videos'>('photos');

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery/photos?limit=4&publishedOnly=true').then(r => r.json()),
      fetch('/api/gallery/videos?limit=3&publishedOnly=true').then(r => r.json())
    ])
      .then(([photosData, videosData]) => {
        if (photosData.success) setLatestPhotos(photosData.photos || []);
        if (videosData.success) setLatestVideos(videosData.videos || []);
      })
      .catch((err) => console.error('Error fetching home gallery:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
              <Sparkles className="w-3.5 h-3.5" /> Campus Life & Events
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Life at Pearl Academy Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Take a glimpse into our high-tech computer labs, annual cultural functions, convocation ceremonies, and interactive practical workshops.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActivePreview('photos')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activePreview === 'photos' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Latest Photos
              </button>
              <button
                onClick={() => setActivePreview('videos')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activePreview === 'videos' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Latest Videos
              </button>
            </div>

            <button
              onClick={onViewAllGallery}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 transition-all"
            >
              View Full Gallery <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Display Grid */}
        {activePreview === 'photos' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={onViewAllGallery}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">
                      {photo.category}
                    </span>
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                      {photo.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={onViewAllGallery}
                className="group relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {vid.category}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {vid.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
