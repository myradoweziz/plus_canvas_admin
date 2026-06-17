
import { productCommentsApi } from './product-comments'
import { productOrdersApi } from './product-orders'
import { productsApi } from './products'

export const api = {

	...productsApi,
	...productCommentsApi,
	...productOrdersApi
}
