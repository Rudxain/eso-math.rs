import { isInfNAN } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { trunc, floor } from './rounding'
import { sizeOf } from '../mod/bitwise'
import { MANTISSA_SIZE } from '../mod/const'

const IntN = BigInt, lb = Math.log2

/**
Hyper-operations
@template {numeric} T
@param {T} n degree
@param {T} b base
@param {T} e exponent
@return {numeric}
*/
export const HyperOP = (n, b, e) => {
	n = trunc(n)
	if (n < 0 || isInfNAN(n)) return NaN
	const n1 = autoN(1, e)
	//`switch` is overrated
	//@ts-ignore
	if (n < 4) return [e + n1, b + e, b * e, b ** e][n]
	if (e < 0 || e != e) return NaN
	if ((e > 2 ** 32 && b > 1) || (b > 2 ** MANTISSA_SIZE && e > 2))
		return Infinity
	if (e == 0) return n1
	let x = b
	n--
	while (--e > 0) x = /**@type {T}*/(HyperOP(n, b, x))
	return x
}

/**
The modern Ackermann-Péter fn
@param {bigint} m
@param {bigint} n
*/
export const Ackermann = (m, n) => /**@type {bigint}*/(HyperOP(m, 2n, n + 3n)) - 3n

/**
https://en.wikipedia.org/wiki/Ackermann_function#Inverse
@template {numeric} T
@param {T} m
@param {T} n
*/
export const Ackermann_inv = (m, n) => {
	let x = 0n, i = 1n
	const lbn = typeof n == 'bigint' ? sizeOf(n, 1n, 0n) : lb(n)
	while (x < lbn) x = Ackermann(i++, IntN(floor(m / n)))
	return x
}

/**
https://en.wikipedia.org/wiki/Graham%27s_number
@param {bigint} n
@return {numeric}
*/
export const Graham = n => {
	n = IntN(n)
	if (n < 0n) return NaN
	let x = 4n
	while (n--) x = /**@type {bigint}*/(HyperOP(x + 2n, 3n, 3n))
	return x
}