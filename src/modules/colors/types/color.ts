export type Color = {
	id: number | null
	name: string
	hex_code: string
	is_active: boolean
	image_url?: string
	image?: File | null
}

export type ColorPayload = Omit<Color, 'id' | 'image_url' | 'image'>

