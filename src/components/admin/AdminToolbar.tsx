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
  ChevronUp,
  ChevronDown,
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handlePublish = async () => {
    try {
      await publishChanges();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setShowError(error instanceof Error ? error.message : 'Failed to publish changes');
      setTimeout(() => setShowError(null), 5000);
    }
  };

  const handleDiscard = () => {
    if (hasChanges && confirm('Are you sure you want to discard all pending changes?')) {
      discardChanges();
    }
  };

  return (
    <>
      {/* Floating Toolbar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          {/* Success/Error Messages */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  <CheckCircle size={18} />
                  <span>Changes published successfully!</span>
                </div>
              </motion.div>
            )}

            {showError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                  <AlertCircle size={18} />
                  <span>{showError}</span>
                  <button onClick={() => setShowError(null)} className="hover:opacity-80">
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Toolbar */}
          <motion.div
            layout
            className="bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Minimize/Expand Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-900 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <AnimatePresence mode="wait">
              {!isMinimized ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex items-center gap-1 p-2"
                >
                  {/* Edit Mode Toggle */}
                  <ToolbarButton
                    onClick={toggleEditMode}
                    active={isEditMode}
                    icon={isEditMode ? <PencilOff size={18} /> : <Pencil size={18} />}
                    label={isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                    tooltip={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
                  />

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-700 mx-1" />

                  {/* Theme Editor */}
                  <ToolbarButton
                    onClick={() => setIsThemeModalOpen(true)}
                    icon={<Palette size={18} />}
                    label="Theme"
                    tooltip="Edit theme colors"
                  />

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-700 mx-1" />

                  {/* Publish Changes */}
                  <ToolbarButton
                    onClick={handlePublish}
                    disabled={!hasChanges || isPublishing}
                    icon={
                      isPublishing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )
                    }
                    label="Publish"
                    tooltip={hasChanges ? `Publish ${changesCount} change(s)` : 'No changes to publish'}
                    badge={hasChanges ? changesCount : undefined}
                    variant="primary"
                  />

                  {/* Discard Changes */}
                  <ToolbarButton
                    onClick={handleDiscard}
                    disabled={!hasChanges}
                    icon={<Trash2 size={18} />}
                    label="Discard"
                    tooltip="Discard all changes"
                    variant="danger"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-sm text-gray-400">Admin Toolbar</span>
                  {hasChanges && (
                    <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {changesCount}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  variant?: 'default' | 'primary' | 'danger';
}

function ToolbarButton({
  onClick,
  icon,
  label,
  tooltip,
  active,
  disabled,
  badge,
  variant = 'default',
}: ToolbarButtonProps) {
  const variantStyles = {
    default: active
      ? 'bg-gray-700 text-white'
      : 'hover:bg-gray-700 text-gray-300 hover:text-white',
    primary: disabled
      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
      : 'bg-gold hover:bg-gold/90 text-white',
    danger: disabled
      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
      : 'hover:bg-red-500/20 text-red-400 hover:text-red-300',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${variantStyles[variant]}`}
    >
      {icon}
      <span className="text-sm font-medium hidden sm:inline">{label}</span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
