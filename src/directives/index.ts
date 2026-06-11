import type { App } from 'vue'

import { vPermission } from './permission'

export const registerDirectives = (app: App) => {
	app.directive('permission', vPermission)
}
