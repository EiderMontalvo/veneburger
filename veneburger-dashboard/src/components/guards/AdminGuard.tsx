import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { usuario } = useSelector((state: RootState) => state.auth);

  if (!usuario || usuario.rol !== 'admin') {
    // Redirigir si no es administrador
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;