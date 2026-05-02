import { featuredCategoriesApi } from './featured_categories.ts'
import { mainCategoriesApi } from './main_categories'
import { subCategoriesApi } from './sub_categories'

export const categoriesApi = {
	...mainCategoriesApi,
	...featuredCategoriesApi,
	...subCategoriesApi
}
