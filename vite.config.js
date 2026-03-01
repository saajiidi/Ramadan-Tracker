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
                name: 'Ramadan Tracker',
                short_name: 'Ramadan',
                description: 'Super Lightweight Ramadan Tracker',
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

