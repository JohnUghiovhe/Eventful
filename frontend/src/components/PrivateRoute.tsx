import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAuthenticated, isCreator, isEventee } = useAuth();

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
