import type { CategoryType } from '@/modules/categories/types/main-category'
import type { CollageLayout } from './collage-layout'

export interface CanvasProductSeo {
	meta_title: string
	meta_description: string
	meta_keywords: string
	slug: string
}

export interface CanvasProductCategoryMapping {
	category_id: number
	is_featured: boolean
	display_order: number
}

export interface CanvasProductDiscount {
	discount: number
	special_price: number
	special_price_start: string
	special_price_end: string
}

export interface CanvasProductFaqItem {
	question: string
	answer: string
}

export interface CanvasProductDetails {
	description: string
	short_description: string
	faq: CanvasProductFaqItem[]
}

export interface CanvasProductImage {
	path: string
	url: string
}

export type CanvasProduct = {
	id: number | null
	name: string
	price: number
	discount: number
	image: string
	main_category_id: number | null
	main_category_type?: CategoryType | ''
	category_id: number | null
	sub_category_id: number | null
	product_tags: number[]
	banner_id: number | null
	flag: string
	stock_id: number | null
	colors: number[]
	canvas_formats: number[]
	frames: number[]
	effects: number[]
	collage_layout_id: number | null
	collage_layout?: CollageLayout | null
	product_type: 'simple' | 'grouped'
	admin_comment: string
	sku: string
	show_on_homepage: boolean
	allow_customer_reviews: boolean
	old_price: number | null
	cost_price: number | null
	special_price: number | null
	special_price_start: string | null
	special_price_end: string | null
	disable_buy_button: boolean
	available_for_preorder: boolean
	call_for_price: boolean
	min_cart_qty: number
	max_cart_qty: number | null
	shipping_included: boolean
	free_shipping: boolean
	separate_shipment: boolean
	additional_shipping_charge: number | null
	weight: number | null
	delivery_time: string | null
	availability_start: string | null
	availability_end: string | null
	is_published: boolean
	product_details: CanvasProductDetails
	product_dimensions: string
	seo: CanvasProductSeo
	category_mappings: CanvasProductCategoryMapping[]
	product_discount: CanvasProductDiscount
}

export type CanvasProductPayload = Omit<
	CanvasProduct,
	| 'id'
	| 'main_category_type'
	| 'collage_layout'
	| 'product_details'
	| 'product_dimensions'
	| 'seo'
	| 'category_mappings'
	| 'product_discount'
	| 'discount'
	| 'special_price'
	| 'special_price_start'
	| 'special_price_end'
>
