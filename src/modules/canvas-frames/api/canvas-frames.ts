import { getTotal, request } from '@/shared'
import type { CanvasFrame, CanvasFramePayload } from '../types/canvas-frame'

const CANVAS_FRAMES_URL = '/api/admin/canvas-frames'

export type ListCanvasFramesParams = {
	name?: string
	limit: number
	offset: number
}

export type ListCanvasFramesResult = {
	items: CanvasFrame[]
	total: number
}

async function listCanvasFrames(params: ListCanvasFramesParams): Promise<ListCanvasFramesResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: CANVAS_FRAMES_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

function toCanvasFramePayload(frame: CanvasFrame): CanvasFramePayload {
	return {
		name: frame.name,
		color_hex: frame.color_hex,
		image: frame.image || frame.image_url || '',
		price: frame.price,
		is_active: frame.is_active,
		sort_order: frame.sort_order
	}
}

async function createCanvasFrame(frame: CanvasFrame): Promise<CanvasFrame> {
	return await request({ url: CANVAS_FRAMES_URL, method: 'POST', data: toCanvasFramePayload(frame) })
}

async function updateCanvasFrame(frame: CanvasFrame): Promise<CanvasFrame> {
	return await request({ url: `${CANVAS_FRAMES_URL}/${frame.id}`, method: 'PUT', data: toCanvasFramePayload(frame) })
}

async function deleteCanvasFrame(id: number): Promise<void> {
	await request({ url: `${CANVAS_FRAMES_URL}/${id}`, method: 'DELETE' })
}

export const canvasFramesApi = {
	listCanvasFrames,
	createCanvasFrame,
	updateCanvasFrame,
	deleteCanvasFrame
}
