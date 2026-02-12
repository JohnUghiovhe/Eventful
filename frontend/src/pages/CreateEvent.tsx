import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import Navbar from '../components/Navbar';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom',
  'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'India',
  'China', 'Japan', 'Other'
];

interface EventFormData {
  title: string;
  description: string;
  category: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  country: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  totalTickets: number;
  defaultReminder: string;
  tags: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>();

  useQuery(['event', id], async () => {
    if (!id) return null;
    const response = await api.get(`/events/${id}`);
    const event = response.data.data;
    
    // Convert dates to local datetime string format for datetime-local input
    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Load existing images
    if (event.images && Array.isArray(event.images)) {
      setImageUrls(event.images);
    }
    
    reset({
      ...event,
      address: event.location.address,
      city: event.location.city,
      state: event.location.state,
      country: event.location.country,
      startDate: formatDateForInput(event.startDate),
      endDate: formatDateForInput(event.endDate),
      tags: event.tags?.join(', ') || '',
    });
    return event;
  }, { enabled: isEditing });

  const mutation = useMutation(
    async (data: EventFormData & { startDate: string; endDate: string }) => {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        venue: data.venue,
        location: {
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
        },
        startDate: data.startDate,
        endDate: data.endDate,
        ticketPrice: data.ticketPrice,
        totalTickets: data.totalTickets,
        defaultReminder: data.defaultReminder,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: imageUrls, // Include images in payload
      };

      if (isEditing) {
        return await api.put(`/events/${id}`, payload);
      }
      return await api.post('/events', payload);
    },
    {
      onSuccess: () => {
        toast.success(isEditing ? 'Event updated' : 'Event created');
        navigate('/my-events');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Operation failed');
      },
    }
  );

  const handleAddImage = () => {
    if (imageInput.trim() && imageUrls.length < 5) {
      // Basic URL validation
      try {
        new URL(imageInput.trim());
        setImageUrls([...imageUrls, imageInput.trim()]);
        setImageInput('');
        toast.success('Image added successfully');
      } catch {
        toast.error('Please enter a valid URL');
      }
    } else if (imageUrls.length >= 5) {
      toast.warning('Maximum 5 images allowed');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    toast.info('Image removed');
  };

  const onSubmit = (data: EventFormData) => {
    // Check if time component is set (datetime-local includes time by default, but warn if it's midnight which might be unintentional)
    const startDateTime = new Date(data.startDate);
    const endDateTime = new Date(data.endDate);
    
    if ((startDateTime.getHours() === 0 && startDateTime.getMinutes() === 0) || 
        (endDateTime.getHours() === 0 && endDateTime.getMinutes() === 0)) {
      setShowTimeWarning(true);
      toast.warning('Please ensure you have set the correct time for your event');
      return;
    }
    
    setShowTimeWarning(false);
    
    // Convert datetime-local values to proper ISO strings
    const payload = {
      ...data,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          {isEditing ? 'Edit Event' : 'Create New Event'}
        </h1>
        
        {showTimeWarning && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded-md">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Warning: Event time appears to be set to midnight (00:00). Please ensure this is correct.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            {errors.title && <p className="text-red-500 dark:text-red-400 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            {errors.description && <p className="text-red-500 dark:text-red-400 text-sm">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
              <input
                {...register('category', { required: 'Category is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.category && <p className="text-red-500 dark:text-red-400 text-sm">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Venue</label>
              <input
                {...register('venue', { required: 'Venue is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.venue && <p className="text-red-500 dark:text-red-400 text-sm">{errors.venue.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Address</label>
            <input
              {...register('address', { required: 'Address is required' })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            {errors.address && <p className="text-red-500 dark:text-red-400 text-sm">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">City</label>
              <input
                {...register('city', { required: 'City is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.city && <p className="text-red-500 dark:text-red-400 text-sm">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">State</label>
              <select
                {...register('state', { required: 'State is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 dark:text-red-400 text-sm">{errors.state.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Country</label>
              <select
                {...register('country', { required: 'Country is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 dark:text-red-400 text-sm">{errors.country.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date & Time</label>
              <input
                type="datetime-local"
                {...register('startDate', { required: 'Start date is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.startDate && <p className="text-red-500 dark:text-red-400 text-sm">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date & Time</label>
              <input
                type="datetime-local"
                {...register('endDate', { required: 'End date is required' })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.endDate && <p className="text-red-500 dark:text-red-400 text-sm">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ticket Price (₦)</label>
              <input
                type="number"
                {...register('ticketPrice', { required: 'Price is required', min: 0 })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.ticketPrice && <p className="text-red-500 dark:text-red-400 text-sm">{errors.ticketPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Total Tickets</label>
              <input
                type="number"
                {...register('totalTickets', { required: 'Total tickets is required', min: 1 })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              {errors.totalTickets && <p className="text-red-500 dark:text-red-400 text-sm">{errors.totalTickets.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Default Reminder</label>
            <select
              {...register('defaultReminder')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="1_hour">1 Hour Before</option>
              <option value="1_day">1 Day Before</option>
              <option value="3_days">3 Days Before</option>
              <option value="1_week">1 Week Before</option>
              <option value="2_weeks">2 Weeks Before</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
            <input
              {...register('tags')}
              placeholder="music, concert, live"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          {/* Event Images Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Event Images (up to 5)
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Add image URLs to showcase your event. Use high-quality images from Imgur, Cloudinary, or your own hosting.
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={imageUrls.length >= 5}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Image
              </button>
            </div>

            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Event preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {imageUrls.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No images added yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Add image URLs above to showcase your event</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {mutation.isLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-events')}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
