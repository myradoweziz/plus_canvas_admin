export type ShippingMethod = {
	id: number | null
	name: string
	description: string
	display_order: number
}

export type ShippingMethodPayload = Omit<ShippingMethod, 'id'>

