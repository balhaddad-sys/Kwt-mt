import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Image,
  Mail,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockEvents, mockMembers, mockStatistics } from '../data/mockData';
import { format } from 'date-fns';

type Tab = 'dashboard' | 'events' | 'members' | 'gallery' | 'messages' | 'settings';

export default function AdminPage() {
  const { isAdmin, loading, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // If not logged in or not admin, redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />;
  }

  // For demo purposes, we'll show the admin panel even if not admin
  // In production, uncomment the following:
  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const stats = [
    { label: 'Total Members', value: mockStatistics.totalMembers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Events', value: mockStatistics.totalEvents, icon: Calendar, color: 'bg-green-500' },
    { label: 'Photos', value: mockStatistics.totalPhotos, icon: Image, color: 'bg-purple-500' },
    { label: 'Upcoming Events', value: mockStatistics.upcomingEvents, icon: Calendar, color: 'bg-orange-500' },
  ];

  const recentEvents = mockEvents.slice(0, 5);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 shadow">
        <div className="container-custom py-6">
          <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your association's content and settings
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card padding="sm">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
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
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                              {stat.value}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Events */}
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
                      Recent Events
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      Add Event
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Event
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentEvents.map((event) => {
                          const eventDate = new Date(event.date);
                          const isPast = eventDate < new Date();
                          return (
                            <tr
                              key={event.id}
                              className="border-b border-neutral-100 dark:border-neutral-800"
                            >
                              <td className="py-3 px-4">
                                <p className="font-medium text-neutral-900 dark:text-white">
                                  {event.title}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {format(eventDate, 'MMM d, yyyy')}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 capitalize">
                                  {event.category}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    isPast
                                      ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  }`}
                                >
                                  {isPast ? 'Past' : 'Upcoming'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end space-x-2">
                                  <button className="p-1 text-neutral-500 hover:text-primary-500 transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-neutral-500 hover:text-primary-500 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button className="p-1 text-neutral-500 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Card padding="md" className="cursor-pointer hover:border-primary-500">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Create Event
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Add a new event
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card padding="md" className="cursor-pointer hover:border-primary-500">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Image className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Upload Photos
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Add to gallery
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card padding="md" className="cursor-pointer hover:border-primary-500">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          Send Newsletter
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Email members
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
                      Manage Events
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      Add New Event
                    </Button>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Event management interface would go here. You can add, edit, and delete events.
                  </p>
                </Card>
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
                      Manage Members
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      Add Member
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Member
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            University
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Status
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockMembers.map((member) => (
                          <tr
                            key={member.id}
                            className="border-b border-neutral-100 dark:border-neutral-800"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                {member.photoURL ? (
                                  <img
                                    src={member.photoURL}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-500 font-medium text-sm">
                                      {member.firstName.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <p className="font-medium text-neutral-900 dark:text-white">
                                  {member.firstName} {member.lastName}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {member.email}
                            </td>
                            <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {member.university}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  member.isActive
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                {member.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end space-x-2">
                                <button className="p-1 text-neutral-500 hover:text-primary-500 transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-neutral-500 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
                      Manage Gallery
                    </h2>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<PlusCircle className="w-4 h-4" />}
                    >
                      Upload Photos
                    </Button>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Gallery management interface would go here. You can upload, organize, and delete photos.
                  </p>
                </Card>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white mb-6">
                    Contact Messages
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    View and respond to contact form submissions and membership applications.
                  </p>
                </Card>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card padding="lg">
                  <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white mb-6">
                    Settings
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Configure your association's settings, including social links, contact information, and more.
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
