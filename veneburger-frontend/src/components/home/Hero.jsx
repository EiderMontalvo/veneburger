import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Hero = () => {
  return (
    <Box className="hero-background">
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            ¡Las mejores hamburguesas venezolanas!
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            Sabor auténtico y los ingredientes más frescos
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to="/menu"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Ver Menú
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/contacto"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderColor: 'white',
                },
              }}
            >
              Contáctanos
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;