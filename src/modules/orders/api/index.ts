import { orderItemsApi } from './order-items'
import { ordersApi } from './orders'

export const api = {
	...ordersApi,
	...orderItemsApi
}
