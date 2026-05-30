export * from './roles'
export * from './users'
export * from './user-form'
export * from './user-orders'
export * from './user-addresses'
export * from './user-shopping-cart'
export * from './user-wishlist'

export const PERMISSIONS_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right', cellClass: 'text-right' }
]
