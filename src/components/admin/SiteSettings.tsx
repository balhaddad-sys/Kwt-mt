import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Image,
  Hash,
  Type,
  Palette,
  Layers,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Re-export SectionConfig from the visual-builder module
export type { SectionConfig } from './visual-builder/VisualPageBuilder';

export interface SiteSettingsData {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroBackgroundImage: string;

  // Statistics
  statMembers: string;
  statMembersLabel: string;
  statEvents: string;
  statEventsLabel: string;
  statCountries: string;
  statCountriesLabel: string;
  statCommunitySpirit: string;
  statCommunityLabel: string;

  // About Section
  aboutTitle: string;
  aboutDescription: string;

  // Contact Info
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;

  // Social Links
  socialInstagram: string;
  socialTwitter: string;
  socialFacebook: string;
  socialLinkedin: string;

  // Section Layout
  sections: SectionConfig[];
}

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

  // Default section layout
  sections: [
    { id: 'hero', label: 'Hero Banner', visible: true, order: 0 },
    { id: 'announcements', label: 'Announcements', visible: true, order: 1 },
    { id: 'stats', label: 'Statistics', visible: true, order: 2 },
    { id: 'about', label: 'About Section', visible: true, order: 3 },
    { id: 'featured-events', label: 'Featured Events', visible: true, order: 4 },
    { id: 'upcoming-events', label: 'Upcoming Events', visible: true, order: 5 },
    { id: 'why-join', label: 'Why Join Us', visible: true, order: 6 },
    { id: 'cta', label: 'Call to Action', visible: true, order: 7 },
    { id: 'gallery', label: 'Gallery Preview', visible: true, order: 8 },
  ],
};

export default function SiteSettings() {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as SiteSettingsData;
          setSettings({ ...defaultSettings, ...data });
          setOriginalSettings({ ...defaultSettings, ...data });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleChange = (key: keyof SiteSettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
    setError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingImage(true);
    setError(null);

    try {
      const timestamp = Date.now();
      const filename = `hero-bg-${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `site/${filename}`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      handleChange('heroBackgroundImage', downloadURL);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, 'settings', 'site'), {
        ...settings,
        _lastUpdated: Timestamp.now(),
        _updatedBy: currentUser.uid,
      });
      setOriginalSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Discard all changes?')) {
      setSettings(originalSettings);
    }
  };

  // Section visibility toggle
  const handleSectionVisibilityToggle = (sectionId: string) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      ),
    }));
    setSaveSuccess(false);
    setError(null);
  };

  // Move section up in order
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const sortedSections = [...prev.sections].sort((a, b) => a.order - b.order);
      const currentIndex = sortedSections.findIndex((s) => s.id === sectionId);

      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === sortedSections.length - 1)
      ) {
        return prev;
      }

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Swap order values
      const newSections = sortedSections.map((section, index) => {
        if (index === currentIndex) {
          return { ...section, order: sortedSections[swapIndex].order };
        }
        if (index === swapIndex) {
          return { ...section, order: sortedSections[currentIndex].order };
        }
        return section;
      });

      return { ...prev, sections: newSections };
    });
    setSaveSuccess(false);
    setError(null);
  };

  // Get sorted sections for display
  const sortedSections = [...settings.sections].sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Site Settings
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Homepage, stats & contact
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 hidden sm:inline">Unsaved</span>
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
            leftIcon={saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            disabled={!hasChanges || saving}
          >
            {saving ? '...' : saveSuccess ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Hero Section Settings */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Hero Section
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hero Title
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hero Subtitle
              </label>
              <textarea
                value={settings.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={settings.heroCtaText}
                onChange={(e) => handleChange('heroCtaText', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hero Background Image
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={settings.heroBackgroundImage}
                  onChange={(e) => handleChange('heroBackgroundImage', e.target.value)}
                  placeholder="Image URL or upload below"
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <label className="px-4 py-2 bg-neutral-100 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              {settings.heroBackgroundImage && (
                <div className="mt-2 relative">
                  <img
                    src={settings.heroBackgroundImage}
                    alt="Hero background preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleChange('heroBackgroundImage', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Statistics Settings */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Homepage Statistics
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'statMembers' as const, labelKey: 'statMembersLabel' as const, title: 'Members' },
              { key: 'statEvents' as const, labelKey: 'statEventsLabel' as const, title: 'Events' },
              { key: 'statCountries' as const, labelKey: 'statCountriesLabel' as const, title: 'Universities/Countries' },
              { key: 'statCommunitySpirit' as const, labelKey: 'statCommunityLabel' as const, title: 'Community' },
            ].map((stat) => (
              <div key={stat.key} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {stat.title} Value
                  </label>
                  <input
                    type="text"
                    value={settings[stat.key]}
                    onChange={(e) => handleChange(stat.key, e.target.value)}
                    placeholder="200+"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {stat.title} Label
                  </label>
                  <input
                    type="text"
                    value={settings[stat.labelKey]}
                    onChange={(e) => handleChange(stat.labelKey, e.target.value)}
                    placeholder="Active Members"
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Contact Information */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Contact Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={settings.contactAddress}
                onChange={(e) => handleChange('contactAddress', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Social Media Links
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'socialInstagram' as const, label: 'Instagram URL' },
              { key: 'socialTwitter' as const, label: 'Twitter/X URL' },
              { key: 'socialFacebook' as const, label: 'Facebook URL' },
              { key: 'socialLinkedin' as const, label: 'LinkedIn URL' },
            ].map((social) => (
              <div key={social.key}>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {social.label}
                </label>
                <input
                  type="url"
                  value={settings[social.key]}
                  onChange={(e) => handleChange(social.key, e.target.value)}
                  placeholder="https://"
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Layout & Sections */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Layout & Sections
            </h3>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Show/hide sections and change their order on the homepage
          </p>

          <div className="space-y-2">
            {sortedSections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  section.visible
                    ? 'bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600'
                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 opacity-60'
                }`}
              >
                {/* Drag handle indicator */}
                <GripVertical className="w-4 h-4 text-neutral-400 shrink-0" />

                {/* Visibility toggle */}
                <button
                  onClick={() => handleSectionVisibilityToggle(section.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    section.visible
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-400'
                  }`}
                  title={section.visible ? 'Hide section' : 'Show section'}
                >
                  {section.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>

                {/* Section name */}
                <span
                  className={`flex-1 text-sm font-medium ${
                    section.visible
                      ? 'text-neutral-900 dark:text-white'
                      : 'text-neutral-500 dark:text-neutral-400 line-through'
                  }`}
                >
                  {section.label}
                </span>

                {/* Order position */}
                <span className="text-xs text-neutral-400 dark:text-neutral-500 w-6 text-center">
                  #{index + 1}
                </span>

                {/* Move up/down buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveSection(section.id, 'up')}
                    disabled={index === 0}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                      index === 0
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-200'
                    }`}
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveSection(section.id, 'down')}
                    disabled={index === sortedSections.length - 1}
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                      index === sortedSections.length - 1
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-200'
                    }`}
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
            Click the eye icon to show/hide a section. Use arrows to reorder.
          </p>
        </Card>
      </div>
    </motion.div>
  );
}
