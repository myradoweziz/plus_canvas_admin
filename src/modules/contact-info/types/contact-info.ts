export type ContactInfo = {
	id?: number | null
	phone_number?: string | null
	address?: string | null
	email?: string | null
	// backend: `logo` приходит как full url, `logo_path` как путь
	logo?: string | null
	logo_path?: string | null
	slogan?: string | null
}

