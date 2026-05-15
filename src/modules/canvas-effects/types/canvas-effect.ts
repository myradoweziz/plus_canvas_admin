export type CanvasEffect = {
	id: number | null
	name: string
	image?: string
	image_url?: string
	is_active: boolean
	sort_order: number
}

export type CanvasEffectPayload = Omit<CanvasEffect, 'id'>
