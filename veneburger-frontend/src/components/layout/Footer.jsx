import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, WhatsApp, LocationOn, Phone, Email } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 700 }}>
              VeneBurger
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Las mejores hamburguesas venezolanas, con el auténtico sabor de nuestro país.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <IconButton color="inherit" aria-label="facebook" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="twitter" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="instagram" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="whatsapp" size="small">
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Enlaces
            </Typography>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/" color="inherit" underline="hover">
                  Inicio
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/menu" color="inherit" underline="hover">
                  Menú
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/contacto" color="inherit" underline="hover">
                  Contacto
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/nosotros" color="inherit" underline="hover">
                  Sobre Nosotros
                </Link>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Horario
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Lunes a Viernes: 11:00 - 22:00
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Sábados y Domingos: 12:00 - 23:00
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Feriados: 12:00 - 20:00
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                Av. Principal #123, Caracas
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                +58 212-555-1234
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Email fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                info@veneburger.com
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 3, mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

        <Typography variant="body2" align="center" sx={{ pt: 1 }}>
          © {new Date().getFullYear()} VeneBurger. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;