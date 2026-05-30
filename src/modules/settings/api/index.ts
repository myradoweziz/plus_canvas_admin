import { permissionsApi } from './permissions'
import { rolesApi } from './roles'
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
	...userWishlistApi
} as const
