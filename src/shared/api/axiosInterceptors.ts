import router from '@/router'
import axios from 'axios'
import { useCookies } from 'vue3-cookies'

const { cookies } = useCookies()

axios.interceptors.response.use(
	(response) => response,

	(error) => {
		const status = error?.response?.status

		if (status === 401) {
			cookies.remove('plus_canvas_admin_authorization')

			const currentPath = router.currentRoute.value?.path

			if (currentPath !== '/login') {
				router.push('/login')
			}
		}

		return Promise.reject(error)
	}
)
