export type MessageTemplate = {
	id: number | null
	name: string
	subject: string
	is_active: boolean
	bcc: string
	body: string
	email_account_id: number
	store_id: number
	attached_file: string
}

export type MessageTemplatePayload = Omit<MessageTemplate, 'id'>

