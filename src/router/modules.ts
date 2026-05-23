import { registerModules } from './register-modules'

import banners from '@/modules/banners'
import productTags from '@/modules/product-tags'
import canvasFormats from '@/modules/canvas-formats'
import canvasEffects from '@/modules/canvas-effects'
import canvasFrames from '@/modules/canvas-frames'
import canvasSizes from '@/modules/canvas-sizes'
import categories from '@/modules/categories'
import colors from '@/modules/colors'
import contactInfo from '@/modules/contact-info'
import stocks from '@/modules/stocks'
import faqs from '@/modules/faqs'
import home from '@/modules/home'
import login from '@/modules/login'
import products from '@/modules/products'
import profile from '@/modules/profile'
import settings from '@/modules/settings'

registerModules({
	home: home,
	login: login,
	categories: categories,
	stocks: stocks,
	productTags: productTags,
	colors: colors,
	contactInfo: contactInfo,
	canvasSizes: canvasSizes,
	canvasFormats: canvasFormats,
	canvasFrames: canvasFrames,
	canvasEffects: canvasEffects,
	banners: banners,
	products: products,
	faqs: faqs,
	profile: profile,
	settings: settings
})
