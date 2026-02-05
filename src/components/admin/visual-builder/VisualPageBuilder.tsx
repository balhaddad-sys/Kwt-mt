import { useState, useEffect, useMemo, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Smartphone,
  Monitor,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  Move,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import {
  type SectionConfig,
  defaultSections,
  normalizeSections,
  sectionsEqual,
} from '../../../utils/normalizeSections';

// Re-export for backward compatibility
export type { SectionConfig };

// Constants
const SETTINGS_DOC_PATH = { col: 'settings', id: 'site' } as const;
const SCHEMA_VERSION = 1;

// Loading state discriminated union
type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

// Section preview data for visual representation
interface SectionPreview {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  previewHeight: string;
}

// Define section preview metadata
const sectionPreviews: Record<string, SectionPreview> = {
  hero: {
    id: 'hero',
    label: 'Hero Banner',
    description: 'Main hero section with title, subtitle and CTA',
    icon: '🏠',
    color: 'from-primary-500 to-primary-700',
    previewHeight: 'h-32',
  },
  announcements: {
    id: 'announcements',
    label: 'Announcements',
    description: 'Important announcements banner',
    icon: '📢',
    color: 'from-amber-500 to-orange-500',
    previewHeight: 'h-12',
  },
  stats: {
    id: 'stats',
    label: 'Statistics',
    description: 'Key numbers and metrics display',
    icon: '📊',
    color: 'from-blue-500 to-cyan-500',
    previewHeight: 'h-20',
  },
  about: {
    id: 'about',
    label: 'About Section',
    description: 'About us with text and image gallery',
    icon: '💬',
    color: 'from-green-500 to-emerald-500',
    previewHeight: 'h-28',
  },
  'featured-events': {
    id: 'featured-events',
    label: 'Featured Events',
    description: 'Highlighted events in card grid',
    icon: '⭐',
    color: 'from-purple-500 to-violet-500',
    previewHeight: 'h-24',
  },
  'upcoming-events': {
    id: 'upcoming-events',
    label: 'Upcoming Events',
    description: 'Calendar of upcoming events',
    icon: '📅',
    color: 'from-indigo-500 to-blue-500',
    previewHeight: 'h-24',
  },
  'why-join': {
    id: 'why-join',
    label: 'Why Join Us',
    description: 'Benefits and features cards',
    icon: '🎯',
    color: 'from-pink-500 to-rose-500',
    previewHeight: 'h-20',
  },
  cta: {
    id: 'cta',
    label: 'Call to Action',
    description: 'Main conversion section',
    icon: '🚀',
    color: 'from-secondary-500 to-teal-500',
    previewHeight: 'h-24',
  },
  gallery: {
    id: 'gallery',
    label: 'Gallery Preview',
    description: 'Photo gallery grid',
    icon: '🖼️',
    color: 'from-orange-500 to-red-500',
    previewHeight: 'h-20',
  },
};

// Sortable Section Item Component
interface SortableSectionItemProps {
  section: SectionConfig;
  preview: SectionPreview;
  onToggleVisibility: (id: string) => void;
  isCompact: boolean;
  isDragging?: boolean;
}

function SortableSectionItem({
  section,
  preview,
  onToggleVisibility,
  isCompact,
  isDragging = false,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative rounded-xl border-2 transition-all duration-200 ${
        isCurrentlyDragging
          ? 'border-primary-500 shadow-xl shadow-primary-500/20 z-50 scale-[1.02]'
          : section.visible
          ? 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
          : 'border-dashed border-neutral-300 dark:border-neutral-600 opacity-50'
      } ${
        section.visible
          ? 'bg-white dark:bg-neutral-800'
          : 'bg-neutral-100 dark:bg-neutral-900'
      }`}
    >
      {/* Drag Handle - Large touch target */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-0 left-0 right-0 ${
          isCompact ? 'h-10' : 'h-12'
        } bg-gradient-to-r ${
          section.visible ? preview.color : 'from-neutral-400 to-neutral-500'
        } rounded-t-xl cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 touch-none`}
      >
        <GripVertical className="w-5 h-5 text-white/80" />
        <span className="text-white text-sm font-medium select-none">
          <Move className="w-4 h-4 inline mr-1" />
          Hold to Drag
        </span>
      </div>

      {/* Content */}
      <div className={`${isCompact ? 'pt-12 p-3' : 'pt-14 p-4'}`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`${isCompact ? 'text-2xl' : 'text-3xl'} shrink-0 ${
              !section.visible && 'grayscale opacity-50'
            }`}
          >
            {preview.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4
                className={`font-semibold text-neutral-900 dark:text-white truncate ${
                  !section.visible && 'line-through text-neutral-500'
                }`}
              >
                {preview.label}
              </h4>
              {!isCompact && (
                <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                  #{section.order + 1}
                </span>
              )}
            </div>
            {!isCompact && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                {preview.description}
              </p>
            )}
          </div>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(section.id);
            }}
            className={`shrink-0 ${
              isCompact ? 'w-9 h-9' : 'w-10 h-10'
            } rounded-lg flex items-center justify-center transition-colors ${
              section.visible
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-600'
            }`}
            title={section.visible ? 'Hide section' : 'Show section'}
          >
            {section.visible ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Preview Bar */}
        {!isCompact && (
          <div
            className={`mt-3 rounded-lg bg-gradient-to-r ${preview.color} ${preview.previewHeight} ${
              !section.visible && 'grayscale opacity-30'
            } flex items-center justify-center`}
          >
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <LayoutGrid className="w-4 h-4" />
              <span>Section Preview</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Drag Overlay Component
function DragOverlayContent({
  section,
  preview,
  isCompact,
}: {
  section: SectionConfig;
  preview: SectionPreview;
  isCompact: boolean;
}) {
  return (
    <div
      className={`rounded-xl border-2 border-primary-500 shadow-2xl shadow-primary-500/30 bg-white dark:bg-neutral-800 ${
        isCompact ? 'w-72' : 'w-80'
      }`}
    >
      <div
        className={`${
          isCompact ? 'h-10' : 'h-12'
        } bg-gradient-to-r ${preview.color} rounded-t-xl flex items-center justify-center gap-2`}
      >
        <GripVertical className="w-5 h-5 text-white/80" />
        <span className="text-white text-sm font-medium">Moving...</span>
      </div>
      <div className={`${isCompact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <span className={`${isCompact ? 'text-2xl' : 'text-3xl'}`}>
            {preview.icon}
          </span>
          <h4 className="font-semibold text-neutral-900 dark:text-white">
            {preview.label}
          </h4>
        </div>
      </div>
    </div>
  );
}

// Main Visual Page Builder Component
export default function VisualPageBuilder() {
  const { currentUser, isAdmin } = useAuth();

  // --- State: remote vs draft ---
  const [remoteSections, setRemoteSections] =
    useState<SectionConfig[]>(defaultSections);
  const [draftSections, setDraftSections] =
    useState<SectionConfig[]>(defaultSections);
  const dirtyRef = useRef(false);

  // --- Loading, saving, feedback ---
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Conflict detection ---
  const [remoteChangedWhileDirty, setRemoteChangedWhileDirty] = useState(false);

  // --- DnD state ---
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');

  // Derived: has unsaved changes
  const hasChanges = !sectionsEqual(draftSections, remoteSections);

  // Keep dirtyRef in sync so the onSnapshot callback can read it without stale closures
  useEffect(() => {
    dirtyRef.current = hasChanges;
  }, [hasChanges]);

  // Sort draft sections by order for rendering
  const sortedSections = useMemo(
    () => [...draftSections].sort((a, b) => a.order - b.order),
    [draftSections]
  );

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Realtime sync with Firestore ---
  useEffect(() => {
    const ref = doc(db, SETTINGS_DOC_PATH.col, SETTINGS_DOC_PATH.id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        const normalized = normalizeSections(data?.sections);
        setRemoteSections(normalized);

        if (!dirtyRef.current) {
          // No local edits — keep draft in sync
          setDraftSections(normalized);
        } else {
          // Show "someone else updated" banner
          setRemoteChangedWhileDirty(true);
        }
        setLoadState({ status: 'ready' });
      },
      () => {
        setLoadState({ status: 'error', message: 'Failed to load page layout' });
      }
    );
    return () => unsub();
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setDraftSections((items) => {
        const sorted = [...items].sort((a, b) => a.order - b.order);
        const oldIndex = sorted.findIndex((item) => item.id === active.id);
        const newIndex = sorted.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(sorted, oldIndex, newIndex);
        // Update order values
        return reordered.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
      setSaveSuccess(false);
      setError(null);
    }
  };

  // Toggle section visibility
  const handleToggleVisibility = (sectionId: string) => {
    setDraftSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
    setSaveSuccess(false);
    setError(null);
  };

  // Save changes to Firebase
  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      await setDoc(
        doc(db, SETTINGS_DOC_PATH.col, SETTINGS_DOC_PATH.id),
        {
          sections: normalizeSections(draftSections),
          _schemaVersion: SCHEMA_VERSION,
          _lastUpdated: serverTimestamp(),
          _updatedBy: currentUser.uid,
        },
        { merge: true }
      );

      // remoteSections updates automatically via the onSnapshot listener
      setRemoteChangedWhileDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving layout:', err);
      setError('Failed to save layout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    if (hasChanges) {
      if (
        !window.confirm(
          'Discard all changes and restore the latest saved layout?'
        )
      ) {
        return;
      }
    }
    setDraftSections(remoteSections);
    setRemoteChangedWhileDirty(false);
    setError(null);
  };

  // Get active section for drag overlay
  const activeSection = activeId
    ? sortedSections.find((s) => s.id === activeId)
    : null;

  // --- Non-admin guard ---
  if (!isAdmin) {
    return (
      <Card hover={false} className="max-w-md mx-auto mt-12">
        <div className="p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            You need administrator privileges to manage the page layout.
          </p>
        </div>
      </Card>
    );
  }

  // --- Loading state ---
  if (loadState.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">Loading page layout...</p>
        </div>
      </div>
    );
  }

  // --- Error state (initial load failure) ---
  if (loadState.status === 'error') {
    return (
      <Card hover={false} className="max-w-md mx-auto mt-12">
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            Failed to Load
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            {loadState.message}
          </p>
        </div>
      </Card>
    );
  }

  const isCompact = viewMode === 'mobile';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shrink-0">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Visual Page Builder
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Drag sections to reorder your homepage layout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'mobile'
                  ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Compact</span>
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'desktop'
                  ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Detailed</span>
            </button>
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium hidden sm:inline">
                Unsaved changes
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              disabled={!hasChanges || saving}
            >
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={
                saveSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Layout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Conflict Banner */}
      {remoteChangedWhileDirty && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          Someone updated the layout while you have unsaved changes. Save to
          overwrite, or Reset to pull latest.
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Instructions */}
      <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
        <div className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <div className="text-sm text-primary-700 dark:text-primary-300">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="space-y-1 text-primary-600 dark:text-primary-400">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>
                  <strong>Drag</strong> the colored handle bar to reorder sections
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>
                  <strong>Tap the eye icon</strong> to show/hide a section
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>
                  <strong>Save</strong> when you're happy with the layout
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Section List with Drag and Drop */}
      <Card padding="lg" className="overflow-visible">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Page Sections
          </h3>
          <span className="text-xs text-neutral-500">
            {sortedSections.filter((s) => s.visible).length} of{' '}
            {sortedSections.length} visible
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`grid gap-4 ${isCompact ? 'sm:grid-cols-2' : ''}`}>
              <AnimatePresence mode="popLayout">
                {sortedSections.map((section) => {
                  const preview = sectionPreviews[section.id];
                  if (!preview) return null;

                  return (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      preview={preview}
                      onToggleVisibility={handleToggleVisibility}
                      isCompact={isCompact}
                      isDragging={activeId === section.id}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeSection && sectionPreviews[activeSection.id] ? (
              <DragOverlayContent
                section={activeSection}
                preview={sectionPreviews[activeSection.id]}
                isCompact={isCompact}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </Card>

      {/* Footer Note */}
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Changes will be applied to the homepage after saving.
        <br />
        <span className="text-xs">
          Refresh the homepage to see your new layout.
        </span>
      </p>
    </motion.div>
  );
}
