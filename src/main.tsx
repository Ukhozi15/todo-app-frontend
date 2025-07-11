import React, { useState, useMemo, useEffect } from "react"; // Importa useState, useMemo y useEffect
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// --- NUEVAS IMPORTACIONES: ThemeProvider y CssBaseline ---
import { ThemeProvider, CssBaseline } from '@mui/material';
import getAppTheme from "./styles/theme"; // Importa la FUNCIÓN que crea el tema
// --- FIN NUEVAS IMPORTACIONES ---

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Register from "./pages/register";
import EditTask from "./pages/editTask";

// --- Importación del registro del Service Worker ---
import { registerSW } from 'virtual:pwa-register'; // VitePWA proporciona este helper
// --- Fin importación del registro ---

// Componente Wrapper para manejar el tema y registrar el SW
const AppWrapper: React.FC = () => {
  // Estado para el modo del tema (light o dark)
  // Inicialmente, intenta leer del localStorage, si no, usa 'light' por defecto
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Asegura que 'themeMode' exista en localStorage y sea 'dark', si no, usa 'light'
    const savedMode = localStorage.getItem('themeMode');
    return savedMode === 'dark' ? 'dark' : 'light';
  });

  // Usa useMemo para memoizar el objeto del tema. Solo se recalcula si el modo cambia.
  const appTheme = useMemo(() => getAppTheme(mode), [mode]);

  // Esta función se pasará a los componentes hijos para que puedan alternar el tema
  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); // Guarda la preferencia en localStorage
      return newMode;
    });
  }, []);

  // --- REGISTRO DEL SERVICE WORKER ---
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Opcional: Mostrar un mensaje al usuario para recargar si hay una nueva versión de la PWA
        console.log('New content available, please refresh.');
        // alert('New app version available. Please refresh the page!');
      },
      onOfflineReady() {
        console.log('App is ready to work offline!');
        // alert('You can now use the app offline!');
      },
      onRegistered(registration) {
        console.log('Service Worker registered!', registration);
      },
      onRegisterError(error) {
        console.error('Service Worker registration failed:', error);
      }
    });

    // Para forzar una actualización del Service Worker si es necesario
    // updateSW(); // Descomentar si necesitas forzar actualizaciones en ciertas condiciones

  }, []); // Se ejecuta solo una vez al montar AppWrapper
  // --- FIN REGISTRO DEL SERVICE WORKER ---


  return (
    // ThemeProvider aplica el tema a toda la aplicación
    <ThemeProvider theme={appTheme}>
      {/* CssBaseline reinicia los estilos CSS del navegador y aplica los estilos base del tema */}
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Pasa la función toggleColorMode como prop al Dashboard */}
          <Route path="/dashboard" element={<Dashboard toggleColorMode={toggleColorMode} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit-task" element={<EditTask />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper /> {/* Renderiza el nuevo componente AppWrapper */}
  </React.StrictMode>
);