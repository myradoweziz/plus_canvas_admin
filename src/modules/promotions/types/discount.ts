export type Discount = {
	id: number | null
	name: string
	discount_type_id: number | null
	is_percentage: boolean
	amount: number
	start_date: string
	end_date: string
	requires_promo_code: boolean
	promo_code: string
	discount_limitation_id: number | null
	usage_limit: number
	requirement_type: string
	min_order_amount: number
	target_categories: number[]
	target_sub_categories: number[]
	discount_type?: { id: number; name: string } | null
	discount_limitation?: { id: number; name: string } | null
}

export type DiscountPayload = Omit<Discount, 'id' | 'discount_type' | 'discount_limitation'>
