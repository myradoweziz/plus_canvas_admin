export const PRODUCTS_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'sku', label: 'SKU' },
	{ key: 'price', label: 'Цена' },
	{ key: 'is_published', label: 'Опубликован' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]

export const PRODUCT_ORDERS_TABLE_COLUMNS = [
	{ key: 'id', label: 'ID' },
	{ key: 'email', label: 'Email' },
	{ key: 'order_status', label: 'Статус заказа' },
	{ key: 'payment_status', label: 'Оплата' },
	{ key: 'delivery_status', label: 'Доставка' },
	{ key: 'created_at', label: 'Создан' }
]
