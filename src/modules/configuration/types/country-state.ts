export type CountryState = {
	id: number | null
	name: string
	abbreviation: string
	published: boolean
	display_order: number
}

export type CountryStatePayload = Omit<CountryState, 'id'>
