export type User = {
	id: number | null
	name: string
	first_name?: string
	last_name?: string
	admin_comment?: string
	is_tax_exempt: boolean
	email: string
	phone_number?: string
	is_active: boolean
	created_at?: string
	last_activity_at?: string
	password?: string
	password_confirmation?: string
	roles: string[]
}

export type UserPayload = Omit<User, 'id'>

export type SendUserEmailPayload = {
	subject: string
	message: string
}

export type SendUserMessagePayload = {
	subject: string
	message: string
}
