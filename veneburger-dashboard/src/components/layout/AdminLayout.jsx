import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Typography, IconButton, 
  Drawer, List, Divider, ListItemButton, ListItemIcon, ListItemText, 
  Avatar, Menu, MenuItem, useTheme, useMediaQuery,
  alpha, Paper, styled, GlobalStyles
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CategoryIcon from '@mui/icons-material/Category';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// Estilos globales para eliminar el margin-left en todas las clases posibles
const globalStyles = (
  <GlobalStyles
    styles={{
      '.main-content-box.MuiBox-root.css-10pz13g, .css-10pz13g, .MuiDrawer-docked + .MuiBox-root, .main-content-box': {
        marginLeft: '0 !important',
        paddingLeft: '0 !important'
      }
    }}
  />
);

// Componente personalizado para corregir el problema del drawer docked
const FixedDrawer = styled(Drawer)(({ theme, open, drawerwidth }) => ({
  width: drawerwidth,
  flexShrink: 0,
  [`& .MuiDrawer-paper`]: {
    width: drawerwidth,
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: open ? '4px 0 8px rgba(0, 0, 0, 0.05)' : 'none',
  },
  // Sobreescribir el estilo problemático
  '&.MuiDrawer-docked': {
    '& .MuiDrawer-paper': {
      position: 'fixed',
    },
    // Anular cualquier espaciado adicional que el drawer docked pueda estar aplicando
    '& + .MuiBox-root': {
      padding: 0,
      marginLeft: '0 !important', // Establecer a 0 de forma forzada
      paddingLeft: '0 !important',
      transition: 'none' // Prevenir transiciones problemáticas
    }
  }
}));

const drawerWidth = 260;

// Definición del menú con submenús
const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/admin'
  },
  { 
    text: 'Productos', 
    icon: <FoodBankIcon />, 
    path: '/admin/products',
    submenu: [
      { text: 'Listado', path: '/admin/products' },
      { text: 'Crear Nuevo', path: '/admin/products/create' }
    ]
  },
  { 
    text: 'Categorías', 
    icon: <CategoryIcon />, 
    path: '/admin/categories',
    submenu: [
      { text: 'Listado', path: '/admin/categories' },
      { text: 'Crear Nueva', path: '/admin/categories/create' }
    ]
  },
  { 
    text: 'Pedidos', 
    icon: <ShoppingCartIcon />, 
    path: '/admin/orders'
  },
  { 
    text: 'Usuarios', 
    icon: <PeopleIcon />, 
    path: '/admin/users'
  },
  {
    text: 'Delivery',
    icon: <LocalShippingIcon />,
    path: '/admin/delivery',
    submenu: [
      { text: 'Gestión de pedidos', path: '/admin/delivery' },
      { text: 'Mapa de entregas', path: '/admin/delivery/map' }
    ]
  },
  { 
    text: 'Configuración', 
    icon: <SettingsIcon />, 
    path: '/admin/settings',
    submenu: [
      { text: 'Días Especiales', path: '/admin/settings/special-days' },
      { text: 'General', path: '/admin/settings' }
    ]
  },
];

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenus, setOpenMenus] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { usuario } = useSelector((state) => state.auth);

  // Determinar si la página actual es el Dashboard
  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  // Ajusta el drawer cuando cambia el tamaño de la pantalla
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Corrección específica para el margin-left en la clase css-10pz13g
  useEffect(() => {
    const fixMarginLeft = () => {
      // Corregir el contenedor principal
      const mainContent = document.querySelector('.main-content-box');
      if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.paddingLeft = '0';
      }

      // Buscar por la clase específica
      const specificElement = document.querySelector('.main-content-box.MuiBox-root.css-10pz13g');
      if (specificElement) {
        specificElement.style.marginLeft = '0';
        specificElement.style.paddingLeft = '0';
      }

      // También corregir cualquier otro elemento problemático
      const otherElements = document.querySelectorAll('.MuiDrawer-docked + .MuiBox-root');
      otherElements.forEach(el => {
        el.style.marginLeft = '0';
        el.style.paddingLeft = '0';
      });
    };
    
    fixMarginLeft();
    // Ejecutar con un retraso para asegurar que MUI haya terminado el renderizado
    const timer = setTimeout(fixMarginLeft, 50);
    
    return () => clearTimeout(timer);
  }, [open, isMobile]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const toggleSubmenu = (text) => {
    setOpenMenus({
      ...openMenus,
      [text]: !openMenus[text]
    });
  };

  // Verifica si la ruta actual está en un submenu
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.submenu && item.submenu.some(sub => location.pathname === sub.path)) {
        setOpenMenus(prev => ({...prev, [item.text]: true}));
      }
    });
  }, [location.pathname]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const isMenuOpen = Boolean(anchorEl);
  const date = new Date();

  // Implementación para menús expandibles sin usar Collapse
  const renderSubmenu = (item) => {
    if (!item.submenu || !openMenus[item.text]) {
      return null;
    }

    return (
      <List component="div" disablePadding>
        {item.submenu.map((subItem) => (
          <ListItemButton
            key={subItem.text}
            onClick={() => handleNavigate(subItem.path)}
            selected={location.pathname === subItem.path}
            sx={{
              pl: 6,
              py: 0.75,
              borderRadius: 2,
              mb: 0.5,
              ml: 1,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiListItemText-primary': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <ListItemText
              primary={subItem.text}
              primaryTypographyProps={{
                fontSize: 13,
                fontWeight: location.pathname === subItem.path ? 'bold' : 'normal',
              }}
            />
          </ListItemButton>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      {/* Aplicar estilos globales para corregir específicamente el margin-left */}
      {globalStyles}
      
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ 
              mr: 2,
              color: 'white',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.1)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              color: 'white'
            }}
          >
            <FastfoodIcon sx={{ mr: 1, fontSize: 28 }} />
            VeneBurger | Panel Administrativo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                display: { xs: 'none', sm: 'flex' }, 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                mr: 2,
                color: 'white'
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {usuario?.nombre || 'Administrador'}
              </Typography>
            </Box>
            {/* Avatar de perfil */}
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              edge="end"
              color="inherit"
              sx={{
                background: alpha('#fff', 0.15),
                p: 0,
                border: '2px solid white',
                overflow: 'hidden',
                '&:hover': {
                  background: alpha('#fff', 0.25)
                }
              }}
            >
              <Avatar 
                alt={usuario?.nombre || 'Administrador'}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'transparent',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 18
                }}
              >
                {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'A'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        keepMounted
        open={isMenuOpen}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            mt: 1, 
            minWidth: 200,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ bgcolor: theme.palette.primary.main, py: 2, px: 2, color: 'white' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {usuario?.nombre || 'Administrador'}
          </Typography>
          <Typography variant="caption">
            Administrador
          </Typography>
        </Box>
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin/profile'); }}
          sx={{ py: 1.5 }}
        >
          Mi Perfil
        </MenuItem>
        <MenuItem 
          onClick={() => { handleMenuClose(); navigate('/admin/settings'); }}
          sx={{ py: 1.5 }}
        >
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08)
            }
          }}
        >
          Cerrar Sesión
        </MenuItem>
      </Menu>
      
      {/* Uso del FixedDrawer personalizado */}
      <FixedDrawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={isMobile ? toggleDrawer : undefined}
        drawerwidth={drawerWidth}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            px: [1],
            py: 2,
            minHeight: '64px !important'
          }}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FastfoodIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 28 }} />
            <Typography variant="h6" color="primary" fontWeight="bold">
              VeneBurger
            </Typography>
          </Box>
          {!isMobile && (
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Toolbar>
        <Divider />
        
        <Box 
          sx={{ 
            overflow: 'auto', 
            py: 0, 
            px: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Título MENÚ PRINCIPAL pegado a la barra superior */}
          <Box
            className="menu-header-box"
            sx={{ 
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              pt: 0,
              mt: 0,
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold', 
                letterSpacing: '0.5px', 
                px: 1,
                pt: 1.5,
                pb: 1,
                color: theme.palette.text.secondary,
              }}
            >
              MENÚ PRINCIPAL
            </Typography>
          </Box>
          
          {/* Tarjeta de bienvenida debajo del título */}
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 2,
              mb: 2, 
              p: 2, 
              borderRadius: 2,
              background: `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.15)})`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <Typography variant="subtitle2" color="primary" fontWeight="medium" sx={{ mb: 0.5 }}>
              ¡Bienvenido de vuelta!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>
          </Paper>
          
          <List component="nav">
            {menuItems.map((item) => (
              <React.Fragment key={item.text}>
                <ListItemButton 
                  onClick={() => item.submenu ? toggleSubmenu(item.text) : handleNavigate(item.path)}
                  selected={isActiveRoute(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.contrastText,
                      },
                      '& .MuiListItemText-primary': {
                        color: theme.palette.primary.contrastText,
                        fontWeight: 'bold',
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateX(4px)'
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActiveRoute(item.path) 
                        ? theme.palette.primary.contrastText 
                        : theme.palette.text.primary,
                      minWidth: '40px'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: isActiveRoute(item.path) ? 'bold' : 'medium',
                      fontSize: 14,
                    }} 
                  />
                  {item.submenu && (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
                
                {renderSubmenu(item)}
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Divider sx={{ my: 2 }} />
          
          <List>
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.error.main,
                  minWidth: '40px'
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Cerrar Sesión" 
                primaryTypographyProps={{ 
                  fontSize: 14,
                  fontWeight: 'medium'
                }} 
              />
            </ListItemButton>
          </List>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} VeneBurger
            </Typography>
          </Box>
        </Box>
      </FixedDrawer>
      
      {/* Box principal sin margin-left */}
      <Box 
        component="main"
        className="main-content-box"
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          marginLeft: '0 !important',
          paddingLeft: '0 !important',
          padding: 0,
          height: '100vh',
          overflow: 'auto',
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          transition: 'none'
        }}
      >
        <Toolbar /> {/* Espaciador para que el contenido comience debajo del AppBar */}
        
        {/* Contenedor condicional para diferentes tipos de páginas */}
        {isDashboard ? (
          <Box sx={{ width: '100%', m: 0, p: 2 }}>
            <Outlet />
          </Box>
        ) : (
          <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1536px', mx: 'auto' }}>
            <Outlet />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminLayout;