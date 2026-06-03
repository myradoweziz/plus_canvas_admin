import { request } from '@/shared'
import type { PaymentMethodRestriction, PaymentMethodRestrictionsPayload } from '../types'

const PAYMENT_METHOD_RESTRICTIONS_URL = '/api/admin/payment-method-restrictions'

const normalizeRestriction = (row: Record<string, unknown>): PaymentMethodRestriction => ({
	country_id: Number(row.country_id ?? 0),
	is_restricted: !!row.is_restricted
})

const extractRestrictions = (response: unknown): PaymentMethodRestriction[] => {
	if (!response) return []

	const payload = response as Record<string, unknown>
	const nested = payload.data as Record<string, unknown> | undefined
	const raw = payload.restrictions ?? nested?.restrictions ?? (Array.isArray(response) ? response : nested)

	if (!Array.isArray(raw)) return []

	return raw
		.map((item) => normalizeRestriction(item as Record<string, unknown>))
		.filter((item) => Number.isFinite(item.country_id) && item.country_id > 0)
}

async function getPaymentMethodRestrictions(): Promise<PaymentMethodRestriction[]> {
	const response = await request({ url: PAYMENT_METHOD_RESTRICTIONS_URL, method: 'GET' })
	return extractRestrictions(response)
}

async function updatePaymentMethodRestrictions(payload: PaymentMethodRestrictionsPayload): Promise<void> {
	await request({
		url: PAYMENT_METHOD_RESTRICTIONS_URL,
		method: 'POST',
		data: {
			restrictions: payload.restrictions.map((item) => ({
				country_id: Number(item.country_id) || 0,
				is_restricted: !!item.is_restricted
			}))
		}
	})
}

export const paymentMethodRestrictionsApi = {
	getPaymentMethodRestrictions,
	updatePaymentMethodRestrictions
}
