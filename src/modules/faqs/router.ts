import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Faqs = () => import('./pages/Faqs.vue')

const moduleRoute = {
	path: '/admin-panel/faqs',
	component: Module,
	children: [
		{
			path: '',
			component: Faqs,
			meta: { title: 'FAQs', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
