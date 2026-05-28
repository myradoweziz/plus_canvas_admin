import { request } from '@/shared'
import type { Cart } from '../types'

const CARTS_URL = '/api/admin/carts'

export const cartsApi = {
	getCarts
}

async function getCarts(filters: { offset: number; limit: number }): Promise<{ data: Cart[]; total: number }> {
	const response = await request({ url: `${CARTS_URL}`, method: 'GET', params: filters })
	return response as { data: Cart[]; total: number }
}
