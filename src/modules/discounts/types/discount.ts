export type Discount = {
	id: number | null
	title: string
	description: string
	image_url?: string
	image?: File | null
	is_active: boolean
	order: number
}

