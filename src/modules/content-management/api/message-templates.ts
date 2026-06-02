import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { MessageTemplate, MessageTemplatePayload } from '../types'

const MESSAGE_TEMPLATES_URL = '/api/admin/message-templates'

export type ListMessageTemplatesParams = {
	store_id?: number
	limit: number
	offset: number
}

const listMessageTemplates = createListApi<MessageTemplate, ListMessageTemplatesParams>({ url: MESSAGE_TEMPLATES_URL })

function toMessageTemplatePayload(template: MessageTemplate): MessageTemplatePayload {
	return {
		name: template.name,
		subject: template.subject,
		is_active: !!template.is_active,
		bcc: template.bcc,
		body: template.body,
		email_account_id: Number(template.email_account_id) || 0,
		store_id: Number(template.store_id) || 0,
		attached_file: template.attached_file
	}
}

async function getMessageTemplateById(id: number): Promise<MessageTemplate> {
	return await request({ url: `${MESSAGE_TEMPLATES_URL}/${id}`, method: 'GET' })
}

async function createMessageTemplate(template: MessageTemplate): Promise<MessageTemplate> {
	return await request({ url: MESSAGE_TEMPLATES_URL, method: 'POST', data: toMessageTemplatePayload(template) })
}

async function updateMessageTemplate(template: MessageTemplate): Promise<MessageTemplate> {
	return await request({
		url: `${MESSAGE_TEMPLATES_URL}/${template.id}`,
		method: 'PUT',
		data: toMessageTemplatePayload(template)
	})
}

async function deleteMessageTemplate(id: number): Promise<void> {
	await request({ url: `${MESSAGE_TEMPLATES_URL}/${id}`, method: 'DELETE' })
}

export const messageTemplatesApi = {
	listMessageTemplates,
	getMessageTemplateById,
	createMessageTemplate,
	updateMessageTemplate,
	deleteMessageTemplate
}

