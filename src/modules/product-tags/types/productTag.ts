export type ProductTag = {
	id: number | null
	name: string
	slug: string
	products_count?: number
}

export type ProductTagPayload = Omit<ProductTag, 'id' | 'products_count'>
