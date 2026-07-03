import { downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import { filterListParams } from '@/shared/api/createListApi'
import type { FeaturedCategory, FeaturedCategoryPayload } from '../types'

export const featuredCategoriesApi = {
	listFeaturedCategories,
	createFeaturedCategory,
	updateFeaturedCategory,
	deleteFeaturedCategory,
	bulkDeleteFeaturedCategories,
	reorderFeaturedCategories,
	exportFeaturedCategoriesXml
}

const FEATURED_CATEGORIES_URL = '/api/admin/categories'

export type ListFeaturedCategoriesParams = {
	name?: string
	main_category_id?: number
	limit?: number
	offset?: number
}

export type ListFeaturedCategoriesResult = {
	items: FeaturedCategory[]
	total: number
}

async function listFeaturedCategories(
	params: ListFeaturedCategoriesParams = {}
): Promise<ListFeaturedCategoriesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: FEATURED_CATEGORIES_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toFeaturedCategoryPayload(category: FeaturedCategory): FeaturedCategoryPayload {
	return {
		main_category_id: category.main_category_id,
		name: category.name,
		slug: category.slug,
		description: category.description,
		image: category.image || '',
		is_active: category.is_active,
		featured_order: category.featured_order,
		category_type: category.category_type,
		meta_title: category.meta_title ?? '',
		meta_description: category.meta_description ?? '',
		discount: Number(category.discount ?? 0)
	}
}

async function createFeaturedCategory(category: FeaturedCategory): Promise<FeaturedCategory> {
	return await request({
		url: FEATURED_CATEGORIES_URL,
		method: 'POST',
		data: toFeaturedCategoryPayload(category)
	})
}

async function updateFeaturedCategory(category: FeaturedCategory): Promise<FeaturedCategory> {
	return await request({
		url: `${FEATURED_CATEGORIES_URL}/${category.id}`,
		method: 'PUT',
		data: toFeaturedCategoryPayload(category)
	})
}

async function deleteFeaturedCategory(id: number): Promise<void> {
	await request({ url: `${FEATURED_CATEGORIES_URL}/${id}`, method: 'DELETE' })
}

async function bulkDeleteFeaturedCategories(ids: number[]): Promise<void> {
	await request({ url: `${FEATURED_CATEGORIES_URL}/bulk-delete`, method: 'POST', data: { ids } })
}

type ReorderFeaturedCategoriesPayload = {
	items: Array<{
		id: number
		featured_order: number
	}>
}

async function reorderFeaturedCategories(data: ReorderFeaturedCategoriesPayload): Promise<FeaturedCategory[]> {
	return await request({ url: `${FEATURED_CATEGORIES_URL}/reorder`, method: 'POST', data })
}

async function exportFeaturedCategoriesXml(ids: number[]): Promise<void> {
	const response = await request({
		url: `${FEATURED_CATEGORIES_URL}/export/xml`,
		method: 'GET',
		params: filterListParams({ ids }),
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml =
		typeof response === 'string'
			? response
			: typeof (response as { data?: string })?.data === 'string'
				? (response as { data: string }).data
				: ''

	if (!xml.trim()) {
		throw new Error('Пустой ответ XML')
	}

	downloadTextFile(xml, 'categories.xml', 'application/xml;charset=utf-8')
}
