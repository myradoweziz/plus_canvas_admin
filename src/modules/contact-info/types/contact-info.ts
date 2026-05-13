export type ContactSocialLink = {
	platform: string
	url: string
	image?: string
	image_url?: string
}

export type ContactInfo = {
	id?: number | null
	phone_number?: string | null
	address?: string | null
	email?: string | null
	logo?: string
	logo_path?: string
	slogan?: string | null
	social_links?: ContactSocialLink[]
}
