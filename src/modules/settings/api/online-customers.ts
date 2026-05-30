import { request } from '@/shared'
import type { OnlineCustomer } from '../types/online-customer'

const ONLINE_CUSTOMERS_URL = '/api/admin/online-customers'

const normalizeOnlineCustomer = (item: any): OnlineCustomer => ({
	id: Number(item?.id),
	name: String(item?.name ?? ''),
	email: String(item?.email ?? ''),
	phone_number: item?.phone_number != null ? String(item.phone_number) : null,
	is_active: !!item?.is_active,
	created_at: String(item?.created_at ?? ''),
	updated_at: String(item?.updated_at ?? ''),
	last_activity_at: item?.last_activity_at != null ? String(item.last_activity_at) : null,
	first_name: item?.first_name != null ? String(item.first_name) : null,
	last_name: item?.last_name != null ? String(item.last_name) : null,
	ip_address: item?.ip_address != null ? String(item.ip_address) : null
})

async function listOnlineCustomers(): Promise<OnlineCustomer[]> {
	const response = await request({ url: ONLINE_CUSTOMERS_URL, method: 'GET' })
	const rawData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
	return rawData.map(normalizeOnlineCustomer)
}

export const onlineCustomersApi = {
	listOnlineCustomers
}
