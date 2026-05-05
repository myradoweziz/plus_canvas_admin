export type Role = {
	id: number | null
	name: string
	permissions: string[]
}

export type RolePayload = Omit<Role, 'id'>

