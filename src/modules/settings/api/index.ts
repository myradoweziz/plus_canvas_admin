import { permissionsApi } from './permissions'
import { rolesApi } from './roles'
import { userActivityLogsApi } from './user-activity-logs'
import { userAddressesApi } from './user-addresses'
import { userShoppingCartApi } from './user-shopping-cart'
import { userWishlistApi } from './user-wishlist'
import { usersApi } from './users'

export const api = {
	...permissionsApi,
	...usersApi,
	...rolesApi,
	...userAddressesApi,
	...userShoppingCartApi,
	...userWishlistApi,
	...userActivityLogsApi
} as const
