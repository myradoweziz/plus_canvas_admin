import type { Role } from '../types/role'

export const ROLES_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'active', label: 'Активна' },
	{ key: 'permissions', label: 'Права' },
	{ key: 'actions', label: 'Действия' }
]

export const createEmptyRole = (): Role => ({
	id: null,
	name: '',
	active: true,
	permissions: []
})
