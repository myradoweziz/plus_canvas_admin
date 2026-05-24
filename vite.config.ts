import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	base: '/admin-panel/',
	plugins: [vue(), tailwindcss()],
	server: {
		host: '0.0.0.0',
		port: 3000
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	build: {
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('@tiptap') || id.includes('prosemirror')) {
							return 'vendor-tiptap'
						}
						if (
							id.includes('vee-validate') ||
							id.includes('@vee-validate') ||
							(id.includes('/zod') && !id.includes('zod-to'))
						) {
							return 'vendor-form'
						}
						if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
							return 'vendor-vue'
						}
					}
				}
			}
		}
	}
})
