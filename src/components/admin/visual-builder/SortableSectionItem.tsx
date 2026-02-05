import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  LayoutGrid,
  Move,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionConfig, SectionPreview } from './types';

interface SortableSectionItemProps {
  section: SectionConfig;
  preview: SectionPreview;
  onToggleVisibility: (id: string) => void;
  isCompact: boolean;
  isDragging?: boolean;
}

export default function SortableSectionItem({
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
