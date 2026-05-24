import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Order } from '../types'

const ORDERS_URL = '/api/admin/orders'

export type ListOrdersParams = {
	date_from?: string
	date_to?: string
	email?: string
	order_status?: string
	payment_status?: string
	delivery_status?: string
	order_number?: string
	product_id?: number
	limit: number
	offset: number
}

const listOrders = createListApi<Order, ListOrdersParams>({ url: ORDERS_URL })

async function getOrder(id: number): Promise<Order> {
	const response = await request({ url: `${ORDERS_URL}/${id}`, method: 'GET' })
	return (response?.data ?? response) as Order
}

export type UpdateOrderPayload = {
	order_status: string
	payment_status: string
	delivery_status: string
	transaction_id: string
	discount_name: string
}

async function updateOrder(id: number, data: UpdateOrderPayload): Promise<Order> {
	const response = await request({
		url: `${ORDERS_URL}/${id}`,
		method: 'PUT',
		data
	})
	return (response?.data ?? response) as Order
}

export const ordersApi = {
	listOrders,
	getOrder,
	updateOrder
}
