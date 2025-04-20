import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Button, CircularProgress, Alert, Grid,
  Card, CardContent, Divider, Chip, List, ListItem, ListItemText,
  Stepper, Step, StepLabel, Dialog, DialogTitle, Table, TableContainer,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, 
  SelectChangeEvent, MenuItem, TableHead, TableRow, TableCell, TableBody, TableFooter,
  useTheme, alpha, Stack
} from '@mui/material';
import { 
  ArrowBack, LocalShipping, Restaurant, Receipt, Print, 
  Check, AccessTime, Phone, LocationOn, Mail, Person,
  Edit, Money, DeliveryDining
} from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { orderService, Pedido } from '../../../services/orderService';

// Estados del pedido para el stepper
const orderSteps = [
  { status: 'pendiente', label: 'Pendiente', icon: <AccessTime /> },
  { status: 'preparando', label: 'Preparando', icon: <Restaurant /> },
  { status: 'listo', label: 'Listo', icon: <Check /> },
  { status: 'en_camino', label: 'En camino', icon: <LocalShipping /> },
  { status: 'entregado', label: 'Entregado', icon: <Check /> }
];

// Componente para el stepper de estado de pedido
const OrderStatusStepper = ({ currentStatus }: { currentStatus: string }) => {
  const statusIndex = orderSteps.findIndex(step => step.status === currentStatus);
  const activeStep = statusIndex === -1 ? -1 : statusIndex;

  return (
    <Stepper activeStep={activeStep} orientation="horizontal">
      {orderSteps.map((step, index) => (
        <Step key={step.status} completed={index < activeStep}>
          <StepLabel StepIconComponent={() => (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
              color: 'white',
              borderRadius: '50%',
              width: 32,
              height: 32,
            }}>
              {React.cloneElement(step.icon, { fontSize: 'small' })}
            </Box>
          )}>
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};

// Componente principal
const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para diálogo de actualización de estado
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string>('');
  const [deliveryPersons] = useState<{id: string; nombre: string}[]>([
    { id: '1', nombre: 'Repartidor Demo' }
  ]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  
  // Cargar detalles del pedido
  const loadOrderDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await orderService.obtenerPedidoPorId(parseInt(id));
      setOrder(data);
      
    } catch (err) {
      console.error('Error al cargar detalles del pedido:', err);
      setError('No se pudo cargar la información del pedido.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadOrderDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '--';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'dd/MM/yyyy HH:mm') : dateString;
    } catch (error) {
      return dateString;
    }
  };
  
  // Abrir diálogo para cambio de estado
  const handleOpenStatusDialog = () => {
    if (!order) return;
    
    // Establecer estado por defecto sugerido (el siguiente lógico)
    let suggestedStatus = '';
    switch (order.estado) {
      case 'pendiente':
        suggestedStatus = 'preparando';
        break;
      case 'preparando':
        suggestedStatus = 'listo';
        break;
      case 'listo':
        suggestedStatus = order.tipo === 'delivery' ? 'en_camino' : 'entregado';
        break;
      case 'en_camino':
        suggestedStatus = 'entregado';
        break;
    }
    
    setSelectedStatus(suggestedStatus);
    setStatusDialogOpen(true);
  };
  
  // Actualizar estado del pedido
  const handleUpdateStatus = async () => {
    if (!order || !selectedStatus) return;
    
    try {
      setStatusUpdateLoading(true);
      
      const data: any = { estado: selectedStatus };
      
      // Si se cancela, añadir motivo
      if (selectedStatus === 'cancelado') {
        if (!cancellationReason.trim()) {
          setError('Debe indicar un motivo de cancelación');
          return;
        }
        data.motivo_cancelacion = cancellationReason;
      }
      
      // Si pasa a en_camino, añadir repartidor
      if (selectedStatus === 'en_camino') {
        if (!selectedDeliveryPersonId) {
          setError('Debe seleccionar un repartidor');
          return;
        }
        data.repartidor_id = parseInt(selectedDeliveryPersonId);
      }
      
      await orderService.actualizarEstadoPedido(order.id, data);
      
      // Recargar detalles del pedido
      await loadOrderDetails();
      
      // Cerrar diálogo
      setStatusDialogOpen(false);
      setCancellationReason('');
      setSelectedDeliveryPersonId('');
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('No se pudo actualizar el estado del pedido.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Para imprimir el pedido
  const handlePrintOrder = () => {
    window.print();
  };
  
  // Manejar cambio en Select
  const handleStatusChange = (event: SelectChangeEvent) => {
    setSelectedStatus(event.target.value);
  };

  // Manejar cambio en Select para repartidor
  const handleDeliveryPersonChange = (event: SelectChangeEvent) => {
    setSelectedDeliveryPersonId(event.target.value);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!order) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No se encontró el pedido solicitado.
      </Alert>
    );
  }

  // Obtener próximos estados posibles
  const getAvailableNextStatus = () => {
    switch (order.estado) {
      case 'pendiente':
        return [
          { value: 'preparando', label: 'Preparando' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
      case 'preparando':
        return [
          { value: 'listo', label: 'Listo' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
      case 'listo':
        return order.tipo === 'delivery' 
          ? [
              { value: 'en_camino', label: 'En camino' },
              { value: 'cancelado', label: 'Cancelado' }
            ]
          : [
              { value: 'entregado', label: 'Entregado' },
              { value: 'cancelado', label: 'Cancelado' }
            ];
      case 'en_camino':
        return [
          { value: 'entregado', label: 'Entregado' },
          { value: 'cancelado', label: 'Cancelado' }
        ];
      default:
        return [];
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/orders')}
        >
          Volver a pedidos
        </Button>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            onClick={handlePrintOrder}
            sx={{ mr: 1 }}
          >
            Imprimir
          </Button>
          
          {(order.estado !== 'entregado' && order.estado !== 'cancelado') && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Edit />}
              onClick={handleOpenStatusDialog}
            >
              Actualizar estado
            </Button>
          )}
        </Box>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom>
                Pedido #{order.codigo} 
                <Chip 
                  label={order.tipo === 'delivery' ? 'Delivery' : 'Local'} 
                  color={order.tipo === 'delivery' ? 'info' : 'success'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Fecha: {formatDate(order.fecha_pedido)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box>
                <Typography variant="subtitle1" align="right">
                  Estado actual:
                </Typography>
                <Chip 
                  label={order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  color={
                    order.estado === 'cancelado' ? 'error' :
                    order.estado === 'entregado' ? 'success' :
                    order.estado === 'en_camino' ? 'primary' :
                    order.estado === 'listo' ? 'info' :
                    order.estado === 'preparando' ? 'warning' : 'default'
                  }
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <OrderStatusStepper currentStatus={order.estado} />
        
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Información del cliente */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} fontSize="small" /> Información del cliente
                  </Typography>
                  
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">Nombre:</Typography>
                          </Stack>
                        } 
                        secondary={order.nombre_cliente || (order.usuario ? `${order.usuario.nombre} ${order.usuario.apellidos || ''}` : '--')} 
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">Teléfono:</Typography>
                          </Stack>
                        } 
                        secondary={order.telefono_contacto || (order.usuario?.telefono) || '--'} 
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Mail fontSize="small" color="action" />
                            <Typography variant="body2">Email:</Typography>
                          </Stack>
                        } 
                        secondary={order.email_contacto || (order.usuario?.email) || '--'} 
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    {order.tipo === 'delivery' && (
                      <>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemText 
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2">Dirección:</Typography>
                              </Stack>
                            } 
                            secondary={order.direccion_entrega || '--'} 
                            secondaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                        
                        {order.referencia_direccion && (
                          <ListItem sx={{ px: 0, py: 0.5 }}>
                            <ListItemText 
                              primary="Referencia:" 
                              secondary={order.referencia_direccion} 
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ fontWeight: 'medium' }}
                            />
                          </ListItem>
                        )}
                        
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemText 
                            primary="Distrito/Ciudad:" 
                            secondary={`${order.distrito || '--'} / ${order.ciudad || '--'}`} 
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                      </>
                    )}
                    
                    {order.tipo === 'local' && order.mesa && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Restaurant fontSize="small" color="action" />
                              <Typography variant="body2">Mesa:</Typography>
                            </Stack>
                          }
                          secondary={`#${order.mesa.numero} (${order.mesa.capacidad} personas)`} 
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Información de entrega */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    {order.tipo === 'delivery' ? (
                      <><DeliveryDining sx={{ mr: 1 }} fontSize="small" /> Información de entrega</>
                    ) : (
                      <><Restaurant sx={{ mr: 1 }} fontSize="small" /> Información de pedido</>
                    )}
                  </Typography>
                  
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary="Tiempo estimado:" 
                        secondary={`${order.tiempo_estimado_entrega} minutos`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    {order.tipo === 'delivery' && order.repartidor && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Repartidor:" 
                          secondary={`${order.repartidor.nombre} ${order.repartidor.apellidos || ''}`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary="Fecha de pedido:" 
                        secondary={formatDate(order.fecha_pedido)} 
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    {order.fecha_preparacion && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Inicio de preparación:" 
                          secondary={formatDate(order.fecha_preparacion)} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.fecha_listo && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Listo para entrega:" 
                          secondary={formatDate(order.fecha_listo)} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.fecha_en_camino && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="En camino desde:" 
                          secondary={formatDate(order.fecha_en_camino)} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.fecha_entrega && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Entregado:" 
                          secondary={formatDate(order.fecha_entrega)} 
                          primaryTypographyProps={{ variant: 'body2', color: 'success.main' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.fecha_cancelacion && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Cancelado:" 
                          secondary={formatDate(order.fecha_cancelacion)} 
                          primaryTypographyProps={{ variant: 'body2', color: 'error' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.motivo_cancelacion && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Motivo de cancelación:" 
                          secondary={order.motivo_cancelacion} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                  </List>
                  
                  {order.notas && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: alpha(theme.palette.warning.light, 0.2), borderRadius: 1 }}>
                      <Typography variant="subtitle2">Notas del pedido:</Typography>
                      <Typography variant="body2">{order.notas}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Información de pago */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Money sx={{ mr: 1 }} fontSize="small" /> Información de pago
                  </Typography>
                  
                  <List dense disablePadding>
                    {order.pagos && order.pagos.length > 0 && (
                      <>
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemText 
                            primary="Método de pago:" 
                            secondary={order.pagos[0].metodo_pago.nombre} 
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemText 
                            primary="Estado del pago:" 
                            secondary={
                              <Chip 
                                label={
                                  order.pagos[0].estado === 'completado' ? 'Completado' :
                                  order.pagos[0].estado === 'pendiente' ? 'Pendiente' : 'Rechazado'
                                } 
                                color={
                                  order.pagos[0].estado === 'completado' ? 'success' :
                                  order.pagos[0].estado === 'pendiente' ? 'warning' : 'error'
                                }
                                size="small"
                                variant="outlined"
                              />
                            }
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0, py: 0.5 }}>
                          <ListItemText 
                            primary="Fecha del pago:" 
                            secondary={formatDate(order.pagos[0].fecha_pago)} 
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ fontWeight: 'medium' }}
                          />
                        </ListItem>
                      </>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary="Subtotal:" 
                        secondary={`S/ ${order.subtotal.toFixed(2)}`} 
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    
                    {order.descuento > 0 && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Descuento:" 
                          secondary={`S/ ${order.descuento.toFixed(2)}`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium', color: 'success.main' }}
                        />
                      </ListItem>
                    )}
                    
                    {order.tipo === 'delivery' && (
                      <ListItem sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary="Costo de envío:" 
                          secondary={`S/ ${order.costo_envio.toFixed(2)}`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ fontWeight: 'medium' }}
                        />
                      </ListItem>
                    )}
                    
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemText 
                        primary="Total:" 
                        secondary={`S/ ${order.total.toFixed(2)}`} 
                        primaryTypographyProps={{ variant: 'h6' }}
                        secondaryTypographyProps={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Detalles del pedido */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Receipt sx={{ mr: 1 }} /> Productos del pedido
        </Typography>
        
        <Grid container>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%" align="center">#</TableCell>
                    <TableCell width="45%">Producto</TableCell>
                    <TableCell width="10%" align="center">Cantidad</TableCell>
                    <TableCell width="20%" align="right">Precio</TableCell>
                    <TableCell width="20%" align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.detalles && order.detalles.map((detalle, index) => (
                    <TableRow key={detalle.id} sx={{ borderBottom: '1px solid #eee' }}>
                      <TableCell align="center" sx={{ p: '8px 0' }}>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {detalle.producto.nombre}
                        </Typography>
                        {detalle.notas && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Nota: {detalle.notas}
                          </Typography>
                        )}
                        {detalle.cremas && detalle.cremas.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {detalle.cremas.map((c) => (
                              <Chip 
                                key={c.id}
                                label={c.crema.nombre} 
                                size="small" 
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">{detalle.cantidad}</TableCell>
                      <TableCell align="right">S/ {detalle.precio_unitario.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>S/ {detalle.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell align="right" sx={{ p: '8px 0' }}>Subtotal:</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>S/ {order.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  {order.descuento > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right" sx={{ p: '8px 0' }}>Descuento:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                        -S/ {order.descuento.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                  {order.tipo === 'delivery' && (
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right" sx={{ p: '8px 0' }}>Costo de envío:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>S/ {order.costo_envio.toFixed(2)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell align="right" sx={{ p: '12px 0', fontSize: '1.1rem' }}>Total:</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>S/ {order.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Diálogo para actualizar estado */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Actualizar estado del pedido</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, pb: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Nuevo estado</InputLabel>
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                label="Nuevo estado"
              >
                {getAvailableNextStatus().map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {selectedStatus === 'cancelado' && (
              <TextField
                label="Motivo de cancelación"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                multiline
                rows={3}
                fullWidth
                required
                error={!cancellationReason.trim()}
                helperText={!cancellationReason.trim() ? 'Debe indicar un motivo de cancelación' : ''}
              />
            )}
            
            {selectedStatus === 'en_camino' && (
              <FormControl fullWidth>
                <InputLabel>Asignar repartidor</InputLabel>
                <Select
                  value={selectedDeliveryPersonId}
                  onChange={handleDeliveryPersonChange}
                  label="Asignar repartidor"
                  required
                  error={!selectedDeliveryPersonId}
                >
                  {deliveryPersons.length > 0 && 
                    deliveryPersons.map((person) => (
                      <MenuItem key={person.id} value={person.id}>
                        {person.nombre}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={
              statusUpdateLoading || 
              (selectedStatus === 'cancelado' && !cancellationReason.trim()) ||
              (selectedStatus === 'en_camino' && !selectedDeliveryPersonId)
            }
          >
            {statusUpdateLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;