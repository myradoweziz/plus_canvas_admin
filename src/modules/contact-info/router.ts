import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const ContactInfo = () => import('./pages/ContactInfo.vue')

const moduleRoute = {
	path: '/contact-info',
	component: Module,
	children: [
		{
			path: '',
			component: ContactInfo,
			meta: { title: 'Контактная информация', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

