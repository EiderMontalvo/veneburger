import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const CategoryPaper = styled(Paper)(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: active ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  backgroundColor: active ? theme.palette.primary.lighter : theme.palette.background.paper,
  boxShadow: active ? theme.shadows[3] : theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
    backgroundColor: active ? theme.palette.primary.lighter : theme.palette.background.paper,
  },
}));

const CategoryItem = ({ category, active, onClick }) => {
  return (
    <CategoryPaper active={active} onClick={onClick}>
      <Box
        component="img"
        src={category.imagen || '/assets/images/default-category.jpg'}
        alt={category.nombre}
        sx={{
          width: 50,
          height: 50,
          objectFit: 'cover',
          borderRadius: '50%',
          mb: 1,
        }}
      />
      <Typography variant="body2" align="center" fontWeight={active ? 700 : 500}>
        {category.nombre}
      </Typography>
    </CategoryPaper>
  );
};

export default CategoryItem;