import { registerModules } from './register-modules'

import banners from '@/modules/banners'
import canvasEffects from '@/modules/canvas-effects'
import canvasFormats from '@/modules/canvas-formats'
import canvasFrames from '@/modules/canvas-frames'
import canvasSizes from '@/modules/canvas-sizes'
import categories from '@/modules/categories'
import colors from '@/modules/colors'
import contentManagement from '@/modules/content-management'
import configuration from '@/modules/configuration'
import contactInfo from '@/modules/contact-info'
import faqs from '@/modules/faqs'
import home from '@/modules/home'
import login from '@/modules/login'
import orders from '@/modules/orders'
import productTags from '@/modules/product-tags'
import products from '@/modules/products'
import profile from '@/modules/profile'
import promotions from '@/modules/promotions'
import settings from '@/modules/settings'
import stocks from '@/modules/stocks'

registerModules({
	home: home,
	login: login,
	categories: categories,
	stocks: stocks,
	productTags: productTags,
	colors: colors,
	contentManagement: contentManagement,
	contactInfo: contactInfo,
	canvasSizes: canvasSizes,
	canvasFormats: canvasFormats,
	canvasFrames: canvasFrames,
	canvasEffects: canvasEffects,
	banners: banners,
	products: products,
	orders: orders,
	faqs: faqs,
	profile: profile,
	promotions: promotions,
	configuration: configuration,
	settings: settings
})
