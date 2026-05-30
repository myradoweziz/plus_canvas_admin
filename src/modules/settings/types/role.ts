export type Role = {
	id: number | null
	name: string
	system_name: string
	free_shipping: boolean
	tax_exempt: boolean
	active: boolean
	is_system_role: boolean
	purchased_with_product: number
	permissions: string[]
}

export type RolePayload = Omit<Role, 'id'>
