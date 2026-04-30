import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Brands = () => import('./pages/Brands.vue')

const moduleRoute = {
	path: '/brands',
	component: Module,
	children: [
		{
			path: '',
			component: Brands,
			meta: { title: 'Brands', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

