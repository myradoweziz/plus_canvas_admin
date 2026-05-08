import router from '.'

const ADMIN_PREFIX = '/admin-panel'

function prefixPath(path: string): string {
	if (!path.startsWith('/')) return path
	if (path.startsWith(ADMIN_PREFIX)) return path
	if (path === '/') return `${ADMIN_PREFIX}/`
	return `${ADMIN_PREFIX}${path}`
}

function prefixRouteRecord(record: any): any {
	const next = { ...record, path: typeof record?.path === 'string' ? prefixPath(record.path) : record?.path }
	if (Array.isArray(record?.children) && record.children.length) {
		next.children = record.children.map(prefixRouteRecord)
	}
	return next
}

const registerModule = (module: any) => {
	if (module.router) {
		module.router(router)
	}
}

export const registerModules = (modules: any) => {
	const originalAddRoute = router.addRoute.bind(router)
	;(router as any).addRoute = (...args: any[]) => {
		// addRoute(record) OR addRoute(parentName, record)
		if (args.length === 1) {
			return originalAddRoute(prefixRouteRecord(args[0]))
		}
		if (args.length >= 2) {
			// Vue Router addRoute supports (parentName, route)
			return originalAddRoute(args[0], prefixRouteRecord(args[1]))
		}
		return originalAddRoute(args[0])
	}

	Object.keys(modules).forEach((moduleKey) => {
		const module = modules[moduleKey]
		registerModule(module)
	})
	;(router as any).addRoute = originalAddRoute
}
