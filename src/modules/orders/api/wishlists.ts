import { request } from '@/shared'
import type { Wishlist } from '../types'

const WISHLISTS_URL = '/api/admin/wishlists'

export const wishlistsApi = {
	getWishlists
}

async function getWishlists(filters: { offset: number; limit: number }): Promise<{ data: Wishlist[]; total: number }> {
	const response = await request({ url: `${WISHLISTS_URL}`, method: 'GET', params: filters })
	return response as { data: Wishlist[]; total: number }
}
