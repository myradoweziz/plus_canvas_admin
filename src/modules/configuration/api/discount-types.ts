import { request } from '@/shared'
import type { NameSlugEntity, NameSlugEntityPayload } from '../types'

const DISCOUNT_TYPES_URL = '/api/admin/discount-types'

function toPayload(entity: NameSlugEntity): NameSlugEntityPayload {
	return {
		name: entity.name,
		slug: entity.slug
	}
}

async function listDiscountTypes(): Promise<NameSlugEntity[]> {
	const response = await request({ url: DISCOUNT_TYPES_URL, method: 'GET' })
	return Array.isArray(response) ? response : response?.data || response?.items || []
}

async function createDiscountType(entity: NameSlugEntity): Promise<NameSlugEntity> {
	return await request({ url: DISCOUNT_TYPES_URL, method: 'POST', data: toPayload(entity) })
}

async function updateDiscountType(entity: NameSlugEntity): Promise<NameSlugEntity> {
	return await request({
		url: `${DISCOUNT_TYPES_URL}/${entity.id}`,
		method: 'PUT',
		data: toPayload(entity)
	})
}

async function deleteDiscountType(id: number): Promise<void> {
	await request({ url: `${DISCOUNT_TYPES_URL}/${id}`, method: 'DELETE' })
}

export const discountTypesApi = {
	listDiscountTypes,
	createDiscountType,
	updateDiscountType,
	deleteDiscountType
}
