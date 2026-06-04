export * from './form-errors'
export * from './product-form'
export * from './product-form-validation'

import type { CanvasProduct } from '../types'

export const getProductListImageUrl = (product: CanvasProduct) => {
	const first = product.images?.[0]
	if (!first || first instanceof File) return null
	return typeof first === 'string' && first.trim() ? first.trim() : null
}

export const PRODUCTS_TABLE_COLUMNS = [
	{ key: 'images', label: 'Фото' },
	{ key: 'name', label: 'Название' },
	{ key: 'sku', label: 'SKU' },
	{ key: 'price', label: 'Цена' },
	{ key: 'is_published', label: 'Опубликован' },
	{ key: 'actions', label: 'Действия' }
]

export const PRODUCT_ORDERS_TABLE_COLUMNS = [
	{ key: 'id', label: 'ID' },
	{ key: 'email', label: 'Email' },
	{ key: 'order_status', label: 'Статус заказа' },
	{ key: 'payment_status', label: 'Оплата' },
	{ key: 'delivery_status', label: 'Доставка' },
	{ key: 'created_at', label: 'Создан' }
]
