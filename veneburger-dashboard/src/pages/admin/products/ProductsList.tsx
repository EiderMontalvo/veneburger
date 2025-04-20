import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Switch, Chip, CircularProgress, Alert,
  Tooltip, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent
} from '@mui/material';
import { 
  Add, Edit, Delete, Clear
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { getImageUrl } from '../../../utils/imageUtils';
import ImageWithFallback from '../../../components/common/ImageWithFallback';
import { deleteFile } from '../../../services/uploadService';

interface Categoria {
  id: number;
  nombre: string;
  codigo: string;
}

interface Producto {
  id: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  precio: string | number;
  imagen?: string;
  categoria_id: number;
  categoria?: Categoria;
  disponible: boolean;
  destacado: boolean;
  tiempo_preparacion: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Simplificamos FilterState quitando 'nombre'
interface FilterState {
  categoria_id: string;
  disponible: string;
  destacado: string;
}

const ProductsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Producto | null }>({ 
    open: false, 
    product: null 
  });
  
  // Estados de filtros (simplificados sin nombre)
  const [filters, setFilters] = useState<FilterState>({
    categoria_id: '',
    disponible: '',
    destacado: ''
  });

  // Cargar categorías para el filtro
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categorias');
      setCategories(response.data.data.categorias);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  // Cargar productos con filtros
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Construir query params a partir de los filtros
      const params = new URLSearchParams();
      
      if (filters.categoria_id) {
        params.append('categoria_id', filters.categoria_id);
      }
      
      if (filters.disponible !== '') {
        params.append('disponible', filters.disponible);
      }
      
      if (filters.destacado !== '') {
        params.append('destacado', filters.destacado);
      }
      
      // Añadir timestamp para evitar problemas de caché
      const timestamp = new Date().getTime();
      params.append('_t', timestamp.toString());
      
      const response = await api.get(`/productos?${params.toString()}`);
      setProducts(response.data.data.productos);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters]); // Dependencia en filters

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); // Incluir dependencia

  // Efecto separado para productos que se actualiza cuando cambian los filtros
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters({
      categoria_id: '',
      disponible: '',
      destacado: ''
    });
  };

  // Cambiar disponibilidad de producto
  const handleToggleAvailability = async (product: Producto) => {
    try {
      await api.patch(`/productos/${product.id}/disponibilidad`);
      
      // Actualizar localmente
      setProducts(prev => 
        prev.map(p => 
          p.id === product.id 
            ? { ...p, disponible: !p.disponible } 
            : p
        )
      );
    } catch (err) {
      console.error('Error al cambiar disponibilidad:', err);
      setError('No se pudo cambiar la disponibilidad del producto.');
    }
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    
    try {
      setLoading(true);
      
      // Primero eliminar la imagen si existe
      if (deleteDialog.product.imagen && deleteDialog.product.imagen !== 'default.png') {
        await deleteFile('productos', deleteDialog.product.imagen);
      }
      
      // Luego eliminar el producto
      await api.delete(`/productos/${deleteDialog.product.id}`);
      
      // Actualizar localmente
      setProducts(prev => 
        prev.filter(p => p.id !== deleteDialog.product!.id)
      );
      
      setDeleteDialog({ open: false, product: null });
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError('No se pudo eliminar el producto.');
      setDeleteDialog({ open: false, product: null });
      setLoading(false);
    }
  };

  // Manejar cambio en selects
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestión de Productos
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => navigate('/admin/products/create')}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Filtros
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              name="categoria_id"
              value={filters.categoria_id}
              onChange={handleSelectChange}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id.toString()}>
                  {category.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Disponibilidad</InputLabel>
            <Select
              name="disponible"
              value={filters.disponible}
              onChange={handleSelectChange}
              label="Disponibilidad"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Disponibles</MenuItem>
              <MenuItem value="false">No disponibles</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Destacado</InputLabel>
            <Select
              name="destacado"
              value={filters.destacado}
              onChange={handleSelectChange}
              label="Destacado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Destacados</MenuItem>
              <MenuItem value="false">No destacados</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={handleClearFilters}
              startIcon={<Clear />}
            >
              Limpiar filtros
            </Button>
          </Box>
        </Box>
      </Paper>

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
                  <TableCell>Imagen</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Destacado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <ImageWithFallback
                        src={getImageUrl('productos', product.imagen, true, true)}
                        alt={product.nombre || 'Producto'}
                        fallbackSrc={getImageUrl('productos', 'default.png', true)}
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell>{product.codigo || '—'}</TableCell>
                    <TableCell>{product.nombre}</TableCell>
                    <TableCell>{product.categoria?.nombre}</TableCell>
                    <TableCell>S/ {Number(product.precio).toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Switch
                          checked={product.disponible}
                          onChange={() => handleToggleAvailability(product)}
                          color="primary"
                        />
                        <Chip 
                          label={product.disponible ? 'Disponible' : 'No disponible'}
                          color={product.disponible ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {product.destacado ? (
                        <Chip 
                          label="Destacado" 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="No" 
                          size="small" 
                          variant="outlined"
                          sx={{ opacity: 0.6 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton 
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton 
                          onClick={() => setDeleteDialog({ open: true, product })}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                        No hay productos disponibles con los filtros seleccionados
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
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar producto"
        message={`¿Estás seguro de eliminar el producto "${deleteDialog.product?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
      />
    </Box>
  );
};

export default ProductsList;