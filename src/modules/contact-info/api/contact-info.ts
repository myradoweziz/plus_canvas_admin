import type { ContactInfo } from '@/modules/contact-info/types/contact-info'
import { request } from '@/shared'

const CONTACT_INFO_URL = '/api/admin/contact-info'

const normalize = (raw: any): ContactInfo => {
	if (!raw) return {}
	return {
		id: raw.id ?? null,
		phone_number: raw.phone_number ?? null,
		address: raw.address ?? null,
		email: raw.email ?? null,
		// backend: logo = full url, logo_path = relative path
		logo: raw.logo ?? raw.logo_url ?? raw.logoUrl ?? null,
		logo_path: raw.logo_path ?? raw.logoPath ?? null,
		slogan: raw.slogan ?? null
	}
}

export const contactInfoApi = {
	getContactInfo,
	saveContactInfo
} as const

async function getContactInfo(): Promise<ContactInfo | null> {
	const res: any = await request({ url: CONTACT_INFO_URL, method: 'GET' })
	const data = res?.data ?? res
	if (!data) return null

	// Иногда backend может вернуть массив (например список из 1 записи)
	if (Array.isArray(data)) return data.length ? normalize(data[0]) : null
	return normalize(data)
}

async function saveContactInfo(payload: {
	id?: number | null
	phone_number: string
	address: string
	email: string
	slogan: string
	logo?: File | null
}): Promise<ContactInfo> {
	const data: Record<string, any> = {
		phone_number: payload.phone_number,
		address: payload.address,
		email: payload.email,
		slogan: payload.slogan
	}

	// backend: если отправить id — он обновляет запись
	if (payload.id) data.id = payload.id
	if (payload.logo) data.logo = payload.logo

	const res: any = await request({
		url: CONTACT_INFO_URL,
		method: 'POST',
		data,
		isFormData: true
	})

	return normalize(res?.data ?? res)
}

