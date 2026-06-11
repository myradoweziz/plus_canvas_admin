import type { Directive, DirectiveBinding } from 'vue'
import { watch, type WatchStopHandle } from 'vue'

import { canAccessPermission } from '@/shared/auth/user-access'
import { useAuth } from '@/stores/auth'

type PermissionBindingValue = string | string[] | undefined

const PERMISSION_STOP_KEY = '__permissionStop__'

const hasAccess = (value: PermissionBindingValue, any: boolean) => {
	const auth = useAuth()

	if (!auth.profileLoaded) return true

	if (any) {
		const permissions = Array.isArray(value) ? value : []
		if (!permissions.length) return true

		return permissions.some((permission) => canAccessPermission(permission, auth.permissions, auth.roles))
	}

	return canAccessPermission(value, auth.permissions, auth.roles)
}

const applyPermission = (el: HTMLElement, binding: DirectiveBinding<PermissionBindingValue>) => {
	el.style.display = hasAccess(binding.value, Boolean(binding.modifiers.any)) ? '' : 'none'
}

export const vPermission: Directive<HTMLElement, PermissionBindingValue> = {
	mounted(el, binding) {
		applyPermission(el, binding)

		const auth = useAuth()
		const stop = watch(
			() => [auth.permissions, auth.roles, auth.profileLoaded, binding.value, binding.modifiers.any] as const,
			() => applyPermission(el, binding)
		)

		;(el as HTMLElement & { [PERMISSION_STOP_KEY]?: WatchStopHandle })[PERMISSION_STOP_KEY] = stop
	},
	updated(el, binding) {
		applyPermission(el, binding)
	},
	unmounted(el) {
		;(el as HTMLElement & { [PERMISSION_STOP_KEY]?: WatchStopHandle })[PERMISSION_STOP_KEY]?.()
	}
}
