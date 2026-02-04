import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote, Star, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { EditableText, EditableImage } from '../components/editable';
import { useEdit } from '../contexts/EditContext';
import { useAuth } from '../contexts/AuthContext';
import StudentVerification from '../components/StudentVerification';
import { mockMembers } from '../data/mockData';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  photoURL?: string;
  rating: number;
}

interface Spotlight {
  id: string;
  name: string;
  title: string;
  description: string;
  imageURL: string;
  achievement: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sara Al-Mutawa',
    role: 'Medical Student, Class of 2026',
    quote: 'KWT-MT made my transition to Malta so much easier. The community events helped me make friends from day one, and the support system is amazing.',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
  {
    id: '2',
    name: 'Ahmad Al-Rashidi',
    role: 'Engineering Graduate, 2024',
    quote: 'Being part of KWT-MT was one of the highlights of my university experience. The National Day celebrations are unforgettable!',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
  {
    id: '3',
    name: 'Fatima Al-Sabah',
    role: 'Business Student, Class of 2027',
    quote: 'The networking events have been invaluable for my career development. I\'ve met so many inspiring Kuwaiti professionals through KWT-MT.',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    rating: 5,
  },
];

const defaultSpotlights: Spotlight[] = [
  {
    id: '1',
    name: 'Mohammed Al-Fahad',
    title: 'Dean\'s List Achievement',
    description: 'Mohammed achieved straight A\'s for three consecutive semesters while actively participating in community events.',
    imageURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    achievement: 'Academic Excellence',
  },
  {
    id: '2',
    name: 'Noura Al-Ahmad',
    title: 'Community Leader Award',
    description: 'Recognized for her outstanding contributions to organizing cultural events and mentoring new students.',
    imageURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    achievement: 'Leadership',
  },
];

export default function CommunityPage() {
  const { isEditMode } = useEdit();
  const { currentUser } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [spotlights, setSpotlights] = useState<Spotlight[]>(defaultSpotlights);

  // Load testimonials from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'testimonials'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Testimonial[];
          setTestimonials(items);
        }
      },
      (error) => {
        console.error('Error loading testimonials:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load spotlights from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'spotlights'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Spotlight[];
          setSpotlights(items);
        }
      },
      (error) => {
        console.error('Error loading spotlights:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddTestimonial = async () => {
    const newTestimonial: Omit<Testimonial, 'id'> = {
      name: 'New Member',
      role: 'Student',
      quote: 'Share your experience here...',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      rating: 5,
    };

    try {
      await addDoc(collection(db, 'testimonials'), {
        ...newTestimonial,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding testimonial:', error);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleAddSpotlight = async () => {
    const newSpotlight: Omit<Spotlight, 'id'> = {
      name: 'Member Name',
      title: 'Achievement Title',
      description: 'Describe the achievement...',
      imageURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      achievement: 'Category',
    };

    try {
      await addDoc(collection(db, 'spotlights'), {
        ...newSpotlight,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding spotlight:', error);
    }
  };

  const handleDeleteSpotlight = async (id: string) => {
    if (!confirm('Delete this spotlight?')) return;
    try {
      await deleteDoc(doc(db, 'spotlights', id));
    } catch (error) {
      console.error('Error deleting spotlight:', error);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-2 bg-accent-500/20 rounded-full text-accent-500 text-sm font-medium mb-6">
              Community
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              <EditableText
                value="Our Amazing Community"
                collection="content"
                documentId="community-hero"
                field="title"
                as="span"
              />
            </h1>
            <p className="text-lg text-primary-100">
              <EditableText
                value="Hear from our members and celebrate the achievements of our community. Together, we're building something special."
                collection="content"
                documentId="community-hero"
                field="description"
                as="span"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <Section>
        <SectionHeader
          title="What Our Members Say"
          subtitle="Real stories from real community members"
        />

        {isEditMode && (
          <div className="mb-8 text-center">
            <Button
              variant="outline"
              onClick={handleAddTestimonial}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add Testimonial
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <Card padding="lg" className="h-full">
                <Quote className="w-10 h-10 text-primary-200 dark:text-primary-800 mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 italic">
                  <EditableText
                    value={testimonial.quote}
                    collection="testimonials"
                    documentId={testimonial.id}
                    field="quote"
                    as="span"
                    multiline
                  />
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-gold fill-gold'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <EditableImage
                    src={testimonial.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'}
                    alt={testimonial.name}
                    collection="testimonials"
                    documentId={testimonial.id}
                    field="photoURL"
                    className="w-12 h-12 rounded-full object-cover"
                    aspectRatio="square"
                  />
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                      <EditableText
                        value={testimonial.name}
                        collection="testimonials"
                        documentId={testimonial.id}
                        field="name"
                        as="span"
                      />
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      <EditableText
                        value={testimonial.role}
                        collection="testimonials"
                        documentId={testimonial.id}
                        field="role"
                        as="span"
                      />
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Member Spotlights */}
      <Section variant="muted">
        <SectionHeader
          title="Member Spotlights"
          subtitle="Celebrating achievements in our community"
        />

        {isEditMode && (
          <div className="mb-8 text-center">
            <Button
              variant="outline"
              onClick={handleAddSpotlight}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add Spotlight
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {spotlights.map((spotlight, index) => (
            <motion.div
              key={spotlight.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col md:flex-row">
                <div className="md:w-2/5">
                  <EditableImage
                    src={spotlight.imageURL}
                    alt={spotlight.name}
                    collection="spotlights"
                    documentId={spotlight.id}
                    field="imageURL"
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-3/5 p-6">
                  <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-xs font-medium rounded-full mb-3">
                    <EditableText
                      value={spotlight.achievement}
                      collection="spotlights"
                      documentId={spotlight.id}
                      field="achievement"
                      as="span"
                    />
                  </span>
                  <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white mb-1">
                    <EditableText
                      value={spotlight.name}
                      collection="spotlights"
                      documentId={spotlight.id}
                      field="name"
                      as="span"
                    />
                  </h3>
                  <h4 className="text-accent-500 font-medium mb-3">
                    <EditableText
                      value={spotlight.title}
                      collection="spotlights"
                      documentId={spotlight.id}
                      field="title"
                      as="span"
                    />
                  </h4>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    <EditableText
                      value={spotlight.description}
                      collection="spotlights"
                      documentId={spotlight.id}
                      field="description"
                      as="span"
                      multiline
                    />
                  </p>
                </div>

                {/* Delete Button */}
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteSpotlight(spotlight.id)}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Community Members Preview */}
      <Section>
        <SectionHeader
          title="Our Members"
          subtitle="A growing community of Kuwaiti students in Malta"
        />
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {mockMembers.slice(0, 8).map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <img
                src={member.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg group-hover:scale-110 transition-transform"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="whitespace-nowrap text-xs bg-primary-500 text-white px-2 py-1 rounded">
                  {member.firstName}
                </span>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
          >
            <span className="text-primary-500 dark:text-accent-500 font-bold text-sm">
              +150
            </span>
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Join our growing community of Kuwaiti students making the most of their time in Malta.
          </p>
          <Link to="/contact#membership">
            <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Become a Member
            </Button>
          </Link>
        </div>
      </Section>

      {/* Student Verification */}
      {currentUser && (
        <Section>
          <div className="max-w-2xl mx-auto">
            <StudentVerification />
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section variant="gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            <EditableText
              value="Share Your Story"
              collection="content"
              documentId="community-cta"
              field="title"
              as="span"
            />
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            <EditableText
              value="Have a great experience with KWT-MT? We'd love to hear about it! Your story could inspire other Kuwaiti students considering Malta for their studies."
              collection="content"
              documentId="community-cta"
              field="description"
              as="span"
              multiline
            />
          </p>
          <Link to="/contact">
            <Button
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Contact Us
            </Button>
          </Link>
        </motion.div>
      </Section>
    </>
  );
}
