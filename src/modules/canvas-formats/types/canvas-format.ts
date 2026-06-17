import type { CanvasSize } from '@/modules/canvas-sizes/types/canvas-size'

export type CanvasFormatSize = {
	id: number
	sort_order: number
	width?: number
	height?: number
	unit?: string
}

export type CanvasFormat = {
	id: number | null
	name: string
	slug: string

	is_active: boolean
	sort_order: number
	layout_template: string
	sizes: CanvasFormatSize[]
}

export type CanvasFormatPayload = Omit<CanvasFormat, 'id' | 'sizes'> & {
	sizes: Array<{
		id: number
		sort_order: number
	}>
}

export const getCanvasFormatSizeLabel = (size: CanvasFormatSize | CanvasSize) => {
	if (!size.width || !size.height || !size.unit) return `#${size.id}`

	return `${size.width} x ${size.height} ${size.unit}`
}
