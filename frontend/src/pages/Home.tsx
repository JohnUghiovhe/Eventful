import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform rotate-45 -inset-1/2 bg-gradient-to-r from-pink-600 to-transparent"></div>
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="text-center">
                  {/* 3D-style logo */}
                  <div className="mb-8 inline-block">
                    <div className="relative">
                      <div className="text-6xl md:text-7xl font-black transform -skew-y-2">
                        <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
                          ✨ Eventful
                        </span>
                      </div>
                      <div className="absolute inset-0 text-6xl md:text-7xl font-black opacity-20 transform skew-y-1 blur-sm">
                        ✨ Eventful
                      </div>
                    </div>
                  </div>

                  <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span className="block">Your Passport to</span>
                    <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                      Unforgettable Moments
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-5 md:text-xl">
                    Discover amazing events, connect with passionate people, and create memories
                    that last. From concerts to conferences, sports to showbiz – find your perfect event today.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center gap-4">
                    <div className="rounded-md shadow">
                      <Link
                        to="/events"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all transform hover:scale-105 shadow-lg"
                      >
                        Explore Events
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-indigo-600 md:py-4 md:text-lg md:px-10 transition-all transform hover:scale-105"
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-12">
              <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase">
                Key Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need for unforgettable events
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl mb-4">
                    🎫
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Easy Ticketing
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Purchase tickets securely with instant confirmation
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-pink-500 to-red-600 text-white text-2xl mb-4">
                    📱
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Mobile QR Codes
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Digital tickets with QR codes for easy verification at events
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-yellow-500 to-orange-600 text-white text-2xl mb-4">
                    🔔
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Smart Reminders
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Never miss an event with customizable reminder notifications
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-green-500 to-teal-600 text-white text-2xl mb-4">
                    📊
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Analytics
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Track ticket sales and event performance in real-time
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-2xl mb-4">
                    🔗
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Social Sharing
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    Share events across all social media platforms instantly
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md hover:shadow-xl transition-shadow transform hover:scale-105">
                  <div className="flex items-center justify-center h-14 w-14 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl mb-4">
                    💳
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Secure Payments
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                    PCI-compliant payment processing with Paystack integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Ready to discover your next event?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of event enthusiasts and creators on Eventful. Start exploring amazing events or create your own today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/events"
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Browse Events
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 bg-indigo-700 text-white font-semibold rounded-md hover:bg-indigo-800 transition-all transform hover:scale-105"
              >
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
