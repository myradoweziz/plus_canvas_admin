import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { ShippingProvider, ShippingProviderPayload } from '../types'

const SHIPPING_PROVIDERS_URL = '/api/admin/shipping-providers'

export type ListShippingProvidersParams = {
	limit: number
	offset: number
}

const listShippingProviders = createListApi<ShippingProvider, ListShippingProvidersParams>({
	url: SHIPPING_PROVIDERS_URL
})

function toPayload(provider: ShippingProvider): ShippingProviderPayload {
	return {
		friendly_name: provider.friendly_name.trim(),
		system_name: provider.system_name.trim(),
		logo_path: provider.logo_path.trim(),
		display_order: Number(provider.display_order) || 0,
		is_active: !!provider.is_active
	}
}

async function getShippingProviderById(id: number): Promise<ShippingProvider> {
	return await request({ url: `${SHIPPING_PROVIDERS_URL}/${id}`, method: 'GET' })
}

async function createShippingProvider(provider: ShippingProvider): Promise<ShippingProvider> {
	return await request({ url: SHIPPING_PROVIDERS_URL, method: 'POST', data: toPayload(provider) })
}

async function updateShippingProvider(provider: ShippingProvider): Promise<ShippingProvider> {
	return await request({
		url: `${SHIPPING_PROVIDERS_URL}/${provider.id}`,
		method: 'PUT',
		data: toPayload(provider)
	})
}

async function deleteShippingProvider(id: number): Promise<void> {
	await request({ url: `${SHIPPING_PROVIDERS_URL}/${id}`, method: 'DELETE' })
}

export const shippingProvidersApi = {
	listShippingProviders,
	getShippingProviderById,
	createShippingProvider,
	updateShippingProvider,
	deleteShippingProvider
}
