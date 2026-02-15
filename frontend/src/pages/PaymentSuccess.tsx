import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import { Ticket, Event } from '../types';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const demo = searchParams.get('demo');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stallMessage, setStallMessage] = useState<string | null>(null);
  const verifyAttemptRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Prevent duplicate verification calls (handles React StrictMode in development)
    if (verifyAttemptRef.current === reference) {
      console.log('Payment verification already in progress for this reference:', reference);
      return;
    }

    if (reference) {
      verifyAttemptRef.current = reference;
    }

    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          reject(new Error('VERIFICATION_TIMEOUT'));
        }, timeoutMs);

        promise
          .then((value) => {
            window.clearTimeout(timeoutId);
            resolve(value);
          })
          .catch((err) => {
            window.clearTimeout(timeoutId);
            reject(err);
          });
      });
    };

    const verifyPayment = async () => {
      const stallTimer = window.setTimeout(() => {
        setStallMessage('Verification is taking longer than usual. We are still checking your payment...');
      }, 10000);

      try {
        if (!reference) {
          console.error('No payment reference in URL');
          setError('No payment reference found');
          setLoading(false);
          return;
        }

        console.log('Verifying payment with reference:', reference);

        // Handle demo mode (no backend verification needed)
        if (demo === 'true') {
          console.log('Demo mode - showing sample ticket');
          // Create demo ticket and event using type assertion
          const demoEvent = {
            _id: 'demo-event',
            title: 'Demo Event',
            description: 'This is a demo event. No actual payment was made.',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: { address: 'Demo Address', city: 'Demo City', state: 'Demo State', country: 'Nigeria' } as any,
            ticketPrice: 5000,
            images: [],
            creator: 'demo-creator',
            capacity: 100,
            ticketsSold: 1,
            status: 'published' as const
          } as unknown as Event;

          const demoTicket = {
            _id: 'demo-ticket',
            ticketNumber: `DEMO-${Date.now()}`,
            event: 'demo-event',
            user: 'demo-user',
            payment: 'demo-payment',
            status: 'valid' as const
          } as unknown as Ticket;

          setTicket(demoTicket);
          setEvent(demoEvent);
          setLoading(false);
          return;
        }

        // Verify payment with backend (public endpoint for redirect flow)
        console.log('Calling /payments/verify-public endpoint');
        const requestVerify = () => withTimeout(api.post('/payments/verify-public', { reference }), 10000);
        let verifyResponse = await requestVerify();

        if (!verifyResponse?.data?.success) {
          // Keep existing flow for non-success responses
          console.warn('Verification returned non-success response, retrying once...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          verifyResponse = await requestVerify();
        }

        console.log('Payment verification response:', verifyResponse.data);

        if (verifyResponse.data.success && verifyResponse.data.data) {
          const verifiedTicket = verifyResponse.data.data.ticket as Ticket | undefined;
          const payment = verifyResponse.data.data.payment as any;

          if (verifiedTicket) {
            setTicket(verifiedTicket);
          }

          const paymentEvent = payment?.event;
          if (paymentEvent && typeof paymentEvent === 'object') {
            setEvent(paymentEvent as Event);
          } else {
            const eventId = paymentEvent || verifiedTicket?.event;
            if (eventId) {
              const eventResponse = await api.get(`/events/${eventId}`);
              if (eventResponse.data.success) {
                setEvent(eventResponse.data.data);
              }
            }
          }

          if (!verifiedTicket) {
            console.error('Ticket missing in verification response:', verifyResponse.data);
            setError('Ticket information not found');
          }
        } else {
          console.error('Payment verification failed:', verifyResponse.data);
          setError(verifyResponse.data.message || 'Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        console.error('Error response:', err.response?.data);

        if (err?.message === 'VERIFICATION_TIMEOUT') {
          setError('Verification is taking too long. Please refresh this page to view your ticket, or check your dashboard later.');
          return;
        }
        
        // Handle duplicate ticket creation (E11000 unique constraint error)
        const errorMessage = err.response?.data?.message || err.message || err.response?.data?.error || 'Failed to verify payment';
        const isDuplicateKeyError = errorMessage.includes('E11000') || errorMessage.includes('duplicate');
        
        if (isDuplicateKeyError) {
          console.info('Duplicate ticket detected (E11000), retrying verification...');
          try {
            // Wait a moment and retry
            await new Promise(resolve => setTimeout(resolve, 500));
            const retryResponse = await api.post('/payments/verify-public', { reference });
            
            if (retryResponse.data.success && retryResponse.data.data?.ticket) {
              console.info('Successfully retrieved existing ticket after duplicate error');
              setTicket(retryResponse.data.data.ticket);
              if (retryResponse.data.data.payment?.event) {
                setEvent(retryResponse.data.data.payment.event);
              }
              setLoading(false);
              return;
            }
          } catch (retryErr) {
            console.error('Retry verification failed:', retryErr);
          }
        }
        
        setError(errorMessage);
      } finally {
        window.clearTimeout(stallTimer);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference, demo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1">
          <PageHeader
            title="Payment Status"
            subtitle="We are verifying your transaction and preparing your ticket."
            badge="Payments"
          />
          <div className="max-w-2xl mx-auto px-4 py-12">
            <LoadingSpinner />
            {stallMessage && (
              <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">{stallMessage}</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Payment Status"
          subtitle="Your ticket is ready. Save the QR code and check your email for confirmation."
          badge="Payments"
        />
        <div className="max-w-4xl mx-auto px-4 py-12">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Payment Failed</h1>
            <p className="text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
            >
              Back to Events
            </button>
          </div>
        ) : ticket && event ? (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-lg opacity-90">Your ticket has been generated and sent to your email</p>
            </div>

            {/* Event Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div 
                className="h-48 bg-gradient-to-r from-indigo-600 to-purple-600 relative"
                style={{
                  backgroundImage: event.images && event.images.length > 0 ? `url(${event.images[0]})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                  <h2 className="text-3xl font-bold text-white">{event.title}</h2>
                </div>
              </div>

              <div className="p-8">
                {/* Event Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">DATE</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {format(new Date(event.startDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">TIME</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {format(new Date(event.startDate), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">LOCATION</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{
                      typeof event.location === 'string' ? event.location : event.location?.city || 'TBA'
                    }</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1">PRICE</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">₦{event.ticketPrice?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>

            {/* Ticket Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Event Ticket</h3>
              
              {/* Ticket Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 border-2 border-dashed border-indigo-300 dark:border-indigo-500">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center md:w-1/3">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <QRCode 
                        value={ticket.ticketNumber || 'ticket'} 
                        size={200}
                        level="H"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
                      Scan for entry
                    </p>
                  </div>

                  {/* Ticket Details */}
                  <div className="md:w-2/3 space-y-6">
                    {/* Header */}
                    <div className="border-b-2 border-indigo-300 dark:border-indigo-500 pb-6">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h4>
                      <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Event Ticket</p>
                    </div>

                    {/* Ticket Info */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Ticket Number</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white text-lg break-all">{ticket.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Ticket Type</p>
                        <p className="font-bold text-gray-900 dark:text-white">General Admission</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Date</p>
                        <p className="font-bold text-gray-900 dark:text-white">{format(new Date(event.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Time</p>
                        <p className="font-bold text-gray-900 dark:text-white">{format(new Date(event.startDate), 'HH:mm aaa')}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Venue</p>
                        <p className="font-bold text-gray-900 dark:text-white">{
                          typeof event.location === 'string' ? event.location : `${event.location?.address}, ${event.location?.city}` || 'TBA'
                        }</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-indigo-300 dark:border-indigo-500 pt-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ✓ This ticket is valid for one person only. Please bring a valid ID to the event.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  📧 A copy of your ticket has been sent to your email. Keep it safe for entry to the event.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/my-tickets')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                View My Tickets
              </button>
              <button
                onClick={() => navigate('/events')}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Browse More Events
              </button>
            </div>
          </div>
        ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
