import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true,
                type: 'module'
            },
            includeAssets: ['favicon.svg', 'logo.svg', 'mask-icon.svg'],
            manifest: {
                name: 'Ramadan Compass',
                short_name: 'Ramadan',
                description: 'Elite Spiritual Tracking for the Modern Mu\'min',
                theme_color: '#050505',
                background_color: '#050505',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: 'logo.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: 'mask-icon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    }
                ]
            }
        })
    ],
})
