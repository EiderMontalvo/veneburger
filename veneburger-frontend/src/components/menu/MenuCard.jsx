import React, { useState } from 'react';
import { 
  Card, CardContent, CardMedia, Typography, Box, Button,
  CardActionArea, Skeleton, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ProductCustomizationModal from './ProductCustomizationModal';

const MenuCard = ({ product, loading = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Si necesita personalización, abrir modal; si no, añadir directamente
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Evitar navegación al hacer clic en el botón
    
    if (product.personalizable) {
      setModalOpen(true);
    } else {
      addToCart(product, 1);
    }
  };
  
  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={180} />
        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={50} height={30} />
            <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 20 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
      }}>
        {product.descuento > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.common.white,
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1,
            }}
          >
            {product.descuento}% OFF
          </Box>
        )}
        
        <CardActionArea onClick={() => navigate(`/menu/${product.id}`)}>
          <CardMedia
            component="img"
            height="180"
            image={product.imagen || '/assets/images/default-product.jpg'}
            alt={product.nombre}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {product.nombre}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                height: '40px'
              }}
            >
              {product.descripcion}
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 'auto' 
              }}
            >
              <Box>
                {product.precio_anterior && product.precio_anterior > product.precio ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        textDecoration: 'line-through', 
                        mr: 1,
                        fontWeight: 500
                      }}
                    >
                      S/ {product.precio_anterior.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary.main"
                      fontWeight={600}
                    >
                      S/ {product.precio.toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography 
                    variant="h6" 
                    color="primary.main"
                    fontWeight={600}
                  >
                    S/ {product.precio.toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              <Button 
                variant="add"
                onClick={handleAddToCart}
              >
                Añadir
              </Button>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      
      {/* Modal de personalización */}
      {product.personalizable && (
        <ProductCustomizationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          product={product}
          extras={product.extras || []}
        />
      )}
    </>
  );
};

export default MenuCard;