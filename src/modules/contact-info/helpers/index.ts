import type { ContactInfo } from '@/modules/contact-info/types/contact-info'

export const CONTACT_INFO_TABLE_COLUMNS: Array<{ key: keyof ContactInfo | 'actions'; label: string }> = [
	{ key: 'phone_number', label: 'Телефон' },
	{ key: 'email', label: 'Email' },
	{ key: 'address', label: 'Адрес' },
	{ key: 'slogan', label: 'Слоган' },
	{ key: 'social_links', label: 'Ссылки' },
	{ key: 'actions', label: 'Действия' }
]
