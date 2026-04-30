import { request } from '@/shared'
import type { Category, CategoryPayload } from '../types/category'

const CATEGORIES_URL = '/api/admin/categories'

async function listCategories(): Promise<Category[]> {
	const { data } = await request({ url: CATEGORIES_URL, method: 'GET' })
	return data || []
}

function toCategoryPayload(category: Category): CategoryPayload {
	return {
		name: category.name,
		slug: category.slug,
		is_active: category.is_active,
		featured_order: category.featured_order
	}
}

async function createCategory(category: Category): Promise<Category> {
	return await request({ url: CATEGORIES_URL, method: 'POST', data: toCategoryPayload(category) })
}

async function updateCategory(category: Category): Promise<Category> {
	return await request({
		url: `${CATEGORIES_URL}/${category.id}`,
		method: 'PUT',
		data: toCategoryPayload(category)
	})
}

async function deleteCategory(id: number): Promise<void> {
	await request({ url: `${CATEGORIES_URL}/${id}`, method: 'DELETE' })
}

type ReorderCategoriesPayload = {
	items: Array<{
		id: number
		featured_order: number
	}>
}

async function reorderCategories(data: ReorderCategoriesPayload): Promise<Category[]> {
	return await request({ url: `${CATEGORIES_URL}/reorder`, method: 'POST', data })
}

export const categoriesApi = {
	listCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	reorderCategories
}
