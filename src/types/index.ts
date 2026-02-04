// User and Member types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'guest';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  studentIdURL?: string;
  university?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Senior Archive
export interface ArchiveFile {
  id: string;
  title: string;
  subject: 'Medicine' | 'Dentistry' | 'Engineering' | 'General';
  url: string;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Member {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  memberSince: Date;
  isActive: boolean;
  isPublic: boolean;
}

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  date: Date;
  endDate?: Date;
  time: string;
  location: string;
  locationDetails?: string;
  imageURL?: string;
  category: EventCategory;
  capacity?: number;
  attendees: string[];
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
}

export type EventCategory =
  | 'social'
  | 'cultural'
  | 'academic'
  | 'sports'
  | 'workshop'
  | 'networking'
  | 'celebration'
  | 'other';

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  memberName: string;
  email: string;
  status: 'attending' | 'maybe' | 'not-attending';
  guestCount: number;
  notes?: string;
  createdAt: Date;
}

// Gallery types
export interface GalleryImage {
  id: string;
  url: string;
  thumbnailURL?: string;
  title?: string;
  description?: string;
  eventId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  likes: number;
  tags: string[];
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverImageURL?: string;
  eventId?: string;
  images: string[];
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  isPublic: boolean;
}

// News and announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageURL?: string;
  priority: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

// Contact form
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  respondedAt?: Date;
}

// Membership application
export interface MembershipApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: number;
  whyJoin: string;
  howHeard: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

// Team/Leadership
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  position: string;
  bio: string;
  photoURL?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  order: number;
  isActive: boolean;
}

// Statistics
export interface Statistics {
  totalMembers: number;
  totalEvents: number;
  totalPhotos: number;
  upcomingEvents: number;
}

// Navigation
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// Admin Theme Colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gold: string;
  background: string;
  text: string;
  textLight: string;
}

export const defaultThemeColors: ThemeColors = {
  primary: '#1a3d52',
  secondary: '#00a89c',
  accent: '#c41e3a',
  gold: '#d4a851',
  background: '#f5f5f5',
  text: '#1a1a1a',
  textLight: '#ffffff',
};

// Admin Role Types
export type AdminRole = 'super_admin' | 'editor' | 'event_manager' | 'media_manager';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  photoURL?: string;
  invitedBy?: string;
  invitedAt?: Date;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Admin Audit Log
export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  resourceType: 'event' | 'member' | 'content' | 'media' | 'team' | 'theme' | 'settings' | 'admin';
  resourceId?: string;
  timestamp: Date;
}

// Content Management
export interface PageContent {
  id: string;
  pageId: string;
  sectionId: string;
  content: {
    en: string;
    ar: string;
  };
  lastUpdated: Date;
  updatedBy: string;
}

// Media Management
export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  category: 'events' | 'team' | 'gallery' | 'hero' | 'general';
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy: string;
  uploadedAt: Date;
  alt?: string;
  caption?: string;
}

// Event Categories with Colors
export const eventCategoryColors: Record<EventCategory, string> = {
  sports: '#00a89c',
  cultural: '#8b5cf6',
  academic: '#3b82f6',
  social: '#f59e0b',
  workshop: '#8b5cf6',
  networking: '#10b981',
  celebration: '#ec4899',
  other: '#6b7280',
};

// Site Settings
export interface SiteSettings {
  siteName: string;
  siteDescription: {
    en: string;
    ar: string;
  };
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
  foundedYear: number;
  memberCount: number;
}
