import React from 'react';
import { Badge, Fab, Zoom } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ShoppingCart } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 85,
  right: 20,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
  zIndex: 999,
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.primary.dark,
  },
}));

const CartFloatingButton = ({ onClick }) => {
  const { itemCount } = useCart();

  return (
    <Zoom in={true}>
      <StyledFab 
        color="primary" 
        aria-label="carrito"
        onClick={onClick}
      >
        <Badge 
          badgeContent={itemCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              right: -3,
              top: -3,
              backgroundColor: '#2b2d42',
              color: 'white',
              fontWeight: 'bold',
            }
          }}
        >
          <ShoppingCart />
        </Badge>
      </StyledFab>
    </Zoom>
  );
};

export default CartFloatingButton;