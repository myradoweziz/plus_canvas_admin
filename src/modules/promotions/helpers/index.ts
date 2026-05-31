export const NEWSLETTER_SUBSCRIBERS_TABLE_COLUMNS = [
	{ key: 'id', label: 'ID' },
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
