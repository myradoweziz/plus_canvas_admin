import { request } from '@/shared'
import type { RegisteredCustomersReport } from '../types/registered-customers-report'

const REGISTERED_CUSTOMERS_URL = '/api/admin/reports/registered-customers'

const normalizeRegisteredCustomersReport = (item: any): RegisteredCustomersReport => ({
	last_7_days: Number(item?.last_7_days ?? 0),
	last_14_days: Number(item?.last_14_days ?? 0),
	last_month: Number(item?.last_month ?? 0),
	last_year: Number(item?.last_year ?? 0),
	total: Number(item?.total ?? 0)
})

async function getRegisteredCustomersReport(): Promise<RegisteredCustomersReport> {
	const response = await request({ url: REGISTERED_CUSTOMERS_URL, method: 'GET' })
	const raw = response?.data ?? response
	return normalizeRegisteredCustomersReport(raw)
}

export const registeredCustomersReportApi = {
	getRegisteredCustomersReport
}
