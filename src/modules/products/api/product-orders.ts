import { request } from '@/shared'
import type { CanvasProductOrder } from '../types/product-order'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'

const ordersUrl = (productId: number) => `${CANVAS_PRODUCTS_URL}/${productId}/orders`

const normalizeCanvasProductOrder = (row: Record<string, unknown>): CanvasProductOrder => ({
	id: Number(row.id ?? 0),
	email: String(row.email ?? ''),
	order_status: String(row.order_status ?? ''),
	payment_status: String(row.payment_status ?? ''),
	delivery_status: String(row.delivery_status ?? ''),
	created_at: String(row.created_at ?? '')
})

async function listCanvasProductOrders(productId: number): Promise<CanvasProductOrder[]> {
	const response = await request({ url: ordersUrl(productId), method: 'GET' })
	const raw = Array.isArray(response) ? response : response?.data || []

	return raw.map((item: Record<string, unknown>) => normalizeCanvasProductOrder(item))
}

export const productOrdersApi = {
	listCanvasProductOrders
}
