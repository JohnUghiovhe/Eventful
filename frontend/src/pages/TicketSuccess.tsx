import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import { Ticket, Event } from '../types';

const TicketSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketId = location.state?.ticketId;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) {
      setError('Ticket information not found');
      setLoading(false);
      return;
    }

    const fetchTicketDetails = async () => {
      try {
        const response = await api.get(`/tickets/${ticketId}`);
        if (response.data.success) {
          const ticketData = response.data.data;
          setTicket(ticketData);

          // Fetch event details if not already populated
          if (ticketData.event && typeof ticketData.event === 'string') {
            const eventResponse = await api.get(`/events/${ticketData.event}`);
            if (eventResponse.data.success) {
              setEvent(eventResponse.data.data);
            }
          } else if (ticketData.event && typeof ticketData.event === 'object') {
            setEvent(ticketData.event as Event);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch ticket:', err);
        setError(err.response?.data?.message || 'Failed to fetch ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <PageHeader
            title="Ticket Confirmed"
            subtitle="We are preparing your ticket confirmation."
            badge="Success"
          />
          <div className="max-w-2xl mx-auto px-4 py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <PageHeader
            title="Ticket Error"
            subtitle="There was an issue loading your ticket."
            badge="Error"
          />
          <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Error Loading Ticket
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{error}</p>
              <button
                onClick={() => navigate('/my-tickets')}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to My Tickets
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <PageHeader
            title="Ticket Not Found"
            subtitle="The ticket could not be found."
            badge="Error"
          />
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <button
              onClick={() => navigate('/my-tickets')}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to My Tickets
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="🎉 Ticket Confirmed!"
          subtitle="Your ticket has been successfully claimed. Check your email for confirmation."
          badge="Success"
        />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Card */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-t-4 border-green-500">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
              <div className="text-7xl mb-4">✓</div>
              <h1 className="text-3xl font-bold mb-2">Ticket Successfully Claimed!</h1>
              <p className="text-green-100">
                Your entrance pass is ready. Show your QR code at the event.
              </p>
            </div>

            <div className="p-8">
              {/* Ticket Information */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 font-semibold uppercase tracking-wider">
                    Your QR Code
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <QRCode
                      value={JSON.stringify({
                        ticketNumber: ticket.ticketNumber,
                        eventId: typeof event?._id === 'object' ? String(event._id) : String(event._id),
                        userId: typeof ticket?.user === 'object' ? String(ticket.user) : String(ticket.user),
                        eventTitle: event.title
                      })}
                      size={200}
                      level="H"
                    />
                  </div>
                  <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    Present this QR code at the event entrance
                  </p>
                </div>

                {/* Ticket Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Ticket Number
                    </label>
                    <p className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400">
                      {ticket.ticketNumber}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Event
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Date & Time
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {format(new Date(event.startDate), 'PPP p')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Venue
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {event.venue}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Price
                    </label>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      FREE
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              {event.description && (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    About this Event
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Important Information */}
              <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  📋 Important Information
                </h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Save this email or screenshot your QR code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Arrive early to avoid queues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Bring a valid ID for verification</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Check event updates on your dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  📱 View All My Tickets
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  🔍 Browse More Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TicketSuccess;
