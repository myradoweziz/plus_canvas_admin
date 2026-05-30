import type { RegisteredCustomersReport } from '../types/registered-customers-report'

export const REGISTERED_CUSTOMERS_STAT_ITEMS: Array<{
	key: keyof RegisteredCustomersReport
	label: string
}> = [
	{ key: 'last_7_days', label: 'За 7 дней' },
	{ key: 'last_14_days', label: 'За 14 дней' },
	{ key: 'last_month', label: 'За месяц' },
	{ key: 'last_year', label: 'За год' },
	{ key: 'total', label: 'Всего' }
]
