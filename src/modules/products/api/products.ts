import { getTotal, request } from '@/shared'
import type { CanvasProduct, CanvasProductPayload } from '../types/product'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'
const CANVAS_PRODUCTS_IMAGES_URL = '/api/admin/media/upload/'

export type ListCanvasProductsParams = {
	name?: string
	main_category_id?: number
	category_id?: number
	sub_category_id?: number
	brand_id?: number
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

type ImageItem = string | File | { url?: string | null; path?: string | null }

const toImageArray = (items: ImageItem[] | null | undefined): Array<string | File> => {
	if (!Array.isArray(items)) return []

	return items
		.map((item) => {
			if (typeof item === 'string' || item instanceof File) return item
			return item.url || item.path || null
		})
		.filter((item): item is string | File => item !== null)
}

function normalizeCanvasProduct(product: Record<string, any>): CanvasProduct {
	return {
		id: product.id ?? null,
		name: product.name ?? '',
		slug: product.slug ?? '',
		description: product.description ?? '',
		price: Number(product.price ?? 0),
		images: toImageArray(product.images),
		inner_images: toImageArray(product.inner_images),
		upload_image_count: Number(product.upload_image_count ?? 0),
		main_category_id: product.main_category_id ?? product.main_category?.id ?? null,
		category_id: product.category_id ?? product.category?.id ?? null,
		sub_category_id: product.sub_category_id ?? product.sub_category?.id ?? null,
		brand_id: product.brand_id ?? product.brand?.id ?? null,
		banner_id: product.banner_id ?? product.banner?.id ?? null,
		flag: product.flag ?? '',
		product_qode: product.product_qode ?? '',
		discount_id: product.discount_id ?? product.discount?.id ?? null,
		colors: toIdArray(product.colors),
		canvas_formats: toIdArray(product.canvas_formats)
	}
}

async function listCanvasProducts(params: ListCanvasProductsParams): Promise<ListCanvasProductsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: CANVAS_PRODUCTS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function getCanvasProduct(id: number): Promise<CanvasProduct> {
	const response = await request({ url: `${CANVAS_PRODUCTS_URL}/${id}`, method: 'GET' })
	return normalizeCanvasProduct(response?.data || response)
}

function toCanvasProductPayload(product: CanvasProduct): CanvasProductPayload {
	return {
		name: product.name,
		slug: product.slug,
		description: product.description,
		price: product.price,
		images: product.images,
		inner_images: product.inner_images,
		upload_image_count: product.upload_image_count,
		main_category_id: product.main_category_id,
		category_id: product.category_id,
		sub_category_id: product.sub_category_id,
		brand_id: product.brand_id,
		banner_id: product.banner_id,
		flag: product.flag,
		product_qode: product.product_qode,
		discount_id: product.discount_id,
		colors: product.colors,
		canvas_formats: product.canvas_formats
	}
}

function toCanvasProductFormData(product: CanvasProduct): Record<string, any> {
	const payload = toCanvasProductPayload(product)
	const data: Record<string, any> = {
		...payload,
		colors: JSON.stringify(payload.colors),
		canvas_formats: JSON.stringify(payload.canvas_formats)
	}

	delete data.images
	delete data.inner_images

	payload.images.forEach((image, index) => {
		data[`images[${index}]`] = image
	})

	payload.inner_images.forEach((image, index) => {
		data[`inner_images[${index}]`] = image
	})

	return data
}

async function createCanvasProduct(product: CanvasProduct): Promise<CanvasProduct> {
	return await request({
		url: CANVAS_PRODUCTS_URL,
		method: 'POST',
		isFormData: true,
		data: toCanvasProductFormData(product)
	})
}

async function updateCanvasProduct(product: CanvasProduct): Promise<CanvasProduct> {
	return await request({
		url: `${CANVAS_PRODUCTS_URL}/${product.id}`,
		method: 'PUT',
		isFormData: true,
		data: toCanvasProductFormData(product)
	})
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

export const canvasProductsApi = {
	listCanvasProducts,
	getCanvasProduct,
	createCanvasProduct,
	updateCanvasProduct,
	deleteCanvasProduct,
	uploadImages
}
