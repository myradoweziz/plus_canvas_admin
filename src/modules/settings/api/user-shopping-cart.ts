import { request } from '@/shared'
import type { UserShoppingCartItem, UserShoppingCartProduct } from '../types/user-shopping-cart'

const USERS_URL = '/api/admin/users'

const normalizeProduct = (item: any): UserShoppingCartProduct | null => {
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

const normalizeOptions = (value: any): UserShoppingCartItem['options'] => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null
	const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '')
	if (!entries.length) return null
	return Object.fromEntries(entries.map(([k, v]) => [k, String(v)]))
}

const normalizeUserShoppingCartItem = (item: any): UserShoppingCartItem => ({
	id: Number(item?.id),
	cart_id: Number(item?.cart_id),
	canvas_product_id: Number(item?.canvas_product_id),
	quantity: Number(item?.quantity ?? 0),
	options: normalizeOptions(item?.options),
	created_at: String(item?.created_at ?? ''),
	updated_at: String(item?.updated_at ?? ''),
	canvas_product: normalizeProduct(item?.canvas_product)
})

async function getUserShoppingCart(userId: number): Promise<UserShoppingCartItem[]> {
	const response = await request({ url: `${USERS_URL}/${userId}/shopping-cart`, method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || []
	return Array.isArray(rawItems) ? rawItems.map(normalizeUserShoppingCartItem) : []
}

export const userShoppingCartApi = {
	getUserShoppingCart
}
