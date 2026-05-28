import { request } from '@/shared'
import type { Bestseller } from '../types'

const BESTSELLERS_URL = '/api/admin/reports/bestsellers'

export interface BestsellersFilters {
	date_from?: string
	date_to?: string
	order_status?: string
	payment_status?: string
	category_id?: number
	billing_country?: string
	limit: number
	offset: number
}

export const bestsellersApi = {
	getBestsellers
}

async function getBestsellers(
	filters: BestsellersFilters
): Promise<{ data: Bestseller[]; total: number }> {
	const response = await request({ url: BESTSELLERS_URL, method: 'GET', params: filters })
	return response as { data: Bestseller[]; total: number }
}
