export type StatusOption = {
	label: string
	value: string
}

export const ORDER_STATUS_OPTIONS: StatusOption[] = [
	{ value: 'pending', label: 'Ожидание (Beklemede)' },
	{ value: 'processing', label: 'В обработке (İşlemde)' },
	{ value: 'completed', label: 'Завершён (Tamamlandı)' },
	{ value: 'cancelled', label: 'Отменён (İptal Edildi)' }
]

export const DELIVERY_STATUS_OPTIONS: StatusOption[] = [
	{ value: 'shipping_not_required', label: 'Доставка не требуется' },
	{ value: 'not_shipped_yet', label: 'Ещё не отправлен (Henüz kargolanmadı)' },
	{ value: 'partially_shipped', label: 'Частично отправлен (Kısmi kargolama yapıldı)' },
	{ value: 'shipped', label: 'Отправлен (Kargolandı)' },
	{ value: 'delivered', label: 'Доставка завершена (Teslimat tamamlandı)' }
]

export const PAYMENT_STATUS_OPTIONS: StatusOption[] = [
	{ value: 'payment_pending', label: 'Ожидается оплата (Ödeme bekleniyor)' },
	{ value: 'payment_approved', label: 'Оплата подтверждена (Ödeme onaylandı)' },
	{ value: 'paid', label: 'Оплачен (Ödendi)' },
	{ value: 'partial_refund_applied', label: 'Частичный возврат (Kısmi İade yapıldı)' },
	{ value: 'fee_refunded', label: 'Возврат комиссии (Ücret İade edildi)' },
	{ value: 'voided', label: 'Аннулирован (Voided)' }
]

const toLabelMap = (options: StatusOption[]) =>
	Object.fromEntries(options.map((option) => [option.value, option.label])) as Record<string, string>

export const ORDER_STATUS_LABELS = toLabelMap(ORDER_STATUS_OPTIONS)
export const DELIVERY_STATUS_LABELS = toLabelMap(DELIVERY_STATUS_OPTIONS)
export const PAYMENT_STATUS_LABELS = toLabelMap(PAYMENT_STATUS_OPTIONS)

export const withAllStatusOption = (options: StatusOption[]) => [
	{ label: 'Все', value: null as string | null },
	...options
]

export const ORDER_STATUS_FILTER_OPTIONS = withAllStatusOption(ORDER_STATUS_OPTIONS)
export const DELIVERY_STATUS_FILTER_OPTIONS = withAllStatusOption(DELIVERY_STATUS_OPTIONS)
export const PAYMENT_STATUS_FILTER_OPTIONS = withAllStatusOption(PAYMENT_STATUS_OPTIONS)

export const formatOrderStatusLabel = (value: string) => ORDER_STATUS_LABELS[value] ?? formatUnknownStatus(value)

export const formatDeliveryStatusLabel = (value: string) => DELIVERY_STATUS_LABELS[value] ?? formatUnknownStatus(value)

export const formatPaymentStatusLabel = (value: string) => PAYMENT_STATUS_LABELS[value] ?? formatUnknownStatus(value)

const formatUnknownStatus = (value: string) => {
	if (!value) return '—'
	return value.replace(/_/g, ' ')
}
