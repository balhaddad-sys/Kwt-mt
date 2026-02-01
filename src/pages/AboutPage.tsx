import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Heart, Users, Award, Handshake, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { EditableText, EditableImage } from '../components/editable';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const values = [
    {
      id: 'community',
      icon: Users,
      title: 'Community',
      description: 'Building a strong, supportive community that feels like family for every Kuwaiti student in Malta.',
    },
    {
      id: 'culture',
      icon: Heart,
      title: 'Cultural Pride',
      description: 'Celebrating and preserving our rich Kuwaiti heritage while embracing the diversity of Malta.',
    },
    {
      id: 'excellence',
      icon: Award,
      title: 'Excellence',
      description: 'Encouraging academic excellence and personal growth in all our members.',
    },
    {
      id: 'unity',
      icon: Handshake,
      title: 'Unity',
      description: 'Fostering unity among Kuwaiti students and building bridges with the Maltese community.',
    },
  ];

  const faqs = [
    {
      id: 'faq1',
      question: 'Who can join KWT-MT?',
      answer: 'Any Kuwaiti student studying in Malta is welcome to join our community. We also welcome friends and supporters of the Kuwaiti community.',
    },
    {
      id: 'faq2',
      question: 'Is there a membership fee?',
      answer: 'Basic membership is free! Some special events may have a nominal fee to cover costs.',
    },
    {
      id: 'faq3',
      question: 'How do I become a member?',
      answer: 'Simply fill out the membership application on our Contact page. Our team will review your application and get back to you within a few days.',
    },
    {
      id: 'faq4',
      question: 'What kind of events do you organize?',
      answer: 'We organize cultural celebrations (National Day, Eid), social gatherings, academic workshops, networking events, sports activities, and more.',
    },
    {
      id: 'faq5',
      question: 'Can I help organize events?',
      answer: 'Absolutely! We\'re always looking for volunteers. Reach out to us if you\'d like to help with event planning and execution.',
    },
  ];

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
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              <EditableText
                value="Building Bridges, Creating Memories"
                collection="content"
                documentId="about-hero"
                field="title"
                as="span"
              />
            </h1>
            <p className="text-lg text-primary-100">
              <EditableText
                value="The Kuwaiti Student Association Malta is more than just an organization - we're a family dedicated to supporting each other through our academic journeys and beyond."
                collection="content"
                documentId="about-hero"
                field="description"
                as="span"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <Section>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card padding="lg" className="h-full">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-primary-500 dark:text-accent-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-primary-500 dark:text-white">
                  Our Mission
                </h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <EditableText
                  value="To create a supportive and inclusive community for Kuwaiti students in Malta, providing resources, organizing events, and fostering connections that enhance their academic experience and personal growth while preserving and celebrating our Kuwaiti cultural heritage."
                  collection="content"
                  documentId="about-mission"
                  field="text"
                  as="span"
                  multiline
                />
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card padding="lg" className="h-full">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-accent-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-primary-500 dark:text-white">
                  Our Vision
                </h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <EditableText
                  value="To be the leading student organization that empowers Kuwaiti students in Malta to achieve academic excellence, build lasting friendships, and become ambassadors of Kuwaiti culture, creating a positive impact in both Malta and Kuwait."
                  collection="content"
                  documentId="about-vision"
                  field="text"
                  as="span"
                  multiline
                />
              </p>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* Values */}
      <Section variant="muted">
        <SectionHeader
          title="Our Values"
          subtitle="The principles that guide everything we do"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card padding="lg" className="text-center h-full">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-500 dark:text-accent-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white mb-3">
                  <EditableText
                    value={value.title}
                    collection="content"
                    documentId="about-values"
                    field={`${value.id}Title`}
                    as="span"
                  />
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  <EditableText
                    value={value.description}
                    collection="content"
                    documentId="about-values"
                    field={`${value.id}Description`}
                    as="span"
                    multiline
                  />
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* About Image Section */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <EditableImage
              src="https://images.unsplash.com/photo-1529543544277-750e0d339888?w=800&h=600&fit=crop"
              alt="Our community"
              collection="content"
              documentId="about-story"
              field="image"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-500 font-medium mb-2 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-500 dark:text-white mb-6">
              <EditableText
                value="A Decade of Building Community"
                collection="content"
                documentId="about-story"
                field="title"
                as="span"
              />
            </h2>
            <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
              <p>
                <EditableText
                  value="Founded in 2015 by a group of passionate Kuwaiti students, our association has grown from a small gathering of friends to a thriving community of over 150 members."
                  collection="content"
                  documentId="about-story"
                  field="paragraph1"
                  as="span"
                  multiline
                />
              </p>
              <p>
                <EditableText
                  value="Through the years, we've organized countless events, supported hundreds of students, and created lasting friendships that span continents. Our commitment to excellence and community remains as strong as ever."
                  collection="content"
                  documentId="about-story"
                  field="paragraph2"
                  as="span"
                  multiline
                />
              </p>
            </div>
            <div className="mt-8">
              <Link to="/team">
                <Button variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Meet Our Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section variant="muted">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Got questions? We've got answers"
        />
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-primary-500 dark:text-accent-500 flex-shrink-0" />
                  <span className="font-medium text-neutral-900 dark:text-white">
                    <EditableText
                      value={faq.question}
                      collection="content"
                      documentId="about-faq"
                      field={`${faq.id}Question`}
                      as="span"
                    />
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-500 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-2 text-neutral-600 dark:text-neutral-400">
                      <EditableText
                        value={faq.answer}
                        collection="content"
                        documentId="about-faq"
                        field={`${faq.id}Answer`}
                        as="span"
                        multiline
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </Section>

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
              value="Want to Get Involved?"
              collection="content"
              documentId="about-cta"
              field="title"
              as="span"
            />
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            <EditableText
              value="Whether you want to join as a member, volunteer for events, or join our leadership team, we'd love to hear from you!"
              collection="content"
              documentId="about-cta"
              field="description"
              as="span"
              multiline
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact#membership">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Join Us Today
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
    </>
  );
}
