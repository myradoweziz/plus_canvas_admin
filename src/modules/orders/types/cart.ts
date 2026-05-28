export interface CartItem {
	id: number
	cart_id: number
	canvas_product_id: number
	options: {
		size: string
		frame: string
	}
	canvas_product: {
		id: number
		name: string
		price: string
		slug: string
		images: {
			path: string
			url: string
		}[]
	}
}

export interface Cart {
	id: number | null
	user: {
		id: number
		name: string
		email: string
	}
	items: CartItem[]
	updated_at: string
}
