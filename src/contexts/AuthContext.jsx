import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService'; // Servicio para login/registro
import userService from '../services/userService'; // Servicio para obtener datos del usuario ('me')

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Objeto usuario (con grupos) o null
    const [token, setToken] = useState(localStorage.getItem('authToken') || null); // Token JWT o null
    const [loading, setLoading] = useState(true); // Carga inicial mientras verifica token

    // Efecto para verificar token y cargar datos de usuario al inicio
    useEffect(() => {
        const verifyInitialToken = async () => {
             if (token) {
                 try {
                     // Llama a /api/users/me para validar token y obtener datos frescos
                     console.log("Verificando token existente...");
                     const userData = await userService.getMe(); // Llama al servicio de usuario
                     setUser(userData); // Establece el usuario con grupos incluidos
                     localStorage.setItem('authUser', JSON.stringify(userData)); // Actualiza localStorage
                     console.log("Token verificado, usuario establecido:", userData);
                 } catch (error) {
                     // Si getMe falla (token inválido, expirado, error de red)
                     console.error("Error verificando token inicial o obteniendo datos de usuario:", error);
                     localStorage.removeItem('authToken');
                     localStorage.removeItem('authUser');
                     setToken(null);
                     setUser(null);
                 }
             } else {
                 // No hay token, no hay nada que verificar
                 console.log("No hay token inicial.");
             }
             setLoading(false); // Termina la carga inicial (haya o no token)
        }
        verifyInitialToken();
    // Ejecutar solo una vez al montar el componente
    // La dependencia [token] podría causar re-ejecución si el token cambia externamente,
    // pero login/logout lo manejan explícitamente. Usar [] es más seguro para "al montar".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Función de Login
    const login = async (email, password) => {
        try {
            setLoading(true);
            // authService.login ahora devuelve datos con groups incluidos desde el backend
            const data = await authService.login(email, password);
            if (data && data.token) {
                const { token: receivedToken, ...userData } = data; // userData incluye groups
                localStorage.setItem('authToken', receivedToken);
                localStorage.setItem('authUser', JSON.stringify(userData));
                setToken(receivedToken);
                setUser(userData);
                setLoading(false);
                return true;
            } else {
                 throw new Error("Respuesta de login inválida del servidor");
            }
        } catch (error) {
            console.error("Error en AuthContext login:", error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
            setLoading(false);
            throw error;
        }
    };

    // Función de Logout
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        console.log("Usuario deslogueado");
        // Idealmente, aquí también se limpiaría cualquier estado global relacionado
        // y se redirigiría a /login usando useNavigate en un componente apropiado.
    };

    // Función de Registro
    const register = async (username, email, password) => {
         try {
            setLoading(true);
            // authService.register devuelve el nuevo usuario (sin grupos inicialmente) y token
            const data = await authService.register(username, email, password);
             if (data && data.token) {
                 // Hacemos login automático después del registro
                 const { token: receivedToken, ...userData } = data;
                 localStorage.setItem('authToken', receivedToken);
                 // El usuario recién registrado no tendrá grupos aún
                 localStorage.setItem('authUser', JSON.stringify(userData));
                 setToken(receivedToken);
                 setUser(userData);
                 setLoading(false);
                 return true;
             } else {
                 throw new Error("Respuesta de registro inválida del servidor");
             }
         } catch (error) {
             console.error("Error en AuthContext register:", error);
             setLoading(false);
             throw error;
         }
    };

    // 3. Valor que proporcionará el Contexto
    const value = {
        user,                 // Objeto del usuario logueado (con groups si los tiene) o null
        token,                // Token JWT (o null)
        isLoggedIn: !!user,   // Booleano: true si user no es null
        isLoading: loading,   // Booleano: true mientras se verifica el token inicial
        login,                // Función para iniciar sesión
        logout,               // Función para cerrar sesión
        register              // Función para registrarse
    };

    // Retorna el Provider con el valor
    return (
        <AuthContext.Provider value={value}>
            {/* Renderiza children solo cuando NO esté en la carga inicial */}
            {/* O manejar el estado isLoading en los componentes que usan el contexto */}
            {children}
        </AuthContext.Provider>
    );
};

// 4. Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};