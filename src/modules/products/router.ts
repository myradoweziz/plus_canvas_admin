import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Products = () => import('./pages/Products.vue')
const ProductForm = () => import('./components/ProductCreateModal.vue')

const moduleRoute = {
	path: '/products',
	component: Module,
	children: [
		{
			path: '',
			component: Products,
			meta: { title: 'Products', layout: Layouts.admin }
		},
		{
			path: 'create',
			component: ProductForm,
			meta: { title: 'Create Product', layout: Layouts.admin }
		},
		{
			path: ':id/edit',
			component: ProductForm,
			meta: { title: 'Edit Product', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
