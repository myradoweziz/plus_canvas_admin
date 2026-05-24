import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Orders = () => import('./pages/Orders.vue')
const OrderDetail = () => import('./pages/OrderDetail.vue')

const moduleRoute = {
	path: '/admin-panel/orders',
	component: Module,
	children: [
		{
			path: '',
			component: Orders,
			meta: { title: 'Orders', layout: Layouts.admin }
		},
		{
			path: ':id',
			component: OrderDetail,
			meta: { title: 'Order', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
