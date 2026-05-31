import type { Role } from '../types/role'

export const ROLES_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'system_name', label: 'System name' },
	{ key: 'active', label: 'Опубликован' },
	{ key: 'permissions', label: 'Права' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right', cellClass: 'text-right' }
]

export const createEmptyRole = (): Role => ({
	id: null,
	name: '',
	system_name: '',
	free_shipping: false,
	tax_exempt: false,
	active: true,
	is_system_role: false,
	purchased_with_product: 0,
	permissions: []
})
