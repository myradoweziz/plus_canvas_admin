import { downloadBlob, downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import { createEmptyCanvasProduct } from '../helpers/product-form'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDiscount,
	CanvasProductPayload,
	CanvasProductSeo
} from '../types/product'
import { collageLayoutsApi } from './collage-layouts'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'
const CANVAS_PRODUCTS_IMAGES_URL = '/api/admin/media/upload/'

export type ListCanvasProductsParams = {
	name?: string
	sku?: string
	main_category_id?: number
	category_id?: number
	sub_category_id?: number
	product_tag_id?: number
	limit: number
	offset: number
}

export type ListCanvasProductsResult = {
	items: CanvasProduct[]
	total: number
}

type RelationItem = number | { id?: number | null }

const toIdArray = (items: RelationItem[] | null | undefined): number[] => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => (typeof item === 'number' ? item : item.id))
		.filter((id): id is number => typeof id === 'number')
}

type ImageItem =
	| string
	| File
	| {
			url?: string | null
			path?: string | null
			image?: string | null
			image_url?: string | null
			image_path?: string | null
	  }

const toImageUrl = (item: Exclude<ImageItem, string | File>): string | null => {
	const url = item.url ?? item.image_url ?? item.image ?? item.path ?? item.image_path ?? null
	return typeof url === 'string' && url.trim() ? url.trim() : null
}

const toImageArray = (items: ImageItem[] | null | undefined): Array<string | File> => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => {
			if (typeof item === 'string') {
				const trimmed = item.trim()
				return trimmed || null
			}
			if (item instanceof File) return item
			return toImageUrl(item)
		})
		.filter((item): item is string | File => item !== null)
}

const toNullableNumber = (value: unknown): number | null => {
	if (value === null || value === undefined || value === '') return null
	const num = Number(value)
	return Number.isFinite(num) ? num : null
}

const toDatetimeLocalValue = (value: unknown): string | null => {
	if (value == null || value === '') return null
	const date = value instanceof Date ? value : new Date(String(value))
	if (Number.isNaN(date.getTime())) return null
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toDateOnlyValue = (value: unknown): string => {
	if (value == null || value === '') return ''
	const str = String(value).trim()
	if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10)
	const date = new Date(str)
	if (Number.isNaN(date.getTime())) return ''
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const toProductType = (value: unknown): CanvasProduct['product_type'] =>
	value === 'grouped' || value === 'Grouped Product' ? 'grouped' : 'simple'

const normalizeCanvasProductCategoryMappings = (
	product: Record<string, unknown>
): CanvasProductCategoryMapping[] => {
	const raw = product.category_mappings ?? product.categories

	if (!Array.isArray(raw)) return []

	return raw
		.map((item) => {
			const row = item as Record<string, unknown>
			return {
				category_id: Number(row.category_id ?? row.id ?? 0),
				is_featured: !!row.is_featured,
				display_order: Number(row.display_order ?? 0)
			}
		})
		.filter((item) => item.category_id > 0)
}

const normalizeCanvasProductSeo = (product: Record<string, unknown>): CanvasProductSeo => {
	const seo = (product.seo as Record<string, unknown> | undefined) ?? {}

	return {
		meta_title: String(seo.meta_title ?? product.meta_title ?? ''),
		meta_description: String(seo.meta_description ?? product.meta_description ?? ''),
		meta_keywords: String(seo.meta_keywords ?? product.meta_keywords ?? ''),
		slug: String(seo.slug ?? product.slug ?? '')
	}
}

const normalizeCanvasProductDiscount = (product: Record<string, unknown>): CanvasProductDiscount => {
	const nested = product.product_discount as Record<string, unknown> | undefined
	const discountRaw = product.discount
	const discountPercent =
		typeof discountRaw === 'number'
			? discountRaw
			: typeof nested?.discount === 'number'
				? nested.discount
				: Number(product.discount_percent ?? 0)

	return {
		discount: Number.isFinite(discountPercent) ? discountPercent : 0,
		special_price: Number(nested?.special_price ?? product.special_price ?? 0) || 0,
		special_price_start: toDateOnlyValue(nested?.special_price_start ?? product.special_price_start),
		special_price_end: toDateOnlyValue(nested?.special_price_end ?? product.special_price_end)
	}
}

function normalizeCanvasProduct(product: Record<string, any>): CanvasProduct {
	const defaults = createEmptyCanvasProduct()
	const productDiscount = normalizeCanvasProductDiscount(product)

	return {
		...defaults,
		id: product.id ?? null,
		name: product.name ?? '',
		description: product.description ?? '',
		price: Number(product.price ?? 0),
		discount: productDiscount.discount,
		images: toImageArray(product.images),
		inner_images: toImageArray(product.inner_images),
		upload_image_count: Number(product.upload_image_count ?? 0),
		main_category_id: product.main_category_id ?? product.main_category?.id ?? null,
		main_category_slug: product.main_category_slug ?? product.main_category?.slug ?? '',
		category_id: product.category_id ?? product.category?.id ?? null,
		sub_category_id: product.sub_category_id ?? product.sub_category?.id ?? null,
		product_tags: toIdArray(product.product_tags),
		banner_id: product.banner_id ?? product.banner?.id ?? null,
		flag: product.flag ?? '',
		product_qode: product.product_qode ?? '',
		stock_id: product.stock_id ?? product.discount?.id ?? null,
		colors: toIdArray(product.colors),
		canvas_formats: toIdArray(product.canvas_formats),
		frames: toIdArray(product.frames),
		effects: toIdArray(product.effects),
		collage_layout_id: product.collage_layout_id ?? product.collage_layout?.id ?? null,
		collage_layout: product.collage_layout
			? collageLayoutsApi.normalizeCollageLayout(product.collage_layout as Record<string, unknown>)
			: null,
		product_type: toProductType(product.product_type),
		short_description: product.short_description ?? '',
		admin_comment: product.admin_comment ?? '',
		sku: product.sku ?? '',
		show_on_homepage: !!product.show_on_homepage,
		allow_customer_reviews: product.allow_customer_reviews !== false,
		old_price: toNullableNumber(product.old_price),
		cost_price: toNullableNumber(product.cost_price),
		special_price: productDiscount.special_price,
		special_price_start: productDiscount.special_price_start || null,
		special_price_end: productDiscount.special_price_end || null,
		product_discount: productDiscount,
		disable_buy_button: !!product.disable_buy_button,
		available_for_preorder: !!product.available_for_preorder,
		call_for_price: !!product.call_for_price,
		min_cart_qty: Number(product.min_cart_qty ?? 1) || 1,
		max_cart_qty: toNullableNumber(product.max_cart_qty),
		shipping_included: !!product.shipping_included,
		free_shipping: !!product.free_shipping,
		separate_shipment: !!product.separate_shipment,
		additional_shipping_charge: toNullableNumber(product.additional_shipping_charge),
		weight: toNullableNumber(product.weight),
		delivery_time: product.delivery_time ?? null,
		availability_start: toDatetimeLocalValue(product.availability_start),
		availability_end: toDatetimeLocalValue(product.availability_end),
		is_published: product.is_published !== false,
		seo: normalizeCanvasProductSeo(product),
		category_mappings: normalizeCanvasProductCategoryMappings(product)
	}
}

async function listCanvasProducts(params: ListCanvasProductsParams): Promise<ListCanvasProductsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: CANVAS_PRODUCTS_URL, method: 'GET', params: filteredParams })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	const items = rawItems.map((item: Record<string, unknown>) => normalizeCanvasProduct(item))

	return {
		items,
		total: getTotal(response, rawItems.length)
	}
}

async function getCanvasProduct(id: number): Promise<CanvasProduct> {
	const response = await request({ url: `${CANVAS_PRODUCTS_URL}/${id}`, method: 'GET' })
	return normalizeCanvasProduct(response?.data || response)
}

function toCanvasProductPayload(product: CanvasProduct): CanvasProductPayload {
	return {
		name: product.name,
		description: product.description,
		price: product.price,
		images: product.images,
		inner_images: product.inner_images,
		upload_image_count: product.upload_image_count,
		main_category_id: product.main_category_id,
		category_id: product.category_id,
		sub_category_id: product.sub_category_id,
		product_tags: product.product_tags,
		banner_id: product.banner_id,
		flag: product.flag,
		product_qode: product.product_qode,
		stock_id: product.stock_id,
		colors: product.colors,
		canvas_formats: product.canvas_formats,
		frames: product.frames,
		effects: product.effects,
		collage_layout_id: product.collage_layout_id,
		product_type: product.product_type,
		short_description: product.short_description,
		admin_comment: product.admin_comment,
		sku: product.sku,
		show_on_homepage: product.show_on_homepage,
		allow_customer_reviews: product.allow_customer_reviews,
		old_price: product.old_price,
		cost_price: product.cost_price,
		disable_buy_button: product.disable_buy_button,
		available_for_preorder: product.available_for_preorder,
		call_for_price: product.call_for_price,
		min_cart_qty: product.min_cart_qty,
		max_cart_qty: product.max_cart_qty,
		shipping_included: product.shipping_included,
		free_shipping: product.free_shipping,
		separate_shipment: product.separate_shipment,
		additional_shipping_charge: product.additional_shipping_charge,
		weight: product.weight,
		delivery_time: product.delivery_time,
		availability_start: product.availability_start,
		availability_end: product.availability_end,
		is_published: product.is_published
	}
}

function toCanvasProductSeoPayload(seo: CanvasProductSeo): CanvasProductSeo {
	return {
		meta_title: seo.meta_title,
		meta_description: seo.meta_description,
		meta_keywords: seo.meta_keywords,
		slug: seo.slug
	}
}

const omitNullFormValues = (data: Record<string, unknown>) => {
	Object.keys(data).forEach((key) => {
		if (data[key] === null || data[key] === undefined) {
			delete data[key]
		}
	})
}

function toCanvasProductFormData(product: CanvasProduct): Record<string, any> {
	const payload = toCanvasProductPayload(product)
	
	const booleanFields = [
		'show_on_homepage', 'allow_customer_reviews', 'disable_buy_button', 
		'available_for_preorder', 'call_for_price', 'shipping_included', 
		'free_shipping', 'separate_shipment', 'is_published'
	]
	
	const data: Record<string, any> = {
		...payload,
		colors: JSON.stringify(payload.colors),
		canvas_formats: JSON.stringify(payload.canvas_formats),
		frames: JSON.stringify(payload.frames),
		effects: JSON.stringify(payload.effects),
		product_tags: JSON.stringify(payload.product_tags)
	}

	delete data.images
	delete data.inner_images

	payload.images.forEach((image, index) => {
		data[`images[${index}]`] = image
	})

	payload.inner_images.forEach((image, index) => {
		data[`inner_images[${index}]`] = image
	})

	if (payload.collage_layout_id != null) {
		data.collage_layout_id = payload.collage_layout_id
	} else {
		delete data.collage_layout_id
	}

	omitNullFormValues(data)

	booleanFields.forEach((field) => {
		if (data[field] !== undefined && data[field] !== null) {
			data[field] = data[field] ? 1 : 0
		}
	})

	return data
}

async function createCanvasProduct(product: CanvasProduct): Promise<CanvasProduct> {
	const response = await request({
		url: CANVAS_PRODUCTS_URL,
		method: 'POST',
		isFormData: true,
		data: toCanvasProductFormData(product)
	})

	return normalizeCanvasProduct((response?.data || response) as Record<string, unknown>)
}

async function updateCanvasProduct(product: CanvasProduct): Promise<CanvasProduct> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${product.id}`,
		method: 'PUT',
		isFormData: true,
		data: toCanvasProductFormData(product)
	})

	return normalizeCanvasProduct((response?.data || response) as Record<string, unknown>)
}

async function updateCanvasProductSeo(productId: number, seo: CanvasProductSeo): Promise<CanvasProductSeo> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${productId}/seo`,
		method: 'PUT',
		data: toCanvasProductSeoPayload(seo)
	})

	return normalizeCanvasProductSeo((response?.data || response) as Record<string, unknown>)
}

function toCanvasProductDiscountPayload(discount: CanvasProductDiscount): CanvasProductDiscount {
	return {
		discount: Number(discount.discount) || 0,
		special_price: Number(discount.special_price) || 0,
		special_price_start: toDateOnlyValue(discount.special_price_start),
		special_price_end: toDateOnlyValue(discount.special_price_end)
	}
}

async function updateCanvasProductDiscount(
	productId: number,
	discount: CanvasProductDiscount
): Promise<CanvasProductDiscount> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${productId}/discount`,
		method: 'PUT',
		data: toCanvasProductDiscountPayload(discount)
	})

	return normalizeCanvasProductDiscount((response?.data || response) as Record<string, unknown>)
}

function toCanvasProductCategoryMappingsPayload(
	mappings: CanvasProductCategoryMapping[]
): CanvasProductCategoryMapping[] {
	return mappings.map((mapping) => ({
		category_id: mapping.category_id,
		is_featured: !!mapping.is_featured,
		display_order: Number(mapping.display_order) || 0
	}))
}

async function saveCanvasProductCategory(
	productId: number,
	mapping: CanvasProductCategoryMapping
): Promise<CanvasProductCategoryMapping> {
	const payload = toCanvasProductCategoryMappingsPayload([mapping])[0]
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${productId}/categories`,
		method: 'POST',
		data: payload
	})

	const row = (response?.data ?? response) as Record<string, unknown>

	return {
		category_id: Number(row.category_id ?? payload.category_id),
		is_featured: row.is_featured !== undefined ? !!row.is_featured : payload.is_featured,
		display_order: Number(row.display_order ?? payload.display_order)
	}
}

async function saveCanvasProductCategories(
	productId: number,
	categoryMappings: CanvasProductCategoryMapping[]
): Promise<CanvasProductCategoryMapping[]> {
	const payload = toCanvasProductCategoryMappingsPayload(categoryMappings)
	const saved: CanvasProductCategoryMapping[] = []

	for (const mapping of payload) {
		saved.push(await saveCanvasProductCategory(productId, mapping))
	}

	return saved
}

async function deleteCanvasProduct(id: number): Promise<void> {
	await request({ url: `${CANVAS_PRODUCTS_URL}/${id}`, method: 'DELETE' })
}

export type UploadedMedia = { path: string; url: string }

async function uploadImage(
	file: File,
	onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<UploadedMedia> {
	const response = await request({
		url: CANVAS_PRODUCTS_IMAGES_URL,
		method: 'POST',
		isFormData: true,
		data: { file },
		onUploadProgress: onUploadProgress ? { onUploadProgress } : {}
	})

	return response?.data || response
}

async function uploadImages(files: File[], onProgress?: (percent: number) => void): Promise<UploadedMedia[]> {
	const uploaded: UploadedMedia[] = []
	const total = Math.max(files.length, 1)

	for (let i = 0; i < files.length; i += 1) {
		const media = await uploadImage(files[i], (evt) => {
			if (!onProgress) return
			const loaded = evt.loaded || 0
			const totalBytes = evt.total || 1
			const filePercent = Math.min(100, Math.round((loaded / totalBytes) * 100))
			const overall = Math.min(100, Math.round(((i + filePercent / 100) / total) * 100))
			onProgress(overall)
		})
		uploaded.push(media)
		onProgress?.(Math.round(((i + 1) / total) * 100))
	}

	return uploaded
}

async function bulkDeleteCanvasProducts(ids: number[]): Promise<void> {
	await request({ url: `${CANVAS_PRODUCTS_URL}/bulk-delete`, method: 'POST', data: { ids } })
}

async function exportCanvasProductsXml(ids?: number[]): Promise<void> {
	const params = ids && ids.length ? { ids: ids.join(',') } : undefined
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/export/xml`,
		method: 'GET',
		params,
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml = typeof response === 'string'
		? response
		: typeof (response as any)?.data === 'string'
			? (response as any).data
			: ''

	if (!xml.trim()) throw new Error('Пустой ответ XML')

	downloadTextFile(xml, 'products.xml', 'application/xml;charset=utf-8')
}

async function exportCanvasProductsExcel(ids?: number[]): Promise<void> {
	const params = ids && ids.length ? { ids: ids.join(',') } : undefined
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/export/excel`,
		method: 'GET',
		params,
		responseType: 'blob'
	})

	downloadBlob(response as Blob, 'products.xlsx')
}

async function importCanvasProductsExcel(file: File): Promise<void> {
	await request({
		url: `${CANVAS_PRODUCTS_URL}/import/excel`,
		method: 'POST',
		data: { file },
		isFormData: true
	})
}

export const productsApi = {
	listCanvasProducts,
	getCanvasProduct,
	createCanvasProduct,
	updateCanvasProduct,
	updateCanvasProductSeo,
	updateCanvasProductDiscount,
	saveCanvasProductCategory,
	saveCanvasProductCategories,
	deleteCanvasProduct,
	uploadImages,
	bulkDeleteCanvasProducts,
	exportCanvasProductsXml,
	exportCanvasProductsExcel,
	importCanvasProductsExcel
}
