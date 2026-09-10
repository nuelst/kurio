import {
  CART_NETWORK_FEE_ETH,
  type CartCoupon,
  type CartLine,
  type CartQuote,
} from '@/features/cart/model/cart'
import { add, multiply, subtract, sum } from '@/shared/lib/money'

export function recomputeQuote(items: CartLine[], coupon: CartCoupon | null): CartQuote {
  const subtotalEth = sum(items.map((item) => item.lineTotalEth))
  const discountEth = coupon ? multiply(subtotalEth, coupon.discountPercent / 100) : '0'
  const networkFeeEth = items.some((item) => !item.isSoldOut) ? CART_NETWORK_FEE_ETH : '0'
  const totalEth = add(subtract(subtotalEth, discountEth), networkFeeEth)

  return { items, coupon, subtotalEth, discountEth, networkFeeEth, totalEth }
}

export function applyNftUpdateToLine(
  line: CartLine,
  priceEth: string,
  available: number,
): CartLine {
  const isSoldOut = available <= 0
  const quantity = isSoldOut ? line.quantity : Math.min(line.quantity, available)

  return {
    ...line,
    priceEth,
    available,
    isSoldOut,
    quantity,
    lineTotalEth: isSoldOut ? '0' : multiply(priceEth, quantity),
  }
}
