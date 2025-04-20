import React from 'react';
import { 
  Box, Typography, IconButton, 
  Avatar, Chip, Paper, ButtonGroup, Button 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[1],
  },
}));

const ItemImage = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(1.5),
}));

const CartItem = ({ item, index }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleIncrease = () => {
    updateQuantity(index, item.cantidad + 1);
  };
  
  const handleDecrease = () => {
    if (item.cantidad > 1) {
      updateQuantity(index, item.cantidad - 1);
    } else {
      removeFromCart(index);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(index);
  };
  
  // Calcular el precio total del ítem
  const itemTotal = (item.precio * item.cantidad).toFixed(2);
  
  return (
    <StyledPaper>
      <ItemImage 
        src={item.imagen || '/assets/images/default-product.jpg'} 
        alt={item.nombre}
        variant="rounded"
      />
      
      <Box sx={{ flex: 1, ml: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {item.nombre}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="primary.main" 
            fontWeight="600"
          >
            S/ {itemTotal}
          </Typography>
        </Box>
        
        {/* Extras o cremas */}
        {item.extras && item.extras.length > 0 && (
          <Box sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {item.extras.join(', ')}
            </Typography>
          </Box>
        )}
        
        {/* Comentarios */}
        {item.comentarios && (
          <Chip 
            size="small" 
            label={item.comentarios}
            color="secondary"
            variant="outlined"
            sx={{ 
              height: 'auto', 
              fontSize: '0.65rem', 
              '& .MuiChip-label': { px: 1, py: 0.2 } 
            }}
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button onClick={handleDecrease} sx={{ minWidth: 30, p: 0 }}>
            <Remove fontSize="small" />
          </Button>
          <Button disableRipple sx={{ 
            minWidth: 30, 
            p: 0, 
            '&:hover': { 
              cursor: 'default', 
              backgroundColor: 'transparent' 
            }
          }}>
            {item.cantidad}
          </Button>
          <Button onClick={handleIncrease} sx={{ minWidth: 30, p: 0 }}>
            <Add fontSize="small" />
          </Button>
        </ButtonGroup>
        
        <IconButton 
          color="error" 
          size="small" 
          onClick={handleRemove}
          sx={{ ml: 0.5 }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </StyledPaper>
  );
};

export default CartItem;