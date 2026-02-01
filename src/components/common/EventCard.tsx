import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Event } from '../../types';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  const categoryColors: Record<string, string> = {
    social: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    cultural: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    academic: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    workshop: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    networking: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    celebration: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    other: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  };

  if (variant === 'featured') {
    return (
      <Card padding="none" className="group overflow-hidden">
        <div className="relative h-64 md:h-80 overflow-hidden">
          {event.imageURL && (
            <img
              src={event.imageURL}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Featured Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-accent-500 text-primary-900 text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span
              className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${categoryColors[event.category]}`}
            >
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-accent-500 transition-colors">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(eventDate, 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {event.time}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
            {event.shortDescription || event.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-4 h-4 mr-1" />
              {event.location}
            </div>
            <Link to={`/events/${event.id}`}>
              <Button variant="primary" size="sm">
                {isPastEvent ? 'View Details' : 'RSVP Now'}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/events/${event.id}`}>
        <Card padding="sm" className="flex items-center space-x-4 group">
          <div className="flex-shrink-0 w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-primary-500 dark:text-accent-500">
              {format(eventDate, 'd')}
            </span>
            <span className="text-xs text-primary-400 dark:text-accent-400 uppercase">
              {format(eventDate, 'MMM')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-500 dark:group-hover:text-accent-500 transition-colors">
              {event.title}
            </h4>
            <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {event.time}
              <span className="mx-2">|</span>
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Card padding="none" className="group">
      <div className="relative h-48 overflow-hidden">
        {event.imageURL ? (
          <img
            src={event.imageURL}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
        )}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[event.category]}`}
          >
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>
        {isPastEvent && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-neutral-800/80 text-white text-xs font-medium rounded-full">
              Past Event
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-500 dark:group-hover:text-accent-500 transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
          {event.shortDescription || event.description}
        </p>
        <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
            {format(eventDate, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
            {event.time}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
            {event.location}
          </div>
          {event.capacity && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
              {event.attendees.length} / {event.capacity} attending
            </div>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Link to={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          {!isPastEvent && (
            <Link to={`/events/${event.id}#rsvp`}>
              <Button variant="primary" size="sm">
                RSVP
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
