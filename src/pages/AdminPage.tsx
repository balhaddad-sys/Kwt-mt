import { useState } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutGrid,
  Palette,
  Image,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Moon,
  Sun,
  Globe,
  TrendingUp,
  Clock,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockEvents, mockMembers, mockStatistics } from '../data/mockData';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Admin Components
import ThemeEditor from '../components/admin/ThemeEditor';
import MediaManager from '../components/admin/MediaManager';
import EventManager from '../components/admin/EventManager';
import ContentManager from '../components/admin/ContentManager';
import TeamManager from '../components/admin/TeamManager';
import SiteSettings from '../components/admin/SiteSettings';
import VisualPageBuilder from '../components/admin/VisualPageBuilder';

type AdminTab = 'dashboard' | 'page-builder' | 'site' | 'theme' | 'media' | 'events' | 'content' | 'team' | 'settings';

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
}

const tabs: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { id: 'page-builder', label: 'Page Builder', icon: LayoutGrid, color: 'text-pink-500' },
  { id: 'site', label: 'Site Settings', icon: Settings, color: 'text-blue-500' },
  { id: 'theme', label: 'Theme Colors', icon: Palette, color: 'text-purple-500' },
  { id: 'media', label: 'Media', icon: Image, color: 'text-green-500' },
  { id: 'events', label: 'Events', icon: Calendar, color: 'text-orange-500' },
  { id: 'content', label: 'Page Content', icon: FileText, color: 'text-indigo-500' },
  { id: 'team', label: 'Team', icon: Users, color: 'text-cyan-500' },
];

export default function AdminPage() {
  const { loading, currentUser, signOut } = useAuth();
  const { toggleTheme, actualTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab | null;
  const initialTab = tabParam && tabs.some(t => t.id === tabParam) ? tabParam : 'dashboard';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />;
  }

  // For demo purposes, allow access without admin role
  // In production, uncomment: if (!isAdmin) return <Navigate to="/" replace />;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Dashboard Stats
  const stats = [
    {
      label: 'Total Members',
      value: mockStatistics.totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Total Events',
      value: mockStatistics.totalEvents,
      icon: Calendar,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Gallery Photos',
      value: mockStatistics.totalPhotos,
      icon: Image,
      color: 'bg-purple-500',
      trend: '+24%',
      trendUp: true,
    },
    {
      label: 'Upcoming Events',
      value: mockStatistics.upcomingEvents,
      icon: Clock,
      color: 'bg-orange-500',
      trend: '3 this week',
      trendUp: null,
    },
  ];

  const recentEvents = mockEvents.slice(0, 5);
  const recentMembers = mockMembers.slice(0, 5);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-primary-500 to-secondary-500">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-display font-bold mb-2">
                  Welcome back, {currentUser.displayName || 'Admin'}!
                </h2>
                <p className="opacity-90">
                  Here's what's happening with your KWT-MT community today.
                </p>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card padding="md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                          {stat.value}
                        </p>
                        {stat.trend && (
                          <p className={`text-xs mt-1 flex items-center gap-1 ${
                            stat.trendUp === true
                              ? 'text-green-500'
                              : stat.trendUp === false
                              ? 'text-red-500'
                              : 'text-neutral-500'
                          }`}>
                            {stat.trendUp !== null && (
                              <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                            )}
                            {stat.trend}
                          </p>
                        )}
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Page Builder', icon: LayoutGrid, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-500', tab: 'page-builder' as AdminTab },
                { label: 'Create Event', icon: Calendar, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500', tab: 'events' as AdminTab },
                { label: 'Upload Media', icon: Image, color: 'bg-green-100 dark:bg-green-900/30 text-green-500', tab: 'media' as AdminTab },
                { label: 'Edit Content', icon: FileText, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500', tab: 'content' as AdminTab },
                { label: 'Customize Theme', icon: Palette, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500', tab: 'theme' as AdminTab },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-xs text-neutral-500">Quick action</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Recent Events
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('events')}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      {event.imageURL ? (
                        <img
                          src={event.imageURL}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {event.title}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs capitalize">
                        {event.category}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Members */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Recent Members
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('team')}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <span className="text-primary-500 font-medium">
                            {member.firstName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-neutral-500 truncate">
                          {member.university}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        member.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        );
      case 'page-builder':
        return <VisualPageBuilder />;
      case 'site':
        return <SiteSettings />;
      case 'theme':
        return <ThemeEditor />;
      case 'media':
        return <MediaManager />;
      case 'events':
        return <EventManager />;
      case 'content':
        return <ContentManager />;
      case 'team':
        return <TeamManager />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-display font-bold text-lg text-neutral-900 dark:text-white">
              KWT-MT
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab !== tab.id && tab.color}`} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-xs text-neutral-500">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title={actualTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {actualTheme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-700">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-primary-500 font-medium text-sm">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {currentUser.displayName || 'Admin'}
                </p>
                <p className="text-xs text-neutral-500 truncate max-w-[150px]">
                  {currentUser.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
