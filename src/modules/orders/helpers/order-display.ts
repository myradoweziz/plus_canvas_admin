const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
})

export const formatOrderDate = (value: string) => {
	if (!value) return '—'
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

import {
	formatDeliveryStatusLabel,
	formatOrderStatusLabel,
	formatPaymentStatusLabel
} from './order-statuses'

export const formatStatusLabel = (value: string) => {
	if (!value) return '—'
	return value.replace(/_/g, ' ')
}

export { formatDeliveryStatusLabel, formatOrderStatusLabel, formatPaymentStatusLabel }

export const statusBadgeClass = (value: string) => {
	const normalized = value.toLowerCase()

	if (['completed', 'paid', 'delivered', 'success', 'active'].includes(normalized)) {
		return 'bg-green-100 text-green-700'
	}

	if (['pending', 'processing', 'in_progress', 'awaiting'].some((item) => normalized.includes(item))) {
		return 'bg-amber-100 text-amber-800'
	}

	if (['cancelled', 'canceled', 'failed', 'refunded', 'rejected'].some((item) => normalized.includes(item))) {
		return 'bg-red-100 text-red-700'
	}

	return 'bg-gray-100 text-gray-700'
}

export const formatMoney = (value: string) => {
	if (!value) return '—'
	const amount = Number(value)
	return Number.isNaN(amount) ? value : amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })
}
