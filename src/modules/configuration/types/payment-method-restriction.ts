export type PaymentMethodRestriction = {
	country_id: number
	is_restricted: boolean
}

export type PaymentMethodRestrictionsPayload = {
	restrictions: PaymentMethodRestriction[]
}

export type PaymentMethodRestrictionRow = PaymentMethodRestriction & {
	country_name: string
	two_letter_iso_code: string
}
