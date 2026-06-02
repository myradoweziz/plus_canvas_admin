import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Store, StorePayload } from '../types'

const STORES_URL = '/api/admin/stores'

export type ListStoresParams = {
	limit: number
	offset: number
}

const listStores = createListApi<Store, ListStoresParams>({ url: STORES_URL })

async function listAllStores(): Promise<Store[]> {
	const response = await request({ url: STORES_URL, method: 'GET' })
	return Array.isArray(response) ? response : response?.data || response?.items || []
}

function toPayload(store: Store): StorePayload {
	return {
		name: store.name,
		url: store.url,
		ssl_enabled: !!store.ssl_enabled,
		secure_url: store.secure_url,
		hosts: store.hosts,
		display_order: Number(store.display_order) || 0,
		company_name: store.company_name,
		company_address: store.company_address,
		company_phone: store.company_phone,
		company_vat: store.company_vat
	}
}

async function getStoreById(id: number): Promise<Store> {
	return await request({ url: `${STORES_URL}/${id}`, method: 'GET' })
}

async function createStore(store: Store): Promise<Store> {
	return await request({ url: STORES_URL, method: 'POST', data: toPayload(store) })
}

async function updateStore(store: Store): Promise<Store> {
	return await request({ url: `${STORES_URL}/${store.id}`, method: 'PUT', data: toPayload(store) })
}

async function deleteStore(id: number): Promise<void> {
	await request({ url: `${STORES_URL}/${id}`, method: 'DELETE' })
}

export const storesApi = {
	listStores,
	listAllStores,
	getStoreById,
	createStore,
	updateStore,
	deleteStore
}

