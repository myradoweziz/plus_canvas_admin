type RoleItem = string | { name?: string | null; permissions?: unknown }

const SUPER_ADMIN_ROLE_NAMES = new Set(['superadmin', 'admin', 'super admin'])

const toRoleNames = (items: RoleItem[] | null | undefined): string[] => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => (typeof item === 'string' ? item : item?.name))
		.filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
}

const toPermissionNames = (items: unknown): string[] => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => {
			if (typeof item === 'string') return item
			if (item && typeof item === 'object' && 'name' in item) {
				return String((item as { name?: unknown }).name ?? '')
			}
			return ''
		})
		.filter((name) => name.trim().length > 0)
}

export const normalizeUserRoles = (payload: Record<string, unknown> | null | undefined): string[] => {
	if (!payload) return []

	const user = payload.user as { roles?: RoleItem[] } | undefined

	return toRoleNames((payload.roles as RoleItem[] | undefined) ?? user?.roles)
}

export const normalizeUserPermissions = (payload: Record<string, unknown> | null | undefined): string[] => {
	if (!payload) return []

	const direct = [
		...toPermissionNames(payload.permissions),
		...toPermissionNames(payload.all_permissions),
		...toPermissionNames((payload.user as { permissions?: unknown } | undefined)?.permissions)
	]

	const rolePermissions = Array.isArray(payload.roles)
		? payload.roles.flatMap((role) =>
				typeof role === 'object' && role !== null ? toPermissionNames((role as { permissions?: unknown }).permissions) : []
			)
		: []

	return [...new Set([...direct, ...rolePermissions])]
}

export const isSuperAdminRole = (roles: string[]) =>
	roles.some((role) => SUPER_ADMIN_ROLE_NAMES.has(role.trim().toLowerCase()))

export const canAccessPermission = (
	permission: string | string[] | undefined,
	userPermissions: string[],
	roles: string[]
) => {
	if (!permission) return true
	if (isSuperAdminRole(roles)) return true
	if (userPermissions.includes('*')) return true

	const required = Array.isArray(permission) ? permission : [permission]
	return required.some((item) => userPermissions.includes(item))
}
