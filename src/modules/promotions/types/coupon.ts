export type Coupon = {
	id: number | null
	code: string
	discount_type_id: number | null
	is_percentage: boolean
	amount: number
	min_order_amount: number
	usage_limit: number
	start_date: string
	end_date: string
	user_ids: number[]
	is_active: boolean
	discount_type?: { id: number; name: string } | null
	users?: Array<{ id: number; name?: string; email?: string }>
}

export type CouponPayload = Omit<Coupon, 'id' | 'discount_type' | 'users'>
