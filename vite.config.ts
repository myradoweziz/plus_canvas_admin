import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	server: {
		host: '0.0.0.0',
		port: 3003
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "./src/assets/styles/style.css";`
			}
		}
	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	}
})
