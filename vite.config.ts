import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', // Permite despliegue estático en GitHub Pages, Vercel o Netlify
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'images/xiaomi_logo.png', 'images/salesland_logo.png'],
      manifest: {
        name: 'Brand Spaces Retail Audit PWA',
        short_name: 'BrandAudit',
        description: 'PWA de auditoría de espacios y planogramas de retail para promotores y GPVs',
        theme_color: '#072431',
        background_color: '#072431',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB para empaquetar Three.js y ExcelJS en cache offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ]
})
