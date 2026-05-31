import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const DiscountLimitations = () => import('./pages/DiscountLimitations.vue')
const DiscountTypes = () => import('./pages/DiscountTypes.vue')

const moduleRoute = {
	path: '/admin-panel/configuration',
	component: Module,
	children: [
		{
			path: '',
			redirect: 'discount-limitations'
		},
		{
			path: 'discount-limitations',
			component: DiscountLimitations,
			meta: { title: 'Ограничения скидок', layout: Layouts.admin }
		},
		{
			path: 'discount-types',
			component: DiscountTypes,
			meta: { title: 'Типы скидок', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
