import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Switch,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  ArrowUpward, 
  ArrowDownward,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface Categoria {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  imagen?: string;
  orden: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

const CategoriesList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Categoria | null }>({ 
    open: false, 
    category: null 
  });

  // Cargar categorías
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categorias');
      setCategories(response.data.data.categorias);
      setError(null);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('No se pudieron cargar las categorías. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Cambiar el estado activo/inactivo
  const handleToggleActive = async (category: Categoria) => {
    try {
      await api.put(`/categorias/${category.id}`, {
        ...category,
        activo: !category.activo
      });
      
      // Actualizar localmente
      setCategories(prev => 
        prev.map(cat => 
          cat.id === category.id 
            ? { ...cat, activo: !cat.activo } 
            : cat
        )
      );
    } catch (err) {
      console.error('Error al cambiar estado de categoría:', err);
      setError('No se pudo cambiar el estado de la categoría.');
    }
  };

  // Cambiar el orden
  const handleChangeOrder = async (category: Categoria, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' 
      ? category.orden - 1 
      : category.orden + 1;
    
    try {
      await api.put(`/categorias/${category.id}`, {
        ...category,
        orden: newOrder
      });
      
      // Recargar para tener el orden actualizado
      fetchCategories();
    } catch (err) {
      console.error('Error al cambiar orden de categoría:', err);
      setError('No se pudo cambiar el orden de la categoría.');
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;
    
    try {
      await api.delete(`/categorias/${deleteDialog.category.id}`);
      
      // Actualizar localmente
      setCategories(prev => 
        prev.filter(cat => cat.id !== deleteDialog.category!.id)
      );
      
      setDeleteDialog({ open: false, category: null });
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err);
      
      // Verificar si hay productos asociados
      if (err.response?.status === 400) {
        setError('No se puede eliminar la categoría porque tiene productos asociados.');
      } else {
        setError('No se pudo eliminar la categoría.');
      }
      setDeleteDialog({ open: false, category: null });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestión de Categorías
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => navigate('/admin/categories/create')}
        >
          Nueva Categoría
        </Button>
      </Box>

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
          <TableContainer sx={{ maxHeight: 650 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Orden</TableCell>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {category.orden}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleChangeOrder(category, 'up')}
                            disabled={category.orden <= 1}
                          >
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleChangeOrder(category, 'down')}
                          >
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {category.imagen ? (
                        <Box 
                          component="img" 
                          src={`/api/uploads/categorias/${category.imagen}`}
                          alt={category.nombre}
                          sx={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: 50, 
                            height: 50, 
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <VisibilityOff color="disabled" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{category.codigo}</TableCell>
                    <TableCell>{category.nombre}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          checked={category.activo}
                          onChange={() => handleToggleActive(category)}
                          color="primary"
                        />
                        <Chip 
                          label={category.activo ? 'Activo' : 'Inactivo'}
                          color={category.activo ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton 
                          onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          onClick={() => setDeleteDialog({ open: true, category })}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No hay categorías disponibles
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar la categoría "${deleteDialog.category?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </Box>
  );
};

export default CategoriesList;