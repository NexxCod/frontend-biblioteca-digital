import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
    const navigate = useNavigate();
    // Usamos register, isLoggedIn, isLoading del contexto
    const { register, isLoggedIn, isLoading } = useAuth();

    // Estados para los campos del formulario y errores
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirigir si el usuario ya está logueado
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/'); // Redirige a la página principal
        }
    }, [isLoggedIn, navigate]);

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpia errores anteriores

        if (!username || !email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (password.length < 6) {
             setError('La contraseña debe tener al menos 6 caracteres.');
             return;
        }

        try {
            const success = await register(username, email, password); // Llama a register del contexto
            if (success) {
                console.log("Registro y login automático exitosos!");
                navigate('/'); // Redirige a la página principal después del registro/login
            }
        } catch (err) {
            console.error("Error capturado en RegisterPage:", err);
             // Muestra el mensaje de error del backend (ej: "email ya existe") o uno genérico
            setError(err.message || 'Error durante el registro. Intenta de nuevo.');
        }
    };

     // Si aún está cargando la verificación inicial (aunque menos probable llegar aquí sin estar logueado)
     if (isLoading && !isLoggedIn) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    // Si ya está logueado, no mostramos el formulario (useEffect redirige)
    if (isLoggedIn) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800">Crear Cuenta</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="username">Nombre de Usuario</label>
                            <input
                                type="text"
                                placeholder="Tu nombre de usuario"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                            />
                        </div>
                        <div className="mt-4">
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
                                placeholder="Contraseña (mín. 6 caracteres)"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                                minLength="6"
                            />
                        </div>
                        {/* Mostrar mensaje de error si existe */}
                        {error && (
                            <div className="mt-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex items-baseline justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </div>
                         <div className="mt-6 text-grey-dark text-center">
                            ¿Ya tienes cuenta?
                            <Link className="text-blue-600 hover:underline ml-1" to="/login">
                                Inicia sesión
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;