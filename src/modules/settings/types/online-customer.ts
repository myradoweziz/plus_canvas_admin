export type OnlineCustomer = {
	id: number
	name: string
	email: string
	phone_number: string | null
	is_active: boolean
	created_at: string
	updated_at: string
	last_activity_at: string | null
	first_name: string | null
	last_name: string | null
	ip_address: string | null
}
