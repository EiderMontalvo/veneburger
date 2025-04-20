import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Divider, 
  CircularProgress, Alert, TextField,
  InputAdornment, useTheme, useMediaQuery
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import CategoryItem from '../../components/menu/CategoryItem';
import MenuCard from '../../components/menu/MenuCard';
import useCategories from '../../hooks/useCategories';
import useProducts from '../../hooks/useProducts';

const MenuPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Obtener categoría de URL si existe
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);
  
  // Fetch categories using our custom hook
  const { 
    categories, 
    loading: loadingCategories, 
    error: categoriesError 
  } = useCategories();
  
  // Fetch products using our custom hook
  const {
    products,
    loading: loadingProducts,
    error: productsError,
    updateOptions
  } = useProducts(activeCategory);
  
  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchParams({ category: categoryId });
    setSearchTerm('');
  };
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      updateOptions({ search: searchTerm });
      setActiveCategory(null);
      setSearchParams({ search: searchTerm });
    }
  };
  
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom>
          Nuestro Menú
        </Typography>
        
        {/* Barra de búsqueda */}
        <Box sx={{ mb: 4, mt: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {/* Mostrar errores si existen */}
        {(categoriesError || productsError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {categoriesError || productsError}
          </Alert>
        )}
        
        {/* Categorías */}
        <Box sx={{ mb: 5 }}>
          {loadingCategories ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category.id}>
                  <CategoryItem 
                    category={category} 
                    active={activeCategory === category.id}
                    onClick={() => handleCategoryChange(category.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Productos */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            {activeCategory 
              ? categories.find(c => c.id === activeCategory)?.nombre || 'Productos'
              : searchTerm 
                ? `Resultados para "${searchTerm}"`
                : 'Todos los Productos'}
          </Typography>
          
          {loadingProducts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : products.length > 0 ? (
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <MenuCard product={product} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                No se encontraron productos{activeCategory ? ' en esta categoría' : ''}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MenuPage;