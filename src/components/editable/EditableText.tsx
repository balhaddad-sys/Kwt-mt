import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useEdit } from '../../contexts/EditContext';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableTextProps {
  value: string;
  collection: string;
  documentId: string;
  field: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  maxLength?: number;
  children?: React.ReactNode;
}

export function EditableText({
  value,
  collection,
  documentId,
  field,
  as: Component = 'p',
  multiline = false,
  className = '',
  placeholder = 'Click to edit...',
  maxLength,
  children,
}: EditableTextProps) {
  const { isEditMode, addChange, removeChange, getChangeKey, hasPendingChange, pendingChanges } = useEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const changeKey = getChangeKey(collection, documentId, field);
  const isPending = hasPendingChange(changeKey);

  // Get the display value (pending change value or original)
  const displayValue = isPending
    ? pendingChanges.get(changeKey)?.newValue || value
    : value;

  // Sync local value when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(displayValue);
    }
  }, [displayValue, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = useCallback(() => {
    if (!isEditMode) return;
    setIsEditing(true);
    setLocalValue(displayValue);
  }, [isEditMode, displayValue]);

  const handleSave = useCallback(() => {
    const trimmedValue = localValue.trim();

    if (trimmedValue !== value) {
      addChange(changeKey, {
        collection,
        documentId,
        field,
        oldValue: value,
        newValue: trimmedValue,
        type: 'text',
        timestamp: new Date(),
      });
    } else {
      // If reverted to original, remove pending change
      removeChange(changeKey);
    }

    setIsEditing(false);
  }, [localValue, value, addChange, removeChange, changeKey, collection, documentId, field]);

  const handleCancel = useCallback(() => {
    setLocalValue(displayValue);
    setIsEditing(false);
  }, [displayValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [multiline, handleSave, handleCancel]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    setLocalValue(newValue);
  }, [maxLength]);

  // Click outside to save
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, handleSave]);

  // Show children if provided and not in edit mode
  if (children && !isEditMode) {
    return <Component className={className}>{children}</Component>;
  }

  // Non-edit mode: just display the value
  if (!isEditMode) {
    return (
      <Component className={className}>
        {displayValue || placeholder}
      </Component>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative group inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="relative">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`${className} w-full min-h-[100px] p-2 border-2 border-gold rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold resize-y`}
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={localValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`${className} w-full p-2 border-2 border-gold rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gold`}
              placeholder={placeholder}
            />
          )}

          {/* Action buttons */}
          <div className="absolute -bottom-10 left-0 flex gap-2 z-50">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium shadow-lg"
            >
              <Check size={14} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium shadow-lg"
            >
              <X size={14} />
              Cancel
            </button>
          </div>

          {/* Character count */}
          {maxLength && (
            <div className="absolute -bottom-10 right-0 text-xs text-gray-500">
              {localValue.length}/{maxLength}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleStartEditing}
          className={`relative cursor-pointer transition-all duration-200 ${
            isPending ? 'ring-2 ring-gold ring-offset-2 rounded' : ''
          } ${isHovered ? 'bg-gold/10 rounded' : ''}`}
        >
          <Component className={className}>
            {displayValue || <span className="opacity-50 italic">{placeholder}</span>}
          </Component>

          {/* Pencil icon on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-white rounded-full flex items-center justify-center shadow-lg z-10"
              >
                <Pencil size={12} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending change indicator */}
          {isPending && !isHovered && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">•</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
