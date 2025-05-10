import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para enlace a registro y redirección
import { useAuth } from '../contexts/AuthContext'; // Nuestro hook de autenticación
import authService from '../services/authService'; 

function LoginPage() {
    // Hook para navegar después del login
    const navigate = useNavigate();
    // Obtenemos lo que necesitamos del contexto de autenticación
    const { login, isLoggedIn, isLoading, user } = useAuth();

    // Estados locales para el formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [resendError, setResendError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    // Redirigir si el usuario ya está logueado
    useEffect(() => {
        if (isLoggedIn) {
            console.log("Usuario ya logueado, redirigiendo...", user);
            // Redirige a la página principal (ej: '/') o a un dashboard
            navigate('/');
        }
    }, [isLoggedIn, navigate, user]); // Dependencias del efecto

    const handleResendVerification = async () => {
        if (!email) {
            setResendError('Ingresa tu correo electrónico para reenviar la verificación.');
            return;
        }
        setIsResending(true);
        setResendError('');
        setResendMessage('');
        try {
            const response = await authService.resendVerificationEmail(email);
            setResendMessage(response.message || 'Se ha enviado un nuevo correo de verificación.');
            setShowResendVerification(false); // Ocultar opción después de reenviar
        } catch (err) {
            setResendError(err.message || 'No se pudo reenviar el correo de verificación.');
        } finally {
            setIsResending(false);
        }
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene la recarga de la página
        setError(''); // Limpia errores anteriores
        setResendError('');
        setResendMessage('');
        setShowResendVerification(false);

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
            const errorMessage = err.message || 'Error al iniciar sesión. Verifica tus credenciales.';
            setError(errorMessage);

            // AQUÍ LA LÓGICA CORREGIDA:
            // Verifica si el mensaje de error del backend indica que el correo necesita verificación.
            // Ajusta la condición según el mensaje exacto que devuelve tu backend.
            if (errorMessage.toLowerCase().includes('verifica tu correo') || 
                errorMessage.toLowerCase().includes('email no verificado') ||
                (err.response?.data?.needsVerification === true) // Si tu backend envía una bandera específica
            ) {
                setShowResendVerification(true);
            }
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
                        
                        {error && (
                            <div className="mt-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {/* Sección para reenviar verificación */}
                        {showResendVerification && ( // Mostrar siempre si showResendVerification es true
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                {!resendMessage && ( // Solo mostrar el botón si no hay mensaje de éxito de reenvío
                                 <>
                                    <p className="text-sm text-yellow-700 mb-2">
                                        Tu correo electrónico necesita ser verificado.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                        className={`w-full px-4 py-1.5 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none ${isResending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isResending ? 'Reenviando...' : 'Reenviar Correo de Verificación'}
                                    </button>
                                 </>
                                )}
                                {resendError && <p className="text-xs text-red-500 mt-1">{resendError}</p>}
                            </div>
                        )}
                        {resendMessage && ( // Mostrar el mensaje de éxito de reenvío si existe
                             <div className="mt-4 text-center text-green-600 bg-green-50 p-2 rounded-md text-sm">
                                {resendMessage}
                            </div>
                        )}

                        <div className="flex items-baseline justify-between">
                            <button
                                type="submit"
                                disabled={isLoading}
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
                         <div className="mt-2 text-center">
                            <Link className="text-sm text-blue-600 hover:underline" to="/forgot-password">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;