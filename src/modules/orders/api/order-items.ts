import { request } from '@/shared'
import type { OrderItem } from '../types'

const ordersUrl = (orderId: number) => `/api/admin/orders/${orderId}`

export type UpdateOrderItemPayload = {
	quantity: number
	price: number
	discount_amount: number
	total: number
}

async function updateOrderItem(orderId: number, itemId: number, data: UpdateOrderItemPayload): Promise<OrderItem> {
	const response = await request({
		url: `${ordersUrl(orderId)}/items/${itemId}`,
		method: 'PUT',
		data
	})
	return (response?.data ?? response) as OrderItem
}

export const orderItemsApi = {
	updateOrderItem
}
