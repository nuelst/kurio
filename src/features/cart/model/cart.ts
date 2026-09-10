export const CART_NETWORK_FEE_ETH = '0.016'

export interface CartLine {
  nftId: string
  editionId: string
  title: string
  imageUrl: string
  tokenNumber: string
  priceEth: string
  available: number
  quantity: number
  isSoldOut: boolean
  lineTotalEth: string
}

export interface CartCoupon {
  code: string
  discountPercent: number
}

export interface CartQuote {
  items: CartLine[]
  coupon: CartCoupon | null
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
}
