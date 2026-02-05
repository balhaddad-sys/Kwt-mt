import { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Globe,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

type PageId = 'home' | 'about' | 'events' | 'contact' | 'community' | 'resources';
type Language = 'en' | 'ar';

interface PageSection {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'richtext';
  maxLength?: number;
}

const pages: Record<PageId, { label: string; sections: PageSection[] }> = {
  home: {
    label: 'Home Page',
    sections: [
      { id: 'hero_title', label: 'Hero Title', description: 'Main headline on the hero section', type: 'text', maxLength: 100 },
      { id: 'hero_subtitle', label: 'Hero Subtitle', description: 'Subheading below the main title', type: 'text', maxLength: 200 },
      { id: 'hero_cta', label: 'CTA Button Text', description: 'Call to action button text', type: 'text', maxLength: 50 },
      { id: 'stats_members', label: 'Members Stat Label', description: 'Label for member count statistic', type: 'text', maxLength: 50 },
      { id: 'stats_events', label: 'Events Stat Label', description: 'Label for events hosted statistic', type: 'text', maxLength: 50 },
      { id: 'why_join_title', label: 'Why Join Section Title', description: 'Title for the benefits section', type: 'text', maxLength: 100 },
      { id: 'why_join_content', label: 'Why Join Content', description: 'Description of membership benefits', type: 'textarea', maxLength: 500 },
    ],
  },
  about: {
    label: 'About Page',
    sections: [
      { id: 'mission_title', label: 'Mission Title', description: 'Section title for mission statement', type: 'text', maxLength: 50 },
      { id: 'mission_content', label: 'Mission Statement', description: 'Your organization\'s mission', type: 'textarea', maxLength: 500 },
      { id: 'vision_title', label: 'Vision Title', description: 'Section title for vision', type: 'text', maxLength: 50 },
      { id: 'vision_content', label: 'Vision Statement', description: 'Your organization\'s vision', type: 'textarea', maxLength: 500 },
      { id: 'values_title', label: 'Values Title', description: 'Section title for values', type: 'text', maxLength: 50 },
      { id: 'values_content', label: 'Values Description', description: 'Your organization\'s core values', type: 'textarea', maxLength: 500 },
      { id: 'history_title', label: 'History Title', description: 'Section title for history', type: 'text', maxLength: 50 },
      { id: 'history_content', label: 'History Content', description: 'Brief history of the organization', type: 'textarea', maxLength: 1000 },
    ],
  },
  events: {
    label: 'Events Page',
    sections: [
      { id: 'page_title', label: 'Page Title', description: 'Main title for events page', type: 'text', maxLength: 50 },
      { id: 'page_description', label: 'Page Description', description: 'Introduction text for events', type: 'textarea', maxLength: 300 },
      { id: 'no_events_message', label: 'No Events Message', description: 'Message when no events are available', type: 'text', maxLength: 200 },
    ],
  },
  contact: {
    label: 'Contact Page',
    sections: [
      { id: 'page_title', label: 'Page Title', description: 'Main title for contact page', type: 'text', maxLength: 50 },
      { id: 'page_description', label: 'Page Description', description: 'Introduction text for contact', type: 'textarea', maxLength: 300 },
      { id: 'form_success', label: 'Form Success Message', description: 'Message after successful submission', type: 'text', maxLength: 200 },
      { id: 'membership_title', label: 'Membership Section Title', description: 'Title for membership application section', type: 'text', maxLength: 100 },
      { id: 'membership_description', label: 'Membership Description', description: 'Description of membership benefits', type: 'textarea', maxLength: 500 },
    ],
  },
  community: {
    label: 'Community Page',
    sections: [
      { id: 'page_title', label: 'Page Title', description: 'Main title for community page', type: 'text', maxLength: 50 },
      { id: 'page_description', label: 'Page Description', description: 'Introduction to community section', type: 'textarea', maxLength: 300 },
      { id: 'spotlight_title', label: 'Member Spotlight Title', description: 'Title for featured members section', type: 'text', maxLength: 100 },
    ],
  },
  resources: {
    label: 'Resources Page',
    sections: [
      { id: 'page_title', label: 'Page Title', description: 'Main title for resources page', type: 'text', maxLength: 50 },
      { id: 'page_description', label: 'Page Description', description: 'Introduction to resources', type: 'textarea', maxLength: 300 },
      { id: 'career_title', label: 'Career Center Title', description: 'Title for career section', type: 'text', maxLength: 100 },
      { id: 'mentorship_title', label: 'Mentorship Title', description: 'Title for mentorship section', type: 'text', maxLength: 100 },
    ],
  },
};

const defaultContent: Record<string, { en: string; ar: string }> = {
  'home_hero_title': { en: 'Connect. Achieve. Celebrate.', ar: 'تواصل. أنجز. احتفل.' },
  'home_hero_subtitle': { en: 'The premier Kuwaiti student community in Malta', ar: 'مجتمع الطلبة الكويتيين الأول في مالطا' },
  'home_hero_cta': { en: 'Join the Community', ar: 'انضم إلى المجتمع' },
};

export default function ContentManager() {
  const { currentUser } = useAuth();
  const [selectedPage, setSelectedPage] = useState<PageId>('home');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, { en: string; ar: string }>>({});
  const [originalContent, setOriginalContent] = useState<Record<string, { en: string; ar: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');

  // Fetch content from Firestore
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const contentDoc = await getDoc(doc(db, 'content', selectedPage));
        if (contentDoc.exists()) {
          const data = contentDoc.data() as Record<string, { en: string; ar: string }>;
          setContent(data);
          setOriginalContent(data);
        } else {
          // Initialize with defaults
          const defaultsForPage: Record<string, { en: string; ar: string }> = {};
          pages[selectedPage].sections.forEach((section) => {
            const key = `${selectedPage}_${section.id}`;
            defaultsForPage[section.id] = defaultContent[key] || { en: '', ar: '' };
          });
          setContent(defaultsForPage);
          setOriginalContent(defaultsForPage);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedPage]);

  const hasChanges = JSON.stringify(content) !== JSON.stringify(originalContent);

  const handleContentChange = (sectionId: string, lang: Language, value: string) => {
    setContent((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [lang]: value,
      },
    }));
    setSaveSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      await setDoc(doc(db, 'content', selectedPage), {
        ...content,
        _lastUpdated: Timestamp.now(),
        _updatedBy: currentUser.uid,
      });
      setOriginalContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving content:', err);
      setError('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Discard all changes?')) {
      setContent(originalContent);
    }
  };

  const getCharacterCount = (sectionId: string, lang: Language) => {
    return content[sectionId]?.[lang]?.length || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Content Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Edit page content
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
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Page Selector - Horizontal scroll on mobile */}
        <Card padding="sm">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {(Object.keys(pages) as PageId[]).map((pageId) => (
              <button
                key={pageId}
                onClick={() => setSelectedPage(pageId)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                  selectedPage === pageId
                    ? 'bg-primary-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {pages[pageId].label.replace(' Page', '')}
              </button>
            ))}
          </div>
        </Card>

        {/* Content Editor */}
        <div className="space-y-4">
          {/* Language Toggle */}
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  Editing Language
                </span>
              </div>
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveLanguage('en')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeLanguage === 'en'
                      ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveLanguage('ar')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeLanguage === 'ar'
                      ? 'bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>
          </Card>

          {/* Sections */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {pages[selectedPage].sections.map((section) => {
                const isExpanded = expandedSection === section.id;
                const charCount = getCharacterCount(section.id, activeLanguage);
                const isOverLimit = section.maxLength && charCount > section.maxLength;

                return (
                  <Card key={section.id} padding="none">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-white">
                          {section.label}
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {section.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {content[section.id]?.[activeLanguage] && (
                          <span className="text-xs text-neutral-500">
                            {charCount} chars
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-neutral-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                            {section.type === 'text' ? (
                              <input
                                type="text"
                                value={content[section.id]?.[activeLanguage] || ''}
                                onChange={(e) =>
                                  handleContentChange(section.id, activeLanguage, e.target.value)
                                }
                                maxLength={section.maxLength}
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                  activeLanguage === 'ar' ? 'text-right font-arabic' : ''
                                } ${
                                  isOverLimit
                                    ? 'border-red-500'
                                    : 'border-neutral-300 dark:border-neutral-600'
                                }`}
                                dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
                              />
                            ) : (
                              <textarea
                                value={content[section.id]?.[activeLanguage] || ''}
                                onChange={(e) =>
                                  handleContentChange(section.id, activeLanguage, e.target.value)
                                }
                                maxLength={section.maxLength}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                                  activeLanguage === 'ar' ? 'text-right font-arabic' : ''
                                } ${
                                  isOverLimit
                                    ? 'border-red-500'
                                    : 'border-neutral-300 dark:border-neutral-600'
                                }`}
                                dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
                              />
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span
                                className={`text-xs ${
                                  isOverLimit
                                    ? 'text-red-500'
                                    : 'text-neutral-500 dark:text-neutral-400'
                                }`}
                              >
                                {charCount}
                                {section.maxLength && ` / ${section.maxLength}`} characters
                              </span>
                              {content[section.id]?.en && content[section.id]?.ar && (
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Both languages filled
                                </span>
                              )}
                            </div>

                            {/* Show other language preview */}
                            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                {activeLanguage === 'en' ? 'Arabic version:' : 'English version:'}
                              </p>
                              <p
                                className={`text-sm text-neutral-600 dark:text-neutral-400 ${
                                  activeLanguage === 'en' ? 'text-right font-arabic' : ''
                                }`}
                                dir={activeLanguage === 'en' ? 'rtl' : 'ltr'}
                              >
                                {content[section.id]?.[activeLanguage === 'en' ? 'ar' : 'en'] ||
                                  'Not translated yet'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
