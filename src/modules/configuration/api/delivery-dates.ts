import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { DeliveryDate, DeliveryDatePayload } from '../types'

const DELIVERY_DATES_URL = '/api/admin/delivery-dates'

export type ListDeliveryDatesParams = {
	limit: number
	offset: number
}

const listDeliveryDates = createListApi<DeliveryDate, ListDeliveryDatesParams>({ url: DELIVERY_DATES_URL })

function toPayload(item: DeliveryDate): DeliveryDatePayload {
	return {
		name: item.name.trim(),
		display_order: Number(item.display_order) || 0
	}
}

async function getDeliveryDateById(id: number): Promise<DeliveryDate> {
	return await request({ url: `${DELIVERY_DATES_URL}/${id}`, method: 'GET' })
}

async function createDeliveryDate(item: DeliveryDate): Promise<DeliveryDate> {
	return await request({ url: DELIVERY_DATES_URL, method: 'POST', data: toPayload(item) })
}

async function updateDeliveryDate(item: DeliveryDate): Promise<DeliveryDate> {
	return await request({ url: `${DELIVERY_DATES_URL}/${item.id}`, method: 'PUT', data: toPayload(item) })
}

async function deleteDeliveryDate(id: number): Promise<void> {
	await request({ url: `${DELIVERY_DATES_URL}/${id}`, method: 'DELETE' })
}

export const deliveryDatesApi = {
	listDeliveryDates,
	getDeliveryDateById,
	createDeliveryDate,
	updateDeliveryDate,
	deleteDeliveryDate
}
