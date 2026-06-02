export type Store = {
	id: number | null
	name: string
	url: string
	ssl_enabled: boolean
	secure_url: string
	hosts: string
	display_order: number
	company_name: string
	company_address: string
	company_phone: string
	company_vat: string
}

export type StorePayload = Omit<Store, 'id'>

