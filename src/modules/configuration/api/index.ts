import { discountLimitationsApi } from './discount-limitations'
import { discountTypesApi } from './discount-types'
import { storesApi } from './stores'
import { emailAccountsApi } from './email-accounts'
import { shippingMethodsApi } from './shipping-methods'
import { countriesApi } from './countries'
import { countryStatesApi } from './country-states'
import { shippingMethodRestrictionsApi } from './shipping-method-restrictions'
import { shippingProvidersApi } from './shipping-providers'

export const api = {
	...discountLimitationsApi,
	...discountTypesApi,
	...storesApi,
	...emailAccountsApi,
	...shippingMethodsApi,
	...countriesApi,
	...countryStatesApi,
	...shippingMethodRestrictionsApi,
	...shippingProvidersApi
}
