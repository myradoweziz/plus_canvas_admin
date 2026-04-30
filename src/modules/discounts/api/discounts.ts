import { request } from '@/shared'
import type { Discount } from '../types/discount'

const DISCOUNTS_URL = '/api/admin/discounts'

async function listDiscounts(): Promise<Discount[]> {
	const { data } = await request({ url: DISCOUNTS_URL, method: 'GET' })
	return data || []
}

function toDiscountPayload(data: Discount) {
	const { image, ...payload } = data
	return image instanceof File ? { ...payload, image } : payload
}

async function createDiscount(data: Discount): Promise<Discount> {
	return await request({ url: DISCOUNTS_URL, method: 'POST', isFormData: true, data: toDiscountPayload(data) })
}

async function updateDiscount(data: Discount): Promise<Discount> {
	return await request({
		url: `${DISCOUNTS_URL}/${data.id}`,
		method: 'POST',
		isFormData: true,
		data: toDiscountPayload(data)
	})
}

async function deleteDiscount(id: number): Promise<void> {
	await request({ url: `${DISCOUNTS_URL}/${id}`, method: 'DELETE' })
}

type ReorderDiscountsPayload = {
	orders: Array<{
		id: number
		order: number
	}>
}

async function reorderDiscounts(data: ReorderDiscountsPayload): Promise<Discount[]> {
	return await request({ url: `${DISCOUNTS_URL}/reorder`, method: 'POST', data })
}

export const discountsApi = {
	listDiscounts,
	createDiscount,
	updateDiscount,
	deleteDiscount,
	reorderDiscounts
}

