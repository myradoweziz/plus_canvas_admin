import type { ContactInfo, ContactSocialLink } from '@/modules/contact-info/types/contact-info'
import { request } from '@/shared'

const CONTACT_INFO_URL = '/api/admin/contact-info'

const normalizeSocialLink = (raw: any): ContactSocialLink => ({
	platform: String(raw?.platform ?? '').trim(),
	url: String(raw?.url ?? '').trim(),
	image: raw?.image ?? raw?.image_path ?? raw?.imagePath ?? null,
	image_url: raw?.image_url ?? raw?.imageUrl ?? null
})

const normalize = (raw: any): ContactInfo => {
	if (!raw) return {}
	const socialRaw = raw.social_links ?? raw.links ?? raw.platforms
	const social_links = Array.isArray(socialRaw)
		? socialRaw.map(normalizeSocialLink).filter((l) => l.platform || l.url || l.image || l.image_url)
		: undefined

	const logo = raw.logo ?? raw.logo_path ?? null

	return {
		id: raw.id ?? null,
		phone_number: raw.phone_number ?? null,
		address: raw.address ?? null,
		email: raw.email ?? null,
		logo,
		logo_path: raw.logo_path ?? raw.logoPath ?? null,
		slogan: raw.slogan ?? null,
		social_links
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

	if (Array.isArray(data)) return data.length ? normalize(data[0]) : null
	return normalize(data)
}

export type SaveContactInfoSocialRow = {
	platform: string
	url: string
	image_url?: string | null
	image?: string | null
}

async function saveContactInfo(payload: {
	id?: number | null
	phone_number: string
	address: string
	email: string
	slogan: string
	logo?: string | null
	social_links?: SaveContactInfoSocialRow[]
}): Promise<ContactInfo> {
	const data: Record<string, any> = {
		phone_number: payload.phone_number,
		address: payload.address,
		email: payload.email,
		slogan: payload.slogan
	}

	if (payload.id) data.id = payload.id
	if (payload.logo) data.logo = payload.logo

	const rows = payload.social_links ?? []
	const social_links = rows
		.map((row) => ({
			platform: String(row.platform ?? '').trim(),
			url: String(row.url ?? '').trim(),
			image: row.image || row.image_url ? String(row.image || row.image_url || '').trim() : null
		}))
		.filter((row) => row.platform || row.url || row.image)

	data.social_links = social_links

	const res: any = await request({
		url: CONTACT_INFO_URL,
		method: 'POST',
		data,
		isFormData: false
	})

	return normalize(res?.data ?? res)
}
