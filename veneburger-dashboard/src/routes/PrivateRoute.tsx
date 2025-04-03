import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isAdmin } = useSelector((state: RootState) => state.auth);
  
  // Si no está autenticado o no es admin, redirigir al login
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Si está autenticado y es admin, mostrar las rutas protegidas
  return <Outlet />;
};

export default PrivateRoute;