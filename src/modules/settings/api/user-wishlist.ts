import { request } from '@/shared'
import type { UserWishlistItem, UserWishlistProduct } from '../types/user-wishlist'

const USERS_URL = '/api/admin/users'

const normalizeProduct = (item: any): UserWishlistProduct | null => {
	if (!item || typeof item !== 'object') return null
	return {
		id: Number(item.id),
		name: String(item.name ?? ''),
		slug: item.slug ?? '',
		price: String(item.price ?? ''),
		images: Array.isArray(item.images)
			? item.images.map((image: any) => ({
					path: String(image?.path ?? ''),
					url: String(image?.url ?? '')
				}))
			: []
	}
}

const normalizeOptions = (value: any): UserWishlistItem['options'] => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null
	const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '')
	if (!entries.length) return null
	return Object.fromEntries(entries.map(([k, v]) => [k, String(v)]))
}

const normalizeUserWishlistItem = (item: any): UserWishlistItem => ({
	id: Number(item?.id),
	wishlist_id: Number(item?.wishlist_id),
	canvas_product_id: Number(item?.canvas_product_id),
	options: normalizeOptions(item?.options),
	created_at: String(item?.created_at ?? ''),
	updated_at: String(item?.updated_at ?? ''),
	canvas_product: normalizeProduct(item?.canvas_product)
})

async function getUserWishlist(userId: number): Promise<UserWishlistItem[]> {
	const response = await request({ url: `${USERS_URL}/${userId}/wishlist`, method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	return Array.isArray(rawItems) ? rawItems.map(normalizeUserWishlistItem) : []
}

export const userWishlistApi = {
	getUserWishlist
}
