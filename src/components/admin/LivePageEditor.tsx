import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  GripVertical,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

// Section config interface
interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

// Section metadata
const sectionMeta: Record<string, { label: string; icon: string }> = {
  hero: { label: 'Hero Banner', icon: '🏠' },
  announcements: { label: 'Announcements', icon: '📢' },
  stats: { label: 'Statistics', icon: '📊' },
  about: { label: 'About', icon: '💬' },
  'featured-events': { label: 'Featured Events', icon: '⭐' },
  'upcoming-events': { label: 'Upcoming Events', icon: '📅' },
  'why-join': { label: 'Why Join', icon: '🎯' },
  cta: { label: 'Call to Action', icon: '🚀' },
  gallery: { label: 'Gallery', icon: '🖼️' },
};

// Default sections
const defaultSections: SectionConfig[] = [
  { id: 'hero', label: 'Hero Banner', visible: true, order: 0 },
  { id: 'announcements', label: 'Announcements', visible: true, order: 1 },
  { id: 'stats', label: 'Statistics', visible: true, order: 2 },
  { id: 'about', label: 'About Section', visible: true, order: 3 },
  { id: 'featured-events', label: 'Featured Events', visible: true, order: 4 },
  { id: 'upcoming-events', label: 'Upcoming Events', visible: true, order: 5 },
  { id: 'why-join', label: 'Why Join Us', visible: true, order: 6 },
  { id: 'cta', label: 'Call to Action', visible: true, order: 7 },
  { id: 'gallery', label: 'Gallery Preview', visible: true, order: 8 },
];

// Draggable Section Wrapper
interface DraggableSectionProps {
  section: SectionConfig;
  children: React.ReactNode;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
}

function DraggableSection({
  section,
  children,
  isEditMode,
  onToggleVisibility,
}: DraggableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = sectionMeta[section.id] || { label: section.label, icon: '📄' };

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ${
        isDragging ? 'z-50 scale-[1.01]' : ''
      } ${!section.visible ? 'opacity-40' : ''}`}
    >
      {/* Edit Mode Handle Bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 bg-blue-500 text-white flex items-center justify-between px-3 py-2 rounded-t-xl shadow-lg ${
          isDragging ? 'bg-blue-600' : ''
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing touch-none flex-1"
        >
          <GripVertical className="w-5 h-5" />
          <span className="text-lg">{meta.icon}</span>
          <span className="font-medium text-sm">{meta.label}</span>
        </div>

        {/* Visibility Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(section.id);
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            section.visible
              ? 'bg-white/20 hover:bg-white/30'
              : 'bg-red-500/50 hover:bg-red-500/70'
          }`}
        >
          {section.visible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Section Content with border */}
      <div
        className={`border-2 border-dashed rounded-xl overflow-hidden ${
          isDragging
            ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
            : 'border-blue-400'
        } ${!section.visible ? 'grayscale' : ''}`}
        style={{ marginTop: '48px' }}
      >
        {children}
      </div>
    </div>
  );
}

// Floating Action Button
interface FloatingEditorButtonProps {
  isEditMode: boolean;
  hasChanges: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function FloatingEditorButton({
  isEditMode,
  hasChanges,
  saving,
  onToggleEdit,
  onSave,
  onCancel,
}: FloatingEditorButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end"
    >
      <AnimatePresence>
        {isEditMode && (
          <>
            {/* Cancel Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={onCancel}
              className="w-12 h-12 bg-neutral-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Save Button */}
            {hasChanges && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={onSave}
                disabled={saving}
                className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={isEditMode && hasChanges ? onSave : onToggleEdit}
        className={`flex items-center gap-2 px-5 py-4 rounded-full shadow-xl font-bold transition-all ${
          isEditMode
            ? hasChanges
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-neutral-900 hover:bg-neutral-800 text-white'
        }`}
      >
        {isEditMode ? (
          <>
            <Check className="w-5 h-5" />
            <span>{hasChanges ? 'Save' : 'Done'}</span>
          </>
        ) : (
          <>
            <Pencil className="w-5 h-5" />
            <span>Edit Layout</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

// Drag Overlay
function DragOverlayContent({ section }: { section: SectionConfig }) {
  const meta = sectionMeta[section.id] || { label: section.label, icon: '📄' };

  return (
    <div className="bg-blue-500 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[200px]">
      <GripVertical className="w-5 h-5" />
      <span className="text-lg">{meta.icon}</span>
      <span className="font-medium">{meta.label}</span>
    </div>
  );
}

// Main Hook for Live Page Editor
export function useLivePageEditor() {
  const { isAdmin, currentUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [originalSections, setOriginalSections] = useState<SectionConfig[]>(defaultSections);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 10 },
    })
  );

  // Load sections from Firebase
  useEffect(() => {
    const loadSections = async () => {
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
        console.error('Error loading sections:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSections();
  }, []);

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Check for changes
  const hasChanges = JSON.stringify(sections) !== JSON.stringify(originalSections);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (isEditMode && !hasChanges) {
      setIsEditMode(false);
    } else if (!isEditMode) {
      setIsEditMode(true);
    }
  }, [isEditMode, hasChanges]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  }, []);

  // Toggle visibility
  const toggleVisibility = useCallback((sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  }, []);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
      const existingData = settingsDoc.exists() ? settingsDoc.data() : {};

      await setDoc(doc(db, 'settings', 'site'), {
        ...existingData,
        sections: sections,
        _lastUpdated: Timestamp.now(),
        _updatedBy: currentUser.uid,
      });

      setOriginalSections(sections);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [sections, currentUser]);

  // Cancel changes
  const cancelChanges = useCallback(() => {
    setSections(originalSections);
    setIsEditMode(false);
  }, [originalSections]);

  // Get active section for overlay
  const activeSection = activeId
    ? sortedSections.find((s) => s.id === activeId)
    : null;

  return {
    isAdmin,
    isEditMode,
    isLoaded,
    sections: sortedSections,
    hasChanges,
    saving,
    activeId,
    activeSection,
    sensors,
    toggleEditMode,
    handleDragStart,
    handleDragEnd,
    toggleVisibility,
    saveChanges,
    cancelChanges,
    DraggableSection,
    FloatingEditorButton,
    DragOverlayContent,
    DndContext,
    SortableContext,
    DragOverlay,
    closestCenter,
    verticalListSortingStrategy,
  };
}

// Export components
export { DraggableSection, FloatingEditorButton, DragOverlayContent };
