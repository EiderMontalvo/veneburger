import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';
import CartFloatingButton from './components/cart/CartFloatingButton';
import CartModal from './components/cart/CartModal';
import { useCart } from './context/CartContext';
import { Box } from '@mui/material';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  
  const handleToggleCart = () => {
    setCartOpen(!cartOpen);
  };
  
  return (
    <BrowserRouter>
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: 'center' 
        }}
      >
        <Header />
        <Box sx={{ minHeight: 'calc(100vh - 120px)', pt: 7 }}>
          <AppRoutes />
        </Box>
        <Footer />
        
        {/* Solo mostrar botón flotante si hay items en el carrito */}
        {cart.length > 0 && (
          <CartFloatingButton onClick={handleToggleCart} />
        )}
        
        {/* Modal del carrito */}
        <CartModal 
          open={cartOpen} 
          onClose={() => setCartOpen(false)} 
        />
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;