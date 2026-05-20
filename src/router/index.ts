import { loadLayoutMiddleware } from '@/router/middleware/loadLayout.middleware'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuth } from '@/stores/auth'
import { useCookies } from 'vue3-cookies'

const ADMIN_PREFIX = '/admin-panel'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		redirect: `${ADMIN_PREFIX}`
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior() {
		return { top: 0 }
	}
})

router.beforeEach(loadLayoutMiddleware)

router.beforeEach(async (to) => {
	const { cookies } = useCookies()
	const auth = useAuth()

	if (!auth.isAuth && cookies.get('plus_canvas_admin_authorization')) {
		await auth.getProfile()
	}

	if (!auth.isAuth && !to.meta.noAuth && to.path !== `${ADMIN_PREFIX}/login`) {
		return `${ADMIN_PREFIX}/login`
	}

	document.title = (to.meta?.title as string) || 'Plus Canvas Admin'
})

export default router
