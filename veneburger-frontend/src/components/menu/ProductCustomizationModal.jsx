import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Remove, Close } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const ProductCustomizationModal = ({ open, onClose, product, extras = [] }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [comments, setComments] = useState('');

  // Incrementar cantidad
  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  // Decrementar cantidad
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Manejar cambio en extras
  const handleExtraChange = (extra) => {
    setSelectedExtras((prev) => {
      if (prev.includes(extra)) {
        return prev.filter((item) => item !== extra);
      } else {
        return [...prev, extra];
      }
    });
  };

  // Añadir al carrito y cerrar modal
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedExtras, comments);
    onClose();
    
    // Reset form
    setQuantity(1);
    setSelectedExtras([]);
    setComments('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Personalizar Producto</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="img"
            src={product.imagen || '/assets/images/default-product.jpg'}
            alt={product.nombre}
            sx={{
              width: 80,
              height: 80,
              objectFit: 'cover',
              borderRadius: theme.shape.borderRadius,
              mr: 2,
            }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              {product.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.descripcion}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Selector de cantidad */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Cantidad
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={decrementQuantity} 
              disabled={quantity <= 1}
              color="primary"
            >
              <Remove />
            </IconButton>
            <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
              {quantity}
            </Typography>
            <IconButton 
              onClick={incrementQuantity}
              color="primary"
            >
              <Add />
            </IconButton>
          </Box>
        </Box>
        
        {/* Extras */}
        {extras && extras.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Extras
            </Typography>
            <FormGroup>
              {extras.map((extra, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedExtras.includes(extra)}
                      onChange={() => handleExtraChange(extra)}
                      color="primary"
                    />
                  }
                  label={extra}
                />
              ))}
            </FormGroup>
          </Box>
        )}
        
        {/* Comentarios */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Instrucciones especiales
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Ej: Sin cebolla, con extra queso, etc."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Typography variant="h6" color="primary.main">
            S/ {(product.precio * quantity).toFixed(2)}
          </Typography>
          <Box>
            <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddToCart}
            >
              Añadir al Carrito
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCustomizationModal;