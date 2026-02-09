import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Link to={`/events/${event._id}`} className="block">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        {event.images?.length > 0 && (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
              {event.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {event.availableTickets} tickets left
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="flex items-center">
              <span className="mr-2">📅</span>
              {format(new Date(event.startDate), 'PPP')}
            </p>
            <p className="flex items-center">
              <span className="mr-2">📍</span>
              {event.location.city}, {event.location.state}
            </p>
            <p className="flex items-center">
              <span className="mr-2">💰</span>
              ₦{event.ticketPrice.toLocaleString()}
            </p>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
