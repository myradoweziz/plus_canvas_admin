import { downloadBlob, downloadTextFile } from '@/composables'
import { request } from '@/shared'
import type { CustomerReportItem } from '../types/customer-report'

const CUSTOMER_REPORT_URL = '/api/admin/reports/customer-report'
const CUSTOMER_REPORT_BY_COUNT_URL = '/api/admin/reports/customer-report-by-count'

export type CustomerReportFilters = {
	date_from?: string
	date_to?: string
	order_status?: string
	payment_status?: string
	delivery_status?: string
	limit: number
	offset: number
}

const normalizeCustomerReportItem = (item: any): CustomerReportItem => ({
	id: item?.id != null ? Number(item.id) : item?.user_id != null ? Number(item.user_id) : null,
	email: String(item?.email ?? ''),
	first_name: String(item?.first_name ?? ''),
	last_name: String(item?.last_name ?? ''),
	order_count: Number(item?.order_count ?? 0),
	total_amount: String(item?.total_amount ?? '0'),
	google_maps_url: item?.google_maps_url ? String(item.google_maps_url) : null
})

async function fetchCustomerReport(
	url: string,
	filters: CustomerReportFilters
): Promise<{ data: CustomerReportItem[]; total: number }> {
	const params = Object.fromEntries(
		Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url, method: 'GET', params })
	const rawData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
	const data = rawData.map(normalizeCustomerReportItem)
	const total = Number(response?.total ?? data.length)

	return { data, total }
}

async function getCustomerReport(
	filters: CustomerReportFilters
): Promise<{ data: CustomerReportItem[]; total: number }> {
	return fetchCustomerReport(CUSTOMER_REPORT_URL, filters)
}

async function getCustomerReportByCount(
	filters: CustomerReportFilters
): Promise<{ data: CustomerReportItem[]; total: number }> {
	return fetchCustomerReport(CUSTOMER_REPORT_BY_COUNT_URL, filters)
}

async function exportCustomerReportExcel(
	filters: Omit<CustomerReportFilters, 'limit' | 'offset'>
): Promise<void> {
	const params = Object.fromEntries(
		Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({ url: `${CUSTOMER_REPORT_URL}/export/excel`, method: 'GET', params, responseType: 'blob' })
	downloadBlob(response as Blob, 'customer-report.xlsx')
}

async function exportCustomerReportXml(
	filters: Omit<CustomerReportFilters, 'limit' | 'offset'>
): Promise<void> {
	const params = Object.fromEntries(
		Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
	)
	const response = await request({
		url: `${CUSTOMER_REPORT_URL}/export/xml`,
		method: 'GET',
		params,
		headers: { Accept: 'application/xml, text/xml' },
		responseType: 'text'
	})

	const xml =
		typeof response === 'string'
			? response
			: typeof (response as { data?: string })?.data === 'string'
				? (response as { data: string }).data
				: ''

	if (!xml.trim()) {
		throw new Error('Пустой ответ XML')
	}

	downloadTextFile(xml, 'customer-report.xml', 'application/xml;charset=utf-8')
}

export const customerReportApi = {
	getCustomerReport,
	getCustomerReportByCount,
	exportCustomerReportExcel,
	exportCustomerReportXml
}
