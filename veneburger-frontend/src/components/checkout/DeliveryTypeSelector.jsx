import React from 'react';
import { 
  Box, Typography, Paper, 
  ToggleButtonGroup, ToggleButton 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  DirectionsBike as DeliveryIcon, 
  Storefront as PickupIcon, 
  Restaurant as DineInIcon 
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const DeliveryTypeButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.lighter || 'rgba(255, 107, 53, 0.1)',
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.lighter || 'rgba(255, 107, 53, 0.15)',
  },
}));

const DeliveryTypeSelector = () => {
  const { orderType, changeOrderType, deliveryCost } = useCart();
  
  const handleChange = (event, newValue) => {
    if (newValue !== null) {
      changeOrderType(newValue);
    }
  };
  
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Tipo de Entrega
      </Typography>
      
      <ToggleButtonGroup
        value={orderType}
        exclusive
        onChange={handleChange}
        fullWidth
        sx={{ mt: 2 }}
      >
        <DeliveryTypeButton value="delivery" aria-label="delivery">
          <DeliveryIcon sx={{ fontSize: 30, mb: 1 }} color="primary" />
          <Typography variant="body2" fontWeight="medium">
            Delivery
          </Typography>
          <Typography variant="caption" color="text.secondary">
            S/ {deliveryCost.toFixed(2)}
          </Typography>
        </DeliveryTypeButton>
        
        <DeliveryTypeButton value="pickup" aria-label="pickup">
          <PickupIcon sx={{ fontSize: 30, mb: 1 }} color="primary" />
          <Typography variant="body2" fontWeight="medium">
            Para Llevar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gratis
          </Typography>
        </DeliveryTypeButton>
        
        <DeliveryTypeButton value="local" aria-label="local">
          <DineInIcon sx={{ fontSize: 30, mb: 1 }} color="primary" />
          <Typography variant="body2" fontWeight="medium">
            Comer Local
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gratis
          </Typography>
        </DeliveryTypeButton>
      </ToggleButtonGroup>
      
      {orderType === 'delivery' && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
          <Typography variant="body2">
            Entrega a domicilio disponible en la zona metropolitana.
            Tiempo estimado: 30-45 minutos dependiendo de tu ubicación.
          </Typography>
        </Box>
      )}
      
      {orderType === 'pickup' && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
          <Typography variant="body2">
            Recoge tu pedido en nuestra sucursal. 
            Tiempo de preparación: 15-20 minutos.
          </Typography>
        </Box>
      )}
      
      {orderType === 'local' && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
          <Typography variant="body2">
            Disfruta tu comida en nuestro local.
            Se te asignará una mesa al llegar.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DeliveryTypeSelector;