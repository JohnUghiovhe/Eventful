import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { eventService } from '../services/event.service';

const Events: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading, error } = useQuery(
    ['events', page, search, category],
    () => eventService.getAllEvents({ page, limit: 12, search, category }),
    { keepPreviousData: true }
  );

  return (
    <div className="flex flex-col min-h-screen bg-cream-light dark:bg-gray-900">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Discover Events"
          subtitle="Browse live events, filter by category, and lock in your seat instantly."
          badge="Events"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="">All Categories</option>
            <option value="concert">Concert</option>
            <option value="sports">Sports</option>
            <option value="theater">Theater</option>
            <option value="conference">Conference</option>
            <option value="festival">Festival</option>
          </select>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading events..." />
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400">Failed to load events</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data?.events?.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {data?.data?.pagination && data.data.pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md disabled:opacity-50 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900 dark:text-gray-300">
                  Page {page} of {data.data.pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.data.pagination.pages}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md disabled:opacity-50 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;
