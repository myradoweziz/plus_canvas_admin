import type { CustomerReportItem } from '../types/customer-report'

export const CUSTOMER_REPORT_TABLE_COLUMNS = [
	{ key: 'name', label: 'Имя' },
	{ key: 'email', label: 'Email' },
	{ key: 'order_count', label: 'Заказов' },
	{ key: 'total_amount', label: 'Сумма' },
	{ key: 'map', label: 'Карта' },
	{ key: 'actions', label: 'Действия' }
]

export const customerReportName = (item: Pick<CustomerReportItem, 'first_name' | 'last_name'>) => {
	const name = [item.first_name, item.last_name].filter(Boolean).join(' ').trim()
	return name || '—'
}
