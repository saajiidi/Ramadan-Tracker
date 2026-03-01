import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'logo.svg'],
            manifest: {
                name: 'Ramadan Compass',
                short_name: 'Compass',
                description: 'Super Lightweight Ramadan Compass',
                theme_color: '#050505',
                background_color: '#050505',
                display: 'standalone',
                icons: [
                    {
                        src: 'logo.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    }
                ]
            }
        })
    ],
})

