import { useState, useMemo } from 'react';
import { Search, Users, GraduationCap, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import Section from '../components/ui/Section';
import MemberCard from '../components/common/MemberCard';
import { mockMembers, mockStatistics } from '../data/mockData';

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');

  // Get unique universities
  const universities = useMemo(() => {
    const unis = new Set(mockMembers.map((m) => m.university).filter(Boolean));
    return ['all', ...Array.from(unis)] as string[];
  }, []);

  // Filter members
  const filteredMembers = useMemo(() => {
    return mockMembers.filter((member) => {
      if (!member.isPublic) return false;

      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        fullName.includes(searchQuery.toLowerCase()) ||
        member.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.university?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUniversity =
        selectedUniversity === 'all' || member.university === selectedUniversity;

      return matchesSearch && matchesUniversity;
    });
  }, [searchQuery, selectedUniversity]);

  const stats = [
    {
      icon: Users,
      value: mockStatistics.totalMembers,
      label: 'Total Members',
    },
    {
      icon: Building,
      value: universities.length - 1,
      label: 'Universities',
    },
    {
      icon: GraduationCap,
      value: '20+',
      label: 'Fields of Study',
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
              Our Community
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Meet Our Members
            </h1>
            <p className="text-lg text-primary-100">
              Our community is made up of talented Kuwaiti students from various
              universities and fields of study. Connect with fellow members and
              expand your network.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <Section padding="md" variant="muted">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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

      {/* Filters */}
      <Section padding="md">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* University Filter */}
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="all">All Universities</option>
            {universities.slice(1).map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-neutral-600 dark:text-neutral-400">
          Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
        </div>
      </Section>

      {/* Members Grid */}
      <Section variant="muted" padding="lg">
        {filteredMembers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MemberCard member={member} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              No members found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </Section>

      {/* Join CTA */}
      <Section variant="gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Want to See Your Profile Here?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join the Kuwaiti Student Association Malta and become part of our
            growing community. Connect with fellow students, access exclusive
            events, and make lifelong friendships.
          </p>
          <a
            href="/contact#membership"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 text-primary-900 font-medium rounded-lg hover:bg-accent-600 transition-all"
          >
            Apply for Membership
          </a>
        </motion.div>
      </Section>
    </>
  );
}
