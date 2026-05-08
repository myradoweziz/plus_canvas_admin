import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Profile = () => import('./pages/Profile.vue')

const moduleRoute = {
	path: '/admin-panel/profile',
	component: Module,
	children: [
		{
			path: '',
			component: Profile,
			meta: { title: 'Профиль', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
