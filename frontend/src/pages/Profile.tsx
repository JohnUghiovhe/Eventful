import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { User } from '../types';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: user?.profileImage || '',
  });
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profileImage || '');

  const { data: profile, isLoading } = useQuery(['profile'], async () => {
    const response = await authService.getProfile();
    return response.data;
  }, {
    initialData: user,
  });

  const updateMutation = useMutation(
    async (data: any) => {
      const response = await authService.updateProfile(data);
      return response.data;
    },
    {
      onSuccess: (data: User | undefined) => {
        if (data) {
          updateUser(data);
        }
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update profile';
        toast.error(message);
      },
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 1mb before compression)
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast.error('Image size should be less than 1MB. Please compress your image.');
        return;
      }

      // Create image element to compress
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Set canvas size to reduce dimensions
        let width = img.width;
        let height = img.height;

        // Scale down if image is too large
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to compressed base64 (JPEG quality 0.8)
        const compressedImage = canvas.toDataURL('image/jpeg', 0.8);

        // Check final size
        const compressedSize = (compressedImage.length * 3) / 4; // Approximate base64 size
        if (compressedSize > maxSize) {
          toast.error('Compressed image is still too large. Please use a smaller image.');
          return;
        }

        setPreviewUrl(compressedImage);
        setProfileData((prev) => ({
          ...prev,
          profileImage: compressedImage,
        }));
        toast.success('Image compressed and ready to upload');
      };

      img.onerror = () => {
        toast.error('Failed to process image. Please try another file.');
      };

      // Read file as data URL for image element
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      profileImage: user?.profileImage || '',
    });
    setPreviewUrl(user?.profileImage || '');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="My Profile"
          subtitle="Manage your details and keep your profile fresh."
          badge="Account"
        />
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden mb-4">
                  {previewUrl || profile?.profileImage ? (
                    <img
                      src={previewUrl || profile?.profileImage}
                      alt={profile?.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {isEditing && (
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer mb-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm">
                        Change Photo
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Max size: 500KB | Auto-compressed to 800x800px
                    </p>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="md:col-span-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                      {profile?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md capitalize">
                      {profile?.role}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name
                          </label>
                          <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                            {profile?.firstName}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                          </label>
                          <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                            {profile?.lastName}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <div className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                          {profile?.phoneNumber || 'Not provided'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isLoading}
                    className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
