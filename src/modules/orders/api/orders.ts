import { downloadBlob, downloadTextFile } from '@/composables'
import { request } from '@/shared'
import { createListApi, filterListParams } from '@/shared/api/createListApi'
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

export type ExportOrdersParams = {
	ids: number[]
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
	subtotal: number
	tax: number
	shipping_cost: number
	discount_amount: number
	total: number
}

async function updateOrder(id: number, data: UpdateOrderPayload): Promise<Order> {
	const response = await request({
		url: `${ORDERS_URL}/${id}`,
		method: 'PUT',
		data
	})
	return (response?.data ?? response) as Order
}

async function deleteOrder(id: number): Promise<void> {
	await request({ url: `${ORDERS_URL}/${id}`, method: 'DELETE' })
}

async function bulkDeleteOrders(ids: number[]): Promise<void> {
	await request({
		url: `${ORDERS_URL}/bulk-delete`,
		method: 'POST',
		data: { ids }
	})
}

export type UpdateOrderBillingPayload = {
	billing_first_name: string
	billing_last_name: string
	billing_email: string
	billing_phone: string
	billing_company: string
	billing_address: string
	billing_city: string
	billing_district: string
	billing_postal_code: string
	billing_country: string
	billing_tax_number: string
	billing_tax_office: string
}

async function updateOrderBillingAddress(id: number, data: UpdateOrderBillingPayload): Promise<Order> {
	const response = await request({
		url: `${ORDERS_URL}/${id}/billing-address`,
		method: 'PUT',
		data
	})
	return (response?.data ?? response) as Order
}

export type UpdateOrderShippingPayload = {
	first_name: string
	last_name: string
	email: string
	phone: string
	company: string
	address: string
	city: string
	district: string
	postal_code: string
	country: string
	shipping_method: string
}

async function updateOrderShippingAddress(id: number, data: UpdateOrderShippingPayload): Promise<Order> {
	const response = await request({
		url: `${ORDERS_URL}/${id}/shipping-address`,
		method: 'PUT',
		data
	})
	return (response?.data ?? response) as Order
}

const exportParams = (params?: ExportOrdersParams) => filterListParams((params ?? {}) as Record<string, unknown>)

async function exportOrdersXml(params?: ExportOrdersParams): Promise<void> {
	const response = await request({
		url: `${ORDERS_URL}/export/xml`,
		method: 'GET',
		params: exportParams(params),
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml =
		typeof response === 'string'
			? response
			: typeof (response as { data?: string })?.data === 'string'
				? (response as { data: string }).data
				: ''

	if (!xml.trim()) {
		throw new Error('Пустой ответ XML')
	}

	downloadTextFile(xml, 'orders.xml', 'application/xml;charset=utf-8')
}

async function exportOrdersPdf(params?: ExportOrdersParams): Promise<void> {
	const response = await request({
		url: `${ORDERS_URL}/export/pdf`,
		method: 'GET',
		params: exportParams(params),
		headers: { Accept: 'application/pdf' },
		responseType: 'blob'
	})

	downloadBlob(response as Blob, 'orders.pdf')
}

async function exportOrdersExcel(params?: ExportOrdersParams): Promise<void> {
	const response = await request({
		url: `${ORDERS_URL}/export/excel`,
		method: 'GET',
		params: exportParams(params),
		responseType: 'blob'
	})

	downloadBlob(response as Blob, 'orders.xlsx')
}

export const ordersApi = {
	listOrders,
	getOrder,
	updateOrder,
	updateOrderBillingAddress,
	updateOrderShippingAddress,
	deleteOrder,
	bulkDeleteOrders,
	exportOrdersXml,
	exportOrdersPdf,
	exportOrdersExcel
}
