export type Country = {
	id: number | null
	name: string
	allows_billing: boolean
	allows_shipping: boolean
	two_letter_iso_code: string
	three_letter_iso_code: string
	numeric_iso_code: number
	subject_to_vat: boolean
	published: boolean
	limited_to_stores: boolean
	store_ids: number[]
	display_order: number
}

export type CountryPayload = Omit<Country, 'id'>
