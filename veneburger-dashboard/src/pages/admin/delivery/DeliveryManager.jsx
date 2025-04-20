import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Card, CardContent, CardActions, Divider, Button, 
  CircularProgress, Alert, useTheme, alpha, Grid, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Chip, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Tooltip
} from '@mui/material';
import {
  LocalShipping, ArrowBack, Refresh, Phone,
  LocationOn, Person, AccessTime, CheckCircle, DirectionsBike, Map,
  CancelOutlined, Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import moment from 'moment';
import 'moment/locale/es';

// Configurar moment en español
moment.locale('es');

// Componente para tarjeta de pedido
const DeliveryOrderCard = ({ order, onViewDetails, onAssignDelivery, onCompleteDelivery, onCancelOrder }) => {
  const theme = useTheme();
  
  // Formatear fecha
  const formatTime = (dateString) => {
    if (!dateString) return '--';
    return moment(dateString).format('HH:mm');
  };
  
  // Calcular tiempo transcurrido
  const getElapsedTime = (dateString) => {
    if (!dateString) return '--';
    
    const start = moment(dateString);
    const now = moment();
    const duration = moment.duration(now.diff(start));
    
    const mins = Math.floor(duration.asMinutes());
    
    return mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;
  };
  
  // Color de fondo según urgencia
  const getUrgencyColor = (dateString) => {
    if (!dateString) return 'transparent';
    
    const start = moment(dateString);
    const now = moment();
    const mins = moment.duration(now.diff(start)).asMinutes();
    
    if (mins > 30) return alpha(theme.palette.error.light, 0.1);
    if (mins > 15) return alpha(theme.palette.warning.light, 0.1);
    return 'transparent';
  };
  
  // Obtener etiqueta de estado
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'preparando': return 'Preparando';
      case 'listo': return 'Listo';
      case 'en_camino': return 'En camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };
  
  // Obtener color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'warning';
      case 'preparando': return 'info';
      case 'listo': return 'success';
      case 'en_camino': return 'primary';
      case 'entregado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: getUrgencyColor(order.fecha_pedido),
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
              #{order.codigo}
            </Typography>
            <Chip 
              label={getStatusLabel(order.estado)}
              size="small"
              color={getStatusColor(order.estado)}
              variant={order.estado === 'en_camino' ? 'filled' : 'outlined'}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {formatTime(order.fecha_pedido)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Person fontSize="small" sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {order.nombre_cliente || (order.usuario ? `${order.usuario.nombre}` : 'Cliente')}
                </Typography>
                {order.telefono_contacto && (
                  <Typography variant="body2" color="text.secondary">
                    <Button 
                      startIcon={<Phone fontSize="small" />}
                      href={`tel:${order.telefono_contacto}`}
                      color="primary"
                      size="small"
                      sx={{ p: 0, minHeight: 0, minWidth: 0 }}
                    >
                      {order.telefono_contacto}
                    </Button>
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationOn fontSize="small" sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {order.direccion_entrega}
                </Typography>
                {order.distrito && (
                  <Typography variant="body2" color="text.secondary">
                    {order.distrito}, {order.ciudad}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" fontWeight="bold" color="primary">
            S/ {order.total.toFixed(2)}
          </Typography>
          
          {order.repartidor ? (
            <Chip 
              icon={<DirectionsBike fontSize="small" />}
              label={`${order.repartidor.nombre} ${order.repartidor.apellidos || ''}`}
              size="small"
              variant="outlined"
              color="info"
            />
          ) : order.estado === 'listo' ? (
            <Chip 
              label="Sin Repartidor"
              size="small"
              color="warning"
              variant="outlined"
            />
          ) : null}
          
          {order.fecha_en_camino && (
            <Tooltip title="Tiempo en ruta">
              <Chip 
                size="small"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ fontSize: 12, mr: 0.5 }} />
                    {getElapsedTime(order.fecha_en_camino)}
                  </Box>
                }
                color="primary"
              />
            </Tooltip>
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          size="small"
          startIcon={<Receipt />}
          onClick={() => onViewDetails(order.id)}
        >
          Detalles
        </Button>
        
        {order.estado === 'listo' && (
          <Button 
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DirectionsBike />}
            onClick={() => onAssignDelivery(order)}
          >
            Asignar
          </Button>
        )}
        
        {order.estado === 'en_camino' && (
          <Button 
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => onCompleteDelivery(order.id)}
          >
            Entregado
          </Button>
        )}
        
        {(order.estado === 'pendiente' || order.estado === 'preparando' || order.estado === 'listo') && (
          <Button 
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CancelOutlined />}
            onClick={() => onCancelOrder(order)}
          >
            Cancelar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

// Componente para tarjetas de estadísticas
const StatCard = ({ title, value, icon, color }) => {
  // Eliminamos la declaración de theme ya que no se usa
  return (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(color, 0.1) }}>
            {React.cloneElement(icon, { fontSize: 'small', sx: { color } })}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Componente principal
const DeliveryManager = () => {
  const navigate = useNavigate();
  
  // Extracción específica de los valores del theme que necesitamos
  const { palette } = useTheme();
  
  // Estado para las pestañas
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para los pedidos
  const [pendingOrders, setPendingOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [inDeliveryOrders, setInDeliveryOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  
  // Estado para estadísticas
  const [stats, setStats] = useState({
    totalDeliveryToday: 0,
    pendingDelivery: 0,
    activeDelivery: 0,
    completedDelivery: 0
  });
  
  // Repartidor (solo el administrador)
  const adminDeliveryPerson = { 
    id: 1, 
    nombre: 'Administrador', 
    apellidos: '', 
    telefono: '', 
    activo: true 
  };
  
  // Estados para diálogos
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para calcular tiempo transcurrido
  const getElapsedTime = (dateString) => {
    if (!dateString) return '--';
    
    const start = moment(dateString);
    const now = moment();
    const duration = moment.duration(now.diff(start));
    
    const mins = Math.floor(duration.asMinutes());
    
    return mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;
  };
  
  // Cargar todos los pedidos de delivery
  const loadDeliveryOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cargar pedidos pendientes (delivery)
      const pendingResponse = await orderService.listarPedidos({
        estado: 'pendiente',
        tipo: 'delivery',
        limite: 50
      });
      
      // Cargar pedidos en preparación (delivery)
      const preparingResponse = await orderService.listarPedidos({
        estado: 'preparando',
        tipo: 'delivery',
        limite: 50
      });
      
      // Cargar pedidos listos (delivery)
      const readyResponse = await orderService.listarPedidos({
        estado: 'listo',
        tipo: 'delivery',
        limite: 50
      });
      
      // Cargar pedidos en camino (delivery)
      const inDeliveryResponse = await orderService.listarPedidos({
        estado: 'en_camino',
        tipo: 'delivery',
        limite: 50
      });
      
      // Cargar pedidos completados hoy (delivery)
      const today = moment().format('YYYY-MM-DD');
      const completedResponse = await orderService.listarPedidos({
        estado: 'entregado',
        tipo: 'delivery',
        desde: today,
        limite: 50
      });
      
      // Actualizar estados
      setPendingOrders(pendingResponse.pedidos || []);
      setPreparingOrders(preparingResponse.pedidos || []);
      setReadyOrders(readyResponse.pedidos || []);
      setInDeliveryOrders(inDeliveryResponse.pedidos || []);
      setCompletedOrders(completedResponse.pedidos || []);
      
      // Actualizar estadísticas
      setStats({
        totalDeliveryToday: (pendingResponse.pedidos?.length || 0) + 
                           (preparingResponse.pedidos?.length || 0) + 
                           (readyResponse.pedidos?.length || 0) + 
                           (inDeliveryResponse.pedidos?.length || 0) + 
                           (completedResponse.pedidos?.length || 0),
        pendingDelivery: (pendingResponse.pedidos?.length || 0) + 
                        (preparingResponse.pedidos?.length || 0) + 
                        (readyResponse.pedidos?.length || 0),
        activeDelivery: inDeliveryResponse.pedidos?.length || 0,
        completedDelivery: completedResponse.pedidos?.length || 0
      });
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar pedidos de delivery:', err);
      setError('No se pudieron cargar los datos de delivery. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeliveryOrders();
    
    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      loadDeliveryOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadDeliveryOrders]);
  
  // Ver detalles de un pedido
  const handleViewDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Abrir diálogo para asignar repartidor
  const handleAssignDelivery = (order) => {
    setSelectedOrder(order);
    setAssignDialogOpen(true);
  };
  
  // Asignar repartidor y cambiar estado a en_camino
  const confirmAssignDelivery = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderService.actualizarEstadoPedido(selectedOrder.id, {
        estado: 'en_camino',
        repartidor_id: adminDeliveryPerson.id
      });
      
      setAssignDialogOpen(false);
      loadDeliveryOrders();
    } catch (error) {
      console.error('Error al asignar repartidor:', error);
      alert('No se pudo asignar el repartidor');
    }
  };
  
  // Abrir diálogo para cancelar pedido
  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setCancellationReason('');
    setCancelDialogOpen(true);
  };
  
  // Cancelar pedido
  const confirmCancelOrder = async () => {
    if (!selectedOrder || !cancellationReason.trim()) return;
    
    try {
      await orderService.actualizarEstadoPedido(selectedOrder.id, {
        estado: 'cancelado',
        motivo_cancelacion: cancellationReason
      });
      
      setCancelDialogOpen(false);
      loadDeliveryOrders();
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      alert('No se pudo cancelar el pedido');
    }
  };
  
  // Completar entrega
  const handleCompleteDelivery = async (orderId) => {
    try {
      await orderService.actualizarEstadoPedido(orderId, { estado: 'entregado' });
      loadDeliveryOrders();
    } catch (error) {
      console.error('Error al completar entrega:', error);
      alert('No se pudo completar la entrega');
    }
  };
  
  // Ir al mapa de entregas
  const handleGoToMap = () => {
    navigate('/admin/delivery/map');
  };
  
  // Cambiar pestaña
  const handleChangeTab = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Obtener contenido según tab activo
  const getTabContent = () => {
    switch (activeTab) {
      case 0: // Todos
        return (
          <Box sx={{ mt: 2 }}>
            {pendingOrders.length === 0 && 
             preparingOrders.length === 0 && 
             readyOrders.length === 0 && 
             inDeliveryOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay pedidos de delivery activos
                </Typography>
              </Box>
            ) : (
              <>
                {pendingOrders.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Pendientes ({pendingOrders.length})
                    </Typography>
                    {pendingOrders.map(order => (
                      <DeliveryOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={handleViewDetails}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))}
                  </Box>
                )}
                
                {preparingOrders.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      En Preparación ({preparingOrders.length})
                    </Typography>
                    {preparingOrders.map(order => (
                      <DeliveryOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={handleViewDetails}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))}
                  </Box>
                )}
                
                {readyOrders.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Listos para Envío ({readyOrders.length})
                    </Typography>
                    {readyOrders.map(order => (
                      <DeliveryOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={handleViewDetails}
                        onAssignDelivery={handleAssignDelivery}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))}
                  </Box>
                )}
                
                {inDeliveryOrders.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      En Camino ({inDeliveryOrders.length})
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<Map />}
                        onClick={handleGoToMap}
                        sx={{ ml: 2 }}
                      >
                        Ver en Mapa
                      </Button>
                    </Typography>
                    {inDeliveryOrders.map(order => (
                      <DeliveryOrderCard
                        key={order.id}
                        order={order}
                        onViewDetails={handleViewDetails}
                        onCompleteDelivery={handleCompleteDelivery}
                      />
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        );
        
      case 1: // Listos para envío
        return (
          <Box sx={{ mt: 2 }}>
            {readyOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay pedidos listos para envío
                </Typography>
              </Box>
            ) : (
              readyOrders.map(order => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onAssignDelivery={handleAssignDelivery}
                  onCancelOrder={handleCancelOrder}
                />
              ))
            )}
          </Box>
        );
        
      case 2: // En camino
        return (
          <Box sx={{ mt: 2 }}>
            {inDeliveryOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay pedidos en camino
                </Typography>
              </Box>
            ) : (
              inDeliveryOrders.map(order => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onCompleteDelivery={handleCompleteDelivery}
                />
              ))
            )}
          </Box>
        );
        
      case 3: // Completados
        return (
          <Box sx={{ mt: 2 }}>
            {completedOrders.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay pedidos completados hoy
                </Typography>
              </Box>
            ) : (
              completedOrders.map(order => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h5" fontWeight="bold">
            Gestión de Deliveries
          </Typography>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={loadDeliveryOrders}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Map />}
            onClick={handleGoToMap}
          >
            Mapa
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total Deliveries Hoy"
            value={stats.totalDeliveryToday}
            icon={<LocalShipping />}
            color={palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Pendientes"
            value={stats.pendingDelivery}
            icon={<AccessTime />}
            color={palette.warning.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="En Camino"
            value={stats.activeDelivery}
            icon={<DirectionsBike />}
            color={palette.info.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Completados Hoy"
            value={stats.completedDelivery}
            icon={<CheckCircle />}
            color={palette.success.main}
          />
        </Grid>
      </Grid>
      
      {/* Contenido principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Pestañas para filtrar por estado */}
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleChangeTab}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="Todos" 
                icon={<Badge badgeContent={pendingOrders.length + preparingOrders.length + readyOrders.length + inDeliveryOrders.length} color="primary" 
                sx={{ '& .MuiBadge-badge': { right: -3, top: 13 } }}
                />} 
                iconPosition="end" 
              />
              <Tab 
                label="Listos" 
                icon={<Badge badgeContent={readyOrders.length} color="success"
                sx={{ '& .MuiBadge-badge': { right: -3, top: 13 } }}
                />} 
                iconPosition="end" 
              />
              <Tab 
                label="En Camino" 
                icon={<Badge badgeContent={inDeliveryOrders.length} color="info"
                sx={{ '& .MuiBadge-badge': { right: -3, top: 13 } }}
                />} 
                iconPosition="end" 
              />
              <Tab label="Completados" />
            </Tabs>
            
            <Box sx={{ p: 2, minHeight: 400, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
              {loading && !pendingOrders.length && !readyOrders.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                getTabContent()
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* Información y resumen */}
          <Paper sx={{ borderRadius: 2, p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Información de Delivery
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Información del repartidor (administrador) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Repartidor
              </Typography>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DirectionsBike color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {adminDeliveryPerson.nombre}
                    </Typography>
                  </Box>
                  <Chip 
                    label="Administrador" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mt: 1 }} 
                  />
                </CardContent>
              </Card>
            </Box>
            
            {/* Resumen de pedidos en ruta */}
            {inDeliveryOrders.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Pedidos en ruta
                </Typography>
                
                <List disablePadding>
                  {inDeliveryOrders.slice(0, 5).map(order => (
                    <ListItem key={order.id} disablePadding disableGutters sx={{ mb: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalShipping fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`#${order.codigo} - ${order.direccion_entrega?.substring(0, 25)}${order.direccion_entrega?.length > 25 ? '...' : ''}`}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime fontSize="small" sx={{ mr: 0.5, fontSize: 12 }} />
                            <Typography variant="caption">
                              {getElapsedTime(order.fecha_en_camino)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGoToMap}
                  startIcon={<Map />}
                  sx={{ mt: 1 }}
                >
                  Ver en mapa
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Diálogo para asignar repartidor */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Asignar Delivery
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pedido #{selectedOrder.codigo}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.direccion_entrega}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: {selectedOrder.nombre_cliente || 'Cliente'}
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: alpha(palette.info.main, 0.1), borderRadius: 1 }}>
                <Typography variant="body2" align="center">
                  El pedido será asignado automáticamente al administrador
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={confirmAssignDelivery} 
            variant="contained" 
            color="primary"
          >
            Asignar y Enviar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo para cancelar pedido */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancelar Pedido
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Pedido #{selectedOrder.codigo}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.direccion_entrega}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cliente: {selectedOrder.nombre_cliente || 'Cliente'}
              </Typography>
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de Cancelación"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            error={cancellationReason.trim() === ''}
            helperText={cancellationReason.trim() === '' ? 'El motivo de cancelación es obligatorio' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={confirmCancelOrder} 
            variant="contained" 
            color="error"
            disabled={!cancellationReason.trim()}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryManager;