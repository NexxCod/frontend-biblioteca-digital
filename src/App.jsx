import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute'; // Importa el protector

function App() {
  return (
    // El AuthProvider ya envuelve esto en main.jsx
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Protegidas */}
      <Route
        path="/" // Ruta principal/dashboard
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Puedes añadir más rutas protegidas aquí dentro de otros <ProtectedRoute> */}
      {/* Ejemplo: <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}

      {/* Ruta Catch-all (Opcional - para páginas no encontradas) */}
      <Route path="*" element={<div>Página no encontrada (404)</div>} />

      {/* **NUEVA RUTA PROTEGIDA PARA ADMINISTRACIÓN** */}
       {/* Esta ruta debería ser accesible solo para admins.
           Puedes añadir una verificación de rol dentro de AdminPage
           o crear un ProtectedRoute más específico (ej: AdminRoute) */}
      <Route
        path="/admin/*" // Usamos /* para rutas anidadas dentro de /admin
        element={
          <ProtectedRoute>
             {/* Podrías pasar el usuario para verificación de rol interna */}
            <AdminPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;