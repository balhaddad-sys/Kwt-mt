import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Camera, Heart } from 'lucide-react';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import EventCard from '../components/common/EventCard';
import { EditableText, EditableImage } from '../components/editable';
import { mockEvents, mockStatistics, mockAnnouncements } from '../data/mockData';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useLivePageEditor } from '../components/admin/LivePageEditor';

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 right-0 md:right-20 w-48 md:w-72 h-48 md:h-72 bg-accent-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 md:left-20 w-64 md:w-96 h-64 md:h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 rounded-full text-accent-500 text-sm font-medium mb-6">
              <EditableText
                value="Welcome to Our Community"
                collection="content"
                documentId="home-hero"
                field="tagline"
                as="span"
              />
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              <EditableText
                value="Kuwaiti Student Association"
                collection="content"
                documentId="home-hero"
                field="title"
                as="span"
                className="block"
              />{' '}
              <span className="text-accent-500">
                <EditableText
                  value="Malta"
                  collection="content"
                  documentId="home-hero"
                  field="titleHighlight"
                  as="span"
                />
              </span>
            </h1>
            <div className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg">
              <EditableText
                value="Connecting Kuwaiti students in Malta, fostering cultural exchange, and building a strong community away from home."
                collection="content"
                documentId="home-hero"
                field="description"
                as="p"
                multiline
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/events">
                <Button
                  variant="secondary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Upcoming Events
                </Button>
              </Link>
              <Link to="/contact#membership">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-500"
                >
                  Join Our Community
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full bg-accent-500/20 rounded-2xl" />
              <EditableImage
                src="https://images.unsplash.com/photo-1529543544277-750e0d339888?w=800&h=600&fit=crop"
                alt="Kuwaiti students gathering"
                collection="content"
                documentId="home-hero"
                field="heroImage"
                className="rounded-2xl shadow-2xl relative z-10"
                containerClassName="w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}

// Announcements Section Component
function AnnouncementsSection() {
  if (mockAnnouncements.length === 0 || mockAnnouncements[0].priority !== 'high') {
    return null;
  }

  return (
    <div className="bg-accent-500 text-primary-900 py-3">
      <div className="container-custom">
        <div className="flex items-center justify-center space-x-2">
          <span className="font-semibold">{mockAnnouncements[0].title}</span>
          <span className="hidden sm:inline">-</span>
          <span className="hidden sm:inline">{mockAnnouncements[0].content}</span>
          <Link
            to="/events"
            className="ml-4 underline hover:no-underline font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

// Stats Section Component
function StatsSection() {
  const stats = [
    { icon: Users, value: mockStatistics.totalMembers + '+', label: 'Active Members', id: 'members' },
    { icon: Calendar, value: mockStatistics.totalEvents + '+', label: 'Events Hosted', id: 'events' },
    { icon: Camera, value: mockStatistics.totalPhotos + '+', label: 'Photos Shared', id: 'photos' },
    { icon: Heart, value: '100%', label: 'Community Spirit', id: 'spirit' },
  ];

  return (
    <Section variant="muted" padding="md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-4">
              <stat.icon className="w-7 h-7 text-primary-500 dark:text-accent-500" />
            </div>
            <div className="text-3xl md:text-4xl font-display font-bold text-primary-500 dark:text-accent-500">
              <EditableText
                value={stat.value}
                collection="content"
                documentId="home-stats"
                field={`${stat.id}Value`}
                as="span"
              />
            </div>
            <div className="text-neutral-600 dark:text-neutral-400 mt-1">
              <EditableText
                value={stat.label}
                collection="content"
                documentId="home-stats"
                field={`${stat.id}Label`}
                as="span"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// About Section Component
function AboutSection() {
  return (
    <Section>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent-500 font-medium mb-2 block">
            <EditableText
              value="About Us"
              collection="content"
              documentId="home-about"
              field="subtitle"
              as="span"
            />
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-500 dark:text-white mb-6">
            <EditableText
              value="A Home Away From Home"
              collection="content"
              documentId="home-about"
              field="title"
              as="span"
            />
          </h2>
          <div className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
            <EditableText
              value="The Kuwaiti Student Association in Malta is a vibrant community dedicated to supporting Kuwaiti students throughout their academic journey in Malta. Founded on the principles of unity, cultural preservation, and mutual support."
              collection="content"
              documentId="home-about"
              field="paragraph1"
              as="p"
              multiline
            />
          </div>
          <div className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            <EditableText
              value="We organize cultural events, social gatherings, academic support sessions, and networking opportunities to ensure every Kuwaiti student feels at home while pursuing their dreams in Malta."
              collection="content"
              documentId="home-about"
              field="paragraph2"
              as="p"
              multiline
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/about">
              <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Learn More
              </Button>
            </Link>
            <Link to="/team">
              <Button variant="outline">Meet Our Team</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="space-y-4">
            <EditableImage
              src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop"
              alt="Community event"
              collection="content"
              documentId="home-about"
              field="image1"
              className="rounded-xl shadow-lg w-full h-auto"
            />
            <EditableImage
              src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=400&fit=crop"
              alt="Group gathering"
              collection="content"
              documentId="home-about"
              field="image2"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          <div className="space-y-4 pt-8">
            <EditableImage
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop"
              alt="Dinner event"
              collection="content"
              documentId="home-about"
              field="image3"
              className="rounded-xl shadow-lg w-full h-auto"
            />
            <EditableImage
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
              alt="Celebration"
              collection="content"
              documentId="home-about"
              field="image4"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// Featured Events Section Component
function FeaturedEventsSection() {
  const featuredEvents = mockEvents.filter((e) => e.isFeatured).slice(0, 3);

  return (
    <Section variant="muted">
      <SectionHeader
        title="Featured Events"
        subtitle="Don't miss out on our upcoming community gatherings and celebrations"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {featuredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <EventCard event={event} variant="default" />
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/events">
          <Button
            variant="outline"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            View All Events
          </Button>
        </Link>
      </div>
    </Section>
  );
}

// Upcoming Events Section Component
function UpcomingEventsSection() {
  const upcomingEvents = mockEvents
    .filter((e) => new Date(e.date) > new Date())
    .slice(0, 4);

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <Section>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <span className="text-accent-500 font-medium mb-2 block">
            Mark Your Calendar
          </span>
          <h2 className="text-3xl font-display font-bold text-primary-500 dark:text-white mb-4">
            <EditableText
              value="Upcoming Events"
              collection="content"
              documentId="home-events"
              field="title"
              as="span"
            />
          </h2>
          <div className="text-neutral-600 dark:text-neutral-400 mb-6">
            <EditableText
              value="Stay connected with our community through our regular events and activities."
              collection="content"
              documentId="home-events"
              field="description"
              as="p"
              multiline
            />
          </div>
          <Link to="/events">
            <Button variant="primary" size="sm">
              See Full Calendar
            </Button>
          </Link>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      </div>
    </Section>
  );
}

// Why Join Section Component
function WhyJoinSection() {
  const items = [
    {
      id: 'network',
      title: 'Network',
      description: 'Connect with fellow Kuwaiti students and build lasting friendships',
      icon: '🤝',
    },
    {
      id: 'culture',
      title: 'Cultural Events',
      description: 'Celebrate our heritage together at national and cultural events',
      icon: '🎉',
    },
    {
      id: 'support',
      title: 'Support System',
      description: 'Get academic and personal support from your community',
      icon: '💪',
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      description: 'Access exclusive networking and career development events',
      icon: '🚀',
    },
  ];

  return (
    <Section variant="default">
      <SectionHeader
        title="Why Join KWT-MT?"
        subtitle="Benefits of being part of our community"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-lg font-semibold text-primary-500 dark:text-white mb-2">
              <EditableText
                value={item.title}
                collection="content"
                documentId="home-whyjoin"
                field={`${item.id}Title`}
                as="span"
              />
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              <EditableText
                value={item.description}
                collection="content"
                documentId="home-whyjoin"
                field={`${item.id}Description`}
                as="span"
                multiline
              />
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <Section variant="gradient" padding="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
          <EditableText
            value="Ready to Join Our Community?"
            collection="content"
            documentId="home-cta"
            field="title"
            as="span"
          />
        </h2>
        <div className="text-primary-100 text-lg mb-8">
          <EditableText
            value="Become a member of the Kuwaiti Student Association Malta and connect with fellow Kuwaiti students. Enjoy exclusive access to events, networking opportunities, and a supportive community."
            collection="content"
            documentId="home-cta"
            field="description"
            as="p"
            multiline
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact#membership">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Apply for Membership
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary-500"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </motion.div>
    </Section>
  );
}

// Gallery Section Component
function GallerySection() {
  const galleryItems = [
    { id: 'gallery1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop' },
    { id: 'gallery2', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop' },
    { id: 'gallery3', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=400&fit=crop' },
    { id: 'gallery4', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=400&fit=crop' },
  ];

  return (
    <Section variant="muted">
      <SectionHeader
        title="Gallery Highlights"
        subtitle="Capturing moments from our community events and gatherings"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="aspect-square overflow-hidden rounded-xl"
          >
            <EditableImage
              src={item.url}
              alt={`Gallery image ${index + 1}`}
              collection="content"
              documentId="home-gallery"
              field={item.id}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              aspectRatio="square"
            />
          </motion.div>
        ))}
      </div>
      <div className="text-center">
        <Link to="/gallery">
          <Button
            variant="outline"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            View Full Gallery
          </Button>
        </Link>
      </div>
    </Section>
  );
}

// Section renderer map
const sectionComponents: Record<string, React.FC> = {
  'hero': HeroSection,
  'announcements': AnnouncementsSection,
  'stats': StatsSection,
  'about': AboutSection,
  'featured-events': FeaturedEventsSection,
  'upcoming-events': UpcomingEventsSection,
  'why-join': WhyJoinSection,
  'cta': CTASection,
  'gallery': GallerySection,
};

export default function HomePage() {
  const { loading } = useSiteSettings();
  const {
    isAdmin,
    isEditMode,
    isLoaded,
    sections,
    hasChanges,
    saving,
    activeSection,
    sensors,
    toggleEditMode,
    handleDragStart,
    handleDragEnd,
    toggleVisibility,
    saveChanges,
    cancelChanges,
    DraggableSection,
    FloatingEditorButton,
    DragOverlayContent,
    DndContext,
    SortableContext,
    DragOverlay,
    closestCenter,
    verticalListSortingStrategy,
  } = useLivePageEditor();

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Filter visible sections when not in edit mode
  const visibleSections = isEditMode
    ? sections
    : sections.filter((s) => s.visible);

  return (
    <>
      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-blue-500 text-white text-center py-3 px-4 text-sm font-medium sticky top-0 z-50">
          <span className="mr-2">📐</span>
          Edit Mode: Drag sections to reorder, tap eye to hide/show
        </div>
      )}

      {/* Sections with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={isEditMode ? 'space-y-4 p-4 bg-neutral-100 dark:bg-neutral-900 min-h-screen' : ''}>
            {visibleSections.map((section) => {
              const SectionComponent = sectionComponents[section.id];
              if (!SectionComponent) return null;

              return (
                <DraggableSection
                  key={section.id}
                  section={section}
                  isEditMode={isEditMode}
                  onToggleVisibility={toggleVisibility}
                >
                  <SectionComponent />
                </DraggableSection>
              );
            })}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeSection ? (
            <DragOverlayContent section={activeSection} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Edit Button (Admin Only) */}
      {isAdmin && (
        <FloatingEditorButton
          isEditMode={isEditMode}
          hasChanges={hasChanges}
          saving={saving}
          onToggleEdit={toggleEditMode}
          onSave={saveChanges}
          onCancel={cancelChanges}
        />
      )}
    </>
  );
}
