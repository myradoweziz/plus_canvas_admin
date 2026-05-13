export type Color = {
	id: number | null
	name: string
	hex_code: string
	is_active: boolean
	image?: string
	image_url?: string
}

export type ColorPayload = Omit<Color, 'id'>
