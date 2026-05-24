import { featuredCategoriesApi } from './featured_categories.ts'
import { mainCategoriesApi } from './main_categories'
import { subCategoriesApi } from './sub_categories'

export const api = {
	...mainCategoriesApi,
	...featuredCategoriesApi,
	...subCategoriesApi
}
