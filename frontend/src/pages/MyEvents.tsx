import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

const MyEvents: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery('myEvents', async () => {
    const response = await api.get('/events/my-events');
    return response.data.data.events;
  });

  const deleteMutation = useMutation(
    async (eventId: string) => {
      await api.delete(`/events/${eventId}`);
    },
    {
      onSuccess: () => {
        toast.success('Event deleted successfully');
        queryClient.invalidateQueries('myEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Delete failed');
      },
    }
  );

  const updateStatusMutation = useMutation(
    async ({ eventId, status }: { eventId: string; status: string }) => {
      await api.patch(`/events/${eventId}/status`, { status });
    },
    {
      onSuccess: () => {
        toast.success('Event status updated');
        queryClient.invalidateQueries('myEvents');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Update failed');
      },
    }
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Events</h1>
          <Link
            to="/events/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Event
          </Link>
        </div>

        {!events || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
            <Link
              to="/events/create"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: any) => (
              <div key={event._id} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-2">{event.venue}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(event.startDate), 'PPP')}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Price: ₦{event.ticketPrice.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        Tickets: {event.availableTickets}/{event.totalTickets}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          event.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/events/edit/${event._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    {event.status === 'draft' && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            eventId: event._id,
                            status: 'published',
                          })
                        }
                        className="text-green-600 hover:text-green-800"
                      >
                        Publish
                      </button>
                    )}

                    {event.status === 'published' && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({
                            eventId: event._id,
                            status: 'cancelled',
                          })
                        }
                        className="text-orange-600 hover:text-orange-800"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          deleteMutation.mutate(event._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
