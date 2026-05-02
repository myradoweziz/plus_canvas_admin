import { getTotal, request } from '@/shared'
import type { CanvasSize, CanvasSizePayload } from '../types/canvas-size'

const CANVAS_SIZES_URL = '/api/admin/canvas-sizes'

export type ListCanvasSizesParams = {
	limit: number
	offset: number
}

export type ListCanvasSizesResult = {
	items: CanvasSize[]
	total: number
}

async function listCanvasSizes(params: ListCanvasSizesParams): Promise<ListCanvasSizesResult> {
	const response = await request({ url: CANVAS_SIZES_URL, method: 'GET', params })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toCanvasSizePayload(canvasSize: CanvasSize): CanvasSizePayload {
	return {
		width: canvasSize.width,
		height: canvasSize.height,
		unit: canvasSize.unit,
		is_active: canvasSize.is_active,
		sort_order: canvasSize.sort_order
	}
}

async function createCanvasSize(canvasSize: CanvasSize): Promise<CanvasSize> {
	return await request({ url: CANVAS_SIZES_URL, method: 'POST', data: toCanvasSizePayload(canvasSize) })
}

async function updateCanvasSize(canvasSize: CanvasSize): Promise<CanvasSize> {
	return await request({
		url: `${CANVAS_SIZES_URL}/${canvasSize.id}`,
		method: 'PUT',
		data: toCanvasSizePayload(canvasSize)
	})
}

async function deleteCanvasSize(id: number): Promise<void> {
	await request({ url: `${CANVAS_SIZES_URL}/${id}`, method: 'DELETE' })
}

type ReorderCanvasSizesPayload = {
	items: Array<{
		id: number
		sort_order: number
	}>
}

async function reorderCanvasSizes(data: ReorderCanvasSizesPayload): Promise<CanvasSize[]> {
	return await request({ url: `${CANVAS_SIZES_URL}/reorder`, method: 'POST', data })
}

export const canvasSizesApi = {
	listCanvasSizes,
	createCanvasSize,
	updateCanvasSize,
	deleteCanvasSize,
	reorderCanvasSizes
}
