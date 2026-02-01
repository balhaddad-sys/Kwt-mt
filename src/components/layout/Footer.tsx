import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact', href: '/contact' },
  ];

  const resourceLinks = [
    { label: 'Become a Member', href: '/contact#membership' },
    { label: 'Event Calendar', href: '/events' },
    { label: 'Photo Gallery', href: '/gallery' },
    { label: 'Our Team', href: '/about#team' },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/kuwaitimalta', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/kuwaitimalta', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/kuwaitimalta', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/kuwaitimalta', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-primary-500 dark:bg-neutral-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-bold text-xl">KSA</span>
              </div>
              <div>
                <p className="font-display font-bold">Kuwaiti Student</p>
                <p className="font-display font-bold">Association Malta</p>
              </div>
            </div>
            <p className="text-primary-100 dark:text-neutral-400 text-sm leading-relaxed mb-6">
              Connecting Kuwaiti students in Malta, fostering cultural exchange,
              and building a strong community away from home.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-400 dark:bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-accent-500 hover:text-primary-900 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-100 dark:text-neutral-400 hover:text-accent-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-primary-100 dark:text-neutral-400 hover:text-accent-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <span className="text-primary-100 dark:text-neutral-400 text-sm">
                  University of Malta,<br />
                  Msida, MSD 2080, Malta
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent-500 flex-shrink-0" />
                <a
                  href="mailto:info@kuwaitimalta.org"
                  className="text-primary-100 dark:text-neutral-400 text-sm hover:text-accent-500 transition-colors"
                >
                  info@kuwaitimalta.org
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-accent-500 flex-shrink-0" />
                <a
                  href="tel:+35699123456"
                  className="text-primary-100 dark:text-neutral-400 text-sm hover:text-accent-500 transition-colors"
                >
                  +356 9912 3456
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-400 dark:border-neutral-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-100 dark:text-neutral-400 text-sm text-center md:text-left">
              &copy; {currentYear} Kuwaiti Student Association Malta. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                to="/privacy"
                className="text-primary-100 dark:text-neutral-400 hover:text-accent-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-primary-100 dark:text-neutral-400 hover:text-accent-500 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
