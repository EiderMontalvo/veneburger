import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
      light: '#ff8c5f',
      dark: '#e55a28',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f7c59f',
      light: '#ffd7b5',
      dark: '#e0b48f',
      contrastText: '#2b2d42',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#777777',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
      variants: [
        {
          props: { variant: 'add' },
          style: {
            backgroundColor: '#ff6b35',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#e55a28',
            },
            borderRadius: 20,
            padding: '5px 15px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          },
        },
      ],
    },
  },
});

export default theme;