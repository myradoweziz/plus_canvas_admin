import { downloadTextFile } from '@/composables'
import { getTotal, request } from '@/shared'
import type { MainCategory, MainCategoryPayload } from '../types/category'

export const mainCategoriesApi = {
	listMainCategories,
	createMainCategory,
	updateMainCategory,
	deleteMainCategory,
	reorderMainCategories,
	exportMainCategoriesXml
}

const MAIN_CATEGORIES_URL = '/api/admin/main-categories'

export type ListMainCategoriesParams = {
	name?: string
	limit: number
	offset: number
}

export type ListMainCategoriesResult = {
	items: MainCategory[]
	total: number
}

type ImageItem = string | { url?: string | null; path?: string | null }

const toImageUrls = (items: ImageItem[] | null | undefined): string[] => {
	if (!Array.isArray(items)) return []
	return items
		.map((item) => (typeof item === 'string' ? item : item.url || item.path || null))
		.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

const normalizeMainCategory = (item: any): MainCategory => ({
	...item,
	description: item?.description ?? '',
	images: toImageUrls(item?.images),
	meta_title: item?.meta_title ?? '',
	meta_description: item?.meta_description ?? ''
})

async function listMainCategories(params: ListMainCategoriesParams): Promise<ListMainCategoriesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: MAIN_CATEGORIES_URL, method: 'GET', params: filteredParams })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	const items = Array.isArray(rawItems) ? rawItems.map(normalizeMainCategory) : []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toMainCategoryPayload(category: MainCategory): MainCategoryPayload {
	return {
		name: category.name,
		slug: category.slug,
		description: category.description,
		images: category.images,
		is_active: category.is_active,
		featured_order: category.featured_order,
		category_type: category.category_type,
		meta_title: category.meta_title ?? '',
		meta_description: category.meta_description ?? ''
	}
}

function toMainCategoryFormData(category: MainCategory): Record<string, any> {
	const payload = toMainCategoryPayload(category)
	const data: Record<string, any> = {
		...payload
	}

	delete data.images
	payload.images.forEach((image, index) => {
		data[`images[${index}]`] = image
	})

	return data
}

async function createMainCategory(category: MainCategory): Promise<MainCategory> {
	return await request({
		url: MAIN_CATEGORIES_URL,
		method: 'POST',
		data: toMainCategoryFormData(category),
		isFormData: true
	})
}

async function updateMainCategory(category: MainCategory): Promise<MainCategory> {
	return await request({
		url: `${MAIN_CATEGORIES_URL}/${category.id}`,
		method: 'PUT',
		data: toMainCategoryFormData(category),
		isFormData: true
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

async function exportMainCategoriesXml(): Promise<void> {
	const response = await request({
		url: `${MAIN_CATEGORIES_URL}/export/xml`,
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

	downloadTextFile(xml, 'main_categories.xml', 'application/xml;charset=utf-8')
}
