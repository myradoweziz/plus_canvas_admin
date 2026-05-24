import { collageLayoutsApi } from './collage-layouts'
import { productCommentsApi } from './product-comments'
import { productOrdersApi } from './product-orders'
import { productsApi } from './products'

export const api = {
	...collageLayoutsApi,
	...productsApi,
	...productCommentsApi,
	...productOrdersApi
}
