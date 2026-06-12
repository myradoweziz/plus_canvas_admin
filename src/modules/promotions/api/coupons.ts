import { request } from '@/shared'
import type { Coupon, CouponPayload } from '../types/coupon'

const COUPONS_URL = '/api/admin/coupons'

const toDatetimeLocalValue = (value: unknown): string => {
	if (value == null || value === '') return ''
	const date = value instanceof Date ? value : new Date(String(value))
	if (Number.isNaN(date.getTime())) return ''
	const pad = (n: number) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toIsoDatetime = (value: string): string | null => {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const toIdArray = (value: unknown): number[] => {
	if (!Array.isArray(value)) {
		if (value == null || value === '' || value === 0) return []
		const id = Number(value)
		return Number.isFinite(id) && id > 0 ? [id] : []
	}

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

export function normalizeCoupon(raw: Record<string, unknown>): Coupon {
	return {
		id: raw.id != null ? Number(raw.id) : null,
		code: String(raw.code ?? ''),
		discount_type_id:
			raw.discount_type_id != null
				? Number(raw.discount_type_id)
				: (raw.discount_type as { id?: number } | undefined)?.id != null
					? Number((raw.discount_type as { id: number }).id)
					: null,
		is_percentage: !!raw.is_percentage,
		amount: Number(raw.amount ?? 0),
		min_order_amount: Number(raw.min_order_amount ?? 0),
		usage_limit: Number(raw.usage_limit ?? 0),
		start_date: toDatetimeLocalValue(raw.start_date),
		end_date: toDatetimeLocalValue(raw.end_date),
		user_ids: toIdArray(raw.user_ids ?? raw.user_id ?? raw.users ?? raw.user),
		is_active: raw.is_active !== false,
		discount_type: (raw.discount_type as Coupon['discount_type']) ?? null,
		users: Array.isArray(raw.users)
			? (raw.users as Coupon['users'])
			: raw.user
				? [raw.user as NonNullable<Coupon['users']>[number]]
				: []
	}
}

function toCouponPayload(coupon: Coupon): CouponPayload {
	return {
		code: coupon.code.trim(),
		discount_type_id: coupon.discount_type_id,
		is_percentage: coupon.is_percentage,
		amount: Number(coupon.amount) || 0,
		min_order_amount: Number(coupon.min_order_amount) || 0,
		usage_limit: Number(coupon.usage_limit) || 0,
		start_date: toIsoDatetime(coupon.start_date) ?? '',
		end_date: toIsoDatetime(coupon.end_date) ?? '',
		user_ids: coupon.user_ids,
		is_active: coupon.is_active
	}
}

async function listCoupons(): Promise<Coupon[]> {
	const response = await request({ url: COUPONS_URL, method: 'GET' })
	const items = Array.isArray(response) ? response : response?.data || response?.items || []
	return items.map((item: Record<string, unknown>) => normalizeCoupon(item))
}

async function createCoupon(coupon: Coupon): Promise<Coupon> {
	const response = await request({ url: COUPONS_URL, method: 'POST', data: toCouponPayload(coupon) })
	return normalizeCoupon(response?.data || response)
}

async function updateCoupon(coupon: Coupon): Promise<Coupon> {
	const response = await request({
		url: `${COUPONS_URL}/${coupon.id}`,
		method: 'PUT',
		data: toCouponPayload(coupon)
	})
	return normalizeCoupon(response?.data || response)
}

async function deleteCoupon(id: number): Promise<void> {
	await request({ url: `${COUPONS_URL}/${id}`, method: 'DELETE' })
}

export const couponsApi = {
	listCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon
}
