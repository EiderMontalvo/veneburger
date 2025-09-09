import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, Typography, Paper, FormControlLabel,
  Switch, Alert, CircularProgress, Breadcrumbs, Link,
  FormControl, InputLabel, Select,
  MenuItem, InputAdornment, SelectChangeEvent
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import ImageUpload from '../../../components/common/ImageUpload';
// Importar el servicio para eliminar archivos
import { deleteFile } from '../../../services/uploadService';

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  categoria_id: string;
  precio: string;
  tiempo_preparacion: number;
  disponible: boolean;
  destacado: boolean;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    categoria_id: '',
    precio: '',
    tiempo_preparacion: 15,
    disponible: true,
    destacado: false
  });
  
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [removedImage, setRemovedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar categorías
  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      // Añadir timestamp para evitar problemas de caché
      const timestamp = new Date().getTime();
      const response = await api.get(`/categorias?_t=${timestamp}`);
      
      if (response.data && response.data.data && Array.isArray(response.data.data.categorias)) {
        setCategories(response.data.data.categorias);
      } else {
        setCategories([]);
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      setError('No se pudieron cargar las categorías. Por favor, recarga la página.');
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Cargar datos si está editando
  const fetchProduct = useCallback(async () => {
    if (!isEditing) return;
    
    setLoading(true);
    try {
      // Añadir timestamp para evitar problemas de caché
      const timestamp = new Date().getTime();
      const response = await api.get(`/productos/${id}?_t=${timestamp}`);
      
      if (response.data && response.data.data && response.data.data.producto) {
        const product = response.data.data.producto;
        
        setFormData({
          nombre: product.nombre || '',
          codigo: product.codigo || '',
          descripcion: product.descripcion || '',
          categoria_id: product.categoria_id ? product.categoria_id.toString() : '',
          precio: product.precio ? product.precio.toString() : '',
          tiempo_preparacion: product.tiempo_preparacion || 15,
          disponible: product.disponible !== undefined ? product.disponible : true,
          destacado: product.destacado || false
        });
        
        setInitialImage(product.imagen || null);
      } else {
        throw new Error('No se pudo obtener la información del producto');
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar la información del producto. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Limpiar recursos al desmontar el componente o cuando se navega a otra ruta
  useEffect(() => {
    return () => {
      // Si hay una imagen que se removió pero no se envió el formulario, eliminarla
      if (removedImage && removedImage !== 'default.png') {
        deleteFile('productos', removedImage)
          .catch(() => null);
      }
    };
  }, [removedImage]);

  // Manejadores de cambio separados por tipo de control
  
  // Para TextField
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Para Select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Para Switch
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manejar cambio en la imagen
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    
    // Si se está cambiando la imagen, debemos registrar la imagen anterior para posible eliminación
    if (file && initialImage && initialImage !== 'default.png') {
      setRemovedImage(initialImage);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.precio || !formData.categoria_id) {
        throw new Error('Por favor completa los campos obligatorios');
      }
      
      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData();
      
      // Añadir todos los campos
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof ProductFormData]?.toString() || '');
      });
      
      // Añadir imagen si se seleccionó una nueva
      if (imageFile) {
        formDataToSend.append('imagen', imageFile);
      }
      
      // Enviar solicitud
      if (isEditing) {
        await api.put(`/productos/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Si subimos una nueva imagen, el backend ya se encarga de eliminar la anterior
        // así que reiniciamos el estado removedImage
        setRemovedImage(null);
        setSuccess('Producto actualizado correctamente');
      } else {
        await api.post('/productos', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Producto creado correctamente');
        
        // Resetear formulario si es creación
        if (!isEditing) {
          setFormData({
            nombre: '',
            codigo: '',
            descripcion: '',
            categoria_id: '',
            precio: '',
            tiempo_preparacion: 15,
            disponible: true,
            destacado: false
          });
          setImageFile(null);
          setInitialImage(null);
          setRemovedImage(null);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para recargar datos
  const handleRetry = () => {
    if (isEditing) {
      fetchProduct();
    }
    fetchCategories();
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button" 
          variant="body2" 
          onClick={() => navigate('/admin/products')}
          underline="hover"
          color="inherit"
        >
          Productos
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Reemplazamos Grid con Box y flexbox */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleTextChange}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Código"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleTextChange}
                  margin="normal"
                  helperText="Código único del producto (opcional)"
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="categoria-label">Categoría</InputLabel>
                  <Select
                    labelId="categoria-label"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleSelectChange}
                    label="Categoría"
                    disabled={categoryLoading}
                  >
                    {categoryLoading ? (
                      <MenuItem value="">
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      categories.map(category => (
                        <MenuItem key={category.id} value={category.id.toString()}>
                          {category.nombre}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleTextChange}
                  margin="normal"
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start">S/</InputAdornment>,
                    inputProps: { min: 0, step: 0.1 } 
                  }}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="Tiempo de preparación (minutos)"
                  name="tiempo_preparacion"
                  value={formData.tiempo_preparacion}
                  onChange={handleTextChange}
                  margin="normal"
                  InputProps={{ 
                    inputProps: { min: 1 } 
                  }}
                />
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.disponible}
                        onChange={handleSwitchChange}
                        name="disponible"
                        color="primary"
                      />
                    }
                    label="Producto disponible"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.destacado}
                        onChange={handleSwitchChange}
                        name="destacado"
                        color="warning"
                      />
                    }
                    label="Producto destacado"
                  />
                </Box>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <ImageUpload
                  initialImage={initialImage}
                  onImageChange={handleImageChange}
                  label="Imagen del producto"
                  folder="productos"
                  height={250}
                />
                
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleTextChange}
                  margin="normal"
                  multiline
                  rows={6}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/admin/products')}
              >
                Volver
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProductForm;