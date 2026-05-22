import type { CanvasProduct, CanvasProductSeo } from '../types/product'

export const INNER_IMAGES_MAIN_CATEGORY_SLUG = 'kisiye-ozel-kanvas-tablo'

export type ProductFormTab = 'productInfo' | 'seo'

export const PRODUCT_FORM_TABS: Array<{ id: ProductFormTab; label: string }> = [
	{ id: 'productInfo', label: 'Product Info' },
	{ id: 'seo', label: 'SEO' }
] as const

export const createEmptyCanvasProductSeo = (): CanvasProductSeo => ({
	meta_title: '',
	meta_description: '',
	meta_keywords: '',
	slug: ''
})

export const PRODUCT_TYPE_OPTIONS = [
	{ label: 'Simple Product', value: 'Simple Product' },
	{ label: 'Grouped Product', value: 'Grouped Product' }
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
	brand_id: null,
	banner_id: null,
	flag: '',
	product_qode: '',
	discount_id: null,
	colors: [],
	canvas_formats: [],
	frames: [],
	effects: [],
	collage_layout_id: null,
	collage_layout: null,
	product_type: 'Simple Product',
	short_description: '',
	admin_comment: '',
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
	seo: createEmptyCanvasProductSeo()
})
