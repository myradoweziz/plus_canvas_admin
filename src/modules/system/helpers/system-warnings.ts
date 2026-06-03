import type { SystemWarningType } from '../types'

export const SYSTEM_WARNING_TONE_CLASS: Record<SystemWarningType, string> = {
	info: 'bg-blue-100 text-blue-800',
	warning: 'bg-amber-100 text-amber-800',
	error: 'bg-red-100 text-red-800'
}

export const SYSTEM_WARNING_TYPE_LABEL: Record<SystemWarningType, string> = {
	info: 'Информация',
	warning: 'Предупреждение',
	error: 'Ошибка'
}
