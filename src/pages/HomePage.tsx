import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Camera, Heart } from 'lucide-react';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EventCard from '../components/common/EventCard';
import { mockEvents, mockStatistics, mockAnnouncements } from '../data/mockData';
import { motion } from 'framer-motion';

export default function HomePage() {
  const featuredEvents = mockEvents.filter((e) => e.isFeatured).slice(0, 3);
  const upcomingEvents = mockEvents
    .filter((e) => new Date(e.date) > new Date())
    .slice(0, 4);

  const stats = [
    { icon: Users, value: mockStatistics.totalMembers + '+', label: 'Active Members' },
    { icon: Calendar, value: mockStatistics.totalEvents + '+', label: 'Events Hosted' },
    { icon: Camera, value: mockStatistics.totalPhotos + '+', label: 'Photos Shared' },
    { icon: Heart, value: '100%', label: 'Community Spirit' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
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
                Welcome to Our Community
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                Kuwaiti Student Association{' '}
                <span className="text-accent-500">Malta</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg">
                Connecting Kuwaiti students in Malta, fostering cultural exchange,
                and building a strong community away from home.
              </p>
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
                <img
                  src="https://images.unsplash.com/photo-1529543544277-750e0d339888?w=800&h=600&fit=crop"
                  alt="Kuwaiti students gathering"
                  className="rounded-2xl shadow-2xl w-full h-auto relative z-10"
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

      {/* Announcements Banner (if any) */}
      {mockAnnouncements.length > 0 && mockAnnouncements[0].priority === 'high' && (
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
      )}

      {/* Stats Section */}
      <Section variant="muted" padding="md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
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
                {stat.value}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* About Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-500 font-medium mb-2 block">About Us</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-500 dark:text-white mb-6">
              A Home Away From Home
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
              The Kuwaiti Student Association in Malta is a vibrant community
              dedicated to supporting Kuwaiti students throughout their academic
              journey in Malta. Founded on the principles of unity, cultural
              preservation, and mutual support.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              We organize cultural events, social gatherings, academic support
              sessions, and networking opportunities to ensure every Kuwaiti
              student feels at home while pursuing their dreams in Malta.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/about">
                <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Learn More
                </Button>
              </Link>
              <Link to="/about#team">
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
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop"
                alt="Community event"
                className="rounded-xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=400&fit=crop"
                alt="Group gathering"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop"
                alt="Dinner event"
                className="rounded-xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop"
                alt="Celebration"
                className="rounded-xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Featured Events */}
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

      {/* Upcoming Events Compact */}
      {upcomingEvents.length > 0 && (
        <Section>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <span className="text-accent-500 font-medium mb-2 block">
                Mark Your Calendar
              </span>
              <h2 className="text-3xl font-display font-bold text-primary-500 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Stay connected with our community through our regular events and activities.
              </p>
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
      )}

      {/* CTA Section */}
      <Section variant="gradient" padding="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Become a member of the Kuwaiti Student Association Malta and connect
            with fellow Kuwaiti students. Enjoy exclusive access to events,
            networking opportunities, and a supportive community.
          </p>
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

      {/* Gallery Preview */}
      <Section variant="muted">
        <SectionHeader
          title="Gallery Highlights"
          subtitle="Capturing moments from our community events and gatherings"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=400&fit=crop',
          ].map((url, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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
    </>
  );
}
