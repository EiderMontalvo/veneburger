import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/admin/Dashboard';
import CategoriesList from '../pages/admin/categories/CategoriesList';
import CategoryForm from '../pages/admin/categories/CategoryForm';
import ProductsList from '../pages/admin/products/ProductsList';
import ProductForm from '../pages/admin/products/ProductForm';
import NotFound from '../pages/public/NotFound';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import PrivateRoute from './PrivateRoute';
import { checkAuthAsync } from '../features/auth/authSlice';
import { useAppDispatch } from '../app/store';

const AppRoutes = () => {
  // Usar useAppDispatch en lugar de useDispatch
  const dispatch = useAppDispatch();
  
  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(checkAuthAsync());
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Login />} />
      </Route>
      
      {/* Rutas protegidas */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Rutas de categorías */}
          <Route path="categories" element={<CategoriesList />} />
          <Route path="categories/create" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />
          
          {/* Rutas de productos */}
          <Route path="products" element={<ProductsList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
        </Route>
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;