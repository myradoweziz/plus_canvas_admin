import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Faq, FaqPayload } from '../types/faq'

const FAQS_URL = '/api/admin/faqs'

export type ListFaqsParams = {
	question?: string
	limit: number
	offset: number
}

export type ListFaqsResult = {
	items: Faq[]
	total: number
}

const listFaqs = createListApi<Faq, ListFaqsParams>({ url: FAQS_URL })

function toFaqPayload(faq: Faq): FaqPayload {
	return {
		question: faq.question,
		answer: faq.answer,
		order: faq.order,
		is_active: faq.is_active
	}
}

async function createFaq(faq: Faq): Promise<Faq> {
	return await request({ url: FAQS_URL, method: 'POST', data: toFaqPayload(faq) })
}

async function updateFaq(faq: Faq): Promise<Faq> {
	return await request({
		url: `${FAQS_URL}/${faq.id}`,
		method: 'PUT',
		data: toFaqPayload(faq)
	})
}

async function deleteFaq(id: number): Promise<void> {
	await request({ url: `${FAQS_URL}/${id}`, method: 'DELETE' })
}

export const faqsApi = {
	listFaqs,
	createFaq,
	updateFaq,
	deleteFaq
}
