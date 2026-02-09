import React from 'react';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics: React.FC = () => {
  const { data: overallData, isLoading: isLoadingOverall } = useQuery(
    'overallAnalytics',
    async () => {
      const response = await api.get('/analytics/overall');
      return response.data.data;
    }
  );

  const { data: eventsData, isLoading: isLoadingEvents } = useQuery(
    'eventsAnalytics',
    async () => {
      const response = await api.get('/analytics/events');
      return response.data.data.eventAnalytics;
    }
  );

  if (isLoadingOverall || isLoadingEvents) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

        {overallData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Total Events
              </h3>
              <p className="text-3xl font-bold">{overallData.totalEvents}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Total Tickets Sold
              </h3>
              <p className="text-3xl font-bold">{overallData.totalTicketsSold}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Tickets Scanned
              </h3>
              <p className="text-3xl font-bold">{overallData.ticketsScanned}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold">
                ₦{overallData.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Event Performance</h2>

          {!eventsData || eventsData.length === 0 ? (
            <p className="text-gray-500">No event data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Event</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Tickets Sold</th>
                    <th className="text-right py-3 px-4">Scanned</th>
                    <th className="text-right py-3 px-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsData.map((event: any) => (
                    <tr key={event.eventId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{event.eventTitle}</td>
                      <td className="py-3 px-4">
                        {format(new Date(event.eventDate), 'PP')}
                      </td>
                      <td className="text-right py-3 px-4">
                        {event.ticketsSold}
                      </td>
                      <td className="text-right py-3 px-4">
                        {event.ticketsScanned}
                      </td>
                      <td className="text-right py-3 px-4">
                        ₦{event.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
