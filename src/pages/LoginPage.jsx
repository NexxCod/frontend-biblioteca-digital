import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para enlace a registro y redirección
import { useAuth } from '../contexts/AuthContext'; // Nuestro hook de autenticación

function LoginPage() {
    // Hook para navegar después del login
    const navigate = useNavigate();
    // Obtenemos lo que necesitamos del contexto de autenticación
    const { login, isLoggedIn, isLoading, user } = useAuth();

    // Estados locales para el formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Para mostrar mensajes de error del login

    // Redirigir si el usuario ya está logueado
    useEffect(() => {
        if (isLoggedIn) {
            console.log("Usuario ya logueado, redirigiendo...", user);
            // Redirige a la página principal (ej: '/') o a un dashboard
            navigate('/');
        }
    }, [isLoggedIn, navigate, user]); // Dependencias del efecto

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene la recarga de la página
        setError(''); // Limpia errores anteriores

        if (!email || !password) {
            setError('Por favor, ingresa email y contraseña.');
            return;
        }

        try {
            const success = await login(email, password); // Llama a la función login del contexto
            if (success) {
                console.log("Login exitoso!");
                navigate('/'); // Redirige a la página principal después del login
            }
        } catch (err) {
            console.error("Error capturado en LoginPage:", err);
            // Mostramos el mensaje de error que viene del backend o un mensaje genérico
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    // Si aún está cargando la verificación inicial del token, muestra un mensaje
    if (isLoading && !isLoggedIn) { // Evita mostrar 'Cargando...' si ya sabemos que está logueado y estamos por redirigir
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    // Si ya está logueado, no mostramos el formulario (useEffect se encargará de redirigir)
    if (isLoggedIn) {
        return null; // O un spinner mientras redirige
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800">Iniciar Sesión</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                            />
                        </div>
                        {/* Mostrar mensaje de error si existe */}
                        {error && (
                            <div className="mt-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex items-baseline justify-between">
                            <button
                                type="submit"
                                disabled={isLoading} // Deshabilita el botón mientras carga
                                className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                        <div className="mt-6 text-grey-dark">
                            ¿No tienes cuenta?
                            <Link className="text-blue-600 hover:underline ml-1" to="/register">
                                Regístrate
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;