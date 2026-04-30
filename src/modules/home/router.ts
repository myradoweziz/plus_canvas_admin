import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Home = () => import('./pages/Home.vue')

const moduleRoute = {
	path: '/',
	component: Module,
	children: [
		{
			path: '',
			component: Home,
			meta: { title: 'Home', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
