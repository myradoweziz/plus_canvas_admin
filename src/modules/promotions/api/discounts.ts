import { request } from '@/shared'
import type { Discount, DiscountPayload } from '../types/discount'

const DISCOUNTS_URL = '/api/admin/discounts'

const toDatetimeLocalValue = (value: unknown): string => {
	if (value == null || value === '') return ''
	const date = value instanceof Date ? value : new Date(String(value))
	if (Number.isNaN(date.getTime())) return ''
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toIdArray = (value: unknown): number[] => {
	if (!Array.isArray(value)) return []

	return value
		.map((item) => {
			if (typeof item === 'number') return item
			if (typeof item === 'object' && item !== null && 'id' in item) {
				return Number((item as { id: unknown }).id)
			}
			return Number(item)
		})
		.filter((id) => Number.isFinite(id) && id > 0)
}

const toIsoDatetime = (value: string): string | null => {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function normalizeDiscount(raw: Record<string, unknown>): Discount {
	return {
		id: raw.id != null ? Number(raw.id) : null,
		name: String(raw.name ?? ''),
		slug: String(raw.slug ?? ''),
		discount_type_id:
			raw.discount_type_id != null
				? Number(raw.discount_type_id)
				: (raw.discount_type as { id?: number } | undefined)?.id != null
					? Number((raw.discount_type as { id: number }).id)
					: null,
		is_percentage: !!raw.is_percentage,
		amount: Number(raw.amount ?? 0),
		start_date: toDatetimeLocalValue(raw.start_date),
		end_date: toDatetimeLocalValue(raw.end_date),
		is_active: raw.is_active !== false,
		min_order_amount: Number(raw.min_order_amount ?? 0),
		target_categories: toIdArray(raw.target_categories),
		target_sub_categories: toIdArray(raw.target_sub_categories),
		target_products: toIdArray(raw.target_products),
		discount_type: (raw.discount_type as Discount['discount_type']) ?? null
	}
}

function toDiscountPayload(discount: Discount): DiscountPayload {
	return {
		name: discount.name.trim(),
		slug: discount.slug.trim(),
		discount_type_id: discount.discount_type_id,
		is_percentage: discount.is_percentage,
		amount: Number(discount.amount) || 0,
		start_date: toIsoDatetime(discount.start_date) ?? '',
		end_date: toIsoDatetime(discount.end_date) ?? '',
		is_active: discount.is_active,
		min_order_amount: Number(discount.min_order_amount) || 0,
		target_categories: discount.target_categories,
		target_sub_categories: discount.target_sub_categories,
		target_products: discount.target_products
	}
}

async function listDiscounts(): Promise<Discount[]> {
	const response = await request({ url: DISCOUNTS_URL, method: 'GET' })
	const items = Array.isArray(response) ? response : response?.data || response?.items || []
	return items.map((item: Record<string, unknown>) => normalizeDiscount(item))
}

async function createDiscount(discount: Discount): Promise<Discount> {
	const response = await request({ url: DISCOUNTS_URL, method: 'POST', data: toDiscountPayload(discount) })
	return normalizeDiscount(response?.data || response)
}

async function updateDiscount(discount: Discount): Promise<Discount> {
	const response = await request({
		url: `${DISCOUNTS_URL}/${discount.id}`,
		method: 'PUT',
		data: toDiscountPayload(discount)
	})
	return normalizeDiscount(response?.data || response)
}

async function deleteDiscount(id: number): Promise<void> {
	await request({ url: `${DISCOUNTS_URL}/${id}`, method: 'DELETE' })
}

export const discountsApi = {
	listDiscounts,
	createDiscount,
	updateDiscount,
	deleteDiscount
}
