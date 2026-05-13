export type Banner = {
	id: number | null
	title: string
	description: string
	image: string | null
	image_url?: string
	url: string
	order: number
	is_active: boolean
}
