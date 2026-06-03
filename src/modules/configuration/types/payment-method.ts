export type PaymentMethod = {
	id: number | null
	friendly_name: string
	system_name: string
	logo_path: string
	supports_capture: boolean
	supports_refund: boolean
	supports_partial_refund: boolean
	supports_void: boolean
	supports_recurring: boolean
	display_order: number
	is_active: boolean
}

export type PaymentMethodPayload = Omit<PaymentMethod, 'id'>
