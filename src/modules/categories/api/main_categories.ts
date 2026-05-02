import { getTotal, request } from '@/shared'
import type { MainCategory, MainCategoryPayload } from '../types/category'

const MAIN_CATEGORIES_URL = '/api/admin/main-categories'

export type ListMainCategoriesParams = {
	name?: string
	featured_order?: number
	limit: number
	offset: number
}

export type ListMainCategoriesResult = {
	items: MainCategory[]
	total: number
}

async function listMainCategories(params: ListMainCategoriesParams): Promise<ListMainCategoriesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: MAIN_CATEGORIES_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toMainCategoryPayload(category: MainCategory): MainCategoryPayload {
	return {
		name: category.name,
		slug: category.slug,
		is_active: category.is_active,
		featured_order: category.featured_order
	}
}

async function createMainCategory(category: MainCategory): Promise<MainCategory> {
	return await request({ url: MAIN_CATEGORIES_URL, method: 'POST', data: toMainCategoryPayload(category) })
}

async function updateMainCategory(category: MainCategory): Promise<MainCategory> {
	return await request({
		url: `${MAIN_CATEGORIES_URL}/${category.id}`,
		method: 'POST',
		data: toMainCategoryPayload(category)
	})
}

async function deleteMainCategory(id: number): Promise<void> {
	await request({ url: `${MAIN_CATEGORIES_URL}/${id}`, method: 'DELETE' })
}

type ReorderMainCategoriesPayload = {
	items: Array<{
		id: number
		featured_order: number
	}>
}

async function reorderMainCategories(data: ReorderMainCategoriesPayload): Promise<MainCategory[]> {
	return await request({ url: `${MAIN_CATEGORIES_URL}/reorder`, method: 'POST', data })
}

export const mainCategoriesApi = {
	listMainCategories,
	createMainCategory,
	updateMainCategory,
	deleteMainCategory,
	reorderMainCategories
}
