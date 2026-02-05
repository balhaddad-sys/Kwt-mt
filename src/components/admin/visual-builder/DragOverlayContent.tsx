import { GripVertical } from 'lucide-react';
import { SectionConfig, SectionPreview } from './types';

interface DragOverlayContentProps {
  section: SectionConfig;
  preview: SectionPreview;
  isCompact: boolean;
}

export default function DragOverlayContent({
  section,
  preview,
  isCompact,
}: DragOverlayContentProps) {
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
