export type UserWishlistProductImage = {
	path: string
	url: string
}

export type UserWishlistProduct = {
	id: number
	name: string
	slug?: string
	price: string
	images?: UserWishlistProductImage[]
}

export type UserWishlistItemOptions = Record<string, string>

export type UserWishlistItem = {
	id: number
	wishlist_id: number
	canvas_product_id: number
	options: UserWishlistItemOptions | null
	created_at: string
	updated_at: string
	canvas_product?: UserWishlistProduct | null
}
