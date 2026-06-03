import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { PaymentMethod, PaymentMethodPayload } from '../types'

const PAYMENT_METHODS_URL = '/api/admin/payment-methods'

export type ListPaymentMethodsParams = {
	limit: number
	offset: number
}

const listPaymentMethods = createListApi<PaymentMethod, ListPaymentMethodsParams>({ url: PAYMENT_METHODS_URL })

function toPayload(method: PaymentMethod): PaymentMethodPayload {
	return {
		friendly_name: method.friendly_name.trim(),
		system_name: method.system_name.trim(),
		logo_path: method.logo_path.trim(),
		supports_capture: !!method.supports_capture,
		supports_refund: !!method.supports_refund,
		supports_partial_refund: !!method.supports_partial_refund,
		supports_void: !!method.supports_void,
		supports_recurring: !!method.supports_recurring,
		display_order: Number(method.display_order) || 0,
		is_active: !!method.is_active
	}
}

async function getPaymentMethodById(id: number): Promise<PaymentMethod> {
	return await request({ url: `${PAYMENT_METHODS_URL}/${id}`, method: 'GET' })
}

async function createPaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
	return await request({ url: PAYMENT_METHODS_URL, method: 'POST', data: toPayload(method) })
}

async function updatePaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
	return await request({
		url: `${PAYMENT_METHODS_URL}/${method.id}`,
		method: 'PUT',
		data: toPayload(method)
	})
}

async function deletePaymentMethod(id: number): Promise<void> {
	await request({ url: `${PAYMENT_METHODS_URL}/${id}`, method: 'DELETE' })
}

export const paymentMethodsApi = {
	listPaymentMethods,
	getPaymentMethodById,
	createPaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod
}
