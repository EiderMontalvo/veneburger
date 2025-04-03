import api  from './api'

export interface LoginCredentials {
    email: string;
    password: string
}
export interface User {
    id: number;
    nombre: string;
    apellidos?: string;
    email: string;
    telefono?: string;
    direccion?: string;
    referencia_direccion?: string;
    ciudad?: string;
    distrito?: string;
    rol: string;
    activo: boolean;
    ultimo_login?: Date;
    createdAt?: Date;
    updateAt?: Date;
}
export interface AuthResponse {
    status: string;
    message: string;
    token: string;
    data: {
        usuario: User;
    }
}

//funcion para iniciar sesion
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};
//funcion para verificar el token actual
export const obtenerPerfil = async (): Promise<User> => {
    const response = await api.get<{status: string, data: {usuario: User}}>('/auth/perfil');
    return response.data.data.usuario;
};
//funcion para cerrar sesion
export const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};
//funcion para actualizar contraseña
export const actualizarPassword = async (
    passwordActual: string,
    passwordNueva: string
): Promise<{status: string, message: string}> =>{
    const response = await api.patch<{status: string, message: string}>(
        '/auth/actualizar-password',
        {passwordActual, passwordNueva}
    );
    return response.data;
};
