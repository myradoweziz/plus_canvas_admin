import { registerModules } from './register-modules'

import banners from '@/modules/banners'
import brands from '@/modules/brands'
import canvasFormats from '@/modules/canvas-formats'
import canvasSizes from '@/modules/canvas-sizes'
import categories from '@/modules/categories'
import colors from '@/modules/colors'
import discounts from '@/modules/discounts'
import home from '@/modules/home'
import login from '@/modules/login'

registerModules({
	home: home,
	login: login,
	categories: categories,
	discounts: discounts,
	brands: brands,
	colors: colors,
	canvasSizes: canvasSizes,
	canvasFormats: canvasFormats,
	banners: banners
})
