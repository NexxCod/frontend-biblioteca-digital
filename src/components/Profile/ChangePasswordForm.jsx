import React, { useState } from "react";
import authService from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

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
        setError("");
        setMessage("");

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError("Completa todos los campos.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (!user) {
            setError("Debes estar logueado para cambiar tu contraseña.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
            setMessage(response.message || "Contraseña actualizada.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setError(err.message || "No se pudo cambiar la contraseña.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="soft-panel rounded-[28px] p-5 sm:p-6">
            <div className="mb-5 border-b border-[var(--line-soft)] pb-4">
                <h3 className="text-xl text-[var(--text-main)]">Cambiar contraseña</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="currentPassword" className="field-label">
                        Contraseña actual
                    </label>
                    <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="app-input"
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="field-label">
                        Nueva contraseña
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="app-input"
                    />
                </div>

                <div>
                    <label htmlFor="confirmNewPassword" className="field-label">
                        Confirmar contraseña
                    </label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="app-input"
                    />
                </div>
                {message && <div className="status-success">{message}</div>}
                {error && <div className="status-error">{error}</div>}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`app-button-primary ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isLoading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default ChangePasswordForm;
