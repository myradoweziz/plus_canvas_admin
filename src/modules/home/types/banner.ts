export type Banner = {
	id: number | null
	title: string
	description: string
	image_url?: string
	image?: File | null
	url: string
	order: number
	is_active: boolean
}
