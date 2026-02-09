import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const INACTIVITY_TIMEOUT = 35 * 60 * 1000; // 35 minutes in milliseconds

/**
 * Hook to automatically logout user after 35 minutes of inactivity
 * Resets timeout on any user activity (mouse, keyboard, touch)
 */
export const useInactivityTimeout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return; // Don't set timeout if not logged in

    const resetTimeout = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.warn('User inactive for 35 minutes. Logging out...');
        logout();
        navigate('/login', { state: { message: 'Session expired due to inactivity. Please log in again.' } });
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, true);
    });

    // Set initial timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, logout, navigate]);
};
