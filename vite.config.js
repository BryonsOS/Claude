import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-180.png'],
      manifest: {
        name: 'ChoreFamily',
        short_name: 'ChoreFamily',
        description: 'Build habits. Earn rewards. Together.',
        theme_color: '#0f0a23',
        background_color: '#0f0a23',
        display: 'standalone',
        orientation: 'portrait',
        scope: process.env.VITE_BASE_PATH || '/',
        start_url: process.env.VITE_BASE_PATH || '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff,woff2}'],
        runtimeCaching: [
          {
            // HTML entry — always fetch fresh so updates load immediately
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'chorefamily-html',
              networkTimeoutSeconds: 5,
            },
          },
          {
            // JS/CSS — serve from cache, update in background
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'chorefamily-assets',
            },
          },
          {
            // Images/fonts — cache first, fine for static assets
            urlPattern: ({ request }) =>
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'chorefamily-media',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
