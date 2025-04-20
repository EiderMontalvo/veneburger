import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper,
  FormControlLabel, Switch, Alert, CircularProgress, Breadcrumbs, Link
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import ImageUpload from '../../../components/common/ImageUpload';
// Importar el servicio para eliminar archivos
import { deleteFile } from '../../../services/uploadService';

interface CategoryFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    orden: 0,
    activo: true
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [removedImage, setRemovedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos si está editando
  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditing) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/categorias/${id}`);
        const category = response.data.data.categoria;
        
        setFormData({
          nombre: category.nombre,
          codigo: category.codigo,
          descripcion: category.descripcion || '',
          orden: category.orden,
          activo: category.activo
        });
        
        setInitialImage(category.imagen);
        setError(null);
      } catch (err) {
        console.error('Error al cargar categoría:', err);
        setError('No se pudo cargar la información de la categoría.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [id, isEditing]);

  // Limpiar recursos al desmontar el componente o cuando se navega a otra ruta
  useEffect(() => {
    return () => {
      // Si hay una imagen que se removió pero no se envió el formulario, eliminarla
      if (removedImage && removedImage !== 'default.png') {
        deleteFile('categorias', removedImage)
          .catch(err => console.error('Error al eliminar imagen temporal:', err));
      }
    };
  }, [removedImage]);

  // Manejar cambios en los campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el switch
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
      // Crear FormData para enviar la imagen
      const formDataToSend = new FormData();
      
      // Añadir todos los campos
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof CategoryFormData].toString());
      });
      
      // Añadir imagen si se seleccionó una nueva
      if (imageFile) {
        formDataToSend.append('imagen', imageFile);
      }
      
      // Enviar solicitud
      if (isEditing) {
        await api.put(`/categorias/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Si subimos una nueva imagen, el backend ya se encarga de eliminar la anterior
        // así que reiniciamos el estado removedImage
        setRemovedImage(null);
        setSuccess('Categoría actualizada correctamente');
      } else {
        await api.post('/categorias', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Categoría creada correctamente');
        
        // Resetear formulario si es creación
        if (!isEditing) {
          setFormData({
            nombre: '',
            codigo: '',
            descripcion: '',
            orden: 0,
            activo: true
          });
          setImageFile(null);
          setInitialImage(null);
          setRemovedImage(null);
        }
      }
    } catch (err: any) {
      console.error('Error al guardar categoría:', err);
      setError(err.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button" 
          variant="body2" 
          onClick={() => navigate('/admin/categories')}
          underline="hover"
          color="inherit"
        >
          Categorías
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Alternativa usando Box con flexbox en lugar de Grid */}
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
                  required
                  label="Código"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleTextChange}
                  margin="normal"
                  helperText="Código único para la categoría (sin espacios)"
                />
                
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleTextChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="Orden"
                  name="orden"
                  value={formData.orden}
                  onChange={handleTextChange}
                  margin="normal"
                  InputProps={{ inputProps: { min: 0 } }}
                  helperText="Orden de aparición (menor número = primero)"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={handleSwitchChange}
                      name="activo"
                      color="primary"
                    />
                  }
                  label="Categoría activa"
                  sx={{ mt: 2 }}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                <ImageUpload
                  initialImage={initialImage}
                  onImageChange={handleImageChange}
                  label="Imagen de la categoría"
                  folder="categorias"
                  height={250}
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/admin/categories')}
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

export default CategoryForm;