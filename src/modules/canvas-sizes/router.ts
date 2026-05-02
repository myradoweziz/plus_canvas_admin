import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const CanvasSizes = () => import('./pages/CanvasSizes.vue')

const moduleRoute = {
	path: '/canvas-sizes',
	component: Module,
	children: [
		{
			path: '',
			component: CanvasSizes,
			meta: { title: 'Canvas Sizes', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

