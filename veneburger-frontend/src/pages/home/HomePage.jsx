import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/home/Hero';
import FeaturedProducts from '../../components/home/FeaturedProducts';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 70,
  height: 70,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.lighter,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <Box>
      {/* Hero Section */}
      <Hero />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#fff' }}>
        <Container>
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            ¿Por qué elegirnos?
          </Typography>
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}
          >
            En VeneBurger nos distinguimos por la calidad y el sabor único de nuestros productos
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard elevation={2}>
                <IconWrapper>
                  <img 
                    src="/assets/icons/fresh.png" 
                    alt="Ingredientes Frescos"
                    width={40}
                    height={40}
                  />
                </IconWrapper>
                <Typography variant="h5" component="h3" gutterBottom>
                  Ingredientes Frescos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seleccionamos los mejores ingredientes locales para ofrecerte un sabor único y auténticamente venezolano.
                </Typography>
              </FeatureCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard elevation={2}>
                <IconWrapper>
                  <img 
                    src="/assets/icons/delivery.png" 
                    alt="Entrega Rápida"
                    width={40}
                    height={40}
                  />
                </IconWrapper>
                <Typography variant="h5" component="h3" gutterBottom>
                  Entrega Rápida
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tu pedido llega a tiempo y en perfectas condiciones. Máxima puntualidad para que disfrutes.
                </Typography>
              </FeatureCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard elevation={2}>
                <IconWrapper>
                  <img 
                    src="/assets/icons/taste.png" 
                    alt="Sabor Único"
                    width={40}
                    height={40}
                  />
                </IconWrapper>
                <Typography variant="h5" component="h3" gutterBottom>
                  Sabor Único
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recetas tradicionales con un toque moderno que te transportarán a Venezuela con cada bocado.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          py: 10, 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          color: 'white',
        }}
      >
        <Container>
          <Box 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              textAlign: 'center',
              px: 2, 
            }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              ¿Tienes hambre?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4 }}>
              Ordena ahora y disfruta de nuestras deliciosas hamburguesas
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/menu')}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Ordenar Ahora
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;