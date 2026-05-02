export type CanvasSize = {
	id: number | null
	width: number
	height: number
	unit: string
	is_active: boolean
	sort_order: number
}

export type CanvasSizePayload = Omit<CanvasSize, 'id'>

