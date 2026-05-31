export const NEWSLETTER_SUBSCRIBERS_TABLE_COLUMNS = [
	{ key: 'email', label: 'Email' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'created_at', label: 'Дата подписки' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]

export const formatNewsletterSubscriberDate = (value?: string) => {
	if (!value) return '—'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date)
}

export const DISCOUNTS_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'discount_type', label: 'Тип скидки' },
	{ key: 'amount', label: 'Размер' },
	{ key: 'period', label: 'Период' },
	{ key: 'promo_code', label: 'Промокод' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]

export const formatDiscountAmount = (discount: { is_percentage: boolean; amount: number }) =>
	discount.is_percentage ? `${discount.amount}%` : String(discount.amount)

export const formatDiscountPeriod = (startDate?: string, endDate?: string) => {
	if (!startDate && !endDate) return '—'
	return `${formatNewsletterSubscriberDate(startDate)} — ${formatNewsletterSubscriberDate(endDate)}`
}
