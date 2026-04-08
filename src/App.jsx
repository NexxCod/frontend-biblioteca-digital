import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ModernLoginPage from "./pages/ModernLoginPage";
import ModernRegisterPage from "./pages/ModernRegisterPage";

const HomePage = lazy(() => import("./pages/LibraryHomePage"));
const AdminPage = lazy(() => import("./pages/ModernAdminPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ModernForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ModernResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="page-shell flex min-h-screen items-center justify-center">
          <div className="glass-panel rounded-[28px] px-8 py-6 text-lg">
            Cargando página...
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<ModernLoginPage />} />
        <Route path="/register" element={<ModernRegisterPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/folder/:folderId"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="page-shell flex min-h-screen items-center justify-center">
              <div className="glass-panel rounded-[30px] px-8 py-10 text-center">
                <span className="eyebrow">404</span>
                <h1 className="mt-4 text-4xl text-[var(--text-main)]">
                  Página no encontrada
                </h1>
                <p className="mt-3 max-w-md text-sm text-[var(--text-muted)]">
                  La ruta que intentaste abrir no existe o cambió durante el rediseño.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
