import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const ProductTags = () => import('./pages/ProductTags.vue')

const moduleRoute = {
	path: '/admin-panel/product-tags',
	component: Module,
	children: [
		{
			path: '',
			component: ProductTags,
			meta: { title: 'Теги товаров', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
