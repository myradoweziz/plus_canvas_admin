import { request } from '@/shared'
import type { Banner } from '../types/banner'

const BANNERS_URL = '/api/admin/banners'

async function listBanners(): Promise<Banner[]> {
	const { data } = await request({ url: BANNERS_URL, method: 'GET' })
	return data || []
}

async function createBanner(data: Banner): Promise<Banner> {
	return await request({ url: BANNERS_URL, method: 'POST', data })
}

async function updateBanner(data: Banner) {
	return await request({
		url: `${BANNERS_URL}/${data.id}`,
		method: 'PUT',
		data
	})
}

async function deleteBanner(id: number): Promise<void> {
	await request({ url: `${BANNERS_URL}/${id}`, method: 'DELETE' })
}

type ReorderBannersPayload = {
	orders: Array<{
		id: number
		order: number
	}>
}

async function reorderBanners(data: ReorderBannersPayload): Promise<Banner[]> {
	return await request({ url: `${BANNERS_URL}/reorder`, method: 'POST', data })
}

export const bannersApi = {
	listBanners,
	createBanner,
	updateBanner,
	deleteBanner,
	reorderBanners
}
