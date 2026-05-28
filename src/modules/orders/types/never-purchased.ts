export interface NeverPurchasedProductImage {
	path: string
	url: string
}

export interface NeverPurchasedProduct {
	id: number
	name: string
	images: NeverPurchasedProductImage[]
}
