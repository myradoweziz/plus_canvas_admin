import { request } from '@/shared'
import type { Brand, BrandPayload } from '../types/brand'

const BRANDS_URL = '/api/admin/brands'

async function listBrands(): Promise<Brand[]> {
	const { data } = await request({ url: BRANDS_URL, method: 'GET' })
	return data || []
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
		method: 'PUT',
		data: toBrandPayload(brand)
	})
}

async function deleteBrand(id: number): Promise<void> {
	await request({ url: `${BRANDS_URL}/${id}`, method: 'DELETE' })
}

type ReorderBrandsPayload = {
	orders: Array<{
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

