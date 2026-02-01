import { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  X,
  Clock,
  MapPin,
  Users,
  Check,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Event, EventCategory, eventCategoryColors } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { format } from 'date-fns';

const categoryLabels: Record<EventCategory, string> = {
  social: 'Social',
  cultural: 'Cultural',
  academic: 'Academic',
  sports: 'Sports',
  workshop: 'Workshop',
  networking: 'Networking',
  celebration: 'Celebration',
  other: 'Other',
};

interface EventFormData {
  title: string;
  description: string;
  shortDescription: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  locationDetails: string;
  category: EventCategory;
  capacity: number;
  imageURL: string;
  isPublic: boolean;
  isFeatured: boolean;
}

const defaultFormData: EventFormData = {
  title: '',
  description: '',
  shortDescription: '',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  location: '',
  locationDetails: '',
  category: 'social',
  capacity: 0,
  imageURL: '',
  isPublic: true,
  isFeatured: false,
};

export default function EventManager() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<EventCategory | 'all'>('all');
  const [viewEvent, setViewEvent] = useState<Event | null>(null);

  // Fetch events from Firestore
  useEffect(() => {
    const eventsQuery = query(
      collection(db, 'events'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData: Event[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          eventsData.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate?.() || new Date(data.date),
            endDate: data.endDate?.toDate?.() || (data.endDate ? new Date(data.endDate) : undefined),
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || undefined,
          } as Event);
        });
        setEvents(eventsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort events: upcoming first, then past
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const now = new Date();
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    const aIsUpcoming = aDate >= now;
    const bIsUpcoming = bDate >= now;

    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    if (aIsUpcoming) return aDate.getTime() - bDate.getTime();
    return bDate.getTime() - aDate.getTime();
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        date: Timestamp.fromDate(new Date(`${formData.date}T${formData.time}`)),
        time: formData.time,
        endDate: formData.endDate && formData.endTime
          ? Timestamp.fromDate(new Date(`${formData.endDate}T${formData.endTime}`))
          : null,
        location: formData.location,
        locationDetails: formData.locationDetails,
        category: formData.category,
        capacity: Number(formData.capacity) || 0,
        imageURL: formData.imageURL,
        isPublic: formData.isPublic,
        isFeatured: formData.isFeatured,
        attendees: editingEvent?.attendees || [],
        updatedAt: Timestamp.now(),
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid,
        });
      }

      setShowForm(false);
      setEditingEvent(null);
      setFormData(defaultFormData);
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      date: format(new Date(event.date), 'yyyy-MM-dd'),
      time: event.time,
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
      endTime: '',
      location: event.location,
      locationDetails: event.locationDetails || '',
      category: event.category,
      capacity: event.capacity || 0,
      imageURL: event.imageURL || '',
      isPublic: event.isPublic,
      isFeatured: event.isFeatured,
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleAddNew = () => {
    setEditingEvent(null);
    setFormData(defaultFormData);
    setShowForm(true);
  };

  const isUpcoming = (date: Date) => new Date(date) >= new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900 dark:text-white">
              Event Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Create and manage events
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNew}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryLabels) as EventCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterCategory === cat
                  ? 'text-white'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
              }`}
              style={filterCategory === cat ? { backgroundColor: eventCategoryColors[cat] } : {}}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : sortedEvents.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <p className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No events found
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Create your first event to get started
            </p>
            <Button variant="primary" size="sm" onClick={handleAddNew}>
              Create Event
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    RSVPs
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {event.imageURL ? (
                          <img
                            src={event.imageURL}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: eventCategoryColors[event.category] + '20' }}
                          >
                            <Calendar
                              className="w-6 h-6"
                              style={{ color: eventCategoryColors[event.category] }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {event.title}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="text-neutral-900 dark:text-white">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: eventCategoryColors[event.category] }}
                      >
                        {categoryLabels[event.category]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isUpcoming(event.date)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                      </span>
                      {event.isFeatured && (
                        <span className="ml-1 px-2 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-700 dark:bg-gold-900 dark:text-gold-300">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees?.length || 0}</span>
                        {(event.capacity ?? 0) > 0 && (
                          <span className="text-neutral-400">/ {event.capacity}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewEvent(event)}
                          className="p-1.5 text-neutral-500 hover:text-primary-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-1.5 text-neutral-500 hover:text-primary-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(event.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                        >
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
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-2xl w-full shadow-xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter event title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Event location"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {(Object.keys(categoryLabels) as EventCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Capacity (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Brief description for event cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Detailed event description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageURL"
                    value={formData.imageURL}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Public Event
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-neutral-300 text-gold-500 focus:ring-gold-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Featured Event
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    leftIcon={saving ? undefined : <Check className="w-4 h-4" />}
                  >
                    {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Event Modal */}
      <AnimatePresence>
        {viewEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setViewEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl max-w-lg w-full shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {viewEvent.imageURL && (
                <img
                  src={viewEvent.imageURL}
                  alt={viewEvent.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
                      style={{ backgroundColor: eventCategoryColors[viewEvent.category] }}
                    >
                      {categoryLabels[viewEvent.category]}
                    </span>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {viewEvent.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setViewEvent(null)}
                    className="p-1 text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(viewEvent.date), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Clock className="w-4 h-4" />
                    {viewEvent.time}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <MapPin className="w-4 h-4" />
                    {viewEvent.location}
                  </p>
                  <p className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <Users className="w-4 h-4" />
                    {viewEvent.attendees?.length || 0} RSVPs
                    {(viewEvent.capacity ?? 0) > 0 && ` / ${viewEvent.capacity} capacity`}
                  </p>
                </div>
                <p className="mt-4 text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {viewEvent.description}
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewEvent(null);
                      handleEdit(viewEvent);
                    }}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-neutral-800 rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Delete Event?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This action cannot be undone. The event will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
