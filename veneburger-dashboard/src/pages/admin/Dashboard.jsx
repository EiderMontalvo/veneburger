import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Card, CardContent, Divider, Button, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert, useTheme, Stack, alpha, GlobalStyles
} from '@mui/material';
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
  
  // Estilos globales para corregir el centrado del Grid
  const gridStyles = (
    <GlobalStyles
      styles={{
        '.MuiGrid-root.MuiGrid-container': {
          margin: '0 auto !important',
          width: '100% !important',
          maxWidth: '100% !important',
          padding: '0 !important'
        },
        '.MuiGrid-item': {
          padding: '12px !important'
        }
      }}
    />
  );

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      mx: 'auto',
      px: { xs: 2, sm: 3, md: 4 },
      py: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Aplicar estilos globales para corregir Grid */}
      {gridStyles}
      
      <Box sx={{ width: '100%', maxWidth: 1400, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenido, {usuario?.nombre} | {moment().format('LL')}
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%', maxWidth: 1400, mb: 4 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
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
          
          <Stack direction="row" spacing={1}>
            <Button 
              variant={periodoVentas === 'diarias' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setPeriodoVentas('diarias')}
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
          </Stack>
        </Stack>
      </Box>
      
      {/* Tarjetas de resumen - Usando Box en lugar de Grid */}
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 1400, 
          mb: 4, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: 'center'
        }}
      >
        {tarjetasResumen.map((tarjeta, index) => (
          <Box 
            key={index} 
            sx={{ 
              width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.333% - 24px)' },
              minWidth: { xs: '100%', sm: 300, md: 250 }
            }}
          >
            <Card 
              sx={{ 
                height: '100%', 
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box 
                    sx={{ 
                      mr: 2, 
                      p: 1.5, 
                      borderRadius: '12px', 
                      display: 'flex',
                      bgcolor: `${tarjeta.color}15`
                    }}
                  >
                    <Box sx={{ color: tarjeta.color, fontSize: 26 }}>
                      {tarjeta.icon}
                    </Box>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {tarjeta.title}
                  </Typography>
                </Box>
                
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                  {tarjeta.formato === 'moneda' 
                    ? formatearMoneda(tarjeta.value) 
                    : tarjeta.value.toLocaleString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Últimos {rangoFechas} días
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      
      {/* Gráficos con Box en lugar de Grid */}
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 1400, 
          mb: 4, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          justifyContent: 'center'
        }}
      >
        {/* Gráfico de ventas (diarias o mensuales) */}
        <Box sx={{ width: { xs: '100%', md: 'calc(66.666% - 12px)' } }}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Evolución de Ventas {periodoVentas === 'diarias' ? 'Diarias' : 'Mensuales'}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {periodoVentas === 'diarias' ? (
                loadingDaily ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : errorDaily ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errorDaily}
                  </Alert>
                ) : (
                  <Box sx={{ width: '100%', height: 380 }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={formatearDatosVentasDiarias()}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="fecha" 
                          tick={{ fill: theme.palette.text.secondary }}
                          stroke={theme.palette.divider}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fill: theme.palette.text.secondary }}
                          stroke={theme.palette.divider}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          tick={{ fill: theme.palette.text.secondary }} 
                          stroke={theme.palette.divider}
                        />
                        <Tooltip content={<CustomTooltipVentas />} />
                        <Legend wrapperStyle={{ paddingTop: 15 }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ventas"
                          name="Ventas (S/)"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pedidos"
                          name="Pedidos"
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )
              ) : (
                loadingMonthly ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                    <CircularProgress />
                  </Box>
                ) : errorMonthly ? (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {errorMonthly}
                  </Alert>
                ) : (
                  <Box sx={{ width: '100%', height: 380 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={formatearDatosVentasMensuales()}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="mes" 
                          tick={{ fill: theme.palette.text.secondary }}
                          stroke={theme.palette.divider}
                        />
                        <YAxis 
                          yAxisId="left"
                          tick={{ fill: theme.palette.text.secondary }}
                          stroke={theme.palette.divider}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right"
                          tick={{ fill: theme.palette.text.secondary }}
                          stroke={theme.palette.divider}
                        />
                        <Tooltip content={<CustomTooltipVentas />} />
                        <Legend wrapperStyle={{ paddingTop: 15 }} />
                        <Bar
                          yAxisId="left"
                          dataKey="ventas"
                          name="Ventas (S/)"
                          fill={theme.palette.primary.main}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="pedidos"
                          name="Pedidos"
                          fill={theme.palette.secondary.main}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Gráfico de ventas por tipo */}
        <Box sx={{ width: { xs: '100%', md: 'calc(33.333% - 12px)' } }}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Ventas por Tipo de Pedido
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {loadingTypes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                  <CircularProgress />
                </Box>
              ) : errorTypes ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorTypes}
                </Alert>
              ) : (
                <Box>
                  <Box sx={{ width: '100%', height: 270, mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={formatearDatosVentasPorTipo()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          innerRadius={70}
                          outerRadius={100}
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
                  </Box>
                  
                  <Divider sx={{ mt: 3, mb: 2 }} />
                  
                  <Box sx={{ mt: 2 }}>
                    {formatearDatosVentasPorTipo().map((entry, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 1.5,
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              bgcolor: COLORES_GRAFICA[index % COLORES_GRAFICA.length],
                              borderRadius: '4px',
                              mr: 1.5
                            }} 
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {entry.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatearMoneda(entry.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Tabla de productos más vendidos */}
      <Box sx={{ width: '100%', maxWidth: 1400, mb: 2 }}>
        <Card
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Productos Más Vendidos
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {loadingProducts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : errorProducts ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorProducts}
              </Alert>
            ) : (
              <Box>
                {productosMasVendidos?.productosMasVendidos && productosMasVendidos.productosMasVendidos.length > 0 ? (
                  <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      tableLayout: 'fixed',
                      margin: '0 auto'
                    }}>
                      <thead>
                        <tr>
                          <th style={{ 
                            textAlign: 'left', 
                            padding: '14px 12px', 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: '25%',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            Producto
                          </th>
                          <th style={{ 
                            textAlign: 'left', 
                            padding: '14px 12px', 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: '20%',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            Categoría
                          </th>
                          <th style={{ 
                            textAlign: 'right', 
                            padding: '14px 12px', 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: '15%',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            Unidades
                          </th>
                          <th style={{ 
                            textAlign: 'right', 
                            padding: '14px 12px', 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: '15%',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            Precio Unit.
                          </th>
                          <th style={{ 
                            textAlign: 'right', 
                            padding: '14px 12px', 
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            width: '15%',
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                          }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosMasVendidos.productosMasVendidos.map((producto, index) => (
                          <tr key={index} style={{
                            backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.primary.main, 0.01)
                          }}>
                            <td style={{ 
                              padding: '14px 12px', 
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word'
                            }}>
                              {producto.producto.nombre}
                            </td>
                            <td style={{ 
                              padding: '14px 12px', 
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              whiteSpace: 'normal',
                              wordBreak: 'break-word'
                            }}>
                              {producto.producto.categoria.nombre}
                            </td>
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '14px 12px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              {parseInt(producto.unidades_vendidas).toLocaleString()}
                            </td>
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '14px 12px', 
                              borderBottom: `1px solid ${theme.palette.divider}` 
                            }}>
                              {formatearMoneda(Number(producto.producto.precio))}
                            </td>
                            <td style={{ 
                              textAlign: 'right', 
                              padding: '14px 12px', 
                              borderBottom: `1px solid ${theme.palette.divider}`,
                              fontWeight: 'bold',
                              color: theme.palette.primary.main
                            }}>
                              {formatearMoneda(parseFloat(producto.total_ventas))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Typography align="center" color="text.secondary" sx={{ my: 4, py: 2 }}>
                    No hay datos de ventas en el período seleccionado
                  </Typography>
                )}
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {/* Navegar a reporte completo */}}
                    sx={{ 
                      px: 3,
                      py: 1,
                      borderRadius: '8px',
                      fontWeight: 'medium'
                    }}
                  >
                    Ver Reporte Completo
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;