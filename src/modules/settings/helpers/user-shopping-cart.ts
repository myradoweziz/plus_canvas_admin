import type { UserShoppingCartItemOptions } from '../types/user-shopping-cart'

export const USER_SHOPPING_CART_TABLE_COLUMNS = [
	{ key: 'product', label: 'Товар' },
	{ key: 'quantity', label: 'Кол-во' },
	{ key: 'options', label: 'Опции' },
	{ key: 'price', label: 'Цена' },
	{ key: 'updated_at', label: 'Обновлено' }
]

export const formatCartItemOptions = (options: UserShoppingCartItemOptions | null) => {
	if (!options) return '—'
	const parts = Object.entries(options)
		.filter(([, value]) => value)
		.map(([key, value]) => `${key}: ${value}`)
	return parts.length ? parts.join(', ') : '—'
}
