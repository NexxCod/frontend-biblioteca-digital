import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ChangePasswordForm from "../components/Profile/ChangePasswordForm"; // Asegúrate que la ruta sea correcta
import { useAuth } from "../contexts/AuthContext";

// Icono para el botón de Logout (puedes tenerlo en un archivo de iconos común)
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

// Función para formatear la fecha (puedes usar una librería como date-fns si prefieres algo más robusto)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      // Ajusta el locale según necesites
      year: "numeric",
      month: "long",
      day: "numeric",
      // hour: '2-digit', // Descomenta si quieres la hora
      // minute: '2-digit',
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return dateString; // Devuelve el string original si falla
  }
};

function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirige a login después de cerrar sesión
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-700">Cargando perfil...</div>
      </div>
    );
  }

  // ProtectedRoute (o VerifiedRoute) ya debería haber manejado el caso de !user
  // o si el email no está verificado. Si llegamos aquí, user debería existir y estar verificado.
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600 mb-4">
          Usuario no encontrado. Debes iniciar sesión.
        </p>
        <Link
          to="/login"
          className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  // Asumimos que user.groups es un array de objetos con { _id, name }
  // Esto depende de cómo se popule 'groups' en tu endpoint /api/users/me
  const groupNames =
    user.groups && user.groups.length > 0
      ? user.groups.map((group) => group.name).join(", ")
      : "Ninguno";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera de la página de perfil */}
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Aquí puedes ver tus datos y gestionar tu cuenta.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12L12 3l9 9" />
                  <path d="M9 21V12h6v9" />
                </svg>
                Volver al Inicio
              </Link>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogoutIcon />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Información de la Cuenta
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Nombre de usuario
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.username}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Correo electrónico
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.email}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                  {user.role}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Grupos</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {groupNames}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Miembro desde
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              {/* Ya no mostramos isEmailVerified aquí, asumiendo que ya está verificado */}
            </dl>
          </div>
        </div>

        {/* Formulario para Cambiar Contraseña */}
        <ChangePasswordForm />
      </div>
    </div>
  );
}

export default ProfilePage;
