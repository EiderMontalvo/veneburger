import React, { useState } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Button, TextField,
  Divider, CircularProgress, Stepper, Step, StepLabel,
  useTheme, useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useCart } from '../../context/CartContext';
import OrderSummary from '../../components/checkout/OrderSummary';
import DeliveryTypeSelector from '../../components/checkout/DeliveryTypeSelector';

const CheckoutPage = () => {
  const { cart, subtotal, deliveryCost, total, orderType, clearCart } = useCart();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    referencia: '',
    metodo_pago: 'efectivo',
  });
  
  // Steps para el stepper
  const steps = ['Información Personal', 'Confirmación de Pedido'];

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (activeStep === 0) {
      // Validar formulario
      if (!formData.nombre || !formData.telefono) {
        enqueueSnackbar('Por favor completa los campos obligatorios', { variant: 'error' });
        return;
      }
      
      if (orderType === 'delivery' && !formData.direccion) {
        enqueueSnackbar('La dirección es obligatoria para delivery', { variant: 'error' });
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Volver al paso anterior
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Procesar el pedido
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      enqueueSnackbar('Tu carrito está vacío', { variant: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      // Simular API call (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular respuesta exitosa
      enqueueSnackbar('¡Pedido realizado con éxito!', { variant: 'success' });
      clearCart();
      navigate('/');
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      enqueueSnackbar('Error al procesar el pedido', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Finalizar Compra
        </Typography>
        
        {/* Stepper para mostrar progreso */}
        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 4 }}
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {cart.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Tu carrito está vacío
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/menu')}
              sx={{ mt: 2 }}
            >
              Ver Menú
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {/* Formulario */}
            <Grid item xs={12} md={8}>
              {activeStep === 0 ? (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Información de Contacto
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="nombre"
                        label="Nombre Completo *"
                        value={formData.nombre}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="telefono"
                        label="Teléfono *"
                        value={formData.telefono}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                  
                  {/* Tipo de Entrega */}
                  <Box sx={{ mt: 3 }}>
                    <DeliveryTypeSelector />
                  </Box>
                  
                  {/* Campos específicos para delivery */}
                  {orderType === 'delivery' && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Información de Entrega
                      </Typography>
                      <TextField
                        name="direccion"
                        label="Dirección de Entrega *"
                        value={formData.direccion}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      <TextField
                        name="referencia"
                        label="Referencia"
                        value={formData.referencia}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        placeholder="Ej: Edificio amarillo, cerca de la farmacia"
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleNext}
                    >
                      Continuar
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen del Pedido
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Información de Contacto
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Nombre:</strong> {formData.nombre}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Teléfono:</strong> {formData.telefono}
                        </Typography>
                      </Grid>
                      {formData.email && (
                        <Grid item xs={12}>
                          <Typography variant="body2">
                            <strong>Email:</strong> {formData.email}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Método de Entrega
                    </Typography>
                    <Typography variant="body2">
                      {orderType === 'delivery' 
                        ? 'Delivery (entrega a domicilio)' 
                        : orderType === 'pickup'
                          ? 'Para llevar (recoger en tienda)'
                          : 'Comer en local'}
                    </Typography>
                    
                    {orderType === 'delivery' && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          <strong>Dirección:</strong> {formData.direccion}
                        </Typography>
                        {formData.referencia && (
                          <Typography variant="body2">
                            <strong>Referencia:</strong> {formData.referencia}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Detalle de Pago
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">S/ {subtotal.toFixed(2)}</Typography>
                    </Box>
                    {orderType === 'delivery' && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2">Envío:</Typography>
                        <Typography variant="body2">S/ {deliveryCost.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      mt: 1,
                      bgcolor: 'primary.lighter',
                      p: 1,
                      borderRadius: 1,
                      fontWeight: 'bold'
                    }}>
                      <Typography variant="body1" fontWeight="bold">Total:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        S/ {total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Volver
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSubmitOrder}
                      disabled={loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Confirmar Pedido'
                      )}
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>
            
            {/* Resumen de la orden */}
            <Grid item xs={12} md={4}>
              <OrderSummary onCheckout={handleSubmitOrder} />
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CheckoutPage;