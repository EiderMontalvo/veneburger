import React from 'react';
import {
  Paper, Typography, Box, Divider,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Chip, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCart } from '../../context/CartContext';

const SummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  position: 'sticky',
  top: 90,
}));

const OrderSummary = ({ onCheckout }) => {
  const { cart, subtotal, total, deliveryCost, discount, orderType } = useCart();
  
  return (
    <SummaryPaper elevation={2}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Resumen del Pedido
      </Typography>
      
      <List disablePadding sx={{ mb: 2 }}>
        {cart.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1.5, px: 0 }}>
            <ListItemAvatar>
              <Avatar 
                variant="rounded" 
                alt={item.nombre}
                src={item.imagen || '/assets/images/default-product.jpg'}
                sx={{ width: 40, height: 40 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ mr: 1 }}>
                    {item.nombre} {item.cantidad > 1 && `(${item.cantidad})`}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    S/ {(item.precio * item.cantidad).toFixed(2)}
                  </Typography>
                </Box>
              }
              secondary={
                item.extras && item.extras.length > 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {item.extras.join(', ')}
                  </Typography>
                ) : null
              }
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Subtotal:</Typography>
          <Typography variant="body2">S/ {subtotal.toFixed(2)}</Typography>
        </Box>
        
        {deliveryCost > 0 && orderType === 'delivery' && (
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
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        bgcolor: 'primary.lighter',
        p: 1.5, 
        borderRadius: 1,
        mb: 3
      }}>
        <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
          S/ {total.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip 
          label={orderType === 'delivery' ? 'Delivery' : orderType === 'pickup' ? 'Para Llevar' : 'Comer en Local'} 
          color="primary"
          size="small"
          sx={{ mr: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          {orderType === 'delivery' 
            ? 'Entrega a domicilio' 
            : orderType === 'pickup' 
              ? 'Recoger en tienda' 
              : 'Servido en mesa'}
        </Typography>
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        size="large"
        onClick={onCheckout}
        disabled={cart.length === 0}
      >
        Realizar Pedido
      </Button>
    </SummaryPaper>
  );
};

export default OrderSummary;