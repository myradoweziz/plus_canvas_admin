import type { OrderCanvasProduct, OrderItem } from '../types'

export type OrderDetailTab = 'orderInfo' | 'billing' | 'shipping' | 'products' | 'notes'

export const ORDER_DETAIL_TABS: Array<{ id: OrderDetailTab; label: string }> = [
	{ id: 'orderInfo', label: 'Информация' },
	{ id: 'billing', label: 'Billing Info' },
	{ id: 'shipping', label: 'Shipping Address' },
	{ id: 'products', label: 'Products' },
	{ id: 'notes', label: 'Order Notes' }
] as const

export const displayValue = (value: unknown) => {
	if (value === null || value === undefined || value === '') return '—'
	return String(value)
}

export const ORDER_ITEMS_TABLE_COLUMNS = [
	{ key: 'product', label: 'Продукт' },
	{ key: 'options', label: 'Опции' },
	{ key: 'quantity', label: 'Кол-во' },
	{ key: 'price', label: 'Цена' },
	{ key: 'discount_amount', label: 'Скидка' },
	{ key: 'total', label: 'Сумма' },
	{ key: 'actions', label: 'Действия' }
]

export const getOrderItemProduct = (item: OrderItem): OrderCanvasProduct | undefined =>
	item.canvas_product ?? item.canvas_products?.[0]

export const formatOrderItemOptions = (options: Record<string, unknown> | null | undefined) => {
	if (!options || typeof options !== 'object') return '—'
	return Object.entries(options)
		.map(([key, value]) => `${key}: ${value}`)
		.join(', ')
}
