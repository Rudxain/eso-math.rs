import { isInf, isNAN } from './value check'
import { abs, sign } from './std'
import { sizeOf } from './bitwise'
import { autoN } from './sanitize'

const RangeErr = RangeError

/**
ith (degree i) root of x
@template {numeric} T
@param {T} x
@param {T} [i]
*/
export const root = (x, i) => {
	if (i === undefined) i = autoN(2, x)

	if (i == 1) return x

	if (typeof x == 'bigint') {
		if (i == -1n) return 1n / x

		if (!i) {
			if (x > 1n) throw new RangeErr('return value is NaN')
			return 0n
		}

		/**@type {bigint}*/
		const s = sign(x)
		x = abs(x)

		if (s === -1n && !(/**@type {bigint}*/(i) & 1n))
			throw new RangeErr('return value is a Complex number')
		if (i < 0n) {
			if (!x) throw new RangeErr('return value is Infinity')
			return x === 1n ? s : 0n
		}

		if (x === 0n) return x

		if (x === 1n) return s === -1n ? s ** /**@type {bigint}*/(i) : x

		const j = /**@type {bigint}*/(i) - 1n

		// identity: a ^ (1 / k) = b ^ (log_b(a) / k)
		const lbx = sizeOf(x, 1n, 0n)

		// using the MSBs instead of generating a power of 2 is a better approximation
		let
			x0 = /**@type {bigint}*/(x) >> (lbx - lbx / j),
			x1 = (x0 * j + /**@type {bigint}*/(x) / x0 ** j) / /**@type {bigint}*/(i)

		// Heron/Newton/Babylonian Method, thanks to https://stackoverflow.com/a/30869049
		while (x1 < x0) {
			x0 = x1
			x1 = (x1 * j + /**@type {bigint}*/(x) / x1 ** j) / /**@type {bigint}*/(i)
		}
		return x0 * s
	}
	else // I hate the complexity of this entire fn
	{
		if (isInf(x ** (1 / i))) return x ** (1 / i)
		if (isNAN(x) || isNAN(i)) return NaN
		if (i === -1) return 1 / x
		if (!i) return 0

		const s = sign(/**@type {number}*/(x))
		x = abs(x)

		if (s === -1 && !(i % 2)) return NaN
		if (i < 0n) return x ? (x === 1 ? s : 0) : Infinity
		if (!x) return x
		if (x === 1) return s === -1 ? s ** i : x
		const j = i - 1
		let x1 = x ** (1 / i)
		if (x1 ** i != x) x1 = (x1 * j + x / x1 ** j) / i
		return x1 * s
	}
}
//I defined this dedicated (instead of just `root(x, 2)`) `sqrt` because of performance and bug concerns
/**
calculate square root
@template {numeric} T
@param {T} x
*/
export const sqrt = x => {
	if (typeof x != 'bigint')
		return /**@type {T}*/(x && x ** 0.5) //preserve `-0`

	if (x < 2n) {
		if (x >= 0n) return x
		throw new RangeErr('return value is Complex number')
	}
	let
		x0 = x >> (sizeOf(x, 1n, 0n) >> 1n),
		x1 = (x / x0 + x0) >> 1n
	while (x1 < x0) {
		x0 = x1
		x1 = (x / x1 + x1) >> 1n
	}
	return /**@type {T}*/(x0)
}

/**
cubic root
@template {numeric} T
@param {T} x
*/
export const cbrt = x => root(x, autoN(3, x))