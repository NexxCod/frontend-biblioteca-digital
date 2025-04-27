// src/pages/AdminPage.jsx
import React from 'react';
import { Routes, Route, Link, useMatch } from 'react-router-dom'; // Importar para rutas anidadas y navegación
import { useAuth } from '../contexts/AuthContext'; // Para verificar el rol del usuario

// Importar componentes de gestión (los crearemos a continuación)
import UserManagement from '../components/Admin/UserManagement';
import GroupManagement from '../components/Admin/GroupManagement';
import TagManagement from '../components/Admin/TagManagement';


function AdminPage() {
    const { user, isLoading: isAuthLoading } = useAuth(); // Obtener usuario y estado de carga
    // useMatch ayuda a determinar si estamos en una ruta "activa"
    const match = useMatch("/admin/*"); // Verifica si la ruta actual coincide con /admin o subrutas

    // Si la autenticación aún está cargando, mostrar un mensaje
    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-screen">Cargando información de usuario...</div>;
    }

    // Si el usuario no es admin, redirigir o mostrar mensaje de acceso denegado
    // Esto es una capa de seguridad adicional, ya que la ruta ya está protegida,
    // pero asegura que la UI refleje la falta de permisos.
    if (!user || user.role !== 'admin') {
        // Podrías usar navigate('/home') o un componente de acceso denegado
        return (
             <div className="flex justify-center items-center h-screen text-red-600">
                 Acceso denegado. No tienes permisos de administrador.
             </div>
        );
    }

    // Si el usuario es admin, renderizar la página de administración
    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Panel de Administración</h1>

            {/* Menú de Navegación de Admin */}
            <nav className="mb-6">
                <ul className="flex space-x-4 border-b pb-2">
                    <li>
                         {/* Usa Link para la navegación interna */}
                        <Link
                            to="/admin/users"
                            className="text-blue-600 hover:underline"
                            // Puedes añadir lógica para resaltar el enlace activo si lo deseas
                        >
                            Gestión de Usuarios
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/groups" className="text-blue-600 hover:underline">
                            Gestión de Grupos
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/tags" className="text-blue-600 hover:underline">
                            Gestión de Etiquetas
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Área de Contenido de Admin (Rutas Anidadas) */}
            {/* Renderiza los componentes de gestión según la ruta anidada */}
            <Routes>
                 {/* Las rutas anidadas no necesitan la ruta padre completa si están dentro de un <Routes>
                     que se renderiza en una ruta padre */}
                <Route path="users" element={<UserManagement />} />
                <Route path="groups" element={<GroupManagement />} />
                <Route path="tags" element={<TagManagement />} />

                {/* Ruta por defecto o dashboard inicial de admin (opcional) */}
                <Route path="/" element={<div>Selecciona una opción del menú.</div>} />
            </Routes>
        </div>
    );
}

export default AdminPage;