export type Role = {
	id: number | null
	name: string
	active: boolean
	permissions: string[]
}

export type RolePayload = Omit<Role, 'id'>
