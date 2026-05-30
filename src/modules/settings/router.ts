import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Permissions = () => import('./pages/Permissions.vue')
const Roles = () => import('./pages/Roles.vue')
const Users = () => import('./pages/Users.vue')
const UsersReport = () => import('./pages/UsersReport.vue')
const UsersReportByCount = () => import('./pages/UsersReportByCount.vue')
const RegisteredCustomersReport = () => import('./pages/RegisteredCustomersReport.vue')
const OnlineCustomers = () => import('./pages/OnlineCustomers.vue')
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
			path: 'users-report',
			component: UsersReport,
			meta: { title: 'Users Report', layout: Layouts.admin }
		},
		{
			path: 'users-report-by-count',
			component: UsersReportByCount,
			meta: { title: 'Users Report By Count', layout: Layouts.admin }
		},
		{
			path: 'registered-customers',
			component: RegisteredCustomersReport,
			meta: { title: 'Registered Customers', layout: Layouts.admin }
		},
		{
			path: 'online-customers',
			component: OnlineCustomers,
			meta: { title: 'Online Customers', layout: Layouts.admin }
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
