export type ShippingMethodRestriction = {
	country_id: number
	is_restricted: boolean
}

export type ShippingMethodRestrictionsPayload = {
	restrictions: ShippingMethodRestriction[]
}

export type ShippingMethodRestrictionRow = ShippingMethodRestriction & {
	country_name: string
	two_letter_iso_code: string
}
