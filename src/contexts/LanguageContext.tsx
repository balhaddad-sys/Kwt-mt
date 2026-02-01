import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.events': 'Events',
    'nav.team': 'Team',
    'nav.community': 'Community',
    'nav.gallery': 'Gallery',
    'nav.resources': 'Resources',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.admin': 'Admin',

    // Home page
    'home.hero.title': 'Connect. Achieve. Celebrate.',
    'home.hero.subtitle': 'The premier Kuwaiti student community in Malta',
    'home.hero.cta': 'Join the Community',
    'home.stats.members': 'Members',
    'home.stats.events': 'Events Hosted',
    'home.stats.founded': 'Founded',
    'home.upcoming': 'Upcoming Events',
    'home.whyJoin': 'Why Join KWT-MT?',

    // About page
    'about.mission': 'Our Mission',
    'about.vision': 'Our Vision',
    'about.values': 'Our Values',
    'about.history': 'Our History',
    'about.team': 'Leadership Team',
    'about.faq': 'Frequently Asked Questions',

    // Events page
    'events.title': 'Events',
    'events.upcoming': 'Upcoming Events',
    'events.past': 'Past Events',
    'events.all': 'All Events',
    'events.rsvp': 'RSVP',
    'events.details': 'View Details',
    'events.category.sports': 'Sports',
    'events.category.cultural': 'Cultural',
    'events.category.academic': 'Academic',
    'events.category.social': 'Social',
    'events.category.workshop': 'Workshop',
    'events.category.networking': 'Networking',
    'events.category.celebration': 'Celebration',
    'events.category.other': 'Other',

    // Contact page
    'contact.title': 'Contact Us',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'contact.membership': 'Membership Application',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.theme': 'Theme Editor',
    'admin.media': 'Media Manager',
    'admin.events': 'Event Manager',
    'admin.content': 'Content Manager',
    'admin.team': 'Team Manager',
    'admin.settings': 'Admin Settings',
    'admin.save': 'Save Changes',
    'admin.reset': 'Reset to Default',
    'admin.preview': 'Preview',

    // Footer
    'footer.rights': 'All rights reserved',
    'footer.follow': 'Follow Us',
    'footer.contact': 'Contact Info',
    'footer.links': 'Quick Links',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.events': 'الفعاليات',
    'nav.team': 'الفريق',
    'nav.community': 'المجتمع',
    'nav.gallery': 'المعرض',
    'nav.resources': 'الموارد',
    'nav.contact': 'تواصل معنا',
    'nav.login': 'تسجيل الدخول',
    'nav.admin': 'لوحة التحكم',

    // Home page
    'home.hero.title': 'تواصل. أنجز. احتفل.',
    'home.hero.subtitle': 'مجتمع الطلبة الكويتيين الأول في مالطا',
    'home.hero.cta': 'انضم إلى المجتمع',
    'home.stats.members': 'عضو',
    'home.stats.events': 'فعالية',
    'home.stats.founded': 'تأسست',
    'home.upcoming': 'الفعاليات القادمة',
    'home.whyJoin': 'لماذا تنضم إلى KWT-MT؟',

    // About page
    'about.mission': 'مهمتنا',
    'about.vision': 'رؤيتنا',
    'about.values': 'قيمنا',
    'about.history': 'تاريخنا',
    'about.team': 'فريق القيادة',
    'about.faq': 'الأسئلة الشائعة',

    // Events page
    'events.title': 'الفعاليات',
    'events.upcoming': 'الفعاليات القادمة',
    'events.past': 'الفعاليات السابقة',
    'events.all': 'جميع الفعاليات',
    'events.rsvp': 'تسجيل الحضور',
    'events.details': 'عرض التفاصيل',
    'events.category.sports': 'رياضة',
    'events.category.cultural': 'ثقافي',
    'events.category.academic': 'أكاديمي',
    'events.category.social': 'اجتماعي',
    'events.category.workshop': 'ورشة عمل',
    'events.category.networking': 'تواصل',
    'events.category.celebration': 'احتفال',
    'events.category.other': 'أخرى',

    // Contact page
    'contact.title': 'تواصل معنا',
    'contact.form.name': 'الاسم الكامل',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.subject': 'الموضوع',
    'contact.form.message': 'الرسالة',
    'contact.form.submit': 'إرسال الرسالة',
    'contact.membership': 'طلب العضوية',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.learnMore': 'اعرف المزيد',
    'common.viewAll': 'عرض الكل',

    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.theme': 'محرر المظهر',
    'admin.media': 'إدارة الوسائط',
    'admin.events': 'إدارة الفعاليات',
    'admin.content': 'إدارة المحتوى',
    'admin.team': 'إدارة الفريق',
    'admin.settings': 'إعدادات الإدارة',
    'admin.save': 'حفظ التغييرات',
    'admin.reset': 'إعادة التعيين',
    'admin.preview': 'معاينة',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.follow': 'تابعنا',
    'footer.contact': 'معلومات الاتصال',
    'footer.links': 'روابط سريعة',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language;
    return stored || 'en';
  });

  const isRTL = language === 'ar';

  // Apply RTL direction to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
