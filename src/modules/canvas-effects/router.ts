import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const CanvasEffects = () => import('./pages/CanvasEffects.vue')

const moduleRoute = {
	path: '/admin-panel/canvas-effects',
	component: Module,
	children: [
		{
			path: '',
			component: CanvasEffects,
			meta: { title: 'Canvas Effects', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
