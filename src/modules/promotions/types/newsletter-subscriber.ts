export type NewsletterSubscriber = {
	id: number
	email: string
	is_active: boolean
	created_at: string
	updated_at: string
}

export type NewsletterSubscriberPayload = {
	email: string
	is_active: boolean
}
