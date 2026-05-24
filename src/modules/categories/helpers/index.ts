export const CATEGORY_TYPE_OPTIONS = [
	{ label: 'Kişiye Özel Kanvas Tablo', value: 'Kişiye Özel Kanvas Tablo' },
	{ label: 'Tablo Kanvas Tablo Galerisi', value: 'Tablo  Kanvas Tablo Galerisi' }
]

export const FEATURED_CATEGORY_TYPE_OPTIONS = [
	{ label: 'Default', value: 'Default' },
	{ label: 'Öne Çıkan Kategoriler', value: 'Öne Çıkan Kategoriler' },
	{ label: 'En Çok Aranan Kategoriler', value: 'En Çok Aranan Kategoriler' }
]

export const FEATURED_CATEGORIES_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'main_category', label: 'Главная категория' },
	{ key: 'slug', label: 'Slug' },
	{ key: 'category_type', label: 'Тип категории' },
	{ key: 'image_url', label: 'Изображение' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'featured_order', label: 'Порядок' },
	{ key: 'discount', label: 'Скидка' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]

export const MAIN_CATEGORIES_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'slug', label: 'Slug' },
	{ key: 'category_type', label: 'Тип категории' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'featured_order', label: 'Порядок' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]

export const SUB_CATEGORIES_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'category_name', label: 'Категория' },
	{ key: 'slug', label: 'Slug' },
	{ key: 'image_url', label: 'Изображение' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'featured_order', label: 'Порядок' },
	{ key: 'discount', label: 'Скидка' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]
