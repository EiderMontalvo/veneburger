import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Button, CircularProgress,
  Paper, Divider, TextField, IconButton, Alert, Breadcrumbs, Chip
} from '@mui/material';
import { 
  Add, Remove, ShoppingCart, 
  ArrowBack, Favorite, FavoriteBorder
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import { useCart } from '../../context/CartContext';
import ProductCustomizationModal from '../../components/menu/ProductCustomizationModal';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Cargar detalles del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await menuService.getProductDetails(id);
        setProduct(data);
        
        // Verificar si está en favoritos (almacenados en localStorage)
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
        
        // Cargar productos relacionados
        if (data?.categoria_id) {
          const relatedData = await menuService.getProductsByCategory(data.categoria_id);
          const filtered = (relatedData.productos || [])
            .filter(item => item.id !== id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error('Error al cargar detalles del producto:', err);
        setError('No se pudieron cargar los detalles del producto');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  // Incrementar cantidad
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  // Decrementar cantidad
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Manejar favoritos
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(item => item !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };
  
  // Añadir al carrito
  const handleAddToCart = () => {
    if (product.personalizable) {
      setModalOpen(true);
    } else {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !product) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Producto no encontrado'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/menu')}
        >
          Volver al Menú
        </Button>
      </Container>
    );
  }
  
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Navegación */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ textDecoration: 'none' }}
            >
              Inicio
            </Typography>
            <Typography
              component={RouterLink}
              to="/menu"
              color="inherit"
              sx={{ textDecoration: 'none' }}
            >
              Menú
            </Typography>
            <Typography color="text.primary">
              {product.nombre}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Grid container spacing={4}>
          {/* Imagen del producto */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={1}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {product.descuento > 0 && (
                <Chip
                  label={`${product.descuento}% OFF`}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontWeight: 'bold',
                  }}
                />
              )}
              <Box 
                component="img"
                src={product.imagen || '/assets/images/default-product.jpg'}
                alt={product.nombre}
                sx={{ 
                  width: '100%',
                  height: { xs: 250, sm: 350, md: 400 },
                  objectFit: 'cover'
                }}
              />
            </Paper>
          </Grid>
          
          {/* Información del producto */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {product.nombre}
                </Typography>
                <IconButton onClick={handleToggleFavorite} color="primary">
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                {product.categoria && (
                  <Chip 
                    label={product.categoria.nombre} 
                    size="small" 
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                {product.destacado && (
                  <Chip 
                    label="Destacado" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
              </Box>
              
              <Box sx={{ mb: 3 }}>
                {product.precio_anterior && product.precio_anterior > product.precio ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h6" 
                      color="text.secondary"
                      sx={{ 
                        textDecoration: 'line-through', 
                        mr: 2
                      }}
                    >
                      S/ {product.precio_anterior.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="primary.main"
                      fontWeight="bold"
                    >
                      S/ {product.precio.toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography 
                    variant="h4" 
                    color="primary.main"
                    fontWeight="bold"
                  >
                    S/ {product.precio.toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                {product.descripcion}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              {/* Selector de cantidad */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Cantidad:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <IconButton size="small" onClick={decrementQuantity} disabled={quantity <= 1}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton size="small" onClick={incrementQuantity}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {/* Botón de añadir al carrito */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ mb: 2, py: 1.5 }}
              >
                Añadir al Carrito
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/menu')}
                sx={{ width: '100%', py: 1.5 }}
              >
                Seguir Comprando
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Productos Relacionados
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map(relatedProduct => (
                <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                  <Box
                    component={RouterLink}
                    to={`/menu/${relatedProduct.id}`}
                    sx={{ textDecoration: 'none' }}
                  >
                    <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                      <Box 
                        component="img"
                        src={relatedProduct.imagen || '/assets/images/default-product.jpg'}
                        alt={relatedProduct.nombre}
                        sx={{ 
                          width: '100%',
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 2
                        }}
                      />
                      <Typography variant="subtitle1" gutterBottom>
                        {relatedProduct.nombre}
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight="bold">
                        S/ {relatedProduct.precio.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
      
      {/* Modal de personalización */}
      {product.personalizable && (
        <ProductCustomizationModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          product={product}
          extras={product.extras || []}
        />
      )}
    </Box>
  );
};

export default ProductDetailPage;