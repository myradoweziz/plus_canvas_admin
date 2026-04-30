import { registerModules } from './register-modules'

import brands from '@/modules/brands'
import categories from '@/modules/categories'
import discounts from '@/modules/discounts'
import home from '@/modules/home'
import login from '@/modules/login'

registerModules({
	home: home,
	login: login,
	categories: categories,
	discounts: discounts,
	brands: brands
})
