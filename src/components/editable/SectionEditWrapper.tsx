import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Move } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionEditWrapperProps {
  id: string;
  label: string;
  visible: boolean;
  isEditMode: boolean;
  onToggleVisibility: (id: string) => void;
  children: ReactNode;
}

export default function SectionEditWrapper({
  id,
  label,
  visible,
  isEditMode,
  onToggleVisibility,
  children,
}: SectionEditWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // When not in edit mode, just render the section normally
  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
      layout
    >
      {/* Section Controls Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {/* Drag Handle Bar */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-primary-500/95 backdrop-blur-sm cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-5 h-5 text-white/80" />
          <Move className="w-4 h-4 text-white/80" />
          <span className="text-white text-sm font-medium select-none">
            {label}
          </span>
        </div>
      </div>

      {/* Visibility Toggle Button - Always visible in edit mode */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(id);
        }}
        className={`absolute top-2 right-2 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
          visible
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
        title={visible ? 'Hide section' : 'Show section'}
      >
        {visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>

      {/* Section Content with visual feedback */}
      <div
        className={`relative transition-all duration-200 ${
          isDragging
            ? 'ring-4 ring-primary-500 ring-offset-2 rounded-lg'
            : 'group-hover:ring-2 group-hover:ring-primary-300 group-hover:ring-offset-1 rounded-lg'
        } ${!visible ? 'opacity-40' : ''}`}
      >
        {children}

        {/* Hidden overlay */}
        {!visible && (
          <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-neutral-500" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                Section Hidden
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
