import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Banners = () => import('./pages/Banners.vue')

const moduleRoute = {
	path: '/admin-panel/banners',
	component: Module,
	children: [
		{
			path: '',
			component: Banners,
			meta: { title: 'Banners', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
