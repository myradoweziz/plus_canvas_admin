import { discountLimitationsApi } from './discount-limitations'
import { discountTypesApi } from './discount-types'
import { storesApi } from './stores'
import { emailAccountsApi } from './email-accounts'
import { shippingMethodsApi } from './shipping-methods'
import { countriesApi } from './countries'
import { countryStatesApi } from './country-states'
import { shippingMethodRestrictionsApi } from './shipping-method-restrictions'
import { shippingProvidersApi } from './shipping-providers'
import { deliveryDatesApi } from './delivery-dates'
import { paymentMethodsApi } from './payment-methods'
import { paymentMethodRestrictionsApi } from './payment-method-restrictions'

export const api = {
	...discountLimitationsApi,
	...discountTypesApi,
	...storesApi,
	...emailAccountsApi,
	...shippingMethodsApi,
	...countriesApi,
	...countryStatesApi,
	...shippingMethodRestrictionsApi,
	...shippingProvidersApi,
	...deliveryDatesApi,
	...paymentMethodsApi,
	...paymentMethodRestrictionsApi
}
