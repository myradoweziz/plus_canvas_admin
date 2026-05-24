import { createSubresourceApi } from '@/shared/api/createSubresourceApi'
import type { CanvasProductOrder } from '../types/product-order'

const CANVAS_PRODUCTS_URL = '/api/admin/canvas-products'

const normalizeCanvasProductOrder = (row: Record<string, unknown>): CanvasProductOrder => ({
	id: Number(row.id ?? 0),
	email: String(row.email ?? ''),
	order_status: String(row.order_status ?? ''),
	payment_status: String(row.payment_status ?? ''),
	delivery_status: String(row.delivery_status ?? ''),
	created_at: String(row.created_at ?? '')
})

const ordersApi = createSubresourceApi<CanvasProductOrder & { id: number | null }>({
	baseUrl: CANVAS_PRODUCTS_URL,
	resourcePath: 'orders',
	normalize: normalizeCanvasProductOrder
})

export const productOrdersApi = {
	listCanvasProductOrders: ordersApi.list
}
