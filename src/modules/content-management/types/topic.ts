export type Topic = {
	id: number | null
	system_name: string
	is_password_protected: boolean
	password: string
	include_in_sitemap: boolean
	include_in_top_menu: boolean
	title: string
	body: string
	slug: string
	meta_title: string
	meta_description: string
	meta_keywords: string
	store_id: number
}

export type TopicPayload = Omit<Topic, 'id'>
