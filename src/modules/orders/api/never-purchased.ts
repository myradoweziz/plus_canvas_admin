import { request } from '@/shared'
import type { NeverPurchasedProduct } from '../types'

const NEVER_PURCHASED_URL = '/api/admin/reports/never-purchased'

export interface NeverPurchasedFilters {
	date_from?: string
	date_to?: string
	limit: number
	offset: number
}

export const neverPurchasedApi = {
	getNeverPurchased
}

async function getNeverPurchased(
	filters: NeverPurchasedFilters
): Promise<{ data: NeverPurchasedProduct[]; total: number }> {
	const response = await request({ url: NEVER_PURCHASED_URL, method: 'GET', params: filters })
	return response as { data: NeverPurchasedProduct[]; total: number }
}
