import { request } from '@/shared'
import type { NameSlugEntity, NameSlugEntityPayload } from '../types'

const DISCOUNT_LIMITATIONS_URL = '/api/admin/discount-limitations'

function toPayload(entity: NameSlugEntity): NameSlugEntityPayload {
	return {
		name: entity.name,
		slug: entity.slug
	}
}

async function listDiscountLimitations(): Promise<NameSlugEntity[]> {
	const response = await request({ url: DISCOUNT_LIMITATIONS_URL, method: 'GET' })
	return Array.isArray(response) ? response : response?.data || response?.items || []
}

async function createDiscountLimitation(entity: NameSlugEntity): Promise<NameSlugEntity> {
	return await request({ url: DISCOUNT_LIMITATIONS_URL, method: 'POST', data: toPayload(entity) })
}

async function updateDiscountLimitation(entity: NameSlugEntity): Promise<NameSlugEntity> {
	return await request({
		url: `${DISCOUNT_LIMITATIONS_URL}/${entity.id}`,
		method: 'PUT',
		data: toPayload(entity)
	})
}

async function deleteDiscountLimitation(id: number): Promise<void> {
	await request({ url: `${DISCOUNT_LIMITATIONS_URL}/${id}`, method: 'DELETE' })
}

export const discountLimitationsApi = {
	listDiscountLimitations,
	createDiscountLimitation,
	updateDiscountLimitation,
	deleteDiscountLimitation
}
