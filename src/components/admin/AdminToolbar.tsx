import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  PencilOff,
  Palette,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEdit } from '../../contexts/EditContext';
import ThemeEditorModal from './ThemeEditorModal';

export default function AdminToolbar() {
  const { isAdmin } = useAuth();
  const {
    isEditMode,
    toggleEditMode,
    hasChanges,
    changesCount,
    publishChanges,
    discardChanges,
    isPublishing,
  } = useEdit();

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handlePublish = async () => {
    try {
      await publishChanges();
      setShowSuccess(true);
      setIsExpanded(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setShowError(error instanceof Error ? error.message : 'Failed to publish changes');
      setTimeout(() => setShowError(null), 5000);
    }
  };

  const handleDiscard = () => {
    if (hasChanges && confirm('Are you sure you want to discard all pending changes?')) {
      discardChanges();
      setIsExpanded(false);
    }
  };

  const handleToggleEditMode = () => {
    toggleEditMode();
    if (!isEditMode) {
      // When entering edit mode, close the menu
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Toast Messages */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <CheckCircle size={20} />
                <span className="font-medium">Changes published!</span>
              </div>
            </motion.div>
          )}

          {showError && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <AlertCircle size={20} />
                <span className="font-medium">{showError}</span>
                <button onClick={() => setShowError(null)} className="ml-2 hover:opacity-80">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Mode Indicator Banner */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-gold text-white py-2 px-4 text-center text-sm font-medium shadow-md"
          >
            <div className="flex items-center justify-center gap-2">
              <Pencil size={16} />
              <span>Edit Mode Active</span>
              <span className="hidden sm:inline">- Click on any text or image to edit</span>
              {hasChanges && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs ml-2">
                  {changesCount} pending
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Floating Admin Panel */}
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Admin Controls</h3>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                {/* Edit Mode Toggle */}
                <MenuItem
                  onClick={handleToggleEditMode}
                  icon={isEditMode ? <EyeOff size={20} /> : <Eye size={20} />}
                  label={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                  description={isEditMode ? 'Stop editing content' : 'Edit text and images'}
                  active={isEditMode}
                />

                {/* Theme Editor */}
                <MenuItem
                  onClick={() => {
                    setIsThemeModalOpen(true);
                    setIsExpanded(false);
                  }}
                  icon={<Palette size={20} />}
                  label="Theme Colors"
                  description="Customize site colors"
                />

                {/* Divider */}
                {hasChanges && <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />}

                {/* Publish */}
                {hasChanges && (
                  <MenuItem
                    onClick={handlePublish}
                    disabled={isPublishing}
                    icon={
                      isPublishing ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Upload size={20} />
                      )
                    }
                    label={`Publish Changes`}
                    description={`${changesCount} change${changesCount > 1 ? 's' : ''} pending`}
                    variant="primary"
                  />
                )}

                {/* Discard */}
                {hasChanges && (
                  <MenuItem
                    onClick={handleDiscard}
                    icon={<Trash2 size={20} />}
                    label="Discard Changes"
                    description="Remove all pending changes"
                    variant="danger"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileTap={{ scale: 0.95 }}
          className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isEditMode
              ? 'bg-gold text-white'
              : isExpanded
              ? 'bg-gray-800 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <X size={24} />
            ) : isEditMode ? (
              <Pencil size={24} />
            ) : (
              <Settings size={24} />
            )}
          </motion.div>

          {/* Badge for pending changes */}
          {hasChanges && !isExpanded && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md"
            >
              {changesCount > 9 ? '9+' : changesCount}
            </motion.span>
          )}

          {/* Edit mode indicator ring */}
          {isEditMode && !isExpanded && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border-2 border-gold"
            />
          )}
        </motion.button>
      </div>

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
}

interface MenuItemProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description?: string;
  active?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}

function MenuItem({
  onClick,
  icon,
  label,
  description,
  active,
  disabled,
  variant = 'default',
}: MenuItemProps) {
  const variantStyles = {
    default: active
      ? 'bg-gold/10 text-gold border-gold/20'
      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200',
    primary: disabled
      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
      : 'bg-gold/10 hover:bg-gold/20 text-gold',
    danger: disabled
      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
      : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${variantStyles[variant]}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="font-medium text-sm">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      {active && (
        <span className="ml-auto shrink-0 w-2 h-2 bg-gold rounded-full mt-2" />
      )}
    </button>
  );
}
