import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de restablecimiento no válido o faltante.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.resetPassword(token, password, confirmPassword);
            setMessage(response.message || 'Contraseña restablecida con éxito. Serás redirigido para iniciar sesión.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'No se pudo restablecer la contraseña. El token puede ser inválido o haber expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800">Ingresa Nueva Contraseña</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="password">Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="Nueva Contraseña"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="Confirmar Contraseña"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                required
                            />
                        </div>
                        {message && <div className="mt-4 text-center text-green-600 bg-green-50 p-2 rounded-md text-sm">{message}</div>}
                        {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">{error}</div>}
                        {!message && ( // Mostrar botón solo si no hay mensaje de éxito
                            <div className="flex items-baseline justify-center">
                                <button
                                    type="submit"
                                    disabled={isLoading || !token}
                                    className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none ${isLoading || !token ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                                </button>
                            </div>
                        )}
                         <div className="mt-6 text-center">
                            <Link className="text-sm text-blue-600 hover:underline" to="/login">
                                Volver a Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage;