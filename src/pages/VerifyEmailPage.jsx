import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../services/authService';

function VerifyEmailPage() {
    const { token } = useParams();
    const [message, setMessage] = useState('Verificando tu correo electrónico...');
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            const doVerifyEmail = async () => {
                try {
                    const response = await authService.verifyEmail(token);
                    setMessage(response.message || '¡Correo electrónico verificado con éxito!');
                    setError('');
                } catch (err) {
                    setError(err.message || 'No se pudo verificar el correo electrónico. El enlace puede ser inválido o haber expirado.');
                    setMessage('');
                }
            };
            doVerifyEmail();
        } else {
            setError('Token de verificación no encontrado.');
            setMessage('');
        }
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-10 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Verificación de Correo</h3>
                {message && <p className="text-green-600 text-center mb-4">{message}</p>}
                {error && <p className="text-red-600 text-center mb-4">{error}</p>}
                <div className="text-center mt-6">
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmailPage;