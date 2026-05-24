import { getTotal, request } from '@/shared'
import type { CanvasEffect, CanvasEffectPayload } from '../types/canvas-effect'

const CANVAS_EFFECTS_URL = '/api/admin/canvas-effects'

export type ListCanvasEffectsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListCanvasEffectsResult = {
	items: CanvasEffect[]
	total: number
}

async function listCanvasEffects(params: ListCanvasEffectsParams): Promise<ListCanvasEffectsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: CANVAS_EFFECTS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toCanvasEffectPayload(effect: CanvasEffect): CanvasEffectPayload {
	return {
		name: effect.name,
		image: effect.image || effect.image_url || '',
		is_active: effect.is_active,
		sort_order: effect.sort_order
	}
}

async function createCanvasEffect(effect: CanvasEffect): Promise<CanvasEffect> {
	return await request({ url: CANVAS_EFFECTS_URL, method: 'POST', data: toCanvasEffectPayload(effect) })
}

async function updateCanvasEffect(effect: CanvasEffect): Promise<CanvasEffect> {
	return await request({
		url: `${CANVAS_EFFECTS_URL}/${effect.id}`,
		method: 'PUT',
		data: toCanvasEffectPayload(effect)
	})
}

async function deleteCanvasEffect(id: number): Promise<void> {
	await request({ url: `${CANVAS_EFFECTS_URL}/${id}`, method: 'DELETE' })
}

export const canvasEffectsApi = {
	listCanvasEffects,
	createCanvasEffect,
	updateCanvasEffect,
	deleteCanvasEffect
}
