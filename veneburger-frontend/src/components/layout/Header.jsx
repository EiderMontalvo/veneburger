import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Box, Typography, Button, IconButton, 
  Drawer, List, ListItem, ListItemText, useMediaQuery, 
  useTheme, Container, Badge
} from '@mui/material';
import { Menu as MenuIcon, ShoppingCart, Close } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Header = ({ onCartClick }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { itemCount } = useCart();

  // Verificar si la ruta actual corresponde al enlace
  const isActive = (path) => location.pathname === path;

  // Toggle drawer para menú móvil
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Menú para dispositivos móviles
  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer(false)}>
          <Close />
        </IconButton>
      </Box>
      
      <List>
        <ListItem component={RouterLink} to="/">
          <ListItemText 
            primary="Inicio" 
            primaryTypographyProps={{ 
              fontWeight: isActive('/') ? 700 : 500,
              color: isActive('/') ? 'primary.main' : 'text.primary'
            }} 
          />
        </ListItem>
        <ListItem component={RouterLink} to="/menu">
          <ListItemText 
            primary="Menú" 
            primaryTypographyProps={{ 
              fontWeight: isActive('/menu') ? 700 : 500,
              color: isActive('/menu') ? 'primary.main' : 'text.primary'
            }} 
          />
        </ListItem>
        <ListItem component={RouterLink} to="/contacto">
          <ListItemText 
            primary="Contacto" 
            primaryTypographyProps={{ 
              fontWeight: isActive('/contacto') ? 700 : 500,
              color: isActive('/contacto') ? 'primary.main' : 'text.primary'
            }} 
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="fixed" color="default" elevation={3}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            VeneBurger
          </Typography>

          {/* Menú de navegación para desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/"
                color={isActive('/') ? 'primary' : 'inherit'}
                sx={{ fontWeight: isActive('/') ? 600 : 500 }}
              >
                Inicio
              </Button>
              <Button
                component={RouterLink}
                to="/menu"
                color={isActive('/menu') ? 'primary' : 'inherit'}
                sx={{ fontWeight: isActive('/menu') ? 600 : 500 }}
              >
                Menú
              </Button>
              <Button
                component={RouterLink}
                to="/contacto"
                color={isActive('/contacto') ? 'primary' : 'inherit'}
                sx={{ fontWeight: isActive('/contacto') ? 600 : 500 }}
              >
                Contacto
              </Button>
            </Box>
          )}

          {/* Iconos de acción */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="large" 
              color="inherit" 
              sx={{ ml: 1 }}
              onClick={onCartClick}
            >
              <Badge badgeContent={itemCount} color="primary">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Menú hamburguesa para móvil */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ ml: 1 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Drawer para menú móvil */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;