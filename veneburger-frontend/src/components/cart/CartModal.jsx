import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Box, Divider, IconButton,
  useMediaQuery, useTheme, Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ShoppingCart, Close } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import { useNavigate } from 'react-router-dom';

// Transición para el modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Estilos para el título del modal
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const CartModal = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { cart, subtotal, total, deliveryCost, discount, clearCart } = useCart();
  
  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: '90vh',
        }
      }}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCart sx={{ mr: 1 }} />
          <Typography variant="h6" component="span">
            Tu Carrito de Compras
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <Close />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent dividers sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
        {cart.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <ShoppingCart sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tu carrito está vacío
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Añade algunos productos para comenzar tu pedido
            </Typography>
          </Box>
        ) : (
          <Box>
            {cart.map((item, index) => (
              <CartItem key={index} item={item} index={index} />
            ))}
          </Box>
        )}
      </DialogContent>
      
      {cart.length > 0 && (
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">S/ {subtotal.toFixed(2)}</Typography>
          </Box>
          
          {deliveryCost > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Envío:</Typography>
              <Typography variant="body2">S/ {deliveryCost.toFixed(2)}</Typography>
            </Box>
          )}
          
          {discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Descuento:</Typography>
              <Typography variant="body2" color="error.main">-S/ {discount.toFixed(2)}</Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
              S/ {total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}
      
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        {cart.length > 0 && (
          <Button 
            color="error" 
            onClick={clearCart}
            startIcon={<Close />}
            variant="text"
          >
            Vaciar
          </Button>
        )}
        
        <Box>
          <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
            Seguir Comprando
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Proceder al Pago
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CartModal;