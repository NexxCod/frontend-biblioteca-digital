import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    // Muestra un indicador de carga mientras se verifica la autenticación inicial
    return <div className="flex justify-center items-center h-screen">Verificando autenticación...</div>;
  }

  if (!isLoggedIn) {
    // Si no está logueado después de cargar, redirige a login
    // 'replace' evita que el usuario pueda volver a la página protegida con el botón "atrás"
    return <Navigate to="/login" replace />;
  }

  // Si está logueado, renderiza el componente hijo (la página protegida)
  // Si usas <ProtectedRoute><HomePage/></ProtectedRoute> -> children es HomePage
  // Si usas <Route element={<ProtectedRoute><Outlet/></ProtectedRoute>} -> children es Outlet
  // Usaremos Outlet para un layout anidado más adelante, pero funciona igual para children
  return children ? children : <Outlet />;
}

export default ProtectedRoute;