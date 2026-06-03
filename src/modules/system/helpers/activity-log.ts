import type { ActivityLog, ActivityLogAttributeChanges } from '../types'

export const ACTIVITY_LOG_TABLE_COLUMNS = [
	{ key: 'created_at', label: 'Дата' },
	{ key: 'event', label: 'Событие' },
	{ key: 'description', label: 'Описание' },
	{ key: 'log_name', label: 'Log name' },
	{ key: 'subject', label: 'Subject' },
	{ key: 'causer', label: 'Инициатор' },
	{ key: 'changes', label: 'Изменения' }
]

export const ACTIVITY_LOG_EVENT_FILTER_OPTIONS = [
	{ value: '', label: 'Все события' },
	{ value: 'created', label: 'created' },
	{ value: 'updated', label: 'updated' },
	{ value: 'deleted', label: 'deleted' }
]

const SENSITIVE_FIELDS = new Set(['password', 'password_confirmation'])

export const formatModelType = (value: string) => {
	if (!value) return '—'
	const parts = value.split('\\')
	return parts[parts.length - 1] || value
}

export const formatActivitySubject = (log: ActivityLog) => {
	const type = formatModelType(log.subject_type)
	return type !== '—' ? `${type} #${log.subject_id}` : '—'
}

export const formatActivityLogCauser = (log: ActivityLog) => {
	if (log.causer) {
		const label = log.causer.name?.trim() || log.causer.email
		return label ? `${label} (#${log.causer.id})` : `User #${log.causer.id}`
	}

	if (log.causer_type && log.causer_id) {
		const type = formatModelType(log.causer_type)
		return `${type} #${log.causer_id}`
	}

	return '—'
}

const formatChangeValue = (key: string, value: unknown) => {
	if (SENSITIVE_FIELDS.has(key)) return '[скрыто]'
	if (value === null || value === undefined || value === '') return '—'
	return String(value)
}

export const formatActivityChanges = (changes: ActivityLogAttributeChanges | null) => {
	if (!changes) return '—'

	const keys = new Set([...Object.keys(changes.attributes || {}), ...Object.keys(changes.old || {})])
	if (!keys.size) return '—'

	return [...keys]
		.map((key) => {
			const next = changes.attributes?.[key]
			const prev = changes.old?.[key]
			if (prev !== undefined && prev !== null && prev !== '') {
				return `${key}: ${formatChangeValue(key, prev)} → ${formatChangeValue(key, next)}`
			}
			return `${key}: ${formatChangeValue(key, next)}`
		})
		.join('; ')
}
