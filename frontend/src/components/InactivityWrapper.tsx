import React, { ReactNode } from 'react';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

interface InactivityWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that enables inactivity timeout monitoring
 * for all child components
 */
const InactivityWrapper: React.FC<InactivityWrapperProps> = ({ children }) => {
  // Initialize inactivity timeout tracking
  useInactivityTimeout();

  return <>{children}</>;
};

export default InactivityWrapper;
