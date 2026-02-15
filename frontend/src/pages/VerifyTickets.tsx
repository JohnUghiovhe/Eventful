import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

interface VerifiedTicket {
  _id: string;
  ticketNumber: string;
  status: string;
  event: {
    title: string;
    startDate: string;
    venue: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const VerifyTickets: React.FC = () => {
  const queryClient = useQueryClient();
  const [ticketInput, setTicketInput] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [verifiedTickets, setVerifiedTickets] = useState<VerifiedTicket[]>([]);

  // Fetch creator's events
  const { data: events, isLoading: eventsLoading } = useQuery('myEvents', async () => {
    const response = await api.get('/events/my-events');
    return response.data.data.events;
  });

  // Verify ticket mutation
  const verifyMutation = useMutation(
    async (ticketNumber: string) => {
      const response = await api.post('/tickets/verify', {
        ticketNumber,
        eventId: selectedEvent
      });
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        setVerifiedTickets([data, ...verifiedTickets]);
        setTicketInput('');
        toast.success(`✓ Ticket ${data.ticketNumber} verified!`);
        queryClient.invalidateQueries('myEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Ticket verification failed');
      },
    }
  );

  // Mark ticket as used mutation
  const markUsedMutation = useMutation(
    async (ticketId: string) => {
      await api.patch(`/tickets/${ticketId}/mark-used`);
    },
    {
      onSuccess: () => {
        toast.success('Ticket marked as used');
        setVerifiedTickets(
          verifiedTickets.map(t => ({
            ...t,
            status: 'used'
          }))
        );
        queryClient.invalidateQueries('myEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to mark ticket as used');
      },
    }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) {
      toast.warning('Please enter a ticket number');
      return;
    }
    if (!selectedEvent) {
      toast.warning('Please select an event');
      return;
    }
    verifyMutation.mutate(ticketInput.trim());
  };

  if (eventsLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Verify Tickets"
          subtitle="Scan, validate, and mark tickets in real time for a smooth entry flow."
          badge="Creator"
        />
        <div className="max-w-6xl mx-auto px-4 py-8">

        {!events || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any events yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verification Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Scan or Enter Ticket</h2>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Select Event
                    </label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event: any) => (
                        <option key={event._id} value={event._id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Ticket Number or Scan QR Code
                    </label>
                    <input
                      type="text"
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      placeholder="Enter ticket number (e.g., TKT-001-2026)"
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifyMutation.isLoading || !selectedEvent}
                    className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {verifyMutation.isLoading ? 'Verifying...' : 'Verify Ticket'}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Tip: You can scan QR codes directly or paste ticket numbers. The system will automatically validate the ticket and match it to your event.
                  </p>
                </div>
              </div>

              {/* Verified Tickets List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Verified Tickets ({verifiedTickets.length})
                </h2>

                {verifiedTickets.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No tickets verified yet. Scan or enter a ticket to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {verifiedTickets.map((ticket) => (
                      <div key={ticket._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                            {ticket.ticketNumber}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {ticket.user.firstName} {ticket.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {ticket.user.email}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                ticket.status === 'used'
                                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                                  : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                              }`}
                            >
                              {ticket.status.toUpperCase()}
                            </span>
                            {ticket.status === 'paid' && (
                              <button
                                onClick={() => markUsedMutation.mutate(ticket._id)}
                                disabled={markUsedMutation.isLoading}
                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                              >
                                Mark as Used
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Events Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Events</h2>
              <div className="space-y-3">
                {events.map((event: any) => (
                  <div
                    key={event._id}
                    onClick={() => setSelectedEvent(event._id)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedEvent === event._id
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {format(new Date(event.startDate), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {event.totalTickets - event.availableTickets} / {event.totalTickets} sold
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyTickets;
