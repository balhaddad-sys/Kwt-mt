import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Heart, Users, Award, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import TeamMemberCard from '../components/common/TeamMemberCard';
import { mockTeamMembers } from '../data/mockData';

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Community',
      description:
        'Building a strong, supportive community that feels like family for every Kuwaiti student in Malta.',
    },
    {
      icon: Heart,
      title: 'Cultural Pride',
      description:
        'Celebrating and preserving our rich Kuwaiti heritage while embracing the diversity of Malta.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description:
        'Encouraging academic excellence and personal growth in all our members.',
    },
    {
      icon: Handshake,
      title: 'Unity',
      description:
        'Fostering unity among Kuwaiti students and building bridges with the Maltese community.',
    },
  ];

  const timeline = [
    {
      year: '2015',
      title: 'Foundation',
      description:
        'The Kuwaiti Student Association Malta was founded by a group of passionate students.',
    },
    {
      year: '2017',
      title: 'Official Recognition',
      description:
        'Received official recognition from the University of Malta Student Council.',
    },
    {
      year: '2019',
      title: 'First National Day Celebration',
      description:
        'Hosted our first major Kuwait National Day celebration with over 100 attendees.',
    },
    {
      year: '2021',
      title: 'Community Growth',
      description:
        'Expanded our reach to include Kuwaiti students from all universities in Malta.',
    },
    {
      year: '2023',
      title: 'Digital Transformation',
      description:
        'Launched our new website and digital platforms to better serve our community.',
    },
    {
      year: '2025',
      title: '10th Anniversary',
      description:
        'Celebrated our 10th anniversary with our largest event ever, bringing together students, alumni, and dignitaries.',
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
              Building Bridges, Creating Memories
            </h1>
            <p className="text-lg text-primary-100">
              The Kuwaiti Student Association Malta is more than just an organization
              - we're a family dedicated to supporting each other through our academic
              journeys and beyond.
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
                To create a supportive and inclusive community for Kuwaiti students
                in Malta, providing resources, organizing events, and fostering
                connections that enhance their academic experience and personal
                growth while preserving and celebrating our Kuwaiti cultural heritage.
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
                To be the leading student organization that empowers Kuwaiti students
                in Malta to achieve academic excellence, build lasting friendships,
                and become ambassadors of Kuwaiti culture, creating a positive impact
                in both Malta and Kuwait.
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
              key={value.title}
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
                  {value.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {value.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* History Timeline */}
      <Section>
        <SectionHeader
          title="Our Journey"
          subtitle="A decade of building community and creating memories"
        />
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 dark:bg-neutral-700 -translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-accent-500 rounded-full -translate-x-1/2 border-4 border-white dark:border-neutral-900" />

                {/* Content */}
                <div
                  className={`flex-1 ml-16 md:ml-0 ${
                    index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'
                  }`}
                >
                  <span className="text-accent-500 font-bold text-lg">{item.year}</span>
                  <h3 className="font-display font-bold text-xl text-neutral-900 dark:text-white mt-1">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    {item.description}
                  </p>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Team Section */}
      <Section variant="muted" id="team">
        <SectionHeader
          title="Meet Our Team"
          subtitle="Dedicated leaders working to serve our community"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TeamMemberCard member={member} />
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
            Want to Get Involved?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Whether you want to join as a member, volunteer for events, or join
            our leadership team, we'd love to hear from you!
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
