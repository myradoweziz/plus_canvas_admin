export type UserAddress = {
	address: string
	city: string
	is_default: boolean
}

export type User = {
	id: number | null
	name: string
	email: string
	phone_number: string
	password?: string
	password_confirmation?: string
	roles: string[]
	addresses: UserAddress[]
}

export type UserPayload = Omit<User, 'id'>
