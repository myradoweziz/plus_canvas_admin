import { getTotal, request } from '@/shared'
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

async function listFaqs(params: ListFaqsParams): Promise<ListFaqsResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: FAQS_URL, method: 'GET', params: filteredParams })
	const items = Array.isArray(response) ? response : response?.data || []

	return {
		items,
		total: getTotal(response, items.length)
	}
}

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

