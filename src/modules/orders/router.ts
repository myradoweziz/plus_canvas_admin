import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')

const Orders = () => import('./pages/Orders.vue')
const OrderDetail = () => import('./pages/OrderDetail.vue')
const Carts = () => import('./pages/Carts.vue')

const moduleRoute = {
	path: '/admin-panel/',
	component: Module,
	children: [
		{
			path: 'orders',
			component: Orders,
			meta: { title: 'Orders', layout: Layouts.admin }
		},
		{
			path: 'orders/:id',
			component: OrderDetail,
			meta: { title: 'Order', layout: Layouts.admin }
		},
		{
			path: 'carts',
			component: Carts,
			meta: { title: 'Carts', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
