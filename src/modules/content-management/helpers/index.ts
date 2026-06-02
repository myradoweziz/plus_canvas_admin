export * from './message-templates'

export const TOPICS_TABLE_COLUMNS = [
	{ key: 'system_name', label: 'Системное имя' },
	{ key: 'include_in_sitemap', label: 'Sitemap', headerClass: 'text-right', cellClass: 'text-right' },
	{ key: 'include_in_top_menu', label: 'Top menu', headerClass: 'text-right', cellClass: 'text-right' },
	{ key: 'actions', label: 'Действия', headerClass: 'text-right', cellClass: 'text-right' }
]
