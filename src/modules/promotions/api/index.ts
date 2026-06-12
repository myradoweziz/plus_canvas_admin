import { couponsApi } from './coupons'
import { discountsApi } from './discounts'
import { newsletterSubscribersApi } from './newsletter-subscribers'

export const api = {
	...newsletterSubscribersApi,
	...discountsApi,
	...couponsApi
} as const
