import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SiteSettingsData } from '../components/admin/SiteSettings';
import { SectionConfig } from '../components/admin/visual-builder/VisualPageBuilder';

// Default section configuration
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

const defaultSettings: SiteSettingsData = {
  heroTitle: 'Kuwaiti Student Association',
  heroSubtitle: 'Supporting Kuwaiti students in Malta through academic excellence, cultural exchange, and building a strong community together.',
  heroCtaText: 'View Events',
  heroBackgroundImage: '',

  statMembers: '200+',
  statMembersLabel: 'Active Members',
  statEvents: '50+',
  statEventsLabel: 'Events Hosted',
  statCountries: '15+',
  statCountriesLabel: 'Partner Universities',
  statCommunitySpirit: '100%',
  statCommunityLabel: 'Community Spirit',

  aboutTitle: 'About KSA Malta',
  aboutDescription: 'We are dedicated to supporting Kuwaiti students in Malta.',

  contactEmail: 'info@ksa-malta.org',
  contactPhone: '+356 1234 5678',
  contactAddress: 'Malta',

  socialInstagram: '',
  socialTwitter: '',
  socialFacebook: '',
  socialLinkedin: '',

  sections: defaultSections,
};

interface UseSiteSettingsReturn {
  settings: SiteSettingsData;
  loading: boolean;
  error: string | null;
  isSectionVisible: (sectionId: string) => boolean;
  getSortedSections: () => SectionConfig[];
}

export function useSiteSettings(): UseSiteSettingsReturn {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'site'),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as Partial<SiteSettingsData>;
          setSettings({
            ...defaultSettings,
            ...data,
            sections: data.sections || defaultSections,
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching site settings:', err);
        setError('Failed to load settings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const isSectionVisible = (sectionId: string): boolean => {
    const section = settings.sections.find((s) => s.id === sectionId);
    return section?.visible ?? true;
  };

  const getSortedSections = (): SectionConfig[] => {
    return [...settings.sections].sort((a, b) => a.order - b.order);
  };

  return {
    settings,
    loading,
    error,
    isSectionVisible,
    getSortedSections,
  };
}

export default useSiteSettings;
