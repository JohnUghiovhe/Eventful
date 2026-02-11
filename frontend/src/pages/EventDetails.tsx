import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedReminder, setSelectedReminder] = useState('1_day');

  const { data: event, isLoading } = useQuery(['event', id], async () => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  });

  const purchaseMutation = useMutation(
    async () => {
      const response = await api.post('/payments/initialize', {
        eventId: id,
        reminder: selectedReminder,
      });
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        window.location.href = data.paymentUrl;
      },
      onError: (error: any) => {
        const status = error.response?.status;
        const data = error.response?.data;
        
        if (status === 403) {
          // Permission/role error
          toast.error(
            data?.message || 'You cannot purchase tickets. Please ensure your account is registered as an Eventee.'
          );
        } else if (status === 401) {
          // Authentication error
          toast.info('Please login to purchase tickets');
          navigate('/login');
        } else {
          toast.error(data?.message || 'Purchase failed');
        }
      },
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (!event) return <div>Event not found</div>;

  const handlePurchase = () => {
    if (!user) {
      toast.info('Please login to purchase tickets');
      navigate('/login');
      return;
    }
    purchaseMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {event.images?.length > 0 && (
          <img
            src={event.images[0]}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Date & Time</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {format(new Date(event.startDate), 'PPP p')} - {format(new Date(event.endDate), 'PPP p')}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Location</h3>
            <p className="text-gray-700 dark:text-gray-300">{event.venue}</p>
            <p className="text-gray-600 dark:text-gray-400">
              {event.location.city}, {event.location.state}, {event.location.country}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Price</h3>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₦{event.ticketPrice.toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Available Tickets</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {event.availableTickets} / {event.totalTickets}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{event.description}</p>
        </div>

        {event.tags?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {event.status === 'published' && event.availableTickets > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Purchase Ticket</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Reminder Preference
              </label>
              <select
                value={selectedReminder}
                onChange={(e) => setSelectedReminder(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="1_hour">1 Hour Before</option>
                <option value="1_day">1 Day Before</option>
                <option value="3_days">3 Days Before</option>
                <option value="1_week">1 Week Before</option>
                <option value="2_weeks">2 Weeks Before</option>
              </select>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchaseMutation.isLoading}
              className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {purchaseMutation.isLoading ? 'Processing...' : 'Purchase Ticket'}
            </button>
          </div>
        )}

        {event.status !== 'published' && (
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-800">
              This event is not currently available for ticket purchase.
            </p>
          </div>
        )}

        {event.availableTickets === 0 && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">This event is sold out.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
