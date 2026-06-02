export type ShippingProvider = {
	id: number | null
	friendly_name: string
	system_name: string
	logo_path: string
	display_order: number
	is_active: boolean
}

export type ShippingProviderPayload = Omit<ShippingProvider, 'id'>
