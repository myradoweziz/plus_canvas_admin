import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Permissions = () => import('./pages/Permissions.vue')
const Roles = () => import('./pages/Roles.vue')
const Users = () => import('./pages/Users.vue')

const moduleRoute = {
	path: '/admin-panel/settings',
	component: Module,
	children: [
		{
			path: 'permissions',
			component: Permissions,
			meta: { title: 'Permissions', layout: Layouts.admin }
		},
		{
			path: 'roles',
			component: Roles,
			meta: { title: 'Roles', layout: Layouts.admin }
		},
		{
			path: 'users',
			component: Users,
			meta: { title: 'Users', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
