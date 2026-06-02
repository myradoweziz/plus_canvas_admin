import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { ShippingMethod, ShippingMethodPayload } from '../types'

const SHIPPING_METHODS_URL = '/api/admin/shipping-methods'

export type ListShippingMethodsParams = {
	limit: number
	offset: number
}

const listShippingMethods = createListApi<ShippingMethod, ListShippingMethodsParams>({ url: SHIPPING_METHODS_URL })

function toPayload(method: ShippingMethod): ShippingMethodPayload {
	return {
		name: method.name,
		description: method.description,
		display_order: Number(method.display_order) || 0
	}
}

async function getShippingMethodById(id: number): Promise<ShippingMethod> {
	return await request({ url: `${SHIPPING_METHODS_URL}/${id}`, method: 'GET' })
}

async function createShippingMethod(method: ShippingMethod): Promise<ShippingMethod> {
	return await request({ url: SHIPPING_METHODS_URL, method: 'POST', data: toPayload(method) })
}

async function updateShippingMethod(method: ShippingMethod): Promise<ShippingMethod> {
	return await request({ url: `${SHIPPING_METHODS_URL}/${method.id}`, method: 'PUT', data: toPayload(method) })
}

async function deleteShippingMethod(id: number): Promise<void> {
	await request({ url: `${SHIPPING_METHODS_URL}/${id}`, method: 'DELETE' })
}

export const shippingMethodsApi = {
	listShippingMethods,
	getShippingMethodById,
	createShippingMethod,
	updateShippingMethod,
	deleteShippingMethod
}

