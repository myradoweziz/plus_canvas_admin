import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Permissions = () => import('./pages/Permissions.vue')
const Roles = () => import('./pages/Roles.vue')
const Users = () => import('./pages/Users.vue')
const UserFormPage = () => import('./pages/UserFormPage.vue')

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
		},
		{
			path: 'users/create',
			component: UserFormPage,
			meta: { title: 'Create User', layout: Layouts.admin }
		},
		{
			path: 'users/:id/edit',
			component: UserFormPage,
			meta: { title: 'Edit User', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
