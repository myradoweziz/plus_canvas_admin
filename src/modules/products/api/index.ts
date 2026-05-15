import { collageLayoutsApi } from './collage-layouts'
import { productsApi } from './products'

export const api = {
	...collageLayoutsApi,
	...productsApi
}
