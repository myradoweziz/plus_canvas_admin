import { downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import type { SubCategory, SubCategoryPayload } from '../types/category'

export const subCategoriesApi = {
	listSubCategories,
	createSubCategory,
	updateSubCategory,
	deleteSubCategory,
	reorderSubCategories,
	exportSubCategoriesXml
}

const SUB_CATEGORIES_URL = '/api/admin/sub-categories'

export type ListSubCategoriesParams = {
	name?: string
	category_id?: number
	limit: number
	offset: number
}

export type ListSubCategoriesResult = {
	items: SubCategory[]
	total: number
}

async function listSubCategories(params: ListSubCategoriesParams): Promise<ListSubCategoriesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: SUB_CATEGORIES_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toSubCategoryPayload(category: SubCategory): SubCategoryPayload {
	return {
		category_id: category.category_id,
		name: category.name,
		slug: category.slug,
		image: category.image || category.image_url || '',
		is_active: category.is_active,
		featured_order: category.featured_order,
		meta_title: category.meta_title ?? '',
		meta_description: category.meta_description ?? ''
	}
}

async function createSubCategory(category: SubCategory): Promise<SubCategory> {
	return await request({ url: SUB_CATEGORIES_URL, method: 'POST', data: toSubCategoryPayload(category) })
}

async function updateSubCategory(category: SubCategory): Promise<SubCategory> {
	return await request({
		url: `${SUB_CATEGORIES_URL}/${category.id}`,
		method: 'PUT',
		data: toSubCategoryPayload(category)
	})
}

async function deleteSubCategory(id: number): Promise<void> {
	await request({ url: `${SUB_CATEGORIES_URL}/${id}`, method: 'DELETE' })
}

type ReorderSubCategoriesPayload = {
	items: Array<{
		id: number
		featured_order: number
	}>
}

async function reorderSubCategories(data: ReorderSubCategoriesPayload): Promise<SubCategory[]> {
	return await request({ url: `${SUB_CATEGORIES_URL}/reorder`, method: 'POST', data })
}

async function exportSubCategoriesXml(): Promise<void> {
	const response = await request({
		url: `${SUB_CATEGORIES_URL}/export/xml`,
		method: 'GET',
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

	downloadTextFile(xml, 'sub_categories.xml', 'application/xml;charset=utf-8')
}
