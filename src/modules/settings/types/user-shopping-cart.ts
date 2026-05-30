export type UserShoppingCartProductImage = {
	path: string
	url: string
}

export type UserShoppingCartProduct = {
	id: number
	name: string
	slug?: string
	price: string
	images?: UserShoppingCartProductImage[]
}

export type UserShoppingCartItemOptions = Record<string, string>

export type UserShoppingCartItem = {
	id: number
	cart_id: number
	canvas_product_id: number
	quantity: number
	options: UserShoppingCartItemOptions | null
	created_at: string
	updated_at: string
	canvas_product?: UserShoppingCartProduct | null
}
