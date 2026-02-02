import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Pencil,
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
  Image,
  Users,
  Calendar,
  FileText,
  LayoutGrid,
  ChevronUp,
  Home,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEdit } from '../../contexts/EditContext';
import ThemeEditorModal from './ThemeEditorModal';

export default function AdminToolbar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
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

  const isOnAdminPage = location.pathname.startsWith('/admin');

  const quickLinks = [
    { href: '/admin', icon: LayoutGrid, label: 'Dashboard', description: 'Admin overview' },
    { href: '/admin?tab=events', icon: Calendar, label: 'Events', description: 'Manage events' },
    { href: '/admin?tab=team', icon: Users, label: 'Team', description: 'Edit team members' },
    { href: '/admin?tab=media', icon: Image, label: 'Media', description: 'Upload images' },
    { href: '/admin?tab=content', icon: FileText, label: 'Content', description: 'Edit page content' },
  ];

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
              <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg max-w-sm">
                <AlertCircle size={20} className="shrink-0" />
                <span className="font-medium text-sm">{showError}</span>
                <button onClick={() => setShowError(null)} className="ml-2 hover:opacity-80 shrink-0">
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
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Pencil size={16} className="shrink-0" />
              <span>Edit Mode Active</span>
              <span className="hidden sm:inline">- Tap any text or image to edit</span>
              {hasChanges && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {changesCount} pending
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet / Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Admin Tools</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage your website</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] pb-8">
              {/* Edit Mode Section */}
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Content Editing
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Edit Mode Toggle */}
                  <button
                    onClick={() => {
                      toggleEditMode();
                      if (!isEditMode) setIsExpanded(false);
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      isEditMode
                        ? 'bg-gold/10 border-gold text-gold'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {isEditMode ? <EyeOff size={28} /> : <Eye size={28} />}
                    <span className="font-semibold mt-2 text-sm">
                      {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                    </span>
                    <span className="text-xs opacity-70 mt-0.5">
                      {isEditMode ? 'Stop editing' : 'Edit content'}
                    </span>
                  </button>

                  {/* Theme Colors */}
                  <button
                    onClick={() => {
                      setIsThemeModalOpen(true);
                      setIsExpanded(false);
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition-all hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Palette size={28} />
                    <span className="font-semibold mt-2 text-sm">Theme</span>
                    <span className="text-xs opacity-70 mt-0.5">Colors & style</span>
                  </button>
                </div>
              </div>

              {/* Pending Changes Section */}
              {hasChanges && (
                <div className="px-4 pb-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Pending Changes ({changesCount})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handlePublish}
                      disabled={isPublishing}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-green-500 text-white transition-all disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <Loader2 size={28} className="animate-spin" />
                      ) : (
                        <Upload size={28} />
                      )}
                      <span className="font-semibold mt-2 text-sm">Publish</span>
                      <span className="text-xs opacity-80 mt-0.5">Save all changes</span>
                    </button>

                    <button
                      onClick={handleDiscard}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 transition-all"
                    >
                      <Trash2 size={28} />
                      <span className="font-semibold mt-2 text-sm">Discard</span>
                      <span className="text-xs opacity-70 mt-0.5">Remove changes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Access Section */}
              <div className="px-4 pb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Quick Access
                </h3>
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsExpanded(false)}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isOnAdminPage && location.pathname + location.search === link.href
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
                        <link.icon size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{link.label}</div>
                        <div className="text-xs opacity-60">{link.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Back to Site */}
              {isOnAdminPage && (
                <div className="px-4 pb-4">
                  <Link
                    to="/"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-primary-500 text-white font-medium"
                  >
                    <Home size={20} />
                    Back to Website
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isEditMode
            ? 'bg-gold text-white'
            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
        }`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronUp size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Settings size={24} />
            </motion.div>
          )}
        </AnimatePresence>

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
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 rounded-full border-2 border-gold"
          />
        )}
      </motion.button>

      {/* Theme Editor Modal */}
      <ThemeEditorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  );
}
