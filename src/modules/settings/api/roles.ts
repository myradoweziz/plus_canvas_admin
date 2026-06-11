import { getTotal, request } from '@/shared'
import type { Role, RolePayload } from '../types/role'

const ROLES_URL = '/api/admin/roles'

export type ListRolesParams = {
	name?: string
	limit: number
	offset: number
}

export type ListRolesResult = {
	items: Role[]
	total: number
}

type RolePermissionItem = string | { name?: string | null }

const toPermissionNames = (items: RolePermissionItem[] | null | undefined): string[] => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => (typeof item === 'string' ? item : item.name))
		.filter((name): name is string => typeof name === 'string' && name.length > 0)
}

const normalizeRole = (item: any): Role => ({
	id: item?.id ?? null,
	name: String(item?.name ?? ''),
	active: item?.active !== false,
	permissions: toPermissionNames(item?.permissions)
})

function toRolePayload(role: Role): RolePayload {
	return {
		name: role.name.trim(),
		active: !!role.active,
		permissions: role.permissions
	}
}

async function listRoles(params: ListRolesParams): Promise<ListRolesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: ROLES_URL, method: 'GET', params: filteredParams })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	const items = Array.isArray(rawItems) ? rawItems.map(normalizeRole) : []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function createRole(role: Role): Promise<Role> {
	const response = await request({ url: ROLES_URL, method: 'POST', data: toRolePayload(role) })
	return normalizeRole(response?.data ?? response)
}

async function updateRole(role: Role): Promise<Role> {
	const response = await request({
		url: `${ROLES_URL}/${role.id}`,
		method: 'PUT',
		data: toRolePayload(role)
	})
	return normalizeRole(response?.data ?? response)
}

async function deleteRole(id: number): Promise<void> {
	await request({ url: `${ROLES_URL}/${id}`, method: 'DELETE' })
}

export const rolesApi = {
	listRoles,
	createRole,
	updateRole,
	deleteRole
}
