import { request } from '@/shared'
import type { CountryReport } from '../types'

const COUNTRY_REPORT_URL = '/api/admin/reports/country-report'

export interface CountryReportFilters {
	date_from?: string
	date_to?: string
	order_status?: string
	payment_status?: string
	limit: number
	offset: number
}

export const countryReportApi = {
	getCountryReport
}

async function getCountryReport(
	filters: CountryReportFilters
): Promise<{ data: CountryReport[]; total: number }> {
	const response = await request({ url: COUNTRY_REPORT_URL, method: 'GET', params: filters })
	return response as { data: CountryReport[]; total: number }
}
