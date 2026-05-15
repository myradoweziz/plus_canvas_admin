export type CollageLayoutSlot = {
	slot: number
	x: number
	y: number
	w: number
	h: number
}

export type CollageLayout = {
	id: number | null
	name: string
	max_images: number
	layout_json: CollageLayoutSlot[]
	image?: string
	image_url?: string
	is_active: boolean
	created_at?: string
	updated_at?: string
}

export type CollageLayoutPayload = Omit<CollageLayout, 'id' | 'created_at' | 'updated_at'>
