import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery(['ticket', id], async () => {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data;
  });

  const updateReminderMutation = useMutation(
    async (reminder: string) => {
      await api.patch(`/tickets/${id}/reminder`, { reminder });
    },
    {
      onSuccess: () => {
        toast.success('Reminder updated successfully');
        queryClient.invalidateQueries(['ticket', id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Update failed');
      },
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (!ticket) return <div>Ticket not found</div>;

  const event = ticket.event;

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Ticket Details"
          subtitle="Access your QR pass and manage reminders in one place."
          badge="Eventee"
        />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">

          <div className="flex justify-center mb-6">
            {ticket.qrCode && (
              <img
                src={ticket.qrCode}
                alt="QR Code"
                className="w-64 h-64 border-2 border-gray-200 dark:border-gray-600 rounded-lg"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Ticket Number</h3>
              <p className="text-lg font-mono text-gray-900 dark:text-white">{ticket.ticketNumber}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Event</h3>
              <p className="text-lg text-gray-900 dark:text-white">{event.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Venue</h3>
              <p className="text-gray-900 dark:text-gray-300">{event.venue}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.location.city}, {event.location.state}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Start Date</h3>
                <p className="text-gray-900 dark:text-white">{format(new Date(event.startDate), 'PPP p')}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">End Date</h3>
                <p className="text-gray-900 dark:text-white">{format(new Date(event.endDate), 'PPP p')}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Price Paid</h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">₦{ticket.price.toLocaleString()}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Status</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
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

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Reminder Preference
              </h3>
              <select
                value={ticket.reminder}
                onChange={(e) => updateReminderMutation.mutate(e.target.value)}
                disabled={updateReminderMutation.isLoading}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="1_hour">1 Hour Before</option>
                <option value="1_day">1 Day Before</option>
                <option value="3_days">3 Days Before</option>
                <option value="1_week">1 Week Before</option>
                <option value="2_weeks">2 Weeks Before</option>
              </select>
            </div>

            {ticket.scannedAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Scanned At</h3>
                <p className="text-gray-900 dark:text-white">{format(new Date(ticket.scannedAt), 'PPP p')}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Present this QR code at the event entrance
            </p>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TicketDetails;
