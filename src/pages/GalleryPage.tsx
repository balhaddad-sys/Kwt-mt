import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Search, Image, Heart, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import { mockGalleryImages, mockAlbums } from '../data/mockData';
import { GalleryImage } from '../types';

type ViewMode = 'all' | 'albums';

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredImages = useMemo(() => {
    let images = mockGalleryImages;

    if (selectedAlbum) {
      const album = mockAlbums.find((a) => a.id === selectedAlbum);
      if (album) {
        images = images.filter((img) => album.images.includes(img.id));
      }
    }

    if (searchQuery) {
      images = images.filter(
        (img) =>
          img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          img.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return images;
  }, [selectedAlbum, searchQuery]);

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setSelectedImage(filteredImages[prevIndex]);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    const nextIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredImages[nextIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedImage(null);
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 rounded-full text-accent-500 text-sm font-medium mb-6">
              Gallery
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Photo Gallery
            </h1>
            <p className="text-lg text-primary-100">
              Relive the moments from our events, gatherings, and celebrations.
              Browse through our collection of memories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <Section padding="md">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
              <button
                onClick={() => {
                  setViewMode('all');
                  setSelectedAlbum(null);
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                All Photos
              </button>
              <button
                onClick={() => setViewMode('albums')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'albums'
                    ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                Albums
              </button>
            </div>
          </div>
        </div>

        {selectedAlbum && (
          <div className="mt-4">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="text-primary-500 dark:text-accent-500 hover:underline flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to all albums
            </button>
          </div>
        )}
      </Section>

      {/* Albums View */}
      {viewMode === 'albums' && !selectedAlbum && (
        <Section variant="muted" padding="lg">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAlbums.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  padding="none"
                  className="cursor-pointer group"
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {album.coverImageURL ? (
                      <img
                        src={album.coverImageURL}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                        <Image className="w-16 h-16 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-display font-bold text-lg">{album.title}</h3>
                      <p className="text-sm text-white/80">
                        {album.images.length} photos
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Photos Grid */}
      {(viewMode === 'all' || selectedAlbum) && (
        <Section variant="muted" padding="lg">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-4 text-white">
                      <span className="flex items-center">
                        <Heart className="w-5 h-5 mr-1" />
                        {image.likes}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Image className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No photos found
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Try adjusting your search
              </p>
            </div>
          )}
        </Section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image */}
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-5xl max-h-[80vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title || 'Gallery image'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {/* Image info */}
              <div className="mt-4 text-white text-center">
                {selectedImage.title && (
                  <h3 className="font-display font-bold text-lg">
                    {selectedImage.title}
                  </h3>
                )}
                <div className="flex items-center justify-center space-x-4 mt-2 text-white/70">
                  <span className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {selectedImage.likes} likes
                  </span>
                  {selectedImage.tags.length > 0 && (
                    <span>
                      {selectedImage.tags.map((tag) => `#${tag}`).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70">
              {filteredImages.findIndex((img) => img.id === selectedImage.id) + 1} /{' '}
              {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
