import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Categories = () => import('./pages/Categories.vue')

const moduleRoute = {
	path: '/categories',
	component: Module,
	children: [
		{
			path: '',
			component: Categories,
			meta: { title: 'Categories', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
