import { request } from '@/shared'
import type { CountryState, CountryStatePayload } from '../types'

const statesUrl = (countryId: number) => `/api/admin/countries/${countryId}/states`

function toPayload(state: CountryState): CountryStatePayload {
	return {
		name: state.name.trim(),
		abbreviation: state.abbreviation.trim(),
		published: !!state.published,
		display_order: Number(state.display_order) || 0
	}
}

const normalizeCountryState = (row: Record<string, unknown>): CountryState => ({
	id: row.id != null ? Number(row.id) : null,
	name: String(row.name ?? ''),
	abbreviation: String(row.abbreviation ?? ''),
	published: !!row.published,
	display_order: Number(row.display_order) || 0
})

async function listCountryStates(countryId: number): Promise<CountryState[]> {
	const response = await request({ url: statesUrl(countryId), method: 'GET' })
	const rawItems = Array.isArray(response) ? response : response?.data || response?.items || []
	return Array.isArray(rawItems) ? rawItems.map((item) => normalizeCountryState(item as Record<string, unknown>)) : []
}

async function getCountryStateById(countryId: number, stateId: number): Promise<CountryState> {
	const response = await request({ url: `${statesUrl(countryId)}/${stateId}`, method: 'GET' })
	return normalizeCountryState((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
}

async function createCountryState(countryId: number, state: CountryState): Promise<CountryState> {
	const response = await request({
		url: statesUrl(countryId),
		method: 'POST',
		data: toPayload(state)
	})
	return normalizeCountryState((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
}

async function updateCountryState(countryId: number, state: CountryState): Promise<CountryState> {
	const response = await request({
		url: `${statesUrl(countryId)}/${state.id}`,
		method: 'PUT',
		data: toPayload(state)
	})
	return normalizeCountryState((response as { data?: Record<string, unknown> })?.data ?? (response as Record<string, unknown>))
}

async function deleteCountryState(countryId: number, stateId: number): Promise<void> {
	await request({ url: `${statesUrl(countryId)}/${stateId}`, method: 'DELETE' })
}

export const countryStatesApi = {
	listCountryStates,
	getCountryStateById,
	createCountryState,
	updateCountryState,
	deleteCountryState
}
