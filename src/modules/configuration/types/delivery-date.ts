export type DeliveryDate = {
	id: number | null
	name: string
	display_order: number
}

export type DeliveryDatePayload = Omit<DeliveryDate, 'id'>
