export type Permission = {
	id: number | null
	name: string
}

export type PermissionPayload = Omit<Permission, 'id'>

