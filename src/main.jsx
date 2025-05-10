import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Asegúrate que tus estilos base (Tailwind) estén importados
import { AuthProvider } from './contexts/AuthContext.jsx' // <--- Importa el AuthProvider
import { BrowserRouter } from 'react-router-dom'; // Asumiendo que usarás Router aquí

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
    <BrowserRouter> {/* Envuelve con BrowserRouter para las rutas */}
      <AuthProvider> {/* <--- Envuelve tu App con el AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
 // </React.StrictMode>,
)