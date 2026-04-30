import { Layouts, LayoutToFileMap, type LayoutsEnum } from '@/layouts/layouts.types'
import type { RouteLocationNormalized } from 'vue-router'

export async function loadLayoutMiddleware(route: RouteLocationNormalized): Promise<void> {
	const { layout }: { layout?: LayoutsEnum } = route.meta
	const normalizedLayoutName = layout || Layouts.default

	const fileName = LayoutToFileMap[normalizedLayoutName]
	const fileNameWithoutExtension = fileName.split('.vue')[0]

	const component = await import(`../../layouts/${fileNameWithoutExtension}.vue`)
	route.meta.layoutComponent = component.default
}
