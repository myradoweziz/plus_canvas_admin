import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const NewsletterSubscribers = () => import('./pages/NewsletterSubscribers.vue')
const Discounts = () => import('./pages/Discounts.vue')
const Coupons = () => import('./pages/Coupons.vue')

const moduleRoute = {
	path: '/admin-panel/promotions',
	component: Module,
	children: [
		{
			path: 'newsletter-subscribers',
			component: NewsletterSubscribers,
			meta: { title: 'Newsletter Subscribers', layout: Layouts.admin }
		},
		{
			path: 'discounts',
			component: Discounts,
			meta: { title: 'Скидки', layout: Layouts.admin }
		},
		{
			path: 'coupons',
			component: Coupons,
			meta: { title: 'Купоны', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
