import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		cloudflare(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'favicon.png', 'Icon.png', 'logo.png', 'pwa-192.png', 'pwa-512.png'],
			manifest: {
				name: 'PromptWise',
				short_name: 'PromptWise',
				description: 'Ask Better. Learn Better. — AI Literacy and Prompt Engineering Awareness for Students.',
				theme_color: '#4f46e5',
				background_color: '#070b14',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				lang: 'en',
				icons: [
					{
						src: 'pwa-192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				navigateFallback: 'index.html',
				navigateFallbackDenylist: [/^\/api\//],  // never serve index.html for API routes
				// runtimeCaching intentionally empty — Gemini API calls are NOT cached
			},
		}),
	],
})