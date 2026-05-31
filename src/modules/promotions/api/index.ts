import { discountsApi } from './discounts'
import { newsletterSubscribersApi } from './newsletter-subscribers'

export const api = {
	...newsletterSubscribersApi,
	...discountsApi
} as const
