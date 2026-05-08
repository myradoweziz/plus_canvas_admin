import router from '@/router'
import axios from 'axios'
import { useCookies } from 'vue3-cookies'

const { cookies } = useCookies()
const ADMIN_PREFIX = '/admin-panel'

axios.interceptors.response.use(
	(response) => response,

	(error) => {
		const status = error?.response?.status

		if (status === 401) {
			cookies.remove('plus_canvas_admin_authorization')

			const currentPath = router.currentRoute.value?.path

			if (currentPath !== `${ADMIN_PREFIX}/login`) {
				router.push(`${ADMIN_PREFIX}/login`)
			}
		}

		return Promise.reject(error)
	}
)
