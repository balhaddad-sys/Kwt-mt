import { SectionConfig, SectionPreview } from './types';

// Define section preview metadata
export const sectionPreviews: Record<string, SectionPreview> = {
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

// Default sections
export const defaultSections: SectionConfig[] = [
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
