import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MapPin, Phone, Send, UserPlus, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EditableText } from '../components/editable';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface MembershipFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  graduationYear: number;
  whyJoin: string;
  howHeard: string;
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'membership'>('contact');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [membershipSubmitted, setMembershipSubmitted] = useState(false);

  const contactForm = useForm<ContactFormData>();
  const membershipForm = useForm<MembershipFormData>();

  const onContactSubmit = async (data: ContactFormData) => {
    // In production, this would send to Firebase
    console.log('Contact form:', data);
    setContactSubmitted(true);
  };

  const onMembershipSubmit = async (data: MembershipFormData) => {
    // In production, this would send to Firebase
    console.log('Membership form:', data);
    setMembershipSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@kuwaitimalta.org',
      href: 'mailto:info@kuwaitimalta.org',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+356 9912 3456',
      href: 'tel:+35699123456',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'University of Malta, Msida, MSD 2080, Malta',
      href: 'https://maps.google.com/?q=University+of+Malta',
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
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              <EditableText
                value="Contact Us"
                collection="content"
                documentId="contact-hero"
                field="title"
                as="span"
              />
            </h1>
            <p className="text-lg text-primary-100">
              <EditableText
                value="Have questions? Want to join our community? We'd love to hear from you. Reach out to us and we'll respond as soon as possible."
                collection="content"
                documentId="contact-hero"
                field="description"
                as="span"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <Section padding="md" variant="muted">
        <div className="grid md:grid-cols-3 gap-6">
          {contactInfo.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.label === 'Address' ? '_blank' : undefined}
              rel={item.label === 'Address' ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card padding="lg" className="text-center h-full hover:border-primary-500 dark:hover:border-accent-500">
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary-500 dark:text-accent-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                  {item.label}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {item.value}
                </p>
              </Card>
            </motion.a>
          ))}
        </div>
      </Section>

      {/* Forms Section */}
      <Section>
        <div className="max-w-3xl mx-auto">
          {/* Tab Buttons */}
          <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 mb-8">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'contact'
                  ? 'bg-white dark:bg-neutral-700 text-primary-500 dark:text-accent-500 shadow'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>Contact Us</span>
            </button>
            <button
              onClick={() => setActiveTab('membership')}
              id="membership"
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'membership'
                  ? 'bg-white dark:bg-neutral-700 text-primary-500 dark:text-accent-500 shadow'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Join Membership</span>
            </button>
          </div>

          {/* Contact Form */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card padding="lg">
                {contactSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Thank you for reaching out. We'll get back to you soon.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setContactSubmitted(false);
                        contactForm.reset();
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)}>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-6">
                      Send Us a Message
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Your Name *
                        </label>
                        <input
                          {...contactForm.register('name', { required: true })}
                          type="text"
                          className="input-field"
                          placeholder="John Doe"
                        />
                        {contactForm.formState.errors.name && (
                          <p className="text-red-500 text-sm mt-1">Name is required</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          {...contactForm.register('email', {
                            required: true,
                            pattern: /^\S+@\S+$/i,
                          })}
                          type="email"
                          className="input-field"
                          placeholder="john@example.com"
                        />
                        {contactForm.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            Valid email is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Subject *
                        </label>
                        <input
                          {...contactForm.register('subject', { required: true })}
                          type="text"
                          className="input-field"
                          placeholder="How can we help?"
                        />
                        {contactForm.formState.errors.subject && (
                          <p className="text-red-500 text-sm mt-1">Subject is required</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Message *
                        </label>
                        <textarea
                          {...contactForm.register('message', { required: true })}
                          rows={5}
                          className="input-field resize-none"
                          placeholder="Your message..."
                        />
                        {contactForm.formState.errors.message && (
                          <p className="text-red-500 text-sm mt-1">Message is required</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={contactForm.formState.isSubmitting}
                        rightIcon={<Send className="w-5 h-5" />}
                      >
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          )}

          {/* Membership Form */}
          {activeTab === 'membership' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card padding="lg">
                {membershipSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Thank you for your interest in joining our community. We'll
                      review your application and get back to you soon.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMembershipSubmitted(false);
                        membershipForm.reset();
                      }}
                    >
                      Submit Another Application
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={membershipForm.handleSubmit(onMembershipSubmit)}>
                    <h2 className="text-2xl font-display font-bold text-neutral-900 dark:text-white mb-2">
                      Membership Application
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      Join the Kuwaiti Student Association Malta and become part of
                      our community.
                    </p>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            First Name *
                          </label>
                          <input
                            {...membershipForm.register('firstName', { required: true })}
                            type="text"
                            className="input-field"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            {...membershipForm.register('lastName', { required: true })}
                            type="text"
                            className="input-field"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Email Address *
                          </label>
                          <input
                            {...membershipForm.register('email', {
                              required: true,
                              pattern: /^\S+@\S+$/i,
                            })}
                            type="email"
                            className="input-field"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Phone Number *
                          </label>
                          <input
                            {...membershipForm.register('phone', { required: true })}
                            type="tel"
                            className="input-field"
                            placeholder="+356 XXXX XXXX"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          University *
                        </label>
                        <select
                          {...membershipForm.register('university', { required: true })}
                          className="input-field"
                        >
                          <option value="">Select your university</option>
                          <option value="University of Malta">University of Malta</option>
                          <option value="MCAST">MCAST</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Major/Field of Study *
                          </label>
                          <input
                            {...membershipForm.register('major', { required: true })}
                            type="text"
                            className="input-field"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Expected Graduation Year *
                          </label>
                          <select
                            {...membershipForm.register('graduationYear', {
                              required: true,
                              valueAsNumber: true,
                            })}
                            className="input-field"
                          >
                            <option value="">Select year</option>
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Why do you want to join? *
                        </label>
                        <textarea
                          {...membershipForm.register('whyJoin', { required: true })}
                          rows={4}
                          className="input-field resize-none"
                          placeholder="Tell us why you'd like to join our community..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          How did you hear about us?
                        </label>
                        <select
                          {...membershipForm.register('howHeard')}
                          className="input-field"
                        >
                          <option value="">Select an option</option>
                          <option value="social-media">Social Media</option>
                          <option value="friend">Friend/Family</option>
                          <option value="university">University</option>
                          <option value="event">At an Event</option>
                          <option value="search">Online Search</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={membershipForm.formState.isSubmitting}
                        rightIcon={<UserPlus className="w-5 h-5" />}
                      >
                        Submit Application
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </motion.div>
          )}
        </div>
      </Section>

      {/* Map Section */}
      <Section variant="muted">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3232.5461384367487!2d14.483866776538086!3d35.90156631451455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130e452d3e3d0909%3A0x1c1b5b7b5b7b7b7b!2sUniversity%20of%20Malta!5e0!3m2!1sen!2smt!4v1620000000000!5m2!1sen!2smt"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
          />
        </div>
      </Section>
    </>
  );
}
