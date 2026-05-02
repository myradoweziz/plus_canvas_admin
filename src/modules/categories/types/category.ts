export type MainCategory = {
	id: number | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
}

export type MainCategoryPayload = Omit<MainCategory, 'id'>

export type FeaturedCategory = {
	id: number | null
	main_category_id: number | null
	main_category?: MainCategory | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
}

export type FeaturedCategoryPayload = Omit<FeaturedCategory, 'id'>

export type SubCategory = {
	id: number | null
	category_id: number | null
	category?: FeaturedCategory | null
	name: string
	slug: string
	is_active: boolean
	featured_order: number
}

export type SubCategoryPayload = Omit<SubCategory, 'id'>
