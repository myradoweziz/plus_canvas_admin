type CategoryType = 'Kişiye Özel Kanvas Tablo' | 'Tablo  Kanvas Tablo Galerisi'
type FeaturedCategoryType = 'Öne Çıkan Kategoriler' | 'En Çok Aranan Kategoriler'

export type MainCategory = {
	id: number | null
	name: string
	slug: string
	description: string
	images: string[]
	is_active: boolean
	featured_order: number
	category_type: CategoryType
	meta_title: string
	meta_description: string
}

export type MainCategoryPayload = Omit<MainCategory, 'id'>

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
