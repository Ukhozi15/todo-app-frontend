import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Jocias To-Do App',
        short_name: 'ToDo App',
        description: 'A powerful To-Do list application with offline-first capabilities.',
        theme_color: '#1a237e',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
            {
              src: "/screenshots/captura12.png",
              type: "image/png",
              sizes: "540x720",
              form_factor: "narrow"
            }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // CORRECCIÓN: Se usa una expresión regular más segura para la URL de la API.
            urlPattern: /^http:\/\/localhost:5000\/api\/tasks/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-tasks-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 día
              },
              backgroundSync: {
                name: 'tasks-queue',
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
            method: 'GET',
          },
        ],
      },
    }),
  ],
});
