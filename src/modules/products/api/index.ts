import { collageLayoutsApi } from './collage-layouts'
import { productCommentsApi } from './product-comments'
import { productsApi } from './products'

export const api = {
	...collageLayoutsApi,
	...productsApi,
	...productCommentsApi
}
