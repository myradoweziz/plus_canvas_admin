import { storeToRefs } from 'pinia'

import { useAuth } from '@/stores/auth'
import { canAccessPermission } from '@/shared/auth/user-access'

export const usePermissions = () => {
	const auth = useAuth()
	const { permissions, roles, profileLoaded } = storeToRefs(auth)

	const can = (permission?: string | string[]) => {
		if (!profileLoaded.value) return true

		return canAccessPermission(permission, permissions.value, roles.value)
	}

	const canAny = (permissionList: Array<string | string[] | undefined>) => permissionList.some((permission) => can(permission))

	return {
		permissions,
		roles,
		profileLoaded,
		can,
		canAny
	}
}
