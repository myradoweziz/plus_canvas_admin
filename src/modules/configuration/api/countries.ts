import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Country, CountryPayload } from '../types'

const COUNTRIES_URL = '/api/admin/countries'

export type ListCountriesParams = {
	limit: number
	offset: number
}

const listCountries = createListApi<Country, ListCountriesParams>({ url: COUNTRIES_URL })

async function listAllCountries(): Promise<Country[]> {
	const response = await request({ url: COUNTRIES_URL, method: 'GET' })
	return Array.isArray(response) ? response : response?.data || response?.items || []
}

function toPayload(country: Country): CountryPayload {
	return {
		name: country.name,
		allows_billing: !!country.allows_billing,
		allows_shipping: !!country.allows_shipping,
		two_letter_iso_code: country.two_letter_iso_code,
		three_letter_iso_code: country.three_letter_iso_code,
		numeric_iso_code: Number(country.numeric_iso_code) || 0,
		subject_to_vat: !!country.subject_to_vat,
		published: !!country.published,
		limited_to_stores: !!country.limited_to_stores,
		store_ids: Array.isArray(country.store_ids) ? country.store_ids : [],
		display_order: Number(country.display_order) || 0
	}
}

async function getCountryById(id: number): Promise<Country> {
	return await request({ url: `${COUNTRIES_URL}/${id}`, method: 'GET' })
}

async function createCountry(country: Country): Promise<Country> {
	return await request({ url: COUNTRIES_URL, method: 'POST', data: toPayload(country) })
}

async function updateCountry(country: Country): Promise<Country> {
	return await request({ url: `${COUNTRIES_URL}/${country.id}`, method: 'PUT', data: toPayload(country) })
}

async function deleteCountry(id: number): Promise<void> {
	await request({ url: `${COUNTRIES_URL}/${id}`, method: 'DELETE' })
}

export const countriesApi = {
	listCountries,
	listAllCountries,
	getCountryById,
	createCountry,
	updateCountry,
	deleteCountry
}
