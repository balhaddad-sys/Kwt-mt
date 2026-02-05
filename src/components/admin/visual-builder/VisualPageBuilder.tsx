import { useState, useEffect, useMemo } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Smartphone,
  Monitor,
  LayoutGrid,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { SectionConfig } from './types';
import { defaultSections, sectionPreviews } from './constants';
import SortableSectionItem from './SortableSectionItem';
import DragOverlayContent from './DragOverlayContent';

export default function VisualPageBuilder() {
  const { currentUser } = useAuth();
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [originalSections, setOriginalSections] =
    useState<SectionConfig[]>(defaultSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');

  // Sort sections by order
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
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

  // Fetch settings from Firebase
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          if (data.sections && Array.isArray(data.sections)) {
            setSections(data.sections);
            setOriginalSections(data.sections);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load page layout');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Check for changes
  const hasChanges = JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);
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
    setSections((prev) =>
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
      // Get existing settings first
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      const existingData = settingsDoc.exists() ? settingsDoc.data() : {};

      await setDoc(doc(db, 'settings', 'site'), {
        ...existingData,
        sections: sections,
        _lastUpdated: Timestamp.now(),
        _updatedBy: currentUser.uid,
      });

      setOriginalSections(sections);
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
    if (window.confirm('Discard all changes and restore the original layout?')) {
      setSections(originalSections);
      setError(null);
    }
  };

  // Get active section for drag overlay
  const activeSection = activeId
    ? sortedSections.find((s) => s.id === activeId)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-neutral-500">Loading page layout...</p>
        </div>
      </div>
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
