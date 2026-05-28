import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')

const Orders = () => import('./pages/Orders.vue')
const OrderDetail = () => import('./pages/OrderDetail.vue')
const Carts = () => import('./pages/Carts.vue')
const Wishlists = () => import('./pages/Wishlists.vue')
const Bestsellers = () => import('./pages/Bestsellers.vue')
const NeverPurchased = () => import('./pages/NeverPurchased.vue')
const CountryReport = () => import('./pages/CountryReport.vue')

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
		},
		{
			path: 'wishlists',
			component: Wishlists,
			meta: { title: 'Wishlists', layout: Layouts.admin }
		},
		{
			path: 'bestsellers',
			component: Bestsellers,
			meta: { title: 'Bestsellers', layout: Layouts.admin }
		},
		{
			path: 'never-purchased',
			component: NeverPurchased,
			meta: { title: 'Never Purchased', layout: Layouts.admin }
		},
		{
			path: 'country-report',
			component: CountryReport,
			meta: { title: 'Country Report', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
