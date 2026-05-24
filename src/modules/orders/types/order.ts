export interface OrderUser {
	id: number
	name: string
	email: string
	email_verified_at?: string | null
	created_at?: string
	updated_at?: string
	phone_number?: string | null
	google_id?: string | null
}

export interface OrderProductImage {
	path: string
	url: string
}

export interface OrderCanvasProduct {
	id: number
	name: string
	slug: string
	price: string
	description?: string
	sku?: string | null
	images: OrderProductImage[]
	inner_images?: OrderProductImage[]
	[key: string]: unknown
}

export interface OrderItemOptions {
	size?: string
	frame?: string
	[key: string]: unknown
}

export interface OrderItem {
	id: number
	order_id: number
	canvas_product_id: number
	quantity: number
	price: string
	total: string
	options?: OrderItemOptions | null
	discount_amount?: string | null
	created_at?: string
	updated_at?: string
	canvas_product?: OrderCanvasProduct
	canvas_products?: OrderCanvasProduct[]
}

export interface OrderShipment {
	id: number
	order_id: number
	tracking_number: string
	total_weight: string
	date_shipped: string
	date_delivered: string | null
	created_at: string
	updated_at: string
}

export interface OrderNote {
	id: number
	order_id: number
	note: string
	display_to_customer: boolean
	attached_file: string | null
	created_at: string
	updated_at: string
}

export interface Order {
	id: number
	order_number: string
	user_id: number
	session_id?: string | null
	first_name: string
	last_name: string
	email: string
	phone: string
	address?: string
	city?: string
	district?: string | null
	postal_code?: string
	address_note?: string | null
	shipping_method?: string
	shipping_cost?: string
	payment_method?: string
	payment_status: string
	delivery_status: string
	order_status: string
	subtotal?: string
	tax?: string
	total: string
	profit?: string
	coupon_code?: string | null
	discount_amount?: string
	discount_name?: string | null
	created_at: string
	updated_at?: string
	deleted_at?: string | null
	ip_address?: string
	transaction_id?: string
	customer_note?: string | null
	company?: string | null
	country?: string
	billing_first_name?: string
	billing_last_name?: string
	billing_email?: string
	billing_phone?: string
	billing_company?: string | null
	billing_address?: string
	billing_city?: string
	billing_district?: string | null
	billing_postal_code?: string | null
	billing_country?: string
	billing_tax_number?: string | null
	billing_tax_office?: string | null
	user?: OrderUser
	items: OrderItem[]
	shipments?: OrderShipment[]
	notes?: OrderNote[]
}
