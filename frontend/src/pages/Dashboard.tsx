import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, isCreator } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check if coming from successful payment
    if (searchParams.get('paymentSuccess') === 'true') {
      setShowPaymentSuccess(true);
      toast.success('🎉 Payment successful! Check your tickets below.');
      // Clear the query parameter from URL
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome back, {user?.firstName}!
        </h1>

        {showPaymentSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 rounded-lg">
            <p className="text-green-800 dark:text-green-200">
              ✅ Your ticket has been issued successfully! Go to "My Tickets" to view your purchased ticket.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCreator ? (
            <>
              <Link
                to="/events/create"
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">➕</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Event
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Create a new event and start selling tickets</p>
              </Link>

              <Link
                to="/my-events"
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Events</h2>
                <p className="text-gray-600 dark:text-gray-400">View and manage your created events</p>
              </Link>

              <Link
                to="/verify-tickets"
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verify Tickets</h2>
                <p className="text-gray-600 dark:text-gray-400">Scan QR codes and verify your event tickets</p>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/events"
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Browse Events
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Discover amazing events happening near you</p>
              </Link>

              <Link
                to="/my-tickets"
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">🎫</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Tickets</h2>
                <p className="text-gray-600 dark:text-gray-400">View your purchased tickets and QR codes</p>
              </Link>
            </>
          )}
        </div>

        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isCreator
              ? 'Visit Analytics to see your event performance metrics'
              : 'Visit My Tickets to see all your upcoming events'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
