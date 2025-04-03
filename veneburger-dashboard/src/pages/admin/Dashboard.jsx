import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  RestaurantMenu,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/es';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Configurar moment en español
moment.locale('es');

const Dashboard = () => {
  const theme = useTheme();
  const { usuario } = useSelector((state) => state.auth);
  const [rangoFechas, setRangoFechas] = useState('30');
  const [periodoVentas, setPeriodoVentas] = useState('diarias');
  
  // Estados para los datos de los reportes
  const [ventasDiarias, setVentasDiarias] = useState(null);
  const [ventasMensuales, setVentasMensuales] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState(null);
  const [ventasPorTipo, setVentasPorTipo] = useState(null);
  
  // Estados de carga
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // Estados de error
  const [errorDaily, setErrorDaily] = useState(null);
  const [errorMonthly, setErrorMonthly] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);
  const [errorTypes, setErrorTypes] = useState(null);
  
  const COLORES_GRAFICA = [
    '#4CAF50', // verde
    '#2196F3', // azul
    '#FFC107', // amarillo
    '#FF5722', // naranja
    '#9C27B0', // morado
    '#F44336', // rojo
  ];
  
  // Obtener ventas diarias
  const cargarVentasDiarias = async (dias) => {
    setLoadingDaily(true);
    setErrorDaily(null);
    
    try {
      const fechaFin = moment().format('YYYY-MM-DD');
      const fechaInicio = moment().subtract(parseInt(dias), 'days').format('YYYY-MM-DD');
      
      const response = await api.get(`/reportes/ventas/diarias?inicio=${fechaInicio}&fin=${fechaFin}`);
      setVentasDiarias(response.data.data);
    } catch (error) {
      setErrorDaily(error.response?.data?.message || 'Error al cargar ventas diarias');
      console.error('Error al cargar ventas diarias:', error);
    } finally {
      setLoadingDaily(false);
    }
  };
  
  // Obtener ventas mensuales
  const cargarVentasMensuales = async () => {
    setLoadingMonthly(true);
    setErrorMonthly(null);
    
    try {
      const anioActual = moment().year();
      const response = await api.get(`/reportes/ventas/mensuales?anio=${anioActual}`);
      setVentasMensuales(response.data.data);
    } catch (error) {
      setErrorMonthly(error.response?.data?.message || 'Error al cargar ventas mensuales');
      console.error('Error al cargar ventas mensuales:', error);
    } finally {
      setLoadingMonthly(false);
    }
  };
  
  // Obtener productos más vendidos
  const cargarProductosMasVendidos = async (dias) => {
    setLoadingProducts(true);
    setErrorProducts(null);
    
    try {
      const fechaFin = moment().format('YYYY-MM-DD');
      const fechaInicio = moment().subtract(parseInt(dias), 'days').format('YYYY-MM-DD');
      
      const response = await api.get(`/reportes/productos/mas-vendidos?inicio=${fechaInicio}&fin=${fechaFin}&limite=5`);
      setProductosMasVendidos(response.data.data);
    } catch (error) {
      setErrorProducts(error.response?.data?.message || 'Error al cargar productos más vendidos');
      console.error('Error al cargar productos más vendidos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };
  
  // Obtener ventas por tipo
  const cargarVentasPorTipo = async (dias) => {
    setLoadingTypes(true);
    setErrorTypes(null);
    
    try {
      const fechaFin = moment().format('YYYY-MM-DD');
      const fechaInicio = moment().subtract(parseInt(dias), 'days').format('YYYY-MM-DD');
      
      const response = await api.get(`/reportes/ventas/por-tipo?inicio=${fechaInicio}&fin=${fechaFin}`);
      setVentasPorTipo(response.data.data);
    } catch (error) {
      setErrorTypes(error.response?.data?.message || 'Error al cargar ventas por tipo');
      console.error('Error al cargar ventas por tipo:', error);
    } finally {
      setLoadingTypes(false);
    }
  };
  
  // Cargar datos al montar el componente y cuando cambie el rango de fechas
  useEffect(() => {
    cargarVentasDiarias(rangoFechas);
    cargarProductosMasVendidos(rangoFechas);
    cargarVentasPorTipo(rangoFechas);
  }, [rangoFechas]);
  
  // Cargar ventas mensuales solo una vez al montar el componente
  useEffect(() => {
    cargarVentasMensuales();
  }, []);
  
  // Formatear datos de ventas diarias para el gráfico
  const formatearDatosVentasDiarias = () => {
    if (!ventasDiarias || !ventasDiarias.ventasDiarias) return [];
    
    return ventasDiarias.ventasDiarias.map((venta) => ({
      fecha: moment(venta.fecha).format('DD MMM'),
      ventas: parseFloat(venta.total_ventas),
      pedidos: parseInt(venta.cantidad_pedidos)
    }));
  };
  
  // Formatear datos de ventas mensuales para el gráfico
  const formatearDatosVentasMensuales = () => {
    if (!ventasMensuales || !ventasMensuales.ventasMensuales) return [];
    
    return ventasMensuales.ventasMensuales.map((venta) => ({
      mes: venta.nombre_mes,
      ventas: venta.total_ventas,
      pedidos: venta.cantidad_pedidos
    }));
  };
  
  // Formatear datos de ventas por tipo para el gráfico
  const formatearDatosVentasPorTipo = () => {
    if (!ventasPorTipo || !ventasPorTipo.ventasPorTipo) return [];
    
    return ventasPorTipo.ventasPorTipo.map((item) => {
      const tipoNombre = 
        item.tipo === 'local' ? 'En Local' :
        item.tipo === 'delivery' ? 'Delivery' :
        item.tipo === 'para_llevar' ? 'Para Llevar' : 
        item.tipo;
      
      // Calcular el porcentaje para el tooltip
      const total = ventasPorTipo.ventasPorTipo.reduce(
        (sum, tipo) => sum + parseFloat(tipo.total_ventas), 
        0
      );
      
      return {
        name: tipoNombre,
        value: parseFloat(item.total_ventas),
        percentage: total > 0 ? (parseFloat(item.total_ventas) / total) * 100 : 0
      };
    });
  };
  
  // Formatear número a moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  };
  
  // Formato para el tooltip del gráfico de ventas
  const CustomTooltipVentas = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
          <Typography variant="caption" fontWeight="bold">{label}</Typography>
          <Box>
            <Typography variant="caption" color="primary">
              Ventas: {formatearMoneda(payload[0].value)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="secondary">
              Pedidos: {payload[1].value}
            </Typography>
          </Box>
        </Paper>
      );
    }
    return null;
  };
  
  // Formato para el tooltip del gráfico de torta
  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, bgcolor: 'background.paper' }}>
          <Typography variant="caption" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Box>
            <Typography variant="caption" color="primary">
              {formatearMoneda(payload[0].value)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {payload[0].payload.percentage.toFixed(1)}% del total
            </Typography>
          </Box>
        </Paper>
      );
    }
    return null;
  };
  
  // Datos de tarjetas de resumen
  const tarjetasResumen = [
    {
      title: 'Total Ventas',
      value: ventasDiarias?.resumen?.totalVentas || 0,
      icon: <MoneyIcon />,
      color: '#4CAF50',
      formato: 'moneda'
    },
    {
      title: 'Total Pedidos',
      value: ventasDiarias?.resumen?.totalPedidos || 0,
      icon: <RestaurantMenu />,
      color: '#2196F3',
      formato: 'numero'
    },
    {
      title: 'Ticket Promedio',
      value: ventasDiarias?.resumen?.totalPedidos ? 
        (ventasDiarias.resumen.totalVentas / ventasDiarias.resumen.totalPedidos) : 0,
      icon: <TrendingUpIcon />,
      color: '#FFC107',
      formato: 'moneda'
    }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenido, {usuario?.nombre} | {moment().format('LL')}
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Período</InputLabel>
          <Select
            value={rangoFechas}
            onChange={(e) => setRangoFechas(e.target.value)}
            label="Período"
          >
            <MenuItem value="7">Últimos 7 días</MenuItem>
            <MenuItem value="15">Últimos 15 días</MenuItem>
            <MenuItem value="30">Últimos 30 días</MenuItem>
            <MenuItem value="60">Últimos 60 días</MenuItem>
            <MenuItem value="90">Últimos 90 días</MenuItem>
          </Select>
        </FormControl>
        
        <Box>
          <Button 
            variant={periodoVentas === 'diarias' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setPeriodoVentas('diarias')}
            sx={{ mr: 1 }}
          >
            Diario
          </Button>
          <Button 
            variant={periodoVentas === 'mensuales' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setPeriodoVentas('mensuales')}
          >
            Mensual
          </Button>
        </Box>
      </Box>
      
      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {tarjetasResumen.map((tarjeta, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1, 
                      borderRadius: '8px', 
                      display: 'flex',
                      bgcolor: `${tarjeta.color}15`
                    }}
                  >
                    <Box sx={{ color: tarjeta.color }}>
                      {tarjeta.icon}
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    {tarjeta.title}
                  </Typography>
                </Box>
                
                <Typography variant="h4" fontWeight="bold">
                  {tarjeta.formato === 'moneda' 
                    ? formatearMoneda(tarjeta.value) 
                    : tarjeta.value.toLocaleString()}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  Últimos {rangoFechas} días
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de ventas (diarias o mensuales) */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Evolución de Ventas {periodoVentas === 'diarias' ? 'Diarias' : 'Mensuales'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {periodoVentas === 'diarias' ? (
                loadingDaily ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : errorDaily ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorDaily}
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={formatearDatosVentasDiarias()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltipVentas />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ventas"
                        name="Ventas (S/)"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="pedidos"
                        name="Pedidos"
                        stroke={theme.palette.secondary.main}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )
              ) : (
                loadingMonthly ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : errorMonthly ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMonthly}
                  </Alert>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={formatearDatosVentasMensuales()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltipVentas />} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="ventas"
                        name="Ventas (S/)"
                        fill={theme.palette.primary.main}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="pedidos"
                        name="Pedidos"
                        fill={theme.palette.secondary.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráfico de ventas por tipo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Ventas por Tipo de Pedido
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loadingTypes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                  <CircularProgress />
                </Box>
              ) : errorTypes ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorTypes}
                </Alert>
              ) : (
                <Box>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={formatearDatosVentasPorTipo()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {formatearDatosVentasPorTipo().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORES_GRAFICA[index % COLORES_GRAFICA.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Box sx={{ mt: 2 }}>
                    {formatearDatosVentasPorTipo().map((entry, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1,
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 14, 
                              height: 14, 
                              bgcolor: COLORES_GRAFICA[index % COLORES_GRAFICA.length],
                              borderRadius: '3px',
                              mr: 1
                            }} 
                          />
                          <Typography variant="body2">
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatearMoneda(entry.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Tabla de productos más vendidos */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Productos Más Vendidos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loadingProducts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : errorProducts ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorProducts}
                </Alert>
              ) : (
                <Box>
                  {productosMasVendidos?.productosMasVendidos && productosMasVendidos.productosMasVendidos.length > 0 ? (
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ 
                              textAlign: 'left', 
                              padding: '12px 8px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              Producto
                            </th>
                            <th style={{ 
                              textAlign: 'left', 
                              padding: '12px 8px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              Categoría
                            </th>
                            <th style={{ 
                              textAlign: 'right', 
                              padding: '12px 8px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              Unidades
                            </th>
                            <th style={{ 
                              textAlign: 'right', 
                              padding: '12px 8px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              Precio Unit.
                            </th>
                            <th style={{ 
                              textAlign: 'right', 
                              padding: '12px 8px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {productosMasVendidos.productosMasVendidos.map((producto, index) => (
                            <tr key={index}>
                              <td style={{ 
                                padding: '12px 8px', 
                                borderBottom: `1px solid ${theme.palette.divider}` 
                              }}>
                                {producto.producto.nombre}
                              </td>
                              <td style={{ 
                                padding: '12px 8px', 
                                borderBottom: `1px solid ${theme.palette.divider}` 
                              }}>
                                {producto.producto.categoria.nombre}
                              </td>
                              <td style={{ 
                                textAlign: 'right', 
                                padding: '12px 8px', 
                                borderBottom: `1px solid ${theme.palette.divider}` 
                              }}>
                                {parseInt(producto.unidades_vendidas).toLocaleString()}
                              </td>
                              <td style={{ 
                                textAlign: 'right', 
                                padding: '12px 8px', 
                                borderBottom: `1px solid ${theme.palette.divider}` 
                              }}>
                                {formatearMoneda(parseFloat(producto.producto.precio))}
                              </td>
                              <td style={{ 
                                textAlign: 'right', 
                                padding: '12px 8px', 
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                fontWeight: 'bold' 
                              }}>
                                {formatearMoneda(parseFloat(producto.total_ventas))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  ) : (
                    <Typography align="center" color="text.secondary" sx={{ my: 3 }}>
                      No hay datos de ventas en el período seleccionado
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => {/* Navegar a reporte completo */}}
                    >
                      Ver Reporte Completo
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;