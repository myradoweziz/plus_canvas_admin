import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Stocks = () => import('./pages/Stocks.vue')

const moduleRoute = {
	path: '/admin-panel/stocks',
	component: Module,
	children: [
		{
			path: '',
			component: Stocks,
			meta: { title: 'Stocks', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
