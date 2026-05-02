import { request } from '@/shared'
import type { FeaturedCategory, FeaturedCategoryPayload } from '../types/category'

const FEATURED_CATEGORIES_URL = '/api/admin/categories'

export type ListFeaturedCategoriesParams = {
	name?: string
	featured_order?: number
	main_category_id?: number
	limit: number
	offset: number
}

export type ListFeaturedCategoriesResult = {
	items: FeaturedCategory[]
	total: number
}

const getTotal = (response: any, fallback: number) => {
	return response?.meta?.total ?? fallback
}

async function listFeaturedCategories(params: ListFeaturedCategoriesParams): Promise<ListFeaturedCategoriesResult> {
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
		is_active: category.is_active,
		featured_order: category.featured_order
	}
}

async function createFeaturedCategory(category: FeaturedCategory): Promise<FeaturedCategory> {
	return await request({ url: FEATURED_CATEGORIES_URL, method: 'POST', data: toFeaturedCategoryPayload(category) })
}

async function updateFeaturedCategory(category: FeaturedCategory): Promise<FeaturedCategory> {
	return await request({
		url: `${FEATURED_CATEGORIES_URL}/${category.id}`,
		method: 'POST',
		data: toFeaturedCategoryPayload(category)
	})
}

async function deleteFeaturedCategory(id: number): Promise<void> {
	await request({ url: `${FEATURED_CATEGORIES_URL}/${id}`, method: 'DELETE' })
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

export const featuredCategoriesApi = {
	listFeaturedCategories,
	createFeaturedCategory,
	updateFeaturedCategory,
	deleteFeaturedCategory,
	reorderFeaturedCategories
}
