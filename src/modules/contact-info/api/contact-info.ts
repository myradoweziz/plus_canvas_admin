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

	return {
		id: raw.id ?? null,
		phone_number: raw.phone_number ?? null,
		address: raw.address ?? null,
		email: raw.email ?? null,
		logo: raw.logo ?? raw.logo_url ?? raw.logoUrl ?? null,
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
	image?: string | null
	image_url?: string | null
	imageFile?: File | null
}

async function saveContactInfo(payload: {
	id?: number | null
	phone_number: string
	address: string
	email: string
	slogan: string
	logo?: File | null
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
	let index = 0

	for (const row of rows) {
		const platform = (row.platform ?? '').trim()
		const url = (row.url ?? '').trim()
		const hasFile = row.imageFile instanceof File
		if (!platform && !url && !row.image && !row.image_url && !hasFile) continue

		const key = (field: string) => `social_links[${index}][${field}]`

		data[key('platform')] = platform
		data[key('url')] = url
		if (row.image_url) data[key('image_url')] = String(row.image_url)
		if (hasFile) {
			data[key('image')] = row.imageFile
		} else if (row.image) {
			data[key('image')] = String(row.image)
		}

		index += 1
	}

	const res: any = await request({
		url: CONTACT_INFO_URL,
		method: 'POST',
		data,
		isFormData: true
	})

	return normalize(res?.data ?? res)
}
