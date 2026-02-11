import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface PrivateRouteProps {
  children: ReactNode;
  requireCreator?: boolean;
  requireEventee?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireCreator,
  requireEventee,
}) => {
  const { isAuthenticated, isCreator, isEventee, isLoadingAuth } = useAuth();

  // Show loading spinner while auth is being verified
  if (isLoadingAuth) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireCreator && !isCreator) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireEventee && !isEventee) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
