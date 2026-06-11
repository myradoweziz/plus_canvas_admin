export type UserFormTab =
	| 'main'
	| 'sendEmail'
	// | 'sendMessage'
	| 'orders'
	| 'addresses'
	| 'shoppingCart'
	| 'wishlist'
	| 'activityLogs'

export type UserFormTabItem = {
	id: UserFormTab
	label: string
}

export const GUEST_ROLE = 'guest'

export const isGuestUser = (roles?: string[] | null): boolean =>
	(roles ?? []).some((role) => role.toLowerCase() === GUEST_ROLE)

export const USER_FORM_TABS = {
	main: { id: 'main', label: 'Основное' } satisfies UserFormTabItem,
	sendEmail: { id: 'sendEmail', label: 'Send Email' } satisfies UserFormTabItem,
	// sendMessage: { id: 'sendMessage', label: 'Send Message' } satisfies UserFormTabItem,
	orders: { id: 'orders', label: 'Orders' } satisfies UserFormTabItem,
	addresses: { id: 'addresses', label: 'Addresses' } satisfies UserFormTabItem,
	shoppingCart: { id: 'shoppingCart', label: 'Shopping Cart' } satisfies UserFormTabItem,
	wishlist: { id: 'wishlist', label: 'Wishlist' } satisfies UserFormTabItem,
	activityLogs: { id: 'activityLogs', label: 'Activity Logs' } satisfies UserFormTabItem
} as const

export const getUserFormTabs = (showActionTabs: boolean, userRoles?: string[] | null): UserFormTabItem[] => {
	const tabs: UserFormTabItem[] = [USER_FORM_TABS.main]
	if (showActionTabs) {
		tabs.push(
			USER_FORM_TABS.orders,
			USER_FORM_TABS.addresses,
			USER_FORM_TABS.shoppingCart,
			USER_FORM_TABS.wishlist,
			...(isGuestUser(userRoles) ? [] : [USER_FORM_TABS.activityLogs]),
			USER_FORM_TABS.sendEmail
			// USER_FORM_TABS.sendMessage
		)
	}
	return tabs
}
