import { permissionsApi } from './permissions'
import { rolesApi } from './roles'
import { usersApi } from './users'

export const api = {
	...permissionsApi,
	...usersApi,
	...rolesApi
} as const
