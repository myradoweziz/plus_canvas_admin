export type Topic = {
	id: number | null
	include_in_sitemap: boolean
	include_in_top_menu: boolean
	title: string
	body: string
	slug: string
	meta_title: string
	meta_description: string
	meta_keywords: string
}

export type TopicPayload = Omit<Topic, 'id'>
