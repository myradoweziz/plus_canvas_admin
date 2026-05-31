import { discountLimitationsApi } from './discount-limitations'
import { discountTypesApi } from './discount-types'

export const api = {
	...discountLimitationsApi,
	...discountTypesApi
}
