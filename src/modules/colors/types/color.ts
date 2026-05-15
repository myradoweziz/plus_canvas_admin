export type Color = {
	id: number | null
	name: string
	hex_code: string
	is_active: boolean
}

export type ColorPayload = Omit<Color, 'id'>
