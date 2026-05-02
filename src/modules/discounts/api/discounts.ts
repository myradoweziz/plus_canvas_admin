import { getTotal, request } from '@/shared'
import type { Discount } from '../types/discount'

const DISCOUNTS_URL = '/api/admin/discounts'

export type ListDiscountsParams = {
	title?: string
	order?: number
	limit: number
	offset: number
}

export type ListDiscountsResult = {
	items: Discount[]
	total: number
}

async function listDiscounts(params: ListDiscountsParams): Promise<ListDiscountsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: DISCOUNTS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
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
	items: Array<{
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
