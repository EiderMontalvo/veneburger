import React from 'react';
import { Box, Typography, Grid, Container, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useProducts from '../../hooks/useProducts';
import MenuCard from '../menu/MenuCard';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts(null, { featured: true });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error">Error al cargar productos destacados</Typography>
      </Box>
    );
  }

  // Asegurarse de que products sea un array antes de usar slice
  const productList = Array.isArray(products) ? products : 
                     (products && products.productos ? products.productos : []);

  return (
    <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Nuestros Destacados
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ maxWidth: 700, mx: 'auto', mb: 4, color: 'text.secondary' }}
          >
            Descubre nuestras hamburguesas más populares, elaboradas con ingredientes frescos y recetas tradicionales venezolanas.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {productList.slice(0, 4).map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <MenuCard product={product} />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/menu')}
          >
            Ver Menú Completo
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProducts;