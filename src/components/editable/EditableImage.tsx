import React, { useState, useRef, useCallback } from 'react';
import { Pencil, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useEdit } from '../../contexts/EditContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableImageProps {
  src: string;
  alt: string;
  collection: string;
  documentId: string;
  field: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | '4/3' | '3/2' | '16/9';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  placeholder?: React.ReactNode;
  onImageChange?: (file: File) => void;
}

export function EditableImage({
  src,
  alt,
  collection,
  documentId,
  field,
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  placeholder,
  onImageChange,
}: EditableImageProps) {
  const { isEditMode, addImageUpload, removeImageUpload, pendingUploads, getChangeKey } = useEdit();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadKey = getChangeKey(collection, documentId, field);
  const pendingUpload = Array.from(pendingUploads.values()).find(
    u => u.collection === collection && u.documentId === documentId && u.field === field
  );

  // Display pending upload preview or original src
  const displaySrc = pendingUpload?.previewUrl || src;
  const isPending = !!pendingUpload;

  const aspectRatioClass = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-[16/9]',
  }[aspectRatio];

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Add to pending uploads
    addImageUpload({
      id: uploadKey,
      file,
      collection,
      documentId,
      field,
      previewUrl,
    });

    if (onImageChange) {
      onImageChange(file);
    }
  }, [uploadKey, collection, documentId, field, addImageUpload, onImageChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isEditMode) {
      setIsDragging(true);
    }
  }, [isEditMode]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isEditMode) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [isEditMode, handleFileSelect]);

  const handleClick = useCallback(() => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isEditMode]);

  const handleRemovePending = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (pendingUpload) {
      removeImageUpload(pendingUpload.id);
    }
  }, [pendingUpload, removeImageUpload]);

  // Non-edit mode: just display the image
  if (!isEditMode) {
    if (!displaySrc && placeholder) {
      return <>{placeholder}</>;
    }

    return (
      <div className={`${containerClassName} ${aspectRatioClass}`}>
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={alt}
            className={`${className} ${objectFitClass} w-full h-full`}
          />
        ) : (
          <div className={`${className} w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center`}>
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group ${containerClassName} ${aspectRatioClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Image container */}
      <div
        className={`relative cursor-pointer transition-all duration-200 w-full h-full ${
          isPending ? 'ring-2 ring-gold ring-offset-2 rounded-lg' : ''
        } ${isDragging ? 'ring-4 ring-gold ring-offset-2 rounded-lg bg-gold/20' : ''}`}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={alt}
            className={`${className} ${objectFitClass} w-full h-full transition-all duration-200 ${
              isHovered ? 'brightness-75' : ''
            }`}
          />
        ) : (
          <div className={`${className} w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center min-h-[150px]`}>
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Click or drag to upload</p>
            </div>
          </div>
        )}

        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gold/30 flex items-center justify-center rounded-lg"
            >
              <div className="text-center text-white">
                <Upload className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Drop image here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && !isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                  <Pencil size={20} />
                </div>
                <p className="font-medium text-sm bg-black/50 px-2 py-1 rounded">
                  Click to change
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending indicator */}
        {isPending && (
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleRemovePending}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              title="Remove pending change"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Pending badge */}
        {isPending && !isHovered && (
          <div className="absolute -top-2 -left-2 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            Pending
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-red-500 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
