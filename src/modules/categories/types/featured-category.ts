import type { MainCategory } from './main-category'

export type FeaturedCategoryType = 'Öne Çıkan Kategoriler' | 'En Çok Aranan Kategoriler'

export type FeaturedCategory = {
	id: number | null
	main_category_id: number | null
	main_category?: MainCategory | null
	name: string
	slug: string
	description: string
	image: string
	image_url?: string
	is_active: boolean
	featured_order: number
	category_type: FeaturedCategoryType
	meta_title: string
	meta_description: string
	discount: number
}

export type FeaturedCategoryPayload = Omit<FeaturedCategory, 'id'>
