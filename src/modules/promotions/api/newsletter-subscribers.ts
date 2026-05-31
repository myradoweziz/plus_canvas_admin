import { downloadBlob } from '@/composables'
import { getTotal, request } from '@/shared'
import type { NewsletterSubscriber, NewsletterSubscriberPayload } from '../types'

const NEWSLETTER_SUBSCRIBERS_URL = '/api/admin/newsletter-subscribers'

export type ListNewsletterSubscribersParams = {
	email?: string
	limit: number
	offset: number
}

export type ListNewsletterSubscribersResult = {
	items: NewsletterSubscriber[]
	total: number
}

const normalizeNewsletterSubscriber = (item: any): NewsletterSubscriber => ({
	id: Number(item?.id),
	email: String(item?.email ?? ''),
	is_active: !!item?.is_active,
	created_at: String(item?.created_at ?? ''),
	updated_at: String(item?.updated_at ?? '')
})

async function listNewsletterSubscribers(
	params: ListNewsletterSubscribersParams
): Promise<ListNewsletterSubscribersResult> {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: NEWSLETTER_SUBSCRIBERS_URL, method: 'GET', params: filteredParams })
	const rawItems = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
	const items = rawItems.map(normalizeNewsletterSubscriber)

	return {
		items,
		total: getTotal(response, items.length)
	}
}

async function updateNewsletterSubscriber(
	id: number,
	payload: NewsletterSubscriberPayload
): Promise<NewsletterSubscriber> {
	const response = await request({
		url: `${NEWSLETTER_SUBSCRIBERS_URL}/${id}`,
		method: 'PUT',
		data: {
			email: payload.email.trim(),
			is_active: !!payload.is_active
		}
	})

	return normalizeNewsletterSubscriber(response?.data ?? response)
}

async function deleteNewsletterSubscriber(id: number): Promise<void> {
	await request({ url: `${NEWSLETTER_SUBSCRIBERS_URL}/${id}`, method: 'DELETE' })
}

async function exportNewsletterSubscribersCsv(): Promise<void> {
	const response = await request({
		url: `${NEWSLETTER_SUBSCRIBERS_URL}/export/csv`,
		method: 'GET',
		responseType: 'blob'
	})

	downloadBlob(response as Blob, 'newsletter-subscribers.csv')
}

async function importNewsletterSubscribersCsv(file: File): Promise<void> {
	await request({
		url: `${NEWSLETTER_SUBSCRIBERS_URL}/import/csv`,
		method: 'POST',
		isFormData: true,
		data: { file }
	})
}

export const newsletterSubscribersApi = {
	listNewsletterSubscribers,
	updateNewsletterSubscriber,
	deleteNewsletterSubscriber,
	exportNewsletterSubscribersCsv,
	importNewsletterSubscribersCsv
}
