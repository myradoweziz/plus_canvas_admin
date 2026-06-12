export const NEWSLETTER_SUBSCRIBERS_TABLE_COLUMNS = [
	{ key: 'email', label: 'Email' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'created_at', label: 'Дата подписки' },
	{ key: 'actions', label: 'Действия' }
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
	{ key: 'discount_type', label: 'Тип акции' },
	{ key: 'slug', label: 'Slug' },
	{ key: 'amount', label: 'Размер' },
	{ key: 'period', label: 'Период' },
	{ key: 'is_active', label: 'Активна' },
	{ key: 'actions', label: 'Действия' }
]

export const formatDiscountAmount = (discount: { is_percentage: boolean; amount: number }) =>
	discount.is_percentage ? `${discount.amount}%` : String(discount.amount)

export const formatDiscountPeriod = (startDate?: string, endDate?: string) => {
	if (!startDate && !endDate) return '—'
	return `${formatNewsletterSubscriberDate(startDate)} — ${formatNewsletterSubscriberDate(endDate)}`
}

export const COUPONS_TABLE_COLUMNS = [
	{ key: 'code', label: 'Код' },
	{ key: 'discount_type', label: 'Тип акции' },
	{ key: 'amount', label: 'Размер' },
	{ key: 'usage_limit', label: 'Лимит' },
	{ key: 'period', label: 'Период' },
	{ key: 'user', label: 'Пользователи' },
	{ key: 'is_active', label: 'Активен' },
	{ key: 'actions', label: 'Действия' }
]

export const formatCouponAmount = (coupon: { is_percentage: boolean; amount: number }) =>
	coupon.is_percentage ? `${coupon.amount}%` : String(coupon.amount)
