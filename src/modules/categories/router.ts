import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const MainCategories = () => import('./pages/MainCategories.vue')
const FeaturedCategories = () => import('./pages/FeaturedCategories.vue')
const SubCategories = () => import('./pages/SubCategories.vue')

const moduleRoute = {
	path: '/admin-panel/categories',
	component: Module,
	children: [
		{
			path: '',
			component: MainCategories,
			meta: { title: 'Main Categories', layout: Layouts.admin }
		},
		{
			path: 'main-categories',
			component: MainCategories,
			meta: { title: 'Main Categories', layout: Layouts.admin }
		},
		{
			path: 'featured-categories',
			component: FeaturedCategories,
			meta: { title: 'Featured Categories', layout: Layouts.admin }
		},
		{
			path: 'sub-categories',
			component: SubCategories,
			meta: { title: 'Sub Categories', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
