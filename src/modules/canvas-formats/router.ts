import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const CanvasFormats = () => import('./pages/CanvasFormats.vue')

const moduleRoute = {
	path: '/canvas-formats',
	component: Module,
	children: [
		{
			path: '',
			component: CanvasFormats,
			meta: { title: 'Canvas Formats', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

