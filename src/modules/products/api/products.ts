import { downloadBlob, downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import { filterListParams } from '@/shared/api/createListApi'
import {
	createEmptyCanvasProduct,
	resolveCanvasSizes,
	resolveUploadImageCount
} from '../helpers/product-form'
import { resolveProductImageUrl, type ProductImageValue } from '../helpers/product-image'
import type {
	CanvasProduct,
	CanvasProductCategoryMapping,
	CanvasProductDetails,
	CanvasProductDiscount,
	CanvasProductFaqItem,
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

const normalizeActiveCanvasFormatId = (product: Record<string, unknown>): number | null => {
	const direct = toNullableNumber(
		product.active_canvas_format_id ?? (product.active_canvas_format as { id?: number | null } | undefined)?.id ?? null
	)
	if (direct != null) return direct

	const formats = product.canvas_formats
	if (!Array.isArray(formats)) return null

	for (const item of formats) {
		if (typeof item !== 'object' || item === null) continue

		const format = item as {
			id?: number | null
			canvas_format_id?: number | null
			is_active?: boolean
			pivot?: { is_active?: boolean }
		}
		const isActive = format.pivot?.is_active ?? format.is_active
		if (!isActive) continue

		const id = format.id ?? format.canvas_format_id
		if (typeof id === 'number' && Number.isFinite(id)) return id
	}

	return null
}

const normalizeProductImage = (product: Record<string, unknown>): string => {
	const fromImage = resolveProductImageUrl(product.image as ProductImageValue)
	if (fromImage) return fromImage

	const images = product.images
	if (Array.isArray(images) && images.length) {
		const first = images[0]
		if (typeof first === 'string' && first.trim()) return first.trim()
		if (first && typeof first === 'object' && !(first instanceof File)) {
			return resolveProductImageUrl(first as ProductImageValue)
		}
	}

	const fallback = product.image_url ?? product.image_path
	return typeof fallback === 'string' && fallback.trim() ? fallback.trim() : ''
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

const normalizeCanvasProductCategoryMappings = (product: Record<string, unknown>): CanvasProductCategoryMapping[] => {
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

const normalizeCanvasProductFaq = (items: unknown): CanvasProductFaqItem[] => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => {
			const row = item as Record<string, unknown>
			return {
				question: String(row.question ?? ''),
				answer: String(row.answer ?? '')
			}
		})
		.filter((item) => item.question.trim() || item.answer.trim())
}

const normalizeCanvasProductDetails = (product: Record<string, unknown>): CanvasProductDetails => {
	const nested = (product.product_details ?? product.details) as Record<string, unknown> | undefined

	return {
		description: String(nested?.description ?? product.description ?? ''),
		short_description: String(nested?.short_description ?? product.short_description ?? ''),
		faq: normalizeCanvasProductFaq(nested?.faq ?? product.faq)
	}
}

function normalizeCanvasProduct(product: Record<string, any>): CanvasProduct {
	const defaults = createEmptyCanvasProduct()
	const productDiscount = normalizeCanvasProductDiscount(product)
	const productDetails = normalizeCanvasProductDetails(product)
	const collageLayout = product.collage_layout
		? collageLayoutsApi.normalizeCollageLayout(product.collage_layout as Record<string, unknown>)
		: null
	const collageLayoutId = product.collage_layout_id ?? collageLayout?.id ?? null

	return {
		...defaults,
		id: product.id ?? null,
		name: product.name ?? '',
		price: Number(product.price ?? 0),
		discount: productDiscount.discount,
		image: normalizeProductImage(product),
		main_category_id: toNullableNumber(product.main_category_id ?? product.main_category?.id ?? null),
		main_category_type: product.main_category_type ?? product.main_category?.category_type ?? '',
		category_id: toNullableNumber(product.category_id ?? product.category?.id ?? null),
		sub_category_id: toNullableNumber(product.sub_category_id ?? product.sub_category?.id ?? null),
		product_tags: toIdArray(product.product_tags),
		banner_id: product.banner_id ?? product.banner?.id ?? null,
		flag: product.flag ?? '',
		stock_id: product.stock_id ?? product.discount?.id ?? null,
		colors: toIdArray(product.colors),
		active_canvas_format_id: normalizeActiveCanvasFormatId(product),
		canvas_formats: toIdArray(product.canvas_formats),
		canvas_sizes: toIdArray(product.canvas_sizes),
		frames: toIdArray(product.frames),
		effects: toIdArray(product.effects),
		collage_layout_id: collageLayoutId,
		collage_layout: collageLayout,
		upload_image_count: resolveUploadImageCount(collageLayoutId, collageLayout),
		product_type: toProductType(product.product_type),
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
		product_details: productDetails,
		product_dimensions: String(product.product_dimensions ?? ''),
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
		price: product.price,
		image: resolveProductImageUrl(product.image),
		main_category_id: product.main_category_id,
		category_id: product.category_id,
		sub_category_id: product.sub_category_id,
		product_tags: product.product_tags,
		banner_id: product.banner_id,
		flag: product.flag,
		stock_id: product.stock_id,
		colors: product.colors,
		active_canvas_format_id: product.active_canvas_format_id,
		canvas_formats: product.canvas_formats,
		canvas_sizes: resolveCanvasSizes(product.main_category_type, product.canvas_sizes),
		frames: product.frames,
		effects: product.effects,
		collage_layout_id: product.collage_layout_id,
		upload_image_count: resolveUploadImageCount(product.collage_layout_id, product.collage_layout),
		product_type: product.product_type,
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
		'show_on_homepage',
		'allow_customer_reviews',
		'disable_buy_button',
		'available_for_preorder',
		'call_for_price',
		'shipping_included',
		'free_shipping',
		'separate_shipment',
		'is_published'
	]

	const data: Record<string, any> = {
		...payload,
		colors: JSON.stringify(payload.colors),
		canvas_formats: JSON.stringify(payload.canvas_formats),
		canvas_sizes: JSON.stringify(payload.canvas_sizes),
		frames: JSON.stringify(payload.frames),
		effects: JSON.stringify(payload.effects),
		product_tags: JSON.stringify(payload.product_tags)
	}

	data.image = payload.image

	omitNullFormValues(data)

	data.collage_layout_id = payload.collage_layout_id ?? null
	data.active_canvas_format_id = payload.active_canvas_format_id ?? null

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

async function getCanvasProductDetails(productId: number): Promise<CanvasProductDetails> {
	const response = await request({ url: `${CANVAS_PRODUCTS_URL}/${productId}/details`, method: 'GET' })
	return normalizeCanvasProductDetails((response?.data || response) as Record<string, unknown>)
}

function toCanvasProductDetailsPayload(details: CanvasProductDetails): CanvasProductDetails {
	return {
		description: details.description,
		short_description: details.short_description.trim(),
		faq: details.faq.map((item) => ({
			question: item.question.trim(),
			answer: item.answer.trim()
		}))
	}
}

async function updateCanvasProductDetails(
	productId: number,
	details: CanvasProductDetails
): Promise<CanvasProductDetails> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${productId}/details`,
		method: 'PUT',
		data: toCanvasProductDetailsPayload(details)
	})

	return normalizeCanvasProductDetails((response?.data || response) as Record<string, unknown>)
}

async function updateCanvasProductDimensions(productId: number, productDimensions: string): Promise<string> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/${productId}/dimensions`,
		method: 'PUT',
		data: { product_dimensions: productDimensions }
	})
	const payload = (response?.data ?? response) as Record<string, unknown> | string
	if (typeof payload === 'string') return payload
	return String(payload?.product_dimensions ?? productDimensions)
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

async function exportCanvasProductsXml(ids: number[]): Promise<void> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/export/xml`,
		method: 'GET',
		params: filterListParams({ ids }),
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml =
		typeof response === 'string' ? response : typeof (response as any)?.data === 'string' ? (response as any).data : ''

	if (!xml.trim()) throw new Error('Пустой ответ XML')

	downloadTextFile(xml, 'products.xml', 'application/xml;charset=utf-8')
}

async function exportCanvasProductsExcel(ids: number[]): Promise<void> {
	const response = await request({
		url: `${CANVAS_PRODUCTS_URL}/export/excel`,
		method: 'GET',
		params: filterListParams({ ids }),
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
	getCanvasProductDetails,
	createCanvasProduct,
	updateCanvasProduct,
	updateCanvasProductDetails,
	updateCanvasProductDimensions,
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
