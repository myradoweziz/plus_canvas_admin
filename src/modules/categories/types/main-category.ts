export type CategoryType = 'Kişiye Özel Kanvas Tablo' | 'Tablo  Kanvas Tablo Galerisi'

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
