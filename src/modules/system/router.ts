import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const ActivityLog = () => import('./pages/ActivityLog.vue')
const SystemWarnings = () => import('./pages/SystemWarnings.vue')

const moduleRoute = {
	path: '/admin-panel/system',
	component: Module,
	children: [
		{
			path: '',
			redirect: 'activity-log'
		},
		{
			path: 'activity-log',
			component: ActivityLog,
			meta: { title: 'Лог активности', layout: Layouts.admin }
		},
		{
			path: 'system-warnings',
			component: SystemWarnings,
			meta: { title: 'Системные уведомления', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
