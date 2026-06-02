export * from './stores'
export * from './email-accounts'
export * from './shipping-methods'
export * from './countries'
export * from './country-states'
export * from './country-form'
export * from './shipping-method-restrictions'
export * from './shipping-providers'

export const NAME_SLUG_TABLE_COLUMNS = [
	{ key: 'name', label: 'Название' },
	{ key: 'slug', label: 'Slug' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right' }
]
