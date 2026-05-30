import type { UserActivityLog, UserActivityLogAttributeChanges } from '../types/user-activity-log'

export const USER_ACTIVITY_LOGS_TABLE_COLUMNS = [
	{ key: 'created_at', label: 'Дата' },
	{ key: 'event', label: 'Событие' },
	{ key: 'description', label: 'Описание' },
	{ key: 'log_name', label: 'Log name' },
	{ key: 'subject', label: 'Subject' },
	{ key: 'causer', label: 'Causer' },
	{ key: 'changes', label: 'Изменения' }
]

const SENSITIVE_FIELDS = new Set(['password', 'password_confirmation'])

export const formatModelType = (value: string) => {
	if (!value) return '—'
	const parts = value.split('\\')
	return parts[parts.length - 1] || value
}

export const formatActivitySubject = (log: UserActivityLog) => {
	const type = formatModelType(log.subject_type)
	return type !== '—' ? `${type} #${log.subject_id}` : '—'
}

export const formatActivityCauser = (log: UserActivityLog) => {
	const type = formatModelType(log.causer_type)
	return type !== '—' ? `${type} #${log.causer_id}` : '—'
}

const formatChangeValue = (key: string, value: unknown) => {
	if (SENSITIVE_FIELDS.has(key)) return '[скрыто]'
	if (value === null || value === undefined || value === '') return '—'
	return String(value)
}

export const formatActivityChanges = (changes: UserActivityLogAttributeChanges | null) => {
	if (!changes?.attributes) return '—'

	const keys = Object.keys(changes.attributes)
	if (!keys.length) return '—'

	return keys
		.map((key) => {
			const next = formatChangeValue(key, changes.attributes[key])
			const prev = changes.old?.[key]
			if (prev !== undefined && prev !== null && prev !== '') {
				return `${key}: ${formatChangeValue(key, prev)} → ${next}`
			}
			return `${key}: ${next}`
		})
		.join('; ')
}
