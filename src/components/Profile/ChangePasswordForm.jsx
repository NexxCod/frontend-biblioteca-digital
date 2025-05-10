import React, { useState } from 'react';
import authService from '../../services/authService'; // Asumiendo que lo tienes
import { useAuth } from '../../contexts/AuthContext'; // Para obtener el token si es necesario directamente

function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth(); // Para verificar si el usuario está logueado

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (!user) {
            setError('Debes estar logueado para cambiar tu contraseña.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
            setMessage(response.message || 'Contraseña actualizada exitosamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            setError(err.message || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Cambiar Contraseña</h3>
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Contraseña Actual
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        Nueva Contraseña
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                        Confirmar Nueva Contraseña
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="confirmNewPassword"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</div>}
                {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChangePasswordForm;