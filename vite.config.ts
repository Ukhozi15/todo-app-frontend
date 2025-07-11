import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Activa la PWA y su registro.
      registerType: 'autoUpdate',
      
      // Opciones para que funcione en desarrollo y puedas probarla.
      devOptions: {
        enabled: true,
      },

      // Configuración del Manifest de la PWA.
      // Este objeto genera el archivo manifest.json.
      manifest: {
        name: 'Jocias To-Do App',
        short_name: 'ToDo App',
        description: 'A powerful To-Do list application with offline-first capabilities.',
        theme_color: '#1a237e', // Un color oscuro para la barra de título
        background_color: '#ffffff', // Color de fondo para la pantalla de bienvenida (splash screen)
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon192x192.png', // Ruta relativa a la carpeta 'public'
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon512x512.png', // Ruta relativa a la carpeta 'public'
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-maskable-512x512.png', // Icono "maskable" para diferentes formas
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        // Capturas de pantalla para una mejor experiencia de instalación.
        screenshots: [
            {
              src: "/screenshots/captura12.png", // Ruta relativa a la carpeta 'public'
              type: "image/png",
              sizes: "540x720",
              form_factor: "narrow"
            }
        ]
      },

      // Configuración del Service Worker con Workbox.
      workbox: {
        // No dejes que el service worker controle estas rutas.
        navigateFallbackDenylist: [/^\/api/],
        
        // Reglas de caché para diferentes tipos de recursos.
        runtimeCaching: [
          {
            // Estrategia para la API de tareas: Intenta la red primero.
            urlPattern: ({ url }) => url.origin === 'http://localhost:5000' && url.pathname.startsWith('/api/tasks'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-tasks-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              // Configuración para la sincronización en segundo plano.
              backgroundSync: {
                name: 'tasks-queue', // Nombre de la cola
                options: {
                  maxRetentionTime: 24 * 60, // Reintentar por 24 horas
                },
              },
            },
            method: 'GET', // Aplica esta estrategia solo a peticiones GET
          },
          {
            // Estrategia para fuentes de Google: Caché primero para velocidad.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
          {
            // Estrategia para los archivos de las fuentes: Caché primero.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
        ],
      },
    }),
  ],
});
