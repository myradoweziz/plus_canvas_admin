import { getTotal, request } from '@/shared'
import type { Brand, BrandPayload } from '../types/brand'

const BRANDS_URL = '/api/admin/brands'

export type ListBrandsParams = {
	name?: string
	featured_order?: number
	limit: number
	offset: number
}

export type ListBrandsResult = {
	items: Brand[]
	total: number
}

async function listBrands(params: ListBrandsParams): Promise<ListBrandsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: BRANDS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toBrandPayload(brand: Brand): BrandPayload {
	return {
		name: brand.name,
		slug: brand.slug,
		is_active: brand.is_active,
		featured_order: brand.featured_order
	}
}

async function createBrand(brand: Brand): Promise<Brand> {
	return await request({ url: BRANDS_URL, method: 'POST', data: toBrandPayload(brand) })
}

async function updateBrand(brand: Brand): Promise<Brand> {
	return await request({
		url: `${BRANDS_URL}/${brand.id}`,
		method: 'POST',
		data: toBrandPayload(brand)
	})
}

async function deleteBrand(id: number): Promise<void> {
	await request({ url: `${BRANDS_URL}/${id}`, method: 'DELETE' })
}

type ReorderBrandsPayload = {
	items: Array<{
		id: number
		featured_order: number
	}>
}

async function reorderBrands(data: ReorderBrandsPayload): Promise<Brand[]> {
	return await request({ url: `${BRANDS_URL}/reorder`, method: 'POST', data })
}

export const brandsApi = {
	listBrands,
	createBrand,
	updateBrand,
	deleteBrand,
	reorderBrands
}
