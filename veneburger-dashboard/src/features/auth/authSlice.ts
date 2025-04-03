import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Interfaces
export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  direccion: string | null;
  referencia_direccion: string | null;
  ciudad: string;
  distrito: string | null;
  rol: 'cliente' | 'admin' | 'repartidor';
  fecha_registro: string;
  ultimo_login: string | null;
  activo: boolean;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Obtener datos iniciales del localStorage
const token = localStorage.getItem('token');
const usuarioString = localStorage.getItem('usuario');
const usuario = usuarioString ? JSON.parse(usuarioString) : null;

// Estado inicial
const initialState: AuthState = {
  token: token,
  usuario: usuario,
  loading: false,
  error: null,
  isAuthenticated: !!token,
  isAdmin: usuario?.rol === 'admin'
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }
);

export const checkAuthAsync = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/perfil');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al verificar autenticación');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    api.defaults.headers.common['Authorization'] = '';
    return null;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.usuario = action.payload.data.usuario;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.data.usuario.rol === 'admin';
        
        // Guardar en localStorage
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('usuario', JSON.stringify(action.payload.data.usuario));
        
        // Configurar el token en las cabeceras por defecto
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      
      // Check Auth
      .addCase(checkAuthAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.usuario = action.payload.data.usuario;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.data.usuario.rol === 'admin';
      })
      .addCase(checkAuthAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.token = null;
        state.usuario = null;
        
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.usuario = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
      });
  }
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;