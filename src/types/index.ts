// User and Member types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
  lastLogin?: Date;
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
