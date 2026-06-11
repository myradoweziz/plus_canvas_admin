export * from './order-detail'
export * from './order-display'
export * from './order-statuses'

export const ORDERS_TABLE_COLUMNS = [
	{ key: 'order_status', label: 'Статус заказа' },
	{ key: 'payment_status', label: 'Статус оплаты' },
	{ key: 'delivery_status', label: 'Статус доставки' },
	{ key: 'customer', label: 'Покупатель' },
	{ key: 'created_at', label: 'Дата' },
	{ key: 'total', label: 'Сумма' },
	{ key: 'actions', label: 'Действия' }
]

export const CARTS_TABLE_COLUMNS = [
	{ key: 'user', label: 'Пользователь' },
	{ key: 'canvas', label: 'Товары' },
	{ key: 'price', label: 'Цена' },
	{ key: 'items_count', label: 'Количество товаров' },
	{ key: 'updated_at', label: 'Дата обновления' }
]

export const WISHLISTS_TABLE_COLUMNS = [
	{ key: 'user', label: 'Пользователь' },
	{ key: 'canvas', label: 'Товары' },
	{ key: 'price', label: 'Цена' },
	{ key: 'items_count', label: 'Количество товаров' },
	{ key: 'updated_at', label: 'Дата обновления' }
]

export const BESTSELLERS_TABLE_COLUMNS = [
	{ key: 'canvas_product_name', label: 'Товар' },
	{ key: 'sales_count', label: 'Продаж' },
	{ key: 'total_amount_without_tax', label: 'Сумма (без налога)' }
]

export const NEVER_PURCHASED_TABLE_COLUMNS = [
	{ key: 'image', label: 'Фото' },
	{ key: 'name', label: 'Название товара' }
]

export const COUNTRY_REPORT_TABLE_COLUMNS = [
	{ key: 'country', label: 'Страна' },
	{ key: 'order_count', label: 'Заказов' },
	{ key: 'total_amount', label: 'Сумма' },
	{ key: 'map', label: 'Карта' }
]
