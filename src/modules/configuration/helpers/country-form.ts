export type CountryFormTab = 'info' | 'states'

export const COUNTRY_FORM_TABS: Array<{ id: CountryFormTab; label: string }> = [
	{ id: 'info', label: 'Основное' },
	{ id: 'states', label: 'Регионы' }
] as const
