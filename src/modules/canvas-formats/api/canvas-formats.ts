import { getTotal, request } from '@/shared'
import type { CanvasFormat, CanvasFormatPayload } from '../types/canvas-format'

const CANVAS_FORMATS_URL = '/api/admin/canvas-formats'

export type ListCanvasFormatsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListCanvasFormatsResult = {
	items: CanvasFormat[]
	total: number
}

async function listCanvasFormats(params: ListCanvasFormatsParams): Promise<ListCanvasFormatsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: CANVAS_FORMATS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toCanvasFormatPayload(canvasFormat: CanvasFormat): CanvasFormatPayload {
	return {
		name: canvasFormat.name,
		slug: canvasFormat.slug,
		image: canvasFormat.image || canvasFormat.image_url || '',
		is_active: canvasFormat.is_active,
		sort_order: canvasFormat.sort_order,
		sizes: canvasFormat.sizes.map((size) => ({
			id: size.id,
			sort_order: size.sort_order
		}))
	}
}

async function createCanvasFormat(canvasFormat: CanvasFormat): Promise<CanvasFormat> {
	return await request({ url: CANVAS_FORMATS_URL, method: 'POST', data: toCanvasFormatPayload(canvasFormat) })
}

async function updateCanvasFormat(canvasFormat: CanvasFormat): Promise<CanvasFormat> {
	return await request({
		url: `${CANVAS_FORMATS_URL}/${canvasFormat.id}`,
		method: 'PUT',
		data: toCanvasFormatPayload(canvasFormat)
	})
}

async function deleteCanvasFormat(id: number): Promise<void> {
	await request({ url: `${CANVAS_FORMATS_URL}/${id}`, method: 'DELETE' })
}

type ReorderCanvasFormatsPayload = {
	items: Array<{
		id: number
		sort_order: number
	}>
}

async function reorderCanvasFormats(data: ReorderCanvasFormatsPayload): Promise<CanvasFormat[]> {
	return await request({ url: `${CANVAS_FORMATS_URL}/reorder`, method: 'POST', data })
}

export const canvasFormatsApi = {
	listCanvasFormats,
	createCanvasFormat,
	updateCanvasFormat,
	deleteCanvasFormat,
	reorderCanvasFormats
}
