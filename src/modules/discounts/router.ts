import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Discounts = () => import('./pages/Discounts.vue')

const moduleRoute = {
	path: '/admin-panel/discounts',
	component: Module,
	children: [
		{
			path: '',
			component: Discounts,
			meta: { title: 'Discounts', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
