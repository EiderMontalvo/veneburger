
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Chip, Tooltip, Button, CircularProgress,
  TextField, Alert, MenuItem, FormControl, InputLabel, Select,
  Pagination, Grid, Card, CardContent, Stack, useTheme, alpha,
  Divider, SelectChangeEvent
} from '@mui/material';
import { 
  Refresh, FilterList, Visibility, LocalShipping, 
  Restaurant,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { orderService, Pedido, OrdersFilter } from '../../../services/orderService';

// Componente para el estado del pedido
const OrderStatusChip = ({ estado }: { estado: Pedido['estado'] }) => {
  const getStatusColor = () => {
    switch (estado) {
      case 'pendiente': return 'default';
      case 'preparando': return 'warning';
      case 'listo': return 'info';
      case 'en_camino': return 'primary';
      case 'entregado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'preparando': return 'Preparando';
      case 'listo': return 'Listo';
      case 'en_camino': return 'En camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <Chip 
      label={getStatusText()} 
      color={getStatusColor()} 
      size="small"
      variant="outlined" 
    />
  );
};

// Componente principal
const OrdersList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<OrdersFilter>({
    limite: 10,
    pagina: 1
  });
  
  // Cargar estadísticas
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await orderService.obtenerEstadisticas();
      setOrderStats(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  // Cargar pedidos
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { pedidos, pagination } = await orderService.listarPedidos({
        ...filters,
        pagina: page
      });
      
      setOrders(pedidos);
      setTotalPages(pagination.totalPaginas);
      setTotalOrders(pagination.count);
      
      // Si es la primera carga o ha cambiado el filtro, cargar estadísticas
      if (!orderStats) {
        loadStatistics();
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No se pudieron cargar los pedidos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, orderStats, loadStatistics]);

  // Cargar pedidos al iniciar o cambiar filtros/página
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Manejar cambio de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (event: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Resetear a primera página al cambiar filtros
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      limite: 10,
      pagina: 1
    });
    setPage(1);
  };

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

  // Ver detalles de pedido
  const handleViewOrder = (id: number) => {
    navigate(`/admin/orders/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          Gestión de Pedidos
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={loadOrders}
            sx={{ mr: 1 }}
          >
            Actualizar
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </Box>
      </Box>

      {/* Tarjetas de estadísticas */}
      {orderStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Pedidos
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {orderStats.totalPedidos || 0}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Ventas hoy:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    S/ {orderStats.ventasHoy?.toFixed(2) || '0.00'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pedidos Pendientes
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {orderStats.pedidosPorEstado?.find((item: any) => item.estado === 'pendiente')?.cantidad || 0}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Preparando:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {orderStats.pedidosPorEstado?.find((item: any) => item.estado === 'preparando')?.cantidad || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pedidos Delivery
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {orderStats.pedidosPorTipo?.find((item: any) => item.tipo === 'delivery')?.cantidad || 0}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    En camino:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {orderStats.pedidosPorEstado?.find((item: any) => item.estado === 'en_camino')?.cantidad || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Pedidos Local
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {orderStats.pedidosPorTipo?.find((item: any) => item.tipo === 'local')?.cantidad || 0}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    Ventas semana:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    S/ {orderStats.ventasSemana?.toFixed(2) || '0.00'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={filters.estado || ''}
                  onChange={handleFilterChange as (event: SelectChangeEvent) => void}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendientes</MenuItem>
                  <MenuItem value="preparando">Preparando</MenuItem>
                  <MenuItem value="listo">Listos</MenuItem>
                  <MenuItem value="en_camino">En camino</MenuItem>
                  <MenuItem value="entregado">Entregados</MenuItem>
                  <MenuItem value="cancelado">Cancelados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="tipo"
                  value={filters.tipo || ''}
                  onChange={handleFilterChange as (event: SelectChangeEvent) => void}
                  label="Tipo"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="delivery">Delivery</MenuItem>
                  <MenuItem value="local">Local</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Desde"
                name="desde"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.desde || ''}
                onChange={handleFilterChange as (event: React.ChangeEvent<HTMLInputElement>) => void}
                size="small"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Hasta"
                name="hasta"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={filters.hasta || ''}
                onChange={handleFilterChange as (event: React.ChangeEvent<HTMLInputElement>) => void}
                size="small"
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Resultados por página</InputLabel>
                <Select
                  name="limite"
                  value={String(filters.limite) || '10'}
                  onChange={handleFilterChange as (event: SelectChangeEvent) => void}
                  label="Resultados por página"
                >
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="25">25</MenuItem>
                  <MenuItem value="50">50</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                fullWidth
              >
                Limpiar filtros
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow 
                        key={order.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{order.codigo}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(order.fecha_pedido)}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={order.tipo === 'delivery' ? <LocalShipping fontSize="small" /> : <Restaurant fontSize="small" />}
                            label={order.tipo === 'delivery' ? 'Delivery' : 'Local'}
                            size="small"
                            color={order.tipo === 'delivery' ? 'info' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {order.nombre_cliente || (order.usuario ? `${order.usuario.nombre} ${order.usuario.apellidos || ''}` : 'Cliente anónimo')}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            S/ {order.total.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <OrderStatusChip estado={order.estado} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrder(order.id);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                          No hay pedidos que coincidan con los filtros seleccionados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Paginación */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Mostrando {orders.length} de {totalOrders} pedidos
              </Typography>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                shape="rounded" 
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default OrdersList;