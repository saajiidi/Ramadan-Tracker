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
                id: '/', 
                name: 'Ramadan Compass', 
                short_name: 'Compass', 
                description: 'Super Lightweight Ramadan Compass', 
                start_url: '/', 
                scope: '/', 
                theme_color: '#050505', 
                background_color: '#050505', 
                display: 'standalone', 
                icons: [ 
                    { 
                        src: 'logo.svg', 
                        sizes: '192x192', 
                        type: 'image/svg+xml', 
                        purpose: 'any maskable' 
                    }, 
                    { 
                        src: 'logo.svg', 
                        sizes: '512x512', 
                        type: 'image/svg+xml', 
                        purpose: 'any maskable' 
                    } 
                ] 
            } 
        }) 
    ], 
})
