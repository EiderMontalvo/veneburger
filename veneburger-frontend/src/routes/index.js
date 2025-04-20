import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/home/HomePage';
import MenuPage from '../pages/menu/MenuPage';
import ProductDetailPage from '../pages/menu/ProductDetailPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/menu/:id" element={<ProductDetailPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default AppRoutes;