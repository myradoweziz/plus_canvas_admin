import { getTotal, request } from '@/shared'
import type { ProductTag, ProductTagPayload } from '../types/productTag'

const PRODUCT_TAGS_URL = '/api/admin/product-tags'

export type ListProductTagsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListProductTagsResult = {
	items: ProductTag[]
	total: number
}

async function listProductTags(params: ListProductTagsParams): Promise<ListProductTagsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: PRODUCT_TAGS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || response?.items || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toProductTagPayload(tag: ProductTag): ProductTagPayload {
	return {
		name: tag.name,
		slug: tag.slug
	}
}

async function createProductTag(tag: ProductTag): Promise<ProductTag> {
	return await request({ url: PRODUCT_TAGS_URL, method: 'POST', data: toProductTagPayload(tag) })
}

async function updateProductTag(tag: ProductTag): Promise<ProductTag> {
	return await request({
		url: `${PRODUCT_TAGS_URL}/${tag.id}`,
		method: 'PUT',
		data: toProductTagPayload(tag)
	})
}

async function deleteProductTag(id: number): Promise<void> {
	await request({ url: `${PRODUCT_TAGS_URL}/${id}`, method: 'DELETE' })
}

export const productTagsApi = {
	listProductTags,
	createProductTag,
	updateProductTag,
	deleteProductTag
}
