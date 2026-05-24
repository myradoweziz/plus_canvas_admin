import { orderItemsApi } from './order-items'
import { orderNotesApi } from './order-notes'
import { ordersApi } from './orders'

export const api = {
	...ordersApi,
	...orderItemsApi,
	...orderNotesApi
}
