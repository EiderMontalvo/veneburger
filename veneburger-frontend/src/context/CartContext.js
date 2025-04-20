import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [orderType, setOrderType] = useState('delivery');
  const [itemCount, setItemCount] = useState(0);

  // Calcular totales cuando cambia el carrito
  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const sub = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const totalValue = sub + (orderType === 'delivery' ? deliveryCost : 0) - discount;

    setItemCount(count);
    setSubtotal(sub);
    setTotal(totalValue);
  }, [cart, orderType, deliveryCost, discount]);

  // Añadir al carrito
  const addToCart = (product, quantity = 1, extras = [], comments = '') => {
    setCart(prevCart => [...prevCart, {
      ...product,
      cantidad: quantity,
      extras: extras,
      comentarios: comments
    }]);
  };

  // Actualizar cantidad
  const updateQuantity = (index, newQuantity) => {
    setCart(prevCart => 
      prevCart.map((item, i) => 
        i === index ? { ...item, cantidad: newQuantity } : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  // Cambiar tipo de orden
  const changeOrderType = (type) => {
    setOrderType(type);
  };

  // Aplicar descuento
  const applyDiscount = (amount) => {
    setDiscount(amount);
  };

  const value = {
    cart,
    itemCount,
    subtotal,
    deliveryCost,
    discount,
    total,
    orderType,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    changeOrderType,
    applyDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};