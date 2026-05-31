export const USERS_TABLE_COLUMNS = [
	{ key: 'email', label: 'Email' },
	{ key: 'name', label: 'Имя' },
	{ key: 'roles', label: 'Роли' },
	{ key: 'phone_number', label: 'Телефон' },
	{ key: 'is_active', label: 'Опубликован' },
	{ key: 'created_at', label: 'Дата регистрации' },
	{ key: 'last_activity_at', label: 'Последняя активность' },
	{ key: 'actions', label: 'Редактировать', headerClass: 'text-right', cellClass: 'text-right' }
]

export const formatUserDate = (value?: string) => {
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

export const userDisplayName = (user: { name?: string; first_name?: string; last_name?: string }) => {
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
	return fullName || user.name?.trim() || '—'
}
