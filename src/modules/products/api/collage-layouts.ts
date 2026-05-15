import { getTotal, request } from '@/shared'
import type { CollageLayout, CollageLayoutPayload, CollageLayoutSlot } from '../types'

const COLLAGE_LAYOUTS_URL = '/api/admin/collage-layouts'

export type ListCollageLayoutsParams = {
	name?: string
	limit: number
	offset: number
}

export type ListCollageLayoutsResult = {
	items: CollageLayout[]
	total: number
}

const normalizeSlot = (raw: Record<string, unknown>): CollageLayoutSlot => ({
	slot: Number(raw?.slot ?? 0),
	x: Number(raw?.x ?? 0),
	y: Number(raw?.y ?? 0),
	w: Number(raw?.w ?? 0),
	h: Number(raw?.h ?? 0)
})

const normalizePayload = (raw: Record<string, unknown>): CollageLayoutPayload => {
	const layoutRaw = raw?.layout_json
	const layout_json = Array.isArray(layoutRaw)
		? layoutRaw.map((item) => normalizeSlot(item as Record<string, unknown>))
		: []

	return {
		name: String(raw?.name ?? ''),
		max_images: Number(raw?.max_images ?? layout_json.length ?? 0),
		layout_json,
		image: raw?.image != null ? String(raw.image) : undefined,
		image_url: raw?.image_url != null ? String(raw.image_url) : undefined,
		is_active: raw?.is_active !== false
	}
}

const unwrapEntity = (response: unknown): Record<string, unknown> => {
	if (!response || typeof response !== 'object') return {}
	const root = response as Record<string, unknown>
	const nested = root.data
	if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
		const entity = nested as Record<string, unknown>
		if (entity.id != null || entity.name != null || entity.layout_json != null) {
			return entity
		}
	}
	return root
}

const normalize = (raw: Record<string, unknown>): CollageLayout => {
	const idRaw = raw?.id
	const id = idRaw != null && idRaw !== '' && Number.isFinite(Number(idRaw)) ? Number(idRaw) : null

	return {
		id,
		...normalizePayload(raw),
		created_at: raw?.created_at != null ? String(raw.created_at) : undefined,
		updated_at: raw?.updated_at != null ? String(raw.updated_at) : undefined
	}
}

async function listCollageLayouts(params: ListCollageLayoutsParams): Promise<ListCollageLayoutsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: COLLAGE_LAYOUTS_URL, method: 'GET', params: filteredParams })
	const items = (Array.isArray(response) ? response : response?.data || []).map((item: Record<string, unknown>) =>
		normalize(item)
	)

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function importCollageLayoutSvg(file: File): Promise<CollageLayoutPayload> {
	const response = await request({
		url: `${COLLAGE_LAYOUTS_URL}/import-svg`,
		method: 'POST',
		isFormData: true,
		data: { file }
	})

	return normalizePayload(unwrapEntity(response))
}

function toCreatePayload(payload: CollageLayoutPayload): CollageLayoutPayload {
	return {
		name: payload.name.trim(),
		max_images: payload.max_images,
		layout_json: payload.layout_json,
		image: payload.image || payload.image_url || '',
		is_active: payload.is_active
	}
}

async function createCollageLayout(payload: CollageLayoutPayload): Promise<CollageLayout> {
	const response = await request({
		url: COLLAGE_LAYOUTS_URL,
		method: 'POST',
		data: toCreatePayload(payload)
	})

	return normalize(unwrapEntity(response))
}

export const collageLayoutsApi = {
	listCollageLayouts,
	importCollageLayoutSvg,
	createCollageLayout,
	normalizeCollageLayout: normalize
}
