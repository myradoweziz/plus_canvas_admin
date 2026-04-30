export type Brand = {
	id: number | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
}

export type BrandPayload = Omit<Brand, 'id'>

