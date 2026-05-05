export type Faq = {
	id: number | null
	question: string
	answer: string
	order: number
	is_active: boolean
}

export type FaqPayload = Omit<Faq, 'id'>

