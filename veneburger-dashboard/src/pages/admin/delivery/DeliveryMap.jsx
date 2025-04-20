import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Paper, Typography, Divider, Button, 
  CircularProgress, Alert, useTheme, alpha, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip, Tooltip
} from '@mui/material';
import {
  LocalShipping, ArrowBack, LocationOn, Person, Phone, AccessTime,
  CheckCircle, Place, MyLocation, Navigation, DirectionsBike
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import 'moment/locale/es';

// Configuración para Google Maps - asegúrate de tener la API key configurada
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

// Configurar moment en español
moment.locale('es');

// Centro predeterminado del mapa (ubicación exacta del restaurante)
const RESTAURANT_LOCATION = {
  lat: -12.21299138924745,
  lng: -76.943083227573
};

// Opciones para el mapa
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Opciones para la carga del API
const libraries = ['places', 'directions', 'geometry'];

// Componente principal
const DeliveryMap = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // Estado para cargar el API de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries
  });
  
  // Estados para datos
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [directions, setDirections] = useState(null);
  const [mapCenter, setMapCenter] = useState(RESTAURANT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para ubicaciones simuladas de repartidores
  const [deliveryLocations, setDeliveryLocations] = useState({});
  
  // Cargar pedidos en estado de delivery
  const loadDeliveryOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obtener pedidos en estado "en_camino"
      const response = await orderService.listarPedidos({
        estado: 'en_camino',
        tipo: 'delivery',
        limite: 20
      });
      
      setDeliveryOrders(response.pedidos || []);
      
      // Simular ubicaciones para repartidores
      // En un sistema real, estas ubicaciones vendrían de tu sistema de tracking o GPS
      const locations = {};
      (response.pedidos || []).forEach(order => {
        // Para simular, creamos coordenadas aleatorias alrededor del restaurante
        locations[order.id] = {
          lat: RESTAURANT_LOCATION.lat + (Math.random() - 0.5) * 0.05,
          lng: RESTAURANT_LOCATION.lng + (Math.random() - 0.5) * 0.05
        };
      });
      
      setDeliveryLocations(locations);
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos en delivery:', err);
      setError('No se pudieron cargar los datos de delivery. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Cargar datos al montar el componente y cada cierto tiempo
  useEffect(() => {
    loadDeliveryOrders();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadDeliveryOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadDeliveryOrders]);
  
  // Cuando se selecciona un pedido, obtener la ruta
  useEffect(() => {
    if (!selectedOrder || !isLoaded) return;
    
    const orderLocation = deliveryLocations[selectedOrder.id];
    if (!orderLocation) return;
    
    // Centrar el mapa en la ubicación del pedido seleccionado
    setMapCenter(orderLocation);
    
    // Calcular la ruta desde el restaurante hasta la ubicación de entrega
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: RESTAURANT_LOCATION,
        destination: orderLocation,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error al calcular la ruta: ${status}`);
        }
      }
    );
  }, [selectedOrder, deliveryLocations, isLoaded]);
  
  // Marcar pedido como entregado
  const handleCompleteDelivery = async (orderId) => {
    try {
      await orderService.actualizarEstadoPedido(orderId, { estado: 'entregado' });
      
      // Recargar datos
      loadDeliveryOrders();
      
      // Si el pedido completado era el seleccionado, desseleccionarlo
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
        setDirections(null);
      }
    } catch (error) {
      console.error('Error al completar entrega:', error);
      alert('No se pudo completar la entrega');
    }
  };
  
  // Formatear fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };
  
  // Calcular tiempo transcurrido
  const getElapsedTime = (dateString) => {
    if (!dateString) return '--';
    
    const start = moment(dateString);
    const now = moment();
    const duration = moment.duration(now.diff(start));
    
    const hours = Math.floor(duration.asHours());
    const mins = Math.floor(duration.asMinutes()) % 60;
    
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };
  
  // Renderizar el mapa
  const renderMap = () => {
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          zoomControl: true,
        }}
        onLoad={map => {
          mapRef.current = map;
        }}
      >
        {/* Marcador del restaurante */}
        <Marker
          position={RESTAURANT_LOCATION}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          title="Restaurante"
        />
        
        {/* Marcadores de pedidos */}
        {Object.entries(deliveryLocations).map(([orderId, location]) => {
          const order = deliveryOrders.find(o => o.id === parseInt(orderId));
          if (!order) return null;
          
          return (
            <Marker
              key={orderId}
              position={location}
              icon={{
                url: selectedOrder && selectedOrder.id === parseInt(orderId)
                  ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new window.google.maps.Size(32, 32),
              }}
              onClick={() => setSelectedOrder(order)}
            />
          );
        })}
        
        {/* Ventana de información para marcador seleccionado */}
        {selectedOrder && deliveryLocations[selectedOrder.id] && (
          <InfoWindow
            position={deliveryLocations[selectedOrder.id]}
            onCloseClick={() => setSelectedOrder(null)}
          >
            <div>
              <Typography variant="subtitle2" fontWeight="bold">
                Pedido #{selectedOrder.codigo}
              </Typography>
              <Typography variant="body2">
                {selectedOrder.direccion_entrega}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                En camino: {getElapsedTime(selectedOrder.fecha_en_camino)}
              </Typography>
            </div>
          </InfoWindow>
        )}
        
        {/* Mostrar la ruta si hay direcciones calculadas */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: theme.palette.primary.main,
                strokeWeight: 5,
                strokeOpacity: 0.7
              }
            }}
          />
        )}
      </GoogleMap>
    );
  };
  
  // Contenido principal
  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/delivery')}
        >
          Volver a Deliveries
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Mapa de Entregas
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<LocalShipping />}
          onClick={loadDeliveryOrders}
        >
          Actualizar
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && !deliveryOrders.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', height: 'calc(100% - 48px)', gap: 2 }}>
          {/* Panel lateral de pedidos */}
          <Paper 
            elevation={3} 
            sx={{ 
              width: 320, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Pedidos en Delivery ({deliveryOrders.length})
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {deliveryOrders.length === 0 ? (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <LocalShipping sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="textSecondary" align="center">
                  No hay pedidos en delivery actualmente
                </Typography>
              </Box>
            ) : (
              <List 
                sx={{ 
                  overflow: 'auto', 
                  flex: 1,
                  '& .MuiListItem-root': {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    '&.selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }
                }}
              >
                {deliveryOrders.map(order => (
                  <ListItem 
                    key={order.id}
                    button
                    className={selectedOrder && selectedOrder.id === order.id ? 'selected' : ''}
                    onClick={() => setSelectedOrder(order)}
                    sx={{ p: 1.5 }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          #{order.codigo}
                        </Typography>
                        <Chip 
                          size="small"
                          color="primary"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                              {getElapsedTime(order.fecha_en_camino)}
                            </Box>
                          }
                        />
                      </Box>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DirectionsBike sx={{ fontSize: 14, mr: 0.5, color: 'info.main' }} />
                            <Typography variant="body2" noWrap color="info.main">
                              {order.repartidor ? `${order.repartidor.nombre} ${order.repartidor.apellidos || ''}` : 'Sin asignar'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography variant="body2" noWrap>
                              {order.direccion_entrega}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteDelivery(order.id);
                          }}
                        >
                          Entregado
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          {/* Mapa principal */}
          <Paper 
            elevation={3} 
            sx={{ 
              flex: 1, 
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {loadError ? (
              <Box sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%' 
              }}>
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  Error al cargar el mapa: {loadError.message}
                </Alert>
                <Typography>
                  Verifique su conexión a internet y la configuración de la API de Google Maps.
                </Typography>
              </Box>
            ) : !isLoaded ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%' 
              }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {renderMap()}
                
                {/* Botones flotantes del mapa */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    right: 16, 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Tooltip title="Centrar en restaurante">
                    <IconButton 
                      color="primary" 
                      sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                      onClick={() => {
                        setMapCenter(RESTAURANT_LOCATION);
                        mapRef.current?.panTo(RESTAURANT_LOCATION);
                      }}
                    >
                      <Place />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Mi ubicación">
                    <IconButton 
                      color="primary" 
                      sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                              };
                              setMapCenter(pos);
                              mapRef.current?.panTo(pos);
                            },
                            (error) => {
                              console.error('Error al obtener ubicación:', error);
                              alert('No se pudo obtener su ubicación actual.');
                            }
                          );
                        } else {
                          alert('Geolocalización no soportada por su navegador.');
                        }
                      }}
                    >
                      <MyLocation />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </Paper>
          
          {/* Panel de detalles del pedido seleccionado */}
          {selectedOrder && (
            <Paper 
              elevation={3} 
              sx={{ 
                width: 300, 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Detalles del Pedido
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Navigation fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Número de Pedido"
                    secondary={`#${selectedOrder.codigo}`}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 'bold' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DirectionsBike fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Repartidor"
                    secondary={selectedOrder.repartidor ? `${selectedOrder.repartidor.nombre} ${selectedOrder.repartidor.apellidos || ''}` : 'Administrador'}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Person fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cliente"
                    secondary={selectedOrder.nombre_cliente || (selectedOrder.usuario?.nombre || 'Cliente')}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                {selectedOrder.telefono_contacto && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Phone fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Teléfono"
                      secondary={
                        <Button 
                          href={`tel:${selectedOrder.telefono_contacto}`}
                          color="primary"
                          size="small"
                          variant="text"
                          sx={{ p: 0, minWidth: 'auto' }}
                        >
                          {selectedOrder.telefono_contacto}
                        </Button>
                      }
                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    />
                  </ListItem>
                )}
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LocationOn fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dirección de Entrega"
                    secondary={selectedOrder.direccion_entrega}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                {selectedOrder.referencia_direccion && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Place fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Referencia"
                      secondary={selectedOrder.referencia_direccion}
                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                )}
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AccessTime fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="En Camino Desde"
                    secondary={`${formatDateTime(selectedOrder.fecha_en_camino)} (${getElapsedTime(selectedOrder.fecha_en_camino)})`}
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  startIcon={<CheckCircle />}
                  onClick={() => handleCompleteDelivery(selectedOrder.id)}
                >
                  Marcar como Entregado
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DeliveryMap;