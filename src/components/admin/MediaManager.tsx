import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  X,
  Download,
  Eye,
  Check,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { storage, db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { MediaItem } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

type MediaCategory = 'events' | 'team' | 'gallery' | 'hero' | 'general';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const categoryLabels: Record<MediaCategory, string> = {
  events: 'Events',
  team: 'Team',
  gallery: 'Gallery',
  hero: 'Hero Images',
  general: 'General',
};

const categoryColors: Record<MediaCategory, string> = {
  events: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300',
  team: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  gallery: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  hero: 'bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300',
  general: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

export default function MediaManager() {
  const { currentUser } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Refs to track mounted state and active upload tasks
  const isMountedRef = useRef(true);
  const activeUploadTasks = useRef<Map<string, UploadTask>>(new Map());

  // Cleanup on unmount: cancel active uploads
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel all active upload tasks
      activeUploadTasks.current.forEach((task) => {
        task.cancel();
      });
      activeUploadTasks.current.clear();
    };
  }, []);

  // Fetch media from Firestore
  useEffect(() => {
    const mediaQuery = query(
      collection(db, 'media'),
      orderBy('uploadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      mediaQuery,
      (snapshot) => {
        const mediaData: MediaItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          mediaData.push({
            id: doc.id,
            ...data,
            uploadedAt: data.uploadedAt?.toDate?.() || new Date(),
          } as MediaItem);
        });
        setMedia(mediaData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching media:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter media
  const filteredMedia = media.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle file upload
  const uploadFile = useCallback(async (file: File) => {
    if (!currentUser) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploading((prev) => [
        ...prev,
        { file, progress: 0, status: 'error', error: 'File size exceeds 5MB limit' },
      ]);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploading((prev) => [
        ...prev,
        { file, progress: 0, status: 'error', error: 'Invalid file type' },
      ]);
      return;
    }

    // Add to uploading state
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading',
    };
    setUploading((prev) => [...prev, uploadingFile]);

    // Create storage reference
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `media/${uploadCategory}/${filename}`);
    const taskId = `${timestamp}-${file.name}`;

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Track the upload task for cancellation
    activeUploadTasks.current.set(taskId, uploadTask);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploading((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress } : u
          )
        );
      },
      (error) => {
        // Remove from active tasks
        activeUploadTasks.current.delete(taskId);

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;

        // Ignore cancelled upload errors
        if (error.code === 'storage/canceled') {
          setUploading((prev) => prev.filter((u) => u.file !== file));
          return;
        }

        console.error('Upload error:', error);
        setUploading((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'error', error: 'Upload failed' } : u
          )
        );
      },
      async () => {
        // Remove from active tasks
        activeUploadTasks.current.delete(taskId);

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return;

        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Check mounted state again after async operation
          if (!isMountedRef.current) return;

          // Save to Firestore
          await addDoc(collection(db, 'media'), {
            url: downloadURL,
            filename: file.name,
            category: uploadCategory,
            mimeType: file.type,
            size: file.size,
            uploadedBy: currentUser.uid,
            uploadedAt: Timestamp.now(),
          });

          // Check mounted state again after async operation
          if (!isMountedRef.current) return;

          setUploading((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, status: 'completed', progress: 100 } : u
            )
          );

          // Remove from uploading state after delay
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setUploading((prev) => prev.filter((u) => u.file !== file));
          }, 2000);
        } catch (error) {
          // Check mounted state before updating state
          if (!isMountedRef.current) return;

          console.error('Error saving to Firestore:', error);
          setUploading((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, status: 'error', error: 'Failed to save metadata' } : u
            )
          );
        }
      }
    );
  }, [currentUser, uploadCategory]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        uploadFile(file);
      }
    });
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => uploadFile(file));
    e.target.value = '';
  }, [uploadFile]);

  // Handle delete
  const handleDelete = async (item: MediaItem) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, `media/${item.category}/${item.filename}`);
      try {
        await deleteObject(storageRef);
      } catch (e) {
        // File might not exist in storage
        console.warn('Could not delete from storage:', e);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'media', item.id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Media Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Upload and manage your images
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredMedia.length} items
          </span>
        </div>
      </div>

      {/* Upload Zone */}
      <Card padding="lg">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-neutral-400'}`} />
          <p className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            {isDragging ? 'Drop images here' : 'Drag & drop images here'}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            or click to browse (Max 5MB per file)
          </p>

          {/* Category Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Upload to:</span>
            {(Object.keys(categoryLabels) as MediaCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadCategory(cat);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  uploadCategory === cat
                    ? categoryColors[cat]
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Progress */}
        <AnimatePresence>
          {uploading.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {uploading.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {item.file.name}
                    </p>
                    <div className="mt-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          item.status === 'error'
                            ? 'bg-red-500'
                            : item.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  {item.status === 'completed' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs">{item.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryLabels) as MediaCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? categoryColors[cat]
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700 shadow' : ''}`}
            >
              <Grid className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700 shadow' : ''}`}
            >
              <List className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No images found
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Upload some images to get started
            </p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden"
            >
              <img
                src={item.url}
                alt={item.alt || item.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setSelectedImage(item)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="p-2 bg-white/20 rounded-full hover:bg-red-500/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${categoryColors[item.category]}`}>
                  {categoryLabels[item.category]}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <img
                  src={item.url}
                  alt={item.alt || item.filename}
                  className="w-16 h-16 object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 dark:text-white truncate">
                    {item.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[item.category]}`}>
                      {categoryLabels[item.category]}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatSize(item.size)}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.uploadedAt instanceof Date
                        ? item.uploadedAt.toLocaleDateString()
                        : new Date(item.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedImage(item)}
                    className="p-2 text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-neutral-500 hover:text-primary-500 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage.url}
              alt={selectedImage.alt || selectedImage.filename}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Delete Image?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This action cannot be undone. The image will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const item = media.find((m) => m.id === deleteConfirm);
                    if (item) handleDelete(item);
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
