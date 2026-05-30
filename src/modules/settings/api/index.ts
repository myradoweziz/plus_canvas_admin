import { customerReportApi } from './customer-report'
import { permissionsApi } from './permissions'
import { registeredCustomersReportApi } from './registered-customers-report'
import { rolesApi } from './roles'
import { userActivityLogsApi } from './user-activity-logs'
import { onlineCustomersApi } from './online-customers'
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
	...userActivityLogsApi,
	...onlineCustomersApi,
	...customerReportApi,
	...registeredCustomersReportApi
} as const
