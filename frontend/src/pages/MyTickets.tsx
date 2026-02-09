import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MyTickets: React.FC = () => {
  const { data: tickets, isLoading } = useQuery('myTickets', async () => {
    const response = await api.get('/tickets');
    return response.data.data.tickets;
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Tickets</h1>

        {!tickets || tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any tickets yet.</p>
            <Link to="/events" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket: any) => {
              const event = ticket.event;
              return (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {event.images?.length > 0 && (
                    <img
                      src={event.images[0]}
                      alt={event.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.venue}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {format(new Date(event.startDate), 'PPP')}
                    </p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        #{ticket.ticketNumber}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === 'paid'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : ticket.status === 'used'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
