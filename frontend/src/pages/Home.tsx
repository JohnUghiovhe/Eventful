import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="relative bg-indigo-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Your Passport to</span>
                  <span className="block text-indigo-200">Unforgettable Moments</span>
                </h1>
                <p className="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  From pulsating concerts to captivating theater performances, and
                  thrilling sports events to enlightening cultural gatherings. Discover and
                  book tickets to amazing events.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/events"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Explore Events
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
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
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage events
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  🎫
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Easy Ticketing
                </h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Purchase tickets with secure payment processing
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  📱
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">QR Codes</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Digital tickets with QR codes for easy verification
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  🔔
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Reminders</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Never miss an event with customizable reminders
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  📊
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Analytics</h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Track ticket sales and event performance
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  🔗
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Social Sharing
                </h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Share events on all social media platforms
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  💳
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Secure Payments
                </h3>
                <p className="mt-2 text-base text-gray-500 text-center">
                  Safe and secure payment processing with Paystack
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
