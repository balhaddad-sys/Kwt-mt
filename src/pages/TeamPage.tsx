import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Linkedin, Instagram, Twitter, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Section, { SectionHeader } from '../components/ui/Section';
import Button from '../components/ui/Button';
import { EditableText, EditableImage } from '../components/editable';
import { useEdit } from '../contexts/EditContext';
import { useAuth } from '../contexts/AuthContext';
import { TeamMember } from '../types';
import { mockTeamMembers } from '../data/mockData';

export default function TeamPage() {
  const { isEditMode } = useEdit();
  useAuth(); // For auth state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);

  // Load team members from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'team'),
      (snapshot) => {
        if (!snapshot.empty) {
          const members = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TeamMember[];
          setTeamMembers(members.sort((a, b) => a.order - b.order));
        }
      },
      (error) => {
        console.error('Error loading team:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddMember = async () => {
    const newMember: Omit<TeamMember, 'id'> = {
      name: 'New Team Member',
      role: 'leadership',
      position: 'Position',
      bio: 'Bio description here...',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      order: teamMembers.length + 1,
      isActive: true,
    };

    try {
      await addDoc(collection(db, 'team'), {
        ...newMember,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      await deleteDoc(doc(db, 'team', id));
    } catch (error) {
      console.error('Error deleting member:', error);
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
              Our Team
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              <EditableText
                value="Meet the People Behind KWT-MT"
                collection="content"
                documentId="team-hero"
                field="title"
                as="span"
              />
            </h1>
            <p className="text-lg text-primary-100">
              <EditableText
                value="Our dedicated team of student leaders works tirelessly to create meaningful experiences and support our community."
                collection="content"
                documentId="team-hero"
                field="description"
                as="span"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <Section>
        <SectionHeader
          title="Leadership Team"
          subtitle="The people who make it all happen"
        />

        {/* Add Member Button (Edit Mode Only) */}
        {isEditMode && (
          <div className="mb-8 text-center">
            <Button
              variant="outline"
              onClick={handleAddMember}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add Team Member
            </Button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.filter(m => m.isActive).map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                {/* Photo */}
                <div className="aspect-square overflow-hidden">
                  <EditableImage
                    src={member.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'}
                    alt={member.name}
                    collection="team"
                    documentId={member.id}
                    field="photoURL"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    aspectRatio="square"
                  />
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                    <EditableText
                      value={member.name}
                      collection="team"
                      documentId={member.id}
                      field="name"
                      as="span"
                    />
                  </h3>
                  <p className="text-accent-500 font-medium mt-1">
                    <EditableText
                      value={member.position}
                      collection="team"
                      documentId={member.id}
                      field="position"
                      as="span"
                    />
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-3 line-clamp-3">
                    <EditableText
                      value={member.bio}
                      collection="team"
                      documentId={member.id}
                      field="bio"
                      as="span"
                      multiline
                    />
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 mt-4">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                    {member.socialLinks?.linkedin && (
                      <a
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-[#0077B5] transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {member.socialLinks?.instagram && (
                      <a
                        href={member.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-[#E4405F] transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {member.socialLinks?.twitter && (
                      <a
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-[#1DA1F2] transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Delete Button (Edit Mode) */}
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteMember(member.id)}
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

      {/* Join the Team CTA */}
      <Section variant="muted">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-500 dark:text-white mb-4">
            <EditableText
              value="Want to Join Our Team?"
              collection="content"
              documentId="team-cta"
              field="title"
              as="span"
            />
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            <EditableText
              value="We're always looking for passionate individuals to help lead our community. If you have ideas, skills, or just a desire to contribute, we'd love to hear from you."
              collection="content"
              documentId="team-cta"
              field="description"
              as="span"
              multiline
            />
          </p>
          <Link to="/contact">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Get In Touch
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
