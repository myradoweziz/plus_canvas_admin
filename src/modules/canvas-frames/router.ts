import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const CanvasFrames = () => import('./pages/CanvasFrames.vue')

const moduleRoute = {
	path: '/admin-panel/canvas-frames',
	component: Module,
	children: [
		{
			path: '',
			component: CanvasFrames,
			meta: { title: 'Canvas Frames', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}

