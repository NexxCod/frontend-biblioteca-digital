import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (!email) {
            setError('Por favor, ingresa tu correo electrónico.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authService.forgotPassword(email);
            setMessage(response.message || 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.');
            setEmail('');
        } catch (err) {
            setError(err.message || 'Ocurrió un error. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800">Restablecer Contraseña</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
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
                        {message && <div className="mt-4 text-center text-green-600 bg-green-50 p-2 rounded-md text-sm">{message}</div>}
                        {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">{error}</div>}
                        <div className="flex items-baseline justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Enlace'}
                            </button>
                        </div>
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

export default ForgotPasswordPage;