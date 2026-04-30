export type Category = {
	id: number | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
}

export type CategoryPayload = Omit<Category, 'id'>
