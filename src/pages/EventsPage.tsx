import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
} from 'date-fns';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EventCard from '../components/common/EventCard';
import { EditableText } from '../components/editable';
import { mockEvents } from '../data/mockData';
import { EventCategory } from '../types';

type ViewMode = 'grid' | 'list' | 'calendar';
type TimeFilter = 'all' | 'upcoming' | 'past';

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'social', label: 'Social' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'academic', label: 'Academic' },
  { value: 'sports', label: 'Sports' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'networking', label: 'Networking' },
  { value: 'celebration', label: 'Celebration' },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const now = new Date();

  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
      const eventDate = new Date(event.date);

      // Search filter
      if (
        searchQuery &&
        !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }

      // Time filter
      if (timeFilter === 'upcoming' && isBefore(eventDate, now)) {
        return false;
      }
      if (timeFilter === 'past' && isAfter(eventDate, now)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, timeFilter]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (timeFilter === 'past') {
        return dateB.getTime() - dateA.getTime();
      }
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEvents, timeFilter]);

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(new Date(event.date), day));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

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
              Events
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              <EditableText
                value="Community Events"
                collection="content"
                documentId="events-hero"
                field="title"
                as="span"
              />
            </h1>
            <p className="text-lg text-primary-100">
              <EditableText
                value="Discover our upcoming gatherings, cultural celebrations, and networking opportunities. Join us and be part of something special."
                collection="content"
                documentId="events-hero"
                field="description"
                as="span"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <Section padding="md">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
              className="input-field w-auto"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Time Filter */}
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
              {(['all', 'upcoming', 'past'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-primary-500 text-white dark:bg-accent-500 dark:text-primary-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                aria-label="Calendar view"
              >
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-neutral-600 dark:text-neutral-400">
          Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
        </div>
      </Section>

      {/* Events Display */}
      <Section variant="muted" padding="lg">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {sortedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <EventCard event={event} variant="compact" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card padding="lg">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-display font-bold text-neutral-900 dark:text-white">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                  ))}

                  {/* Days */}
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, now);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-24 p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg ${
                          isToday
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div
                          className={`text-sm font-medium mb-1 ${
                            isToday
                              ? 'text-primary-500 dark:text-accent-500'
                              : 'text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <a
                              key={event.id}
                              href={`/events/${event.id}`}
                              className="block text-xs p-1 bg-accent-500 text-primary-900 rounded truncate hover:bg-accent-600 transition-colors"
                            >
                              {event.title}
                            </a>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {sortedEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setTimeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Section>
    </>
  );
}
