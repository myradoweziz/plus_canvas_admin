import type { CategoryType } from '@/modules/categories/types/main-category'
import type { CollageLayout } from '../types/collage-layout'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDetails,
	CanvasProductDiscount,
	CanvasProductFaqItem,
	CanvasProductSeo
} from '../types/product'
import type { CanvasProductComment } from '../types/product-comment'

export const PERSONAL_CANVAS_CATEGORY_TYPE: CategoryType = 'Kişiye Özel Kanvas Tablo'

export const isPersonalCanvasCategory = (categoryType: string | null | undefined): boolean =>
	categoryType === PERSONAL_CANVAS_CATEGORY_TYPE

export const resolveUploadImageCount = (
	collageLayoutId: number | null,
	collageLayout?: CollageLayout | null
): number => {
	if (collageLayoutId == null) return 1

	const slotCount = collageLayout?.layout_json?.length ?? collageLayout?.max_images ?? 0

	return slotCount > 0 ? slotCount : 1
}

export type ProductFormTab =
	| 'productInfo'
	| 'productDetails'
	| 'productDimensions'
	| 'discount'
	| 'seo'
	| 'categoryMappings'
	| 'productTags'
	| 'productComments'
	| 'productOrders'

export const PRODUCT_FORM_TABS: Array<{ id: ProductFormTab; label: string }> = [
	{ id: 'productInfo', label: 'Product Info' },
	{ id: 'productDetails', label: 'Product Content' },
	{ id: 'productDimensions', label: 'Product Dimensions' },
	{ id: 'discount', label: 'Discount' },
	{ id: 'seo', label: 'SEO' },
	{ id: 'categoryMappings', label: 'Category mappings' },
	{ id: 'productTags', label: 'Теги товаров' },
	{ id: 'productComments', label: 'Product Comments' },
	{ id: 'productOrders', label: 'Product Orders' }
] as const

export const createEmptyCanvasProductComment = (): CanvasProductComment => ({
	id: null,
	author_name: '',
	comment: '',
	rating: 5,
	is_active: true
})

export const createEmptyCanvasProductDiscount = (): CanvasProductDiscount => ({
	discount: 0,
	special_price: 0,
	special_price_start: '',
	special_price_end: ''
})

export const createEmptyCategoryMapping = (): CanvasProductCategoryMapping => ({
	category_id: 0,
	is_featured: false,
	display_order: 0
})

export const createEmptyCanvasProductSeo = (): CanvasProductSeo => ({
	meta_title: '',
	meta_description: '',
	meta_keywords: '',
	slug: ''
})

export const createEmptyCanvasProductFaqItem = (): CanvasProductFaqItem => ({
	question: '',
	answer: ''
})

export const createEmptyCanvasProductDetails = (): CanvasProductDetails => ({
	description: '',
	short_description: '',
	faq: []
})

export const PRODUCT_TYPE_OPTIONS = [
	{ label: 'Simple Product', value: 'simple' },
	{ label: 'Grouped Product', value: 'grouped' }
] as const

export const createEmptyCanvasProduct = (): CanvasProduct => ({
	id: null,
	name: '',
	price: 0,
	discount: 0,
	image: '',
	main_category_id: null,
	main_category_type: '',
	category_id: null,
	sub_category_id: null,
	product_tags: [],
	banner_id: null,
	flag: '',
	stock_id: null,
	colors: [],
	active_canvas_format_id: null,
	canvas_formats: [],
	frames: [],
	effects: [],
	collage_layout_id: null,
	collage_layout: null,
	upload_image_count: 1,
	product_type: 'simple',
	admin_comment: '',
	sku: '',
	show_on_homepage: false,
	allow_customer_reviews: false,
	old_price: null,
	cost_price: null,
	special_price: null,
	special_price_start: null,
	special_price_end: null,
	disable_buy_button: false,
	available_for_preorder: false,
	call_for_price: false,
	min_cart_qty: 1,
	max_cart_qty: null,
	shipping_included: false,
	free_shipping: false,
	separate_shipment: false,
	additional_shipping_charge: null,
	weight: null,
	delivery_time: null,
	availability_start: null,
	availability_end: null,
	is_published: false,
	product_details: createEmptyCanvasProductDetails(),
	product_dimensions: '',
	seo: createEmptyCanvasProductSeo(),
	category_mappings: [],
	product_discount: createEmptyCanvasProductDiscount()
})
