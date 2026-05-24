import type { FeaturedCategory } from './featured-category'

export type SubCategory = {
	id: number | null
	category_id: number | null
	category?: FeaturedCategory | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
	image: string
	image_url?: string
	meta_title: string
	meta_description: string
	discount: number
}

export type SubCategoryPayload = Omit<SubCategory, 'id'>
