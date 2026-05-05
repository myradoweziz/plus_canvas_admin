export type CanvasProduct = {
	id: number | null
	name: string
	slug: string
	description: string
	price: number
	images: Array<string | File>
	inner_images: Array<string | File>
	upload_image_count: number
	main_category_id: number | null
	category_id: number | null
	sub_category_id: number | null
	brand_id: number | null
	banner_id: number | null
	flag: string
	product_qode: string
	discount_id: number | null
	colors: number[]
	canvas_formats: number[]
}

export type CanvasProductPayload = Omit<CanvasProduct, 'id'>
