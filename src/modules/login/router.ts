const Module = () => import('./Module.vue')

const Login = () => import('./pages/Login.vue')
import { Layouts } from '@/layouts/layouts.types'

const moduleRoute = {
	path: '/admin-panel/login',
	component: Module,
	children: [
		{
			path: '',
			component: Login,
			meta: { title: 'Login', noAuth: true, layout: Layouts.empty }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
