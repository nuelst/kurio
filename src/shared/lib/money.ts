import Decimal from 'decimal.js'


export type EthAmount = string

export function add(a: EthAmount, b: EthAmount): EthAmount {
  return new Decimal(a).plus(b).toString()
}

export function subtract(a: EthAmount, b: EthAmount): EthAmount {
  return new Decimal(a).minus(b).toString()
}

export function multiply(a: EthAmount, quantity: number): EthAmount {
  return new Decimal(a).times(quantity).toString()
}

export function sum(amounts: EthAmount[]): EthAmount {
  return amounts.reduce((total, amount) => add(total, amount), '0')
}

export function isGreaterThan(a: EthAmount, b: EthAmount): boolean {
  return new Decimal(a).greaterThan(b)
}

export function formatEth(amount: EthAmount, fractionDigits = 4): string {
  return `${new Decimal(amount).toFixed(fractionDigits)} ETH`
}
