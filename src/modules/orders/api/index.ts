import { bestsellersApi } from './bestsellers'
import { cartsApi } from './carts'
import { countryReportApi } from './country-report'
import { neverPurchasedApi } from './never-purchased'
import { orderItemsApi } from './order-items'
import { orderNotesApi } from './order-notes'
import { ordersApi } from './orders'
import { wishlistsApi } from './wishlists'

export const api = {
	...bestsellersApi,
	...cartsApi,
	...countryReportApi,
	...neverPurchasedApi,
	...ordersApi,
	...orderItemsApi,
	...orderNotesApi,
	...wishlistsApi
}
