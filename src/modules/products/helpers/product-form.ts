import type { CanvasProductComment } from '../types/product-comment'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDiscount,
	CanvasProductSeo
} from '../types/product'

export const INNER_IMAGES_MAIN_CATEGORY_SLUG = 'kisiye-ozel-kanvas-tablo'

export type ProductFormTab =
	| 'productInfo'
	| 'discount'
	| 'seo'
	| 'categoryMappings'
	| 'productTags'
	| 'productComments'

export const PRODUCT_FORM_TABS: Array<{ id: ProductFormTab; label: string }> = [
	{ id: 'productInfo', label: 'Product Info' },
	{ id: 'discount', label: 'Discount' },
	{ id: 'seo', label: 'SEO' },
	{ id: 'categoryMappings', label: 'Category mappings' },
	{ id: 'productTags', label: 'Теги товаров' },
	{ id: 'productComments', label: 'Product Comments' }
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

export const PRODUCT_TYPE_OPTIONS = [
	{ label: 'Simple Product', value: 'simple' },
	{ label: 'Grouped Product', value: 'grouped' }
] as const

export const createEmptyCanvasProduct = (): CanvasProduct => ({
	id: null,
	name: '',
	description: '',
	price: 0,
	discount: 0,
	images: [],
	inner_images: [],
	upload_image_count: 1,
	main_category_id: null,
	main_category_slug: '',
	category_id: null,
	sub_category_id: null,
	product_tags: [],
	banner_id: null,
	flag: '',
	product_qode: '',
	stock_id: null,
	colors: [],
	canvas_formats: [],
	frames: [],
	effects: [],
	collage_layout_id: null,
	collage_layout: null,
	product_type: 'simple',
	short_description: '',
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
	seo: createEmptyCanvasProductSeo(),
	category_mappings: [],
	product_discount: createEmptyCanvasProductDiscount()
})
