import { ref } from 'vue'

import { api as bannersApi } from '@/modules/banners/api'
import type { Banner } from '@/modules/banners/types/banner'
import { api as canvasEffectsApi } from '@/modules/canvas-effects/api'
import type { CanvasEffect } from '@/modules/canvas-effects/types/canvas-effect'
import { api as canvasFormatsApi } from '@/modules/canvas-formats/api'
import type { CanvasFormat } from '@/modules/canvas-formats/types/canvas-format'
import { api as canvasFramesApi } from '@/modules/canvas-frames/api'
import type { CanvasFrame } from '@/modules/canvas-frames/types/canvas-frame'
import { canvasSizesApi } from '@/modules/canvas-sizes/api/canvas-sizes'
import type { CanvasSize } from '@/modules/canvas-sizes/types/canvas-size'
import { api as categoriesApi } from '@/modules/categories/api'
import type { MainCategory } from '@/modules/categories/types'
import { api as colorsApi } from '@/modules/colors/api'
import type { Color } from '@/modules/colors/types/color'
import { api as stocksApi } from '@/modules/stocks/api'
import type { Stock } from '@/modules/stocks/types/stock'

type FormDictionariesCache = {
	mainCategories: MainCategory[]
	banners: Banner[]
	stocks: Stock[]
	colors: Color[]
	canvasFormats: CanvasFormat[]
	canvasSizes: CanvasSize[]
	canvasFrames: CanvasFrame[]
	canvasEffects: CanvasEffect[]
}

let cachedDictionaries: FormDictionariesCache | null = null
let loadPromise: Promise<FormDictionariesCache> | null = null

const fetchFormDictionaries = async (): Promise<FormDictionariesCache> => {
	const [
		mainCategoriesResult,
		bannersResult,
		stocksResult,
		colorsResult,
		canvasFormatsResult,
		canvasSizesResult,
		canvasFramesResult,
		canvasEffectsResult
	] = await Promise.all([
		categoriesApi.listMainCategories({ limit: 100, offset: 0 }),
		bannersApi.listBanners(),
		stocksApi.listStocks({ limit: 100, offset: 0 }),
		colorsApi.listColors({ limit: 100, offset: 0 }),
		canvasFormatsApi.listCanvasFormats({ limit: 100, offset: 0 }),
		canvasSizesApi.listCanvasSizes({ limit: 100, offset: 0 }),
		canvasFramesApi.listCanvasFrames({ limit: 100, offset: 0 }),
		canvasEffectsApi.listCanvasEffects({ limit: 100, offset: 0 })
	])

	return {
		mainCategories: mainCategoriesResult.items || [],
		banners: bannersResult || [],
		stocks: stocksResult.items || [],
		colors: colorsResult.items || [],
		canvasFormats: canvasFormatsResult.items || [],
		canvasSizes: canvasSizesResult.items || [],
		canvasFrames: canvasFramesResult.items || [],
		canvasEffects: canvasEffectsResult.items || []
	}
}

export const useProductFormDictionaries = () => {
	const loading = ref(false)
	const mainCategories = ref<MainCategory[]>([])
	const banners = ref<Banner[]>([])
	const stocks = ref<Stock[]>([])
	const colors = ref<Color[]>([])
	const canvasFormats = ref<CanvasFormat[]>([])
	const canvasSizes = ref<CanvasSize[]>([])
	const canvasFrames = ref<CanvasFrame[]>([])
	const canvasEffects = ref<CanvasEffect[]>([])

	const applyCache = (cache: FormDictionariesCache) => {
		mainCategories.value = cache.mainCategories
		banners.value = cache.banners
		stocks.value = cache.stocks
		colors.value = cache.colors
		canvasFormats.value = cache.canvasFormats
		canvasSizes.value = cache.canvasSizes
		canvasFrames.value = cache.canvasFrames
		canvasEffects.value = cache.canvasEffects
	}

	const load = async (force = false) => {
		if (!force && cachedDictionaries) {
			applyCache(cachedDictionaries)
			return
		}

		if (!force && loadPromise) {
			loading.value = true
			try {
				const cache = await loadPromise
				applyCache(cache)
			} finally {
				loading.value = false
			}
			return
		}

		loading.value = true
		loadPromise = fetchFormDictionaries()

		try {
			cachedDictionaries = await loadPromise
			applyCache(cachedDictionaries)
		} finally {
			loading.value = false
			loadPromise = null
		}
	}

	const invalidateCache = () => {
		cachedDictionaries = null
		loadPromise = null
	}

	return {
		loading,
		mainCategories,
		banners,
		stocks,
		colors,
		canvasFormats,
		canvasSizes,
		canvasFrames,
		canvasEffects,
		load,
		invalidateCache
	}
}
