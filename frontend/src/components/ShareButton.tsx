import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { eventService } from '../services/event.service';

interface ShareButtonProps {
  eventId: string;
  eventTitle: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ eventId }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy') => {
    try {
      setIsLoading(true);
      const response = await eventService.getShareLinks(eventId);

      if (response.success && response.data) {
        const { shareLinks, eventUrl } = response.data;

        if (platform === 'copy') {
          navigator.clipboard.writeText(eventUrl);
          toast.success('Link copied to clipboard!');
        } else {
          const url = shareLinks[platform];
          if (url) {
            window.open(url, '_blank', 'width=600,height=600');
            toast.success(`Sharing on ${platform}...`);
          }
        }
      }
      setShowShareMenu(false);
    } catch (error: any) {
      console.error('Share error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
        title="Share this event"
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
            d="M8.684 13.342C9.589 12.438 10 11.166 10 9.75c0-2.627-2.134-4.75-4.75-4.75S.5 7.123.5 9.75s2.134 4.75 4.75 4.75c.375 0 .749-.04 1.109-.12l3.114 3.114c-.397.395-.395 1.038.002 1.435a1.013 1.013 0 001.435-.002l3.113-3.114c.36.08.734.12 1.109.12 2.627 0 4.75-2.134 4.75-4.75s-2.134-4.75-4.75-4.75-4.75 2.134-4.75 4.75c0 1.416.411 2.688 1.316 3.592z"
          />
        </svg>
        Share
      </button>

      {showShareMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 p-2">
          <button
            onClick={() => handleShare('copy')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-900 dark:text-white">Copy Link</span>
          </button>

          <button
            onClick={() => handleShare('facebook')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-gray-900 dark:text-white">Facebook</span>
          </button>

          <button
            onClick={() => handleShare('twitter')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <span className="text-gray-900 dark:text-white">Twitter</span>
          </button>

          <button
            onClick={() => handleShare('linkedin')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.237-1.697-2.237-1.02 0-1.628.687-1.895 1.35-.097.23-.121.551-.121.873v5.583h-3.562V8.255h3.562v1.51c.477-.73 1.328-1.768 3.228-1.768 2.355 0 4.121 1.54 4.121 4.842v7.613zM5.337 7.433c-1.144 0-2.063-.929-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.136-.925 2.065-2.064 2.065zm1.782 13.019H3.555V8.255h3.564v12.197zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
            <span className="text-gray-900 dark:text-white">LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare('whatsapp')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.564 1.312c-2.821 1.746-4.627 5.317-4.627 9.056 0 2.53.643 4.982 1.879 7.12l-2 7.31 7.651-2.006c2.01 1.1 4.28 1.679 6.604 1.679 7.769 0 14.08-6.31 14.08-14.075 0-3.766-1.466-7.312-4.126-9.974C19.835 2.412 16.489.84 12.924.84c-5.385 0-9.955 4.565-9.955 9.975z" />
            </svg>
            <span className="text-gray-900 dark:text-white">WhatsApp</span>
          </button>

          <button
            onClick={() => handleShare('email')}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-900 dark:text-white">Email</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
