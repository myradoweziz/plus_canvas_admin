const Module = () => import('./Module.vue')

const Login = () => import('./pages/Login.vue')

const moduleRoute = {
	path: '/login',
	component: Module,
	children: [
		{
			path: '',
			component: Login,
			meta: { title: 'Login', noAuth: true }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
