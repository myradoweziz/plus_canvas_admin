import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Colors = () => import('./pages/Colors.vue')

const moduleRoute = {
	path: '/colors',
	component: Module,
	children: [
		{
			path: '',
			component: Colors,
			meta: { title: 'Colors', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

