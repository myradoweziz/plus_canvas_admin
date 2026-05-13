export type CanvasFrame = {
	id: number | null
	name: string
	image?: string
	image_url?: string
	price: number
	is_active: boolean
	sort_order: number
}

export type CanvasFramePayload = Omit<CanvasFrame, 'id'>
