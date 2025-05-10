// src/App.jsx
import React, { Suspense, lazy } from 'react'; // Importa Suspense y lazy
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

// DEFINE los componentes lazy fuera de la función App
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function App() {
  return (
    // ENVUELVE tus Routes con Suspense y define un fallback
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-xl">Cargando página...</div>}>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Rutas Protegidas para HomePage */}
        <Route
          path="/" // Ruta raíz
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/folder/:folderId" // Ruta para carpetas específicas
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Ruta Protegida para Administración */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      <Route
          path="/profile" // O la ruta que prefieras para el perfil
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />


        {/* Ruta Catch-all */}
        <Route path="*" element={
          <div className="flex justify-center items-center h-screen text-xl">
            Página no encontrada (404)
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;