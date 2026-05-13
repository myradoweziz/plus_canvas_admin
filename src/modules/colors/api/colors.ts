import { getTotal, request } from '@/shared'
import type { Color, ColorPayload } from '../types/color'

const COLORS_URL = '/api/admin/colors'

export type ListColorsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListColorsResult = {
	items: Color[]
	total: number
}

async function listColors(params: ListColorsParams): Promise<ListColorsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: COLORS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toColorPayload(color: Color): ColorPayload {
	return {
		name: color.name,
		hex_code: color.hex_code,
		is_active: color.is_active,
		image: color.image || ''
	}
}

async function createColor(color: Color): Promise<Color> {
	return await request({ url: COLORS_URL, method: 'POST', data: toColorPayload(color) })
}

async function updateColor(color: Color): Promise<Color> {
	return await request({ url: `${COLORS_URL}/${color.id}`, method: 'PUT', data: toColorPayload(color) })
}

async function deleteColor(id: number): Promise<void> {
	await request({ url: `${COLORS_URL}/${id}`, method: 'DELETE' })
}

export const colorsApi = {
	listColors,
	createColor,
	updateColor,
	deleteColor
}
