import { getTotal, request } from '@/shared'
import type { Permission, PermissionPayload } from '../types/permission'

const PERMISSIONS_URL = '/api/admin/permissions'

export type ListPermissionsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListPermissionsResult = {
	items: Permission[]
	total: number
}

async function listPermissions(params: ListPermissionsParams): Promise<ListPermissionsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: PERMISSIONS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toPermissionPayload(permission: Permission): PermissionPayload {
	return { name: permission.name }
}

async function createPermission(permission: Permission): Promise<Permission> {
	return await request({ url: PERMISSIONS_URL, method: 'POST', data: toPermissionPayload(permission) })
}

async function updatePermission(permission: Permission): Promise<Permission> {
	return await request({
		url: `${PERMISSIONS_URL}/${permission.id}`,
		method: 'PUT',
		data: toPermissionPayload(permission)
	})
}

async function deletePermission(id: number): Promise<void> {
	await request({ url: `${PERMISSIONS_URL}/${id}`, method: 'DELETE' })
}

export const permissionsApi = {
	listPermissions,
	createPermission,
	updatePermission,
	deletePermission
}

