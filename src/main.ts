import { createPinia } from 'pinia'
import { createApp } from 'vue'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import App from '@/App.vue'
import router from '@/router'
import '@/router/modules'
import '@/shared/api/axiosInterceptors'
import './assets/styles/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(Vue3Toastify, {
	autoClose: 3000,
	position: 'top-right',
	style: { zIndex: 200000 }
})

app.mount('#app')
